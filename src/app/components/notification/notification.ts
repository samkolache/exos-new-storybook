import { Component, computed, input, output } from '@angular/core';
import { StatusIconComponent, StatusKind } from '../shared/status-icon';

export type NotificationKind = StatusKind;

/**
 * Notification: tells people about something that happened or needs their attention.
 *
 *   <app-notification kind="success" title="Saved" message="Your changes are live." />
 *   <app-notification kind="error" title="Payment failed" message="Check your card details." actionLabel="Try again" (action)="retry()" />
 *
 * Inline notifications sit in the page, next to what they're about. For short-lived messages,
 * use ToastService.show(), which shows the same notification as a toast.
 */
@Component({
  selector: 'app-notification',
  imports: [StatusIconComponent],
  templateUrl: './notification.html',
  host: { class: 'd-block' },
})
export class NotificationComponent {
  readonly kind = input<NotificationKind>('info');
  readonly title = input('');
  readonly message = input('');
  /** One action, like "Try again" or "View order". */
  readonly actionLabel = input('');
  /** Shows a close button. Leave errors that block people undismissible until fixed. */
  readonly dismissible = input(false);
  /** toast: floating, with a shadow; set by the toast region. */
  readonly variant = input<'inline' | 'toast'>('inline');

  readonly action = output<void>();
  readonly dismissed = output<void>();

  /** Errors and warnings interrupt a screen reader; info and success wait their turn. */
  protected readonly role = computed(() => (this.kind() === 'error' || this.kind() === 'warning' ? 'alert' : 'status'));
  protected readonly classes = computed(
    () => `exos-notification exos-notification-${this.kind()} exos-notification-${this.variant()}`,
  );
}
