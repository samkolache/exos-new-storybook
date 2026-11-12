import { Component, ElementRef, computed, effect, input, model, output, viewChild } from '@angular/core';
import { ButtonComponent, ButtonVariant } from '../button/button';
import { uniqueId } from '../shared/form-field';

export type ModalSize = 'sm' | 'md' | 'lg';

/**
 * Modal: asks people to focus on one task or decision before going back to the page.
 *
 *   <app-modal [(open)]="open" title="Delete photo?" primaryLabel="Delete" primaryVariant="destructive"
 *              secondaryLabel="Cancel" (primary)="delete()">This can't be undone.</app-modal>
 *
 * Built on the browser's <dialog>: focus stays inside, Esc closes it, and the page behind
 * can't be reached. Web: centred. Phones: a sheet from the bottom, or full screen for forms.
 */
@Component({
  selector: 'app-modal',
  imports: [ButtonComponent],
  templateUrl: './modal.html',
})
export class ModalComponent {
  readonly open = model(false);
  readonly title = input('');
  /** A short line under the title, like the item it's about. */
  readonly subtitle = input('');
  /** sm 400px: a decision · md 560px: a short form · lg 800px: longer content. */
  readonly size = input<ModalSize>('md');
  readonly primaryLabel = input('');
  readonly primaryVariant = input<ButtonVariant>('primary');
  readonly secondaryLabel = input('');
  /** Phones: sheet from the bottom (default), or full screen for forms and long content. */
  readonly mobile = input<'sheet' | 'fullscreen'>('sheet');
  /** Esc, the close button and a click outside close it. Turn off only when people must choose. */
  readonly dismissible = input(true);

  readonly primary = output<void>();
  readonly secondary = output<void>();
  /** However it closed: a button, Esc, the close button or a click outside. */
  readonly closed = output<void>();

  protected readonly titleId = uniqueId('modal-title');
  protected readonly classes = computed(
    () => `exos-modal exos-modal-${this.size()} exos-modal-mobile-${this.mobile()}`,
  );
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.open() && !el.open) {
        el.showModal();
        document.documentElement.classList.add('exos-modal-open');
      } else if (!this.open() && el.open) {
        el.close();
      }
    });
  }

  protected onPrimary(): void {
    this.primary.emit();
  }

  protected onSecondary(): void {
    this.secondary.emit();
    this.close();
  }

  close(): void {
    this.open.set(false);
  }

  /** Esc closes it when dismissible (handled here, so it behaves the same everywhere). */
  protected onEscape(event: Event): void {
    event.preventDefault();
    if (this.dismissible()) this.close();
  }

  /** Esc: the browser's cancel. Kept from closing when the modal can't be dismissed. */
  protected onCancel(event: Event): void {
    if (!this.dismissible()) event.preventDefault();
  }

  /** The dialog closed for any reason: keep `open` in sync and give the page its scroll back. */
  protected onClose(): void {
    document.documentElement.classList.remove('exos-modal-open');
    if (this.open()) this.open.set(false);
    this.closed.emit();
  }

  /** A click on the backdrop lands on the <dialog> itself, not its content. */
  protected onBackdrop(event: MouseEvent): void {
    if (this.dismissible() && event.target === this.dialog().nativeElement) this.close();
  }
}
