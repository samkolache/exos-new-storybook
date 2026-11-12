import { Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ButtonComponent } from '../../components/button/button';
import { CheckboxComponent } from '../../components/checkbox/checkbox';
import { DatePickerComponent } from '../../components/date-picker/date-picker';
import { InputComponent } from '../../components/input/input';
import { NotificationComponent } from '../../components/notification/notification';
import { NumberInputComponent } from '../../components/number-input/number-input';
import { RadioGroupComponent, RadioOption } from '../../components/radio-group/radio-group';

const SHIPPING: RadioOption[] = [
  { label: 'Standard', value: 'standard', description: '3 to 5 business days · Free' },
  { label: 'Express', value: 'express', description: '1 to 2 business days · $12' },
];

/** Where each field's error links to, and what it says. */
const FIELDS: { key: string; id: string; label: string; message: string }[] = [
  { key: 'name', id: 'order-name', label: 'Full name', message: 'Enter your full name.' },
  { key: 'email', id: 'order-email', label: 'Email', message: 'Enter an email address like name@example.com.' },
  { key: 'date', id: 'order-date', label: 'Delivery date', message: 'Choose a delivery date.' },
  { key: 'shipping', id: 'order-shipping-0', label: 'Shipping', message: 'Choose how you’d like it shipped.' },
  { key: 'terms', id: 'order-terms-0', label: 'Terms', message: 'Agree to the terms to continue.' },
];

/**
 * Docs only: a complete form with the Exos rules: labels, optional marked, checks on leaving a
 * field, and an error summary on send that takes focus and links to each problem.
 */
@Component({
  selector: 'app-order-form',
  imports: [
    ReactiveFormsModule, ButtonComponent, CheckboxComponent, DatePickerComponent, InputComponent, NotificationComponent,
    NumberInputComponent, RadioGroupComponent,
  ],
  template: `
<form class="exos-form" [formGroup]="form" (ngSubmit)="send()" novalidate>
  @if (summary().length) {
    <div #summaryBox tabindex="-1" class="exos-form-summary">
      <app-notification kind="error" [title]="'Fix ' + summary().length + (summary().length === 1 ? ' problem' : ' problems') + ' to continue'">
        <ul class="exos-form-summary-list">
          @for (item of summary(); track item.id) {
            <li><a [href]="'#' + item.id" (click)="focusField($event, item.id)">{{ item.message }}</a></li>
          }
        </ul>
      </app-notification>
    </div>
  }
  @if (sent()) {
    <app-notification kind="success" title="Order placed" message="We’ll email you when it ships." />
  }

  <div class="exos-grid">
    <app-input class="exos-col-4 exos-col-md-4 exos-col-lg-8" inputId="order-name" label="Full name" autocomplete="name" autocapitalize="words"
      formControlName="name" [state]="stateOf(form.controls.name)" feedback="Enter your full name." />
    <app-input class="exos-col-4 exos-col-md-4 exos-col-lg-8" inputId="order-email" label="Email" type="email" autocomplete="email"
      formControlName="email" [state]="stateOf(form.controls.email)" feedback="Enter an email address like name@example.com."
      helpText="We’ll send the receipt here." />
    <app-input class="exos-col-4 exos-col-md-4 exos-col-lg-8" label="Phone" type="tel" autocomplete="tel" [optional]="true" formControlName="phone" />
    <app-number-input class="exos-col-4 exos-col-md-4 exos-col-lg-4" label="Quantity" [min]="1" [max]="10" formControlName="quantity" />
    <app-date-picker class="exos-col-4 exos-col-md-4 exos-col-lg-4" inputId="order-date" label="Delivery date" min="2026-11-12"
      formControlName="date" [state]="stateOf(form.controls.date)" feedback="Choose a delivery date." />
    <app-radio-group class="exos-col-4 exos-col-md-8 exos-col-lg-8" name="order-shipping" label="Shipping" [options]="shipping"
      formControlName="shipping" [state]="stateOf(form.controls.shipping)" feedback="Choose how you’d like it shipped." />
    <app-checkbox class="exos-col-4 exos-col-md-8 exos-col-lg-16" name="order-terms" label="I agree to the terms of service"
      formControlName="terms" [state]="stateOf(form.controls.terms)" feedback="Agree to the terms to continue." />
    <div class="exos-col-4 exos-col-md-8 exos-col-lg-16 exos-form-actions">
      <app-button type="submit" label="Place order" />
    </div>
  </div>
</form>`,
})
class OrderFormComponent {
  /** Start with every field touched and empty, to show the errors right away. */
  readonly showErrors = input(false);

  protected readonly shipping = SHIPPING;
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true }),
    quantity: new FormControl<number | null>(1),
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    shipping: new FormControl<string | null>(null, Validators.required),
    terms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });

  /** The problems shown in the summary: set on send, and shrinking as people fix them. */
  private readonly attempted = signal(false);
  private readonly tick = signal(0);
  protected readonly sent = signal(false);
  protected readonly summary = computed(() => {
    this.tick();
    if (!this.attempted()) return [];
    return FIELDS.filter((f) => this.form.get(f.key)!.invalid);
  });
  private readonly summaryBox = viewChild<ElementRef<HTMLElement>>('summaryBox');

  constructor() {
    this.form.valueChanges.subscribe(() => this.tick.update((n) => n + 1));
    queueMicrotask(() => {
      if (this.showErrors()) this.send();
    });
  }

  /** Errors show once people leave a field, or after they try to send. */
  protected stateOf(control: AbstractControl): 'invalid' | 'none' {
    return control.invalid && (control.touched || this.attempted()) ? 'invalid' : 'none';
  }

  protected send(): void {
    this.sent.set(false);
    this.form.markAllAsTouched();
    this.attempted.set(true);
    this.tick.update((n) => n + 1);
    if (this.form.valid) {
      this.attempted.set(false);
      this.sent.set(true);
      return;
    }
    // Move focus to the summary, so screen readers read it and people see what to fix.
    setTimeout(() => this.summaryBox()?.nativeElement.focus());
  }

  protected focusField(event: Event, id: string): void {
    event.preventDefault();
    const field = document.getElementById(id);
    field?.focus();
    field?.scrollIntoView({ block: 'center' });
  }
}

const meta: Meta = {
  title: 'Patterns/Forms',
  decorators: [moduleMetadata({ imports: [OrderFormComponent, InputComponent, ButtonComponent] })],
  parameters: {
    // Accessibility checks fail the tests for this pattern (not just a warning).
    a11y: { test: 'error' },
    controls: { disable: true },
  },
  tags: ['!dev'],
};

export default meta;
type Story = StoryObj;

export const Overview: Story = { render: () => ({ template: `<app-order-form />` }) };
export const ErrorSummary: Story = { render: () => ({ template: `<app-order-form [showErrors]="true" />` }) };

// Do / Don't

export const DoLabelsAbove: Story = {
  render: () => ({ template: `<div style="width: 16rem; margin: 0 auto"><app-input label="Email" type="email" autocomplete="email" /></div>` }),
};
export const DontLabelsInside: Story = {
  render: () => ({ template: `<div style="width: 16rem; margin: 0 auto"><app-input label="Email" [hideLabel]="true" placeholder="Email" type="email" autocomplete="email" /></div>` }),
};
export const DoSpecificButton: Story = {
  render: () => ({ template: `<div class="text-center"><app-button label="Place order" /></div>` }),
};
export const DontGenericButton: Story = {
  render: () => ({ template: `<div class="text-center"><app-button label="Submit" /></div>` }),
};
export const DoEnabledSubmit: Story = {
  render: () => ({ template: `<div style="width: 16rem; margin: 0 auto" class="d-flex flex-column gap-2"><app-input label="Email" type="email" autocomplete="email" /><app-button label="Continue" /></div>` }),
};
export const DontDisabledSubmit: Story = {
  render: () => ({ template: `<div style="width: 16rem; margin: 0 auto" class="d-flex flex-column gap-2"><app-input label="Email" type="email" autocomplete="email" /><app-button label="Continue" [disabled]="true" /></div>` }),
};

// Tests (hidden; they still run)

/** Sending an empty form: a summary takes focus, links go to the fields, fixing a field drops it. */
export const TestErrorSummary: Story = {
  name: 'Test · Error summary',
  render: () => ({ template: `<app-order-form />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Place order' }));
    const alert = await canvas.findByRole('alert');
    await expect(alert).toHaveTextContent('Fix 5 problems to continue');
    await waitFor(() => expect(canvasElement.querySelector('.exos-form-summary')).toHaveFocus());
    await userEvent.click(canvas.getByRole('link', { name: 'Enter your full name.' }));
    await expect(canvas.getByRole('textbox', { name: 'Full name' })).toHaveFocus();
    await userEvent.keyboard('Alex Morgan');
    await expect(alert).toHaveTextContent('Fix 4 problems to continue');
  },
};
