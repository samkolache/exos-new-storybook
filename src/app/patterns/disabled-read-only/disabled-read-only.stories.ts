import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ButtonComponent } from '../../components/button/button';
import { CheckboxComponent } from '../../components/checkbox/checkbox';
import { InputComponent } from '../../components/input/input';
import { RadioGroupComponent, RadioOption } from '../../components/radio-group/radio-group';
import { SelectComponent, SelectOption } from '../../components/select/select';

const PLANS: RadioOption[] = [
  { label: 'Starter', value: 'starter' },
  { label: 'Team', value: 'team' },
];
const REGIONS: SelectOption[] = [
  { label: 'United States', value: 'us' },
  { label: 'Canada', value: 'ca' },
];

const meta: Meta = {
  title: 'Patterns/Disabled and read only',
  decorators: [moduleMetadata({ imports: [ButtonComponent, CheckboxComponent, InputComponent, RadioGroupComponent, SelectComponent] })],
  parameters: { a11y: { test: 'error' }, controls: { disable: true } },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj;

/** The same fields three ways, side by side. */
export const Compare: Story = {
  render: () => ({
    props: { plans: PLANS, regions: REGIONS },
    template: `
<div class="d-grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr))">
  <div class="d-flex flex-column gap-3">
    <p class="fw-semibold mb-0">Editable</p>
    <app-input label="Company" value="Northwind" />
    <app-select label="Region" [options]="regions" value="us" />
    <app-radio-group label="Plan" [options]="plans" value="team" />
  </div>
  <div class="d-flex flex-column gap-3">
    <p class="fw-semibold mb-0">Read only</p>
    <app-input label="Company" value="Northwind" [readonly]="true" />
    <app-select label="Region" [options]="regions" value="us" [readonly]="true" />
    <app-radio-group label="Plan" [options]="plans" value="team" [readonly]="true" />
  </div>
  <div class="d-flex flex-column gap-3">
    <p class="fw-semibold mb-0">Disabled</p>
    <app-input label="Company" value="Northwind" [disabled]="true" />
    <app-select label="Region" [options]="regions" value="us" [disabled]="true" />
    <app-radio-group label="Plan" [options]="plans" value="team" [disabled]="true" />
  </div>
</div>`,
  }),
};

/** A disabled control with the reason next to it. */
export const DisabledWithReason: Story = {
  render: () => ({ template: `
<div style="max-width: 22rem" class="d-flex flex-column gap-2">
  <app-checkbox label="Send invoices by text message" [disabled]="true" helpText="Add a phone number in your profile to turn this on." />
</div>` }),
};

export const DoReadOnlyToShow: Story = {
  render: () => ({ template: `<div style="width: 16rem; margin: 0 auto"><app-input label="Account number" value="48213-07" [readonly]="true" helpText="Set when your account was made." /></div>` }),
};
export const DontDisabledToShow: Story = {
  render: () => ({ template: `<div style="width: 16rem; margin: 0 auto"><app-input label="Account number" value="48213-07" [disabled]="true" /></div>` }),
};
export const DoSayWhy: Story = {
  render: () => ({ template: `<div style="width: 18rem; margin: 0 auto"><app-checkbox label="Send invoices by text message" [disabled]="true" helpText="Add a phone number in your profile to turn this on." /></div>` }),
};
export const DontNoReason: Story = {
  render: () => ({ template: `<div style="width: 18rem; margin: 0 auto"><app-checkbox label="Send invoices by text message" [disabled]="true" /></div>` }),
};

/** Read only stays in the Tab order and can be selected; disabled is skipped. */
export const TestTabOrder: Story = {
  name: 'Test · Tab order',
  render: () => ({ template: `<app-input label="Read only" value="A" [readonly]="true" /><app-input label="Disabled" value="B" [disabled]="true" /><app-input label="Next" />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('textbox', { name: 'Read only' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('textbox', { name: 'Next' })).toHaveFocus();
  },
};
