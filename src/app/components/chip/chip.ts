import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** single: pick one (radio). multi: pick any (checkbox). Figma prop "type". Selectable chips only. */
export type ChipType = 'single' | 'multi';
/**
 * What a chip does:
 * - selectable: people pick it (single = check, multi = checkbox). The default.
 * - removable: shows a cross that removes it, like an applied filter or an added item.
 * - readonly: shows values as plain chips; nothing to click and no picked state.
 */
export type ChipVariant = 'selectable' | 'removable' | 'readonly';
/** 12px icons shown before (`icon`) or after (`iconEnd`) the label. */
export type ChipIcon = 'none' | 'records' | 'calendar' | 'note' | 'camera' | 'lock' | 'flag' | 'conflict' | 'skip' | 'dot';
/** sm 24px · md 32px (the Figma chip) · lg 40px. */
export type ChipSize = 'sm' | 'md' | 'lg';
/** The Figma "state" a chip resolves to; derived from selected / suggested / disabled. */
export type ChipState = 'default' | 'ai-suggested' | 'selected' | 'disabled';

export interface ChipOption {
  label: string;
  value: string;
  /** AI-suggested answer (sparkle). */
  suggested?: boolean;
  disabled?: boolean;
  /** Icon before the label. */
  icon?: ChipIcon;
  /** Icon after the label. */
  iconEnd?: ChipIcon;
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
  iconEnd: ChipIcon;
  option: ChipOption | null;
}

/**
 * Chip from the PCR Figma ("Review / Option chip").
 *
 * Pick one:    <app-chip label="Urgent" [(selected)]="picked" />
 * A group:     <app-chip type="multi" [options]="options" [(value)]="picked" />
 * Removable:   <app-chip variant="removable" [options]="filters" (removed)="drop($event)" />
 * Read-only:   <app-chip variant="readonly" [options]="skills" />
 * Icons:       <app-chip label="Documents" icon="records" iconEnd="lock" />
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
    // Never wider than its column, so long labels can truncate.
    style: 'max-width: 100%',
    '[class.d-inline-flex]': '!isGroup()',
    '[class.d-block]': 'isGroup()',
  },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChipComponent), multi: true }],
})
export class ChipComponent implements ControlValueAccessor {
  readonly variant = input<ChipVariant>('selectable');
  readonly type = input<ChipType>('single');
  /** sm 24px · md 32px (default, the Figma chip) · lg 40px. Applies to every chip in a group. */
  readonly size = input<ChipSize>('md');
  readonly disabled = input(false);

  // One chip
  readonly label = input('Chip');
  /** Two-way: [(selected)]. */
  readonly selected = model(false);
  /** AI-suggested answer: adds the sparkle after the label. */
  readonly suggested = input(false);
  /** Icon before the label, e.g. what kind the option is. */
  readonly icon = input<ChipIcon>('none');
  /** Icon after the label, e.g. a lock on an answer that can't change. */
  readonly iconEnd = input<ChipIcon>('none');

  // A group (set options)
  readonly options = input<ChipOption[]>([]);
  /** Two-way: [(value)]. */
  readonly value = model<ChipGroupValue>(null);
  /** Accessible name for the group, or point at a visible label with labelledBy. */
  readonly groupLabel = input('');
  readonly labelledBy = input<string | null>(null);

  /** Removable chips: the cross was pressed. Emits the option's value (or a lone chip's label). */
  readonly removed = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly formDisabled = signal(false);
  private onChange: (value: ChipGroupValue | boolean) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly isGroup = computed(() => this.options().length > 0);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly isSelectable = computed(() => this.variant() === 'selectable');

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
          iconEnd: this.iconEnd(),
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
      iconEnd: option.iconEnd ?? 'none',
      option,
    }));
  });

  /** Selectable groups are radios or checkboxes; removable and read-only groups are lists. */
  protected readonly groupRole = computed(() =>
    !this.isSelectable() ? 'list' : this.type() === 'single' ? 'radiogroup' : 'group',
  );

  /** Single groups have one Tab stop: the picked chip, or the first one that can be picked. */
  private readonly tabStop = computed(() => {
    const chips = this.chips();
    const picked = chips.findIndex((c) => c.selected && !c.disabled);
    return picked >= 0 ? picked : chips.findIndex((c) => !c.disabled);
  });

  protected tabIndexOf(index: number): number | null {
    if (!this.isGroup() || this.type() === 'multi') return null;
    return index === this.tabStop() ? 0 : -1;
  }

  /** Role for one selectable chip: radio / checkbox inside a group; a lone chip is a toggle button. */
  protected readonly chipRole = computed(() =>
    !this.isGroup() ? null : this.type() === 'single' ? 'radio' : 'checkbox',
  );

  protected iconSrc(icon: ChipIcon): string {
    return icon === 'records' ? 'icons/pcr/records.svg' : `icons/pcr/tag-icon-${icon}.svg`;
  }

  /**
   * Single chips show a check only when picked by the user, not when AI-suggested.
   * A disabled chip that is picked keeps its check (in grey), so the answer stays visible.
   */
  protected showsCheck(chip: ChipView): boolean {
    if (!this.isSelectable() || this.type() !== 'single') return false;
    return chip.disabled ? chip.selected : this.stateOf(chip) === 'selected';
  }

  /** Long labels are cut off with an ellipsis; the full text shows on hover. */
  protected titleOf(chip: ChipView): string | null {
    return chip.label.length > 24 ? chip.label : null;
  }

  /** Arrow keys, Home and End move through a single group and pick as they go (like radios). */
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.isGroup() || !this.isSelectable() || this.type() !== 'single') return;
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const chips = this.chips();
    const enabled = chips.map((c, i) => (c.disabled ? -1 : i)).filter((i) => i >= 0);
    if (!enabled.length) return;
    const buttons = [...this.host.nativeElement.querySelectorAll<HTMLButtonElement>('button.chip')];
    const current = enabled.indexOf(buttons.indexOf(document.activeElement as HTMLButtonElement));
    let target: number;
    if (event.key in keys) {
      const step = keys[event.key];
      target = enabled[current === -1 ? 0 : (current + step + enabled.length) % enabled.length];
    } else if (event.key === 'Home') {
      target = enabled[0];
    } else if (event.key === 'End') {
      target = enabled[enabled.length - 1];
    } else {
      return;
    }
    event.preventDefault();
    buttons[target]?.focus();
    const chip = chips[target];
    if (!chip.selected) this.click(chip);
  }

  protected stateOf(chip: ChipView): ChipState {
    if (chip.disabled) return 'disabled';
    // Only selectable chips can be picked or suggested; removable and read-only chips just show their label.
    if (chip.selected && this.isSelectable()) return chip.suggested ? 'ai-suggested' : 'selected';
    return 'default';
  }

  protected classesOf(chip: ChipView): string {
    const cls = ['chip', this.isSelectable() ? `chip-${this.type()}` : `chip-${this.variant()}`];
    if (this.size() !== 'md') cls.push(`chip-${this.size()}`);
    const state = this.stateOf(chip);
    if (state === 'selected' || state === 'ai-suggested') cls.push('selected');
    if (chip.disabled && !this.isSelectable()) cls.push('chip-disabled');
    // Disabled but picked: grey, with the check or checkbox still shown.
    if (chip.disabled && chip.selected && this.isSelectable()) cls.push('chip-picked-disabled');
    return cls.join(' ');
  }

  protected click(chip: ChipView): void {
    if (chip.disabled || !this.isSelectable()) return;
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

  /**
   * Removes a chip. In a group, focus then moves to the chip that takes its place
   * (or the one before it), so keyboard users can keep removing without losing their spot.
   */
  protected remove(chip: ChipView, index: number): void {
    if (chip.disabled) return;
    this.removed.emit(chip.option?.value ?? chip.label);
    this.onTouched();
    if (!this.isGroup()) return;
    afterNextRender(
      () => {
        const host = this.host.nativeElement;
        if (host.contains(document.activeElement) && document.activeElement !== document.body) return;
        const crosses = [...host.querySelectorAll<HTMLButtonElement>('.chip-remove')];
        const next = crosses.slice(index).find((b) => !b.disabled) ?? crosses.slice(0, index).reverse().find((b) => !b.disabled);
        next?.focus();
      },
      { injector: this.injector },
    );
  }

  /** Delete and Backspace remove the focused chip too. */
  protected onRemoveKeydown(event: KeyboardEvent, chip: ChipView, index: number): void {
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    event.preventDefault();
    this.remove(chip, index);
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
