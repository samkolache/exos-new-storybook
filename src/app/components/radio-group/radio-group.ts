import { Component, computed, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValidationState, uniqueId } from '../shared/form-field';

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

/** default: Bootstrap .form-check list. card: pcr-demo selectable rows. */
export type RadioAppearance = 'default' | 'card';

@Component({
  selector: 'app-radio-group',
  templateUrl: './radio-group.html',
  host: { class: 'd-block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioGroupComponent), multi: true }],
})
export class RadioGroupComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly options = input<RadioOption[]>([]);
  readonly name = input(uniqueId('radio'));
  readonly appearance = input<RadioAppearance>('default');
  readonly inline = input(false);
  /** Puts the radio after its label (Bootstrap .form-check-reverse). Default appearance only. */
  readonly reverse = input(false);
  readonly helpText = input('');
  readonly state = input<ValidationState>('none');
  readonly feedback = input('');
  readonly disabled = input(false);
  readonly required = input(false);

  readonly value = model<string | null>(null);

  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly showFeedback = computed(() => this.state() !== 'none' && !!this.feedback());
  protected readonly legendId = computed(() => `${this.name()}-legend`);
  protected readonly helpId = computed(() => `${this.name()}-help`);
  protected readonly feedbackId = computed(() => `${this.name()}-feedback`);
  protected readonly describedBy = computed(
    () =>
      [this.showFeedback() && this.feedbackId(), this.helpText() && this.helpId()].filter(Boolean).join(' ') ||
      null,
  );
  protected readonly stateClass = computed(() => (this.state() === 'none' ? null : `is-${this.state()}`));

  protected optionId(index: number): string {
    return `${this.name()}-${index}`;
  }

  protected select(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  writeValue(value: string | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
