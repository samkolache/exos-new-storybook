import { Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ButtonComponent } from '../../components/button/button';
import { InputComponent } from '../../components/input/input';

const SCALE: [string, number][] = [
  ['01', 2], ['02', 4], ['03', 8], ['04', 12], ['05', 16], ['06', 24], ['07', 32],
  ['08', 40], ['09', 48], ['10', 64], ['11', 80], ['12', 96], ['13', 160],
];

const LAYOUT = ['section', 'group', 'stack', 'inset', 'controls', 'related'];

/** Shaded gaps: the parent is striped, children are white, so the space between them shows. */
const DEMO_STYLES = [
  `
  .sp-gaps { background: repeating-linear-gradient(45deg, rgba(232, 62, 140, 0.16) 0 4px, transparent 4px 8px); }
  .sp-white { background: var(--color-background-page, #fff); }
  .sp-card { border: 1px solid var(--color-border-default, #c3cad6); border-radius: 12px; }
  .sp-values { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0 0 12px; font-size: 13px; color: var(--color-text-label, #5b6475); }
  .sp-values b { color: var(--color-text-heading, #0f121a); font-weight: 600; }
  .sp-bar { height: 16px; border-radius: 3px; background: var(--color-control-selected, #438af5); }
  .sp-row { display: grid; grid-template-columns: 9rem 3.5rem 1fr; align-items: center; gap: 12px; padding: 6px 0; font-size: 13px; border-bottom: 1px solid var(--color-border-divider, #e6eaf1); }
  .sp-row code { font-size: 12px; }
  `,
];

/** Docs only: prints the layout spacing values in effect at this screen width. */
@Component({
  selector: 'app-spacing-values',
  template: `<p class="sp-values">@for (v of values(); track v[0]) {<span>{{ v[0] }} <b>{{ v[1] }}</b></span>}</p>`,
  styles: `
    .sp-values { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0 0 12px; font-size: 13px; color: var(--color-text-label, #5b6475); }
    .sp-values b { color: var(--color-text-heading, #0f121a); font-weight: 600; }
  `,
})
class SpacingValuesComponent {
  protected readonly values = signal<[string, string][]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const read = () => {
        const cs = getComputedStyle(this.host.nativeElement);
        this.values.set(LAYOUT.map((name) => [name, cs.getPropertyValue(`--exos-space-${name}`).trim()]));
      };
      read();
      window.addEventListener('resize', read);
    });
  }
}

const meta: Meta = {
  title: 'Foundations/Spacing',
  decorators: [moduleMetadata({ imports: [ButtonComponent, InputComponent, SpacingValuesComponent] })],
  parameters: { a11y: { test: 'error' }, controls: { disable: true } },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj;

/** The scale, drawn to size. */
export const Scale: Story = {
  render: () => ({
    styles: DEMO_STYLES,
    template: SCALE.map(
      ([step, px]) =>
        `<div class="sp-row"><code>--exos-spacing-${step}</code><span>${px}px</span><span class="sp-bar" style="width: var(--exos-spacing-${step})"></span></div>`,
    ).join(''),
  }),
};

/** A page section built with the layout spacing; the shaded areas are the space. */
export const InUse: Story = {
  render: () => ({
    styles: DEMO_STYLES,
    template: `
<app-spacing-values />
<div class="sp-gaps" style="display: flex; flex-direction: column; gap: var(--exos-space-section)">
  <section class="sp-gaps" style="display: flex; flex-direction: column; gap: var(--exos-space-group)">
    <h2 class="h5 mb-0 sp-white">Delivery</h2>
    <div class="sp-card sp-gaps" style="padding: var(--exos-space-inset)">
      <div class="sp-gaps" style="display: flex; flex-direction: column; gap: var(--exos-space-stack)">
        <app-input class="sp-white" label="Street address" autocomplete="street-address" />
        <app-input class="sp-white" label="City" autocomplete="address-level2" />
        <div class="sp-gaps" style="display: flex; flex-wrap: wrap; gap: var(--exos-space-controls)">
          <app-button class="sp-white" label="Save address" />
          <app-button class="sp-white" variant="secondary" label="Cancel" />
        </div>
      </div>
    </div>
  </section>
  <section class="sp-gaps" style="display: flex; flex-direction: column; gap: var(--exos-space-group)">
    <h2 class="h5 mb-0 sp-white">Payment</h2>
    <div class="sp-card sp-white" style="padding: var(--exos-space-inset)">Card ending 4242</div>
  </section>
</div>`,
  }),
};

/** Do / Don't: related things close, groups apart. */
export const DoGroupBySpace: Story = {
  render: () => ({ template: `
<div style="width: 15rem; margin: 0 auto; display: flex; flex-direction: column; gap: var(--exos-spacing-07)">
  <div style="display: flex; flex-direction: column; gap: var(--exos-spacing-02)"><b>Delivery</b><span>12 Main St, Portland</span></div>
  <div style="display: flex; flex-direction: column; gap: var(--exos-spacing-02)"><b>Payment</b><span>Card ending 4242</span></div>
</div>` }),
};
export const DontEvenSpace: Story = {
  render: () => ({ template: `
<div style="width: 15rem; margin: 0 auto; display: flex; flex-direction: column; gap: var(--exos-spacing-05)">
  <b>Delivery</b><span>12 Main St, Portland</span><b>Payment</b><span>Card ending 4242</span>
</div>` }),
};
export const DoTokens: Story = {
  render: () => ({ template: `<div style="width: 19rem; max-width: 100%; margin: 0 auto"><pre class="mb-0 small"><code>gap: var(--exos-space-stack);
padding: var(--exos-space-inset);</code></pre></div>` }),
};
export const DontMagicNumbers: Story = {
  render: () => ({ template: `<div style="width: 19rem; max-width: 100%; margin: 0 auto"><pre class="mb-0 small"><code>gap: 22px;
padding: 15px 18px 13px;</code></pre></div>` }),
};

/** The layout spacing is the phone value below 672px and the web value above. */
export const TestValues: Story = {
  name: 'Test · Layout spacing values',
  render: () => ({ template: `<app-spacing-values />` }),
  play: async ({ canvasElement }) => {
    const web = canvasElement.ownerDocument.defaultView!.innerWidth >= 672;
    const text = within(canvasElement);
    await waitFor(() => expect(text.getByText(/section/)).toBeInTheDocument());
    await expect(canvasElement.textContent).toContain(web ? 'section 48px' : 'section 32px');
    await expect(canvasElement.textContent).toContain(web ? 'controls 8px' : 'controls 12px');
  },
};
