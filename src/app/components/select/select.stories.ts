import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RadioGroupComponent } from '../radio-group/radio-group';
import { AnatomyComponent } from '../shared/anatomy';
import { fieldColumn } from '../shared/story-decorators';
import { storySource } from '../shared/story-source';
import { SelectComponent, SelectOption } from './select';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

const COUNTRIES: SelectOption[] = [
  { label: 'Australia', value: 'au' },
  { label: 'Brazil', value: 'br' },
  { label: 'Canada', value: 'ca' },
  { label: 'France', value: 'fr' },
  { label: 'Germany', value: 'de' },
  { label: 'India', value: 'in' },
  { label: 'Japan', value: 'jp' },
  { label: 'Mexico', value: 'mx' },
  { label: 'United Kingdom', value: 'gb' },
  { label: 'United States', value: 'us' },
];

const TIMEZONES: SelectOption[] = [
  { label: 'Pacific time (UTC−8)', value: 'pt', group: 'Americas' },
  { label: 'Eastern time (UTC−5)', value: 'et', group: 'Americas' },
  { label: 'São Paulo (UTC−3)', value: 'brt', group: 'Americas' },
  { label: 'London (UTC+0)', value: 'gmt', group: 'Europe' },
  { label: 'Paris (UTC+1)', value: 'cet', group: 'Europe' },
  { label: 'Mumbai (UTC+5:30)', value: 'ist', group: 'Asia and Pacific' },
  { label: 'Tokyo (UTC+9)', value: 'jst', group: 'Asia and Pacific' },
  { label: 'Sydney (UTC+10)', value: 'aest', group: 'Asia and Pacific' },
];

const SORT: SelectOption[] = [
  { label: 'Newest first', value: 'new' },
  { label: 'Oldest first', value: 'old' },
  { label: 'Name, A to Z', value: 'az' },
  { label: 'Name, Z to A', value: 'za' },
  { label: 'Price, low to high', value: 'low' },
  { label: 'Price, high to low', value: 'high' },
];

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = {
  label: '', hideLabel: false, options: [], placeholder: 'Choose…', size: 'md', appearance: 'outline', floatingLabel: false,
  helpText: '', state: 'none', feedback: '', disabled: false, readonly: false, required: false, optional: false, value: '',
};

const meta: Meta<SelectComponent> = {
  title: 'Components/Forms/Select',
  component: SelectComponent,
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] }), fieldColumn],
  parameters: {
    // Accessibility checks fail the tests for selects (not just a warning).
    a11y: { test: 'error' },
    // Internal members: keep the API table to real inputs and outputs.
    controls: {
      exclude: [
        'describedBy', 'feedbackClass', 'feedbackId', 'formDisabled', 'groups', 'helpId', 'isDisabled', 'onBlur',
        'onChange', 'onKeydown', 'onReadonlyPointer', 'onSelect', 'onTouched', 'selectClasses', 'showFeedback',
        'selectId', 'writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState',
      ],
    },
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
    label: { description: 'Always set one. It names the field for screen readers too.' },
    hideLabel: { description: 'Hides the label on screen but keeps it for screen readers, e.g. a sort control.' },
    options: { description: '`{ label, value, disabled?, group? }`. Options with a `group` are listed under that heading.' },
    placeholder: { description: 'Shown while nothing is picked; it can’t be picked itself. Empty string hides it.' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm 32px · md 40px · lg 48px on web. At least 44px on mobile.',
      table: { defaultValue: { summary: 'md' } },
    },
    appearance: {
      control: 'inline-radio',
      options: ['outline', 'filled', 'pill'],
      description: 'outline: most forms · filled: toolbars and filters · pill: short, casual choices.',
      table: { defaultValue: { summary: 'outline' } },
    },
    state: { control: 'inline-radio', options: ['none', 'valid', 'warning', 'invalid'], table: { defaultValue: { summary: 'none' } } },
    readonly: { description: 'Visible and reachable with Tab, but won’t open.' },
    optional: { description: 'Adds "(optional)" after the label.' },
    selectId: { table: { disable: true } },
  },
  args: { label: 'Country', options: COUNTRIES, placeholder: 'Choose a country', value: '' },
};

export default meta;
type Story = StoryObj<SelectComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Select' };
export const Picked: Story = { args: { value: 'ca' } };
export const Groups: Story = { args: { label: 'Time zone', options: TIMEZONES, placeholder: 'Choose a time zone' } };
export const Warning: Story = {
  args: { label: 'Time zone', options: TIMEZONES, value: 'jst', state: 'warning', feedback: 'That’s different from your device’s time zone.' },
};
export const Invalid: Story = { args: { required: true, state: 'invalid', feedback: 'Choose the country you’re shipping to.' } };
export const Readonly: Story = { name: 'Read only', args: { value: 'ca', readonly: true, helpText: 'Set by your account.' } };
export const Disabled: Story = { args: { value: 'ca', disabled: true } };

export const ReactiveForm: Story = {
  name: 'Reactive form',
  args: { countries: COUNTRIES, control: new FormControl('', { nonNullable: true, validators: [Validators.required] }) } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-select
  label="Country"
  [options]="countries"
  placeholder="Choose a country"
  [required]="true"
  [formControl]="control"
  [state]="control.touched && control.invalid ? 'invalid' : 'none'"
  feedback="Choose the country you’re shipping to."
/>
<p class="mt-3 mb-0 small text-body-secondary">Form value: {{ control.value || '(empty)' }}</p>` }),
};

// Docs: live demo. One responsive form; phones open their own picker.

export const Overview: Story = {
  tags: ['!dev'],
  args: { countries: COUNTRIES, zones: TIMEZONES } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<form class="exos-grid">
  <app-select class="exos-col-4 exos-col-md-4 exos-col-lg-8" label="Country" [options]="countries" placeholder="Choose a country" value="ca" />
  <app-select class="exos-col-4 exos-col-md-4 exos-col-lg-8" label="Time zone" [options]="zones" placeholder="Choose a time zone" helpText="Used for delivery times." />
</form>` }),
};

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    countries: COUNTRIES,
    parts: [
      { n: 1, target: 'label.form-label', side: 'left' },
      { n: 2, target: 'select', side: 'left', whole: true },
      { n: 3, target: 'select', side: 'right', whole: true },
      { n: 4, target: '.form-text', side: 'left' },
    ],
  } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="18rem">
  <app-select label="Country" [options]="countries" value="ca" helpText="Where we ship your order." />
</app-anatomy>` }),
};

// Docs: one decision each (clean code)

export const Switchable: Story = { tags: ['!dev'], args: { value: 'ca' } };
export const ModPlaceholder: Story = { tags: ['!dev'], args: {} };
export const ModGroups: Story = { tags: ['!dev'], args: { label: 'Time zone', options: TIMEZONES, placeholder: 'Choose a time zone' } };
export const ModHelp: Story = { tags: ['!dev'], args: { helpText: 'Where we ship your order.' } };
export const ModOptional: Story = { tags: ['!dev'], args: { label: 'Country of birth', optional: true } };
export const ModHiddenLabel: Story = {
  tags: ['!dev'],
  args: { label: 'Sort by', hideLabel: true, options: SORT, placeholder: '', value: 'new', appearance: 'filled', size: 'sm' },
};
export const ModFloating: Story = { tags: ['!dev'], args: { floatingLabel: true, placeholder: '', value: 'ca' } };

// Docs: states (visual reference, no code)

export const AllStates: Story = {
  tags: ['!dev'],
  args: { countries: COUNTRIES } as Story['args'],
  parameters: { controls: { disable: true }, example: true, fullWidth: true },
  render: (args) => ({ props: args, template: `
<div class="d-grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr))">
  <app-select label="Nothing picked" [options]="countries" placeholder="Choose a country" />
  <app-select label="Picked" [options]="countries" value="ca" />
  <app-select label="Valid" [options]="countries" value="ca" state="valid" feedback="We ship there." />
  <app-select label="Warning" [options]="countries" value="br" state="warning" feedback="Delivery takes 2 to 3 weeks." />
  <app-select label="Invalid" [options]="countries" placeholder="Choose a country" state="invalid" feedback="Choose a country." />
  <app-select label="Read only" [options]="countries" value="ca" [readonly]="true" />
  <app-select label="Disabled" [options]="countries" value="ca" [disabled]="true" />
</div>` }),
};

// Docs: Do / Don't

export const DoManyOptions: Story = { tags: ['!dev'], args: { value: 'ca' } };
export const DontFewOptions: Story = {
  tags: ['!dev'],
  args: { label: 'Size', options: [{ label: 'Small', value: 's' }, { label: 'Medium', value: 'm' }, { label: 'Large', value: 'l' }], placeholder: 'Choose a size' },
};
export const DoFewAsRadios: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [RadioGroupComponent] })],
  render: () => ({
    props: { sizes: [{ label: 'Small', value: 's' }, { label: 'Medium', value: 'm' }, { label: 'Large', value: 'l' }] },
    template: `<app-radio-group label="Size" [options]="sizes" value="m" [inline]="true" />`,
  }),
};
export const DontPreselectFirst: Story = { tags: ['!dev'], args: { placeholder: '', value: 'au' } };
export const DoGroupLong: Story = { tags: ['!dev'], args: { label: 'Time zone', options: TIMEZONES, value: 'et' } };
export const DontLongLabels: Story = {
  tags: ['!dev'],
  args: {
    label: 'Plan',
    options: [
      { label: 'Starter plan, which is for one person working on their own', value: 'starter' },
      { label: 'Team plan, for up to ten people', value: 'team' },
    ],
    value: 'starter',
  },
};

// Docs: edge cases

export const EdgeLongOption: Story = {
  tags: ['!dev'],
  args: {
    label: 'Reason',
    options: [{ label: 'The item arrived damaged and the box was open', value: 'damaged' }, { label: 'Other', value: 'other' }],
    value: 'damaged',
  },
};
export const EdgeDisabledOption: Story = {
  tags: ['!dev'],
  args: {
    label: 'Delivery',
    options: [
      { label: 'Standard', value: 'standard' },
      { label: 'Express (sold out)', value: 'express', disabled: true },
      { label: 'Pick up in store', value: 'pickup' },
    ],
    value: 'standard',
  },
};
export const EdgeOneOption: Story = { tags: ['!dev'], args: { label: 'Currency', options: [{ label: 'US dollar', value: 'usd' }], placeholder: '', value: 'usd' } };

// Tests (hidden; they still run)

/** 32 / 40 / 48px on web; at least 44px with 16px text on mobile. */
export const TestSizes: Story = {
  tags: ['!dev'],
  name: 'Test · Sizes',
  render: () => ({
    props: { countries: COUNTRIES },
    template: `<app-select id="sm" size="sm" label="Small" [options]="countries" /><app-select id="md" label="Medium" [options]="countries" /><app-select id="lg" size="lg" label="Large" [options]="countries" />`,
  }),
  play: async ({ canvasElement }) => {
    const mobile = canvasElement.ownerDocument.defaultView!.innerWidth < 672;
    for (const [id, web] of [['sm', 32], ['md', 40], ['lg', 48]] as const) {
      const field = canvasElement.querySelector<HTMLElement>(`#${id} select`)!;
      await expect(Math.round(field.getBoundingClientRect().height)).toBe(mobile ? Math.max(web, 44) : web);
    }
  },
};

/** Grouped options are listed under their headings. */
export const TestGroups: Story = {
  tags: ['!dev'],
  name: 'Test · Groups',
  args: { ...Groups.args },
  play: async ({ canvasElement }) => {
    const groups = [...canvasElement.querySelectorAll('optgroup')].map((g) => g.label);
    await expect(groups).toEqual(['Americas', 'Europe', 'Asia and Pacific']);
    await expect(canvasElement.querySelectorAll('optgroup')[1].querySelectorAll('option')).toHaveLength(2);
  },
};

/** Picking an option updates the value; the placeholder can't be picked. */
export const TestPick: Story = {
  tags: ['!dev'],
  name: 'Test · Pick',
  args: { valueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const select = within(canvasElement).getByRole('combobox', { name: 'Country' });
    await expect(within(select).getByRole('option', { name: 'Choose a country' })).toBeDisabled();
    await userEvent.selectOptions(select, 'Japan');
    await expect(args.valueChange).toHaveBeenLastCalledWith('jp');
  },
};

/** Read only: focusable, but keys don't change it. */
export const TestReadonly: Story = {
  tags: ['!dev'],
  name: 'Test · Read only',
  args: { ...Readonly.args, valueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const select = within(canvasElement).getByRole<HTMLSelectElement>('combobox', { name: 'Country' });
    await userEvent.tab();
    await expect(select).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(select.value).toBe('ca');
    await expect(select).toHaveAttribute('aria-readonly', 'true');
    await expect(args.valueChange).not.toHaveBeenCalled();
  },
};

/** What a screen reader gets: name, required, invalid and the message. */
export const TestScreenReader: Story = {
  tags: ['!dev'],
  name: 'Test · Screen reader text',
  args: { ...Invalid.args },
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox', { name: 'Country' });
    await expect(select).toBeRequired();
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(select).toHaveAccessibleDescription('Choose the country you’re shipping to.');
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
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Country' }), 'France');
    await expect(canvas.getByText('Form value: fr')).toBeInTheDocument();
  },
};


// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'size', target: 'select', side: 'right', label: '{v} tall' },
  { kind: 'style', target: 'select', prop: 'font-size', side: 'top', label: '{v} text' },
  { kind: 'style', target: '.form-label', prop: 'font-size', side: 'top', label: '{v} label' },
  { kind: 'padding', target: 'select', label: '{v} top and bottom', labelSides: '{v} on the left' },
  { kind: 'gap', from: '.form-label', to: 'select', side: 'right', label: '{v} label to field' },
  { kind: 'gap', from: 'select', to: '.form-text', side: 'right', label: '{v} to help text' },
  { kind: 'gap', from: 'select', to: '.invalid-feedback', side: 'right', label: '{v} to error' },
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
    props: { ...args, marks: SPEC_MARKS, options: COUNTRIES },
    template: `<app-redline [marks]="marks" [scale]="1.3" [room]="150" [key]="false"><div style="width: min(18rem, calc(100vw - 200px))"><app-select label="Country" [options]="options" [size]="size" [helpText]="note === 'help' ? 'Where the order ships.' : ''" [state]="note === 'error' ? 'invalid' : 'none'" [feedback]="note === 'error' ? 'Choose a country.' : ''" /></div></app-redline>`,
  }),
};
