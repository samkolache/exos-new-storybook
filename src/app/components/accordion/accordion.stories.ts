import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { AccordionComponent, AccordionItemComponent } from './accordion';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { multiple: true, size: 'md', chevron: 'end', headingLevel: 3 };

const EXAMPLE = { controls: { disable: true }, example: true };

const ITEMS = `
  <app-accordion-item title="Shipping">
    <p>Orders ship in 1 to 2 business days. Standard delivery takes 3 to 5 days.</p>
  </app-accordion-item>
  <app-accordion-item title="Returns" [open]="true">
    <p>Return unused items within 30 days for a full refund.</p>
  </app-accordion-item>
  <app-accordion-item title="Payment">
    <p>We take cards, PayPal and bank transfers.</p>
  </app-accordion-item>`;

const meta: Meta<AccordionComponent> = {
  title: 'Components/Accordion',
  component: AccordionComponent,
  decorators: [moduleMetadata({ imports: [AccordionItemComponent] })],
  parameters: {
    // Accessibility checks fail the tests for accordions (not just a warning).
    a11y: { test: 'error' },
    controls: { exclude: ['items'] },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({ selector: 'app-accordion', component: 'AccordionComponent', importPath: './components/accordion/accordion', defaults: DEFAULTS }),
      },
    },
  },
  argTypes: {
    multiple: { description: 'Several sections open at once. Off: opening one closes the others.' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Row height on web: sm 32px · md 40px · lg 48px. At least 44px on phones.',
      table: { defaultValue: { summary: 'md' } },
    },
    chevron: { control: 'inline-radio', options: ['start', 'end'], table: { defaultValue: { summary: 'end' } } },
    headingLevel: { control: 'inline-radio', options: [2, 3, 4, 5, 6], description: 'The heading level of each title, to fit the page outline.' },
  },
  args: { multiple: true, size: 'md', chevron: 'end', headingLevel: 3 },
  render: (args) => ({
    props: args,
    template: `<app-accordion [multiple]="multiple" [size]="size" [chevron]="chevron" [headingLevel]="headingLevel">${ITEMS}</app-accordion>`,
  }),
};

export default meta;
type Story = StoryObj<AccordionComponent>;

// Playground (sidebar)

export const Default: Story = { name: 'Accordion' };

// Docs: live demo

export const Overview: Story = { tags: ['!dev'] };

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    parts: [
      { n: 1, target: 'app-accordion-item:nth-child(2) .exos-accordion-title', side: 'left' },
      { n: 2, target: 'app-accordion-item:nth-child(2) .exos-accordion-meta', side: 'top' },
      { n: 3, target: 'app-accordion-item:nth-child(2) .exos-accordion-chevron', side: 'right', whole: true },
      { n: 4, target: 'app-accordion-item:nth-child(2) .exos-accordion-content p', side: 'left' },
      { n: 5, target: 'app-accordion-item:nth-child(1)', side: 'right', whole: true },
    ],
  } as Story['args'],
  render: (args) => ({
    props: args,
    template: `
<app-anatomy [parts]="parts" width="22rem">
  <app-accordion>
    <app-accordion-item title="Shipping"><p>Orders ship in 1 to 2 business days.</p></app-accordion-item>
    <app-accordion-item title="Returns" meta="30 days" [open]="true"><p>Return unused items for a full refund.</p></app-accordion-item>
  </app-accordion>
</app-anatomy>`,
  }),
};

// Docs: one decision each

export const VarMultiple: Story = { tags: ['!dev'] };
export const VarSingle: Story = { tags: ['!dev'], args: { multiple: false } };
export const SizeSwitchable: Story = { tags: ['!dev'] };
export const ModChevronStart: Story = { tags: ['!dev'], args: { chevron: 'start' } };
export const ModMeta: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<app-accordion>
  <app-accordion-item title="Photos" meta="12"><p>12 photos from the visit.</p></app-accordion-item>
  <app-accordion-item title="Notes" meta="3"><p>3 notes from the visit.</p></app-accordion-item>
  <app-accordion-item title="Documents" meta="None yet" [disabled]="true"><p>No documents yet.</p></app-accordion-item>
</app-accordion>` }),
};

// Docs: Do / Don't

export const DoScannableTitles: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<app-accordion size="sm">
  <app-accordion-item title="Shipping"><p>…</p></app-accordion-item>
  <app-accordion-item title="Returns"><p>…</p></app-accordion-item>
  <app-accordion-item title="Payment"><p>…</p></app-accordion-item>
</app-accordion>` }),
};
export const DontVagueTitles: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<app-accordion size="sm">
  <app-accordion-item title="More information"><p>…</p></app-accordion-item>
  <app-accordion-item title="Details"><p>…</p></app-accordion-item>
  <app-accordion-item title="Other"><p>…</p></app-accordion-item>
</app-accordion>` }),
};
export const DoShowWhatMatters: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div>
  <p class="mb-2">Total due today: <strong>$86.40</strong></p>
  <app-accordion size="sm"><app-accordion-item title="Price breakdown"><p>…</p></app-accordion-item></app-accordion>
</div>` }),
};
export const DontHideWhatMatters: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<app-accordion size="sm">
  <app-accordion-item title="Total due today"><p>$86.40</p></app-accordion-item>
  <app-accordion-item title="Price breakdown"><p>…</p></app-accordion-item>
</app-accordion>` }),
};

// Tests (hidden; they still run)

/** Buttons open and close their panel and say so; Enter and Space work. */
export const TestToggle: Story = {
  tags: ['!dev'],
  name: 'Test · Toggle',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shipping = canvas.getByRole('button', { name: 'Shipping' });
    await expect(shipping).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(shipping);
    await expect(shipping).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region', { name: 'Shipping' })).toBeVisible();
    shipping.focus();
    await userEvent.keyboard('{Enter}');
    await expect(shipping).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  },
};

/** One at a time: opening a section closes the open one. */
export const TestSingle: Story = {
  tags: ['!dev'],
  name: 'Test · One at a time',
  args: { multiple: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Shipping' }));
    await expect(canvas.getByRole('button', { name: 'Shipping' })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: 'Returns' })).toHaveAttribute('aria-expanded', 'false');
  },
};
