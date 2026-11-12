import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
import { fieldColumn } from '../shared/story-decorators';
import { storySource } from '../shared/story-source';
import { DatePickerComponent } from './date-picker';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = {
  label: '', hideLabel: false, min: null, max: null, size: 'md', helpText: '', state: 'none', feedback: '', disabled: false,
  readonly: false, required: false, optional: false, value: '',
};

const meta: Meta<DatePickerComponent> = {
  title: 'Components/Forms/Date Picker',
  component: DatePickerComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] }), fieldColumn],
  parameters: {
    // Accessibility checks fail the tests for date pickers (not just a warning).
    a11y: { test: 'error' },
    controls: {
      exclude: [
        'controlClasses', 'describedBy', 'feedbackId', 'formDisabled', 'helpId', 'inputId', 'isDisabled', 'onBlur', 'onChange',
        'onInput', 'onTouched', 'showFeedback', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState',
      ],
    },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-date-picker',
          component: 'DatePickerComponent',
          importPath: './components/date-picker/date-picker',
          defaults: DEFAULTS,
          models: ['value'],
        }),
      },
    },
  },
  argTypes: {
    valueChange: { action: 'valueChange', table: { category: 'outputs' } },
    blurred: { action: 'blurred', table: { category: 'outputs' } },
    value: { description: 'ISO date, like "2026-11-20". Empty string when nothing is picked.' },
    min: { control: 'text', description: 'Earliest date, ISO.' },
    max: { control: 'text', description: 'Latest date, ISO.' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm 32px · md 40px · lg 48px on web. At least 44px on mobile.',
      table: { defaultValue: { summary: 'md' } },
    },
    state: { control: 'inline-radio', options: ['none', 'valid', 'warning', 'invalid'] },
  },
  args: { label: 'Delivery date', min: '2026-11-12', max: '2026-12-31', value: '' },
};

export default meta;
type Story = StoryObj<DatePickerComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Date picker' };
export const Picked: Story = { args: { value: '2026-11-20' } };
export const Invalid: Story = { args: { required: true, state: 'invalid', feedback: 'Choose a delivery date.' } };

export const ReactiveForm: Story = {
  name: 'Reactive form',
  args: { control: new FormControl('', { nonNullable: true, validators: [Validators.required] }) } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-date-picker label="Delivery date" min="2026-11-12" [required]="true" [formControl]="control"
  [state]="control.touched && control.invalid ? 'invalid' : 'none'" feedback="Choose a delivery date." />
<p class="mt-3 mb-0 small text-body-secondary">Form value: {{ control.value || '(empty)' }}</p>` }),
};

// Docs

export const Overview: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: () => ({ template: `
<div class="exos-grid">
  <app-date-picker class="exos-col-4 exos-col-md-4 exos-col-lg-5" label="Check in" min="2026-11-12" value="2026-11-20" />
  <app-date-picker class="exos-col-4 exos-col-md-4 exos-col-lg-5" label="Check out" min="2026-11-21" helpText="Up to 30 nights." />
</div>` }),
};

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    parts: [
      { n: 1, target: 'label', side: 'left' },
      { n: 2, target: 'input', side: 'left', whole: true },
      { n: 3, target: 'input', side: 'right', whole: true },
      { n: 4, target: '.form-text', side: 'left' },
    ],
  } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="18rem">
  <app-date-picker label="Delivery date" value="2026-11-20" helpText="We deliver Monday to Saturday." />
</app-anatomy>` }),
};

export const SizeSwitchable: Story = { tags: ['!dev'], args: { value: '2026-11-20' } };
export const ModRange: Story = { tags: ['!dev'], args: { helpText: 'From tomorrow until Dec 31.' } };
export const ModRangePair: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <app-date-picker label="Check in" min="2026-11-12" value="2026-11-20" />
  <app-date-picker label="Check out" min="2026-11-21" value="2026-11-23" helpText="2 nights" />
</div>` }),
};
export const ModOptional: Story = { tags: ['!dev'], args: { label: 'Date of birth', min: null, max: '2026-11-11', optional: true } };

export const AllStates: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: () => ({ template: `
<div class="d-grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr))">
  <app-date-picker label="Empty" />
  <app-date-picker label="Picked" value="2026-11-20" />
  <app-date-picker label="Warning" value="2026-12-24" state="warning" feedback="Deliveries may be late around holidays." />
  <app-date-picker label="Invalid" state="invalid" feedback="Choose a date." />
  <app-date-picker label="Read only" value="2026-11-20" [readonly]="true" />
  <app-date-picker label="Disabled" value="2026-11-20" [disabled]="true" />
</div>` }),
};

export const DoLimitDates: Story = { tags: ['!dev'], args: { helpText: 'From tomorrow until Dec 31.' } };
export const DontFreeText: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `<div class="d-flex flex-column"><label class="form-label" for="dob-text">Delivery date</label><input id="dob-text" class="form-control" placeholder="DD/MM/YYYY or MM/DD/YYYY" /></div>` }),
};

// Tests (hidden; they still run)

/** A real date field: ISO value out, min and max passed on, labelled. */
export const TestValue: Story = {
  tags: ['!dev'],
  name: 'Test · Value',
  args: { valueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const field = within(canvasElement).getByLabelText('Delivery date') as HTMLInputElement;
    await expect(field.type).toBe('date');
    await expect(field).toHaveAttribute('min', '2026-11-12');
    await userEvent.type(field, '2026-11-20');
    await expect(args.valueChange).toHaveBeenLastCalledWith('2026-11-20');
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
    await userEvent.type(canvas.getByLabelText(/Delivery date/), '2026-11-25');
    await expect(canvas.getByText('Form value: 2026-11-25')).toBeInTheDocument();
  },
};
