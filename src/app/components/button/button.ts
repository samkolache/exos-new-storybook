import { Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  destructive: 'btn-danger',
};

/** Button classes; shared with components that render their own <button> (e.g. the dropdown toggle). */
export function buttonClasses(variant: ButtonVariant, ghost = false): string[] {
  const cls = ['btn', VARIANT_CLASS[variant]];
  if (ghost) cls.push('btn-ghost');
  return cls;
}

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
})
export class ButtonComponent {
  readonly label = input<string>('Button');
  readonly variant = input<ButtonVariant>('primary');
  /** Text-only version of the variant: no fill, border or shadow. */
  readonly ghost = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly clicked = output<MouseEvent>();

  protected readonly classes = computed(() => buttonClasses(this.variant(), this.ghost()).join(' '));
}
