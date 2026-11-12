import { Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { ButtonComponent } from '../../components/button/button';

type Row = { label: string; code: string; html: string };

/** Every text style, largest first. The HTML is plain Bootstrap: the theme does the rest. */
const ROWS: Row[] = [
  { label: 'Heading 1', code: '<h1>, .h1', html: '<h1 class="mb-0">Your claims</h1>' },
  { label: 'Heading 2', code: '<h2>, .h2', html: '<h2 class="mb-0">Open claims</h2>' },
  { label: 'Heading 3', code: '<h3>, .h3', html: '<h3 class="mb-0">Claim 4821</h3>' },
  { label: 'Heading 4', code: '<h4>, .h4', html: '<h4 class="mb-0">Documents</h4>' },
  { label: 'Heading 5', code: '<h5>, .h5', html: '<h5 class="mb-0">Delivery address</h5>' },
  { label: 'Heading 6', code: '<h6>, .h6', html: '<h6 class="mb-0">Last updated</h6>' },
  { label: 'Body', code: '<p>', html: '<p class="mb-0">We review most claims within two working days.</p>' },
  { label: 'Small', code: '<small>, .small', html: '<p class="small mb-0">Updated 2 days ago</p>' },
];

const STYLES = [
  `
  .ty-row { display: grid; grid-template-columns: 11rem minmax(0, 1fr); gap: 4px 24px; align-items: baseline; padding: 16px 0; border-bottom: 1px solid var(--color-border-divider); }
  .ty-meta { display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: var(--color-text-label); }
  .ty-meta b { color: var(--color-text-heading); font-weight: 600; }
  .ty-meta code { font-size: 12px; }
  .ty-card { border: 1px solid var(--color-border-default); border-radius: 12px; padding: var(--exos-space-inset); }
  @media (max-width: 671.98px) { .ty-row { grid-template-columns: minmax(0, 1fr); } }
  `,
];

/** Docs only: each text style with its font, size, line height and weight, measured from the theme. */
@Component({
  selector: 'app-type-scale',
  template: `
    @for (row of rows; track row.label; let i = $index) {
      <div class="ty-row">
        <div class="ty-meta">
          <b>{{ row.label }}</b>
          <code>{{ row.code }}</code>
          <span data-spec>{{ specs()[i] }}</span>
        </div>
        <div data-sample [innerHTML]="row.html"></div>
      </div>
    }
  `,
  styles: STYLES,
})
class TypeScaleComponent {
  protected readonly rows = ROWS;
  protected readonly specs = signal<string[]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const px = (v: string) => `${Math.round(parseFloat(v) * 10) / 10}px`;
      const read = () => {
        const samples = [...this.host.nativeElement.querySelectorAll<HTMLElement>('[data-sample] > *')];
        this.specs.set(
          samples.map((el) => {
            const cs = getComputedStyle(el);
            const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
            return `${family} · ${px(cs.fontSize)} / ${px(cs.lineHeight)} · ${cs.fontWeight}`;
          }),
        );
      };
      read();
      // h1–h4 scale with the screen width, so re-measure on resize.
      window.addEventListener('resize', read);
    });
  }
}

const meta: Meta = {
  title: 'Foundations/Typography',
  decorators: [moduleMetadata({ imports: [ButtonComponent, TypeScaleComponent] })],
  parameters: { a11y: { test: 'error' }, controls: { disable: true } },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj;

/** A page with every level in use: Raleway for the page and section titles, Geist below. */
export const InUse: Story = {
  render: () => ({
    styles: STYLES,
    template: `
<div style="display: flex; flex-direction: column; gap: var(--exos-space-section)">
  <header>
    <h1>Your claims</h1>
    <p class="mb-0">Track your claims and send us anything we ask for.</p>
  </header>
  <section style="display: flex; flex-direction: column; gap: var(--exos-space-group)">
    <h2 class="mb-0">Open claims</h2>
    <div class="ty-card">
      <h3>Claim 4821</h3>
      <p>Water damage to the kitchen ceiling. We need a photo of the damage to carry on.</p>
      <p class="small text-body-secondary">Updated 2 days ago</p>
      <app-button label="Add a photo" />
    </div>
  </section>
</div>`,
  }),
};

/** The full scale, measured live. */
export const Scale: Story = {
  render: () => ({ template: `<app-type-scale />` }),
};

// Do / Don't

export const DoHeadingFont: Story = {
  render: () => ({ template: `
<div style="width: 18rem; margin: 0 auto">
  <h2>Open claims</h2>
  <h3 class="h5">Claim 4821</h3>
  <p class="mb-0">Water damage to the kitchen ceiling.</p>
</div>` }),
};
export const DontHeadingFont: Story = {
  render: () => ({ template: `
<div style="width: 18rem; margin: 0 auto; font-family: var(--font-heading)">
  <h2>Open claims</h2>
  <h3 class="h5" style="font-family: var(--font-heading)">Claim 4821</h3>
  <p class="mb-0">Water damage to the kitchen ceiling.</p>
</div>` }),
};
export const DoLevels: Story = {
  render: () => ({ template: `
<div style="width: 19rem; max-width: 100%; margin: 0 auto"><pre class="mb-0 small"><code>&lt;h1&gt;Your claims&lt;/h1&gt;
&lt;h2 class="h5"&gt;Delivery&lt;/h2&gt;</code></pre></div>` }),
};
export const DontLevels: Story = {
  render: () => ({ template: `
<div style="width: 19rem; max-width: 100%; margin: 0 auto"><pre class="mb-0 small"><code>&lt;h1&gt;Your claims&lt;/h1&gt;
&lt;h5&gt;Delivery&lt;/h5&gt;</code></pre></div>` }),
};
export const DoSentenceCase: Story = {
  render: () => ({ template: `<div style="width: 18rem; margin: 0 auto"><h2 class="mb-0">Open claims</h2></div>` }),
};
export const DontTitleCase: Story = {
  render: () => ({ template: `<div style="width: 18rem; margin: 0 auto"><h2 class="mb-0 text-uppercase">Open Claims</h2></div>` }),
};

/** h1 and h2 are Raleway; h3 and below, and body text, are Geist. The class wins over the tag. */
export const TestFonts: Story = {
  name: 'Test · Heading fonts',
  render: () => ({
    template: `<h1>One</h1><h2>Two</h2><h3>Three</h3><h4>Four</h4><h2 class="h5">Two as five</h2><h3 class="h2">Three as two</h3><p>Body</p>`,
  }),
  play: async ({ canvasElement }) => {
    const font = (selector: string) =>
      getComputedStyle(canvasElement.querySelector(selector)!).fontFamily.split(',')[0].replace(/["']/g, '').trim();
    await expect(font('h1')).toBe('Raleway');
    await expect(font('h2:not(.h5)')).toBe('Raleway');
    await expect(font('h3:not(.h2)')).toBe('Geist');
    await expect(font('h4')).toBe('Geist');
    await expect(font('h3.h2')).toBe('Raleway');
    await expect(font('h2.h5')).toBe('Geist');
    await expect(font('p')).toBe('Geist');
  },
};
