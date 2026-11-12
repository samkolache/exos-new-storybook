import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';

/** first-use: nothing here yet · no-results: a search or filter found nothing · error: it couldn't load. */
export type EmptyStateKind = 'first-use' | 'no-results' | 'error';

/**
 * Empty state: what goes where content would be, when there's none.
 *
 *   <app-empty-state kind="first-use" title="No orders yet" message="Orders you place show up here."
 *                    actionLabel="Start shopping" (action)="shop()" />
 */
@Component({
  selector: 'app-empty-state',
  imports: [ButtonComponent],
  template: `
<div class="exos-empty" [class]="'exos-empty-' + kind()" [class.exos-empty-compact]="compact()" [attr.role]="kind() === 'error' ? 'alert' : null">
  <span class="exos-empty-art" aria-hidden="true">
    @switch (kind()) {
      @case ('no-results') {
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="17" cy="17" r="10" /><path d="M25 25l8 8M13 17h8" /></svg>
      }
      @case ('error') {
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 28a7 7 0 01.5-14A9 9 0 0128 12a7 7 0 012 14" /><path d="M20 21v6M20 31v.5" /></svg>
      }
      @default {
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l14-7 14 7v14l-14 7-14-7z" /><path d="M6 14l14 7 14-7M20 21v14" /></svg>
      }
    }
  </span>
  <p class="exos-empty-title">{{ title() }}</p>
  @if (message()) {
    <p class="exos-empty-message">{{ message() }}</p>
  }
  @if (actionLabel()) {
    <app-button [variant]="kind() === 'first-use' ? 'primary' : 'secondary'" [label]="actionLabel()" (clicked)="action.emit()" />
  }
</div>`,
  host: { class: 'd-block' },
})
export class EmptyStateComponent {
  readonly kind = input<EmptyStateKind>('first-use');
  /** What's missing, or what happened: "No orders yet", "No results for 'lamp'". */
  readonly title = input('');
  /** Why, and what people can do. */
  readonly message = input('');
  /** One way forward, like "Clear filters" or "Try again". */
  readonly actionLabel = input('');
  /** Smaller, for inside cards and panels. */
  readonly compact = input(false);
  readonly action = output<void>();
}
