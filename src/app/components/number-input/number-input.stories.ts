import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
import { fieldColumn } from '../shared/story-decorators';
import { storySource } from '../shared/story-source';
import { NumberInputComponent } from './number-input';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = {
  label: '', min: null, max: null, step: 1, decimals: 0, unit: '', size: 'md', helpText: '', state: 'none', feedback: '',
  disabled: false, readonly: false, required: false, hideSteppers: false, value: null,
};

const meta: Meta<NumberInputComponent> = {
  title: 'Components/Forms/Number Input',
  component: NumberInputComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] }), fieldColumn],
  parameters: {
    // Accessibility checks fail the tests for number inputs (not just a warning).
    a11y: { test: 'error' },
    controls: {
      exclude: [
        'canDecrease', 'canIncrease', 'clamp', 'commit', 'controlClasses', 'describedBy', 'effectiveState', 'feedbackId',
        'format', 'formDisabled', 'helpId', 'inputId', 'isDisabled', 'message', 'onBlur', 'onChange', 'onInput', 'onKeydown',
        'onTouched', 'outOfRange', 'parse', 'showFeedback', 'shown', 'stepBy', 'text', 'writeValue', 'registerOnChange',
        'registerOnTouched', 'setDisabledState',
      ],
    },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-number-input',
          component: 'NumberInputComponent',
          importPath: './components/number-input/number-input',
          defaults: DEFAULTS,
          models: ['value'],
        }),
      },
    },
  },
  argTypes: {
    valueChange: { action: 'valueChange', table: { category: 'outputs' } },
    blurred: { action: 'blurred', table: { category: 'outputs' } },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number', description: 'How much − and + change it.' },
    decimals: { control: 'number', description: 'Decimal places, like 2 for money. 0 means whole numbers.' },
    unit: { description: 'Text after the number, like "kg" or "%".' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm 32px · md 40px · lg 48px on web. At least 44px on mobile.',
      table: { defaultValue: { summary: 'md' } },
    },
    state: { control: 'inline-radio', options: ['none', 'valid', 'warning', 'invalid'] },
    feedback: { description: 'Your message. Empty: out-of-range numbers get "Enter a number from 1 to 10".' },
    hideSteppers: { description: 'Hides − and +, for numbers nobody steps through, like a year.' },
    value: { control: 'number' },
  },
  args: { label: 'Quantity', min: 1, max: 10, value: 1 },
};

export default meta;
type Story = StoryObj<NumberInputComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Number input' };
export const Decimal: Story = { args: { label: 'Weight', min: 0, max: 50, step: 0.5, decimals: 1, unit: 'kg', value: 2.5 } };
export const OutOfRange: Story = { name: 'Out of range', args: { value: 12 } };

export const ReactiveForm: Story = {
  name: 'Reactive form',
  args: { control: new FormControl<number | null>(2, { validators: [Validators.required] }) } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-number-input label="Guests" [min]="1" [max]="8" [formControl]="control" helpText="Up to 8 per booking." />
<p class="mt-3 mb-0 small text-body-secondary">Form value: {{ control.value ?? 'null' }}</p>` }),
};

// Docs

export const Overview: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: () => ({ template: `
<div class="exos-grid">
  <app-number-input class="exos-col-4 exos-col-md-4 exos-col-lg-5" label="Quantity" [min]="1" [max]="10" [value]="2" />
  <app-number-input class="exos-col-4 exos-col-md-4 exos-col-lg-5" label="Weight" [min]="0" [max]="50" [step]="0.5" [decimals]="1" unit="kg" [value]="2.5" />
</div>` }),
};

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    parts: [
      { n: 1, target: 'label', side: 'left' },
      { n: 2, target: 'input', side: 'left', whole: true },
      { n: 3, target: '.exos-number-unit', side: 'top' },
      { n: 4, target: '.exos-number-step:first-child', side: 'bottom', whole: true },
      { n: 5, target: '.exos-number-step:last-child', side: 'right', whole: true },
      { n: 6, target: '.form-text', side: 'left' },
    ],
  } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="18rem">
  <app-number-input label="Weight" [min]="0" [max]="50" [step]="0.5" [decimals]="1" unit="kg" [value]="2.5" helpText="Up to 50 kg." />
</app-anatomy>` }),
};

export const SizeSwitchable: Story = { tags: ['!dev'], args: { value: 2 } };
export const ModUnit: Story = { tags: ['!dev'], args: { label: 'Discount', min: 0, max: 100, step: 5, unit: '%', value: 15 } };
export const ModDecimals: Story = { tags: ['!dev'], args: { label: 'Weight', min: 0, max: 50, step: 0.5, decimals: 1, unit: 'kg', value: 2.5 } };
export const ModNoSteppers: Story = { tags: ['!dev'], args: { label: 'Year built', min: 1800, max: 2026, hideSteppers: true, value: 1998 } };
export const ModRange: Story = { tags: ['!dev'], args: { label: 'Guests', min: 1, max: 8, value: 9, helpText: 'Up to 8 per booking.' } };

export const AllStates: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: () => ({ template: `
<div class="d-grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr))">
  <app-number-input label="Empty" [min]="1" [max]="10" />
  <app-number-input label="At the minimum" [min]="1" [max]="10" [value]="1" />
  <app-number-input label="Out of range" [min]="1" [max]="10" [value]="12" />
  <app-number-input label="Warning" [min]="1" [max]="99" [value]="40" state="warning" feedback="That’s more than most orders." />
  <app-number-input label="Read only" [value]="3" [readonly]="true" />
  <app-number-input label="Disabled" [value]="3" [disabled]="true" />
</div>` }),
};

export const DoForCounts: Story = { tags: ['!dev'], args: { label: 'Tickets', min: 1, max: 6, value: 2 } };
export const DontForIds: Story = { tags: ['!dev'], args: { label: 'Card number', min: null, max: null, value: 4111111111111111 } };
export const DoSayRange: Story = { tags: ['!dev'], args: { label: 'Guests', min: 1, max: 8, value: 2, helpText: 'Up to 8 per booking.' } };
export const DontHideRange: Story = { tags: ['!dev'], args: { label: 'Guests', min: 1, max: 8, value: 2 } };

// Tests (hidden; they still run)

/** − and + step and stop at the limits; arrow keys and Home / End work; it's a spinbutton. */
export const TestStepping: Story = {
  tags: ['!dev'],
  name: 'Test · Stepping',
  args: { valueChange: fn(), value: 9 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('spinbutton', { name: 'Quantity' });
    await userEvent.click(canvas.getByRole('button', { name: 'Increase Quantity' }));
    await expect(field).toHaveValue('10');
    await expect(canvas.getByRole('button', { name: 'Increase Quantity' })).toBeDisabled();
    field.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(args.valueChange).toHaveBeenLastCalledWith(8);
    await userEvent.keyboard('{Home}');
    await expect(field).toHaveValue('1');
    await expect(field).toHaveAttribute('aria-valuenow', '1');
  },
};

/** Typing out of range says so; leaving the field snaps it back. */
export const TestRange: Story = {
  tags: ['!dev'],
  name: 'Test · Out of range',
  args: { value: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('spinbutton', { name: 'Quantity' });
    await userEvent.type(field, '25');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription('Enter a number from 1 to 10.');
    await userEvent.tab();
    await expect(field).toHaveValue('10');
    await expect(field).not.toHaveAttribute('aria-invalid');
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
    await userEvent.click(canvas.getByRole('button', { name: 'Increase Guests' }));
    await expect(canvas.getByText('Form value: 3')).toBeInTheDocument();
  },
};
