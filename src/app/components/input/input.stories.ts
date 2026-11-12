import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { fieldColumn } from '../shared/story-decorators';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { RadioGroupComponent } from '../radio-group/radio-group';
import { InputComponent } from './input';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = {
  label: '',
  hideLabel: false,
  placeholder: '',
  type: 'text',
  size: 'md',
  appearance: 'outline',
  floatingLabel: false,
  icon: 'none',
  prefix: '',
  suffix: '',
  helpText: '',
  state: 'none',
  feedback: '',
  disabled: false,
  readonly: false,
  required: false,
  optional: false,
  name: null,
  autocomplete: null,
  inputMode: null,
  enterKeyHint: null,
  autocapitalize: null,
  maxLength: null,
  showCount: false,
  clearable: false,
  rows: 3,
  autoResize: false,
  maxRows: 8,
  value: '',
};

const meta: Meta<InputComponent> = {
  title: 'Components/Forms/Input',
  component: InputComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] }), fieldColumn],
  parameters: {
    // Accessibility checks fail the tests for inputs (not just a warning).
    a11y: { test: 'error' },
    // Internal members: keep the API table to real inputs and outputs.
    controls: {
      exclude: [
        'capitalize', 'clear', 'controlClasses', 'exact', 'countId', 'counter', 'describedBy', 'feedbackClass', 'feedbackId', 'field', 'fit',
        'formDisabled', 'groupClasses', 'hasGroup', 'hasLeading', 'helpId', 'isDisabled', 'isTextarea', 'nativeType',
        'onBlur', 'onChange', 'onInput', 'onTouched', 'revealed', 'showClear', 'showFeedback', 'showReveal',
        'toggleReveal', 'trailingSlots', 'useWrap', 'wrapClasses', 'inputId', 'writeValue', 'registerOnChange',
        'registerOnTouched', 'setDisabledState',
      ],
    },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-input',
          component: 'InputComponent',
          importPath: './components/input/input',
          defaults: DEFAULTS,
          models: ['value'],
        }),
      },
    },
  },
  argTypes: {
    valueChange: { action: 'valueChange', table: { category: 'outputs' } },
    blurred: { action: 'blurred', table: { category: 'outputs' } },
    cleared: { action: 'cleared', table: { category: 'outputs' } },
    label: { description: 'Always set one. It names the field for screen readers too.' },
    hideLabel: { description: 'Hides the label on screen but keeps it for screen readers.' },
    placeholder: { description: 'An example of the format, like name@example.com. Never the only label.' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url', 'textarea'],
      description: 'textarea: several lines. The rest are native input types.',
      table: { defaultValue: { summary: 'text' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm 32px · md 40px · lg 48px on web. At least 44px on mobile.',
      table: { defaultValue: { summary: 'md' } },
    },
    appearance: {
      control: 'inline-radio',
      options: ['outline', 'filled', 'pill'],
      description: 'outline: most forms · filled: search and toolbars · pill: short, casual fields.',
      table: { defaultValue: { summary: 'outline' } },
    },
    icon: { control: 'inline-radio', options: ['none', 'search'], table: { defaultValue: { summary: 'none' } } },
    state: {
      control: 'inline-radio',
      options: ['none', 'valid', 'warning', 'invalid'],
      description: 'invalid: must be fixed · warning: allowed, but check it · valid: confirmed.',
      table: { defaultValue: { summary: 'none' } },
    },
    feedback: { description: 'The message under the field for valid, warning and invalid.' },
    optional: { description: 'Adds "(optional)" after the label.' },
    inputMode: {
      control: 'select',
      options: [null, 'text', 'numeric', 'decimal', 'tel', 'email', 'url', 'search', 'none'],
      description: 'Keyboard on phones, like numeric for codes. Email, tel and url types pick theirs.',
      table: { category: 'Mobile' },
    },
    enterKeyHint: {
      control: 'select',
      options: [null, 'enter', 'done', 'go', 'next', 'previous', 'search', 'send'],
      description: 'Return key label on phones.',
      table: { category: 'Mobile' },
    },
    autocapitalize: {
      control: 'select',
      options: [null, 'none', 'sentences', 'words', 'characters'],
      description: 'Capitals on phones. Unset: off for emails, URLs, passwords, phone numbers, usernames and codes.',
      table: { category: 'Mobile' },
    },
    autocomplete: { description: 'Lets browsers and password managers fill the field, like "email".' },
    floatingLabel: { description: 'Label inside the field that moves up as you type. Ignores icon, prefix and suffix.' },
    prefix: { description: 'Fixed text before the field, like $. Single line only.' },
    suffix: { description: 'Fixed text after the field, like kg. Single line only.' },
    maxLength: { control: 'number', description: 'Native maxlength.' },
    showCount: { description: 'Shows "12 / 140" under the field.' },
    clearable: { description: 'Adds a × button once there is text. Emits `cleared`.' },
    rows: { control: 'number', description: 'Textarea: visible lines.', table: { category: 'Textarea', defaultValue: { summary: '3' } } },
    autoResize: {
      description: 'Textarea: grows with the text from `rows` to `maxRows`.',
      table: { category: 'Textarea', defaultValue: { summary: 'false' } },
    },
    maxRows: { control: 'number', description: 'Textarea: tallest it grows.', table: { category: 'Textarea', defaultValue: { summary: '8' } } },
    inputId: { table: { disable: true } },
  },
  args: { label: 'Full name', autocomplete: 'name' },
};

export default meta;
type Story = StoryObj<InputComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Input' };
export const Textarea: Story = { args: { type: 'textarea', label: 'Message', autocomplete: null } };
export const WithHelpText: Story = { args: { label: 'Email', type: 'email', autocomplete: 'email', helpText: "We'll send the receipt here." } };
export const Search: Story = {
  args: { label: 'Search', hideLabel: true, placeholder: 'Search', type: 'search', appearance: 'filled', icon: 'search', clearable: true, autocomplete: null },
};
export const Password: Story = { args: { label: 'Password', type: 'password', autocomplete: 'current-password', value: 'correct-horse' } };
export const Warning: Story = {
  args: { label: 'Date of birth', autocomplete: 'bday', value: '01/01/1900', state: 'warning', feedback: 'That date is over 120 years ago. Check the year.' },
};
export const Invalid: Story = {
  args: { label: 'Email', type: 'email', autocomplete: 'email', value: 'name@example', required: true, state: 'invalid', feedback: 'Enter an email address like name@example.com.' },
};
export const Disabled: Story = { args: { value: 'Alex Morgan', disabled: true } };
export const Readonly: Story = { args: { label: 'Order number', value: '48213', readonly: true, autocomplete: null } };

export const ReactiveForm: Story = {
  name: 'Reactive form',
  args: { control: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }) } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-input
  label="Email"
  type="email"
  autocomplete="email"
  [required]="true"
  [formControl]="control"
  [state]="control.touched && control.invalid ? 'invalid' : 'none'"
  feedback="Enter an email address like name@example.com."
/>
<p class="mt-3 mb-0 small text-body-secondary">Form value: {{ control.value || '(empty)' }} · {{ control.valid ? 'valid' : 'invalid' }}</p>` }),
};

// Docs: live demo. The same form on a phone (one column, keyboard hints) and on web (grid).

export const MobileExample: Story = {
  name: 'Mobile layout',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: () => ({ template: `
<form class="exos-grid">
  <app-input class="exos-col-4" label="Full name" autocomplete="name" enterKeyHint="next" />
  <app-input class="exos-col-4" label="Email" type="email" autocomplete="email" enterKeyHint="next" helpText="We'll send the receipt here." />
  <app-input class="exos-col-4" label="Phone" type="tel" autocomplete="tel" enterKeyHint="next" [optional]="true" />
  <app-input class="exos-col-4" label="Message" type="textarea" [rows]="3" [autoResize]="true" [maxLength]="500" [showCount]="true" enterKeyHint="send" />
</form>` }),
};

export const WebExample: Story = {
  name: 'Web layout',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: () => ({ template: `
<form class="exos-grid">
  <app-input class="exos-col-lg-8" label="Full name" autocomplete="name" />
  <app-input class="exos-col-lg-8" label="Email" type="email" autocomplete="email" helpText="We'll send the receipt here." />
  <app-input class="exos-col-lg-5" label="Phone" type="tel" autocomplete="tel" [optional]="true" />
  <app-input class="exos-col-lg-16" label="Message" type="textarea" [rows]="4" [maxLength]="500" [showCount]="true" />
</form>` }),
};

// The same layouts at their device width in the main canvas. Open these from the sidebar.

export const OnMobile: Story = {
  ...MobileExample,
  name: 'On mobile (375)',
  tags: ['!autodocs'],
  globals: { viewport: { value: 'exosMobile', isRotated: false } },
};

export const OnWeb: Story = {
  ...WebExample,
  name: 'On web (1312)',
  tags: ['!autodocs'],
  globals: { viewport: { value: 'exosDesktop', isRotated: false } },
};

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  args: {
    parts: [
      { n: 1, target: 'label.form-label', side: 'left' },
      { n: 2, target: 'input', side: 'left', whole: true },
      { n: 3, target: 'input', side: 'right', whole: true },
      { n: 4, target: '.invalid-feedback', side: 'left' },
      { n: 5, target: '.form-text:not(.form-field-count)', side: 'left' },
      { n: 6, target: '.form-field-count', side: 'right' },
    ],
  } as Story['args'],
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="18rem">
  <app-input label="Email" type="email" value="name@example" [required]="true" state="invalid" feedback="Enter an email like name@example.com." helpText="For the receipt." [maxLength]="60" [showCount]="true" />
</app-anatomy>` }),
};

// Docs: one decision each (clean code)

/** Base for the appearance and size switches: one field; the switch changes one input. */
export const Switchable: Story = { tags: ['!dev'], args: { label: 'Full name', value: 'Alex Morgan' } };

export const VarSingle: Story = { tags: ['!dev'], args: { label: 'Full name' } };
export const VarTextarea: Story = { tags: ['!dev'], args: { label: 'Message', type: 'textarea', autocomplete: null } };

export const ModHelp: Story = { tags: ['!dev'], args: { label: 'Email', type: 'email', autocomplete: 'email', helpText: "We'll send the receipt here." } };
export const ModOptional: Story = { tags: ['!dev'], args: { label: 'Phone', type: 'tel', autocomplete: 'tel', optional: true } };
export const ModRequired: Story = { tags: ['!dev'], args: { label: 'Email', type: 'email', autocomplete: 'email', required: true } };
export const ModSearch: Story = {
  tags: ['!dev'],
  args: { label: 'Search', hideLabel: true, placeholder: 'Search', type: 'search', appearance: 'filled', icon: 'search', autocomplete: null },
};
export const ModClear: Story = { tags: ['!dev'], args: { label: 'City', autocomplete: 'address-level2', value: 'Portland', clearable: true } };
export const ModPassword: Story = { tags: ['!dev'], args: { label: 'Password', type: 'password', autocomplete: 'current-password', value: 'correct-horse' } };
export const ModAffix: Story = {
  tags: ['!dev'],
  args: { label: 'Amount', inputMode: 'decimal', autocomplete: null, placeholder: '0.00', prefix: '$', suffix: 'USD' },
};
export const ModCount: Story = { tags: ['!dev'], args: { label: 'Display name', autocomplete: 'nickname', value: 'alex.m', maxLength: 30, showCount: true } };
export const ModAutoResize: Story = {
  tags: ['!dev'],
  args: { label: 'Message', type: 'textarea', autocomplete: null, rows: 2, autoResize: true, maxRows: 6, placeholder: 'Starts at 2 lines and grows to 6' },
};
export const ModFloating: Story = { tags: ['!dev'], args: { label: 'Email', type: 'email', autocomplete: 'email', floatingLabel: true } };
export const ModKeyboard: Story = {
  tags: ['!dev'],
  args: { label: 'Verification code', autocomplete: 'one-time-code', inputMode: 'numeric', enterKeyHint: 'done', maxLength: 6, helpText: 'The 6-digit code we texted you.' },
};

// Docs: states (visual reference, no code)

export const AllStates: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: () => ({ template: `
<div class="d-grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr))">
  <app-input label="Empty" placeholder="name@example.com" />
  <app-input label="Filled" value="alex@example.com" />
  <app-input label="Valid" value="alex@example.com" state="valid" feedback="Email confirmed." />
  <app-input label="Warning" value="alex@exmaple.com" state="warning" feedback="Did you mean example.com?" />
  <app-input label="Invalid" value="alex@example" state="invalid" feedback="Enter an email like name@example.com." />
  <app-input label="Disabled" value="alex@example.com" [disabled]="true" />
  <app-input label="Read only" value="alex@example.com" [readonly]="true" />
  <app-input label="Text area, invalid" type="textarea" [rows]="2" state="invalid" feedback="Add a message." />
</div>` }),
};

// Docs: Do / Don't

export const DoLabel: Story = { tags: ['!dev'], args: { label: 'Email', type: 'email', placeholder: 'name@example.com', autocomplete: 'email' } };
export const DontPlaceholderLabel: Story = {
  tags: ['!dev'],
  args: { label: '', placeholder: 'Email', type: 'email', autocomplete: 'email' },
};
export const DoSpecificError: Story = {
  tags: ['!dev'],
  args: { label: 'Email', type: 'email', autocomplete: 'email', value: 'alex@example', state: 'invalid', feedback: 'Enter an email like name@example.com.' },
};
export const DontVagueError: Story = {
  tags: ['!dev'],
  args: { label: 'Email', type: 'email', autocomplete: 'email', value: 'alex@example', state: 'invalid', feedback: 'Invalid input.' },
};
export const DoFitWidth: Story = {
  tags: ['!dev'],
  parameters: { fullWidth: true },
  render: () => ({ template: `
<div class="d-flex gap-3 px-4">
  <app-input style="width: 7rem" label="ZIP code" autocomplete="postal-code" inputMode="numeric" value="97201" />
  <app-input style="width: 5rem" label="State" autocomplete="address-level1" value="OR" />
</div>` }),
};
export const DontFullWidth: Story = {
  tags: ['!dev'],
  parameters: { fullWidth: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-2 px-4">
  <app-input label="ZIP code" autocomplete="postal-code" value="97201" />
  <app-input label="State" autocomplete="address-level1" value="OR" />
</div>` }),
};
export const DoMarkOptional: Story = {
  tags: ['!dev'],
  render: () => ({ template: `
<div class="d-flex flex-column gap-2">
  <app-input label="Full name" autocomplete="name" />
  <app-input label="Company" autocomplete="organization" [optional]="true" />
</div>` }),
};
export const DontMarkEverything: Story = {
  tags: ['!dev'],
  render: () => ({ template: `
<div class="d-flex flex-column gap-2">
  <app-input label="Full name" autocomplete="name" [required]="true" />
  <app-input label="Email" type="email" autocomplete="email" [required]="true" />
  <app-input label="Company" autocomplete="organization" [optional]="true" />
</div>` }),
};

// Phones: ask people to type only when needed, and stack fields.
export const DoOfferChoices: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [RadioGroupComponent] })],
  render: () => ({
    props: { sizes: [{ label: 'Small', value: 's' }, { label: 'Medium', value: 'm' }, { label: 'Large', value: 'l' }] },
    template: `<app-radio-group label="Size" [options]="sizes" value="m" [inline]="true" />`,
  }),
};
export const DontTypeKnownAnswer: Story = {
  tags: ['!dev'],
  args: { label: 'Size', placeholder: 'Small, medium or large', autocomplete: null },
};
export const DoStackOnPhone: Story = {
  tags: ['!dev'],
  render: () => ({ template: `
<div class="d-flex flex-column gap-2" style="width: 260px; margin: 0 auto">
  <app-input label="City" autocomplete="address-level2" value="Portland" />
  <div class="d-flex gap-2">
    <app-input style="width: 5rem" label="State" autocomplete="address-level1" value="OR" />
    <app-input style="width: 7rem" label="ZIP code" autocomplete="postal-code" inputMode="numeric" value="97201" />
  </div>
</div>` }),
};
export const DontCrampOnPhone: Story = {
  tags: ['!dev'],
  render: () => ({ template: `
<div class="d-flex gap-1" style="width: 260px; margin: 0 auto">
  <app-input label="City" autocomplete="address-level2" value="Portland" />
  <app-input label="State" autocomplete="address-level1" value="OR" />
  <app-input label="ZIP code" autocomplete="postal-code" value="97201" />
</div>` }),
};

// Docs: edge cases

export const EdgeLongValue: Story = {
  tags: ['!dev'],
  args: { label: 'Address', autocomplete: 'street-address', value: '1234 Northwest Longstreet Boulevard, Apartment 56B' },
};
export const EdgeLongLabel: Story = {
  tags: ['!dev'],
  args: { label: 'Name of the person we should contact if we can’t reach you', autocomplete: null },
};
export const EdgeLongError: Story = {
  tags: ['!dev'],
  args: {
    label: 'Password',
    type: 'password',
    autocomplete: 'new-password',
    value: 'abc',
    state: 'invalid',
    feedback: 'Use at least 12 characters, with a mix of letters, numbers and symbols.',
  },
};

// Tests (hidden; they still run)

/** 32 / 40 / 48px on web; at least 44px with 16px text on mobile. */
export const TestSizes: Story = {
  tags: ['!dev'],
  name: 'Test · Sizes',
  render: () => ({ template: `<app-input id="sm" size="sm" label="Small" /><app-input id="md" label="Medium" /><app-input id="lg" size="lg" label="Large" />` }),
  play: async ({ canvasElement }) => {
    const mobile = canvasElement.ownerDocument.defaultView!.innerWidth < 672;
    for (const [id, web] of [['sm', 32], ['md', 40], ['lg', 48]] as const) {
      const field = canvasElement.querySelector<HTMLElement>(`#${id} input`)!;
      await expect(Math.round(field.getBoundingClientRect().height)).toBe(mobile ? Math.max(web, 44) : web);
      if (mobile) await expect(parseFloat(getComputedStyle(field).fontSize)).toBeGreaterThanOrEqual(16);
    }
  },
};

/** What a screen reader gets for an invalid email: name, required, invalid and the message. */
export const TestScreenReader: Story = {
  tags: ['!dev'],
  name: 'Test · Screen reader text',
  args: { ...Invalid.args, helpText: "We'll send the receipt here." },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Email' });
    await expect(field).toBeRequired();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription("Enter an email address like name@example.com. We'll send the receipt here.");
  },
};

/** Optional and hidden labels are still in the accessible name. */
export const TestLabels: Story = {
  tags: ['!dev'],
  name: 'Test · Optional and hidden labels',
  render: () => ({ template: `<app-input label="Phone" type="tel" [optional]="true" /><app-input label="Search" [hideLabel]="true" type="search" icon="search" />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Phone (optional)' })).toBeInTheDocument();
    await expect(canvas.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
    await expect(canvas.getByText('Search')).toHaveClass('visually-hidden');
  },
};

/** Exact values get no capitals, autocorrect or spell check on phones; names keep them. */
export const TestExactValues: Story = {
  tags: ['!dev'],
  name: 'Test · No autocorrect on exact values',
  render: () => ({ template: `<app-input label="Email" type="email" /><app-input label="Username" autocomplete="username" /><app-input label="Full name" autocomplete="name" autocapitalize="words" />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Email', 'Username']) {
      const field = canvas.getByRole('textbox', { name });
      await expect(field).toHaveAttribute('autocapitalize', 'none');
      await expect(field).toHaveAttribute('autocorrect', 'off');
      await expect(field).toHaveAttribute('spellcheck', 'false');
    }
    const name = canvas.getByRole('textbox', { name: 'Full name' });
    await expect(name).toHaveAttribute('autocapitalize', 'words');
    await expect(name).not.toHaveAttribute('autocorrect');
  },
};

/** Phone keyboard hints reach the native field. */
export const TestKeyboardHints: Story = {
  tags: ['!dev'],
  name: 'Test · Phone keyboard hints',
  args: ModKeyboard.args,
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Verification code' });
    await expect(field).toHaveAttribute('inputmode', 'numeric');
    await expect(field).toHaveAttribute('enterkeyhint', 'done');
    await expect(field).toHaveAttribute('autocomplete', 'one-time-code');
  },
};

export const TestClear: Story = {
  tags: ['!dev'],
  name: 'Test · Clear',
  args: { cleared: fn(), label: 'City', value: 'Portland', clearable: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'City' });
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(field).toHaveValue('');
    await expect(field).toHaveFocus();
    await expect(args.cleared).toHaveBeenCalled();
    await expect(canvas.queryByRole('button', { name: 'Clear' })).toBeNull();
  },
};

export const TestPasswordReveal: Story = {
  tags: ['!dev'],
  name: 'Test · Show password',
  args: Password.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvasElement.querySelector('input')!;
    await expect(field).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }));
    await expect(field).toHaveAttribute('type', 'text');
    await userEvent.click(canvas.getByRole('button', { name: 'Hide password' }));
    await expect(field).toHaveAttribute('type', 'password');
  },
};

export const TestCountAndAutoResize: Story = {
  tags: ['!dev'],
  name: 'Test · Count and auto-resize',
  args: { type: 'textarea', label: 'Comments', autocomplete: null, rows: 2, autoResize: true, maxRows: 5, maxLength: 200, showCount: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Comments' });
    const start = field.getBoundingClientRect().height;
    await userEvent.type(field, 'one{Enter}two{Enter}three{Enter}four');
    await expect(canvas.getByText('18 / 200')).toBeInTheDocument();
    await expect(field.getBoundingClientRect().height).toBeGreaterThan(start);
  },
};

/** Reactive forms: typing updates the control; the error shows after leaving the field. */
export const TestReactiveForm: Story = {
  tags: ['!dev'],
  name: 'Test · Reactive form',
  args: ReactiveForm.args,
  parameters: ReactiveForm.parameters,
  render: ReactiveForm.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Email' });
    await userEvent.type(field, 'alex');
    await expect(field).not.toHaveAttribute('aria-invalid');
    await userEvent.tab();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(field, '@example.com');
    await expect(field).not.toHaveAttribute('aria-invalid');
    await expect(canvas.getByText(/alex@example\.com · valid/)).toBeInTheDocument();
  },
};


// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'size', target: 'input', side: 'right', label: '{v} tall' },
  { kind: 'style', target: 'input', prop: 'font-size', side: 'top', label: '{v} text' },
  { kind: 'style', target: '.form-label', prop: 'font-size', side: 'top', label: '{v} label' },
  { kind: 'padding', target: 'input', label: '{v} top and bottom', labelSides: '{v} left and right' },
  { kind: 'gap', from: '.form-label', to: 'input', side: 'right', label: '{v} label to field' },
  { kind: 'gap', from: 'input', to: '.form-text', side: 'right', label: '{v} to help text' },
  { kind: 'gap', from: 'input', to: '.invalid-feedback', side: 'right', label: '{v} to error' },
  { kind: 'style', target: '.form-text', prop: 'font-size', side: 'bottom', label: '{v} help text, grey' },
  { kind: 'style', target: '.invalid-feedback', prop: 'font-size', side: 'bottom', label: '{v} error text, red' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { fullWidth: true, controls: { disable: true }, example: true, specs: { sizes: true, switches: [{ arg: 'note', label: 'Message', initial: 'help', options: [{ value: 'help', label: 'Help text', short: 'Help' }, { value: 'error', label: 'Error', short: 'Error' }] }] } },
  args: { size: 'md', note: 'help' } as Story['args'],
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS },
    template: `<app-redline [marks]="marks" [scale]="1.3" [room]="150" [key]="false"><div style="width: min(18rem, calc(100vw - 200px))"><app-input label="Full name" placeholder="Alex Morgan" [size]="size" [helpText]="note === 'help' ? 'As it appears on your ID.' : ''" [state]="note === 'error' ? 'invalid' : 'none'" [feedback]="note === 'error' ? 'Enter your full name.' : ''" /></div></app-redline>`,
  }),
};
