import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { storySource } from '../shared/story-source';
import { InputComponent } from './input';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = {
  label: '',
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
  name: null,
  autocomplete: null,
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
  parameters: {
    // Internal members: keep the API table to real inputs and outputs.
    controls: { exclude: ['clear', 'controlClasses', 'countId', 'counter', 'describedBy', 'feedbackId', 'field', 'fit', 'formDisabled', 'groupClasses', 'hasGroup', 'hasLeading', 'helpId', 'isDisabled', 'isTextarea', 'nativeType', 'onBlur', 'onChange', 'onInput', 'onTouched', 'revealed', 'showClear', 'showFeedback', 'showReveal', 'toggleReveal', 'trailingSlots', 'useWrap', 'wrapClasses', 'inputId', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'] },
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
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url', 'textarea'],
      table: { defaultValue: { summary: 'text' } },
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], table: { defaultValue: { summary: 'md' } } },
    appearance: {
      control: 'inline-radio',
      options: ['outline', 'filled', 'pill'],
      description: 'outline: "Add a room" field · filled: search field · pill: detail field',
      table: { defaultValue: { summary: 'outline' } },
    },
    icon: { control: 'inline-radio', options: ['none', 'search'], table: { defaultValue: { summary: 'none' } } },
    state: { control: 'inline-radio', options: ['none', 'valid', 'invalid'], table: { defaultValue: { summary: 'none' } } },
    floatingLabel: { description: 'Bootstrap floating label. Ignores icon, prefix and suffix.' },
    prefix: { description: 'Text before the field (input group). Single-line only.' },
    suffix: { description: 'Text after the field (input group). Single-line only.' },
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
  args: {
    label: 'Room name',
    placeholder: 'e.g. Sunroom',
  },
  decorators: [componentWrapperDecorator((story) => `<div style="max-width: 24rem">${story}</div>`)],
};

export default meta;
type Story = StoryObj<InputComponent>;

// Single line
export const Default: Story = {};
export const WithHelpText: Story = { args: { helpText: 'Name a room that isn’t on the shot list.' } };
export const Required: Story = { args: { required: true } };
export const Search: Story = {
  args: { label: '', placeholder: 'Search or type a new view', appearance: 'filled', icon: 'search', type: 'search', clearable: true },
};
export const Pill: Story = { args: { label: '', placeholder: 'Add a detail (optional)', appearance: 'pill' } };
export const FloatingLabel: Story = { args: { floatingLabel: true, label: 'Email address', placeholder: '', type: 'email' } };
export const PrefixAndSuffix: Story = {
  args: { label: 'Repair estimate', placeholder: '0', type: 'number', prefix: '$', suffix: '.00' },
};
export const CharacterCount: Story = {
  args: { label: 'Short title', value: 'Water damage', maxLength: 40, showCount: true, helpText: 'Shown on the report.' },
};

// Textarea
export const Textarea: Story = {
  args: { type: 'textarea', label: 'Additional comments', placeholder: 'Add anything the report should say…' },
};
export const TextareaAutoResize: Story = {
  name: 'Textarea · Auto-resize',
  args: {
    type: 'textarea',
    label: 'Additional comments',
    placeholder: 'Starts at 2 lines, grows to 6, then scrolls',
    rows: 2,
    autoResize: true,
    maxRows: 6,
  },
};
export const TextareaWithCount: Story = {
  name: 'Textarea · Character count',
  args: {
    type: 'textarea',
    label: 'Additional comments',
    value: 'Missing shingles on the front slope; peeling paint on the trim.',
    maxLength: 280,
    showCount: true,
    helpText: 'Summarized from your voice notes.',
  },
};
export const TextareaPill: Story = {
  name: 'Textarea · Pill',
  args: { type: 'textarea', label: '', placeholder: 'Edit by typing or speaking…', appearance: 'pill', rows: 2, autoResize: true },
};
export const TextareaFloating: Story = {
  name: 'Textarea · Floating label',
  args: { type: 'textarea', floatingLabel: true, label: 'Comments', placeholder: '', rows: 4 },
};
export const TextareaInvalid: Story = {
  name: 'Textarea · Invalid',
  args: {
    type: 'textarea',
    label: 'Reason',
    required: true,
    state: 'invalid',
    feedback: 'Tell us why the photo is missing.',
  },
};

// Clear and password
export const Clearable: Story = { args: { value: 'Sunroom', clearable: true } };
export const Password: Story = { args: { label: 'Lockbox code', type: 'password', value: '4827', placeholder: '••••' } };

// States
export const Invalid: Story = { args: { value: 'Kitchen', state: 'invalid', feedback: 'Kitchen is already on the shot list.' } };
export const Valid: Story = { args: { value: 'Sunroom', state: 'valid', feedback: 'Looks good. It’ll be added as a new interior view.' } };
export const Disabled: Story = { args: { value: 'Living room', disabled: true } };
export const Readonly: Story = { args: { label: 'Order number', value: 'PCR-48213', readonly: true } };

// Overviews
/** Every appearance, single-line and textarea. */
export const Appearances: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <app-input label="Outline" placeholder="Room name" />
  <app-input label="Filled" placeholder="Search or type a new view" appearance="filled" icon="search" />
  <app-input label="Pill" placeholder="Add a detail (optional)" appearance="pill" />
  <app-input label="Outline textarea" type="textarea" placeholder="Comments" [rows]="2" />
  <app-input label="Filled textarea" type="textarea" appearance="filled" placeholder="Comments" [rows]="2" />
  <app-input label="Pill textarea" type="textarea" appearance="pill" placeholder="Comments" [rows]="2" />
</div>` }),
};

export const Sizes: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <app-input label="Small" size="sm" placeholder="Room name" [clearable]="true" value="Sunroom" />
  <app-input label="Medium" placeholder="Room name" [clearable]="true" value="Sunroom" />
  <app-input label="Large" size="lg" placeholder="Room name" [clearable]="true" value="Sunroom" />
</div>` }),
};

export const States: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <app-input label="Default" placeholder="Room name" />
  <app-input label="Valid" value="Sunroom" state="valid" feedback="Looks good." />
  <app-input label="Invalid" value="Kitchen" state="invalid" feedback="Already on the shot list." />
  <app-input label="Invalid, clearable" value="Kitchen" state="invalid" feedback="Already on the shot list." [clearable]="true" />
  <app-input label="Disabled" value="Living room" [disabled]="true" />
  <app-input label="Readonly" value="PCR-48213" [readonly]="true" />
</div>` }),
};

// Behaviour tests
export const TestClear: Story = {
  name: 'Test · Clear',
  args: { cleared: fn(), value: 'Sunroom', clearable: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Room name' });
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(field).toHaveValue('');
    await expect(field).toHaveFocus();
    await expect(args.cleared).toHaveBeenCalled();
    await expect(canvas.queryByRole('button', { name: 'Clear' })).toBeNull();
  },
};

export const TestPasswordReveal: Story = {
  name: 'Test · Show password',
  args: { label: 'Lockbox code', type: 'password', value: '4827' },
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
  name: 'Test · Count and auto-resize',
  args: { type: 'textarea', label: 'Comments', rows: 2, autoResize: true, maxRows: 5, maxLength: 200, showCount: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Comments' });
    const start = field.getBoundingClientRect().height;
    await userEvent.type(field, 'one{Enter}two{Enter}three{Enter}four');
    await expect(canvas.getByText('18 / 200')).toBeInTheDocument();
    await expect(field.getBoundingClientRect().height).toBeGreaterThan(start);
  },
};

// Docs-page showcases (hidden from the sidebar).

export const LabelsShowcase: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <app-input label="Room name" placeholder="e.g. Sunroom" helpText="Name a room that isn’t on the shot list." [required]="true" />
  <app-input label="Email address" type="email" [floatingLabel]="true" />
  <app-input label="Repair estimate" type="number" placeholder="0" prefix="$" suffix=".00" />
</div>` }),
};

export const TextareaShowcase: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <app-input type="textarea" label="Comments" placeholder="Fixed at 3 rows; drag the corner to resize" />
  <app-input type="textarea" label="Notes" placeholder="Starts at 2 rows and grows to 6" [rows]="2" [autoResize]="true" [maxRows]="6" />
</div>` }),
};

export const ExtrasShowcase: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <app-input label="Short title" value="Water damage" [maxLength]="40" [showCount]="true" />
  <app-input label="Room name" value="Sunroom" [clearable]="true" />
  <app-input label="Lockbox code" type="password" value="4827" />
</div>` }),
};
