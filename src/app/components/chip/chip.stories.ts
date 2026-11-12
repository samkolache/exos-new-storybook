import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';
import { storySource } from '../shared/story-source';
import { ChipComponent, ChipOption } from './chip';

// Everyday example content, so the chips read the same in any product.

/** Single: one answer from an ordered scale. */
const PRIORITY: ChipOption[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium', suggested: true },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

/** Single, nothing suggested. */
const WORK_MODE: ChipOption[] = [
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'On-site', value: 'onsite' },
];

/** Options that say what kind they are with an icon. */
const FILE_TYPES: ChipOption[] = [
  { label: 'Photos', value: 'photos', icon: 'camera', suggested: true },
  { label: 'Documents', value: 'documents', icon: 'records' },
];

/** Multi: pick any number. */
const TEAMS: ChipOption[] = [
  { label: 'Design', value: 'design' },
  { label: 'Engineering', value: 'engineering', suggested: true },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Support', value: 'support' },
  { label: 'Finance', value: 'finance', disabled: true },
  { label: 'Legal', value: 'legal' },
];

/** First five teams, for compact examples. */
const TEAMS_SHORT: ChipOption[] = TEAMS.slice(0, 5);

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = {
  variant: 'selectable',
  label: 'Chip',
  type: 'single',
  size: 'md',
  selected: false,
  suggested: false,
  disabled: false,
  icon: 'none',
  iconEnd: 'none',
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
    // Accessibility checks fail the tests for chips (not just a warning).
    a11y: { test: 'error' },
    // Internal members: keep the API table to real inputs and outputs.
    controls: { exclude: ['chips', 'classesOf', 'click', 'formDisabled', 'isDisabled', 'isGroup', 'nextValue', 'onChange', 'onTouched', 'picked', 'stateOf', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState', 'onKeydown', 'tabIndexOf', 'titleOf', 'chipRole', 'tabStop', 'host', 'injector', 'isSelectable', 'groupRole', 'iconSrc', 'showsCheck', 'remove', 'onRemoveKeydown'] },
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
    removed: {
      action: 'removed',
      description: "Removable chips: the cross was pressed. Emits the option's value (or a lone chip's label).",
      table: { category: 'outputs' },
    },
    variant: {
      control: 'inline-radio',
      options: ['selectable', 'removable', 'readonly'],
      description: 'selectable: people pick it. removable: a cross removes it. readonly: shows an answer, nothing to click.',
      table: { defaultValue: { summary: 'selectable' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm 24px · md 32px (the Figma chip) · lg 40px. Applies to every chip in a group.',
      table: { defaultValue: { summary: 'md' } },
    },
    type: {
      control: 'inline-radio',
      options: ['single', 'multi'],
      description: 'Selectable chips. single: pick one (radio, check when picked). multi: pick any (checkbox).',
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
      control: 'select',
      options: ['none', 'records', 'calendar', 'note', 'camera', 'lock', 'flag', 'conflict', 'skip', 'dot'],
      description: 'One chip: icon before the label.',
      table: { category: 'One chip', defaultValue: { summary: 'none' } },
    },
    iconEnd: {
      control: 'select',
      options: ['none', 'records', 'calendar', 'note', 'camera', 'lock', 'flag', 'conflict', 'skip', 'dot'],
      description: 'One chip: icon after the label.',
      table: { category: 'One chip', defaultValue: { summary: 'none' } },
    },
    options: {
      control: 'object',
      description: 'Group: `{ label, value, suggested?, disabled?, icon?, iconEnd? }[]`. Setting it renders a row of chips.',
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
    label: 'Medium',
  },
};

export default meta;
type Story = StoryObj<ChipComponent>;

// One chip · Figma type = Single
export const Default: Story = { name: 'Single chip' };
export const AISuggested: Story = { tags: ['!dev'], name: 'AI suggested', args: { selected: true, suggested: true } };
export const Selected: Story = { tags: ['!dev'], args: { selected: true } };
export const Disabled: Story = { tags: ['!dev'], args: { disabled: true } };

// One chip · Figma type = Multi
export const MultiDefault: Story = { tags: ['!dev'], name: 'Multi · Default', args: { type: 'multi' } };
export const MultiAISuggested: Story = {
  tags: ['!dev'],
  name: 'Multi · AI suggested',
  args: { type: 'multi', selected: true, suggested: true },
};
export const MultiSelected: Story = { tags: ['!dev'], name: 'Multi · Selected', args: { type: 'multi', selected: true } };
export const MultiDisabled: Story = { tags: ['!dev'], name: 'Multi · Disabled', args: { type: 'multi', disabled: true } };

export const WithIcon: Story = { tags: ['!dev'], args: { label: 'Documents', icon: 'records' } };
export const WithEndIcon: Story = { tags: ['!dev'], name: 'With end icon', args: { variant: 'readonly', label: 'Pro plan', iconEnd: 'lock' } };

// Removable and read-only variants.

const FILE_TYPES_ICONS: ChipOption[] = [
  { label: 'Photos', value: 'photos', icon: 'camera' },
  { label: 'Documents', value: 'documents', icon: 'records' },
  { label: 'Notes', value: 'notes', icon: 'note' },
];

const ICON_FILTERS: ChipOption[] = [
  { label: 'Due this week', value: 'due', icon: 'calendar' },
  { label: 'Flagged', value: 'flagged', icon: 'flag' },
  { label: 'Has notes', value: 'notes', icon: 'note' },
];

// Read-only: values shown as chips, like a profile's skills.
const SKILLS: ChipOption[] = [
  { label: 'Figma', value: 'figma' },
  { label: 'Prototyping', value: 'prototyping' },
  { label: 'User research', value: 'research' },
  { label: 'Accessibility', value: 'a11y' },
];

// Filters someone applied to a list; the cross takes one off.
const FILTERS: ChipOption[] = [
  { label: 'Design', value: 'design' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Support', value: 'support' },
  { label: 'Sales', value: 'sales' },
];

/** A removable group that really removes: the parent drops the option on `(removed)`. */
export const Removable: Story = {
  name: 'Removable',
  args: { options: FILTERS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({
    props: {
      ...args,
      items: [...FILTERS],
      drop(value: string) {
        (this as { items: ChipOption[] }).items = (this as { items: ChipOption[] }).items.filter((o) => o.value !== value);
      },
      reset() {
        (this as { items: ChipOption[] }).items = [...FILTERS];
      },
    },
    template: `
<app-chip variant="removable" groupLabel="Applied filters" [options]="items" (removed)="drop($event)" />
@if (!items.length) {
  <button type="button" class="btn btn-link p-0 small" (click)="reset()">Bring them back</button>
}`,
  }),
};

export const RemovableOne: Story = {
  tags: ['!dev'],
  name: 'Removable · One chip',
  args: { variant: 'removable', label: 'Engineering' },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { variant: 'readonly', options: SKILLS, groupLabel: 'Skills' },
};


/** Icons before and after the label, each in the place it is actually used. */
export const Icons: Story = {
  name: 'With icons',
  tags: ['!dev'],
  args: { fileTypes: FILE_TYPES_ICONS, filters: ICON_FILTERS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="d-flex flex-column gap-4">
  <div>
    <p id="filetype-q" class="small fw-semibold mb-2">File type · icon before: what kind each option is</p>
    <app-chip labelledBy="filetype-q" [options]="fileTypes" value="photos" />
  </div>
  <div>
    <p id="plan-q" class="small fw-semibold mb-2">Plan · icon after: locked, can't be changed here</p>
    <app-chip labelledBy="plan-q" variant="readonly" [options]="[{ label: 'Pro plan', value: 'pro', iconEnd: 'lock' }]" />
  </div>
  <div>
    <p id="filter-q" class="small fw-semibold mb-2">Filters · removable, each with its icon</p>
    <app-chip labelledBy="filter-q" variant="removable" [options]="filters" />
  </div>
</div>` }),
};

export const AllStates: Story = {
  name: 'All states',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div style="overflow-x: auto">
<div class="d-grid gap-3 align-items-center" style="grid-template-columns: max-content repeat(5, max-content)">
  <span></span>
  <span class="small text-body-secondary">Default</span>
  <span class="small text-body-secondary">AI suggested</span>
  <span class="small text-body-secondary">Selected</span>
  <span class="small text-body-secondary">Disabled</span>
  <span class="small text-body-secondary">Disabled, picked</span>

  <span class="small fw-semibold">Single</span>
  <app-chip label="Low" />
  <app-chip label="Medium" [selected]="true" [suggested]="true" />
  <app-chip label="High" [selected]="true" />
  <app-chip label="Urgent" [disabled]="true" />
  <app-chip label="High" [selected]="true" [disabled]="true" />

  <span class="small fw-semibold">Multi</span>
  <app-chip label="Design" type="multi" />
  <app-chip label="Engineering" type="multi" [selected]="true" [suggested]="true" />
  <app-chip label="Support" type="multi" [selected]="true" />
  <app-chip label="Finance" type="multi" [disabled]="true" />
  <app-chip label="Support" type="multi" [selected]="true" [disabled]="true" />

  <span class="small fw-semibold">Removable</span>
  <app-chip label="Sales" variant="removable" />
  <span class="small text-body-secondary">—</span>
  <span class="small text-body-secondary">—</span>
  <app-chip label="Sales" variant="removable" [disabled]="true" />
  <span class="small text-body-secondary">—</span>

  <span class="small fw-semibold">Read-only</span>
  <app-chip label="Figma" variant="readonly" />
  <span class="small text-body-secondary">—</span>
  <span class="small text-body-secondary">—</span>
  <app-chip label="Figma" variant="readonly" [disabled]="true" />
  <span class="small text-body-secondary">—</span>
</div>
</div>` }),
};

// Groups: same component with options.
export const GroupSingle: Story = {
  name: 'Group',
  args: { options: PRIORITY, groupLabel: 'Priority', value: 'medium' },
};

export const GroupNothingPicked: Story = {
  tags: ['!dev'],
  name: 'Group · Nothing picked',
  args: { options: WORK_MODE, groupLabel: 'Work mode' },
};

export const GroupWithIcons: Story = {
  tags: ['!dev'],
  name: 'Group · With icons',
  args: { options: FILE_TYPES, groupLabel: 'File type', value: 'photos' },
};

export const GroupMulti: Story = {
  name: 'Multi group',
  args: { options: TEAMS, type: 'multi', groupLabel: 'Teams', value: ['engineering', 'support'] },
};

export const GroupDisabled: Story = {
  tags: ['!dev'],
  name: 'Group · Disabled',
  args: { options: PRIORITY, groupLabel: 'Priority', value: 'medium', disabled: true },
};

/** Bound to a reactive FormControl. */
export const GroupReactiveForm: Story = {
  name: 'Reactive form',
  args: { options: TEAMS, control: new FormControl<string[]>(['engineering']) } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-chip type="multi" groupLabel="Teams" [options]="options" [formControl]="control" />
<p class="mt-3 mb-0 small text-body-secondary">Form value: {{ control.value | json }}</p>` }),
};

// Behaviour tests
/** One multi chip toggles on and off. */
export const ToggleOne: Story = {
  tags: ['!dev'],
  name: 'Test · Toggle one chip',
  args: { selectedChange: fn(), type: 'multi' },
  play: async ({ canvasElement, args }) => {
    // A lone chip is a toggle button (aria-pressed), not a radio or checkbox outside a group.
    const chip = within(canvasElement).getByRole('button', { name: /Medium/ });
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await expect(args.selectedChange).toHaveBeenLastCalledWith(true);
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
  },
};

/** Single group: picking a chip moves the selection. */
export const PickOne: Story = {
  tags: ['!dev'],
  name: 'Test · Pick one',
  args: { valueChange: fn(), options: WORK_MODE, groupLabel: 'Work mode' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Hybrid' }));
    await expect(args.valueChange).toHaveBeenLastCalledWith('hybrid');
    await userEvent.click(canvas.getByRole('radio', { name: 'On-site' }));
    await expect(canvas.getByRole('radio', { name: 'On-site' })).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('radio', { name: 'Hybrid' })).toHaveAttribute('aria-checked', 'false');
  },
};

/** Multi group: chips toggle and the value keeps option order. */
export const PickMany: Story = {
  tags: ['!dev'],
  name: 'Test · Pick many',
  args: { valueChange: fn(), options: TEAMS, type: 'multi', groupLabel: 'Teams', value: [] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Support' }));
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Design' }));
    await expect(args.valueChange).toHaveBeenLastCalledWith(['design', 'support']);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Support' }));
    await expect(args.valueChange).toHaveBeenLastCalledWith(['design']);
  },
};

/** Removable: the cross is the only control, named after its chip; Delete removes too; focus moves on. */
export const TestRemove: Story = {
  ...Removable,
  tags: ['!dev'],
  name: 'Test · Remove',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('list', { name: 'Applied filters' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
    // Only the crosses are buttons.
    await expect(canvas.getAllByRole('button')).toHaveLength(4);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Engineering' }));
    await expect(canvas.queryByText('Engineering')).not.toBeInTheDocument();
    // Focus lands on the chip that took its place.
    await expect(await canvas.findByRole('button', { name: 'Remove Support' })).toHaveFocus();
    await userEvent.keyboard('{Delete}');
    await expect(await canvas.findByRole('button', { name: 'Remove Sales' })).toHaveFocus();
    // Removing the last chip moves focus back to the one before.
    await userEvent.keyboard('{Backspace}');
    await expect(await canvas.findByRole('button', { name: 'Remove Design' })).toHaveFocus();
  },
};

/** A lone removable chip emits its label. */
export const TestRemoveOne: Story = {
  tags: ['!dev'],
  name: 'Test · Remove one chip',
  args: { variant: 'removable', label: 'Engineering', removed: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remove Engineering' }));
    await expect(args.removed).toHaveBeenCalledWith('Engineering');
  },
};

/** Read-only chips have nothing to focus or press, and never show a picked state, even with a value set. */
export const TestReadOnly: Story = {
  tags: ['!dev'],
  name: 'Test · Read-only',
  args: { variant: 'readonly', options: SKILLS, groupLabel: 'Skills', value: 'figma', valueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
    await expect(canvas.queryAllByRole('radio')).toHaveLength(0);
    const items = within(canvas.getByRole('list', { name: 'Skills' })).getAllByRole('listitem');
    await expect(items).toHaveLength(4);
    await expect(items[0]).not.toHaveClass('selected');
    await expect(items[0].querySelector('img')).toBeNull();
    await expect(items[0]).toHaveTextContent(/^\s*Figma\s*$/);
    await userEvent.click(items[0]);
    await expect(args.valueChange).not.toHaveBeenCalled();
  },
};

// Docs-page showcases (hidden from the sidebar).

export const SuggestedShowcase: Story = {
  tags: ['!dev'],
  args: { priority: PRIORITY } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="d-flex flex-column gap-3">
  <app-chip groupLabel="Priority" [options]="priority" value="medium" />
  <app-chip groupLabel="Priority" [options]="priority" value="high" />
</div>` }),
};

export const IconShowcase: Story = {
  tags: ['!dev'],
  args: { fileTypes: FILE_TYPES } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `<app-chip groupLabel="File type" [options]="fileTypes" value="photos" />` }),
};

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  parameters: { controls: { disable: true }, example: true },
  args: {
    parts: [
      { n: 1, target: '.chip', side: 'left', whole: true },
      { n: 2, target: '.chip-checkbox', side: 'bottom', whole: true },
      { n: 3, target: '.chip-label', side: 'top' },
      { n: 4, target: '.chip > img:last-child', side: 'right', whole: true },
    ],
  } as Story['args'],
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" [scale]="1.6">
  <app-chip label="Engineering" type="multi" [selected]="true" [suggested]="true" />
</app-anatomy>` }),
};

/** Specs drawn on a live chip. Every number is measured, so the size and device switches show real values. */
const FIRST_CHIP = '.chip-group > .chip:nth-of-type(1)';
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'size', target: FIRST_CHIP, side: 'right', label: '{v} tall' },
  { kind: 'style', target: `${FIRST_CHIP} .chip-label`, prop: 'font-size', side: 'top', label: '{v} text' },
  { kind: 'padding', target: FIRST_CHIP, label: '{v} top and bottom', labelSides: '{v} left and right' },
  { kind: 'distance', from: { target: FIRST_CHIP, edge: 'right' }, to: { target: '.chip-group > .chip:nth-of-type(2)', edge: 'left' }, side: 'bottom', label: '{v} apart' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { controls: { disable: true }, example: true, specs: { sizes: true, switches: [] } },
  args: { size: 'md' },
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS, options: [{ label: 'Design', value: 'design' }, { label: 'Sales', value: 'sales' }] },
    template: `
<app-redline [marks]="marks" [scale]="2" [key]="false">
  <app-chip groupLabel="Teams" [size]="size" [options]="options" />
</app-redline>`,
  }),
};

// Mobile / Web demo (top of the docs page). The two layouts of the same questions:
// mobile stacks each question above its chips across the 4 columns (larger type, tap areas that meet across the 8px gap);
// web puts the question in a label column and the chips beside it (16 columns).

export const MobileExample: Story = {
  name: 'Mobile layout',
  tags: ['!dev'],
  args: { priority: PRIORITY, teams: TEAMS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="exos-grid">
  <div class="exos-col-4">
    <p id="priority-label" class="fw-semibold mb-2">How urgent is this request?</p>
    <app-chip labelledBy="priority-label" [options]="priority" value="medium" />
  </div>
  <div class="exos-col-4">
    <p id="teams-label" class="fw-semibold mb-2">Which teams should see it?</p>
    <app-chip type="multi" labelledBy="teams-label" [options]="teams" [value]="['engineering', 'support']" />
  </div>
</div>` }),
};

export const WebExample: Story = {
  name: 'Web layout',
  tags: ['!dev'],
  args: { priority: PRIORITY, teams: TEAMS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="exos-grid align-items-center">
  <p id="priority-label" class="exos-col-lg-5 fw-semibold mb-0">How urgent is this request?</p>
  <div class="exos-col-lg-11">
    <app-chip labelledBy="priority-label" [options]="priority" value="medium" />
  </div>
  <p id="teams-label" class="exos-col-lg-5 fw-semibold mb-0">Which teams should see it?</p>
  <div class="exos-col-lg-11">
    <app-chip type="multi" labelledBy="teams-label" [options]="teams" [value]="['engineering', 'support']" />
  </div>
</div>` }),
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

// Behaviour tests (hidden from the sidebar; they still run in the test suite).

const RATING: ChipOption[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium', suggested: true },
  { label: 'High', value: 'high', disabled: true },
  { label: 'Urgent', value: 'urgent' },
];

/** WAI-ARIA radio group: one Tab stop, arrows move and pick, disabled chips are skipped. */
export const TestKeyboard: Story = {
  tags: ['!dev'],
  name: 'Test · Keyboard',
  args: { options: RATING, groupLabel: 'Priority', value: 'medium', valueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio');
    // One Tab stop: the picked chip.
    await expect(radios.filter((r) => r.tabIndex === 0)).toHaveLength(1);
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: /Medium/ })).toHaveFocus();
    // Right arrow skips the disabled "High" and picks "Urgent".
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Urgent' })).toHaveFocus();
    await expect(args.valueChange).toHaveBeenLastCalledWith('urgent');
    // Wraps around, and Home / End jump to the ends.
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Low' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{End}');
    await expect(args.valueChange).toHaveBeenLastCalledWith('urgent');
    await userEvent.keyboard('{Home}');
    await expect(args.valueChange).toHaveBeenLastCalledWith('low');
    // Tab leaves the group in one step.
    await expect(canvas.getAllByRole('radio').filter((r) => r.tabIndex === 0)).toHaveLength(1);
  },
};

/** Multi groups: each chip is a checkbox and its own Tab stop; Space toggles; disabled chips can't be picked. */
export const TestMultiKeyboard: Story = {
  tags: ['!dev'],
  name: 'Test · Multi keyboard',
  args: { options: TEAMS, type: 'multi', groupLabel: 'Teams', value: [], valueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('checkbox', { name: 'Design' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.valueChange).toHaveBeenLastCalledWith(['design']);
    await expect(canvas.getByRole('checkbox', { name: 'Finance' })).toBeDisabled();
  },
};

const FORM_CONTROL = new FormControl<string | null>('medium');

/** Works with reactive forms both ways, and follows the control's disabled state. */
export const TestReactiveForm: Story = {
  tags: ['!dev'],
  name: 'Test · Reactive form',
  render: () => ({
    props: { options: PRIORITY, control: FORM_CONTROL },
    template: `<app-chip groupLabel="Priority" [options]="options" [formControl]="control" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    FORM_CONTROL.enable();
    FORM_CONTROL.setValue('medium');
    await expect(await canvas.findByRole('radio', { name: /Medium/ })).toHaveAttribute('aria-checked', 'true');
    // Chip → form
    await userEvent.click(canvas.getByRole('radio', { name: 'Urgent' }));
    await expect(FORM_CONTROL.value).toBe('urgent');
    await expect(FORM_CONTROL.touched).toBe(true);
    // Form → chips
    FORM_CONTROL.setValue('low');
    await expect(await canvas.findByRole('radio', { name: 'Low', checked: true })).toBeInTheDocument();
    // Disabling the control disables every chip.
    FORM_CONTROL.disable();
    await new Promise((r) => setTimeout(r, 50));
    for (const radio of canvas.getAllByRole('radio')) await expect(radio).toBeDisabled();
    FORM_CONTROL.enable();
  },
};

/** Long labels end in an ellipsis inside a narrow column, with the full text as a tooltip. */
export const TestLongLabel: Story = {
  tags: ['!dev'],
  name: 'Test · Long label',
  render: () => ({
    template: `<div style="width: 200px"><app-chip label="Needs a follow-up call before the end of the week" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole('button');
    const label = chip.querySelector('.chip-label') as HTMLElement;
    await expect(chip.getBoundingClientRect().width).toBeLessThanOrEqual(200);
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(chip).toHaveAttribute('title', 'Needs a follow-up call before the end of the week');
  },
};

// Formatting: where icons go (docs only).

// Modifiers: one detail each, with clean code (docs only).

const SOURCES: ChipOption[] = [
  { label: 'Photos', value: 'photos', icon: 'camera' },
  { label: 'Documents', value: 'documents', icon: 'records' },
];

/** Icon: the option shows what kind it is. */
export const ModifierSource: Story = {
  tags: ['!dev'],
  args: { options: SOURCES, groupLabel: 'File type', value: 'photos' },
};

const SUGGESTED: ChipOption[] = PRIORITY;

/** AI suggested: the option the AI picked carries a sparkle. */
export const ModifierSuggested: Story = {
  tags: ['!dev'],
  args: { options: SUGGESTED, groupLabel: 'Priority', value: 'medium' },
};

// Content: Do / Don't examples (docs only).

const YES_NO: ChipOption[] = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no', suggested: true },
];

export const DoShortLabels: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: PRIORITY }, template: `<app-chip groupLabel="Priority" [options]="options" value="medium" />` }),
};

export const DontLongLabels: Story = {
  tags: ['!dev'],
  render: () => ({
    props: {
      options: [
        { label: 'Not urgent, it can wait', value: 'low' },
        { label: 'Somewhat urgent, this week', value: 'medium' },
        { label: 'Very urgent, needs attention today', value: 'urgent' },
      ],
    },
    template: `<div style="max-width: 300px; margin: 0 auto"><app-chip groupLabel="Priority" [options]="options" value="medium" /></div>`,
  }),
};

export const DoQuestionAsLabel: Story = {
  tags: ['!dev'],
  render: () => ({
    props: { options: YES_NO },
    template: `<div data-align="start" style="max-width: 300px; margin: 0 auto"><p id="repeat-q" class="fw-semibold mb-2">Does this repeat every week?</p><app-chip labelledBy="repeat-q" [options]="options" value="no" /></div>`,
  }),
};

export const DontQuestionInChips: Story = {
  tags: ['!dev'],
  render: () => ({
    props: {
      options: [
        { label: 'Repeats weekly: yes', value: 'yes' },
        { label: 'Repeats weekly: no', value: 'no' },
      ],
    },
    template: `<app-chip groupLabel="Repeats weekly" [options]="options" value="no" />`,
  }),
};

export const DoOneSuggestion: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: PRIORITY }, template: `<app-chip groupLabel="Priority" [options]="options" value="medium" />` }),
};

export const DontManySuggestions: Story = {
  tags: ['!dev'],
  render: () => ({
    props: { options: PRIORITY.map((o) => ({ ...o, suggested: true })) },
    template: `<app-chip groupLabel="Priority" [options]="options" value="medium" />`,
  }),
};

export const DoAnswers: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: WORK_MODE }, template: `<app-chip groupLabel="Work mode" [options]="options" value="hybrid" />` }),
};

export const DontActions: Story = {
  tags: ['!dev'],
  render: () => ({
    props: {
      options: [
        { label: 'Save', value: 'save' },
        { label: 'Share', value: 'share' },
        { label: 'Delete', value: 'delete' },
      ],
    },
    template: `<app-chip groupLabel="Actions" [options]="options" />`,
  }),
};

/** Sizes are 24 / 32 / 40px on every device; on phones the type is larger and tap areas meet across the 8px gap. */
export const TestSizes: Story = {
  tags: ['!dev'],
  name: 'Test · Sizes',
  globals: { viewport: { value: 'exosMobile', isRotated: false } },
  render: () => ({
    props: { options: TEAMS },
    template: `
<div style="width: 343px">
  <app-chip id="sm" size="sm" type="multi" groupLabel="Small" [options]="options" />
  <app-chip id="md" type="multi" groupLabel="Medium" [options]="options" />
  <app-chip id="lg" size="lg" type="multi" groupLabel="Large" [options]="options" />
</div>`,
  }),
  play: async ({ canvasElement }) => {
    for (const [id, height] of [['sm', 24], ['md', 32], ['lg', 40]] as const) {
      const chips = [...canvasElement.querySelectorAll<HTMLElement>(`#${id} .chip`)];
      for (const chip of chips) await expect(Math.round(chip.getBoundingClientRect().height)).toBe(height);
      // The group's size reaches every chip.
      await expect(chips.every((c) => (id === 'md' ? !/chip-(sm|lg)/.test(c.className) : c.classList.contains(`chip-${id}`)))).toBe(true);
      // Phones: chips sit 8px apart and each tap area reaches 4px into the gap, so areas meet without overlapping.
      if (window.innerWidth < 672) {
        await expect(parseFloat(getComputedStyle(chips[0], '::after').height)).toBe(height + 8);
        const tops = [...new Set(chips.map((c) => Math.round(c.getBoundingClientRect().top)))];
        if (tops.length > 1) await expect(tops[1] - tops[0]).toBe(height + 8);
        await expect(getComputedStyle(chips[0]).fontSize).toBe(({ sm: '12px', md: '14px', lg: '16px' } as const)[id]);
      }
    }
  },
};

// Interaction: edge cases (docs only).

const DEPARTMENTS: ChipOption[] = ['Design', 'Engineering', 'Marketing', 'Sales', 'Support', 'Finance', 'Legal', 'HR', 'Operations', 'Product', 'Research', 'Security'].map(
  (label) => ({ label, value: label.toLowerCase().replace(/\s+/g, '-') }),
);

export const EdgeLongLabel: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div style="width: 180px"><app-chip label="Needs a follow-up call before the end of the week" /></div>` }),
};

export const EdgeOneOption: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: [{ label: 'Yes', value: 'yes' }] }, template: `<app-chip groupLabel="Confirm" [options]="options" value="yes" />` }),
};

export const EdgeTooMany: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: DEPARTMENTS }, template: `<app-chip size="sm" groupLabel="Department" [options]="options" />` }),
};

// About 5 options at most on a phone.
export const DoFewOnPhone: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: PRIORITY }, template: `<div style="width: 300px; margin: 0 auto"><app-chip groupLabel="Priority" [options]="options" value="medium" /></div>` }),
};

export const DontManyOnPhone: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: DEPARTMENTS }, template: `<div style="width: 300px; margin: 0 auto"><app-chip groupLabel="Department" [options]="options" /></div>` }),
};

/** The screen reader output shown on the docs page is what the chip really exposes. */
export const TestScreenReader: Story = {
  tags: ['!dev'],
  name: 'Test · Screen reader output',
  args: { options: PRIORITY, groupLabel: 'Priority', value: 'medium' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Priority' });
    const chip = within(group).getByRole('radio', { name: 'Medium (AI suggested)' });
    await expect(chip).toHaveAttribute('aria-checked', 'true');
    const radios = within(group).getAllByRole('radio');
    await expect(radios.indexOf(chip) + 1).toBe(2);
    await expect(radios).toHaveLength(4);
  },
};

/** Phones: the cross is a real 24 x 24px button at every size, and the chip keeps its height. */
export const TestMobileRemove: Story = {
  tags: ['!dev'],
  name: 'Test · Mobile remove target',
  globals: { viewport: { value: 'exosMobile', isRotated: false } },
  render: () => ({
    template: `
<app-chip id="sm" size="sm" variant="removable" label="Sales" />
<app-chip id="md" variant="removable" label="Sales" />
<app-chip id="lg" size="lg" variant="removable" label="Sales" />`,
  }),
  play: async ({ canvasElement }) => {
    if (window.innerWidth >= 672) return;
    for (const [id, height] of [['sm', 24], ['md', 32], ['lg', 40]] as const) {
      const chip = canvasElement.querySelector<HTMLElement>(`#${id} .chip`)!;
      const cross = chip.querySelector<HTMLElement>('.chip-remove')!.getBoundingClientRect();
      await expect([Math.round(cross.width), Math.round(cross.height)]).toEqual([24, 24]);
      await expect(Math.round(chip.getBoundingClientRect().height)).toBe(height);
    }
  },
};

/** A disabled group keeps its answers visible: picked chips stay checked (in grey) and are announced as checked. */
export const TestDisabledPicked: Story = {
  tags: ['!dev'],
  name: 'Test · Disabled, picked',
  render: () => ({
    props: { teams: TEAMS_SHORT, priority: PRIORITY },
    template: `
<app-chip id="multi" type="multi" groupLabel="Teams" [options]="teams" [value]="['engineering', 'support']" [disabled]="true" />
<app-chip id="single" groupLabel="Priority" [options]="priority" value="high" [disabled]="true" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const support = canvas.getByRole('checkbox', { name: 'Support' });
    await expect(support).toBeDisabled();
    await expect(support).toHaveAttribute('aria-checked', 'true');
    await expect(support).toHaveClass('chip-picked-disabled');
    await expect(support.querySelector('.chip-checkbox img')).not.toBeNull();
    await expect(canvas.getByRole('checkbox', { name: 'Design' }).querySelector('.chip-checkbox img')).toBeNull();
    const high = canvas.getByRole('radio', { name: 'High' });
    await expect(high).toHaveAttribute('aria-checked', 'true');
    await expect(high.querySelector('img')).not.toBeNull();
  },
};
