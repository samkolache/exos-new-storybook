import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { ButtonComponent } from '../../components/button/button';
import { RedlinesComponent } from '../redlines';
import { PaddingPartsComponent } from './padding-parts';


const STYLES = [
  `
  .pd-demo { display: flex; flex-direction: column; gap: var(--exos-spacing-05); max-width: 22rem; margin: 0 auto; }
  .pd-card { padding: var(--exos-space-inset); border: 1px solid var(--color-border-default); border-radius: var(--exos-radius-04); background: var(--color-background-page); }
  .pd-rows { display: flex; flex-direction: column; gap: var(--exos-spacing-07); padding: var(--exos-spacing-06) var(--exos-spacing-08); }
  .pd-row { display: flex; justify-content: space-between; padding: var(--exos-spacing-04) var(--exos-spacing-05); border-radius: var(--exos-radius-02); background: var(--color-surface-subtle); }
  `,
];

const meta: Meta = {
  title: 'Foundations/Padding',
  decorators: [moduleMetadata({ imports: [ButtonComponent, PaddingPartsComponent, RedlinesComponent] })],
  parameters: { a11y: { test: 'error' }, controls: { disable: true } },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj;

/** Every part with red spec lines for its padding, measured from the theme at this width. */
export const Measured: Story = { render: () => ({ template: `<app-padding-parts />` }) };

/** Do: a row with 12px top and bottom, 16px sides, shown with spec lines. */
export const DoRowPadding: Story = {
  render: () => ({
    styles: STYLES,
    template: `<app-redlines><div class="pd-demo pd-rows"><div class="pd-row" data-redline-pad><span>Kitchen</span><span>4 photos</span></div><div class="pd-row"><span>Bedroom</span><span>2 photos</span></div></div></app-redlines>`,
  }),
};

/** Don't: text tight to the edge. */
export const DontTight: Story = {
  render: () => ({
    styles: STYLES,
    template: `<div class="pd-demo"><div class="pd-row" style="padding: var(--exos-spacing-01) var(--exos-spacing-02); box-shadow: none"><span>Kitchen</span><span>4 photos</span></div><div class="pd-row" style="padding: var(--exos-spacing-01) var(--exos-spacing-02); box-shadow: none"><span>Bedroom</span><span>2 photos</span></div></div>`,
  }),
};

/** A card with spec lines for its padding (16px on phones, 24px on web). */
export const Surface: Story = {
  render: () => ({
    styles: STYLES,
    template: `<app-redlines><div class="pd-demo"><div class="pd-card" data-redline-pad="inset"><p class="mb-3">Kitchen · 4 photos</p><app-button label="Add photos" size="md" /></div></div></app-redlines>`,
  }),
};
