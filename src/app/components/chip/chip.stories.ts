import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
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
  size: 'md',
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
    // Accessibility checks fail the tests for chips (not just a warning).
    a11y: { test: 'error' },
    // Internal members: keep the API table to real inputs and outputs.
    controls: { exclude: ['chips', 'classesOf', 'click', 'formDisabled', 'isDisabled', 'isGroup', 'nextValue', 'onChange', 'onTouched', 'picked', 'stateOf', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState', 'onKeydown', 'tabIndexOf', 'titleOf', 'chipRole', 'tabStop', 'host'] },
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
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm 24px · md 32px (the Figma chip) · lg 40px. Applies to every chip in a group.',
      table: { defaultValue: { summary: 'md' } },
    },
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

export const WithIcon: Story = { tags: ['!dev'], args: { label: '2 · records', icon: 'records' } };

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
  name: 'Group',
  args: { options: CONDITION, groupLabel: 'Interior condition', value: 'average' },
};

export const GroupNothingPicked: Story = {
  tags: ['!dev'],
  name: 'Group · Nothing picked',
  args: { options: AREA, groupLabel: 'Area' },
};

export const GroupWithIcons: Story = {
  tags: ['!dev'],
  name: 'Group · With icons',
  args: { options: BATHROOMS, groupLabel: 'Bathrooms', value: '3' },
};

export const GroupMulti: Story = {
  name: 'Multi group',
  args: { options: ADVERSE, type: 'multi', groupLabel: 'Adverse influences nearby', value: ['commercial', 'freeway'] },
};

export const GroupDisabled: Story = {
  tags: ['!dev'],
  name: 'Group · Disabled',
  args: { options: CONDITION, groupLabel: 'Interior condition', value: 'average', disabled: true },
};

/** Bound to a reactive FormControl. */
export const GroupReactiveForm: Story = {
  name: 'Reactive form',
  args: { options: ADVERSE, control: new FormControl<string[]>(['commercial']) } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-chip type="multi" groupLabel="Adverse influences nearby" [options]="options" [formControl]="control" />
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
    const chip = within(canvasElement).getByRole('button', { name: /Fair/ });
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
  tags: ['!dev'],
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
  <app-chip label="Commercial" type="multi" [selected]="true" [suggested]="true" />
</app-anatomy>` }),
};

// Mobile / Web demo (top of the docs page). The two layouts of the same questions:
// mobile stacks each question above its chips across the 4 columns (44px tap areas);
// web puts the question in a label column and the chips beside it (16 columns).

export const MobileExample: Story = {
  name: 'Mobile layout',
  tags: ['!dev'],
  args: { condition: CONDITION, adverse: ADVERSE } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="exos-grid">
  <div class="exos-col-4">
    <p id="condition-label" class="fw-semibold mb-2">How is the interior condition?</p>
    <app-chip labelledBy="condition-label" [options]="condition" value="average" />
  </div>
  <div class="exos-col-4">
    <p id="adverse-label" class="fw-semibold mb-2">Anything nearby that affects value?</p>
    <app-chip type="multi" labelledBy="adverse-label" [options]="adverse" [value]="['commercial', 'freeway']" />
  </div>
</div>` }),
};

export const WebExample: Story = {
  name: 'Web layout',
  tags: ['!dev'],
  args: { condition: CONDITION, adverse: ADVERSE } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<div class="exos-grid align-items-center">
  <p id="condition-label" class="exos-col-lg-5 fw-semibold mb-0">How is the interior condition?</p>
  <div class="exos-col-lg-11">
    <app-chip labelledBy="condition-label" [options]="condition" value="average" />
  </div>
  <p id="adverse-label" class="exos-col-lg-5 fw-semibold mb-0">Anything nearby that affects value?</p>
  <div class="exos-col-lg-11">
    <app-chip type="multi" labelledBy="adverse-label" [options]="adverse" [value]="['commercial', 'freeway']" />
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
  { label: 'Good', value: 'good' },
  { label: 'Average', value: 'average', suggested: true },
  { label: 'Fair', value: 'fair', disabled: true },
  { label: 'Poor', value: 'poor' },
];

/** WAI-ARIA radio group: one Tab stop, arrows move and pick, disabled chips are skipped. */
export const TestKeyboard: Story = {
  tags: ['!dev'],
  name: 'Test · Keyboard',
  args: { options: RATING, groupLabel: 'Condition', value: 'average', valueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio');
    // One Tab stop: the picked chip.
    await expect(radios.filter((r) => r.tabIndex === 0)).toHaveLength(1);
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: /Average/ })).toHaveFocus();
    // Right arrow skips the disabled "Fair" and picks "Poor".
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Poor' })).toHaveFocus();
    await expect(args.valueChange).toHaveBeenLastCalledWith('poor');
    // Wraps around, and Home / End jump to the ends.
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'Good' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{End}');
    await expect(args.valueChange).toHaveBeenLastCalledWith('poor');
    await userEvent.keyboard('{Home}');
    await expect(args.valueChange).toHaveBeenLastCalledWith('good');
    // Tab leaves the group in one step.
    await expect(canvas.getAllByRole('radio').filter((r) => r.tabIndex === 0)).toHaveLength(1);
  },
};

/** Multi groups: each chip is a checkbox and its own Tab stop; Space toggles; disabled chips can't be picked. */
export const TestMultiKeyboard: Story = {
  tags: ['!dev'],
  name: 'Test · Multi keyboard',
  args: { options: ADVERSE, type: 'multi', groupLabel: 'Adverse influences', value: [], valueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('checkbox', { name: 'Powerlines' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(args.valueChange).toHaveBeenLastCalledWith(['powerlines']);
    await expect(canvas.getByRole('checkbox', { name: 'Airport' })).toBeDisabled();
  },
};

const FORM_CONTROL = new FormControl<string | null>('average');

/** Works with reactive forms both ways, and follows the control's disabled state. */
export const TestReactiveForm: Story = {
  tags: ['!dev'],
  name: 'Test · Reactive form',
  render: () => ({
    props: { options: CONDITION, control: FORM_CONTROL },
    template: `<app-chip groupLabel="Condition" [options]="options" [formControl]="control" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    FORM_CONTROL.enable();
    FORM_CONTROL.setValue('average');
    await expect(await canvas.findByRole('radio', { name: /Average/ })).toHaveAttribute('aria-checked', 'true');
    // Chip → form
    await userEvent.click(canvas.getByRole('radio', { name: 'Poor' }));
    await expect(FORM_CONTROL.value).toBe('poor');
    await expect(FORM_CONTROL.touched).toBe(true);
    // Form → chips
    FORM_CONTROL.setValue('good');
    await expect(await canvas.findByRole('radio', { name: 'Good', checked: true })).toBeInTheDocument();
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
    template: `<div style="width: 200px"><app-chip label="Recently renovated kitchen and both bathrooms" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole('button');
    const label = chip.querySelector('.chip-label') as HTMLElement;
    await expect(chip.getBoundingClientRect().width).toBeLessThanOrEqual(200);
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(chip).toHaveAttribute('title', 'Recently renovated kitchen and both bathrooms');
  },
};

// Formatting: where icons go (docs only).

// Modifiers: one detail each, with clean code (docs only).

const SOURCES: ChipOption[] = [
  { label: '3 · photos', value: 'photos' },
  { label: '2 · records', value: 'records', icon: 'records' },
];

/** Source icon: the option says where the answer came from. */
export const ModifierSource: Story = {
  tags: ['!dev'],
  args: { options: SOURCES, groupLabel: 'Bathrooms', value: 'photos' },
};

const SUGGESTED: ChipOption[] = [
  { label: 'Good', value: 'good' },
  { label: 'Average', value: 'average', suggested: true },
  { label: 'Fair', value: 'fair' },
  { label: 'Poor', value: 'poor' },
];

/** AI suggested: the option the AI picked carries a sparkle. */
export const ModifierSuggested: Story = {
  tags: ['!dev'],
  args: { options: SUGGESTED, groupLabel: 'Interior condition', value: 'average' },
};

// Content: Do / Don't examples (docs only).

const YES_NO: ChipOption[] = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no', suggested: true },
];

export const DoShortLabels: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: CONDITION }, template: `<app-chip groupLabel="Interior condition" [options]="options" value="average" />` }),
};

export const DontLongLabels: Story = {
  tags: ['!dev'],
  render: () => ({
    props: {
      options: [
        { label: 'The interior is in good condition', value: 'good' },
        { label: 'It looks about average to me', value: 'average' },
        { label: 'Poor, needs work', value: 'poor' },
      ],
    },
    template: `<div style="max-width: 300px; margin: 0 auto"><app-chip groupLabel="Interior condition" [options]="options" value="average" /></div>`,
  }),
};

export const DoQuestionAsLabel: Story = {
  tags: ['!dev'],
  render: () => ({
    props: { options: YES_NO },
    template: `<div data-align="start" style="max-width: 300px; margin: 0 auto"><p id="sign-q" class="fw-semibold mb-2">Is there a for-sale sign?</p><app-chip labelledBy="sign-q" [options]="options" value="no" /></div>`,
  }),
};

export const DontQuestionInChips: Story = {
  tags: ['!dev'],
  render: () => ({
    props: {
      options: [
        { label: 'For-sale sign: yes', value: 'yes' },
        { label: 'For-sale sign: no', value: 'no' },
      ],
    },
    template: `<app-chip groupLabel="For-sale sign" [options]="options" value="no" />`,
  }),
};

export const DoOneSuggestion: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: CONDITION }, template: `<app-chip groupLabel="Interior condition" [options]="options" value="average" />` }),
};

export const DontManySuggestions: Story = {
  tags: ['!dev'],
  render: () => ({
    props: { options: CONDITION.map((o) => ({ ...o, suggested: true })) },
    template: `<app-chip groupLabel="Interior condition" [options]="options" value="average" />`,
  }),
};

export const DoAnswers: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: AREA }, template: `<app-chip groupLabel="Area" [options]="options" value="suburban" />` }),
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

/** Sizes are 24 / 32 / 40px, and on mobile every size gets a 44px tap area with no overlap. */
export const TestSizes: Story = {
  tags: ['!dev'],
  name: 'Test · Sizes',
  globals: { viewport: { value: 'exosMobile', isRotated: false } },
  render: () => ({
    props: { options: ADVERSE },
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
      // Below md, tap areas are 44px and rows sit exactly 44px apart, so they touch but don't overlap.
      if (window.innerWidth < 672) {
        await expect(parseFloat(getComputedStyle(chips[0], '::after').height)).toBe(44);
        const tops = [...new Set(chips.map((c) => Math.round(c.getBoundingClientRect().top)))];
        if (tops.length > 1) await expect(tops[1] - tops[0]).toBeGreaterThanOrEqual(44);
      }
    }
  },
};

// Interaction: edge cases (docs only).

const ROOMS: ChipOption[] = ['Kitchen', 'Living room', 'Dining', 'Bath 1', 'Bath 2', 'Bedroom 1', 'Bedroom 2', 'Office', 'Laundry', 'Garage', 'Basement', 'Attic'].map(
  (label) => ({ label, value: label.toLowerCase().replace(/\s+/g, '-') }),
);

export const EdgeLongLabel: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div style="width: 180px"><app-chip label="Recently renovated kitchen and both bathrooms" /></div>` }),
};

export const EdgeOneOption: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: [{ label: 'Yes', value: 'yes' }] }, template: `<app-chip groupLabel="Confirm" [options]="options" value="yes" />` }),
};

export const EdgeTooMany: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: ROOMS }, template: `<app-chip size="sm" groupLabel="Room" [options]="options" />` }),
};

// About 5 options at most on a phone.
export const DoFewOnPhone: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: CONDITION }, template: `<div style="width: 300px; margin: 0 auto"><app-chip groupLabel="Interior condition" [options]="options" value="average" /></div>` }),
};

export const DontManyOnPhone: Story = {
  tags: ['!dev'],
  render: () => ({ props: { options: ROOMS }, template: `<div style="width: 300px; margin: 0 auto"><app-chip groupLabel="Room" [options]="options" /></div>` }),
};

/** The screen reader output shown on the docs page is what the chip really exposes. */
export const TestScreenReader: Story = {
  tags: ['!dev'],
  name: 'Test · Screen reader output',
  args: { options: CONDITION, groupLabel: 'Interior condition', value: 'average' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Interior condition' });
    const chip = within(group).getByRole('radio', { name: 'Average (AI suggested)' });
    await expect(chip).toHaveAttribute('aria-checked', 'true');
    const radios = within(group).getAllByRole('radio');
    await expect(radios.indexOf(chip) + 1).toBe(2);
    await expect(radios).toHaveLength(4);
  },
};

