import { Component, input } from '@angular/core';

export type StatusKind = 'info' | 'success' | 'warning' | 'error';

/**
 * A 16 / 20px status icon in its status colour. Each kind has its own shape (circle i, check,
 * triangle, octagon), so status never depends on colour alone. Decorative: the text says the status.
 */
@Component({
  selector: 'app-status-icon',
  template: `
<svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
  @switch (kind()) {
    @case ('success') {
      <circle cx="10" cy="10" r="9" fill="var(--color-status-success)" />
      <path d="M6 10.2l2.6 2.6L14 7.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    }
    @case ('warning') {
      <path d="M10 1.8l8.6 15.4H1.4z" fill="var(--color-status-warning)" stroke="var(--color-status-warning)" stroke-width="1.2" stroke-linejoin="round" />
      <path d="M10 7.5v4.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="10" cy="14.4" r="1.05" fill="#fff" />
    }
    @case ('error') {
      <path d="M6.3 1.5h7.4l5.2 5.2v7.4l-5.2 5.2H6.3L1.1 14.1V6.7z" fill="var(--color-status-danger)" />
      <path d="M10 5.8v5.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="10" cy="14" r="1.05" fill="#fff" />
    }
    @default {
      <circle cx="10" cy="10" r="9" fill="var(--color-status-info)" />
      <path d="M10 9v5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="10" cy="6.2" r="1.05" fill="#fff" />
    }
  }
</svg>`,
  host: { class: 'exos-status-icon' },
})
export class StatusIconComponent {
  readonly kind = input<StatusKind>('info');
  readonly size = input(20);
}
