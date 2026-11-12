import { Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { ButtonComponent } from '../../components/button/button';

/** Real theme classes, measured live: [name, rule, the element's markup]. */
const SAMPLES: [string, string, string][] = [
  ['Button', 'Control', '<button type="button" class="btn btn-primary btn-lg" tabindex="-1">Save changes</button>'],
  ['Input', 'Control', '<input class="form-control" value="Alex Morgan" aria-label="Sample" tabindex="-1" readonly />'],
  ['Segment', 'Control', '<span class="exos-segmented exos-segmented-contrast"><span class="exos-segment">Interior</span></span>'],
  ['Tab', 'Control', '<span class="exos-tabs exos-tabs-line"><span class="exos-tab">Summary</span></span>'],
  ['Chip', 'Compact', '<span class="chip chip-single">Average</span>'],
  ['Tag', 'Compact', '<span class="exos-tag exos-tag-text-only">Pending</span>'],
  ['Tooltip', 'Small surface', '<span class="exos-tooltip position-static d-inline-block">Copy link</span>'],
  ['Notification', 'Small surface', '<div class="exos-notification">Changes saved</div>'],
];

/** Docs only: renders each sample hidden, then prints the padding the theme gives it at this width. */
@Component({
  selector: 'app-padding-specs',
  template: `
    <div class="pd-samples" aria-hidden="true">${SAMPLES.map(([, , html], i) => `<div data-i="${i}">${html}</div>`).join('')}</div>
    <table class="table table-sm mb-0 pd-table">
      <thead><tr><th>Part</th><th>Rule</th><th>Top / bottom</th><th>Sides</th><th>Height</th></tr></thead>
      <tbody>
        @for (r of rows(); track r[0]) {
          <tr><td>{{ r[0] }}</td><td>{{ r[1] }}</td><td>{{ r[2] }}</td><td>{{ r[3] }}</td><td>{{ r[4] }}</td></tr>
        }
      </tbody>
    </table>`,
  styles: `
    .pd-samples { position: absolute; left: -9999px; top: 0; visibility: hidden; }
    .pd-table { font-size: 0.8125rem; font-variant-numeric: tabular-nums; }
  `,
})
class PaddingSpecsComponent {
  protected readonly rows = signal<string[][]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const px = (v: string) => `${Math.round(parseFloat(v) * 10) / 10}px`;
      const read = () => {
        this.rows.set(
          SAMPLES.map(([name, rule], i) => {
            const box = this.host.nativeElement.querySelector(`[data-i="${i}"]`)!;
            // The deepest themed element is the one with the padding (e.g. the segment inside its track).
            const el = (box.querySelector('.exos-segment, .exos-tab') ?? box.firstElementChild) as HTMLElement;
            const cs = getComputedStyle(el);
            const border = parseFloat(cs.borderLeftWidth);
            const side = parseFloat(cs.paddingLeft) + border;
            const top = parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth);
            return [name, rule, px(String(top)), `${px(String(side))}${border ? ' (with border)' : ''}`, px(String(el.getBoundingClientRect().height))];
          }),
        );
      };
      read();
      window.addEventListener('resize', read);
    });
  }
}

const STYLES = [
  `
  .pd-demo { display: flex; flex-direction: column; gap: var(--exos-spacing-05); max-width: 22rem; margin: 0 auto; }
  .pd-card { padding: var(--exos-space-inset); border: 1px solid var(--color-border-default); border-radius: var(--exos-radius-04); background: var(--color-background-page);
    box-shadow: inset 0 0 0 var(--exos-space-inset) var(--color-background-selected); }
  .pd-row { display: flex; justify-content: space-between; padding: var(--exos-spacing-04) var(--exos-spacing-05); border-radius: var(--exos-radius-02); background: var(--color-background-page);
    box-shadow: inset 0 0 0 var(--exos-spacing-04) var(--color-background-selected); }
  .pd-row span { position: relative; background: var(--color-background-page); }
  `,
];

const meta: Meta = {
  title: 'Foundations/Padding',
  decorators: [moduleMetadata({ imports: [ButtonComponent, PaddingSpecsComponent] })],
  parameters: { a11y: { test: 'error' }, controls: { disable: true } },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj;

/** Live: the padding every part gets from the theme at this width. */
export const Measured: Story = { render: () => ({ template: `<app-padding-specs />` }) };

/** Do: a row with 12px top and bottom, 16px sides. The tint is the padding. */
export const DoRowPadding: Story = {
  render: () => ({
    styles: STYLES,
    template: `<div class="pd-demo"><div class="pd-row"><span>Kitchen</span><span>4 photos</span></div><div class="pd-row"><span>Bedroom</span><span>2 photos</span></div></div>`,
  }),
};

/** Don't: text tight to the edge. */
export const DontTight: Story = {
  render: () => ({
    styles: STYLES,
    template: `<div class="pd-demo"><div class="pd-row" style="padding: var(--exos-spacing-01) var(--exos-spacing-02); box-shadow: none"><span>Kitchen</span><span>4 photos</span></div><div class="pd-row" style="padding: var(--exos-spacing-01) var(--exos-spacing-02); box-shadow: none"><span>Bedroom</span><span>2 photos</span></div></div>`,
  }),
};

/** A card: the tinted frame is its padding (16px on phones, 24px on web). */
export const Surface: Story = {
  render: () => ({
    styles: STYLES,
    template: `<div class="pd-demo"><div class="pd-card"><p class="mb-3">Kitchen · 4 photos</p><app-button label="Add photos" size="md" /></div></div>`,
  }),
};
