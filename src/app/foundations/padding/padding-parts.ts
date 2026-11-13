import { Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RedlinesComponent } from '../redlines';
import { PADDING_SAMPLES, paddedElement } from './padding-samples';

type Spec = { h: number; top: number; right: number; bottom: number; left: number; border: number };

/**
 * Docs only: every part, with spec lines for its padding, and the values the theme
 * gives it at this width. Inside a Mobile / Web frame, the values switch with the device.
 */
@Component({
  selector: 'app-padding-parts',
  imports: [RedlinesComponent],
  template: `
    @for (row of rows; track row.name; let i = $index) {
      <div class="pp-row">
        <div class="pp-name"><b>{{ row.name }}</b><span>{{ row.rule }}</span></div>
        <app-redlines class="pp-stage">
          <div class="pp-center">
            <div class="pp-zoom">
              <div class="pp-sample" [innerHTML]="row.html" aria-hidden="true"></div>
            </div>
          </div>
        </app-redlines>
        @if (specs()[i]; as s) {
          <dl class="pp-values">
            <div><dt>Top / bottom</dt><dd>{{ pair(s.top, s.bottom) }}</dd></div>
            <div><dt>Sides</dt><dd>{{ pair(s.left, s.right) }}{{ s.border ? ' (with border)' : '' }}</dd></div>
            <div><dt>Height</dt><dd>{{ px(s.h) }}</dd></div>
          </dl>
        }
      </div>
    }`,
  styles: `
    :host { display: flex; flex-direction: column; }
    .pp-row { display: grid; grid-template-columns: 8rem minmax(0, 1fr) 18rem; gap: var(--exos-spacing-05) var(--exos-spacing-06); align-items: center;
      padding: var(--exos-spacing-05) 0; border-bottom: 1px solid var(--color-border-divider); }
    .pp-name { display: flex; flex-direction: column; gap: var(--exos-spacing-01); }
    .pp-name b { font-weight: 600; color: var(--color-text-heading); }
    .pp-name span, .pp-values dt { font-size: var(--exos-type-caption-size); line-height: var(--exos-type-caption-line-height);
      letter-spacing: var(--exos-type-caption-tracking); color: var(--color-text-label); font-weight: 400; }
    .pp-stage { padding: var(--exos-spacing-07) var(--exos-spacing-05); border-radius: var(--exos-radius-03); background: var(--color-background-subtle); }
    .pp-center { display: flex; justify-content: center; align-items: center; min-height: 5rem; }
    .pp-zoom { position: relative; transform: scale(1.5); }
    .pp-sample { display: inline-block; max-width: 18rem; }
    .pp-values { display: grid; grid-template-columns: repeat(3, auto); gap: var(--exos-spacing-04); margin: 0; }
    .pp-values dd { margin: 0; font-weight: 600; color: var(--color-text-heading); font-variant-numeric: tabular-nums; }
    @media (max-width: 671.98px) {
      .pp-row { grid-template-columns: minmax(0, 1fr); }
      .pp-zoom { transform: none; }
    }
  `,
})
export class PaddingPartsComponent {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly rows = PADDING_SAMPLES.map(([name, rule, html]) => ({ name, rule, html: this.sanitizer.bypassSecurityTrustHtml(html) }));
  protected readonly specs = signal<Spec[]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const measure = () => this.measure();
      measure();
      // Re-measure when the web fonts arrive and when anything changes size.
      document.fonts?.ready.then(measure);
      const ro = new ResizeObserver(measure);
      this.host.nativeElement.querySelectorAll('.pp-sample').forEach((el) => ro.observe(el));
      window.addEventListener('resize', measure);
    });
  }

  protected px(v: number): string {
    return `${Math.round(v * 10) / 10}px`;
  }

  protected pair(a: number, b: number): string {
    return a === b ? this.px(a) : `${this.px(a)} / ${this.px(b)}`;
  }

  private measure(): void {
    const n = (v: string) => parseFloat(v) || 0;
    const boxes = [...this.host.nativeElement.querySelectorAll<HTMLElement>('.pp-sample')];
    this.specs.set(
      boxes.map((box) => {
        const el = paddedElement(box);
        el.setAttribute('data-redline-pad', '');
        const cs = getComputedStyle(el);
        return {
          h: el.offsetHeight,
          top: n(cs.paddingTop) + n(cs.borderTopWidth),
          right: n(cs.paddingRight) + n(cs.borderRightWidth),
          bottom: n(cs.paddingBottom) + n(cs.borderBottomWidth),
          left: n(cs.paddingLeft) + n(cs.borderLeftWidth),
          border: n(cs.borderLeftWidth),
        };
      }),
    );
  }
}
