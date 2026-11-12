import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { ButtonComponent } from '../button/button';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { InlineLoadingComponent, ProgressBarComponent, SpinnerComponent } from './loading';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { label: 'Loading', showLabel: false, size: 'md', overlay: false };

const EXAMPLE = { controls: { disable: true }, example: true };

const meta: Meta<SpinnerComponent> = {
  title: 'Components/Loading',
  component: SpinnerComponent,
  decorators: [moduleMetadata({ imports: [InlineLoadingComponent, ProgressBarComponent, ButtonComponent] })],
  parameters: {
    // Accessibility checks fail the tests for loading (not just a warning).
    a11y: { test: 'error' },
    controls: { exclude: ['classes'] },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({ selector: 'app-spinner', component: 'SpinnerComponent', importPath: './components/loading/loading', defaults: DEFAULTS }),
      },
    },
  },
  argTypes: {
    label: { description: 'What’s loading, read by screen readers: "Loading photos".' },
    showLabel: { description: 'Shows the label under the spinner too.' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm 16px: in a button or row · md 32px: a section · lg 64px: a whole page.',
      table: { defaultValue: { summary: 'md' } },
    },
    overlay: { description: 'Covers the nearest positioned container while it loads.' },
  },
  args: { label: 'Loading photos' },
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Spinner' };
export const InlineLoading: Story = {
  parameters: EXAMPLE,
  render: () => ({ template: `<div class="d-flex flex-column gap-2"><app-inline-loading status="active" label="Saving…" /><app-inline-loading status="finished" label="Saved" /><app-inline-loading status="error" label="Couldn’t save" /></div>` }),
};
export const ProgressBar: Story = {
  parameters: EXAMPLE,
  render: () => ({ template: `<div style="max-width: 24rem"><app-progress-bar label="Uploading 5 photos" [value]="60" helperText="3 of 5 done" /></div>` }),
};

// Docs: live demo

export const Overview: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div class="d-flex flex-column gap-4" style="max-width: 24rem">
  <div class="d-flex align-items-center gap-3">
    <app-button label="Save changes" />
    <app-inline-loading status="active" label="Saving…" />
  </div>
  <app-progress-bar label="Uploading 5 photos" [value]="60" helperText="3 of 5 done" />
  <div class="position-relative rounded-3 border p-4" style="min-height: 140px">
    <p class="mb-1 fw-semibold">Recent orders</p>
    <p class="mb-0 text-body-secondary small">Order 1042 · Order 1041 · Order 1040</p>
    <app-spinner [overlay]="true" label="Loading orders" />
  </div>
</div>` }),
};

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    parts: [
      { n: 1, target: '.exos-progress-label', side: 'left' },
      { n: 2, target: '.exos-progress-value', side: 'right' },
      { n: 3, target: '.exos-progress-fill', side: 'left', whole: true },
      { n: 4, target: '.exos-progress-track', side: 'right', whole: true },
      { n: 5, target: '.exos-progress-helper', side: 'left' },
    ],
  } as Story['args'],
  parameters: EXAMPLE,
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="18rem">
  <app-progress-bar label="Uploading 5 photos" [value]="60" helperText="3 of 5 done" />
</app-anatomy>` }),
};

// Docs: one decision each

export const VarSpinner: Story = { tags: ['!dev'], args: { label: 'Loading photos', showLabel: true } };
export const VarInline: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<div class="d-flex align-items-center gap-3"><app-button label="Save changes" /><app-inline-loading status="active" label="Saving…" /></div>` }),
};
export const VarProgress: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<div style="max-width: 22rem"><app-progress-bar label="Uploading 5 photos" [value]="60" helperText="3 of 5 done" /></div>` }),
};
export const SizeSwitchable: Story = { tags: ['!dev'] };
export const ModOverlay: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div class="position-relative rounded-3 border p-4" style="max-width: 22rem; min-height: 140px">
  <p class="mb-1 fw-semibold">Recent orders</p>
  <p class="mb-0 text-body-secondary small">Order 1042 · Order 1041 · Order 1040</p>
  <app-spinner [overlay]="true" label="Loading orders" />
</div>` }),
};
export const ModIndeterminate: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<div style="max-width: 22rem"><app-progress-bar label="Preparing your report" helperText="This can take a minute." /></div>` }),
};
export const ModSmallBar: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<div style="max-width: 22rem"><app-progress-bar label="kitchen-02.jpg" [value]="35" size="sm" /></div>` }),
};

// Docs: states (visual reference)

export const AllStates: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div class="d-grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr))">
  <app-progress-bar label="In progress" [value]="60" />
  <app-progress-bar label="Can’t measure" />
  <app-progress-bar label="Finished" [value]="100" status="finished" helperText="5 of 5 done" />
  <app-progress-bar label="Failed" [value]="40" status="error" helperText="Connection lost. Try again." />
  <div class="d-flex flex-column gap-2">
    <app-inline-loading status="active" label="Saving…" />
    <app-inline-loading status="finished" label="Saved" />
    <app-inline-loading status="error" label="Couldn’t save" />
  </div>
  <div class="d-flex align-items-end gap-4">
    <app-spinner size="sm" label="Small" />
    <app-spinner size="md" label="Medium" />
    <app-spinner size="lg" label="Large" />
  </div>
</div>` }),
};

// Docs: Do / Don't

export const DoSayWhat: Story = { tags: ['!dev'], args: { label: 'Loading your orders', showLabel: true } };
export const DontJustLoading: Story = { tags: ['!dev'], args: { label: 'Please wait…', showLabel: true } };
export const DoProgressWhenKnown: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<div style="width: 16rem; margin: 0 auto"><app-progress-bar label="Uploading 5 photos" [value]="60" helperText="3 of 5 done" /></div>` }),
};
export const DontSpinnerWhenKnown: Story = { tags: ['!dev'], args: { label: 'Uploading 5 photos…', showLabel: true } };

// Tests (hidden; they still run)

/** Progress bar: value, range and label reach assistive tech; indeterminate has no value. */
export const TestProgress: Story = {
  tags: ['!dev'],
  name: 'Test · Progress bar',
  parameters: EXAMPLE,
  render: () => ({ template: `<app-progress-bar label="Uploading" [value]="60" /><app-progress-bar label="Preparing" />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const known = canvas.getByRole('progressbar', { name: 'Uploading' });
    await expect(known).toHaveAttribute('aria-valuenow', '60');
    await expect(known).toHaveAttribute('aria-valuemax', '100');
    const unknown = canvas.getByRole('progressbar', { name: 'Preparing' });
    await expect(unknown).not.toHaveAttribute('aria-valuenow');
    await expect(unknown).toHaveAttribute('aria-busy', 'true');
  },
};

/** Spinners and inline loading are status messages, so screen readers hear them. */
export const TestStatus: Story = {
  tags: ['!dev'],
  name: 'Test · Status',
  parameters: EXAMPLE,
  render: () => ({ template: `<app-spinner label="Loading orders" /><app-inline-loading status="finished" label="Saved" />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [spinner, inline] = canvas.getAllByRole('status');
    await expect(spinner.textContent).toContain('Loading orders');
    await expect(inline.textContent).toContain('Saved');
  },
};


// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'size', target: '.exos-spinner', side: 'right', label: '{v} spinner' },
  { kind: 'size', target: '.exos-progress-track', side: 'right', label: '{v} bar' },
  { kind: 'style', target: '.exos-progress-label', prop: 'font-size', side: 'top', label: '{v} text' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { controls: { disable: true }, example: true, specs: { sizes: true, switches: [] } },
  args: { size: 'md' } as Story['args'],
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS },
    template: `<app-redline [marks]="marks" [scale]="1.4" [key]="false"><div class="d-flex flex-column gap-4" style="width: 16rem"><app-spinner [size]="size" label="Loading photos" /><app-progress-bar label="Uploading photos" [value]="60" /></div></app-redline>`,
  }),
};
