import { Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';
/** sm 32px · md 40px · lg 48px on web. At least 44px on phones. */
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  destructive: 'btn-danger',
};

const SIZE_CLASS: Record<ButtonSize, string | null> = { sm: 'btn-sm', md: null, lg: 'btn-lg' };

/** Button classes; shared with components that render their own <button> (e.g. the dropdown toggle). */
export function buttonClasses(variant: ButtonVariant, ghost = false, size: ButtonSize = 'lg'): string[] {
  const cls = ['btn', VARIANT_CLASS[variant]];
  if (ghost) cls.push('btn-ghost');
  const sizeClass = SIZE_CLASS[size];
  if (sizeClass) cls.push(sizeClass);
  return cls;
}

/**
 * Button: Bootstrap .btn with the Exos styles. Sizes and spacing follow IBM Carbon.
 *
 *   <app-button label="Save changes" (clicked)="save()" />
 *   <app-button variant="secondary" label="Cancel" />
 *   <app-button variant="destructive" label="Delete" size="md" />
 *   <div class="btn-set btn-set-end"><app-button variant="secondary" label="Cancel" /><app-button label="Save" /></div>
 */
@Component({
  selector: 'app-button',
  templateUrl: './button.html',
})
export class ButtonComponent {
  /** A verb and a noun, in sentence case: "Save changes". */
  readonly label = input<string>('Button');
  readonly variant = input<ButtonVariant>('primary');
  /** sm 32px · md 40px · lg 48px (default). At least 44px on phones. */
  readonly size = input<ButtonSize>('lg');
  /** Text-only version of the variant: no fill, border or shadow. */
  readonly ghost = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly clicked = output<MouseEvent>();

  protected readonly classes = computed(() => buttonClasses(this.variant(), this.ghost(), this.size()).join(' '));
}
