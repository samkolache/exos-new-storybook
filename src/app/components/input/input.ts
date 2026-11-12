import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FieldSize, FieldState, uniqueId } from '../shared/form-field';

/** 'textarea' renders a multi-line field; everything else is a native <input type>. */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' | 'textarea';
/** outline: most forms. filled: search and toolbars. pill: short, casual fields. */
export type InputAppearance = 'outline' | 'filled' | 'pill';
export type InputIcon = 'none' | 'search';
/** Warning is for answers that are allowed but probably wrong. */
export type InputState = FieldState;
/** The on-screen keyboard to show on phones (the HTML inputmode attribute). */
export type InputMode = 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url' | 'search' | 'none';
/** How phones capitalise as people type (the HTML autocapitalize attribute). */
export type Autocapitalize = 'none' | 'sentences' | 'words' | 'characters';
/** The label of the Return key on phones (the HTML enterkeyhint attribute). */
export type EnterKeyHint = 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

/**
 * Text field: Bootstrap .form-control with the Exos styles.
 *
 *   <app-input label="Full name" autocomplete="name" [(value)]="name" />
 *   <app-input type="textarea" label="Message" [autoResize]="true" [maxLength]="500" [showCount]="true" />
 *   <app-input type="password" label="Password" />                  (show/hide button built in)
 *   <app-input label="Search" [hideLabel]="true" icon="search" appearance="filled" [clearable]="true" />
 *
 * Works with [(value)], ngModel and reactive forms.
 */
@Component({
  selector: 'app-input',
  imports: [NgTemplateOutlet],
  templateUrl: './input.html',
  host: { class: 'd-block' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true }],
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input('');
  /** Keeps the label for screen readers but hides it on screen, e.g. a search field with an icon. */
  readonly hideLabel = input(false);
  readonly placeholder = input('');
  readonly type = input<InputType>('text');
  readonly size = input<FieldSize>('md');
  readonly appearance = input<InputAppearance>('outline');
  /** Bootstrap floating label. Takes precedence over icon, prefix and suffix. */
  readonly floatingLabel = input(false);
  readonly icon = input<InputIcon>('none');
  /** Text before / after the field (Bootstrap input group). Single-line only. */
  readonly prefix = input('');
  readonly suffix = input('');
  readonly helpText = input('');
  readonly state = input<InputState>('none');
  /** Message shown under the field when state is valid, warning or invalid. */
  readonly feedback = input('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  /** Adds "(optional)" after the label. Mark whichever is rarer in a form: required or optional. */
  readonly optional = input(false);
  readonly inputId = input(uniqueId('input'));
  readonly name = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);
  /** Keyboard on phones. Email, tel and url types already pick theirs. */
  readonly inputMode = input<InputMode | null>(null);
  /** Return key label on phones, e.g. 'next' between fields, 'send' on the last. */
  readonly enterKeyHint = input<EnterKeyHint | null>(null);
  /**
   * Capitalisation on phones. Left unset, it's off for email, url, password and tel fields
   * and for usernames and codes, and the browser default everywhere else.
   */
  readonly autocapitalize = input<Autocapitalize | null>(null);

  /** Limits the length (native maxlength). */
  readonly maxLength = input<number | null>(null);
  /** Shows "12 / 140" (or "12" with no maxLength) under the field. */
  readonly showCount = input(false);
  /** Adds a × button once there's text. */
  readonly clearable = input(false);

  // Textarea
  readonly rows = input(3);
  /** Textarea grows with its text, from `rows` up to `maxRows`, then scrolls. */
  readonly autoResize = input(false);
  readonly maxRows = input(8);

  readonly value = model('');
  readonly blurred = output<FocusEvent>();
  readonly cleared = output<void>();

  private readonly field = viewChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('field');
  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  /** Password currently shown as plain text. */
  protected readonly revealed = signal(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** Exact values (emails, codes, usernames): no autocorrect, spell check or capitals. */
  protected readonly exact = computed(
    () =>
      ['email', 'url', 'password', 'tel'].includes(this.type()) ||
      /\b(username|email|one-time-code|postal-code|cc-number|url)\b/.test(this.autocomplete() ?? ''),
  );
  protected readonly capitalize = computed(() => this.autocapitalize() ?? (this.exact() ? 'none' : null));
  protected readonly isTextarea = computed(() => this.type() === 'textarea');
  protected readonly nativeType = computed(() =>
    this.type() === 'password' && this.revealed() ? 'text' : this.type(),
  );
  protected readonly hasGroup = computed(
    () => !this.isTextarea() && !this.floatingLabel() && !!(this.prefix() || this.suffix()),
  );
  protected readonly hasLeading = computed(() => this.icon() === 'search' && !this.floatingLabel());

  protected readonly showClear = computed(
    () => this.clearable() && !!this.value() && !this.isDisabled() && !this.readonly(),
  );
  protected readonly showReveal = computed(() => this.type() === 'password' && !this.isDisabled());
  /** Room kept for trailing buttons, so text doesn't jump when × appears. */
  protected readonly trailingSlots = computed(
    () => (this.clearable() ? 1 : 0) + (this.type() === 'password' ? 1 : 0),
  );
  protected readonly useWrap = computed(() => !this.hasGroup() && (this.hasLeading() || this.trailingSlots() > 0));

  protected readonly counter = computed(() => {
    if (!this.showCount()) return '';
    const length = this.value().length;
    return this.maxLength() ? `${length} / ${this.maxLength()}` : `${length}`;
  });

  protected readonly showFeedback = computed(() => this.state() !== 'none' && !!this.feedback());
  protected readonly feedbackClass = computed(() => `d-block ${this.state()}-feedback`);
  protected readonly helpId = computed(() => `${this.inputId()}-help`);
  protected readonly feedbackId = computed(() => `${this.inputId()}-feedback`);
  protected readonly countId = computed(() => `${this.inputId()}-count`);
  protected readonly describedBy = computed(
    () =>
      [
        this.showFeedback() && this.feedbackId(),
        this.helpText() && this.helpId(),
        this.counter() && this.countId(),
      ]
        .filter(Boolean)
        .join(' ') || null,
  );

  protected readonly controlClasses = computed(() => {
    const cls = ['form-control'];
    if (this.size() !== 'md' && !this.floatingLabel()) cls.push(`form-control-${this.size()}`);
    if (this.appearance() !== 'outline') cls.push(`form-field-${this.appearance()}`);
    if (this.state() !== 'none') cls.push(`is-${this.state()}`);
    if (this.isTextarea() && this.autoResize()) cls.push('form-control-autosize');
    return cls.join(' ');
  });

  protected readonly groupClasses = computed(() => {
    const cls = ['input-group'];
    if (this.size() !== 'md') cls.push(`input-group-${this.size()}`);
    if (this.state() !== 'none') cls.push('has-validation');
    return cls.join(' ');
  });

  protected readonly wrapClasses = computed(() => {
    const cls = ['form-control-wrap', `form-control-wrap-${this.size()}`];
    if (this.hasLeading()) cls.push('has-leading');
    if (this.trailingSlots()) cls.push(`has-trailing-${this.trailingSlots()}`);
    if (this.isTextarea()) cls.push('is-textarea');
    return cls.join(' ');
  });

  constructor() {
    // Keep an auto-resizing textarea fitted to its text after every change.
    afterRenderEffect(() => {
      this.value();
      this.rows();
      this.maxRows();
      const el = this.field()?.nativeElement;
      if (el instanceof HTMLTextAreaElement && this.autoResize()) this.fit(el);
    });
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }

  protected clear(): void {
    this.value.set('');
    this.onChange('');
    this.cleared.emit();
    this.field()?.nativeElement.focus();
  }

  protected toggleReveal(): void {
    this.revealed.update((shown) => !shown);
    this.field()?.nativeElement.focus();
  }

  private fit(el: HTMLTextAreaElement): void {
    const style = getComputedStyle(el);
    const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5;
    const chrome =
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom) +
      parseFloat(style.borderTopWidth) +
      parseFloat(style.borderBottomWidth);
    const min = line * this.rows() + chrome;
    const max = line * Math.max(this.maxRows(), this.rows()) + chrome;
    el.style.height = 'auto';
    const needed = el.scrollHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    el.style.height = `${Math.min(Math.max(needed, min), max)}px`;
    el.style.overflowY = needed > max ? 'auto' : 'hidden';
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
