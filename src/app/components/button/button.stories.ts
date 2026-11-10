import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';
import { ButtonComponent } from './button';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'destructive'] },
    type: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
  },
  args: {
    label: 'Confirm',
    variant: 'primary',
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
