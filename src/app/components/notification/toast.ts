import { Component, Injectable, inject, signal } from '@angular/core';
import { NotificationComponent, NotificationKind } from './notification';

export interface Toast {
  id: number;
  kind: NotificationKind;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Milliseconds before it hides. 0 keeps it until dismissed. */
  duration: number;
}

export type ToastOptions = Omit<Toast, 'id' | 'duration'> & { duration?: number };

/**
 * Shows toasts in the app's <app-toast-region>.
 *
 *   inject(ToastService).show({ kind: 'success', title: 'Saved' });
 *
 * Info and success toasts hide after 6 seconds. Errors, warnings and toasts with an action stay
 * until people dismiss them, so nobody misses something they need to do.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(options: ToastOptions): number {
    const stays = options.kind === 'error' || options.kind === 'warning' || !!options.actionLabel;
    const toast: Toast = { ...options, id: ++this.nextId, duration: options.duration ?? (stays ? 0 : 6000) };
    // Newest on top; at most 3, so the screen doesn't fill up.
    this.toasts.update((list) => [toast, ...list].slice(0, 3));
    this.resume(toast.id);
    return toast.id;
  }

  dismiss(id: number): void {
    this.pause(id);
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  /** While people hover or focus a toast, it doesn't hide. */
  pause(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }

  resume(id: number): void {
    const toast = this.toasts().find((t) => t.id === id);
    if (!toast?.duration) return;
    this.timers.set(id, setTimeout(() => this.dismiss(id), toast.duration));
  }
}

/** Where toasts appear: top right on web, along the bottom on phones. Put one in the app shell. */
@Component({
  selector: 'app-toast-region',
  imports: [NotificationComponent],
  template: `
<section class="exos-toast-region" aria-label="Notifications">
  @for (toast of service.toasts(); track toast.id) {
    <app-notification
      variant="toast"
      [kind]="toast.kind"
      [title]="toast.title"
      [message]="toast.message ?? ''"
      [actionLabel]="toast.actionLabel ?? ''"
      [dismissible]="true"
      (action)="toast.onAction?.(); service.dismiss(toast.id)"
      (dismissed)="service.dismiss(toast.id)"
      (mouseenter)="service.pause(toast.id)"
      (mouseleave)="service.resume(toast.id)"
      (focusin)="service.pause(toast.id)"
      (focusout)="service.resume(toast.id)"
    />
  }
</section>`,
})
export class ToastRegionComponent {
  protected readonly service = inject(ToastService);
}
