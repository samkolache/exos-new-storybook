import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

/** One numbered part: a CSS selector inside the example, and the side its pin sits on. */
export interface AnatomyPart {
  n: number;
  target: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Point at the element's outer edge (a container), not at its text. */
  whole?: boolean;
}

interface Pin {
  n: number;
  x: number;
  y: number;
  /** Where the arrow points: the edge of the part (its text, where it has text). */
  tx: number;
  ty: number;
}

const GAP = 44; // pin centre to the example's edge, so every arrow is long enough to read
const MIN_APART = 24; // pins on one side never overlap

/**
 * Docs only: numbered pins with arrows to the parts of a live example.
 * Positions are measured from the real elements after each render and resize, so they can't drift.
 *
 *   <app-anatomy [parts]="[{ n: 1, target: 'label', side: 'left' }]">
 *     <app-input label="Email" />
 *   </app-anatomy>
 */
@Component({
  selector: 'app-anatomy',
  template: `
<div #stage class="exos-anatomy">
  <div #content class="exos-anatomy__content" [class.exos-anatomy__content--fit]="fits()" [style.zoom]="zoom()" [style.width]="width()">
    <ng-content />
  </div>
  <svg class="exos-anatomy__lines" aria-hidden="true">
    <defs>
      <marker [id]="markerId" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0.5L7.5 4 0 7.5z" fill="#0f121a" />
      </marker>
    </defs>
    @for (pin of pins(); track pin.n) {
      <line [attr.x1]="pin.x" [attr.y1]="pin.y" [attr.x2]="pin.tx" [attr.y2]="pin.ty" [attr.marker-end]="'url(#' + markerId + ')'" />
    }
  </svg>
  @for (pin of pins(); track pin.n) {
    <span class="exos-anatomy__pin" aria-hidden="true" [style.left.px]="pin.x" [style.top.px]="pin.y">{{ pin.n }}</span>
  }
</div>`,
  styles: `
    :host { display: block; }
    .exos-anatomy { position: relative; display: flex; justify-content: center; padding: 48px 72px; }
    .exos-anatomy__content { position: relative; max-width: 100%; }
    /* Enlarged small components keep their real shape (one line); the zoom shrinks to fit instead. */
    .exos-anatomy__content--fit { flex-shrink: 0; width: max-content; max-width: none; }
    .exos-anatomy__lines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
    .exos-anatomy__lines line { stroke: #0f121a; stroke-width: 1.25; }
    .exos-anatomy__pin {
      position: absolute; width: 20px; height: 20px; margin: -10px 0 0 -10px; border-radius: 50%;
      background: #0f121a; color: #fff; font: 600 11px/20px Geist, system-ui, sans-serif; text-align: center;
    }
  `,
})
export class AnatomyComponent {
  readonly parts = input<AnatomyPart[]>([]);
  /** Enlarges small components, like chips and tags. */
  readonly scale = input(1);
  /** Width of the example, like '18rem'. */
  readonly width = input<string | null>(null);

  protected readonly pins = signal<Pin[]>([]);
  /** The zoom in use: `scale`, reduced (never below 1) when the enlarged example would not fit. */
  protected readonly zoom = signal(1);
  /** Enlarged small components (scale above 1, no fixed width) are fitted rather than wrapped. */
  protected fits(): boolean {
    return this.scale() > 1 && !this.width();
  }
  protected readonly markerId = `anatomy-arrow-${Math.random().toString(36).slice(2, 8)}`;
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.zoom.set(this.scale());
      const measure = () => this.measure();
      // Fonts and icons can shift the layout after the first paint.
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

  /** The visible box of a part: its text if it has some, otherwise the element. */
  private boxOf(el: Element, whole = false): DOMRect {
    if (whole) return el.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(el);
    const text = range.getBoundingClientRect();
    return text.width && text.height && !(el instanceof HTMLInputElement) ? text : el.getBoundingClientRect();
  }

  private measure(): void {
    if (this.fits()) {
      // Room left once the pins have space on both sides; shrink the zoom to fit, down to 1.
      const stageEl = this.stage().nativeElement;
      const pad = parseFloat(getComputedStyle(stageEl).paddingLeft) * 2;
      const natural = this.content().nativeElement.getBoundingClientRect().width / this.zoom();
      const next = Math.max(1, Math.min(this.scale(), (stageEl.clientWidth - pad) / natural));
      if (natural && Math.abs(next - this.zoom()) > 0.01) {
        this.zoom.set(next);
        return; // the resize observer measures again at the new zoom
      }
    }
    const stage = this.stage().nativeElement.getBoundingClientRect();
    const content = this.content().nativeElement.getBoundingClientRect();
    const pins: Pin[] = [];
    for (const part of this.parts()) {
      const el = this.content().nativeElement.querySelector(part.target);
      if (!el) continue;
      const box = this.boxOf(el, part.whole);
      const side = part.side ?? 'left';
      const midX = box.left + box.width / 2 - stage.left;
      const midY = box.top + box.height / 2 - stage.top;
      if (side === 'left') pins.push({ n: part.n, x: content.left - stage.left - GAP, y: midY, tx: box.left - stage.left - 3, ty: midY });
      if (side === 'right') pins.push({ n: part.n, x: content.right - stage.left + GAP, y: midY, tx: box.right - stage.left + 3, ty: midY });
      if (side === 'top') pins.push({ n: part.n, x: midX, y: content.top - stage.top - GAP, tx: midX, ty: box.top - stage.top - 3 });
      if (side === 'bottom') pins.push({ n: part.n, x: midX, y: content.bottom - stage.top + GAP, tx: midX, ty: box.bottom - stage.top + 3 });
    }
    // Pins in one column (or row) keep their distance; arrows still end at their part.
    for (const axis of ['x', 'y'] as const) {
      const other = axis === 'x' ? 'y' : 'x';
      const lines = new Map<number, Pin[]>();
      for (const p of pins) lines.set(Math.round(p[axis]), [...(lines.get(Math.round(p[axis])) ?? []), p]);
      for (const group of lines.values()) {
        group.sort((a, b) => a[other] - b[other]);
        for (let i = 1; i < group.length; i++) {
          if (group[i][other] - group[i - 1][other] < MIN_APART) group[i][other] = group[i - 1][other] + MIN_APART;
        }
      }
    }
    // A pin that had to move keeps its arrow on its part, so the line slants slightly.
    this.pins.set(pins);
  }
}
