import { Component, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldSize, FieldState, uniqueId } from '../shared/form-field';

/**
 * Date picker: pick a date, or type it.
 *
 *   <app-date-picker label="Delivery date" min="2026-11-12" [(value)]="date" />
 *
 * The browser's own date field: a calendar on the web, the phone's own picker on phones, and
 * the date shown in each person's own format. `value` is always ISO: '2026-11-20'.
 */
@Component({
  selector: 'app-date-picker',
  template: `
@if (label()) {
  <label [class]="hideLabel() ? 'visually-hidden' : 'form-label'" [for]="inputId()">
    {{ label() }}
    @if (required()) {
      <span class="text-danger" aria-hidden="true">*</span>
    } @else if (optional()) {
      <span class="form-label-optional">(optional)</span>
    }
  </label>
}
<input
  [id]="inputId()"
  type="date"
  [class]="controlClasses()"
  [value]="value()"
  [attr.min]="min()"
  [attr.max]="max()"
  [disabled]="isDisabled()"
  [readOnly]="readonly()"
  [required]="required()"
  [attr.aria-invalid]="state() === 'invalid' || null"
  [attr.aria-describedby]="describedBy()"
  (input)="onInput($event)"
  (change)="onInput($event)"
  (blur)="onBlur($event)"
/>
@if (showFeedback()) {
  <div [id]="feedbackId()" [class]="'d-block ' + state() + '-feedback'">{{ feedback() }}</div>
}
@if (helpText()) {
  <div [id]="helpId()" class="form-text">{{ helpText() }}</div>
}`,
  host: { class: 'd-block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatePickerComponent), multi: true }],
})
export class DatePickerComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly hideLabel = input(false);
  /** Earliest date people can pick, ISO: '2026-11-12'. */
  readonly min = input<string | null>(null);
  /** Latest date people can pick, ISO. */
  readonly max = input<string | null>(null);
  readonly size = input<FieldSize>('md');
  readonly helpText = input('');
  readonly state = input<FieldState>('none');
  readonly feedback = input('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly optional = input(false);
  readonly inputId = input(uniqueId('date'));

  /** ISO date, '' when empty. */
  readonly value = model('');
  readonly blurred = output<FocusEvent>();

  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly showFeedback = computed(() => this.state() !== 'none' && !!this.feedback());
  protected readonly helpId = computed(() => `${this.inputId()}-help`);
  protected readonly feedbackId = computed(() => `${this.inputId()}-feedback`);
  protected readonly describedBy = computed(
    () => [this.showFeedback() && this.feedbackId(), this.helpText() && this.helpId()].filter(Boolean).join(' ') || null,
  );
  protected readonly controlClasses = computed(() => {
    const cls = ['form-control', 'exos-date'];
    if (this.size() !== 'md') cls.push(`form-control-${this.size()}`);
    if (this.state() !== 'none') cls.push(`is-${this.state()}`);
    if (!this.value()) cls.push('is-empty');
    return cls.join(' ');
  });

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value === this.value()) return;
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
