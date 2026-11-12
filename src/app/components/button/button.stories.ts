import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';
import { ButtonComponent } from './button';
import { propsSource } from '../shared/story-source';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { label: 'Button', variant: 'primary', ghost: false, disabled: false, type: 'button' };

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { source: { transform: propsSource('app-button', DEFAULTS) } } },
  argTypes: {
    classes: { table: { disable: true } },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'destructive'] },
    type: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
  } as Meta<ButtonComponent>['argTypes'],
  args: {
    label: 'Confirm',
    variant: 'primary',
    ghost: false,
    disabled: false,
    clicked: fn(),
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', label: 'Answer later' } };
export const Destructive: Story = { args: { variant: 'destructive', label: 'Remove' } };
export const Disabled: Story = { args: { disabled: true } };
export const Ghost: Story = { args: { ghost: true } };

// Docs-page showcases (hidden from the sidebar).

export const Variants: Story = {
  tags: ['!dev'],
  render: () => ({
    template: `<div class="d-flex flex-wrap gap-3">
  <app-button label="Confirm" />
  <app-button variant="secondary" label="Answer later" />
  <app-button variant="destructive" label="Remove" />
</div>`,
  }),
};

export const GhostVariants: Story = {
  tags: ['!dev'],
  render: () => ({
    template: `<div class="d-flex flex-wrap gap-3">
  <app-button label="Confirm" [ghost]="true" />
  <app-button variant="secondary" label="Answer later" [ghost]="true" />
  <app-button variant="destructive" label="Remove" [ghost]="true" />
</div>`,
  }),
};

export const DisabledVariants: Story = {
  tags: ['!dev'],
  render: () => ({
    template: `<div class="d-flex flex-wrap gap-3">
  <app-button label="Confirm" [disabled]="true" />
  <app-button variant="secondary" label="Answer later" [disabled]="true" />
  <app-button variant="destructive" label="Remove" [disabled]="true" />
</div>`,
  }),
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
  parameters: { controls: { disable: true }, example: true, specs: { sizes: false, switches: [] } },
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS },
    template: `<app-redline [marks]="marks" [scale]="2" [key]="false"><app-button label="Confirm" /></app-redline>`,
  }),
};
