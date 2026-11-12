import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';
import { storySource } from '../../components/shared/story-source';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { kind: 'first-use', title: '', message: '', actionLabel: '', compact: false };

const meta: Meta<EmptyStateComponent> = {
  title: 'Patterns/Empty states',
  component: EmptyStateComponent,
  decorators: [moduleMetadata({ imports: [EmptyStateComponent] })],
  parameters: {
    a11y: { test: 'error' },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-empty-state',
          component: 'EmptyStateComponent',
          importPath: './components/empty-state/empty-state',
          defaults: DEFAULTS,
        }),
      },
    },
  },
  argTypes: {
    action: { action: 'action', table: { category: 'outputs' } },
    kind: {
      control: 'inline-radio',
      options: ['first-use', 'no-results', 'error'],
      description: 'first-use: nothing yet · no-results: a search or filter found nothing · error: it couldn’t load.',
      table: { defaultValue: { summary: 'first-use' } },
    },
    title: { description: 'What’s missing or what happened.' },
    message: { description: 'Why, and what people can do.' },
    actionLabel: { description: 'One way forward. Emits `action`.' },
    compact: { description: 'Smaller, for inside cards and panels.' },
  },
  args: { kind: 'first-use', title: 'No orders yet', message: 'Orders you place show up here, with their delivery status.', actionLabel: 'Start shopping', compact: false },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj<EmptyStateComponent>;

export const FirstUse: Story = {};
export const NoResults: Story = {
  args: { kind: 'no-results', title: 'No results for “lamp”', message: 'Check the spelling, or try fewer filters.', actionLabel: 'Clear filters' },
};
export const LoadError: Story = {
  args: { kind: 'error', title: 'Couldn’t load your orders', message: 'Check your connection, then try again.', actionLabel: 'Try again' },
};
export const Compact: Story = {
  args: { kind: 'first-use', title: 'No notes yet', message: 'Notes you add appear here.', actionLabel: 'Add a note', compact: true },
  render: (args) => ({ props: args, template: `<div class="border rounded-3" style="max-width: 20rem"><app-empty-state [kind]="kind" [title]="title" [message]="message" [actionLabel]="actionLabel" [compact]="compact" /></div>` }),
};

export const DoHelpful: Story = {
  args: { kind: 'no-results', title: 'No results for “lamp”', message: 'Check the spelling, or try fewer filters.', actionLabel: 'Clear filters', compact: true },
};
export const DontBlank: Story = {
  args: { kind: 'no-results', title: 'No data', message: '', actionLabel: '', compact: true },
};

/** Errors are announced; the action emits. */
export const TestAction: Story = {
  name: 'Test · Action',
  args: { kind: 'error', title: 'Couldn’t load your orders', message: 'Check your connection.', actionLabel: 'Try again', action: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Couldn’t load your orders');
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.action).toHaveBeenCalled();
  },
};
