import { Component, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldSize, FieldState, uniqueId } from '../shared/form-field';

/**
 * Number input: a number people type or step with − and +, like a quantity.
 *
 *   <app-number-input label="Quantity" [min]="1" [max]="10" [(value)]="qty" />
 *
 * A text field with a number keyboard (not type="number", which drops leading zeros and
 * changes value on scroll). Out of range: it says so, and snaps back when people leave.
 */
@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.html',
  host: { class: 'd-block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NumberInputComponent), multi: true }],
})
export class NumberInputComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly step = input(1);
  /** Decimal places allowed, like 2 for money. 0 (default) means whole numbers. */
  readonly decimals = input(0);
  /** Text after the number, like "kg" or "%". */
  readonly unit = input('');
  readonly size = input<FieldSize>('md');
  readonly helpText = input('');
  readonly state = input<FieldState>('none');
  /** Your message. Left empty, an out-of-range number gets "Enter a number from 1 to 10". */
  readonly feedback = input('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  /** Hides − and +, for numbers nobody steps through, like a year. */
  readonly hideSteppers = input(false);
  readonly inputId = input(uniqueId('number'));

  readonly value = model<number | null>(null);
  readonly blurred = output<FocusEvent>();

  /** What's in the field while people type, which may not be a number yet. */
  protected readonly text = signal<string | null>(null);
  private readonly formDisabled = signal(false);
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly shown = computed(() => this.text() ?? this.format(this.value()));
  protected readonly outOfRange = computed(() => {
    const v = this.value();
    if (v === null) return false;
    return (this.min() !== null && v < this.min()!) || (this.max() !== null && v > this.max()!);
  });
  protected readonly effectiveState = computed<FieldState>(() => (this.state() !== 'none' ? this.state() : this.outOfRange() ? 'invalid' : 'none'));
  protected readonly message = computed(() => {
    if (this.feedback()) return this.feedback();
    if (!this.outOfRange()) return '';
    const [lo, hi] = [this.min(), this.max()];
    if (lo !== null && hi !== null) return `Enter a number from ${lo} to ${hi}.`;
    return lo !== null ? `Enter ${lo} or more.` : `Enter ${hi} or less.`;
  });
  protected readonly showFeedback = computed(() => this.effectiveState() !== 'none' && !!this.message());
  protected readonly canDecrease = computed(() => !this.isDisabled() && !this.readonly() && (this.min() === null || (this.value() ?? 0) > this.min()!));
  protected readonly canIncrease = computed(() => !this.isDisabled() && !this.readonly() && (this.max() === null || (this.value() ?? 0) < this.max()!));
  protected readonly helpId = computed(() => `${this.inputId()}-help`);
  protected readonly feedbackId = computed(() => `${this.inputId()}-feedback`);
  protected readonly describedBy = computed(
    () => [this.showFeedback() && this.feedbackId(), this.helpText() && this.helpId()].filter(Boolean).join(' ') || null,
  );
  protected readonly controlClasses = computed(() => {
    const cls = ['form-control', 'exos-number-field'];
    if (this.size() !== 'md') cls.push(`form-control-${this.size()}`);
    const state = this.effectiveState();
    if (state !== 'none') cls.push(`is-${state}`);
    return cls.join(' ');
  });

  protected format(value: number | null): string {
    return value === null ? '' : value.toFixed(this.decimals());
  }

  private parse(text: string): number | null {
    const cleaned = text.replace(/[^\d.,-]/g, '').replace(',', '.');
    if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  private clamp(n: number): number {
    let v = n;
    if (this.min() !== null) v = Math.max(this.min()!, v);
    if (this.max() !== null) v = Math.min(this.max()!, v);
    return Number(v.toFixed(this.decimals()));
  }

  private commit(value: number | null): void {
    this.value.set(value);
    this.onChange(value);
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.text.set(text);
    this.commit(this.parse(text));
  }

  protected onBlur(event: FocusEvent): void {
    // Snap back into range and tidy the text once people leave the field.
    const v = this.value();
    if (v !== null) this.commit(this.clamp(v));
    this.text.set(null);
    this.onTouched();
    this.blurred.emit(event);
  }

  protected stepBy(direction: 1 | -1, times = 1): void {
    if (this.isDisabled() || this.readonly()) return;
    const start = this.value() ?? this.min() ?? 0;
    const next = this.value() === null ? start : start + direction * this.step() * times;
    this.text.set(null);
    this.commit(this.clamp(next));
  }

  /** ↑ ↓ step, Page Up / Down step by 10, Home / End go to min / max. */
  protected onKeydown(event: KeyboardEvent): void {
    const actions: Record<string, () => void> = {
      ArrowUp: () => this.stepBy(1),
      ArrowDown: () => this.stepBy(-1),
      PageUp: () => this.stepBy(1, 10),
      PageDown: () => this.stepBy(-1, 10),
      Home: () => this.min() !== null && this.commit(this.min()),
      End: () => this.max() !== null && this.commit(this.max()),
    };
    const action = actions[event.key];
    if (!action || this.readonly()) return;
    event.preventDefault();
    this.text.set(null);
    action();
  }

  writeValue(value: number | null): void {
    this.value.set(value ?? null);
    this.text.set(null);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
