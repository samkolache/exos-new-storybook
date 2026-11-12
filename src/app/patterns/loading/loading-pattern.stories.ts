import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { ButtonComponent } from '../../components/button/button';
import { InlineLoadingComponent, ProgressBarComponent, SpinnerComponent } from '../../components/loading/loading';

const meta: Meta = {
  title: 'Patterns/Loading',
  decorators: [moduleMetadata({ imports: [ButtonComponent, InlineLoadingComponent, ProgressBarComponent, SpinnerComponent] })],
  parameters: { a11y: { test: 'error' }, controls: { disable: true } },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj;

/** A whole page: one large spinner where the content goes, the header stays. */
export const PageLoad: Story = {
  render: () => ({ template: `
<div class="border rounded-3 overflow-hidden" style="max-width: 32rem">
  <div class="px-3 py-2 border-bottom fw-semibold">Orders</div>
  <div class="d-flex align-items-center justify-content-center" style="min-height: 220px">
    <app-spinner size="lg" label="Loading your orders" [showLabel]="true" />
  </div>
</div>` }),
};

/** A section refreshing: the old content stays under a light layer. */
export const SectionRefresh: Story = {
  render: () => ({ template: `
<div class="position-relative border rounded-3 p-3" style="max-width: 32rem; min-height: 150px">
  <p class="fw-semibold mb-1">Recent orders</p>
  <p class="small text-body-secondary mb-0">Order 1042 · Nov 11 · $86.40</p>
  <p class="small text-body-secondary mb-0">Order 1041 · Nov 8 · $24.00</p>
  <app-spinner [overlay]="true" label="Refreshing orders" />
</div>` }),
};

/** An action: progress right next to the button, then the result. */
export const ActionProgress: Story = {
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <div class="d-flex flex-wrap align-items-center gap-3"><app-button label="Save changes" [disabled]="true" /><app-inline-loading status="active" label="Saving…" /></div>
  <div class="d-flex flex-wrap align-items-center gap-3"><app-button label="Save changes" /><app-inline-loading status="finished" label="Saved" /></div>
</div>` }),
};

/** A long task: measurable progress, and people can keep working. */
export const LongTask: Story = {
  render: () => ({ template: `
<div style="max-width: 28rem" class="d-flex flex-column gap-2">
  <app-progress-bar label="Exporting 1,200 orders" [value]="35" helperText="About 2 minutes left. You can keep working; we’ll tell you when it’s ready." />
</div>` }),
};
