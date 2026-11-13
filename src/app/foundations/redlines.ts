import { Component, ElementRef, afterNextRender, inject, viewChild, type OnDestroy } from '@angular/core';

/**
 * Docs only: draws spec lines over its content, like a designer's redlines.
 *
 *   <app-redlines>
 *     <div data-redline-gap style="display: flex; gap: …">…</div>   space between the children
 *     <div data-redline-pad style="padding: …">…</div>              space inside the element, border included (controls)
 *     <div data-redline-pad="inset" style="padding: …">…</div>      padding only, labels inside (cards, panels)
 *   </app-redlines>
 *
 * Each space gets a thin line with end ticks and its size in px. Values come from the
 * computed styles, so they are the real ones at this screen width.
 */
@Component({
  selector: 'app-redlines',
  template: `<div #content><ng-content /></div><div class="rl-layer" #layer aria-hidden="true"></div>`,
  styles: `
    :host { position: relative; display: block; }
    .rl-layer { position: absolute; inset: 0; pointer-events: none; }
  `,
})
export class RedlinesComponent implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly layer = viewChild.required<ElementRef<HTMLElement>>('layer');
  private observers: { disconnect(): void }[] = [];
  private frame = 0;

  constructor() {
    afterNextRender(() => {
      const content = this.content().nativeElement;
      const schedule = () => {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.draw());
      };
      const ro = new ResizeObserver(schedule);
      ro.observe(content);
      const mo = new MutationObserver(schedule);
      mo.observe(content, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-redline-pad', 'data-redline-gap', 'class'] });
      this.observers = [ro, mo];
      document.fonts?.ready.then(schedule);
      window.addEventListener('resize', schedule);
      schedule();
    });
  }

  ngOnDestroy(): void {
    this.observers.forEach((o) => o.disconnect());
    cancelAnimationFrame(this.frame);
  }

  private draw(): void {
    const root = this.content().nativeElement;
    const layer = this.layer().nativeElement;
    const origin = this.host.nativeElement.getBoundingClientRect();
    layer.replaceChildren();
    root.querySelectorAll<HTMLElement>('[data-redline-pad]').forEach((el) => drawPadding(el, layer, origin));
    root.querySelectorAll<HTMLElement>('[data-redline-gap]').forEach((el) => drawGaps(el, layer, origin));
  }
}

const COLOR = '#d6336c';
const n = (v: string) => parseFloat(v) || 0;
const fmt = (v: number) => `${Math.round(v * 10) / 10}`;

type Side = 'left' | 'right' | 'top' | 'bottom';

/** A measure line from (x1, y1) to (x2, y2), with ticks at both ends. */
function line(layer: HTMLElement, x1: number, y1: number, x2: number, y2: number): void {
  const horizontal = y1 === y2;
  const el = document.createElement('div');
  const tick = 6;
  Object.assign(el.style, {
    position: 'absolute',
    boxSizing: 'border-box',
    left: `${(horizontal ? Math.min(x1, x2) : x1 - tick / 2)}px`,
    top: `${(horizontal ? y1 - tick / 2 : Math.min(y1, y2))}px`,
    width: `${horizontal ? Math.abs(x2 - x1) : tick}px`,
    height: `${horizontal ? tick : Math.abs(y2 - y1)}px`,
    borderColor: COLOR,
    borderStyle: 'solid',
    borderWidth: horizontal ? '0 1px' : '1px 0',
    background: horizontal
      ? `linear-gradient(to bottom, transparent ${tick / 2 - 0.5}px, ${COLOR} ${tick / 2 - 0.5}px ${tick / 2 + 0.5}px, transparent ${tick / 2 + 0.5}px)`
      : `linear-gradient(to right, transparent ${tick / 2 - 0.5}px, ${COLOR} ${tick / 2 - 0.5}px ${tick / 2 + 0.5}px, transparent ${tick / 2 + 0.5}px)`,
  });
  layer.appendChild(el);
}

/** The size, in a small pill at (x, y), anchored by `side` so it sits beside the line. */
function label(layer: HTMLElement, text: string, x: number, y: number, side: Side | 'center'): void {
  const el = document.createElement('span');
  el.textContent = text;
  const shift: Record<Side | 'center', string> = {
    left: 'translate(calc(-100% - 4px), -50%)',
    right: 'translate(4px, -50%)',
    top: 'translate(-50%, calc(-100% - 4px))',
    bottom: 'translate(-50%, 4px)',
    center: 'translate(-50%, -50%)',
  };
  Object.assign(el.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: shift[side],
    padding: '0 4px',
    borderRadius: '3px',
    background: COLOR,
    color: '#fff',
    font: '600 10px/14px Geist, system-ui, sans-serif',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  });
  layer.appendChild(el);
}

/**
 * Lines for the padding on each side. Controls count their border (sizes outside the element);
 * `inset` surfaces measure from inside the border, with the sizes inside.
 */
function drawPadding(el: HTMLElement, layer: HTMLElement, origin: DOMRect): void {
  const inset = el.getAttribute('data-redline-pad') === 'inset';
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  // Rendered size over layout size: the element may be shown scaled up.
  const scale = el.offsetWidth ? r.width / el.offsetWidth : 1;
  const b = {
    top: n(cs.borderTopWidth),
    right: n(cs.borderRightWidth),
    bottom: n(cs.borderBottomWidth),
    left: n(cs.borderLeftWidth),
  };
  const pad = {
    top: n(cs.paddingTop) + (inset ? 0 : b.top),
    right: n(cs.paddingRight) + (inset ? 0 : b.right),
    bottom: n(cs.paddingBottom) + (inset ? 0 : b.bottom),
    left: n(cs.paddingLeft) + (inset ? 0 : b.left),
  };
  // The box the lines start from: the outer edge, or inside the border for inset.
  const x = r.left - origin.left + (inset ? b.left * scale : 0);
  const y = r.top - origin.top + (inset ? b.top * scale : 0);
  const w = r.width - (inset ? (b.left + b.right) * scale : 0);
  const h = r.height - (inset ? (b.top + b.bottom) * scale : 0);
  const midX = x + w / 2;
  // Inset: side lines run through the empty top padding band, clear of the content.
  const midY = inset && pad.top ? y + (pad.top * scale) / 2 : y + h / 2;
  if (pad.left) {
    const end = x + pad.left * scale;
    line(layer, x, midY, end, midY);
    inset ? label(layer, fmt(pad.left), end, midY, 'right') : label(layer, fmt(pad.left), x, midY, 'left');
  }
  if (pad.right) {
    const start = x + w - pad.right * scale;
    line(layer, start, midY, x + w, midY);
    inset ? label(layer, fmt(pad.right), start, midY, 'left') : label(layer, fmt(pad.right), x + w, midY, 'right');
  }
  if (pad.top) {
    const end = y + pad.top * scale;
    line(layer, midX, y, midX, end);
    inset ? label(layer, fmt(pad.top), midX + 4, (y + end) / 2, 'right') : label(layer, fmt(pad.top), midX, y, 'top');
  }
  if (pad.bottom) {
    const start = y + h - pad.bottom * scale;
    line(layer, midX, start, midX, y + h);
    inset ? label(layer, fmt(pad.bottom), midX + 4, (start + y + h) / 2, 'right') : label(layer, fmt(pad.bottom), midX, y + h, 'bottom');
  }
}

/** Lines across the space between each pair of children, with the size beside them. */
function drawGaps(el: HTMLElement, layer: HTMLElement, origin: DOMRect): void {
  const kids = [...el.children].filter((c) => (c as HTMLElement).offsetParent !== null) as HTMLElement[];
  for (let i = 1; i < kids.length; i++) {
    const a = kids[i - 1].getBoundingClientRect();
    const b = kids[i].getBoundingClientRect();
    if (b.top >= a.bottom - 0.5) {
      // Stacked: a vertical line in the space, near the left edge.
      const gap = b.top - a.bottom;
      if (gap < 1) continue;
      const lx = Math.max(a.left, b.left) - origin.left + 16;
      line(layer, lx, a.bottom - origin.top, lx, b.top - origin.top);
      label(layer, fmt(gap), lx, (a.bottom + b.top) / 2 - origin.top, 'right');
    } else if (b.left >= a.right - 0.5) {
      // Side by side: a horizontal line in the space, with the size above.
      const gap = b.left - a.right;
      if (gap < 1) continue;
      const ly = Math.max(a.top, b.top) - origin.top + Math.min(a.height, b.height) / 2;
      line(layer, a.right - origin.left, ly, b.left - origin.left, ly);
      label(layer, fmt(gap), (a.right + b.left) / 2 - origin.left, ly - 3, 'top');
    }
  }
}
