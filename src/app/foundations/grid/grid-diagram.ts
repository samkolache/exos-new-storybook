import { Component, computed, input } from '@angular/core';

/** A block on the diagram: on columns (start, span), or off the grid (left and width in % of the screen). */
export interface DiagramBlock {
  start?: number;
  span?: number;
  label?: string;
  /** Off the grid, in % of the screen width: shows what not to do. */
  off?: [number, number];
  height?: number;
}

/**
 * Docs only: the grid drawn to scale for one screen width, with columns, gutters and margins.
 * Every size is a share of the real screen width, so the drawing matches the real grid.
 */
@Component({
  selector: 'app-grid-diagram',
  template: `
<figure class="gd">
  <div class="gd-screen" [style.aspect-ratio]="rows().length ? null : ratio()">
    <!-- Columns: margins, columns and gutters in proportion to the real screen. -->
    <div class="gd-columns" aria-hidden="true">
      @for (seg of segments(); track $index) {
        <span [class]="'gd-seg gd-' + seg.kind" [style.flex-grow]="seg.px"></span>
      }
    </div>
    <!-- Content blocks, placed on the same columns. -->
    <div class="gd-blocks" [style.padding-inline]="marginPct()">
      @for (row of rows(); track $index) {
        <div class="gd-row" [style.grid-template-columns]="'repeat(' + columns() + ', 1fr)'" [style.column-gap]="gutterPct()">
          @for (block of row; track $index) {
            @if (block.off) {
              <div class="gd-block gd-off" [style.margin-left]="offLeft(block)" [style.width]="offWidth(block)" [style.height.px]="block.height ?? 40">{{ block.label }}</div>
            } @else {
              <div class="gd-block" [style.grid-column]="block.start + ' / span ' + block.span" [style.height.px]="block.height ?? 40">{{ block.label ?? block.span }}</div>
            }
          }
        </div>
      }
    </div>
  </div>
  @if (labels()) {
    <div class="gd-legend" aria-hidden="true">
      <span><i class="gd-key gd-margin"></i><b>Margin</b> {{ margin() }}px</span>
      <span><i class="gd-key gd-column"></i><b>Column</b> {{ columns() }} of them</span>
      <span><i class="gd-key gd-gutter-key"></i><b>Gutter</b> {{ gutter() }}px</span>
    </div>
  }
  @if (caption()) {
    <figcaption class="gd-caption">{{ caption() }}</figcaption>
  }
</figure>`,
  styles: `
    :host { display: block; }
    .gd { margin: 0; }
    .gd-screen { position: relative; min-height: 80px; border: 1px solid #c3cad6; border-radius: 10px; background: #fff; overflow: hidden; }
    .gd-columns { position: absolute; inset: 0; display: flex; }
    .gd-seg { flex-basis: 0; }
    .gd-margin { background: repeating-linear-gradient(135deg, rgba(232, 62, 140, 0.14) 0 3px, transparent 3px 7px); }
    .gd-column { background: rgba(67, 138, 245, 0.12); }
    .gd-gutter { background: #fff; }
    .gd-blocks { position: relative; display: flex; flex-direction: column; gap: 10px; padding-block: 14px; }
    .gd-row { display: grid; }
    .gd-block { display: flex; align-items: center; justify-content: center; min-width: 0; border-radius: 6px; background: #2160d4; color: #fff; font: 600 11px/1.2 Geist, system-ui, sans-serif; overflow: hidden; white-space: nowrap; }
    .gd-off { grid-column: 1 / -1; background: #b42318; }
    .gd-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 8px; font: 12px/1.3 Geist, system-ui, sans-serif; color: #5b6475; }
    .gd-legend span { display: inline-flex; align-items: center; gap: 6px; }
    .gd-legend b { color: #0f121a; font-weight: 600; }
    .gd-key { display: inline-block; width: 14px; height: 14px; border-radius: 3px; border: 1px solid #c3cad6; }
    .gd-gutter-key { background: #fff; }
    .gd-caption { margin-top: 8px; font-size: 13px; color: #5b6475; }
  `,
})
export class GridDiagramComponent {
  /** The screen width being drawn, like 375 or 1312. */
  readonly width = input(1312);
  readonly columns = input(16);
  readonly margin = input(32);
  readonly gutter = input(32);
  /** Height of the drawing as a share of its width (screen shape). */
  readonly ratio = input('16 / 5');
  readonly blocks = input<DiagramBlock[][]>([]);
  readonly labels = input(false);
  readonly caption = input('');

  /** Margin, column, gutter, column, …, margin: each with its real width in px. */
  protected readonly segments = computed(() => {
    const n = this.columns();
    const col = (this.width() - 2 * this.margin() - (n - 1) * this.gutter()) / n;
    const segs: { kind: string; px: number }[] = [{ kind: 'margin', px: this.margin() }];
    for (let i = 0; i < n; i++) {
      segs.push({ kind: 'column', px: col });
      if (i < n - 1) segs.push({ kind: 'gutter', px: this.gutter() });
    }
    segs.push({ kind: 'margin', px: this.margin() });
    return segs;
  });

  protected readonly rows = computed(() => this.blocks());
  protected readonly marginPct = computed(() => `${(this.margin() / this.width()) * 100}%`);
  /** Column gap as a share of the content area (grid gap % is of the grid's own width). */
  protected readonly gutterPct = computed(() => `${(this.gutter() / (this.width() - 2 * this.margin())) * 100}%`);

  protected offLeft(block: DiagramBlock): string {
    const content = this.width() - 2 * this.margin();
    return `${(((block.off![0] / 100) * this.width() - this.margin()) / content) * 100}%`;
  }

  protected offWidth(block: DiagramBlock): string {
    const content = this.width() - 2 * this.margin();
    return `${(((block.off![1] / 100) * this.width()) / content) * 100}%`;
  }
}
