import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';
import { SelectComponent, SelectOption } from './select';
import { storySource } from '../shared/story-source';

const ROOMS: SelectOption[] = [
  { label: 'Living room', value: 'living' },
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Bathroom', value: 'bath' },
  { label: 'Office', value: 'office' },
  { label: 'Basement', value: 'basement', disabled: true },
];

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { label: '', options: [], placeholder: 'Choose…', size: 'md', appearance: 'outline', floatingLabel: false, helpText: '', state: 'none', feedback: '', disabled: false, required: false, value: '' };

const meta: Meta<SelectComponent> = {
  title: 'Components/Forms/Select',
  component: SelectComponent,
  parameters: {
    // Internal members: keep the API table to real inputs and outputs.
    controls: { exclude: ['describedBy', 'feedbackId', 'formDisabled', 'helpId', 'isDisabled', 'onBlur', 'onChange', 'onSelect', 'onTouched', 'selectClasses', 'showFeedback', 'selectId', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'] },
    docs: {
      source: {
      language: 'typescript',
      transform: storySource({
        selector: 'app-select',
        component: 'SelectComponent',
        importPath: './components/select/select',
        defaults: DEFAULTS,
        models: ['value'],
        types: { options: 'SelectOption[]' },
        listType: 'SelectOption[]',
      }),
    },
    },
  },
  argTypes: {
    valueChange: { action: 'valueChange', table: { category: 'outputs' } },
    blurred: { action: 'blurred', table: { category: 'outputs' } },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    appearance: { control: 'inline-radio', options: ['outline', 'filled', 'pill'] },
    state: { control: 'inline-radio', options: ['none', 'valid', 'invalid'] },
    value: { control: 'select', options: ['', ...ROOMS.map((r) => r.value)] },
    selectId: { table: { disable: true } },
  },
  args: {
    label: 'Room',
    options: ROOMS,
    placeholder: 'Choose a room…',
    size: 'md',
    appearance: 'outline',
    floatingLabel: false,
    helpText: '',
    state: 'none',
    feedback: '',
    disabled: false,
    required: false,
    value: '',
  },
  decorators: [componentWrapperDecorator((story) => `<div style="max-width: 24rem">${story}</div>`)],
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {};

export const Preselected: Story = {
  args: { value: 'kitchen' },
};

export const NoPlaceholder: Story = {
  args: { placeholder: '', value: 'living' },
};

export const WithHelpText: Story = {
  args: { helpText: 'Basement is locked until the exterior is done.' },
};

export const Filled: Story = {
  args: { appearance: 'filled' },
};

export const Pill: Story = {
  args: { appearance: 'pill' },
};

export const FloatingLabel: Story = {
  args: { floatingLabel: true, label: 'Move photo to' },
};

export const Invalid: Story = {
  args: { required: true, state: 'invalid', feedback: 'Pick the room this photo belongs to.' },
};

export const Disabled: Story = {
  args: { value: 'office', disabled: true },
};

export const Sizes: Story = {
  tags: ['!dev'],
  args: { options: ROOMS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
      <div class="d-flex flex-column gap-3">
        <app-select label="Small" size="sm" [options]="options" />
        <app-select label="Medium" [options]="options" />
        <app-select label="Large" size="lg" [options]="options" />
      </div>` }),
};

export const Appearances: Story = {
  tags: ['!dev'],
  args: { options: ROOMS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
      <div class="d-flex flex-column gap-3">
        <app-select label="Outline" [options]="options" />
        <app-select label="Filled" appearance="filled" [options]="options" />
        <app-select label="Pill" appearance="pill" [options]="options" />
      </div>` }),
};

// Docs-page showcases (hidden from the sidebar).

export const PlaceholderShowcase: Story = {
  tags: ['!dev'],
  args: { options: ROOMS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="d-flex flex-column gap-3">
  <app-select label="With placeholder" placeholder="Choose a room…" [options]="options" />
  <app-select label="Preselected" [options]="options" value="kitchen" />
  <app-select label="Floating label" [floatingLabel]="true" [options]="options" />
</div>` }),
};

export const StatesShowcase: Story = {
  tags: ['!dev'],
  args: { options: ROOMS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="d-flex flex-column gap-3">
  <app-select label="Help text" [options]="options" helpText="Basement is locked until the exterior is done." />
  <app-select label="Invalid" [options]="options" [required]="true" state="invalid" feedback="Pick the room this photo belongs to." />
  <app-select label="Disabled" [options]="options" value="office" [disabled]="true" />
</div>` }),
};
