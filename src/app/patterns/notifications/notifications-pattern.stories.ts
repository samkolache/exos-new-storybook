import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { InputComponent } from '../../components/input/input';
import { NotificationComponent } from '../../components/notification/notification';

const meta: Meta = {
  title: 'Patterns/Notifications',
  decorators: [moduleMetadata({ imports: [InputComponent, NotificationComponent] })],
  parameters: { a11y: { test: 'error' }, controls: { disable: true } },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj;

/** The four ways to tell people something, from quietest to loudest. */
export const Ladder: Story = {
  render: () => ({ template: `
<div class="d-flex flex-column gap-4" style="max-width: 30rem">
  <div>
    <p class="small fw-semibold text-body-secondary mb-2">1 · Field message</p>
    <app-input label="Email" type="email" value="alex@example" state="invalid" feedback="Enter an email address like name@example.com." />
  </div>
  <div>
    <p class="small fw-semibold text-body-secondary mb-2">2 · Inline notification</p>
    <app-notification kind="warning" title="Card expires soon" message="Update it before March 1 to avoid a failed payment." actionLabel="Update card" />
  </div>
  <div>
    <p class="small fw-semibold text-body-secondary mb-2">3 · Toast</p>
    <app-notification kind="success" variant="toast" title="Changes saved" [dismissible]="true" />
  </div>
  <div>
    <p class="small fw-semibold text-body-secondary mb-2">4 · Modal</p>
    <div class="exos-modal exos-modal-sm" style="position: static; display: flex; width: 100%; box-shadow: 0 8px 24px rgba(15,18,26,.16)">
      <div class="exos-modal-panel">
        <header class="exos-modal-header"><p class="exos-modal-title">Discard changes?</p></header>
        <div class="exos-modal-body"><p>Your edits to this report will be lost.</p></div>
      </div>
    </div>
  </div>
</div>` }),
};
