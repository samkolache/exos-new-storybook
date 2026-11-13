import { Component, ElementRef, ViewEncapsulation, afterNextRender, inject, input, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, waitFor } from 'storybook/test';
import { ButtonComponent } from '../../components/button/button';
import { InputComponent } from '../../components/input/input';
import { NotificationComponent } from '../../components/notification/notification';
import { TagComponent } from '../../components/tag/tag';

/** Every ramp runs 10 (lightest) to 100 (darkest). */
const STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

/** Figma Color system v2, section 02: what each family is for. */
const FAMILIES: Record<string, string> = {
  blue: 'Brand accent',
  slate: 'Neutral and Ink',
  lime: 'Support',
  yellow: 'Support (warm)',
  amber: 'Spark and attention',
  green: 'Success only',
  red: 'Danger only',
  gray: 'Imagery only. UI uses Slate',
};

/** [token, light → dark primitives, use]. Values are read live from the theme. */
type Row = [string, string, string];
const SEMANTIC: Record<string, Row[]> = {
  surface: [
    ['surface-page', 'slate/10 → slate/100', 'App background'],
    ['surface-card', 'base/white → slate/90', 'Cards, sheets, inputs'],
    ['surface-raised', 'base/white → slate/80', 'Popovers, menus'],
    ['surface-subtle', 'slate/20 → slate/100', 'Insets, tracks, hover'],
    ['surface-tint', 'blue/10 → blue/90', 'Brand-tinted panels, small'],
    ['surface-selected', 'blue/20 → blue/80', 'Selected rows, items'],
    ['surface-inverse', 'slate/90 → slate/10', 'Tooltips, snackbars'],
    ['surface-glass', 'alpha/white-72 → alpha/white-8', 'Floating chrome only: tab bar, search'],
  ],
  text: [
    ['text-primary', 'slate/90 → slate/10', 'Headlines, body, icons'],
    ['text-secondary', 'slate/60 → slate/40', 'Supporting text, meta'],
    ['text-placeholder', 'slate/50 → slate/50', 'Placeholder, disabled'],
    ['text-link', 'blue/60 → blue/30', 'Links (AA on white)'],
    ['text-on-color', 'base/white → base/white', 'Text on filled colour'],
  ],
  border: [
    ['border-subtle', 'slate/20 → alpha/white-8', 'Card edges, dividers'],
    ['border-default', 'slate/30 → alpha/white-15', 'Inputs, outlined buttons'],
    ['border-strong', 'slate/50 → slate/60', 'Emphasis, dark-mode edges'],
  ],
  brand: [
    ['brand-primary', 'slate/90 → slate/10', 'Ink: wordmark, primary'],
    ['brand-accent', 'blue/50 → blue/40', 'Blue: marks, icons, data'],
    ['brand-accent-strong', 'blue/60 → blue/30', 'Blue: text, filled buttons'],
    ['brand-support', 'lime/50 → lime/40', 'Lime: progress, small tiles'],
    ['brand-spark', 'amber/50 → amber/40', 'Amber: one spark'],
  ],
  action: [
    ['action-primary', 'slate/90 → slate/10', 'Primary button'],
    ['action-primary-hover', 'slate/80 → slate/20', 'Hover'],
    ['action-primary-pressed', 'slate/100 → slate/30', 'Pressed'],
    ['action-primary-disabled', 'slate/30 → slate/70', 'Disabled'],
    ['action-selected-bg', 'blue/10 → blue/90', 'Selected option bg'],
    ['action-selected-border', 'blue/50 → blue/40', 'Selected option border'],
    ['action-focus-border', 'blue/60 → blue/30', 'Focus border'],
    ['action-danger', 'red/60 → red/40', 'Destructive'],
  ],
  feedback: [
    ['feedback-positive-solid', 'green/50 → green/40', 'Success dot, icon'],
    ['feedback-positive-bg', 'green/10 → green/90', 'Success chip bg'],
    ['feedback-attention-solid', 'amber/50 → amber/40', 'Attention dot, icon'],
    ['feedback-attention-bg', 'amber/10 → amber/90', 'Attention chip bg'],
    ['feedback-negative-solid', 'red/60 → red/40', 'Error dot, icon'],
    ['feedback-negative-bg', 'red/10 → red/90', 'Error chip bg'],
    ['feedback-info-solid', 'blue/50 → blue/40', 'Info dot (shares Blue)'],
    ['feedback-ai-solid', 'blue/50 → blue/40', 'AI marker'],
  ],
};

/** Figma section 04: component tokens and the semantic token each points to. */
const COMPONENT: [string, [string, string][]][] = [
  ['Button', [
    ['button-primary-bg', 'action-primary'], ['button-primary-bg-hover', 'action-primary-hover'],
    ['button-primary-bg-pressed', 'action-primary-pressed'], ['button-primary-bg-disabled', 'action-primary-disabled'],
    ['button-primary-text', 'action-on-primary'], ['button-primary-start', 'action-primary-start'],
    ['button-primary-end', 'action-primary-end'], ['button-primary-hover-start', 'action-primary-hover-start'],
    ['button-primary-hover-end', 'action-primary-hover-end'], ['button-primary-pressed-start', 'action-primary-pressed-start'],
    ['button-primary-pressed-end', 'action-primary-pressed-end'], ['button-primary-edge', 'action-primary-edge'],
    ['button-secondary-bg', 'surface-card'], ['button-secondary-bg-hover', 'surface-subtle'],
    ['button-secondary-border', 'border-default'], ['button-secondary-text', 'text-primary'],
    ['button-danger-bg', 'action-danger'], ['button-danger-text', 'text-on-color'],
    ['button-accent-bg', 'brand-accent-strong'], ['button-text-text', 'brand-accent-strong'],
    ['button-text-text-hover', 'action-link-hover'], ['button-text-bg-hover', 'action-secondary-hover'],
  ]],
  ['Link', [['link-text', 'action-link'], ['link-text-hover', 'action-link-hover']]],
  ['Input', [
    ['input-bg', 'surface-card'], ['input-border', 'border-default'], ['input-border-focus', 'action-focus-border'],
    ['input-focus-ring', 'action-focus-ring'], ['input-text', 'text-primary'], ['input-placeholder', 'text-placeholder'],
  ]],
  ['Card', [
    ['card-bg', 'surface-card'], ['card-border', 'border-subtle'],
    ['card-hero-start', 'gradient-blue-strong-start'], ['card-hero-end', 'gradient-blue-strong-end'],
    ['card-support-start', 'gradient-lime-strong-start'], ['card-support-end', 'gradient-lime-strong-end'],
  ]],
  ['Nav', [
    ['nav-bg', 'surface-card'], ['nav-item-text', 'text-secondary'],
    ['nav-item-active-bg', 'surface-subtle'], ['nav-item-active-text', 'text-primary'],
  ]],
  ['Chip', [
    ['chip-bg', 'surface-card'], ['chip-border', 'border-default'], ['chip-text', 'text-primary'],
    ['chip-selected-bg', 'action-selected-bg'], ['chip-selected-border', 'action-selected-border'],
  ]],
  ['Badge', [
    ['badge-success-bg', 'feedback-positive-bg'], ['badge-success-text', 'feedback-positive-text'],
    ['badge-warning-bg', 'feedback-attention-bg'], ['badge-warning-text', 'feedback-attention-text'],
    ['badge-danger-bg', 'feedback-negative-bg'], ['badge-danger-text', 'feedback-negative-text'],
    ['badge-neutral-bg', 'feedback-neutral-bg'], ['badge-neutral-text', 'feedback-neutral-text'],
  ]],
  ['Progress and chart', [
    ['progress-track', 'surface-subtle'], ['progress-fill', 'brand-accent'],
    ['chart-highlight', 'brand-accent'], ['chart-base', 'surface-subtle'],
  ]],
  ['Tab bar and avatar', [
    ['tab-bar-bg', 'surface-glass'], ['tab-bar-item-active', 'action-primary'],
    ['avatar-start', 'gradient-blue-soft-start'], ['avatar-end', 'gradient-blue-soft-end'],
  ]],
];

/** Figma section 05: the only gradients in the system. [name, token, use]. */
const GRADIENTS: [string, string, string][] = [
  ['Brand hero', 'blue-strong', 'Hero, onboarding, AI summary'],
  ['Brand soft', 'blue-soft', 'Avatars, small tiles'],
  ['Support hero', 'lime-strong', 'Goal, progress, celebration'],
  ['Fresh blend', 'blend-soft', 'Condition and summary tiles'],
  ['Spark soft', 'amber-soft', 'One warm chip or tile'],
  ['Gentle setback', 'coral-soft', 'Missed items, redo; not errors'],
  ['Calm', 'slate-soft', 'Loading, empty, quiet'],
];

/** Text tokens and the background they're meant for: each must reach 4.5:1. */
const TEXT_PAIRS: [string, string][] = [
  ['text-primary', 'surface-card'],
  ['text-primary', 'surface-page'],
  ['text-secondary', 'surface-card'],
  ['text-secondary', 'surface-page'],
  ['text-link', 'surface-card'],
  ['action-link-hover', 'surface-card'],
  ['feedback-positive-text', 'feedback-positive-bg'],
  ['feedback-attention-text', 'feedback-attention-bg'],
  ['feedback-negative-text', 'feedback-negative-bg'],
  ['feedback-neutral-text', 'feedback-neutral-bg'],
  ['feedback-info-text', 'surface-tint'],
  ['feedback-negative-solid', 'surface-card'],
  ['text-on-color', 'action-primary'],
  ['text-on-color', 'action-danger'],
  ['text-on-color', 'brand-accent-strong'],
  ['text-inverse', 'status-complete'],
];

function luminance(rgb: string): number {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map((n) => {
    const c = Number(n) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Turns any CSS colour into rgb() by letting the browser resolve it. */
function resolve(host: HTMLElement, value: string): string {
  const probe = document.createElement('span');
  probe.style.color = value;
  host.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  return rgb;
}

/** A hex for a CSS colour: rgb(a) from the browser, shown as #RRGGBB (+ alpha %). */
function hex(rgb: string): string {
  const [r, g, b, a] = (rgb.match(/[\d.]+/g) ?? []).map(Number);
  const h = '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
  return a !== undefined && a < 1 ? `${h} ${Math.round(a * 100)}%` : h;
}

const DEMO_STYLES = [
  `
  .co-ramp { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: var(--exos-spacing-02); margin-bottom: var(--exos-spacing-06); }
  .co-name { font-size: 13px; font-weight: 600; color: var(--color-text-primary); margin: 0 0 var(--exos-spacing-03); }
  .co-name span { font-weight: 400; color: var(--color-text-secondary); }
  .co-chip { height: 56px; border-radius: var(--exos-radius-02); box-shadow: inset 0 0 0 1px var(--color-border-subtle); }
  .co-step { font-size: 12px; color: var(--color-text-secondary); margin-top: var(--exos-spacing-02); line-height: 1.3; }
  .co-step b { display: block; color: var(--color-text-primary); font-weight: 600; }
  .co-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .co-table th { text-align: left; font-weight: 600; color: var(--color-text-secondary); padding: var(--exos-spacing-03) var(--exos-spacing-04) var(--exos-spacing-03) 0; border-bottom: 1px solid var(--color-border-default); }
  .co-table td { padding: var(--exos-spacing-03) var(--exos-spacing-04) var(--exos-spacing-03) 0; border-bottom: 1px solid var(--color-border-subtle); vertical-align: middle; color: var(--color-text-primary); }
  .co-table code { font-size: 12px; }
  .co-sw { display: inline-flex; align-items: center; gap: var(--exos-spacing-03); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .co-sw i { width: 20px; height: 20px; border-radius: var(--exos-radius-01); box-shadow: inset 0 0 0 1px rgba(15, 18, 26, 0.12); flex-shrink: 0;
    background-image: linear-gradient(45deg, #e6eaf1 25%, transparent 25%, transparent 75%, #e6eaf1 75%), linear-gradient(45deg, #e6eaf1 25%, transparent 25%, transparent 75%, #e6eaf1 75%);
    background-size: 8px 8px; background-position: 0 0, 4px 4px; position: relative; }
  .co-sw i::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: var(--sw); }
  .co-group { margin: var(--exos-spacing-06) 0 var(--exos-spacing-03); font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
  .co-group:first-child { margin-top: 0; }
  @media (max-width: 671.98px) { .co-table .co-hide { display: none; } }
  `,
];

/** Docs only: one ramp, with each hex read live from the theme. */
@Component({
  selector: 'app-color-ramp',
  template: `
    <p class="co-name">{{ family() }} <span>· {{ role() }}</span></p>
    <div class="co-ramp">
      @for (s of swatches(); track s[0]) {
        <div>
          <div class="co-chip" [style.background]="'var(--primitive-' + family() + '-' + s[0] + ')'"></div>
          <div class="co-step"><b>{{ s[0] }}</b>{{ s[1] }}</div>
        </div>
      }
    </div>
  `,
  styles: DEMO_STYLES,
  encapsulation: ViewEncapsulation.None,
})
class ColorRampComponent {
  readonly family = input.required<string>();
  protected readonly role = signal('');
  protected readonly swatches = signal<[number, string][]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const cs = getComputedStyle(this.host.nativeElement);
      this.role.set(FAMILIES[this.family()] ?? '');
      this.swatches.set(STEPS.map((s) => [s, cs.getPropertyValue(`--primitive-${this.family()}-${s}`).trim().toUpperCase()]));
    });
  }
}

/** Docs only: a semantic token group, light and dark side by side, read live. */
@Component({
  selector: 'app-semantic-table',
  template: `
    <div class="exos-theme-dcfc" data-bs-theme="dark" #dark hidden></div>
    <table class="co-table">
      <thead><tr><th>Token</th><th>Light</th><th>Dark</th><th class="co-hide">Light → dark</th><th>Use</th></tr></thead>
      <tbody>
        @for (r of rows(); track r.name) {
          <tr>
            <td><code>--color-{{ r.name }}</code></td>
            <td><span class="co-sw"><i [style.--sw]="r.light"></i>{{ r.lightHex }}</span></td>
            <td><span class="co-sw"><i [style.--sw]="r.dark"></i>{{ r.darkHex }}</span></td>
            <td class="co-hide">{{ r.chain }}</td>
            <td>{{ r.use }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: DEMO_STYLES,
  encapsulation: ViewEncapsulation.None,
})
class SemanticTableComponent {
  readonly group = input.required<string>();
  protected readonly rows = signal<{ name: string; chain: string; use: string; light: string; dark: string; lightHex: string; darkHex: string }[]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      const darkEl = el.querySelector<HTMLElement>('[data-bs-theme="dark"]')!;
      this.rows.set(
        SEMANTIC[this.group()].map(([name, chain, use]) => {
          const light = resolve(el, `var(--color-${name})`);
          const dark = resolve(darkEl, `var(--color-${name})`);
          return { name, chain, use, light, dark, lightHex: hex(light), darkHex: hex(dark) };
        }),
      );
    });
  }
}

/** Docs only: component tokens, grouped by component, with the semantic token each follows. */
@Component({
  selector: 'app-component-tokens',
  template: `
    @for (g of groups(); track g.name) {
      <p class="co-group">{{ g.name }}</p>
      <table class="co-table">
        <thead><tr><th>Token</th><th>Points to</th><th>Value</th></tr></thead>
        <tbody>
          @for (r of g.rows; track r[0]) {
            <tr>
              <td><code>--color-{{ r[0] }}</code></td>
              <td><code>{{ r[1] }}</code></td>
              <td><span class="co-sw"><i [style.--sw]="r[2]"></i>{{ r[3] }}</span></td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: DEMO_STYLES,
  encapsulation: ViewEncapsulation.None,
})
class ComponentTokensComponent {
  protected readonly groups = signal<{ name: string; rows: [string, string, string, string][] }[]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      this.groups.set(
        COMPONENT.map(([name, rows]) => ({
          name,
          rows: rows.map(([token, to]) => {
            const v = resolve(el, `var(--color-${token})`);
            return [token, to, v, hex(v)] as [string, string, string, string];
          }),
        })),
      );
    });
  }
}

/** Docs only: lists each text token's contrast on its background, read live. */
@Component({
  selector: 'app-contrast-check',
  template: `<ul class="list-unstyled mb-0 small">@for (r of rows(); track r) {<li>{{ r }}</li>}</ul>`,
})
class ContrastCheckComponent {
  protected readonly rows = signal<string[]>([]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      const rgb = (token: string) => resolve(el, `var(--color-${token})`);
      this.rows.set(TEXT_PAIRS.map(([fg, bg]) => `${fg} on ${bg}: ${contrast(rgb(fg), rgb(bg)).toFixed(2)}`));
    });
  }
}

const meta: Meta = {
  title: 'Foundations/Colors',
  decorators: [
    moduleMetadata({
      imports: [
        ButtonComponent, InputComponent, NotificationComponent, TagComponent,
        ColorRampComponent, SemanticTableComponent, ComponentTokensComponent, ContrastCheckComponent,
      ],
    }),
  ],
  parameters: { a11y: { test: 'error' }, controls: { disable: true } },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj;

/** A small screen built only from semantic colour tokens. */
export const InUse: Story = {
  render: () => ({
    template: `
<div style="display: flex; flex-direction: column; gap: var(--exos-space-group); color: var(--color-text-primary); background: var(--color-surface-page); padding: var(--exos-space-inset); border-radius: var(--exos-radius-04)">
  <div>
    <h2 class="h5 mb-1">Delivery</h2>
    <p class="mb-0" style="color: var(--color-text-secondary)">We'll send updates to this address. <a href="#" style="color: var(--color-text-link)">Change</a></p>
  </div>
  <div style="display: flex; flex-wrap: wrap; gap: var(--exos-space-related)">
    <app-tag label="Waiting" color="info" />
    <app-tag label="Needs review" color="attention" />
    <app-tag label="Draft" />
  </div>
  <div style="display: flex; flex-direction: column; gap: var(--exos-space-stack); background: var(--color-card-bg); border: 1px solid var(--color-card-border); border-radius: var(--exos-radius-04); padding: var(--exos-space-inset)">
    <app-input label="Street address" placeholder="12 Main St" autocomplete="street-address" />
    <app-input label="Postcode" state="invalid" feedback="Enter a postcode like 97201." autocomplete="postal-code" />
  </div>
  <app-notification kind="success" title="Address saved" message="Your next order will go here." />
  <div style="display: flex; flex-wrap: wrap; gap: var(--exos-space-controls)">
    <app-button label="Save address" />
    <app-button variant="secondary" label="Cancel" />
  </div>
</div>`,
  }),
};

/** The four layers and the example chain. */
export const Layers: Story = {
  render: () => ({
    styles: [
      `
      .co-layers { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--exos-spacing-04); }
      .co-layer { padding: var(--exos-spacing-05); border-radius: var(--exos-radius-03); background: var(--color-surface-page); border: 1px solid var(--color-border-subtle); }
      .co-layer b { display: block; font-size: 14px; color: var(--color-text-primary); }
      .co-layer span { display: block; font-size: 12px; color: var(--color-text-secondary); margin: var(--exos-spacing-01) 0 var(--exos-spacing-04); }
      .co-layer code { font-size: 12px; }
      .co-layer i { display: block; height: 32px; border-radius: var(--exos-radius-02); margin-bottom: var(--exos-spacing-03); background: var(--primitive-blue-60); }
      @media (max-width: 671.98px) { .co-layers { grid-template-columns: minmax(0, 1fr); } }
      `,
    ],
    template: `
<div class="co-layers">
  <div class="co-layer"><b>1 · Primitive</b><span>Raw ramps, 10–100</span><i></i><code>blue-60</code></div>
  <div class="co-layer"><b>2 · Semantic</b><span>Meaning, light and dark</span><i></i><code>brand-accent-strong</code></div>
  <div class="co-layer"><b>3 · Component</b><span>Decisions per component</span><i></i><code>button-accent-bg</code></div>
  <div class="co-layer"><b>4 · Extended</b><span>Data viz and illustration</span><i style="background: var(--color-chart-category-1)"></i><code>chart-category-1</code></div>
</div>`,
  }),
};

/** How much of a screen each role may cover: a typical product screen. */
export const Coverage: Story = {
  render: () => ({
    styles: [
      `
      .co-bar { display: flex; height: 48px; border-radius: var(--exos-radius-03); overflow: hidden; box-shadow: inset 0 0 0 1px var(--color-border-subtle); }
      .co-bar > div { display: flex; align-items: flex-end; padding: var(--exos-spacing-02) var(--exos-spacing-03); font-size: 12px; font-weight: 600; }
      .co-legend { display: flex; flex-wrap: wrap; gap: var(--exos-spacing-02) var(--exos-spacing-05); margin-top: var(--exos-spacing-04); font-size: 13px; color: var(--color-text-secondary); }
      .co-legend b { color: var(--color-text-primary); }
      `,
    ],
    template: `
<div class="co-bar" aria-hidden="true">
  <div style="flex: 64; background: var(--color-surface-page); color: var(--color-text-primary)">Paper ~64%</div>
  <div style="flex: 24; background: var(--color-brand-primary); color: var(--color-text-on-color)">Ink ~24%</div>
  <div style="flex: 8; background: var(--color-brand-accent)"></div>
  <div style="flex: 3; background: var(--color-brand-support)"></div>
  <div style="flex: 1; background: var(--color-brand-spark)"></div>
</div>
<div class="co-legend">
  <span><b>Paper</b> 60–70%</span><span><b>Ink</b> 20–25%</span><span><b>Blue</b> 5–10%</span>
  <span><b>Support</b> ≤4%</span><span><b>Spark</b> ≤1%</span><span><b>Feedback</b> 0–5%, only when a state exists</span>
</div>`,
  }),
};

const ramps = (names: string[]) => names.map((n) => `<app-color-ramp family="${n}" />`).join('');

/** Brand ramps: Blue and Slate. */
export const PaletteBrand: Story = { render: () => ({ template: ramps(['blue', 'slate']) }) };
/** Support and spark ramps. */
export const PaletteSupport: Story = { render: () => ({ template: ramps(['lime', 'yellow', 'amber']) }) };
/** Feedback ramps: success and danger only. */
export const PaletteFeedback: Story = { render: () => ({ template: ramps(['green', 'red']) }) };
/** Gray: imagery only. */
export const PaletteImagery: Story = { render: () => ({ template: ramps(['gray']) }) };

/** Base and alpha. */
export const PaletteBase: Story = {
  render: () => ({
    styles: DEMO_STYLES,
    template: `
<div class="co-ramp" style="grid-template-columns: repeat(5, minmax(0, 1fr))">
  ${[
    ['base-white', 'base/white'], ['base-black', 'base/black'], ['white-a72', 'alpha/white-72'],
    ['slate-90-a50', 'alpha/slate-50'], ['blue-50-a40', 'alpha/blue-40'],
  ].map(([v, n]) => `<div><div class="co-chip" style="background: var(--primitive-${v}); background-image: none"></div><div class="co-step"><b>${n}</b></div></div>`).join('')}
</div>`,
  }),
};

export const SemanticSurface: Story = { render: () => ({ template: `<app-semantic-table group="surface" />` }) };
export const SemanticText: Story = { render: () => ({ template: `<app-semantic-table group="text" />` }) };
export const SemanticBorder: Story = { render: () => ({ template: `<app-semantic-table group="border" />` }) };
export const SemanticBrand: Story = { render: () => ({ template: `<app-semantic-table group="brand" />` }) };
export const SemanticAction: Story = { render: () => ({ template: `<app-semantic-table group="action" />` }) };
export const SemanticFeedback: Story = { render: () => ({ template: `<app-semantic-table group="feedback" />` }) };

/** Component tokens, read live. */
export const ComponentTokens: Story = { render: () => ({ template: `<app-component-tokens />` }) };

/** The approved gradient surfaces. */
export const Gradients: Story = {
  render: () => ({
    styles: [
      `
      .co-grads { display: grid; grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: var(--exos-spacing-05); }
      .co-grad { padding: var(--exos-spacing-05); min-height: 7.5rem; border-radius: var(--exos-radius-04); color: var(--color-text-primary); display: flex; flex-direction: column; justify-content: flex-end; }
      .co-grad b { font-size: 14px; }
      .co-grad span { font-size: 12px; }
      .co-grad code { font-size: 11px; margin-top: var(--exos-spacing-02); background: none; color: inherit; }
      `,
    ],
    template: `<div class="co-grads">${GRADIENTS.map(
      ([name, t, use]) =>
        `<div class="co-grad" style="background: linear-gradient(135deg, var(--color-gradient-${t}-start), var(--color-gradient-${t}-end))"><b>${name}</b><span>${use}</span><code>gradient-${t}</code></div>`,
    ).join('')}</div>`,
  }),
};

/** Do / Don't: semantic tokens, not raw values. */
export const DoSemantic: Story = {
  render: () => ({ template: `<div style="width: 19rem; max-width: 100%; margin: 0 auto"><pre class="mb-0 small"><code>color: var(--color-text-secondary);
border-color: var(--color-border-default);</code></pre></div>` }),
};
export const DontRawValues: Story = {
  render: () => ({ template: `<div style="width: 19rem; max-width: 100%; margin: 0 auto"><pre class="mb-0 small"><code>color: #5B6475;
border-color: var(--primitive-slate-30);</code></pre></div>` }),
};

/** Do / Don't: Ink is the only filled primary; Blue is a text button. */
export const DoInkPrimary: Story = {
  render: () => ({ template: `<div style="display: flex; gap: var(--exos-spacing-03); justify-content: center"><app-button label="Confirm" /><a href="#" class="btn btn-link" style="color: var(--color-button-text-text)">View report</a></div>` }),
};
export const DontBlueFilled: Story = {
  render: () => ({ template: `<div style="display: flex; justify-content: center"><button type="button" class="btn rounded-pill" style="background: var(--color-brand-accent-strong); color: var(--color-text-on-color)">Confirm</button></div>` }),
};

/** Do / Don't: colour plus an icon and words. */
export const DoColorAndText: Story = {
  render: () => ({ template: `<div style="width: 17rem; margin: 0 auto"><app-input label="Postcode" state="invalid" feedback="Enter a postcode like 97201." /></div>` }),
};
export const DontColorOnly: Story = {
  render: () => ({ template: `
<div style="width: 17rem; margin: 0 auto">
  <label class="form-label" for="co-only">Postcode</label>
  <input id="co-only" class="form-control" style="border-color: var(--color-feedback-negative-solid)" value="9720" />
</div>` }),
};

/** Every text token reaches 4.5:1 on the background it's meant for. */
export const TestContrast: Story = {
  name: 'Test · Text contrast',
  render: () => ({ template: `<app-contrast-check />` }),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('li').length).toBe(TEXT_PAIRS.length));
    for (const li of Array.from(canvasElement.querySelectorAll('li'))) {
      const ratio = Number(li.textContent!.split(': ')[1]);
      await expect(ratio, li.textContent!).toBeGreaterThanOrEqual(4.5);
    }
  },
};
