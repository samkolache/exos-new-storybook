import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal, viewChild } from '@angular/core';

/** One side of an element, used to measure a distance between two edges. */
export interface RedlineEdge {
  target: string;
  edge: 'left' | 'right';
  /** Measure from inside the border (where the padding starts), not the outer edge. */
  inner?: boolean;
}

/** What every measurement has: a plain-language name and what it means, for the key. */
interface MarkText {
  /** The label on the drawing when there is no key; `{v}` is the value, like "{v} tall". */
  label?: string;
  /** Short name in the key, like "Height". */
  name?: string;
  /** One plain sentence on what it is, like "How tall the chip is." */
  help?: string;
}

/**
 * One measurement to draw:
 * - size: an element's height (side left/right) or width (side top/bottom)
 * - distance: horizontal space between two edges, drawn above or below
 * - style: a value from the element's CSS: font-size or corner radius
 * - tap: the tap area around an element; `fallback` is shown in the key when there is none
 * - padding: the element's padding, shaded blue like a browser's box-model view, with one label
 *   for top and bottom (`label`) and one for left and right (`labelSides`)
 */
export type RedlineMark = MarkText &
  (
    | { kind: 'size'; target: string; side: 'left' | 'right' | 'top' | 'bottom' }
    | { kind: 'distance'; from: RedlineEdge; to: RedlineEdge; side: 'top' | 'bottom' }
    | { kind: 'style'; target: string; prop: 'font-size' | 'radius' | 'divider' | 'divider-bottom'; side: 'top' | 'bottom' }
    | { kind: 'tap'; target: string; side: 'top' | 'bottom'; fallback: string }
    /** Vertical space from the bottom of one element to the top of the next, like a label and its field. */
    | { kind: 'gap'; from: string; to: string; side: 'right' }
    | {
        kind: 'padding';
        target: string;
        labelSides?: string;
        /**
         * Name of the section, like "Header". Then the padding gets one label to the right of the
         * example that says all four sides ("Header: 20px top, 8px bottom · 24px left, 20px right"),
         * so several stacked sections can each be labelled.
         */
        aside?: string;
      }
  );

interface Drawn {
  n: number;
  lines: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean }[];
  /** Where the numbered marker and value sit. start: the label begins at x (side labels). */
  label?: { x: number; y: number; align?: 'start' };
  rect?: { x: number; y: number; w: number; h: number };
  /** A section's padding label beside the example: these get spread out so they don't overlap. */
  aside?: boolean;
  /** A shaded area (SVG path, even-odd), e.g. the padding ring. */
  area?: string;
  /** Label template for this entry when it isn't the mark's own `label`. */
  tpl?: string;
  value: string;
  name?: string;
  help?: string;
  text?: string;
}

const ROW = 26; // distance between rows of markers on one side
const FIRST = 16; // first row's distance from the example
const TICK = 4;
const LABEL_W = 56; // room one marker + value needs, to keep markers on a row apart

/**
 * Docs only: a live example with its measurements drawn on it. Each measurement gets a numbered
 * marker with its value, and a key underneath says in plain words what each one is.
 * Numbers are measured from the real element at its real size, so the Mobile / Web and size
 * switches show that device's real values.
 */
@Component({
  selector: 'app-redline',
  template: `
<div #stage class="exos-redline" [style.--exos-redline-room.px]="room()">
  <!-- A picture, not a control: inert (no clicks, hover or focus), so the numbers always match what is shown. -->
  <div #content class="exos-redline__content" inert [style.zoom]="zoom()">
    <ng-content />
  </div>
  <svg class="exos-redline__svg" aria-hidden="true">
    @for (m of drawn(); track $index) {
      @if (m.area) {
        <path [attr.d]="m.area" fill-rule="evenodd" class="exos-redline__padding" />
      }
      @if (m.rect; as r) {
        <rect [attr.x]="r.x" [attr.y]="r.y" [attr.width]="r.w" [attr.height]="r.h" rx="6" class="exos-redline__tap" />
      }
      @for (l of m.lines; track $index) {
        <line [attr.x1]="l.x1" [attr.y1]="l.y1" [attr.x2]="l.x2" [attr.y2]="l.y2" [class.exos-redline__ext]="l.dashed" />
      }
    }
  </svg>
  @for (m of drawn(); track $index) {
    @if (m.label; as l) {
      <span class="exos-redline__marker" [class.exos-redline__marker--text]="!key()" [class.exos-redline__marker--start]="l.align === 'start'" aria-hidden="true" [style.left.px]="l.x" [style.top.px]="l.y">
        @if (key()) {
          <span class="exos-redline__n">{{ m.n }}</span>{{ m.value }}
        } @else {
          {{ m.text }}
        }
      </span>
    }
  }
</div>
@if (key()) {
<ol class="exos-redline__key">
  @for (m of drawn(); track $index) {
    <li>
      <span class="exos-redline__n" aria-hidden="true">{{ m.n }}</span>
      <span><strong>{{ m.name }}</strong>&nbsp;·&nbsp;<span class="exos-redline__value">{{ m.value }}</span><br />{{ m.help }}</span>
    </li>
  }
</ol>
}`,
  styles: `
    :host { display: block; --redline: #d6336c; font-family: Geist, system-ui, sans-serif; }
    .exos-redline { position: relative; display: flex; justify-content: center; padding: 72px var(--exos-redline-room, 72px) 96px 24px; }
    .exos-redline__content { position: relative; flex-shrink: 0; width: max-content; pointer-events: none; user-select: none; }
    /* Above the example, even its menus and popovers, so every line and shaded area shows. */
    .exos-redline__svg { position: absolute; inset: 0; z-index: 2000; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
    .exos-redline__svg line { stroke: var(--redline); stroke-width: 1.25; }
    .exos-redline__svg line.exos-redline__ext { stroke-width: 1; stroke-dasharray: 2 2; opacity: 0.5; }
    .exos-redline__tap { fill: none; stroke: var(--redline); stroke-dasharray: 4 3; }
    .exos-redline__padding { fill: rgba(67, 138, 245, 0.28); stroke: none; }
    .exos-redline__marker {
      position: absolute; z-index: 2001; display: inline-flex; align-items: center; gap: 4px; transform: translate(-50%, -50%);
      padding: 1px 6px 1px 1px; border-radius: 999px; background: #fff; box-shadow: 0 0 0 1px rgba(214, 51, 108, 0.35);
      color: var(--redline); font-size: 11px; font-weight: 600; line-height: 16px; white-space: nowrap;
    }
    .exos-redline__marker--text { padding: 1px 8px; }
    /* Side labels start at their point and may wrap onto two lines. */
    .exos-redline__marker--start { max-width: 11rem; border-radius: 8px; transform: translate(0, -50%); white-space: normal; }
    .exos-redline__n {
      display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center; width: 16px; height: 16px;
      border-radius: 50%; background: var(--redline); color: #fff; font-size: 10px; font-weight: 700; line-height: 1;
    }
    .exos-redline__key {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 12px 24px;
      margin: 0; padding: 16px 24px 4px; border-top: 1px solid #e6eaf1; list-style: none;
      color: #3a4150; font-size: 13px; line-height: 18px;
    }
    .exos-redline__key li { display: flex; align-items: flex-start; gap: 8px; margin: 0; }
    .exos-redline__key .exos-redline__n { margin-top: 1px; }
    .exos-redline__key strong { color: #0f121a; font-weight: 600; }
    .exos-redline__value { color: var(--redline); font-weight: 600; }
  `,
})
export class RedlineComponent {
  readonly marks = input<RedlineMark[]>([]);
  /** Enlarges small components; reduced (never below 1) when the example would not fit. */
  readonly scale = input(2);
  /** Space to the right of the example for labels; side labels need more. */
  readonly room = input(72);
  /** The smallest zoom when fitting. Below 1 shrinks big examples (a full-width modal on a phone) to leave room for labels. */
  readonly minScale = input(1);
  /** Numbered markers with a key underneath. Off: each marker shows its short \`label\` instead. */
  readonly key = input(true);

  protected readonly zoom = signal(1);
  protected readonly drawn = signal<Drawn[]>([]);
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  /** Values measured at real size (zoom 1), so enlarging never changes a number. */
  private values: string[] | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const measure = () => this.measure();
      const observer = new ResizeObserver(measure);
      observer.observe(this.stage().nativeElement);
      observer.observe(this.content().nativeElement);
      document.fonts?.ready.then(measure);
      const timer = setTimeout(measure, 300);
      destroyRef.onDestroy(() => {
        observer.disconnect();
        clearTimeout(timer);
      });
    });
  }

  private measure(): void {
    const stageEl = this.stage().nativeElement;
    const contentEl = this.content().nativeElement;
    const z = this.zoom();
    const stage = stageEl.getBoundingClientRect();
    const rel = (r: DOMRect) => ({ l: r.left - stage.left, r: r.right - stage.left, t: r.top - stage.top, b: r.bottom - stage.top, w: r.width, h: r.height });
    const content = rel(contentEl.getBoundingClientRect());
    // Parts that aren't shown on this device (display: none) are skipped, e.g. a drop area on phones.
    const find = (sel: string) => {
      const el = contentEl.querySelector<HTMLElement>(sel);
      return el && el.getClientRects().length ? el : null;
    };
    const px = (v: number) => `${Math.round(v)}px`;
    // Sizes come from the computed style (border box).
    const boxSize = (el: HTMLElement) => {
      const c = getComputedStyle(el);
      const extra = (a: string, b: string) => (c.boxSizing === 'border-box' ? 0 : parseFloat(a) + parseFloat(b));
      return {
        w: parseFloat(c.width) + extra(c.paddingLeft, c.paddingRight) + extra(c.borderLeftWidth, c.borderRightWidth),
        h: parseFloat(c.height) + extra(c.paddingTop, c.paddingBottom) + extra(c.borderTopWidth, c.borderBottomWidth),
      };
    };

    // Markers on the top and bottom go in rows; a marker drops to the next row only if it would
    // overlap one already there, so most sit right next to what they measure.
    const rows: Record<'top' | 'bottom', [number, number][][]> = { top: [], bottom: [] };
    const place = (side: 'top' | 'bottom', x: number, width = LABEL_W) => {
      const span: [number, number] = [x - width / 2 - 4, x + width / 2 + 4];
      let i = 0;
      while (rows[side][i]?.some(([a, b]) => span[0] < b && span[1] > a)) i++;
      (rows[side][i] ??= []).push(span);
      const off = FIRST + ROW * i;
      return side === 'top' ? content.t - off : content.b + off;
    };
    const sideCount = { left: 0, right: 0 };

    // Room a short label needs (text labels are wider than numbered markers).
    const widthOf = (tpl?: string) => (this.key() || !tpl ? LABEL_W : tpl.replace('{v}', '00px').length * 6.4 + 18);

    const out: Drawn[] = [];
    this.marks().forEach((mark, index) => {
      const base = { n: index + 1, name: mark.name, help: mark.help };
      const w = widthOf(mark.label);

      if (mark.kind === 'size') {
        const el = find(mark.target);
        if (!el) return;
        const e = rel(el.getBoundingClientRect());
        const size = boxSize(el);
        if (mark.side === 'left' || mark.side === 'right') {
          const off = 14 + 40 * sideCount[mark.side]++;
          const x = mark.side === 'right' ? content.r + off : content.l - off;
          const edgeX = mark.side === 'right' ? e.r : e.l;
          out.push({
            ...base,
            value: px(size.h),
            lines: [
              { x1: x, y1: e.t, x2: x, y2: e.b },
              { x1: x - TICK, y1: e.t, x2: x + TICK, y2: e.t },
              { x1: x - TICK, y1: e.b, x2: x + TICK, y2: e.b },
              { x1: edgeX, y1: e.t, x2: x, y2: e.t, dashed: true },
              { x1: edgeX, y1: e.b, x2: x, y2: e.b, dashed: true },
            ],
            label: { x: mark.side === 'right' ? x + 32 : x - 32, y: (e.t + e.b) / 2 },
          });
        } else {
          const mid = (e.l + e.r) / 2;
          const y = place(mark.side, mid, w);
          const lineY = mark.side === 'top' ? y + 12 : y - 12;
          const edgeY = mark.side === 'top' ? e.t : e.b;
          out.push({
            ...base,
            value: px(size.w),
            lines: [
              { x1: e.l, y1: lineY, x2: e.r, y2: lineY },
              { x1: e.l, y1: lineY - TICK, x2: e.l, y2: lineY + TICK },
              { x1: e.r, y1: lineY - TICK, x2: e.r, y2: lineY + TICK },
              { x1: e.l, y1: edgeY, x2: e.l, y2: lineY, dashed: true },
              { x1: e.r, y1: edgeY, x2: e.r, y2: lineY, dashed: true },
            ],
            label: { x: mid, y },
          });
        }
      }

      if (mark.kind === 'distance') {
        const xOf = (edge: RedlineEdge) => {
          const el = find(edge.target);
          if (!el) return null;
          const r = rel(el.getBoundingClientRect());
          const s = getComputedStyle(el);
          const border = edge.inner ? parseFloat(edge.edge === 'left' ? s.borderLeftWidth : s.borderRightWidth) * z : 0;
          return { x: edge.edge === 'left' ? r.l + border : r.r - border, t: r.t, b: r.b };
        };
        let a = xOf(mark.from);
        let b = xOf(mark.to);
        if (!a || !b) return;
        // The space between two elements (right edge to left edge): if they swapped sides, like
        // buttons on the left with the main one first, measure between the edges that face each other.
        if (mark.from.edge === 'right' && mark.to.edge === 'left' && a.x > b.x) {
          const swapped = [xOf({ ...mark.to, edge: 'right' }), xOf({ ...mark.from, edge: 'left' })];
          if (swapped[0] && swapped[1]) [a, b] = swapped as [typeof a, typeof b];
        }
        // Stacked (one above the other, like buttons on a phone): no side-by-side space to show.
        if (a.b <= b.t || b.b <= a.t) return;
        const mid = (a.x + b.x) / 2;
        const y = place(mark.side, mid, w);
        const lineY = mark.side === 'top' ? y + 12 : y - 12;
        const edgeY = (p: { t: number; b: number }) => (mark.side === 'top' ? p.t : p.b);
        out.push({
          ...base,
          value: px(Math.abs(b.x - a.x) / z),
          lines: [
            { x1: a.x, y1: lineY, x2: b.x, y2: lineY },
            { x1: a.x, y1: lineY - TICK, x2: a.x, y2: lineY + TICK },
            { x1: b.x, y1: lineY - TICK, x2: b.x, y2: lineY + TICK },
            { x1: a.x, y1: edgeY(a), x2: a.x, y2: lineY, dashed: true },
            { x1: b.x, y1: edgeY(b), x2: b.x, y2: lineY, dashed: true },
          ],
          label: { x: mid, y },
        });
      }

      if (mark.kind === 'style') {
        const el = find(mark.target);
        if (!el) return;
        const e = rel(el.getBoundingClientRect());
        const s = getComputedStyle(el);
        const radius = parseFloat(s.borderTopLeftRadius);
        // A divider is the element's top border; no border, nothing to show.
        // divider-bottom is the element's bottom border, like a line under a header.
        if (mark.prop === 'divider' && !(parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none')) return;
        if (mark.prop === 'divider-bottom' && !(parseFloat(s.borderBottomWidth) > 0 && s.borderBottomStyle !== 'none')) return;
        const value =
          mark.prop === 'font-size' ? px(parseFloat(s.fontSize))
          : mark.prop === 'divider' ? px(parseFloat(s.borderTopWidth))
          : mark.prop === 'divider-bottom' ? px(parseFloat(s.borderBottomWidth))
          : radius >= 999 ? 'fully round' : px(radius);
        // Radius points at the rounded end; a divider at its line; text at the middle of the text.
        const x = mark.prop === 'radius' ? e.l + Math.min(e.h / 2, 8 * z) * 0.6 : mark.prop === 'divider' || mark.prop === 'divider-bottom' ? e.l + (e.r - e.l) * 0.2 : (e.l + e.r) / 2;
        const y = place(mark.side, x, w);
        out.push({
          ...base,
          value,
          lines: [{ x1: x, y1: mark.side === 'top' ? e.t : e.b, x2: x, y2: mark.side === 'top' ? y + 8 : y - 8, dashed: true }],
          label: { x, y },
        });
      }

      if (mark.kind === 'gap') {
        const ea = find(mark.from);
        const eb = find(mark.to);
        if (!ea || !eb) return;
        const a = rel(ea.getBoundingClientRect());
        const b = rel(eb.getBoundingClientRect());
        // Gaps sit in the first column on the right: they never share a height with the field's own height mark.
        const x = content.r + 14;
        out.push({
          ...base,
          value: px((b.t - a.b) / z),
          lines: [
            { x1: x, y1: a.b, x2: x, y2: b.t },
            { x1: x - TICK, y1: a.b, x2: x + TICK, y2: a.b },
            { x1: x - TICK, y1: b.t, x2: x + TICK, y2: b.t },
            { x1: a.r, y1: a.b, x2: x, y2: a.b, dashed: true },
            { x1: b.r, y1: b.t, x2: x, y2: b.t, dashed: true },
          ],
          label: { x: x + 12, y: (a.b + b.t) / 2, align: 'start' },
        });
      }

      if (mark.kind === 'tap') {
        const el = find(mark.target);
        if (!el) return;
        const after = getComputedStyle(el, '::after');
        if (!after.content || after.content === 'none' || after.position !== 'absolute') {
          out.push({ ...base, value: mark.fallback, lines: [] });
          return;
        }
        const e = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        const x = e.left - stage.left + (parseFloat(s.borderLeftWidth) + parseFloat(after.left)) * z;
        const y = e.top - stage.top + (parseFloat(s.borderTopWidth) + parseFloat(after.top)) * z;
        const w = parseFloat(after.width) * z;
        const h = parseFloat(after.height) * z;
        // Point at the tap area's own edge, away from the chip's other markers.
        const lx = x + 6;
        const ly = place(mark.side, lx, w);
        out.push({
          ...base,
          value: `${px(parseFloat(after.height))} tall`,
          rect: { x, y, w, h },
          lines: [{ x1: lx, y1: mark.side === 'top' ? y : y + h, x2: lx, y2: mark.side === 'top' ? ly + 8 : ly - 8, dashed: true }],
          label: { x: lx, y: ly },
        });
      }
    });

    // Padding: shade the ring between the border and the content, and label both directions.
    this.marks().forEach((mark, index) => {
      if (mark.kind !== 'padding') return;
      const el = find(mark.target);
      if (!el) return;
      const e = rel(el.getBoundingClientRect());
      const s = getComputedStyle(el);
      const n = (v: string) => parseFloat(v) * z;
      const x0 = e.l + n(s.borderLeftWidth), x1 = e.r - n(s.borderRightWidth);
      const y0 = e.t + n(s.borderTopWidth), y1 = e.b - n(s.borderBottomWidth);
      const cx0 = x0 + n(s.paddingLeft), cx1 = x1 - n(s.paddingRight);
      const cy0 = y0 + n(s.paddingTop), cy1 = y1 - n(s.paddingBottom);
      const rad = Math.max(0, Math.min(n(s.borderTopLeftRadius) - n(s.borderTopWidth), (y1 - y0) / 2, (x1 - x0) / 2));
      const outer =
        `M${x0 + rad},${y0}H${x1 - rad}A${rad},${rad} 0 0 1 ${x1},${y0 + rad}V${y1 - rad}A${rad},${rad} 0 0 1 ${x1 - rad},${y1}` +
        `H${x0 + rad}A${rad},${rad} 0 0 1 ${x0},${y1 - rad}V${y0 + rad}A${rad},${rad} 0 0 1 ${x0 + rad},${y0}Z`;
      const inner = `M${cx0},${cy0}H${cx1}V${cy1}H${cx0}Z`;
      const base = { n: index + 1, name: mark.name, help: mark.help };
      if (mark.aside) {
        // One label to the right, for a section among several (header, body, footer).
        const [t, b2, l, r2] = [s.paddingTop, s.paddingBottom, s.paddingLeft, s.paddingRight].map((v) => Math.round(parseFloat(v)));
        const vert = t === b2 ? (t ? `${t}px top and bottom` : '') : [t && `${t}px top`, b2 && `${b2}px bottom`].filter(Boolean).join(', ');
        const side = l === r2 ? (l ? `${l}px sides` : '') : [l && `${l}px left`, r2 && `${r2}px right`].filter(Boolean).join(', ');
        const desc = [vert, side].filter(Boolean).join(' · ');
        if (!desc) return;
        const y = (y0 + y1) / 2;
        const lx = content.r + 16;
        out.push({
          ...base,
          tpl: '{v}',
          aside: true,
          value: `${mark.aside}: ${desc}`,
          area: `${outer}${inner}`,
          lines: [{ x1: (cx1 + x1) / 2, y1: y, x2: lx, y2: y, dashed: true }],
          label: { x: lx, y, align: 'start' },
        });
        return;
      }
      // A direction with no padding gets no label (its height or width comes from elsewhere).
      const vertical = parseFloat(s.paddingTop) > 0 || parseFloat(s.paddingBottom) > 0;
      const sides = parseFloat(s.paddingLeft) > 0 || parseFloat(s.paddingRight) > 0;
      if (!vertical && !sides) return;
      // The shaded ring rides on the first entry.
      let area: string | undefined = `${outer}${inner}`;
      if (vertical) {
        // Top and bottom: pointed at the bottom band, under the middle of the content.
        const bx = (cx0 + cx1) / 2;
        const by = place('bottom', bx, widthOf(mark.label));
        out.push({
          ...base,
          value: px(parseFloat(s.paddingTop)),
          area,
          lines: [{ x1: bx, y1: (cy1 + y1) / 2, x2: bx, y2: by - 8, dashed: true }],
          label: { x: bx, y: by },
        });
        area = undefined;
      }
      if (sides) {
        // Left and right: pointed at the left band.
        const sx = (x0 + cx0) / 2;
        const sy = place('top', sx, widthOf(mark.labelSides));
        out.push({
          ...base,
          tpl: mark.labelSides,
          value: px(parseFloat(s.paddingLeft)),
          area,
          lines: [{ x1: sx, y1: (cy0 + cy1) / 2, x2: sx, y2: sy + 8, dashed: true }],
          label: { x: sx, y: sy },
        });
      }
    });

    // First pass at real size: keep the numbers, then enlarge to fit and draw.
    if (!this.values) {
      this.values = out.map((m) => m.value);
      const cs = getComputedStyle(stageEl);
      const avail = stageEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const natural = contentEl.getBoundingClientRect().width;
      const next = Math.max(this.minScale(), Math.min(this.scale(), avail / natural));
      if (natural && Math.abs(next - z) > 0.01) {
        this.zoom.set(next);
        return; // drawn again at the new zoom
      }
    }
    const values = this.values;
    const marks = this.marks();
    this.drawn.set(
      out.map((m, i) => {
        const value = values[i] ?? m.value;
        const text = (m.tpl ?? marks[m.n - 1]?.label ?? '{v}').replace('{v}', value);
        // Keep labels inside the frame: a label near the edge slides in; its line still points at the part.
        const half = widthOf(text) / 2 + 4;
        const label =
          m.label &&
          (m.label.align === 'start'
            ? m.label
            : { ...m.label, x: Math.min(Math.max(m.label.x, half), stageEl.clientWidth - half) });
        return { ...m, value, text, label };
      }),
    );
    // Side labels may wrap to two or three lines: push each one down so none overlap, and bend its line to follow.
    const side = this.drawn()
      .filter((m) => m.aside)
      .sort((a, b) => a.label!.y - b.label!.y);
    const room = Math.max(120, stageEl.clientWidth - (side[0]?.label!.x ?? 0) - 8);
    // Side labels start no higher than the example's top, so they stay clear of the labels above it.
    let bottom = content.t - 6;
    for (const m of side) {
      const lines = Math.ceil(Math.min(widthOf(m.text), 176) / Math.min(room, 176) + (widthOf(m.text) > 176 ? 1 : 0));
      const h = lines * 16 + 6;
      const top = Math.max(m.label!.y - h / 2, bottom + 6);
      m.label!.y = top + h / 2;
      const line = m.lines[0];
      if (line) m.lines = [{ ...line, y2: m.label!.y }];
      bottom = top + h;
    }
    if (side.length) this.drawn.set([...this.drawn()]);
  }
}
