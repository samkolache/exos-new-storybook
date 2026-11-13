import { Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { ButtonComponent } from '../../components/button/button';

type Row = { label: string; code: string; html: string; use: string };

/** Every type style, largest first, with what it's for. The HTML is plain Bootstrap plus one class. */
const ROWS: Row[] = [
  { label: 'Display L', code: '.exos-display-l', html: '<p class="exos-display-l mb-0">Plan your week</p>', use: 'Hero headline. One per view' },
  { label: 'Display M', code: '.exos-display-m', html: '<p class="exos-display-m mb-0">Transfer sent</p>', use: 'Summary and success titles' },
  { label: 'Display S', code: '.exos-display-s', html: '<p class="exos-display-s mb-0">Cash forecast</p>', use: 'Section hero on large screens' },
  { label: 'Heading L', code: '<h1>, .exos-heading-l', html: '<h1 class="mb-0">Invoices</h1>', use: 'Page title. Smallest Raleway' },
  { label: 'Heading M', code: '<h2>, .exos-heading-m', html: '<h2 class="mb-0">This week</h2>', use: 'Section and sheet titles' },
  { label: 'Heading S', code: '<h3>–<h6>, .exos-heading-s', html: '<h3 class="mb-0">Trip to Kyoto</h3>', use: 'Card and list titles' },
  { label: 'Number L', code: '.exos-number-l', html: '<p class="exos-number-l mb-0">$12,480.32</p>', use: 'Balances, hero figures' },
  { label: 'Number M', code: '.exos-number-m', html: '<p class="exos-number-m mb-0">$48,210</p>', use: 'KPI values' },
  { label: 'Number S', code: '.exos-number-s', html: '<p class="exos-number-s mb-0">64%</p>', use: 'Totals, inline figures' },
  { label: 'Body L', code: '<p>, .exos-body-l', html: '<p class="mb-0">Two clients usually pay late. Send reminders today to stay on track this month.</p>', use: 'Page text, lead paragraphs' },
  { label: 'Body M', code: '.exos-body-m, .small', html: '<p class="exos-body-m mb-0">Arrives today by 5 PM.</p>', use: 'Dense UI text' },
  { label: 'Body S', code: '.exos-body-s', html: '<p class="exos-body-s mb-0">Card expired. Update and retry.</p>', use: 'Card descriptions, helper text' },
  { label: 'Caption', code: '.exos-caption', html: '<p class="exos-caption mb-0">Nov 18 · Studio rental</p>', use: 'Metadata, timestamps' },
  { label: 'Label L', code: '.exos-label-l', html: '<p class="exos-label-l mb-0">Confirm transfer</p>', use: 'Primary buttons' },
  { label: 'Label M', code: '.exos-label-m', html: '<p class="exos-label-m mb-0">Request</p>', use: 'Secondary buttons, list items' },
  { label: 'Label S', code: '.exos-label-s', html: '<p class="exos-label-s mb-0">View all invoices</p>', use: 'Chips, links, small buttons' },
  { label: 'Eyebrow M', code: '.exos-eyebrow-m', html: '<p class="exos-eyebrow-m mb-0">Total balance</p>', use: 'Section eyebrows' },
  { label: 'Eyebrow S', code: '.exos-eyebrow-s', html: '<p class="exos-eyebrow-s mb-0">Draft</p>', use: 'Badges, tags' },
  { label: 'Code', code: '.exos-code', html: '<p class="exos-code mb-0">INV-1042</p>', use: 'IDs, reference numbers' },
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
          <span>{{ row.use }}</span>
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
            const ls = cs.letterSpacing === 'normal' ? '0' : px(cs.letterSpacing);
            return `${family} · ${px(cs.fontSize)} / ${px(cs.lineHeight)} · ${cs.fontWeight} · ${ls}`;
          }),
        );
      };
      read();
      // Re-measure once the web fonts have loaded.
      document.fonts?.ready.then(read);
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

/** A Raleway headline anchors the view; Geist does the work. */
export const InUse: Story = {
  render: () => ({
    styles: STYLES,
    template: `
<div class="ty-card" style="display: flex; flex-direction: column; gap: var(--exos-spacing-05); max-width: 26rem">
  <div>
    <p class="exos-eyebrow-m mb-1" style="color: var(--color-text-secondary)">Total balance</p>
    <p class="exos-number-l mb-0">$12,480.32</p>
  </div>
  <div>
    <h1 class="exos-display-m mb-1">Plan your week</h1>
    <p class="exos-body-m mb-0" style="color: var(--color-text-secondary)">Three inspections today. First at 9:30 AM, 12 minutes away.</p>
  </div>
  <div>
    <h2 class="exos-heading-s mb-1">Up next</h2>
    <p class="exos-body-s mb-1" style="color: var(--color-text-secondary)">1418 Birch Ct · Exterior and interior</p>
    <p class="exos-code mb-0">INV-1042</p>
  </div>
  <app-button label="Start inspection" />
</div>`,
  }),
};

/** Every style, measured live. */
export const Scale: Story = {
  render: () => ({ template: `<app-type-scale />` }),
};

/** Raleway's weights: Bold by default; SemiBold and Medium for calmer or longer headlines. */
export const RalewayWeights: Story = {
  render: () => ({
    template: `
<div style="display: flex; flex-direction: column; gap: var(--exos-spacing-04)">
  <p class="exos-display-l mb-0">Plan your week <span class="exos-caption" style="color: var(--color-text-secondary)">Bold · default</span></p>
  <p class="exos-display-l exos-type-semibold mb-0">Plan your week <span class="exos-caption" style="color: var(--color-text-secondary)">SemiBold · calmer, longer lines</span></p>
  <p class="exos-display-l exos-type-medium mb-0">Plan your week <span class="exos-caption" style="color: var(--color-text-secondary)">Medium · editorial, quiet</span></p>
</div>`,
  }),
};

// Do / Don't

export const DoOneRaleway: Story = {
  render: () => ({ template: `
<div style="width: 18rem; margin: 0 auto">
  <h1 class="mb-2">Invoices</h1>
  <h2 class="exos-heading-s mb-1">Overdue</h2>
  <p class="exos-body-m mb-0">Two clients usually pay late.</p>
</div>` }),
};
export const DontSmallRaleway: Story = {
  render: () => ({ template: `
<div style="width: 18rem; margin: 0 auto">
  <h1 class="mb-2">Invoices</h1>
  <h2 class="exos-heading-s mb-1" style="font-family: var(--font-heading)">Overdue</h2>
  <button type="button" class="btn btn-primary" style="font-family: var(--font-heading)">Send reminder</button>
</div>` }),
};
export const DoLevels: Story = {
  render: () => ({ template: `
<div style="width: 19rem; max-width: 100%; margin: 0 auto"><pre class="mb-0 small"><code>&lt;h1&gt;Invoices&lt;/h1&gt;
&lt;h2 class="exos-heading-s"&gt;Overdue&lt;/h2&gt;</code></pre></div>` }),
};
export const DontLevels: Story = {
  render: () => ({ template: `
<div style="width: 19rem; max-width: 100%; margin: 0 auto"><pre class="mb-0 small"><code>&lt;h1&gt;Invoices&lt;/h1&gt;
&lt;h5&gt;Overdue&lt;/h5&gt;</code></pre></div>` }),
};
export const DoEyebrowCaps: Story = {
  render: () => ({ template: `<div style="width: 18rem; margin: 0 auto"><p class="exos-eyebrow-m mb-1" style="color: var(--color-text-secondary)">Total balance</p><h2 class="mb-0">This week</h2></div>` }),
};
export const DontCaps: Story = {
  render: () => ({ template: `<div style="width: 18rem; margin: 0 auto"><h2 class="mb-0 text-uppercase">This Week</h2></div>` }),
};
export const DoStyles: Story = {
  render: () => ({ template: `<div style="width: 19rem; max-width: 100%; margin: 0 auto"><pre class="mb-0 small"><code>&lt;p class="exos-body-s"&gt;…&lt;/p&gt;</code></pre></div>` }),
};
export const DontByHand: Story = {
  render: () => ({ template: `<div style="width: 19rem; max-width: 100%; margin: 0 auto"><pre class="mb-0 small"><code>font-size: 13px;
line-height: 1.3;
letter-spacing: 0.4px;</code></pre></div>` }),
};

/** h1 and display styles are Raleway; h2 and below, body, labels and numbers are Geist; eyebrows and code are Geist Mono. */
export const TestFonts: Story = {
  name: 'Test · Type families',
  render: () => ({
    template: `<h1>One</h1><h2>Two</h2><h3>Three</h3><p class="exos-display-l">Display</p><h3 class="exos-heading-l">Three as L</h3><h1 class="h3">One as S</h1><p>Body</p><p class="exos-number-m">48</p><p class="exos-eyebrow-m">Eyebrow</p><p class="exos-code">INV-1</p>`,
  }),
  play: async ({ canvasElement }) => {
    const font = (selector: string) =>
      getComputedStyle(canvasElement.querySelector(selector)!).fontFamily.split(',')[0].replace(/["']/g, '').trim();
    await expect(font('h1:not(.h3)')).toBe('Raleway');
    await expect(font('h2')).toBe('Geist');
    await expect(font('h3:not(.exos-heading-l)')).toBe('Geist');
    await expect(font('.exos-display-l')).toBe('Raleway');
    await expect(font('h3.exos-heading-l')).toBe('Raleway');
    await expect(font('h1.h3')).toBe('Geist');
    await expect(font('p:not([class])')).toBe('Geist');
    await expect(font('.exos-number-m')).toBe('Geist');
    await expect(font('.exos-eyebrow-m')).toBe('Geist Mono');
    await expect(font('.exos-code')).toBe('Geist Mono');
  },
};
