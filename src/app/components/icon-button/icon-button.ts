import { Component, computed, input, output } from '@angular/core';
import { LucideDynamicIcon, LucideIconInput } from '@lucide/angular';

export type IconButtonVariant = 'light' | 'primary' | 'glass' | 'ghost';

const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  light: 'btn-icon-light',
  primary: 'btn-primary',
  glass: 'btn-icon-glass',
  ghost: 'btn-icon-ghost',
};

/**
 * Icon size + Lucide stroke (on its 24px grid) per variant, from Figma.
 * light/primary/ghost: 18px icon, 1.5px line → stroke 2.
 * glass: 14px icon, 1.8px line → stroke 1.8 × 24/14.
 */
const ICON: Record<IconButtonVariant, { size: number; stroke: number }> = {
  light: { size: 18, stroke: 2 },
  primary: { size: 18, stroke: 2 },
  glass: { size: 14, stroke: (1.8 * 24) / 14 },
  ghost: { size: 18, stroke: 2 },
};

@Component({
  selector: 'app-icon-button',
  imports: [LucideDynamicIcon],
  templateUrl: './icon-button.html',
})
export class IconButtonComponent {
  /** Any Lucide icon, e.g. `LucideChevronLeft`. */
  readonly icon = input.required<LucideIconInput>();
  /** Accessible name: the button has no visible text. */
  readonly label = input.required<string>();
  /**
   * `light` frosted white · `primary` matches the primary Button ·
   * `glass` translucent, for dark backgrounds · `ghost` icon only, no background.
   */
  readonly variant = input<IconButtonVariant>('light');
  readonly disabled = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly clicked = output<MouseEvent>();

  protected readonly classes = computed(() => `btn btn-icon ${VARIANT_CLASS[this.variant()]}`);
  protected readonly iconSpec = computed(() => ICON[this.variant()]);
}
