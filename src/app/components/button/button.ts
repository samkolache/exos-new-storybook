import { Component, computed, input, output } from '@angular/core';

export type ButtonVariant =
  | 'primary' | 'secondary' | 'success' | 'danger'
  | 'warning' | 'info' | 'light' | 'dark' | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
})
export class ButtonComponent {
  readonly label = input<string>('Button');
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly outline = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly clicked = output<MouseEvent>();

  protected readonly classes = computed(() => {
    const variant = this.variant();
    const cls = ['btn', this.outline() && variant !== 'link' ? `btn-outline-${variant}` : `btn-${variant}`];
    if (this.size() !== 'md') cls.push(`btn-${this.size()}`);
    return cls.join(' ');
  });
}
