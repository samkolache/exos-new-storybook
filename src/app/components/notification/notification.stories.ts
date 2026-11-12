import { Component, inject } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ButtonComponent } from '../button/button';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { NotificationComponent } from './notification';
import { ToastRegionComponent, ToastService } from './toast';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

/** Docs only: buttons that show toasts, and the region they appear in. */
@Component({
  selector: 'app-toast-demo',
  imports: [ButtonComponent, ToastRegionComponent],
  template: `
<div class="d-flex flex-wrap gap-2">
  <app-button label="Save changes" (clicked)="toast.show({ kind: 'success', title: 'Changes saved' })" />
  <app-button variant="secondary" label="Archive order" (clicked)="archive()" />
  <app-button variant="secondary" label="Send without signal" (clicked)="toast.show({ kind: 'error', title: 'Couldn’t send', message: 'Check your connection, then try again.' })" />
</div>
<app-toast-region />`,
})
class ToastDemoComponent {
  protected readonly toast = inject(ToastService);

  protected archive(): void {
    this.toast.show({ kind: 'info', title: 'Order archived', actionLabel: 'Undo', onAction: () => this.toast.show({ kind: 'success', title: 'Order restored' }) });
  }
}

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { kind: 'info', title: '', message: '', actionLabel: '', dismissible: false, variant: 'inline' };

const meta: Meta<NotificationComponent> = {
  title: 'Components/Notification',
  component: NotificationComponent,
  parameters: {
    // Accessibility checks fail the tests for notifications (not just a warning).
    a11y: { test: 'error' },
    controls: { exclude: ['classes', 'role'] },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-notification',
          component: 'NotificationComponent',
          importPath: './components/notification/notification',
          defaults: DEFAULTS,
        }),
      },
    },
  },
  argTypes: {
    action: { action: 'action', table: { category: 'outputs' } },
    dismissed: { action: 'dismissed', table: { category: 'outputs' } },
    kind: {
      control: 'inline-radio',
      options: ['info', 'success', 'warning', 'error'],
      description: 'info: good to know · success: it worked · warning: check this · error: it didn’t work.',
      table: { defaultValue: { summary: 'info' } },
    },
    title: { description: 'What happened, in a few words.' },
    message: { description: 'What it means or what to do, in one or two sentences.' },
    actionLabel: { description: 'One action, like "Try again". Emits `action`.' },
    dismissible: { description: 'A close button. Emits `dismissed`; you remove the notification.' },
    variant: { control: 'inline-radio', options: ['inline', 'toast'], description: 'toast: set by the toast region.' },
  },
  args: { kind: 'info', title: 'New version available', message: 'Reload the page to get the latest changes.' },
};

export default meta;
type Story = StoryObj<NotificationComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Notification' };
export const Success: Story = { args: { kind: 'success', title: 'Order placed', message: 'We’ll email you when it ships.', dismissible: true } };
export const Warning: Story = { args: { kind: 'warning', title: 'Card expires soon', message: 'Update it before March 1 to avoid a failed payment.', actionLabel: 'Update card' } };
export const ErrorKind: Story = { name: 'Error', args: { kind: 'error', title: 'Payment failed', message: 'Your card was declined. Try another card.', actionLabel: 'Try again' } };

export const Toasts: Story = {
  decorators: [moduleMetadata({ imports: [ToastDemoComponent] })],
  parameters: { controls: { disable: true } },
  render: () => ({ template: `<div style="min-height: 280px"><app-toast-demo /></div>` }),
};

// Docs: live demo

export const Overview: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3" style="max-width: 36rem">
  <app-notification kind="info" title="New version available" message="Reload the page to get the latest changes." [dismissible]="true" />
  <app-notification kind="success" title="Order placed" message="We’ll email you when it ships." />
  <app-notification kind="warning" title="Card expires soon" message="Update it before March 1 to avoid a failed payment." actionLabel="Update card" />
  <app-notification kind="error" title="Payment failed" message="Your card was declined. Try another card." actionLabel="Try again" />
</div>` }),
};

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    parts: [
      { n: 1, target: '.exos-notification', side: 'left', whole: true },
      { n: 2, target: '.exos-notification-icon', side: 'top', whole: true },
      { n: 3, target: '.exos-notification-title', side: 'right' },
      { n: 4, target: '.exos-notification-message', side: 'right' },
      { n: 5, target: '.exos-notification-action', side: 'bottom' },
      { n: 6, target: '.exos-notification-close', side: 'top', whole: true },
    ],
  } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="20rem">
  <app-notification kind="warning" title="Card expires soon" message="Update it before March 1." actionLabel="Update card" [dismissible]="true" />
</app-anatomy>` }),
};

// Docs: one decision each

export const KindSwitchable: Story = { tags: ['!dev'], args: { dismissible: true } };
export const VarToast: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [ToastDemoComponent] })],
  parameters: { controls: { disable: true } },
  render: () => ({ template: `<div style="min-height: 300px"><app-toast-demo /></div>` }),
};
export const ModAction: Story = { tags: ['!dev'], args: { kind: 'error', title: 'Payment failed', message: 'Your card was declined.', actionLabel: 'Try again' } };
export const ModDismissible: Story = { tags: ['!dev'], args: { kind: 'success', title: 'Order placed', message: 'We’ll email you when it ships.', dismissible: true } };
export const ModTitleOnly: Story = { tags: ['!dev'], args: { kind: 'success', title: 'Changes saved', message: '' } };

// Docs: states (visual reference)

export const AllKinds: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <app-notification kind="info" title="Info" message="Something people may want to know." />
  <app-notification kind="success" title="Success" message="It worked." />
  <app-notification kind="warning" title="Warning" message="It worked, but check something." />
  <app-notification kind="error" title="Error" message="It didn’t work, and here’s what to do." />
  <app-notification kind="info" variant="toast" title="Toast" message="Floats above the page, then goes." [dismissible]="true" />
</div>` }),
};

// Docs: Do / Don't

export const DoSaySolution: Story = { tags: ['!dev'], args: { kind: 'error', title: 'Couldn’t upload photo', message: 'Photos must be under 20 MB. Try a smaller one.' } };
export const DontVague: Story = { tags: ['!dev'], args: { kind: 'error', title: 'Error', message: 'Something went wrong.' } };
export const DoInlineForBlocking: Story = {
  tags: ['!dev'],
  args: { kind: 'error', title: 'Payment failed', message: 'Your card was declined.', actionLabel: 'Try another card' },
};
export const DontToastForBlocking: Story = {
  tags: ['!dev'],
  args: { kind: 'error', variant: 'toast', title: 'Payment failed', message: 'Your card was declined.', dismissible: true },
};
export const DoOneAtATime: Story = { tags: ['!dev'], args: { kind: 'warning', title: '2 items need your attention', message: 'Review them before you send.', actionLabel: 'Review' } };
export const DontStack: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-2">
  <app-notification kind="warning" title="Photo missing" />
  <app-notification kind="warning" title="Address unconfirmed" />
  <app-notification kind="info" title="Tip: add a note" />
</div>` }),
};

// Docs: edge cases

export const EdgeLongMessage: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `<div style="width: 260px"><app-notification kind="info" title="Scheduled maintenance" message="The app will be unavailable on Sunday from 2 to 4 am while we upgrade our servers." [dismissible]="true" /></div>` }),
};
export const EdgeNarrow: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `<div style="width: 220px"><app-notification kind="error" title="Couldn’t save" actionLabel="Try again" [dismissible]="true" /></div>` }),
};

// Tests (hidden; they still run)

/** Errors and warnings interrupt (alert); info and success wait (status). */
export const TestRoles: Story = {
  tags: ['!dev'],
  name: 'Test · Roles',
  render: () => ({ template: `<app-notification kind="error" title="A" /><app-notification kind="warning" title="B" /><app-notification kind="success" title="C" /><app-notification kind="info" title="D" />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('alert')).toHaveLength(2);
    await expect(canvas.getAllByRole('status')).toHaveLength(2);
  },
};

/** The action and close buttons emit; the close button says what it closes. */
export const TestButtons: Story = {
  tags: ['!dev'],
  name: 'Test · Action and dismiss',
  args: { kind: 'warning', title: 'Card expires soon', actionLabel: 'Update card', dismissible: true, action: fn(), dismissed: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Update card' }));
    await expect(args.action).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss: Card expires soon' }));
    await expect(args.dismissed).toHaveBeenCalled();
  },
};

/** Toasts: success hides by itself; errors stay until dismissed. */
export const TestToasts: Story = {
  tags: ['!dev'],
  name: 'Test · Toasts',
  decorators: [moduleMetadata({ imports: [ToastDemoComponent] })],
  render: () => ({ template: `<div style="min-height: 280px"><app-toast-demo /></div>` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Send without signal' }));
    await expect(await canvas.findByText('Couldn’t send')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss: Couldn’t send' }));
    await waitFor(() => expect(canvas.queryByText('Couldn’t send')).toBeNull());
    await userEvent.click(canvas.getByRole('button', { name: 'Archive order' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Undo' }));
    await expect(await canvas.findByText('Order restored')).toBeInTheDocument();
  },
};


// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'padding', target: '.exos-notification', label: '{v} top and bottom', labelSides: '{v} on the left' },
  { kind: 'size', target: '.exos-notification-icon', side: 'top', label: '{v} icon' },
  { kind: 'style', target: '.exos-notification-title', prop: 'font-size', side: 'top', label: '{v} text' },
  { kind: 'size', target: '.exos-notification-close', side: 'right', label: '{v} close button' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { controls: { disable: true }, example: true, specs: { sizes: false, switches: [] } },
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS },
    template: `<app-redline [marks]="marks" [scale]="1" [key]="false"><div style="width: 22rem; max-width: calc(100vw - 7rem)"><app-notification kind="warning" title="Card expires soon" message="Update it before March 1." [dismissible]="true" /></div></app-redline>`,
  }),
};
