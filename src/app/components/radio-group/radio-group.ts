import { Component, computed, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AiLabelComponent, AiRevertComponent } from '../shared/ai-label';
import { FieldState, uniqueId } from '../shared/form-field';

export interface RadioOption {
  label: string;
  value: string;
  /** A second line under the label. */
  description?: string;
  disabled?: boolean;
  /** The AI's answer: a sparkle after the label, and the group gets an AI label. */
  suggested?: boolean;
}

/** default: a list of radios. card: each option is a selectable card. */
export type RadioAppearance = 'default' | 'card';

/**
 * Radio group: pick one of 2 to 5 options.
 *
 *   <app-radio-group label="Delivery" [options]="options" [(value)]="delivery" />
 *   <app-radio-group label="Plan" appearance="card" [options]="plans" formControlName="plan" />
 *
 * Mark the AI's answer with `suggested: true` on its option. Once people pick something else,
 * the AI label turns into a "Revert to AI suggestion" button.
 */
@Component({
  selector: 'app-radio-group',
  imports: [AiLabelComponent, AiRevertComponent],
  templateUrl: './radio-group.html',
  host: { class: 'd-block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioGroupComponent), multi: true }],
})
export class RadioGroupComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly options = input<RadioOption[]>([]);
  readonly name = input(uniqueId('radio'));
  readonly appearance = input<RadioAppearance>('default');
  /** Side by side from tablet up. Phones always stack them. */
  readonly inline = input(false);
  /** Puts the radio after its label. Default appearance only. */
  readonly reverse = input(false);
  readonly helpText = input('');
  readonly state = input<FieldState>('none');
  /** Message under the group for valid, warning and invalid. */
  readonly feedback = input('');
  readonly disabled = input(false);
  /** People can see the answer and Tab to it, but not change it. */
  readonly readonly = input(false);
  readonly required = input(false);
  /** Adds "(optional)" after the label. */
  readonly optional = input(false);
  /** What the AI did, shown when people open the AI label. */
  readonly aiExplanation = input('');

  readonly value = model<string | null>(null);

  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly suggestion = computed(() => this.options().find((o) => o.suggested)?.value ?? null);
  /** AI label while the AI's answer stands; revert button once people change it. */
  protected readonly aiMode = computed(() => {
    const s = this.suggestion();
    if (s === null) return null;
    return this.value() === null || this.value() === s || this.readonly() || this.isDisabled() ? 'label' : 'revert';
  });
  protected readonly showFeedback = computed(() => this.state() !== 'none' && !!this.feedback());
  protected readonly feedbackClass = computed(() => `d-block ${this.state()}-feedback`);
  protected readonly legendId = computed(() => `${this.name()}-legend`);
  protected readonly helpId = computed(() => `${this.name()}-help`);
  protected readonly feedbackId = computed(() => `${this.name()}-feedback`);
  protected readonly describedBy = computed(
    () =>
      [this.showFeedback() && this.feedbackId(), this.helpText() && this.helpId()].filter(Boolean).join(' ') ||
      null,
  );
  protected readonly stateClass = computed(() => (this.state() === 'none' ? '' : `is-${this.state()}`));

  protected optionId(index: number): string {
    return `${this.name()}-${index}`;
  }

  /** Native radios have no read only: cancelling the click keeps the answer as it was. */
  protected onClick(event: Event): void {
    if (this.readonly()) event.preventDefault();
  }

  protected select(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  /** Read only: arrow keys would change the answer, so they do nothing. */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.readonly() && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
  }

  protected revertToSuggestion(): void {
    const s = this.suggestion();
    if (s !== null) {
      this.value.set(s);
      this.onChange(s);
    }
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
