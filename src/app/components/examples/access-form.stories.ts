import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { ButtonComponent } from '../button/button';
import { DropdownComponent, DropdownItem } from '../dropdown/dropdown';
import { InputComponent } from '../input/input';
import { RadioGroupComponent, RadioOption } from '../radio-group/radio-group';
import { SelectComponent, SelectOption } from '../select/select';

const REASONS: RadioOption[] = [
  { label: 'Gate or door is locked', value: 'locked' },
  { label: 'No one is home', value: 'nobody' },
  { label: 'Lockbox code didn’t work', value: 'lockbox' },
  { label: 'Not safe to enter', value: 'unsafe' },
  { label: 'Can’t find the property', value: 'lost' },
  { label: 'Something else', value: 'other' },
];

const RESCHEDULE: SelectOption[] = [
  { label: 'Later today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This week', value: 'week' },
  { label: 'Let the client pick', value: 'client' },
];

const MORE: DropdownItem[] = [
  { label: 'Call the client', value: 'call' },
  { label: 'Message the client', value: 'message' },
  { type: 'divider' },
  { label: 'Cancel the order', value: 'cancel' },
];

/** pcr-demo "Can't access the property?" built from the form components with reactive forms. */
@Component({
  selector: 'app-access-form-example',
  imports: [ReactiveFormsModule, ButtonComponent, DropdownComponent, InputComponent, RadioGroupComponent, SelectComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="d-flex flex-column gap-4" style="max-width: 26rem" novalidate>
      <div class="d-flex justify-content-between align-items-start gap-3">
        <div>
          <h2 class="h4 mb-1">Can’t access the property?</h2>
          <p class="text-body-secondary mb-0">Pick the reason. We’ll let the client know and help you reschedule.</p>
        </div>
        <app-dropdown label="More" variant="secondary" align="end" [items]="more" />
      </div>

      <app-radio-group
        formControlName="reason"
        label="Reason"
        appearance="card"
        [options]="reasons"
        [required]="true"
        [state]="invalid('reason') ? 'invalid' : 'none'"
        feedback="Pick a reason before sending."
      />

      <app-input
        formControlName="detail"
        label="Detail"
        appearance="pill"
        placeholder="Add a detail (optional)"
        helpText="Up to 140 characters."
        [state]="invalid('detail') ? 'invalid' : 'none'"
        feedback="Keep it under 140 characters."
      />

      <app-select
        formControlName="reschedule"
        label="Reschedule"
        placeholder="When can you come back?"
        [options]="reschedule"
        [required]="true"
        [state]="invalid('reschedule') ? 'invalid' : 'none'"
        feedback="Choose when to come back."
      />

      <app-button type="submit" label="Send to client" />

      @if (sent()) {
        <pre class="bg-body-tertiary rounded-3 p-3 mb-0 small">{{ sent() }}</pre>
      }
    </form>
  `,
})
class AccessFormExampleComponent {
  protected readonly reasons = REASONS;
  protected readonly reschedule = RESCHEDULE;
  protected readonly more = MORE;
  protected readonly sent = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    reason: ['', Validators.required],
    detail: ['', Validators.maxLength(140)],
    reschedule: ['', Validators.required],
  });

  protected invalid(name: 'reason' | 'detail' | 'reschedule'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    this.sent.set(this.form.valid ? JSON.stringify(this.form.getRawValue(), null, 2) : '');
  }
}

const meta: Meta<AccessFormExampleComponent> = {
  title: 'Examples/Access Form',
  component: AccessFormExampleComponent,
  parameters: {
    docs: {
      description: {
        component:
          'The pcr-demo access sheet built with reactive forms. Submit while it’s empty to see the validation states.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<AccessFormExampleComponent>;

export const Default: Story = {};
