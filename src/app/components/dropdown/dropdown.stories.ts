import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DropdownComponent, DropdownItem } from './dropdown';
import { storySource } from '../shared/story-source';

const PHOTO_ACTIONS: DropdownItem[] = [
  { type: 'header', label: 'Photo' },
  { label: 'Edit photo', value: 'edit' },
  { label: 'Edit finding', value: 'finding' },
  { label: 'Move to…', value: 'move' },
  { type: 'divider' },
  { label: 'Open view', value: 'open', active: true },
  { label: 'Share', value: 'share', disabled: true },
  { type: 'divider' },
  { label: 'Delete photo', value: 'delete' },
];

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { label: 'Dropdown', items: [], variant: 'primary', ghost: false, direction: 'down', align: 'start', dark: false, disabled: false, open: false };

/** Room below the button for stories that show the menu open. */
const menuSpace = componentWrapperDecorator((story) => `<div style="min-height: 20rem">${story}</div>`);

const meta: Meta<DropdownComponent> = {
  title: 'Components/Dropdown',
  component: DropdownComponent,
  parameters: {
    // Internal members: keep the API table to real inputs and outputs.
    controls: { exclude: ['close', 'enabledItems', 'host', 'injector', 'itemButtons', 'menuClasses', 'menuId', 'onDocumentClick', 'onKeydown', 'select', 'show', 'toggle', 'toggleButton', 'toggleClasses', 'wrapperClass'] },
    docs: {
      source: {
      language: 'typescript',
      transform: storySource({
        selector: 'app-dropdown',
        component: 'DropdownComponent',
        importPath: './components/dropdown/dropdown',
        defaults: DEFAULTS,
        types: { items: 'DropdownItem[]' },
        listType: 'DropdownItem[]',
        handlers: { itemSelected: { param: 'item: DropdownItem', body: "console.log('Picked', item.value);" } },
      }),
    },
    },
  },
  argTypes: {
    itemSelected: { action: 'itemSelected', table: { category: 'outputs' } },
    openChange: { action: 'openChange', table: { category: 'outputs' } },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive'],
    },
    direction: { control: 'inline-radio', options: ['down', 'up', 'start', 'end'] },
    align: { control: 'inline-radio', options: ['start', 'end'] },
  },
  args: {
    label: 'Photo actions',
    items: PHOTO_ACTIONS,
    variant: 'primary',
    ghost: false,
    direction: 'down',
    align: 'start',
    dark: false,
    disabled: false,
    open: false,
  },
  // Room for the menu to open into.
  decorators: [componentWrapperDecorator((story) => `<div style="display: flex; justify-content: center; padding: 1rem">${story}</div>`)],
};

export default meta;
type Story = StoryObj<DropdownComponent>;

export const Default: Story = {};

export const Open: Story = {
  decorators: [menuSpace],
  args: { open: true },
};

export const Secondary: Story = {
  decorators: [menuSpace],
  args: { variant: 'secondary', open: true },
};

export const Ghost: Story = {
  args: { ghost: true },
};

export const AlignEnd: Story = {
  decorators: [menuSpace],
  args: { align: 'end', open: true },
};

export const Dropup: Story = {
  args: { direction: 'up', open: true },
  decorators: [componentWrapperDecorator((story) => `<div style="padding-top: 18rem">${story}</div>`)],
};

export const Dropend: Story = {
  decorators: [menuSpace],
  args: { direction: 'end', open: true },
};

export const Dark: Story = {
  decorators: [menuSpace],
  args: { dark: true, open: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Variants: Story = {
  tags: ['!dev'],
  args: { items: PHOTO_ACTIONS } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
      <div class="d-flex flex-wrap gap-2">
        <app-dropdown label="Primary" [items]="items" />
        <app-dropdown label="Secondary" variant="secondary" [items]="items" />
        <app-dropdown label="Destructive" variant="destructive" [items]="items" />
        <app-dropdown label="Ghost" [ghost]="true" [items]="items" />
      </div>` }),
};

/** Keyboard: ↓ opens on the first item, Escape closes and returns focus to the button. */
export const KeyboardNavigation: Story = {
  decorators: [menuSpace],
  args: { itemSelected: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Photo actions' });
    toggle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('menuitem', { name: 'Edit photo' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.itemSelected).toHaveBeenCalledWith(expect.objectContaining({ value: 'finding' }));
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  },
};
