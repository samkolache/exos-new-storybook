import { Component, computed, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AiLabelComponent, AiRevertComponent } from '../shared/ai-label';
import { FieldState, uniqueId } from '../shared/form-field';

export interface CheckboxOption {
  label: string;
  value: string;
  /** A second line under the label. */
  description?: string;
  disabled?: boolean;
  /** Picked by the AI: a sparkle after the label, and the group gets an AI label. */
  suggested?: boolean;
}

/**
 * Checkbox: one on its own, or a group where people pick any number.
 *
 *   <app-checkbox label="I agree to the terms" [(checked)]="agreed" />
 *   <app-checkbox label="Dark mode" appearance="switch" [(checked)]="dark" />
 *   <app-checkbox label="Notifications" [options]="channels" [(value)]="picked" selectAll="All channels" />
 *
 * With `options` it's a group and `value` is a string array, in the order of `options`.
 * Without, it's a single checkbox and `checked` is a boolean.
 */
@Component({
  selector: 'app-checkbox',
  imports: [AiLabelComponent, AiRevertComponent],
  templateUrl: './checkbox.html',
  host: { class: 'd-block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true }],
})
export class CheckboxComponent implements ControlValueAccessor {
  /** The question for a group, or the checkbox's own label when single. */
  readonly label = input('');
  readonly options = input<CheckboxOption[]>([]);
  /** Adds a parent checkbox with this label that picks or clears every option. */
  readonly selectAll = input('');
  /** Side by side from tablet up. Phones always stack them. */
  readonly inline = input(false);
  readonly helpText = input('');
  readonly state = input<FieldState>('none');
  /** Message under the checkbox or group for valid, warning and invalid. */
  readonly feedback = input('');
  readonly disabled = input(false);
  /** People can see the answer and Tab to it, but not change it. */
  readonly readonly = input(false);
  /** Single: must be checked, like accepting terms. Group: at least one is needed. */
  readonly required = input(false);
  /** Adds "(optional)" after the group label. */
  readonly optional = input(false);
  /**
   * Single only. switch: for a setting that takes effect right away, like dark mode.
   * On phones it sits at the end of the row, like a phone's settings list.
   */
  readonly appearance = input<'checkbox' | 'switch'>('checkbox');
  /** Single only: the "some but not all" dash, for a parent you manage yourself. */
  readonly indeterminate = input(false);
  /** What the AI did, shown when people open the AI label. */
  readonly aiExplanation = input('');
  readonly name = input(uniqueId('checkbox'));

  /** Group: the picked values. */
  readonly value = model<string[]>([]);
  /** Single: on or off. */
  readonly checked = model(false);

  private readonly formDisabled = signal(false);
  private onChange: (value: string[] | boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly isGroup = computed(() => this.options().length > 0);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Options people can still change: disabled ones keep their state under Select all. */
  private readonly enabled = computed(() => this.options().filter((o) => !o.disabled));
  protected readonly allState = computed(() => {
    const picked = this.enabled().filter((o) => this.value().includes(o.value)).length;
    if (picked === 0) return 'none';
    return picked === this.enabled().length ? 'all' : 'some';
  });

  protected readonly suggestions = computed(() => this.options().filter((o) => o.suggested).map((o) => o.value));
  /** AI label while the AI's picks stand; revert button once people change them. */
  protected readonly aiMode = computed(() => {
    const s = this.suggestions();
    if (!s.length) return null;
    const same = s.length === this.value().length && s.every((v) => this.value().includes(v));
    return same || this.readonly() || this.isDisabled() ? 'label' : 'revert';
  });

  protected readonly showFeedback = computed(() => this.state() !== 'none' && !!this.feedback());
  protected readonly feedbackClass = computed(() => `d-block ${this.state()}-feedback`);
  protected readonly stateClass = computed(() => (this.state() === 'none' ? '' : `is-${this.state()}`));
  protected readonly legendId = computed(() => `${this.name()}-legend`);
  protected readonly helpId = computed(() => `${this.name()}-help`);
  protected readonly feedbackId = computed(() => `${this.name()}-feedback`);
  protected readonly describedBy = computed(
    () =>
      [this.showFeedback() && this.feedbackId(), this.helpText() && this.helpId()].filter(Boolean).join(' ') ||
      null,
  );

  protected optionId(index: number | 'all'): string {
    return `${this.name()}-${index}`;
  }

  /** Native checkboxes have no read only: cancelling the click keeps them as they were. */
  protected onClick(event: Event): void {
    if (this.readonly()) event.preventDefault();
  }

  protected toggleSingle(event: Event): void {
    const on = (event.target as HTMLInputElement).checked;
    this.checked.set(on);
    this.onChange(on);
  }

  protected toggle(option: CheckboxOption, event: Event): void {
    const on = (event.target as HTMLInputElement).checked;
    const next = new Set(this.value());
    if (on) next.add(option.value);
    else next.delete(option.value);
    this.emit(next);
  }

  /** Select all: picks every enabled option, or clears them if all are already picked. */
  protected toggleAll(): void {
    const next = new Set(this.value());
    const pickAll = this.allState() !== 'all';
    for (const o of this.enabled()) {
      if (pickAll) next.add(o.value);
      else next.delete(o.value);
    }
    this.emit(next);
  }

  protected revertToSuggestion(): void {
    this.emit(new Set(this.suggestions()));
  }

  /** The value follows the order of `options`, not the order people clicked. */
  private emit(picked: Set<string>): void {
    const ordered = this.options().map((o) => o.value).filter((v) => picked.has(v));
    this.value.set(ordered);
    this.onChange(ordered);
  }

  writeValue(value: string[] | boolean | null): void {
    if (typeof value === 'boolean') this.checked.set(value);
    else this.value.set(value ?? []);
  }

  registerOnChange(fn: (value: string[] | boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
