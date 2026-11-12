import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { fieldColumn } from '../shared/story-decorators';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { CheckboxComponent, CheckboxOption } from './checkbox';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

const TOPPINGS: CheckboxOption[] = [
  { label: 'Cheese', value: 'cheese' },
  { label: 'Mushrooms', value: 'mushrooms' },
  { label: 'Olives', value: 'olives' },
  { label: 'Peppers', value: 'peppers' },
];

const UPDATES: CheckboxOption[] = [
  { label: 'Order updates', value: 'orders', description: 'Shipping and delivery' },
  { label: 'Account security', value: 'security', description: 'Sign-ins and password changes' },
  { label: 'Offers', value: 'offers', description: 'Sales, at most once a week' },
];

const CHANNELS: CheckboxOption[] = [
  { label: 'Email', value: 'email' },
  { label: 'Push', value: 'push' },
  { label: 'Text message', value: 'sms' },
];

const TAGS: CheckboxOption[] = [
  { label: 'Billing', value: 'billing', suggested: true },
  { label: 'Bug', value: 'bug' },
  { label: 'Urgent', value: 'urgent', suggested: true },
  { label: 'Feature request', value: 'feature' },
];

const TAGS_EXPLAINED = 'Picked from the words in the message: "charged twice" and "today".';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = {
  label: '', options: [], selectAll: '', inline: false, helpText: '', state: 'none', feedback: '', disabled: false,
  readonly: false, required: false, optional: false, indeterminate: false, appearance: 'checkbox', aiExplanation: '', value: [], checked: false,
};

const meta: Meta<CheckboxComponent> = {
  title: 'Components/Forms/Checkbox',
  component: CheckboxComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] }), fieldColumn],
  parameters: {
    // Accessibility checks fail the tests for checkboxes (not just a warning).
    a11y: { test: 'error' },
    // Internal members: keep the API table to real inputs and outputs.
    controls: {
      exclude: [
        'aiMode', 'allState', 'describedBy', 'emit', 'enabled', 'feedbackClass', 'feedbackId', 'formDisabled', 'helpId',
        'isDisabled', 'isGroup', 'legendId', 'onChange', 'onClick', 'onTouched', 'optionId', 'revertToSuggestion',
        'showFeedback', 'stateClass', 'suggestions', 'toggle', 'toggleAll', 'toggleSingle', 'writeValue',
        'registerOnChange', 'registerOnTouched', 'setDisabledState',
      ],
    },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-checkbox',
          component: 'CheckboxComponent',
          importPath: './components/checkbox/checkbox',
          defaults: DEFAULTS,
          models: (args) => ((args['options'] as unknown[] | undefined)?.length ? ['value'] : ['checked']),
          types: { options: 'CheckboxOption[]', value: 'string[]' },
          listType: 'CheckboxOption[]',
        }),
      },
    },
  },
  argTypes: {
    valueChange: { action: 'valueChange', table: { category: 'outputs' } },
    checkedChange: { action: 'checkedChange', table: { category: 'outputs' } },
    label: { description: 'Group: the question. Single: the checkbox’s own label.' },
    options: { description: '`{ label, value, description?, disabled?, suggested? }`. With options it’s a group.' },
    value: { description: 'Group: the picked values, in the order of `options`.' },
    checked: { description: 'Single: on or off.' },
    selectAll: { description: 'Adds a parent checkbox with this label. It shows a dash when some are picked.' },
    inline: { description: 'Side by side from tablet up. Phones always stack.' },
    state: { control: 'inline-radio', options: ['none', 'valid', 'warning', 'invalid'], table: { defaultValue: { summary: 'none' } } },
    readonly: { description: 'Visible and reachable with Tab, but can’t change.' },
    appearance: {
      control: 'inline-radio',
      options: ['checkbox', 'switch'],
      description: 'Single only. switch: a setting that takes effect right away. At the end of the row on phones.',
      table: { defaultValue: { summary: 'checkbox' } },
    },
    indeterminate: { description: 'Single only: the dash, for a parent you manage yourself.' },
    aiExplanation: { description: 'What the AI did. Shown when people open the AI label. Needs `suggested` options.' },
    name: { table: { disable: true } },
  },
  args: { label: 'Toppings', options: TOPPINGS, value: ['cheese'] },
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

// Playgrounds (sidebar)

export const Group: Story = { name: 'Checkbox group' };
export const Single: Story = { args: { label: 'Remember me', options: [], value: [], checked: true } };
export const Switch: Story = { args: { label: 'Dark mode', options: [], value: [], appearance: 'switch', checked: true } };
export const SelectAll: Story = { name: 'Select all', args: { label: 'Send me', options: UPDATES, value: ['orders'], selectAll: 'All updates' } };
export const Horizontal: Story = { args: { label: 'Notify me by', options: CHANNELS, value: ['email'], inline: true } };
export const AISuggested: Story = {
  name: 'AI suggested',
  args: { label: 'Tags', options: TAGS, value: ['billing', 'urgent'], aiExplanation: TAGS_EXPLAINED },
};
export const Warning: Story = {
  args: { value: ['cheese', 'mushrooms', 'olives', 'peppers'], state: 'warning', feedback: 'More than 3 toppings adds $2.' },
};
export const Invalid: Story = {
  args: {
    label: 'I agree to the terms and privacy policy',
    options: [],
    value: [],
    required: true,
    state: 'invalid',
    feedback: 'Agree to the terms to continue.',
  },
};
export const Readonly: Story = { name: 'Read only', args: { readonly: true, helpText: 'Set by the restaurant for this deal.' } };
export const Disabled: Story = { args: { disabled: true } };

export const ReactiveForm: Story = {
  name: 'Reactive form',
  args: { control: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }) } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-checkbox
  label="I agree to the terms"
  [required]="true"
  [formControl]="control"
  [state]="control.touched && control.invalid ? 'invalid' : 'none'"
  feedback="Agree to the terms to continue."
/>
<p class="mt-3 mb-0 small text-body-secondary">Form value: {{ control.value }}</p>` }),
};

// Docs: live demo. One responsive form: the horizontal group stacks on phones by itself.

export const Overview: Story = {
  tags: ['!dev'],
  args: { updates: UPDATES, channels: CHANNELS } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<form class="exos-grid">
  <app-checkbox class="exos-col-4 exos-col-md-8 exos-col-lg-8" label="Send me" [options]="updates" [value]="['orders', 'security']" selectAll="All updates" />
  <div class="exos-col-4 exos-col-md-8 exos-col-lg-8 d-flex flex-column gap-4">
    <app-checkbox label="Notify me by" [options]="channels" [value]="['email']" [inline]="true" />
    <app-checkbox label="I agree to the terms" [required]="true" />
  </div>
</form>` }),
};

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    updates: UPDATES,
    parts: [
      { n: 1, target: 'legend > span:first-child', side: 'left' },
      { n: 2, target: '.exos-check input', side: 'left', whole: true },
      { n: 3, target: '.exos-choice-children .exos-check input', side: 'left', whole: true },
      { n: 4, target: '.exos-choice-children .exos-check-label', side: 'right' },
      { n: 5, target: '.exos-choice-children .exos-check-description', side: 'right' },
      { n: 6, target: '.form-text', side: 'left' },
    ],
  } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="17rem">
  <app-checkbox label="Send me" [options]="updates" [value]="['orders']" selectAll="All updates" helpText="Change these any time in Settings." />
</app-anatomy>` }),
};

// Docs: one decision each (clean code)

export const VarSingle: Story = { tags: ['!dev'], args: { label: 'Remember me', options: [], value: [], checked: true } };
export const VarGroup: Story = { tags: ['!dev'], args: { label: 'Toppings', options: TOPPINGS, value: ['cheese'] } };
export const VarSwitch: Story = {
  tags: ['!dev'],
  args: { label: 'Dark mode', options: [], value: [], appearance: 'switch', checked: true, helpText: 'Changes right away.' },
};
export const ModSelectAll: Story = { tags: ['!dev'], args: { label: 'Send me', options: UPDATES, value: ['orders'], selectAll: 'All updates' } };
export const ModDescription: Story = { tags: ['!dev'], args: { label: 'Send me', options: UPDATES, value: ['orders'] } };
export const ModHorizontal: Story = { tags: ['!dev'], args: { label: 'Notify me by', options: CHANNELS, value: ['email'], inline: true } };
export const ModAI: Story = { tags: ['!dev'], args: { label: 'Tags', options: TAGS, value: ['billing', 'urgent'], aiExplanation: TAGS_EXPLAINED } };
export const ModAIChanged: Story = { tags: ['!dev'], args: { label: 'Tags', options: TAGS, value: ['billing'], aiExplanation: TAGS_EXPLAINED } };
export const ModSingleHelp: Story = {
  tags: ['!dev'],
  args: { label: 'Keep me signed in', options: [], value: [], helpText: 'Not on shared or public devices.' },
};

// Docs: states (visual reference, no code)

export const AllStates: Story = {
  tags: ['!dev'],
  args: { options: TOPPINGS, tags: TAGS, explained: TAGS_EXPLAINED } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<div class="d-grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr))">
  <app-checkbox label="Nothing picked" [options]="options" />
  <app-checkbox label="Some picked" [options]="options" [value]="['cheese', 'olives']" />
  <app-checkbox label="Select all, partly" [options]="options" [value]="['cheese']" selectAll="All toppings" />
  <app-checkbox label="AI suggested" [options]="tags" [value]="['billing', 'urgent']" [aiExplanation]="explained" />
  <app-checkbox label="Warning" [options]="options" [value]="['cheese', 'mushrooms', 'olives', 'peppers']" state="warning" feedback="More than 3 adds $2." />
  <app-checkbox label="Invalid" [options]="options" [required]="true" state="invalid" feedback="Pick at least one." />
  <app-checkbox label="Read only" [options]="options" [value]="['cheese']" [readonly]="true" />
  <app-checkbox label="Disabled" [options]="options" [value]="['cheese']" [disabled]="true" />
</div>` }),
};

// Docs: Do / Don't

export const DoPositive: Story = { tags: ['!dev'], args: { label: 'Email me about offers', options: [], value: [] } };
export const DontNegative: Story = { tags: ['!dev'], args: { label: 'Don’t email me about offers', options: [], value: [] } };
export const DoCheckboxForMany: Story = { tags: ['!dev'], args: { label: 'Notify me by', options: CHANNELS, value: ['email', 'push'] } };
export const DontCheckboxForOne: Story = {
  tags: ['!dev'],
  args: { label: 'Shipping', options: [{ label: 'Standard', value: 'standard' }, { label: 'Express', value: 'express' }], value: ['standard', 'express'] },
};
export const DoUnchecked: Story = { tags: ['!dev'], args: { label: 'Email me about offers', options: [], value: [], checked: false } };
export const DontPrechecked: Story = { tags: ['!dev'], args: { label: 'Email me about offers', options: [], value: [], checked: true } };

// Switches are for settings that apply right away; form answers stay checkboxes.
export const DoSwitchInstant: Story = {
  tags: ['!dev'],
  render: () => ({ template: `
<div class="d-flex flex-column">
  <app-checkbox label="Dark mode" appearance="switch" [checked]="true" />
  <app-checkbox label="Show photos in reports" appearance="switch" />
</div>` }),
};
export const DontSwitchInForm: Story = {
  tags: ['!dev'],
  render: () => ({ template: `
<div class="d-flex flex-column">
  <app-checkbox label="I agree to the terms" appearance="switch" />
  <app-checkbox label="Email me the receipt" appearance="switch" [checked]="true" />
</div>` }),
};

// Docs: edge cases

export const EdgeLongLabel: Story = {
  tags: ['!dev'],
  args: { label: 'I agree to the terms of service, the privacy policy and the cookie policy', options: [], value: [] },
};
export const EdgeAllDisabledButOne: Story = {
  tags: ['!dev'],
  args: {
    label: 'Send me',
    options: [
      { label: 'Order updates', value: 'orders', disabled: true },
      { label: 'Offers', value: 'offers' },
    ],
    value: ['orders'],
    selectAll: 'All updates',
  },
};
export const EdgeNoneLeft: Story = { tags: ['!dev'], args: { value: [], helpText: 'Nothing picked is fine: we’ll send it plain.' } };

// Tests (hidden; they still run)

/** Tab goes to each checkbox; Space toggles; the value keeps the order of options. */
export const TestKeyboard: Story = {
  tags: ['!dev'],
  name: 'Test · Keyboard',
  args: { valueChange: fn(), value: [] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole('checkbox', { name: 'Mushrooms' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await userEvent.tab({ shift: true });
    await userEvent.keyboard(' ');
    await expect(args.valueChange).toHaveBeenLastCalledWith(['cheese', 'mushrooms']);
  },
};

/** Select all: dash when some, check when all, clears when all; disabled options keep their state. */
export const TestSelectAll: Story = {
  tags: ['!dev'],
  name: 'Test · Select all',
  args: { ...EdgeAllDisabledButOne.args, valueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole<HTMLInputElement>('checkbox', { name: 'All updates' });
    await expect(all.indeterminate).toBe(false);
    await expect(all).not.toBeChecked();
    await userEvent.click(all);
    await expect(args.valueChange).toHaveBeenLastCalledWith(['orders', 'offers']);
    await expect(all).toBeChecked();
    await userEvent.click(all);
    await expect(args.valueChange).toHaveBeenLastCalledWith(['orders']);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Offers' }));
    await expect(all).toBeChecked();
  },
};

/** The dash shows when some, but not all, are picked. */
export const TestIndeterminate: Story = {
  tags: ['!dev'],
  name: 'Test · Indeterminate',
  args: { ...ModSelectAll.args },
  play: async ({ canvasElement }) => {
    const all = within(canvasElement).getByRole<HTMLInputElement>('checkbox', { name: 'All updates' });
    await expect(all.indeterminate).toBe(true);
    await expect(all).toHaveAttribute('aria-controls');
  },
};

/** Read only: clicks and Space leave it as it was. */
export const TestReadonly: Story = {
  tags: ['!dev'],
  name: 'Test · Read only',
  args: { valueChange: fn(), readonly: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const olives = canvas.getByRole('checkbox', { name: 'Olives' });
    await userEvent.click(olives);
    await expect(olives).not.toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Cheese' })).toBeChecked();
    await expect(olives).toHaveAttribute('aria-readonly', 'true');
    await expect(args.valueChange).not.toHaveBeenCalled();
  },
};

/** AI: changing the picks swaps the AI label for a revert button that puts them back. */
export const TestAIRevert: Story = {
  tags: ['!dev'],
  name: 'Test · AI label and revert',
  args: { ...ModAI.args },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'AI: show explanation' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Bug' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Revert to AI suggestion' }));
    await expect(canvas.getByRole('checkbox', { name: 'Bug' })).not.toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Urgent (AI suggested)' })).toBeChecked();
    await expect(canvas.getByRole('button', { name: 'AI: show explanation' })).toBeInTheDocument();
  },
};

/** Single checkbox: name, required, invalid and the message. */
export const TestScreenReader: Story = {
  tags: ['!dev'],
  name: 'Test · Screen reader text',
  args: { ...Invalid.args },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', { name: 'I agree to the terms and privacy policy' });
    await expect(box).toBeRequired();
    await expect(box).toHaveAttribute('aria-invalid', 'true');
    await expect(box).toHaveAccessibleDescription('Agree to the terms to continue.');
  },
};

/** Phones: every option row is at least 44px tall, and horizontal groups stack. */
export const TestRows: Story = {
  tags: ['!dev'],
  name: 'Test · Row height',
  args: { ...Horizontal.args },
  play: async ({ canvasElement }) => {
    const mobile = canvasElement.ownerDocument.defaultView!.innerWidth < 672;
    const rows = [...canvasElement.querySelectorAll<HTMLElement>('.exos-check')];
    for (const row of rows) await expect(Math.round(row.getBoundingClientRect().height)).toBe(mobile ? 44 : 32);
    const tops = new Set(rows.map((r) => Math.round(r.getBoundingClientRect().top)));
    await expect(tops.size).toBe(mobile ? rows.length : 1);
  },
};

/** A switch is a real switch for screen readers, and toggles like a checkbox. */
export const TestSwitch: Story = {
  tags: ['!dev'],
  name: 'Test · Switch',
  args: { ...Switch.args, checked: false, checkedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const sw = within(canvasElement).getByRole('switch', { name: 'Dark mode' });
    await userEvent.click(sw);
    await expect(sw).toBeChecked();
    await expect(args.checkedChange).toHaveBeenLastCalledWith(true);
  },
};

export const TestReactiveForm: Story = {
  tags: ['!dev'],
  name: 'Test · Reactive form',
  args: ReactiveForm.args,
  parameters: ReactiveForm.parameters,
  render: ReactiveForm.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'I agree to the terms' }));
    await expect(canvas.getByText('Form value: true')).toBeInTheDocument();
  },
};


// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'size', target: '.exos-check', side: 'right', label: '{v} tall row' },
  { kind: 'size', target: '.exos-check .form-check-input', side: 'top', label: '{v} box' },
  { kind: 'distance', from: { target: '.exos-check .form-check-input', edge: 'right' }, to: { target: '.exos-check .exos-check-label', edge: 'left' }, side: 'bottom', label: '{v} to label' },
  { kind: 'style', target: '.exos-check .exos-check-label', prop: 'font-size', side: 'top', label: '{v} text' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { fullWidth: true, controls: { disable: true }, example: true, specs: { sizes: false, switches: [] } },
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS, options: TOPPINGS.slice(0, 2) },
    template: `<app-redline [marks]="marks" [scale]="1.6" [key]="false"><div style="width: 14rem"><app-checkbox [options]="options" /></div></app-redline>`,
  }),
};
