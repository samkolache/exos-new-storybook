import type { Meta, StoryObj } from '@storybook/angular-vite';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular-vite';
import { fn } from 'storybook/test';
import { ProgressButtonComponent } from './progress-button';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

const meta: Meta<ProgressButtonComponent> = {
  title: 'Components/ProgressButton',
  component: ProgressButtonComponent,
  decorators: [
    moduleMetadata({ imports: [ProgressButtonComponent] }),
    // Translucent, white-text button: designed to sit on a dark surface.
    componentWrapperDecorator(
      (story) =>
        `<div class="d-inline-block p-4 rounded-3" style="background: var(--color-action-primary-end)">${story}</div>`,
    ),
  ],
  argTypes: {
    status: { table: { disable: true } },
    classes: { table: { disable: true } },
  } as Meta<ProgressButtonComponent>['argTypes'],
  args: {
    label: 'Review interior',
    completed: 0,
    total: 8,
    disabled: false,
    clicked: fn(),
  },
};

export default meta;
type Story = StoryObj<ProgressButtonComponent>;

export const Pending: Story = {};
export const InProgress: Story = { args: { completed: 3 } };
export const Complete: Story = { args: { completed: 8 } };

// Docs-page showcases (hidden from the sidebar).

export const Statuses: Story = {
  tags: ['!dev'],
  render: () => ({
    template: `<div class="d-flex flex-wrap gap-3">
  <app-progress-button label="Review interior" [completed]="0" [total]="8" />
  <app-progress-button label="Review interior" [completed]="3" [total]="8" />
  <app-progress-button label="Review interior" [completed]="8" [total]="8" />
</div>`,
  }),
};


// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'size', target: '.btn-progress', side: 'right', label: '{v} tall' },
  { kind: 'style', target: '.btn-progress', prop: 'font-size', side: 'top', label: '{v} text' },
  { kind: 'size', target: '.btn-progress .badge', side: 'top', label: '{v} count' },
  { kind: 'padding', target: '.btn-progress', label: '{v} top and bottom', labelSides: '{v} left and right' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { controls: { disable: true }, example: true, specs: { sizes: false, switches: [] } },
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS },
    template: `<app-redline [marks]="marks" [scale]="1.6" [key]="false"><app-progress-button label="Review interior" [completed]="3" [total]="8" /></app-redline>`,
  }),
};
