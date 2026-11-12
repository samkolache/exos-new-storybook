import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { TabItem, TabPanelComponent, TabsComponent } from './tabs';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

const ORDER: TabItem[] = [
  { label: 'Summary', value: 'summary' },
  { label: 'Items', value: 'items', count: 3 },
  { label: 'Shipping', value: 'shipping' },
  { label: 'History', value: 'history' },
];

const VIEWS: TabItem[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

const MANY: TabItem[] = [
  { label: 'Summary', value: 'summary' },
  { label: 'Items', value: 'items' },
  { label: 'Shipping', value: 'shipping' },
  { label: 'Payments', value: 'payments' },
  { label: 'Returns', value: 'returns' },
  { label: 'Messages', value: 'messages' },
  { label: 'History', value: 'history' },
];

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { items: [], value: '', label: '', variant: 'line', fullWidth: false };

const PANELS = `
  <app-tab-panel value="summary"><p class="mb-0">Order 1042 · placed Nov 11 · $86.40</p></app-tab-panel>
  <app-tab-panel value="items"><p class="mb-0">Cotton t-shirt, linen shorts and a canvas bag.</p></app-tab-panel>
  <app-tab-panel value="shipping"><p class="mb-0">Standard, arriving Nov 15 to 18.</p></app-tab-panel>
  <app-tab-panel value="history"><p class="mb-0">Placed, paid, packed.</p></app-tab-panel>`;

const meta: Meta<TabsComponent> = {
  title: 'Components/Tabs',
  component: TabsComponent,
  decorators: [moduleMetadata({ imports: [TabPanelComponent] })],
  parameters: {
    // Accessibility checks fail the tests for tabs (not just a warning).
    a11y: { test: 'error' },
    controls: { exclude: ['baseId', 'buttons', 'controlsOf', 'panels', 'current', 'listClasses', 'onKeydown', 'panelId', 'select', 'tabId'] },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-tabs',
          component: 'TabsComponent',
          importPath: './components/tabs/tabs',
          defaults: DEFAULTS,
          models: ['value'],
          types: { items: 'TabItem[]' },
          listType: 'TabItem[]',
        }),
      },
    },
  },
  argTypes: {
    valueChange: { action: 'valueChange', table: { category: 'outputs' } },
    items: { description: '`{ label, value, disabled?, count? }`.' },
    label: { description: 'Names the tab list for screen readers, like "Order details".' },
    variant: {
      control: 'inline-radio',
      options: ['line', 'segmented'],
      description: 'line: tabs over a section · segmented: a compact switch between views of the same data.',
      table: { defaultValue: { summary: 'line' } },
    },
    fullWidth: { description: 'Segmented only: stretch across the width. Always full width on phones.' },
  },
  args: { items: ORDER, value: 'summary', label: 'Order details', variant: 'line', fullWidth: false },
  render: (args) => ({
    props: args,
    template: `<app-tabs [items]="items" [(value)]="value" [label]="label" [variant]="variant" [fullWidth]="fullWidth">${PANELS}</app-tabs>`,
  }),
};

export default meta;
type Story = StoryObj<TabsComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Tabs' };
const SEGMENTED_RENDER: Story['render'] = (args) => ({
  props: args,
  template: `<app-tabs [items]="items" [(value)]="value" [label]="label" [variant]="variant" [fullWidth]="fullWidth" />`,
});

export const Segmented: Story = {
  args: { items: VIEWS, value: 'week', label: 'Calendar view', variant: 'segmented' },
  render: SEGMENTED_RENDER,
};

// Docs: live demo

export const Overview: Story = { tags: ['!dev'] };

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    parts: [
      { n: 1, target: '[role="tablist"]', side: 'left', whole: true },
      { n: 2, target: '[aria-selected="true"] .exos-tab-label', side: 'top' },
      { n: 3, target: '.exos-tab:nth-child(2) .exos-tab-label', side: 'top' },
      { n: 4, target: '.exos-tab-count', side: 'right', whole: true },
      { n: 5, target: '.exos-tab-panel:not([hidden]) p', side: 'left' },
    ],
  } as Story['args'],
  render: (args) => ({
    props: args,
    template: `<app-anatomy [parts]="parts" width="26rem"><app-tabs [items]="items" value="summary" label="Order details">${PANELS}</app-tabs></app-anatomy>`,
  }),
};

// Docs: one decision each

export const VarLine: Story = { tags: ['!dev'] };
export const VarSegmented: Story = { tags: ['!dev'], args: { items: VIEWS, value: 'week', label: 'Calendar view', variant: 'segmented' }, render: SEGMENTED_RENDER };
export const ModCount: Story = { tags: ['!dev'], args: { value: 'items' } };
export const ModFullWidth: Story = { tags: ['!dev'], args: { items: VIEWS, value: 'week', label: 'Calendar view', variant: 'segmented', fullWidth: true }, render: SEGMENTED_RENDER };
export const ModDisabled: Story = {
  tags: ['!dev'],
  args: {
    items: [
      { label: 'Summary', value: 'summary' },
      { label: 'Items', value: 'items', count: 3 },
      { label: 'Returns', value: 'returns', disabled: true },
    ],
  },
  render: (args) => ({ props: args, template: `<app-tabs [items]="items" [(value)]="value" [label]="label">${PANELS}</app-tabs>` }),
};

// Docs: Do / Don't

export const DoShortLabels: Story = { tags: ['!dev'], args: { items: VIEWS, value: 'week', label: 'Calendar view', variant: 'segmented' }, render: SEGMENTED_RENDER };
export const DontLongLabels: Story = {
  tags: ['!dev'],
  render: SEGMENTED_RENDER,
  args: {
    items: [
      { label: 'Show today’s orders', value: 'day' },
      { label: 'Show this week’s orders', value: 'week' },
      { label: 'Show all orders', value: 'all' },
    ],
    value: 'week',
    label: 'Orders',
    variant: 'segmented',
  },
};
export const DoFewSegments: Story = { tags: ['!dev'], args: { items: VIEWS, value: 'week', label: 'Calendar view', variant: 'segmented' }, render: SEGMENTED_RENDER };
export const DontManySegments: Story = { tags: ['!dev'], args: { items: MANY, value: 'items', label: 'Order', variant: 'segmented' }, render: SEGMENTED_RENDER };

// Docs: edge cases

export const EdgeManyTabs: Story = {
  tags: ['!dev'],
  args: { items: MANY, value: 'summary' },
  render: (args) => ({ props: args, template: `<div style="width: 300px"><app-tabs [items]="items" [(value)]="value" [label]="label" /></div>` }),
};

// Tests (hidden; they still run)

/** Arrow keys move and show, skipping disabled tabs; Home and End jump; one Tab stop. */
export const TestKeyboard: Story = {
  tags: ['!dev'],
  name: 'Test · Keyboard',
  args: { items: ModDisabled.args!.items },
  render: ModDisabled.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs.filter((t) => t.tabIndex === 0)).toHaveLength(1);
    await userEvent.tab();
    await expect(tabs[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}');
    await expect(tabs[0]).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(tabs[1]).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveAccessibleName('Items 3');
  },
};

/** Clicking shows that tab's panel; the others are hidden. */
export const TestPanels: Story = {
  tags: ['!dev'],
  name: 'Test · Panels',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Shipping' }));
    const panel = canvas.getByRole('tabpanel');
    await expect(panel).toHaveTextContent('Standard, arriving Nov 15 to 18.');
    await expect(panel).toHaveAccessibleName('Shipping');
  },
};


// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'size', target: '.exos-tab', side: 'right', label: '{v} tall' },
  { kind: 'style', target: '.exos-tab-label', prop: 'font-size', side: 'top', label: '{v} text' },
  { kind: 'padding', target: '.exos-tab', label: '{v} top and bottom', labelSides: '{v} left and right' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { controls: { disable: true }, example: true, specs: { sizes: false, switches: [] } },
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS, items: ORDER.slice(0, 3) },
    template: `<app-redline [marks]="marks" [scale]="1.3" [key]="false"><div style="width: 22rem; max-width: calc(100vw - 7rem)"><app-tabs [items]="items" value="summary" label="Order details" /></div></app-redline>`,
  }),
};
