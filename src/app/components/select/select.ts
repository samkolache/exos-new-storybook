import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldSize, FieldState, uniqueId } from '../shared/form-field';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  /** Options with the same group are listed under that heading, in the order they first appear. */
  group?: string;
}

interface OptionGroup {
  label: string | null;
  options: SelectOption[];
}

export type SelectAppearance = 'outline' | 'filled' | 'pill';

/**
 * Select: pick one option from a list of 6 or more.
 *
 *   <app-select label="Country" [options]="countries" [(value)]="country" />
 *
 * It's the browser's own select, so phones open their own picker and every keyboard and
 * screen reader already knows it. Add `group` to options to list them under headings.
 */
@Component({
  selector: 'app-select',
  imports: [NgTemplateOutlet],
  templateUrl: './select.html',
  host: { class: 'd-block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }],
})
export class SelectComponent implements ControlValueAccessor {
  readonly label = input('');
  /** Keeps the label for screen readers but hides it on screen, e.g. a sort control in a toolbar. */
  readonly hideLabel = input(false);
  readonly options = input<SelectOption[]>([]);
  /** Shown while nothing is picked; it can't be picked itself. Empty string hides it. */
  readonly placeholder = input('Choose…');
  readonly size = input<FieldSize>('md');
  readonly appearance = input<SelectAppearance>('outline');
  readonly floatingLabel = input(false);
  readonly helpText = input('');
  readonly state = input<FieldState>('none');
  /** Message under the field for valid, warning and invalid. */
  readonly feedback = input('');
  readonly disabled = input(false);
  readonly required = input(false);
  /** Adds "(optional)" after the label. */
  readonly optional = input(false);
  /** People can see the answer and Tab to it, but not change it. */
  readonly readonly = input(false);
  readonly selectId = input(uniqueId('select'));

  readonly value = model('');
  readonly blurred = output<FocusEvent>();

  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly showFeedback = computed(() => this.state() !== 'none' && !!this.feedback());
  protected readonly feedbackClass = computed(() => `d-block ${this.state()}-feedback`);

  /** Options in their groups; ungrouped options stay where they are. */
  protected readonly groups = computed(() => {
    const groups: OptionGroup[] = [];
    for (const option of this.options()) {
      const label = option.group ?? null;
      const last = groups.at(-1);
      const existing = label === null ? (last?.label === null ? last : undefined) : groups.find((g) => g.label === label);
      if (existing) existing.options.push(option);
      else groups.push({ label, options: [option] });
    }
    return groups;
  });
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
    if (this.readonly()) cls.push('form-select-readonly');
    return cls.join(' ');
  });

  protected onSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  /** A native select has no read only: stop it opening or changing, but keep it focusable. */
  protected onReadonlyPointer(event: Event): void {
    if (this.readonly()) event.preventDefault();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.readonly() && event.key !== 'Tab') event.preventDefault();
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
