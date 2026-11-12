import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { ButtonComponent } from './button';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { label: 'Button', variant: 'primary', size: 'lg', ghost: false, disabled: false, type: 'button' };

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: {
    // Accessibility checks fail the tests for buttons (not just a warning).
    a11y: { test: 'error' },
    controls: { exclude: ['classes'] },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-button',
          component: 'ButtonComponent',
          importPath: './components/button/button',
          defaults: DEFAULTS,
        }),
      },
    },
  },
  argTypes: {
    clicked: { action: 'clicked', table: { category: 'outputs' } },
    label: { description: 'A verb and a noun, in sentence case: "Save changes".' },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'destructive'],
      description: 'primary: the main action, one per view · secondary: supporting actions · destructive: deletes or removes.',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm 32px · md 40px · lg 48px on web. At least 44px on phones.',
      table: { defaultValue: { summary: 'lg' } },
    },
    ghost: { description: 'Text only: no fill, border or shadow. For low-emphasis actions.', table: { defaultValue: { summary: 'false' } } },
    disabled: { description: 'Not available yet. Explain nearby why.', table: { defaultValue: { summary: 'false' } } },
    type: {
      control: 'inline-radio',
      options: ['button', 'submit', 'reset'],
      description: 'submit: sends the form it sits in.',
      table: { defaultValue: { summary: 'button' } },
    },
  } as Meta<ButtonComponent>['argTypes'],
  args: { label: 'Save changes', clicked: fn() },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

// Playgrounds (sidebar)

export const Primary: Story = { name: 'Button' };
export const Secondary: Story = { args: { variant: 'secondary', label: 'Cancel' } };
export const Destructive: Story = { args: { variant: 'destructive', label: 'Delete' } };
export const Ghost: Story = { args: { variant: 'secondary', ghost: true, label: 'Skip for now' } };
export const Disabled: Story = { args: { disabled: true } };

// Docs: live demo. A form's actions: stacked on a phone (primary on top), in a row on web.

export const MobileExample: Story = {
  name: 'Mobile layout',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="btn-set">
  <app-button variant="secondary" label="Cancel" />
  <app-button type="submit" label="Save changes" />
</div>` }),
};

export const WebExample: Story = {
  name: 'Web layout',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="btn-set btn-set-end">
  <app-button variant="secondary" label="Cancel" />
  <app-button type="submit" label="Save changes" />
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

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  parameters: { controls: { disable: true }, example: true },
  args: {
    parts: [
      { n: 1, target: '.btn', side: 'left', whole: true },
      { n: 2, target: '.btn-label', side: 'right' },
    ],
  } as Story['args'],
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" [scale]="1.6">
  <app-button label="Save changes" />
</app-anatomy>` }),
};

// Docs: one decision each (clean code)

/** Base for the size switch: one button; the switch changes one input. */
export const Switchable: Story = { tags: ['!dev'] };

export const VarPrimary: Story = { tags: ['!dev'] };
export const VarSecondary: Story = { tags: ['!dev'], args: { variant: 'secondary', label: 'Cancel' } };
export const VarDestructive: Story = { tags: ['!dev'], args: { variant: 'destructive', label: 'Delete address' } };

export const ModGhost: Story = { tags: ['!dev'], args: { variant: 'secondary', ghost: true, label: 'Skip for now' } };
export const ModSubmit: Story = { tags: ['!dev'], args: { type: 'submit', label: 'Place order' } };

export const ModSet: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="btn-set btn-set-end">
  <app-button variant="secondary" [ghost]="true" label="Back" />
  <app-button variant="secondary" label="Save draft" />
  <app-button label="Send to client" />
</div>` }),
};

export const AllStates: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-grid gap-3" style="grid-template-columns: repeat(3, max-content); align-items: center">
  <app-button label="Save changes" />
  <app-button variant="secondary" label="Cancel" />
  <app-button variant="destructive" label="Delete" />
  <app-button label="Save changes" [disabled]="true" />
  <app-button variant="secondary" label="Cancel" [disabled]="true" />
  <app-button variant="destructive" label="Delete" [disabled]="true" />
  <app-button label="Save changes" [ghost]="true" />
  <app-button variant="secondary" label="Cancel" [ghost]="true" />
  <app-button variant="destructive" label="Delete" [ghost]="true" />
  <app-button label="Save changes" [ghost]="true" [disabled]="true" />
  <app-button variant="secondary" label="Cancel" [ghost]="true" [disabled]="true" />
  <app-button variant="destructive" label="Delete" [ghost]="true" [disabled]="true" />
</div>` }),
};

// Docs: content do's and don'ts

export const DoVerbNoun: Story = { tags: ['!dev'], args: { label: 'Delete address', variant: 'destructive' } };
export const DontVague: Story = { tags: ['!dev'], args: { label: 'OK', variant: 'destructive' } };

export const DoOnePrimary: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="btn-set"><app-button variant="secondary" label="Cancel" /><app-button label="Save changes" /></div>` }),
};
export const DontManyPrimary: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="btn-set"><app-button label="Save draft" /><app-button label="Save changes" /></div>` }),
};

export const DoSameSize: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="btn-set"><app-button variant="secondary" size="md" label="Cancel" /><app-button size="md" label="Apply" /></div>` }),
};
export const DontMixSizes: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="btn-set"><app-button variant="secondary" size="sm" label="Cancel" /><app-button label="Apply" /></div>` }),
};

export const DoFewActions: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="btn-set"><app-button variant="secondary" label="Save draft" /><app-button label="Send" /></div>` }),
};
export const DontTooMany: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="btn-set"><app-button variant="secondary" size="sm" label="Print" /><app-button variant="secondary" size="sm" label="Copy" /><app-button variant="secondary" size="sm" label="Share" /><app-button size="sm" label="Send" /></div>` }),
};

// Docs: edge cases

export const EdgeLongLabel: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div style="width: 11rem"><app-button label="Send the inspection report to the client" /></div>` }),
};
export const EdgeNarrow: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="btn-set" style="width: 11rem"><app-button variant="secondary" label="Cancel" /><app-button label="Save changes" /></div>` }),
};

// Tests (hidden; they still run)

/** 32 / 40 / 48px on web; at least 44px on phones. */
export const TestSizes: Story = {
  tags: ['!dev'],
  name: 'Test · Sizes',
  render: () => ({ template: `<app-button id="sm" size="sm" label="Small" /><app-button id="md" size="md" label="Medium" /><app-button id="lg" label="Large" />` }),
  play: async ({ canvasElement }) => {
    const mobile = canvasElement.ownerDocument.defaultView!.innerWidth < 672;
    for (const [id, web] of [['sm', 32], ['md', 40], ['lg', 48]] as const) {
      const button = canvasElement.querySelector<HTMLElement>(`#${id} button`)!;
      await expect(Math.round(button.getBoundingClientRect().height)).toBe(mobile ? Math.max(web, 44) : web);
      await expect(getComputedStyle(button).paddingLeft).toBe('15px'); // + 1px border = Carbon's 16px
    }
  },
};

/** 16px between buttons in a set on web. */
export const TestSetSpacing: Story = {
  tags: ['!dev'],
  name: 'Test · Button set spacing',
  render: DoOnePrimary.render,
  play: async ({ canvasElement }) => {
    const mobile = canvasElement.ownerDocument.defaultView!.innerWidth < 672;
    const set = canvasElement.querySelector<HTMLElement>('.btn-set')!;
    await expect(getComputedStyle(set).columnGap).toBe(mobile ? '12px' : '16px');
  },
};

export const TestClick: Story = {
  tags: ['!dev'],
  name: 'Test · Click and disabled',
  args: { clicked: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save changes' });
    await userEvent.click(button);
    await expect(args.clicked).toHaveBeenCalledTimes(1);
    await expect(button).toHaveAttribute('type', 'button');
  },
};

export const TestDisabled: Story = {
  tags: ['!dev'],
  name: 'Test · Disabled',
  args: { clicked: fn(), disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Save changes' });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.clicked).not.toHaveBeenCalled();
  },
};

/** Long labels wrap; they are never cut off. */
export const TestWrap: Story = {
  tags: ['!dev'],
  name: 'Test · Long labels wrap',
  render: EdgeLongLabel.render,
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLElement>('button')!;
    await expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
    await expect(button.getBoundingClientRect().height).toBeGreaterThan(48);
  },
};

// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'size', target: '.btn', side: 'right', label: '{v} tall' },
  { kind: 'style', target: '.btn', prop: 'font-size', side: 'top', label: '{v} text' },
  { kind: 'padding', target: '.btn', label: '{v} top and bottom', labelSides: '{v} left and right' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { controls: { disable: true }, example: true, specs: { sizes: true, switches: [] } },
  args: { size: 'lg' },
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS },
    template: `<app-redline [marks]="marks" [scale]="2" [key]="false"><app-button label="Save changes" [size]="size" /></app-redline>`,
  }),
};
