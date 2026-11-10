import type { Meta, StoryObj } from '@storybook/angular-vite';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';
import { LucideChevronLeft, LucideChevronRight, LucideX } from '@lucide/angular';
import { IconButtonComponent } from './icon-button';

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
