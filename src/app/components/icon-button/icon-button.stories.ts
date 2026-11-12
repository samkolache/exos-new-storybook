import type { Meta, StoryObj } from '@storybook/angular-vite';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';
import { LucideChevronLeft, LucideChevronRight, LucideX } from '@lucide/angular';
import { IconButtonComponent } from './icon-button';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

const icons = { ChevronLeft: LucideChevronLeft, ChevronRight: LucideChevronRight, X: LucideX };

const surface = (content: string, dark = false) =>
  `<div class="d-inline-flex gap-3 p-4 rounded-3" style="background: var(${
    dark ? '--color-action-primary-end' : '--color-background-subtle'
  })">${content}</div>`;

const meta: Meta<IconButtonComponent> = {
  title: 'Components/IconButton',
  component: IconButtonComponent,
  decorators: [
    moduleMetadata({ imports: [IconButtonComponent] }),
    // Show each variant on the surface it's designed for: glass on dark, the rest on a light tint.
    // Stories that lay out their own surfaces set `parameters.surface: false`.
    (storyFn, context) =>
      context.parameters['surface'] === false
        ? storyFn()
        : componentWrapperDecorator((story) => surface(story, context.args['variant'] === 'glass'))(
            storyFn,
            context,
          ),
  ],
  argTypes: {
    classes: { table: { disable: true } },
    icon: { control: 'select', options: Object.keys(icons), mapping: icons },
    variant: { control: 'inline-radio', options: ['light', 'primary', 'glass', 'ghost'] },
  } as Meta<IconButtonComponent>['argTypes'],
  args: {
    icon: 'ChevronLeft', // key into `icons`; Storybook maps it to the Lucide icon
    label: 'Back',
    variant: 'light',
    disabled: false,
    clicked: fn(),
  },
};

export default meta;
type Story = StoryObj<IconButtonComponent>;

export const Default: Story = {};
export const Primary: Story = { args: { variant: 'primary' } };
export const Glass: Story = { args: { variant: 'glass', icon: 'X' as never, label: 'Close' } };
export const Ghost: Story = { args: { variant: 'ghost' } };

// Docs-page showcases (hidden from the sidebar).

export const Variants: Story = {
  tags: ['!dev'],
  parameters: { surface: false },
  render: () => ({
    props: { LucideChevronLeft, LucideX },
    template: `<div class="d-flex flex-wrap gap-3">
  ${surface(`<app-icon-button [icon]="LucideChevronLeft" label="Back" variant="light" />
    <app-icon-button [icon]="LucideChevronLeft" label="Back" variant="primary" />
    <app-icon-button [icon]="LucideChevronLeft" label="Back" variant="ghost" />`)}
  ${surface(`<app-icon-button [icon]="LucideX" label="Close" variant="glass" />`, true)}
</div>`,
  }),
};

export const Icons: Story = {
  tags: ['!dev'],
  render: () => ({
    props: { LucideChevronLeft, LucideChevronRight, LucideX },
    template: `<div class="d-flex gap-3">
  <app-icon-button [icon]="LucideChevronLeft" label="Back" />
  <app-icon-button [icon]="LucideChevronRight" label="Next" />
  <app-icon-button [icon]="LucideX" label="Close" />
</div>`,
  }),
};

export const AccessibleLabel: Story = {
  tags: ['!dev'],
  render: () => ({
    props: { LucideChevronLeft },
    template: `<app-icon-button [icon]="LucideChevronLeft" label="Back" />`,
  }),
};


// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'size', target: '.btn-icon', side: 'right', label: '{v} tall' },
  { kind: 'size', target: '.btn-icon', side: 'bottom', label: '{v} wide' },
  { kind: 'size', target: '.btn-icon svg', side: 'top', label: '{v} icon' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { controls: { disable: true }, example: true, specs: { sizes: false, switches: [] } },
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS, icon: LucideChevronLeft },
    template: `<app-redline [marks]="marks" [scale]="2" [key]="false"><app-icon-button [icon]="icon" label="Back" /></app-redline>`,
  }),
};
