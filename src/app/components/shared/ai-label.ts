import { Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { uniqueId } from './form-field';

/**
 * AI label: a small "AI" button that opens a short explanation of what the AI did
 * (a toggletip: it stays open until people click or tab away, or press Esc).
 * Never disabled, even when the field it labels is disabled or read only.
 *
 *   <app-ai-label explanation="Suggested from the 12 photos of the kitchen." />
 */
@Component({
  selector: 'app-ai-label',
  template: `
<button
  type="button"
  class="exos-ai-label"
  [attr.aria-expanded]="open()"
  [attr.aria-controls]="popId"
  aria-label="AI: show explanation"
  (click)="toggle()"
>
  <img src="icons/pcr/chip-sparkle.svg" width="10" height="10" alt="" />AI
</button>
<span [id]="popId" role="status" class="exos-ai-pop-anchor">
  @if (open()) {
    <span class="exos-ai-pop">
      <strong class="d-block">{{ title() }}</strong>
      {{ explanation() }}
    </span>
  }
</span>`,
  host: { class: 'exos-ai', '(keydown.escape)': 'close()', '(focusout)': 'onFocusOut($event)' },
})
export class AiLabelComponent {
  readonly explanation = input('');
  readonly title = input('AI suggested');

  protected readonly popId = uniqueId('ai-pop');
  protected readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected toggle(): void {
    this.open.update((o) => !o);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) this.close();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }
}

/** "Revert to AI suggestion": shown in place of the AI label once people change the AI's answer. */
@Component({
  selector: 'app-ai-revert',
  template: `
<button type="button" class="exos-ai-revert" aria-label="Revert to AI suggestion" title="Revert to AI suggestion" (click)="revert.emit()">
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 5.5h5.5a3 3 0 010 6H5" />
    <path d="M5.5 3L3 5.5 5.5 8" />
  </svg>
</button>`,
  host: { class: 'exos-ai' },
})
export class AiRevertComponent {
  readonly revert = output<void>();
}
