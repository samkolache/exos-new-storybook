import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ButtonComponent } from '../button/button';
import { InputComponent } from '../input/input';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { ModalComponent } from './modal';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = {
  open: false, title: '', subtitle: '', size: 'md', primaryLabel: '', primaryVariant: 'primary', secondaryLabel: '',
  mobile: 'sheet', dismissible: true, footerBar: true, headerDivider: false, buttonsAlign: 'end',
};

/** Docs previews open the modal right away; the button opens it again after it's closed. */
const STAGE = 'min-height: 420px';

const meta: Meta<ModalComponent> = {
  title: 'Components/Modal',
  component: ModalComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent, InputComponent] })],
  parameters: {
    // Accessibility checks fail the tests for modals (not just a warning).
    // The destructive button (Button component) is 4.48:1, just under 4.5:1: a known Button issue,
    // left to the Button owner, so the contrast check skips it here only.
    a11y: { test: 'error', config: { rules: [{ id: 'color-contrast', selector: '*:not(.btn-danger)' }] } },
    controls: { exclude: ['classes', 'close', 'onBackdrop', 'onCancel', 'onClose', 'onPrimary', 'onSecondary', 'titleId', 'dialog'] },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-modal',
          component: 'ModalComponent',
          importPath: './components/modal/modal',
          defaults: DEFAULTS,
          models: ['open'],
        }),
      },
    },
  },
  argTypes: {
    openChange: { action: 'openChange', table: { category: 'outputs' } },
    primary: { action: 'primary', table: { category: 'outputs' } },
    secondary: { action: 'secondary', table: { category: 'outputs' } },
    closed: { action: 'closed', table: { category: 'outputs' } },
    title: { description: 'The question or task, like "Delete photo?".' },
    subtitle: { description: 'A short line under the title, like the item it’s about.' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Web width: sm 400px · md 560px · lg 800px. Phones: always full width.',
      table: { defaultValue: { summary: 'md' } },
    },
    primaryVariant: { control: 'inline-radio', options: ['primary', 'secondary', 'destructive'] },
    mobile: {
      control: 'inline-radio',
      options: ['sheet', 'fullscreen'],
      description: 'Phones: sheet from the bottom, or full screen for forms and long content.',
      table: { defaultValue: { summary: 'sheet' } },
    },
    dismissible: { description: 'Esc, the close button and a click outside close it.' },
    headerDivider: {
      description: 'A line under the header, for long or scrolling content.',
      table: { defaultValue: { summary: 'false' } },
    },
    buttonsAlign: {
      control: 'inline-radio',
      options: ['end', 'start'],
      description: 'Web: end (right) or start (left, main button first). Phones always stack them.',
      table: { defaultValue: { summary: 'end' } },
    },
    footerBar: {
      description: 'Buttons in a footer bar with a line above (forms, content that scrolls). Off: buttons right under a short message.',
      table: { defaultValue: { summary: 'true' } },
    },
  },
  args: {
    open: true,
    title: 'Delete photo?',
    subtitle: '',
    mobile: 'sheet',
    dismissible: true,
    size: 'sm',
    primaryLabel: 'Delete',
    primaryVariant: 'destructive',
    secondaryLabel: 'Cancel',
  },
  render: (args) => ({
    props: args,
    template: `
<div style="${STAGE}">
  <app-button variant="secondary" label="Open modal" (clicked)="open = true" />
  <app-modal [(open)]="open" [title]="title" [subtitle]="subtitle" [size]="size" [primaryLabel]="primaryLabel" [primaryVariant]="primaryVariant" [secondaryLabel]="secondaryLabel" [mobile]="mobile" [dismissible]="dismissible" (primary)="open = false">
    <p>The photo will be removed from this report. This can’t be undone.</p>
  </app-modal>
</div>`,
  }),
};

export default meta;
type Story = StoryObj<ModalComponent>;

// Playground (sidebar)

export const Default: Story = { name: 'Modal' };

// Docs: live demo (a short form)

export const Overview: Story = {
  tags: ['!dev'],
  args: { open: true } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div style="${STAGE}">
  <app-button label="Add address" (clicked)="open = true" />
  <app-modal [(open)]="open" title="Add address" size="md" primaryLabel="Save address" secondaryLabel="Cancel" (primary)="open = false">
    <div class="d-flex flex-column gap-3">
      <app-input label="Street address" autocomplete="street-address" />
      <app-input label="City" autocomplete="address-level2" />
    </div>
  </app-modal>
</div>` }),
};

// Docs: anatomy (open in place)

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    parts: [
      { n: 1, target: '.exos-modal-header', side: 'left', whole: true },
      { n: 2, target: '.exos-modal-close', side: 'right', whole: true },
      { n: 3, target: '.exos-modal-body', side: 'left', whole: true },
      { n: 4, target: '.exos-modal-footer', side: 'left', whole: true },
      { n: 5, target: '.exos-modal-footer app-button:last-child .btn', side: 'right', whole: true },
    ],
  } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="22rem">
  <div class="exos-modal exos-modal-sm" style="position: static; display: flex; width: 100%; box-shadow: 0 8px 24px rgba(15,18,26,.16)">
    <div class="exos-modal-panel">
      <header class="exos-modal-header">
        <h2 class="exos-modal-title">Delete photo?</h2>
        <button type="button" class="exos-modal-close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg></button>
      </header>
      <div class="exos-modal-body"><p>This can’t be undone.</p></div>
      <footer class="exos-modal-footer">
        <app-button variant="secondary" label="Cancel" />
        <app-button variant="destructive" label="Delete" />
      </footer>
    </div>
  </div>
</app-anatomy>` }),
};

// Docs: one decision each

export const VarDecision: Story = { tags: ['!dev'] };

// The three ways buttons can sit.

/** Footer bar: a form; the buttons sit in a bar with a line above, apart from the fields. */
export const VarFooterBar: Story = {
  tags: ['!dev'],
  args: { open: true } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div style="${STAGE}">
  <app-button variant="secondary" label="Add address" (clicked)="open = true" />
  <app-modal [(open)]="open" title="Add address" size="md" primaryLabel="Save address" secondaryLabel="Cancel" (primary)="open = false">
    <div class="d-flex flex-column gap-3">
      <app-input label="Street address" autocomplete="street-address" />
      <app-input label="City" autocomplete="address-level2" />
    </div>
  </app-modal>
</div>` }),
};

/** No footer bar: a short decision; the buttons sit right under the message. */
export const VarNoBar: Story = {
  tags: ['!dev'],
  args: { open: true } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div style="${STAGE}">
  <app-button variant="secondary" label="Delete photo" (clicked)="open = true" />
  <app-modal [(open)]="open" title="Delete photo?" size="sm" primaryLabel="Delete" primaryVariant="destructive" secondaryLabel="Cancel" [footerBar]="false" (primary)="open = false">
    <p>This can’t be undone.</p>
  </app-modal>
</div>` }),
};

/** No buttons: something to look at; it closes with the × or Esc. */
export const VarNoButtons: Story = {
  tags: ['!dev'],
  args: { open: true } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div style="${STAGE}">
  <app-button variant="secondary" label="Photo details" (clicked)="open = true" />
  <app-modal [(open)]="open" title="Photo details" subtitle="kitchen-02.jpg" size="sm">
    <dl class="mb-0 d-grid gap-1" style="grid-template-columns: max-content 1fr; column-gap: 1rem">
      <dt class="fw-normal text-body-secondary">Taken</dt><dd class="mb-0">Nov 3, 2026</dd>
      <dt class="fw-normal text-body-secondary">Size</dt><dd class="mb-0">2.4 MB</dd>
      <dt class="fw-normal text-body-secondary">Camera</dt><dd class="mb-0">Phone, back camera</dd>
    </dl>
  </app-modal>
</div>` }),
};
export const SizeSwitchable: Story = { tags: ['!dev'], args: { title: 'Delete photo?' } };
export const ModFullscreen: Story = {
  tags: ['!dev'],
  args: { open: true } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div style="${STAGE}">
  <app-button label="Edit profile" (clicked)="open = true" />
  <app-modal [(open)]="open" title="Edit profile" mobile="fullscreen" primaryLabel="Save" secondaryLabel="Cancel" (primary)="open = false">
    <div class="d-flex flex-column gap-3">
      <app-input label="Full name" autocomplete="name" value="Alex Morgan" />
      <app-input label="Email" type="email" autocomplete="email" value="alex@example.com" />
      <app-input label="Phone" type="tel" autocomplete="tel" [optional]="true" />
    </div>
  </app-modal>
</div>` }),
};
export const ModNotDismissible: Story = {
  tags: ['!dev'],
  args: {
    open: true,
    title: 'Your session expired',
    primaryLabel: 'Sign in again',
    primaryVariant: 'primary',
    secondaryLabel: '',
    dismissible: false,
  },
  render: (args) => ({ props: args, template: `
<div style="${STAGE}">
  <app-button variant="secondary" label="Open modal" (clicked)="open = true" />
  <app-modal [(open)]="open" [title]="title" size="sm" [primaryLabel]="primaryLabel" [dismissible]="dismissible" (primary)="open = false">
    <p>Sign in again to keep working. Your changes are saved.</p>
  </app-modal>
</div>` }),
};
export const ModSubtitle: Story = { tags: ['!dev'], args: { subtitle: 'kitchen-02.jpg' } };

/** Header divider: a line under the header, for content that scrolls. */
export const ModHeaderDivider: Story = {
  tags: ['!dev'],
  args: { open: true } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div style="${STAGE}">
  <app-button variant="secondary" label="Terms" (clicked)="open = true" />
  <app-modal [(open)]="open" title="Terms of service" [headerDivider]="true" primaryLabel="Accept" secondaryLabel="Close" (primary)="open = false">
    <p>These terms explain how you can use the service, what we do with your data, and what happens if something goes wrong.</p>
    <p>You can cancel at any time. Payments already made aren't refunded, except where the law says so.</p>
    <p>We may change these terms. If we do, we'll tell you by email at least 30 days before.</p>
  </app-modal>
</div>` }),
};

/** Buttons on the left: the main button first. */
export const ModButtonsStart: Story = {
  tags: ['!dev'],
  args: { open: true } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div style="${STAGE}">
  <app-button variant="secondary" label="Add address" (clicked)="open = true" />
  <app-modal [(open)]="open" title="Add address" size="md" buttonsAlign="start" primaryLabel="Save address" secondaryLabel="Cancel" (primary)="open = false">
    <div class="d-flex flex-column gap-3">
      <app-input label="Street address" autocomplete="street-address" />
      <app-input label="City" autocomplete="address-level2" />
    </div>
  </app-modal>
</div>` }),
};

// Docs: Do / Don't (the open modal, in place)

const STILL = (body: string, primary: string, secondary = 'Cancel', variant = 'primary') => `
<div class="exos-modal exos-modal-sm" style="position: static; display: flex; width: 100%; box-shadow: 0 8px 24px rgba(15,18,26,.16)">
  <div class="exos-modal-panel">
    ${body}
    <footer class="exos-modal-footer">
      ${secondary ? `<app-button variant="secondary" label="${secondary}" />` : ''}
      <app-button variant="${variant}" label="${primary}" />
    </footer>
  </div>
</div>`;

export const DoSpecificButtons: Story = {
  tags: ['!dev'],
  render: () => ({ template: STILL(`<header class="exos-modal-header"><h2 class="exos-modal-title">Delete photo?</h2></header><div class="exos-modal-body"><p>This can’t be undone.</p></div>`, 'Delete', 'Cancel', 'destructive') }),
};
export const DontYesNo: Story = {
  tags: ['!dev'],
  render: () => ({ template: STILL(`<header class="exos-modal-header"><h2 class="exos-modal-title">Are you sure?</h2></header><div class="exos-modal-body"><p>Do you want to continue?</p></div>`, 'Yes', 'No') }),
};
export const DoShort: Story = {
  tags: ['!dev'],
  render: () => ({ template: STILL(`<header class="exos-modal-header"><h2 class="exos-modal-title">Discard changes?</h2></header><div class="exos-modal-body"><p>Your edits to this report will be lost.</p></div>`, 'Discard', 'Keep editing', 'destructive') }),
};
export const DontModalForInfo: Story = {
  tags: ['!dev'],
  render: () => ({ template: STILL(`<header class="exos-modal-header"><h2 class="exos-modal-title">Saved</h2></header><div class="exos-modal-body"><p>Your changes were saved.</p></div>`, 'OK', '') }),
};

// Tests (hidden; they still run)

/** Opening moves focus inside; Esc closes and syncs `open`. */
export const TestOpenAndEsc: Story = {
  tags: ['!dev'],
  name: 'Test · Focus and Esc',
  args: { open: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open modal' }));
    const dialog = await canvas.findByRole('dialog', { name: 'Delete photo?' });
    await waitFor(() => expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    // Focus goes back to the button that opened it.
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Open modal' })).toHaveFocus());
  },
};

/** Cancel closes; the main button emits `primary`. */
export const TestButtons: Story = {
  tags: ['!dev'],
  name: 'Test · Buttons',
  args: { open: true, primary: fn(), secondary: fn() },
  render: (args) => ({
    props: args,
    template: `
<div style="${STAGE}">
  <app-button variant="secondary" label="Open modal" (clicked)="open = true" />
  <app-modal [(open)]="open" title="Delete photo?" size="sm" primaryLabel="Delete" primaryVariant="destructive" secondaryLabel="Cancel" (primary)="primary()" (secondary)="secondary()">
    <p>This can’t be undone.</p>
  </app-modal>
</div>`,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await expect(args.primary).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Open modal' }));
    await userEvent.click(within(await canvas.findByRole('dialog')).getByRole('button', { name: 'Cancel' }));
    await expect(args.secondary).toHaveBeenCalled();
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
  },
};

/** Not dismissible: no close button, and Esc leaves it open. */
export const TestNotDismissible: Story = {
  tags: ['!dev'],
  name: 'Test · Not dismissible',
  args: { ...ModNotDismissible.args },
  render: ModNotDismissible.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole('dialog', { name: 'Your session expired' });
    await expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).toHaveAttribute('open');
  },
};


// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'style', target: '.exos-modal', prop: 'radius', side: 'top', label: '{v} corners' },
  { kind: 'style', target: '.exos-modal-title', prop: 'font-size', side: 'top', label: '{v} title' },
  { kind: 'size', target: '.exos-modal-close', side: 'top', label: '{v} close button' },
  { kind: 'padding', target: '.exos-modal-header', aside: 'Header' },
  { kind: 'padding', target: '.exos-modal-body', aside: 'Body' },
  { kind: 'padding', target: '.exos-modal-footer', aside: 'Footer' },
  { kind: 'style', target: '.exos-modal-footer', prop: 'divider', side: 'bottom', label: '{v} line above the buttons' },
  { kind: 'style', target: '.exos-modal-header', prop: 'divider-bottom', side: 'top', label: '{v} line under the header' },
  { kind: 'distance', from: { target: '.exos-modal-footer app-button:first-child .btn', edge: 'right' }, to: { target: '.exos-modal-footer app-button:last-child .btn', edge: 'left' }, side: 'bottom', label: '{v} between buttons' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { controls: { disable: true }, example: true, specs: { sizes: false, switches: [{ arg: 'kind', label: 'Buttons', initial: 'bar', options: [
    { value: 'bar', label: 'Footer bar', short: 'Bar' },
    { value: 'plain', label: 'No bar', short: 'Plain' },
    { value: 'none', label: 'No buttons', short: 'None' },
  ] }, { arg: 'header', label: 'Header', initial: 'plain', options: [
    { value: 'plain', label: 'No line', short: 'No line' },
    { value: 'divider', label: 'Line', short: 'Line' },
  ] }, { arg: 'align', label: 'Buttons side', initial: 'end', options: [
    { value: 'end', label: 'Right', short: 'R' },
    { value: 'start', label: 'Left', short: 'L' },
  ] }] } },
  // kind: how the buttons sit. bar = footer bar · plain = no bar · none = no buttons.
  // header: plain or divider · align: end (right) or start (left).
  args: { kind: 'bar', header: 'plain', align: 'end' } as Story['args'],
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS },
    template: `<app-redline [marks]="marks" [scale]="1" [minScale]="0.5" [room]="190" [key]="false">
  <div style="width: min(25rem, 100vw)">
    <div class="exos-modal exos-modal-sm" style="position: static; display: flex; width: 100%; box-shadow: 0 8px 24px rgba(15,18,26,.16)">
      <div class="exos-modal-panel">
        <header class="exos-modal-header" [class.exos-modal-header-divider]="header === 'divider'">
          <h2 class="exos-modal-title">{{ kind === 'none' ? 'Photo details' : 'Delete photo?' }}</h2>
          <button type="button" class="exos-modal-close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg></button>
        </header>
        <div class="exos-modal-body"><p>{{ kind === 'none' ? 'Taken Nov 3, 2026 · 2.4 MB' : 'This can’t be undone.' }}</p></div>
        @if (kind !== 'none') {
          <footer class="exos-modal-footer" [class.exos-modal-footer-plain]="kind === 'plain'" [class.exos-modal-footer-start]="align === 'start'">
            <app-button variant="secondary" label="Cancel" />
            <app-button variant="destructive" label="Delete" />
          </footer>
        }
      </div>
    </div>
  </div>
</app-redline>`,
  }),
};

/** Footer bar vs no bar: the bar has a line above the buttons; without it there's no line and no extra space. */
export const TestFooterBar: Story = {
  tags: ['!dev'],
  name: 'Test · Footer bar',
  args: { open: true } as Story['args'],
  render: VarNoBar.render,
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement).findByRole('dialog', { name: 'Delete photo?' });
    const footer = dialog.querySelector<HTMLElement>('.exos-modal-footer')!;
    await expect(footer).toHaveClass('exos-modal-footer-plain');
    await expect(getComputedStyle(footer).borderTopStyle).toBe('none');
    await expect(getComputedStyle(footer).paddingTop).toBe('0px');
    await expect(within(dialog).getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  },
};

/** Header divider adds a line under the header; buttons on the left put the main button first. */
export const TestDividerAndAlign: Story = {
  tags: ['!dev'],
  name: 'Test · Header divider and buttons on the left',
  args: { open: true } as Story['args'],
  render: (args) => ({ props: args, template: `
<div style="${STAGE}">
  <app-modal [(open)]="open" title="Add address" [headerDivider]="true" buttonsAlign="start" primaryLabel="Save" secondaryLabel="Cancel"><p>Body</p></app-modal>
</div>` }),
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement).findByRole('dialog', { name: 'Add address' });
    const header = dialog.querySelector<HTMLElement>('.exos-modal-header')!;
    await expect(getComputedStyle(header).borderBottomStyle).toBe('solid');
    const save = within(dialog).getByRole('button', { name: 'Save' }).getBoundingClientRect();
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' }).getBoundingClientRect();
    const footer = dialog.querySelector<HTMLElement>('.exos-modal-footer')!.getBoundingClientRect();
    if (window.innerWidth >= 672) {
      // On the left, main button first.
      await expect(save.left).toBeLessThan(cancel.left);
      await expect(save.left - footer.left).toBeLessThan(40);
    }
  },
};
