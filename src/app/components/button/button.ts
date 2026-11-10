import { Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  destructive: 'btn-danger',
};

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

  protected readonly classes = computed(
    () => `btn ${VARIANT_CLASS[this.variant()]}${this.ghost() ? ' btn-ghost' : ''}`,
  );
}
