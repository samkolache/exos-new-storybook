import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, forwardRef, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** single: pick one (radio). multi: pick any (checkbox). Figma prop "type". */
export type ChipType = 'single' | 'multi';
export type ChipIcon = 'none' | 'records';
/** The Figma "state" a chip resolves to; derived from selected / suggested / disabled. */
export type ChipState = 'default' | 'ai-suggested' | 'selected' | 'disabled';

export interface ChipOption {
  label: string;
  value: string;
  /** AI-suggested answer (sparkle). */
  suggested?: boolean;
  disabled?: boolean;
  icon?: ChipIcon;
}

/** Group value: a string for single, a string[] for multi. */
export type ChipGroupValue = string | string[] | null;

/** What the chip template needs to draw one chip. */
interface ChipView {
  label: string;
  selected: boolean;
  suggested: boolean;
  disabled: boolean;
  icon: ChipIcon;
  option: ChipOption | null;
}

/**
 * Option chip from the PCR Figma ("Review / Option chip").
 *
 * One chip:   <app-chip label="Fair" [(selected)]="picked" />
 * A group:    <app-chip type="multi" [options]="options" [(value)]="picked" />
 *
 * The Figma `state` prop is split into flags so chips can be clicked and bound:
 * selected + suggested = "AI suggested", selected = "Selected", disabled = "Disabled".
 * With `options`, the chip renders a row and owns the selection: one value for single,
 * a list (in option order) for multi. Works with ngModel and reactive forms in both modes.
 */
@Component({
  selector: 'app-chip',
  imports: [NgTemplateOutlet],
  templateUrl: './chip.html',
  host: {
    '[class.d-inline-flex]': '!isGroup()',
    '[class.d-block]': 'isGroup()',
  },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChipComponent), multi: true }],
})
export class ChipComponent implements ControlValueAccessor {
  readonly type = input<ChipType>('single');
  readonly disabled = input(false);

  // One chip
  readonly label = input('Fair');
  /** Two-way: [(selected)]. */
  readonly selected = model(false);
  /** AI-suggested answer: adds the sparkle after the label. */
  readonly suggested = input(false);
  /** Optional leading icon, e.g. property records. */
  readonly icon = input<ChipIcon>('none');

  // A group (set options)
  readonly options = input<ChipOption[]>([]);
  /** Two-way: [(value)]. */
  readonly value = model<ChipGroupValue>(null);
  /** Accessible name for the group, or point at a visible label with labelledBy. */
  readonly groupLabel = input('');
  readonly labelledBy = input<string | null>(null);

  private readonly formDisabled = signal(false);
  private onChange: (value: ChipGroupValue | boolean) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly isGroup = computed(() => this.options().length > 0);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  private readonly picked = computed(() => {
    const value = this.value();
    return new Set(value === null ? [] : Array.isArray(value) ? value : [value]);
  });

  protected readonly chips = computed<ChipView[]>(() => {
    if (!this.isGroup()) {
      return [
        {
          label: this.label(),
          selected: this.selected(),
          suggested: this.suggested(),
          disabled: this.isDisabled(),
          icon: this.icon(),
          option: null,
        },
      ];
    }
    return this.options().map((option) => ({
      label: option.label,
      selected: this.picked().has(option.value),
      suggested: !!option.suggested,
      disabled: !!option.disabled || this.isDisabled(),
      icon: option.icon ?? 'none',
      option,
    }));
  });

  protected stateOf(chip: ChipView): ChipState {
    if (chip.disabled) return 'disabled';
    if (chip.selected) return chip.suggested ? 'ai-suggested' : 'selected';
    return 'default';
  }

  protected classesOf(chip: ChipView): string {
    const cls = ['chip', `chip-${this.type()}`];
    if (chip.selected && !chip.disabled) cls.push('selected');
    return cls.join(' ');
  }

  protected click(chip: ChipView): void {
    if (chip.disabled) return;
    // Single chips act like radios: clicking a picked one keeps it picked.
    if (this.type() === 'single' && chip.selected) return;

    if (!chip.option) {
      this.selected.set(!chip.selected);
      this.onChange(this.selected());
    } else {
      const next = this.nextValue(chip.option.value, !chip.selected);
      this.value.set(next);
      this.onChange(next);
    }
    this.onTouched();
  }

  private nextValue(value: string, select: boolean): ChipGroupValue {
    if (this.type() === 'single') return value;
    const set = new Set(this.picked());
    if (select) set.add(value);
    else set.delete(value);
    // Keep the options' order, not the click order.
    return this.options()
      .map((o) => o.value)
      .filter((v) => set.has(v));
  }

  writeValue(value: ChipGroupValue | boolean): void {
    if (this.isGroup()) this.value.set(typeof value === 'boolean' ? null : value);
    else this.selected.set(!!value);
  }

  registerOnChange(fn: (value: ChipGroupValue | boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
