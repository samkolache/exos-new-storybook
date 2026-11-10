import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { storySource } from '../shared/story-source';
import { ChipComponent, ChipOption } from './chip';

// Content from Figma "PCR" › Form view.
const CONDITION: ChipOption[] = [
  { label: 'Good', value: 'good' },
  { label: 'Average', value: 'average', suggested: true },
  { label: 'Fair', value: 'fair' },
  { label: 'Poor', value: 'poor' },
];

const AREA: ChipOption[] = [
  { label: 'Urban', value: 'urban' },
  { label: 'Suburban', value: 'suburban' },
  { label: 'Rural', value: 'rural' },
];

const BATHROOMS: ChipOption[] = [
  { label: '3 · photos', value: '3', suggested: true },
  { label: '2 · records', value: '2', icon: 'records' },
];

const ADVERSE: ChipOption[] = [
  { label: 'Powerlines', value: 'powerlines' },
  { label: 'Commercial', value: 'commercial', suggested: true },
  { label: 'Boarded homes', value: 'boarded' },
  { label: 'Railroad', value: 'railroad' },
  { label: 'Freeway', value: 'freeway' },
  { label: 'Airport', value: 'airport', disabled: true },
  { label: 'Waste facility', value: 'waste' },
];

/** First five adverse influences, for compact examples. */
const ADVERSE_SHORT: ChipOption[] = [
  { label: 'Powerlines', value: 'powerlines' },
  { label: 'Commercial', value: 'commercial', suggested: true },
  { label: 'Boarded homes', value: 'boarded' },
  { label: 'Railroad', value: 'railroad' },
  { label: 'Freeway', value: 'freeway' },
];

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = {
  label: 'Fair',
  type: 'single',
  selected: false,
  suggested: false,
  disabled: false,
  icon: 'none',
  options: [],
  value: null,
  groupLabel: '',
  labelledBy: null,
};

const meta: Meta<ChipComponent> = {
  title: 'Components/Chip',
  component: ChipComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule, JsonPipe] })],
  parameters: {
    // Internal members: keep the API table to real inputs and outputs.
    controls: { exclude: ['chips', 'classesOf', 'click', 'formDisabled', 'isDisabled', 'isGroup', 'nextValue', 'onChange', 'onTouched', 'picked', 'stateOf', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'] },
    docs: {
      source: {
      language: 'typescript',
      transform: storySource({
        selector: 'app-chip',
        component: 'ChipComponent',
        importPath: './components/chip/chip',
        defaults: DEFAULTS,
        models: (args) => ((args['options'] as unknown[] | undefined)?.length ? ['value'] : ['selected']),
        types: { options: 'ChipOption[]', value: 'ChipGroupValue' },
        listType: 'ChipOption[]',
      }),
    },
    },
  },
  argTypes: {
    selectedChange: { action: 'selectedChange', table: { category: 'outputs' } },
    valueChange: { action: 'valueChange', table: { category: 'outputs' } },
    type: {
      control: 'inline-radio',
      options: ['single', 'multi'],
      description: 'single: pick one (radio, check when picked). multi: pick any (checkbox).',
      table: { defaultValue: { summary: 'single' } },
    },
    disabled: { description: 'Disables the chip, or every chip in the group.', table: { defaultValue: { summary: 'false' } } },
    label: { description: 'One chip: the text.', table: { category: 'One chip' } },
    selected: {
      description: 'One chip: picked. Two-way: `[(selected)]`.',
      table: { category: 'One chip', defaultValue: { summary: 'false' } },
    },
    suggested: {
      description: 'One chip: AI-suggested answer (sparkle). With `selected` it is the Figma "AI suggested" state.',
      table: { category: 'One chip', defaultValue: { summary: 'false' } },
    },
    icon: {
      control: 'inline-radio',
      options: ['none', 'records'],
      description: 'One chip: optional leading icon.',
      table: { category: 'One chip', defaultValue: { summary: 'none' } },
    },
    options: {
      control: 'object',
      description: 'Group: `{ label, value, suggested?, disabled?, icon? }[]`. Setting it renders a row of chips.',
      table: { category: 'Group' },
    },
    value: {
      control: 'object',
      description: 'Group: single `string | null`, multi `string[]`. Two-way: `[(value)]`.',
      table: { category: 'Group' },
    },
    groupLabel: { description: 'Group: accessible name.', table: { category: 'Group' } },
    labelledBy: { description: 'Group: id of a visible label (instead of groupLabel).', table: { category: 'Group' } },
  },
  args: {
    label: 'Fair',
  },
};

export default meta;
type Story = StoryObj<ChipComponent>;

// One chip · Figma type = Single
export const Default: Story = {};
export const AISuggested: Story = { name: 'AI suggested', args: { selected: true, suggested: true } };
export const Selected: Story = { args: { selected: true } };
export const Disabled: Story = { args: { disabled: true } };

// One chip · Figma type = Multi
export const MultiDefault: Story = { name: 'Multi · Default', args: { type: 'multi' } };
export const MultiAISuggested: Story = {
  name: 'Multi · AI suggested',
  args: { type: 'multi', selected: true, suggested: true },
};
export const MultiSelected: Story = { name: 'Multi · Selected', args: { type: 'multi', selected: true } };
export const MultiDisabled: Story = { name: 'Multi · Disabled', args: { type: 'multi', disabled: true } };

export const WithIcon: Story = { args: { label: '2 · records', icon: 'records' } };

/** The full Figma component set: type × state. */
export const AllStates: Story = {
  name: 'All states',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <div class="d-flex flex-wrap gap-3">
    <app-chip label="Fair" />
    <app-chip label="Fair" [selected]="true" [suggested]="true" />
    <app-chip label="Fair" [selected]="true" />
    <app-chip label="Fair" [disabled]="true" />
  </div>
  <div class="d-flex flex-wrap gap-3">
    <app-chip label="Fair" type="multi" />
    <app-chip label="Fair" type="multi" [selected]="true" [suggested]="true" />
    <app-chip label="Fair" type="multi" [selected]="true" />
    <app-chip label="Fair" type="multi" [disabled]="true" />
  </div>
</div>` }),
};

// Groups: same component with options.
export const GroupSingle: Story = {
  name: 'Group · Single',
  args: { options: CONDITION, groupLabel: 'Interior condition', value: 'average' },
};

export const GroupNothingPicked: Story = {
  name: 'Group · Nothing picked',
  args: { options: AREA, groupLabel: 'Area' },
};

export const GroupWithIcons: Story = {
  name: 'Group · With icons',
  args: { options: BATHROOMS, groupLabel: 'Bathrooms', value: '3' },
};

export const GroupMulti: Story = {
  name: 'Group · Multi',
  args: { options: ADVERSE, type: 'multi', groupLabel: 'Adverse influences nearby', value: ['commercial', 'freeway'] },
};

export const GroupDisabled: Story = {
  name: 'Group · Disabled',
  args: { options: CONDITION, groupLabel: 'Interior condition', value: 'average', disabled: true },
};

/** Bound to a reactive FormControl. */
export const GroupReactiveForm: Story = {
  name: 'Group · Reactive form',
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ props: { options: ADVERSE, control: new FormControl<string[]>(['commercial']) }, template: `
<app-chip type="multi" groupLabel="Adverse influences nearby" [options]="options" [formControl]="control" />
<p class="mt-3 mb-0 small text-body-secondary">Form value: {{ control.value | json }}</p>` }),
};

// Behaviour tests
/** One multi chip toggles on and off. */
export const ToggleOne: Story = {
  name: 'Test · Toggle one chip',
  args: { selectedChange: fn(), type: 'multi' },
  play: async ({ canvasElement, args }) => {
    const chip = within(canvasElement).getByRole('checkbox', { name: /Fair/ });
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-checked', 'true');
    await expect(args.selectedChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-checked', 'false');
  },
};

/** Single group: picking a chip moves the selection. */
export const PickOne: Story = {
  name: 'Test · Pick one',
  args: { valueChange: fn(), options: AREA, groupLabel: 'Area' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Suburban' }));
    await expect(args.valueChange).toHaveBeenLastCalledWith('suburban');
    await userEvent.click(canvas.getByRole('radio', { name: 'Rural' }));
    await expect(canvas.getByRole('radio', { name: 'Rural' })).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('radio', { name: 'Suburban' })).toHaveAttribute('aria-checked', 'false');
  },
};

/** Multi group: chips toggle and the value keeps option order. */
export const PickMany: Story = {
  name: 'Test · Pick many',
  args: { valueChange: fn(), options: ADVERSE, type: 'multi', groupLabel: 'Adverse influences nearby', value: [] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Freeway' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Powerlines' }));
    await expect(args.valueChange).toHaveBeenLastCalledWith(['powerlines', 'freeway']);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Freeway' }));
    await expect(args.valueChange).toHaveBeenLastCalledWith(['powerlines']);
  },
};

// Docs-page showcases (hidden from the sidebar).

export const Types: Story = {
  tags: ['!dev'],
  args: { area: AREA, adverse: ADVERSE_SHORT } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="d-flex flex-column gap-3">
  <app-chip groupLabel="Area" [options]="area" value="suburban" />
  <app-chip type="multi" groupLabel="Adverse influences" [options]="adverse" [value]="['commercial', 'freeway']" />
</div>` }),
};

export const SuggestedShowcase: Story = {
  tags: ['!dev'],
  args: { condition: CONDITION } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="d-flex flex-column gap-3">
  <app-chip groupLabel="Interior condition" [options]="condition" value="average" />
  <app-chip groupLabel="Interior condition" [options]="condition" value="fair" />
</div>` }),
};

export const IconShowcase: Story = {
  tags: ['!dev'],
  args: { bathrooms: BATHROOMS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `<app-chip groupLabel="Bathrooms" [options]="bathrooms" value="3" />` }),
};

export const DisabledShowcase: Story = {
  tags: ['!dev'],
  args: { adverse: ADVERSE, condition: CONDITION } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="d-flex flex-column gap-3">
  <app-chip type="multi" groupLabel="Adverse influences" [options]="adverse" [value]="['commercial']" />
  <app-chip groupLabel="Interior condition" [options]="condition" value="average" [disabled]="true" />
</div>` }),
};
