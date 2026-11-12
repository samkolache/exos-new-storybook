import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { ButtonComponent } from '../../components/button/button';

const SCALE: [string, string, string][] = [
  ['01', '4px', 'Small marks'],
  ['02', '8px', 'Parts inside a surface'],
  ['03', '12px', 'Small surfaces'],
  ['04', '16px', 'Surfaces'],
  ['05', '20px', 'Large surfaces'],
  ['06', '24px', 'Modals and sheets'],
  ['full', 'Full', 'Controls and circles'],
];

const STYLES = [
  `
  .cr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr)); gap: var(--exos-spacing-05); }
  .cr-tile { display: flex; flex-direction: column; gap: var(--exos-spacing-03); font-size: 0.8125rem; color: var(--color-text-label); }
  .cr-tile b { color: var(--color-text-heading); font-weight: 600; }
  .cr-box { height: 4.5rem; border: 2px solid var(--color-control-selected); background: var(--color-background-selected); }
  .cr-outer { display: flex; flex-direction: column; gap: var(--exos-spacing-03); width: 16rem; margin: 0 auto; padding: var(--exos-spacing-03); background: var(--color-background-page); border: 1px solid var(--color-border-default); }
  .cr-inner { padding: var(--exos-spacing-04) var(--exos-spacing-05); background: var(--color-background-subtle); color: var(--color-text-primary); }
  `,
];

const meta: Meta = {
  title: 'Foundations/Corner radius',
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { a11y: { test: 'error' }, controls: { disable: true } },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj;

/** The scale, drawn to size. */
export const Scale: Story = {
  render: () => ({
    styles: STYLES,
    template: `<div class="cr-grid">${SCALE.map(
      ([step, value, use]) =>
        `<div class="cr-tile"><div class="cr-box" style="border-radius: var(--exos-radius-${step})"></div><span><b>${step}</b> · ${value}<br />${use}</span></div>`,
    ).join('')}</div>`,
  }),
};

/** A menu: 16px surface, 8px items with 8px padding around them (16 − 8 = 8). */
export const DoNested: Story = {
  render: () => ({
    styles: STYLES,
    template: `
<div class="cr-outer" style="border-radius: var(--exos-radius-04)">
  <div class="cr-inner" style="border-radius: var(--exos-radius-02)">Edit photo</div>
  <div class="cr-inner" style="border-radius: var(--exos-radius-02)">Download</div>
</div>`,
  }),
};

/** Same radius inside and out: the inner corners look too round and the gap looks uneven. */
export const DontNested: Story = {
  render: () => ({
    styles: STYLES,
    template: `
<div class="cr-outer" style="border-radius: var(--exos-radius-04)">
  <div class="cr-inner" style="border-radius: var(--exos-radius-04)">Edit photo</div>
  <div class="cr-inner" style="border-radius: var(--exos-radius-04)">Download</div>
</div>`,
  }),
};

export const DoPillControls: Story = {
  render: () => ({ template: `<div class="btn-set justify-content-center"><app-button variant="secondary" label="Cancel" /><app-button label="Save changes" /></div>` }),
};

export const DontSquareControls: Story = {
  render: () => ({
    template: `<div class="btn-set justify-content-center"><button type="button" class="btn btn-secondary btn-lg" style="border-radius: var(--exos-radius-01)">Cancel</button><app-button label="Save changes" /></div>`,
  }),
};
