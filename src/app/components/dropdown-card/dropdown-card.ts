import { Component, computed, input, model, output } from '@angular/core';
import { ChipComponent, ChipGroupValue, ChipOption, ChipType } from '../chip/chip';
import { uniqueId } from '../shared/form-field';

export interface DropdownCardRow {
  label: string;
  value: string;
}

/** Answer chips are plain chip options (see app-chip). */
export type DropdownCardChoice = ChipOption;

/** An open question in the card ("How many Bathrooms did you spot?"). */
export interface DropdownCardQuestion {
  text: string;
  hint?: string;
  choices: DropdownCardChoice[];
  /** single (default) picks one answer; multi picks any. */
  type?: ChipType;
  /** Line next to the Confirm button, e.g. "Pick the one you saw". */
  prompt?: string;
}

/** answered: "All answered" in grey. attention: orange dot + "N needs you". */
export type DropdownCardStatus = 'none' | 'answered' | 'attention';

/**
 * Collapsible form section from the PCR Figma ("Property · collapsed / answered").
 * Collapsed it shows a status summary; expanded it lists answers, an optional open
 * question with answer chips, and an "edit by typing or speaking" line.
 */
@Component({
  selector: 'app-dropdown-card',
  imports: [ChipComponent],
  templateUrl: './dropdown-card.html',
  host: { class: 'd-block' },
})
export class DropdownCardComponent {
  readonly title = input('Property');
  readonly rows = input<DropdownCardRow[]>([]);
  readonly status = input<DropdownCardStatus>('answered');
  /** Overrides the summary line; defaults to "All answered" or "1 needs you". */
  readonly summary = input('');
  readonly question = input<DropdownCardQuestion | null>(null);
  /** Link in the open head. Empty hides it. */
  readonly actionLabel = input('Edit all');
  /** Placeholder for the edit line. Empty hides the line. */
  readonly editPlaceholder = input('Edit by typing or speaking…');
  readonly confirmLabel = input('Confirm');

  readonly expanded = model(false);
  /** The picked answer: a value for single questions, a list for multi. */
  readonly answer = model<ChipGroupValue>(null);

  readonly action = output<void>();
  readonly confirmed = output<string | string[]>();
  /** Text typed in the edit line, sent on Enter. */
  readonly edited = output<string>();
  readonly micClicked = output<void>();

  protected readonly bodyId = uniqueId('dropdown-card-body');
  protected readonly titleId = uniqueId('dropdown-card-title');

  protected readonly summaryText = computed(() => {
    if (this.summary()) return this.summary();
    if (this.status() === 'attention') return `${this.question() ? 1 : 0} needs you`;
    if (this.status() === 'answered') return 'All answered';
    return '';
  });

  protected readonly cardClasses = computed(() => {
    const cls = ['dropdown-card'];
    if (this.expanded()) cls.push('expanded');
    if (this.actionLabel()) cls.push('has-action');
    return cls.join(' ');
  });

  protected readonly hasAnswer = computed(() => {
    const answer = this.answer();
    return Array.isArray(answer) ? answer.length > 0 : answer !== null;
  });

  protected toggle(): void {
    this.expanded.update((open) => !open);
  }

  protected confirm(): void {
    const answer = this.answer();
    if (answer !== null && this.hasAnswer()) this.confirmed.emit(answer);
  }

  protected submitEdit(input: HTMLInputElement): void {
    const text = input.value.trim();
    if (!text) return;
    this.edited.emit(text);
    input.value = '';
  }
}
