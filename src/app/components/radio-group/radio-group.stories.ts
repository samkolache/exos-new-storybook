import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { fieldColumn } from '../shared/story-decorators';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { CheckboxComponent } from '../checkbox/checkbox';
import { RadioGroupComponent, RadioOption } from './radio-group';

const SHIPPING: RadioOption[] = [
  { label: 'Standard', value: 'standard', description: '3 to 5 business days · Free' },
  { label: 'Express', value: 'express', description: '1 to 2 business days · $12' },
  { label: 'Pick up in store', value: 'pickup', description: 'Ready in 2 hours' },
];

const SHIPPING_SHORT: RadioOption[] = [
  { label: 'Standard', value: 'standard' },
  { label: 'Express', value: 'express' },
  { label: 'Pick up in store', value: 'pickup' },
];

const CONTACT: RadioOption[] = [
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Text message', value: 'text' },
];

const PLANS: RadioOption[] = [
  { label: 'Starter', value: 'starter', description: 'For one person' },
  { label: 'Team', value: 'team', description: 'Up to 10 people', suggested: true },
  { label: 'Business', value: 'business', description: 'Unlimited people' },
];

const PLAN_EXPLAINED = 'Suggested because 6 people use your workspace each week.';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = {
  label: '', options: [], appearance: 'default', inline: false, reverse: false, helpText: '', state: 'none', feedback: '',
  disabled: false, readonly: false, required: false, optional: false, aiExplanation: '', value: null,
};

const meta: Meta<RadioGroupComponent> = {
  title: 'Components/Forms/Radio Group',
  component: RadioGroupComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] }), fieldColumn],
  parameters: {
    // Accessibility checks fail the tests for radios (not just a warning).
    a11y: { test: 'error' },
    // Internal members: keep the API table to real inputs and outputs.
    controls: {
      exclude: [
        'aiMode', 'describedBy', 'feedbackClass', 'feedbackId', 'formDisabled', 'helpId', 'isDisabled', 'legendId',
        'onChange', 'onClick', 'onKeydown', 'onTouched', 'optionId', 'revertToSuggestion', 'select', 'showFeedback',
        'stateClass', 'suggestion', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState',
      ],
    },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-radio-group',
          component: 'RadioGroupComponent',
          importPath: './components/radio-group/radio-group',
          defaults: DEFAULTS,
          models: ['value'],
          types: { options: 'RadioOption[]', value: 'string | null' },
          listType: 'RadioOption[]',
        }),
      },
    },
  },
  argTypes: {
    valueChange: { action: 'valueChange', table: { category: 'outputs' } },
    label: { description: 'The question. Always set one; it names the group for screen readers.' },
    options: { description: '`{ label, value, description?, disabled?, suggested? }`. 2 to 5 of them.' },
    appearance: {
      control: 'inline-radio',
      options: ['default', 'card'],
      description: 'default: a list · card: each option is a card, for options that need room.',
      table: { defaultValue: { summary: 'default' } },
    },
    inline: { description: 'Side by side from tablet up. Phones always stack.' },
    reverse: { description: 'Radio after the label, like a settings list. Default appearance only.' },
    state: {
      control: 'inline-radio',
      options: ['none', 'valid', 'warning', 'invalid'],
      table: { defaultValue: { summary: 'none' } },
    },
    readonly: { description: 'Visible and reachable with Tab, but the answer can’t change.' },
    optional: { description: 'Adds "(optional)" after the label.' },
    aiExplanation: { description: 'What the AI did. Shown when people open the AI label. Needs a `suggested` option.' },
    name: { table: { disable: true } },
  },
  args: { label: 'Shipping', options: SHIPPING_SHORT, value: 'standard' },
};

export default meta;
type Story = StoryObj<RadioGroupComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Radio group' };
export const WithDescriptions: Story = { args: { options: SHIPPING } };
export const Card: Story = { args: { options: SHIPPING, appearance: 'card' } };
export const Horizontal: Story = { args: { label: 'Contact me by', options: CONTACT, value: 'email', inline: true } };
export const AISuggested: Story = {
  name: 'AI suggested',
  args: { label: 'Plan', options: PLANS, value: 'team', aiExplanation: PLAN_EXPLAINED },
};
export const Invalid: Story = {
  args: { value: null, required: true, state: 'invalid', feedback: 'Choose how you’d like it shipped.' },
};
export const Readonly: Story = { name: 'Read only', args: { readonly: true, helpText: 'Set by your company’s policy.' } };
export const Disabled: Story = { args: { disabled: true } };

export const ReactiveForm: Story = {
  name: 'Reactive form',
  args: { options: SHIPPING_SHORT, control: new FormControl<string | null>(null, Validators.required) } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-radio-group
  label="Shipping"
  [options]="options"
  [required]="true"
  [formControl]="control"
  [state]="control.touched && control.invalid ? 'invalid' : 'none'"
  feedback="Choose how you’d like it shipped."
/>
<p class="mt-3 mb-0 small text-body-secondary">Form value: {{ control.value ?? 'null' }}</p>` }),
};

// Docs: live demo. One responsive form: the horizontal group stacks on phones by itself.

export const Overview: Story = {
  tags: ['!dev'],
  args: { shipping: SHIPPING, contact: CONTACT } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<form class="exos-grid">
  <app-radio-group class="exos-col-4 exos-col-md-8 exos-col-lg-8" label="Shipping" [options]="shipping" value="standard" />
  <app-radio-group class="exos-col-4 exos-col-md-8 exos-col-lg-8" label="Contact me by" [options]="contact" value="email" [inline]="true" />
</form>` }),
};

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    plans: PLANS,
    parts: [
      { n: 1, target: 'legend > span:first-child', side: 'left' },
      { n: 2, target: '.exos-ai-label', side: 'right', whole: true },
      { n: 3, target: '.exos-check input', side: 'left', whole: true },
      { n: 4, target: '.exos-check-label', side: 'right' },
      { n: 5, target: '.exos-check-description', side: 'right' },
      { n: 6, target: '.form-text', side: 'left' },
    ],
  } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="17rem">
  <app-radio-group label="Plan" [options]="plans" value="team" helpText="You can change it at any time." />
</app-anatomy>` }),
};

// Docs: one decision each (clean code)

export const VarList: Story = { tags: ['!dev'], args: { options: SHIPPING_SHORT } };
export const VarCard: Story = { tags: ['!dev'], args: { options: SHIPPING, appearance: 'card' } };
export const ModHorizontal: Story = { tags: ['!dev'], args: { label: 'Contact me by', options: CONTACT, value: 'email', inline: true } };
export const ModDescription: Story = { tags: ['!dev'], args: { options: SHIPPING } };
export const ModAI: Story = { tags: ['!dev'], args: { label: 'Plan', options: PLANS, value: 'team', aiExplanation: PLAN_EXPLAINED } };
export const ModAIChanged: Story = { tags: ['!dev'], args: { label: 'Plan', options: PLANS, value: 'starter', aiExplanation: PLAN_EXPLAINED } };
export const ModOptional: Story = { tags: ['!dev'], args: { label: 'Gift wrap', options: [{ label: 'Paper', value: 'paper' }, { label: 'Box', value: 'box' }], value: null, optional: true } };
export const ModReverse: Story = { tags: ['!dev'], args: { label: 'Theme', options: [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'Match my device', value: 'system' }], value: 'system', reverse: true } };

// Docs: states (visual reference, no code)

export const AllStates: Story = {
  tags: ['!dev'],
  args: { options: SHIPPING_SHORT, plans: PLANS } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<div class="d-grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr))">
  <app-radio-group label="Nothing picked" [options]="options" />
  <app-radio-group label="Picked" [options]="options" value="express" />
  <app-radio-group label="AI suggested" [options]="plans" value="team" aiExplanation="${PLAN_EXPLAINED}" />
  <app-radio-group label="Warning" [options]="options" value="express" state="warning" feedback="Express won’t arrive before Friday." />
  <app-radio-group label="Invalid" [options]="options" [required]="true" state="invalid" feedback="Choose an option." />
  <app-radio-group label="Read only" [options]="options" value="standard" [readonly]="true" />
  <app-radio-group label="Disabled" [options]="options" value="standard" [disabled]="true" />
</div>` }),
};

// Docs: Do / Don't

export const DoVertical: Story = { tags: ['!dev'], args: { options: SHIPPING_SHORT } };
export const DontHorizontalLong: Story = {
  tags: ['!dev'],
  parameters: { fullWidth: true },
  args: {
    label: 'Why are you returning it?',
    options: [
      { label: 'It arrived damaged', value: 'damaged' },
      { label: 'It’s not what I ordered', value: 'wrong' },
      { label: 'It doesn’t fit', value: 'fit' },
    ],
    inline: true,
    value: null,
  },
};
export const DoNone: Story = {
  tags: ['!dev'],
  args: {
    label: 'Dietary needs',
    options: [{ label: 'Vegetarian', value: 'veg' }, { label: 'Vegan', value: 'vegan' }, { label: 'None', value: 'none' }],
    value: null,
  },
};
export const DontNoWayBack: Story = {
  tags: ['!dev'],
  args: { label: 'Dietary needs', options: [{ label: 'Vegetarian', value: 'veg' }, { label: 'Vegan', value: 'vegan' }], value: 'veg' },
};
export const DoFewOptions: Story = { tags: ['!dev'], args: { label: 'Size', options: [{ label: 'Small', value: 's' }, { label: 'Medium', value: 'm' }, { label: 'Large', value: 'l' }], value: 'm' } };
export const DontManyOptions: Story = {
  tags: ['!dev'],
  args: {
    label: 'Country',
    options: [
      { label: 'Australia', value: 'au' }, { label: 'Brazil', value: 'br' }, { label: 'Canada', value: 'ca' },
      { label: 'France', value: 'fr' }, { label: 'Germany', value: 'de' }, { label: 'India', value: 'in' },
      { label: 'Japan', value: 'jp' }, { label: 'Mexico', value: 'mx' },
    ],
    value: 'ca',
  },
};

// For a single on/off, a checkbox reads faster than a pair of radios.
export const DoCheckboxForOnOff: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [CheckboxComponent] })],
  render: () => ({ template: `<app-checkbox label="Gift wrap this order" />` }),
};
export const DontRadiosForOnOff: Story = {
  tags: ['!dev'],
  args: { label: 'Gift wrap this order', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], value: 'no', inline: true },
};

// Docs: edge cases

export const EdgeLongLabel: Story = {
  tags: ['!dev'],
  args: {
    label: 'Delivery',
    options: [
      { label: 'Leave it with a neighbour if nobody answers the door', value: 'neighbour' },
      { label: 'Bring it back', value: 'back' },
    ],
    value: 'neighbour',
  },
};
export const EdgeNothingPicked: Story = { tags: ['!dev'], args: { value: null } };
export const EdgeDisabledOption: Story = {
  tags: ['!dev'],
  args: {
    options: [
      { label: 'Standard', value: 'standard' },
      { label: 'Express', value: 'express' },
      { label: 'Pick up in store', value: 'pickup', disabled: true },
    ],
  },
};

// Tests (hidden; they still run)

/** Arrow keys move and pick; disabled options are skipped (native radios). */
export const TestKeyboard: Story = {
  tags: ['!dev'],
  name: 'Test · Keyboard',
  args: { valueChange: fn(), options: EdgeDisabledOption.args!.options, value: 'standard' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Express' })).toBeChecked();
    await expect(args.valueChange).toHaveBeenLastCalledWith('express');
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toBeChecked();
  },
};

/** Clicking anywhere on the row picks the option. */
export const TestRowClick: Story = {
  tags: ['!dev'],
  name: 'Test · Whole row is clickable',
  args: { options: SHIPPING, value: 'standard' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // What a tap on the description actually hits: the row's label, so the radio gets picked.
    const box = canvas.getByText('1 to 2 business days · $12').getBoundingClientRect();
    const hit = canvasElement.ownerDocument.elementFromPoint(box.left + 10, box.top + box.height / 2)!;
    await expect(hit).toHaveClass('exos-check-label');
    await userEvent.click(hit);
    await expect(canvas.getByRole('radio', { name: 'Express' })).toBeChecked();
  },
};

/** Read only: clicks and arrow keys leave the answer as it was. */
export const TestReadonly: Story = {
  tags: ['!dev'],
  name: 'Test · Read only',
  args: { valueChange: fn(), readonly: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Express' }));
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toBeChecked();
    await expect(args.valueChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true');
  },
};

/** AI: the label explains; changing the answer swaps it for a revert button that puts the AI's answer back. */
export const TestAIRevert: Story = {
  tags: ['!dev'],
  name: 'Test · AI label and revert',
  args: { ...ModAI.args },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', { name: 'Team (AI suggested)' })).toBeChecked();
    const ai = canvas.getByRole('button', { name: 'AI: show explanation' });
    await userEvent.click(ai);
    await expect(ai).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(PLAN_EXPLAINED)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByText(PLAN_EXPLAINED)).toBeNull();
    await userEvent.click(canvas.getByRole('radio', { name: 'Starter' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Revert to AI suggestion' }));
    await expect(canvas.getByRole('radio', { name: 'Team (AI suggested)' })).toBeChecked();
    await expect(canvas.getByRole('button', { name: 'AI: show explanation' })).toBeInTheDocument();
  },
};

/** What a screen reader gets: group name, option name with its description, and the message. */
export const TestScreenReader: Story = {
  tags: ['!dev'],
  name: 'Test · Screen reader text',
  args: { options: SHIPPING, value: 'standard', state: 'warning', feedback: 'Standard won’t arrive before Friday.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Shipping' });
    await expect(group).toHaveAccessibleDescription('Standard won’t arrive before Friday.');
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toHaveAccessibleDescription('3 to 5 business days · Free');
  },
};

/** Phones: every option row is at least 44px tall, and horizontal groups stack. */
export const TestMobileRows: Story = {
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

export const TestReactiveForm: Story = {
  tags: ['!dev'],
  name: 'Test · Reactive form',
  args: ReactiveForm.args,
  parameters: ReactiveForm.parameters,
  render: ReactiveForm.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Express' }));
    await expect(canvas.getByText('Form value: express')).toBeInTheDocument();
  },
};
