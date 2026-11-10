import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DropdownCardComponent, DropdownCardQuestion, DropdownCardRow } from './dropdown-card';
import { storySource } from '../shared/story-source';

// Content from Figma "PCR" › Form view.
const PROPERTY: DropdownCardRow[] = [
  { label: 'Gated community', value: 'No' },
  { label: 'For-sale sign', value: 'No' },
  { label: 'Homes for sale on street', value: '0' },
  { label: 'Bathrooms', value: '3' },
];

// Property rows before the Bathrooms question, as in the Figma.
const PROPERTY_SHORT: DropdownCardRow[] = [
  { label: 'Gated community', value: 'No' },
  { label: 'For-sale sign', value: 'No' },
  { label: 'Homes for sale on street', value: '0' },
];
const PROPERTY_SHORT_YES: DropdownCardRow[] = [
  { label: 'Gated community', value: 'No' },
  { label: 'For-sale sign', value: 'Yes' },
  { label: 'Homes for sale on street', value: '0' },
];

const BATHROOMS: DropdownCardQuestion = {
  text: 'How many Bathrooms did you spot?',
  hint: 'Your photos and property records don’t match.',
  prompt: 'Pick the one you saw',
  choices: [
    { label: '3 · photos', value: '3', suggested: true },
    { label: '2 · records', value: '2', icon: 'records' },
  ],
};

const CONDITION: DropdownCardRow[] = [
  { label: 'Overall condition', value: 'C4 - Average' },
  { label: 'Exterior', value: 'Average' },
  { label: 'Interior quality', value: 'Average' },
  { label: 'Garage', value: 'Detached' },
  { label: 'Garage average or above', value: 'Yes' },
  { label: 'Garbage on property', value: 'No' },
  { label: 'Deferred maintenance', value: 'No' },
];

const INTERIOR: DropdownCardQuestion = {
  text: 'The interior looks average across 35 photos. Does that match what you saw?',
  prompt: 'Pick another to change it',
  choices: [
    { label: 'Good', value: 'good' },
    { label: 'Average', value: 'average', suggested: true },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' },
  ],
};

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { title: 'Property', rows: [], status: 'answered', summary: '', question: null, actionLabel: 'Edit all', editPlaceholder: 'Edit by typing or speaking…', confirmLabel: 'Confirm', expanded: false, answer: null };

const meta: Meta<DropdownCardComponent> = {
  title: 'Components/Dropdown Card',
  component: DropdownCardComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      source: {
      language: 'typescript',
      transform: storySource({
        selector: 'app-dropdown-card',
        component: 'DropdownCardComponent',
        importPath: './components/dropdown-card/dropdown-card',
        defaults: DEFAULTS,
        models: ['expanded'],
        types: { rows: 'DropdownCardRow[]', question: 'DropdownCardQuestion', answer: 'string | string[] | null' },
        listType: 'DropdownCardRow[]',
        handlers: { confirmed: { param: 'answer: string | string[]', body: "console.log('Confirmed', answer);" } },
      }),
    },
      description: {
        component:
          'Collapsible report section from the PCR Figma (Form view › "Property · collapsed / answered"). ' +
          'Click the head to open or close it. Collapsed, it summarises the section; open, it lists answers, ' +
          'an optional question with answer chips, and an "edit by typing or speaking" line.',
      },
    },
  },
  argTypes: {
    expandedChange: { action: 'expandedChange', table: { category: 'outputs' } },
    answerChange: { action: 'answerChange', table: { category: 'outputs' } },
    action: { action: 'action', table: { category: 'outputs' } },
    confirmed: { action: 'confirmed', table: { category: 'outputs' } },
    edited: { action: 'edited', table: { category: 'outputs' } },
    micClicked: { action: 'micClicked', table: { category: 'outputs' } },
    status: { control: 'inline-radio', options: ['none', 'answered', 'attention'] },
    answer: { control: 'select', options: [null, '3', '2'] },
  },
  args: {
    title: 'Property',
    rows: PROPERTY,
    status: 'answered',
    summary: '',
    question: null,
    actionLabel: 'Edit all',
    editPlaceholder: 'Edit by typing or speaking…',
    confirmLabel: 'Confirm',
    expanded: false,
    answer: null,
  },
  // Figma frames are 360px wide on a light page.
  decorators: [componentWrapperDecorator((story) => `<div style="max-width: 360px; padding: 8px">${story}</div>`)],
};

export default meta;
type Story = StoryObj<DropdownCardComponent>;

/** Figma "Property · collapsed" — All answered. */
export const CollapsedAnswered: Story = {};

/** Figma "Property · collapsed" — 1 needs you. */
export const CollapsedNeedsYou: Story = {
  args: { status: 'attention', question: BATHROOMS, rows: PROPERTY_SHORT },
};

/** Figma "Property · answered". */
export const Expanded: Story = {
  args: { expanded: true },
};

/** Figma "Card · Property" with the open Bathrooms question. */
export const ExpandedWithQuestion: Story = {
  args: {
    expanded: true,
    status: 'attention',
    rows: PROPERTY_SHORT_YES,
    question: BATHROOMS,
    answer: '3',
    editPlaceholder: 'or edit by typing or speaking…',
  },
};

export const ChipQuestion: Story = {
  args: {
    title: 'Condition',
    expanded: true,
    status: 'attention',
    rows: CONDITION,
    question: INTERIOR,
    answer: 'average',
    editPlaceholder: 'or edit by typing or speaking…',
  },
};

export const NoAnswerPicked: Story = {
  args: {
    expanded: true,
    status: 'attention',
    rows: PROPERTY_SHORT_YES,
    question: BATHROOMS,
    editPlaceholder: 'or edit by typing or speaking…',
  },
};

export const WithoutEditAll: Story = {
  args: { expanded: true, actionLabel: '' },
};

export const WithoutEditLine: Story = {
  args: { expanded: true, editPlaceholder: '' },
};

export const CustomSummary: Story = {
  args: { title: 'Location & neighborhood', summary: 'Suburban · conforms', status: 'none', rows: [] },
};

/** A report section: several cards stacked like the Figma Form view. */
export const Stack: Story = {
  args: { property: PROPERTY, condition: CONDITION, interior: INTERIOR } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
      <div class="d-flex flex-column gap-3">
        <app-dropdown-card title="Property" [rows]="property" />
        <app-dropdown-card title="Condition" status="attention" [rows]="condition" [question]="interior" answer="average" />
        <app-dropdown-card title="Location & neighborhood" [rows]="[]" />
        <app-dropdown-card title="Other checks" [rows]="[]" />
      </div>` }),
};

/** Click opens it, picking a chip and Confirm sends the answer, click closes it. */
export const Interaction: Story = {
  tags: ['!autodocs'],
  args: { confirmed: fn(), status: 'attention', question: BATHROOMS, rows: PROPERTY_SHORT },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const head = canvas.getByRole('button', { name: /Property/ });
    await expect(head).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(head);
    await expect(head).toHaveAttribute('aria-expanded', 'true');
    const confirm = canvas.getByRole('button', { name: 'Confirm' });
    await expect(confirm).toBeDisabled();
    await userEvent.click(canvas.getByRole('radio', { name: /2 · records/ }));
    await userEvent.click(confirm);
    await expect(args.confirmed).toHaveBeenCalledWith('2');
    await userEvent.click(head);
    await expect(head).toHaveAttribute('aria-expanded', 'false');
  },
};
