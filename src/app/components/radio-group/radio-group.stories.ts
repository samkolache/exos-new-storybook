import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';
import { RadioGroupComponent, RadioOption } from './radio-group';
import { storySource } from '../shared/story-source';

// From pcr-demo's "Can't access the property?" sheet.
const REASONS: RadioOption[] = [
  { label: 'Gate or door is locked', value: 'locked', description: 'Capture a photo of the gate' },
  { label: 'No one is home', value: 'nobody', description: 'Capture a photo of the front door' },
  { label: 'Lockbox code didn’t work', value: 'lockbox', description: 'Capture a photo of the lockbox' },
  { label: 'Not safe to enter', value: 'unsafe', description: 'Capture a photo of what’s unsafe' },
  { label: 'Can’t find the property', value: 'lost', description: 'Capture a photo of the street', disabled: true },
  { label: 'Something else', value: 'other', description: 'Add a photo if it helps' },
];

const SECTIONS: RadioOption[] = [
  { label: 'Interior', value: 'interior' },
  { label: 'Exterior', value: 'exterior' },
  { label: 'Both', value: 'both' },
];

const REASONS_FIRST: RadioOption[] = [
  { label: 'Gate or door is locked', value: 'locked', description: 'Capture a photo of the gate' },
  { label: 'No one is home', value: 'nobody', description: 'Capture a photo of the front door' },
  { label: 'Lockbox code didn’t work', value: 'lockbox', description: 'Capture a photo of the lockbox' },
];
const REASONS_LAST: RadioOption[] = [
  { label: 'Not safe to enter', value: 'unsafe', description: 'Capture a photo of what’s unsafe' },
  { label: 'Can’t find the property', value: 'lost', description: 'Capture a photo of the street', disabled: true },
  { label: 'Something else', value: 'other', description: 'Add a photo if it helps' },
];

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { label: '', options: [], appearance: 'default', inline: false, reverse: false, helpText: '', state: 'none', feedback: '', disabled: false, required: false, value: null };

const meta: Meta<RadioGroupComponent> = {
  title: 'Components/Forms/Radio Group',
  component: RadioGroupComponent,
  parameters: {
    // Internal members: keep the API table to real inputs and outputs.
    controls: { exclude: ['describedBy', 'feedbackId', 'formDisabled', 'helpId', 'isDisabled', 'legendId', 'onChange', 'onTouched', 'optionId', 'select', 'showFeedback', 'stateClass', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'] },
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
    appearance: { control: 'inline-radio', options: ['default', 'card'] },
    state: { control: 'inline-radio', options: ['none', 'valid', 'invalid'] },
    value: { control: 'select', options: [null, ...REASONS.map((r) => r.value)] },
    name: { table: { disable: true } },
  },
  args: {
    label: 'Can’t access the property?',
    options: REASONS,
    appearance: 'default',
    inline: false,
    reverse: false,
    helpText: '',
    state: 'none',
    feedback: '',
    disabled: false,
    required: false,
    value: null,
  },
  decorators: [componentWrapperDecorator((story) => `<div style="max-width: 26rem">${story}</div>`)],
};

export default meta;
type Story = StoryObj<RadioGroupComponent>;

export const Default: Story = {};

export const Selected: Story = {
  args: { value: 'nobody' },
};

export const Cards: Story = {
  args: { appearance: 'card', value: 'locked', helpText: 'We’ll let the client know and help you reschedule.' },
};

export const CardsInline: Story = {
  args: { appearance: 'card', label: 'Section', options: SECTIONS, inline: true, value: 'interior' },
  decorators: [componentWrapperDecorator((story) => `<div style="max-width: 40rem">${story}</div>`)],
};

export const Inline: Story = {
  args: { label: 'Section', options: SECTIONS, inline: true, value: 'interior' },
};

export const Reverse: Story = {
  args: { label: 'Section', options: SECTIONS, reverse: true, value: 'exterior' },
};

export const Required: Story = {
  args: { required: true },
};

export const Invalid: Story = {
  args: { required: true, state: 'invalid', feedback: 'Pick a reason before sending.' },
};

export const InvalidCards: Story = {
  args: { appearance: 'card', required: true, state: 'invalid', feedback: 'Pick a reason before sending.' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'nobody' },
};

export const Appearances: Story = {
  tags: ['!dev'],
  args: { sections: SECTIONS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
      <div class="d-flex flex-column gap-4">
        <app-radio-group label="Default" [options]="sections" value="interior" />
        <app-radio-group label="Inline" [options]="sections" [inline]="true" value="interior" />
        <app-radio-group label="Card" appearance="card" [options]="sections" value="interior" />
      </div>` }),
};

// Docs-page showcases (hidden from the sidebar).

export const LayoutShowcase: Story = {
  tags: ['!dev'],
  args: { sections: SECTIONS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="d-flex flex-column gap-4">
  <app-radio-group label="Stacked (default)" [options]="sections" value="interior" />
  <app-radio-group label="Inline" [options]="sections" [inline]="true" value="interior" />
  <app-radio-group label="Reverse" [options]="sections" [reverse]="true" value="interior" />
</div>` }),
};

export const CardsShowcase: Story = {
  tags: ['!dev'],
  args: { reasons: REASONS_FIRST } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `<app-radio-group label="Can’t access the property?" appearance="card" [options]="reasons" value="locked" />` }),
};

export const StatesShowcase: Story = {
  tags: ['!dev'],
  args: { sections: SECTIONS, reasons: REASONS_LAST } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="d-flex flex-column gap-4">
  <app-radio-group label="Invalid" [options]="sections" [required]="true" state="invalid" feedback="Pick a section." />
  <app-radio-group label="Disabled group" [options]="sections" value="interior" [disabled]="true" />
  <app-radio-group label="One option disabled" [options]="reasons" />
</div>` }),
};
