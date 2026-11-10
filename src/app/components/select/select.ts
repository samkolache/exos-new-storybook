import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldSize, ValidationState, uniqueId } from '../shared/form-field';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export type SelectAppearance = 'outline' | 'filled' | 'pill';

/** Native Bootstrap .form-select: the dropdown to use inside forms. */
@Component({
  selector: 'app-select',
  imports: [NgTemplateOutlet],
  templateUrl: './select.html',
  host: { class: 'd-block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }],
})
export class SelectComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly options = input<SelectOption[]>([]);
  /** Shown while nothing is picked; it can't be picked itself. Empty string hides it. */
  readonly placeholder = input('Choose…');
  readonly size = input<FieldSize>('md');
  readonly appearance = input<SelectAppearance>('outline');
  readonly floatingLabel = input(false);
  readonly helpText = input('');
  readonly state = input<ValidationState>('none');
  readonly feedback = input('');
  readonly disabled = input(false);
  readonly required = input(false);
  readonly selectId = input(uniqueId('select'));

  readonly value = model('');
  readonly blurred = output<FocusEvent>();

  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly showFeedback = computed(() => this.state() !== 'none' && !!this.feedback());
  protected readonly helpId = computed(() => `${this.selectId()}-help`);
  protected readonly feedbackId = computed(() => `${this.selectId()}-feedback`);
  protected readonly describedBy = computed(
    () =>
      [this.showFeedback() && this.feedbackId(), this.helpText() && this.helpId()].filter(Boolean).join(' ') ||
      null,
  );

  protected readonly selectClasses = computed(() => {
    const cls = ['form-select'];
    if (this.size() !== 'md' && !this.floatingLabel()) cls.push(`form-select-${this.size()}`);
    if (this.appearance() !== 'outline') cls.push(`form-field-${this.appearance()}`);
    if (this.state() !== 'none') cls.push(`is-${this.state()}`);
    if (!this.value() && this.placeholder()) cls.push('form-select-placeholder');
    return cls.join(' ');
  });

  protected onSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
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
