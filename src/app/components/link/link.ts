import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';

export type LinkSize = 'sm' | 'md' | 'lg';

/**
 * Link: takes people to another page or place. For actions on this page, use a button.
 *
 *   <p>Read the <app-link href="/terms">terms of service</app-link> first.</p>
 *   <app-link href="/help" [standalone]="true">Get help</app-link>
 *   <app-link href="https://example.com" [external]="true">Example docs</app-link>
 */
@Component({
  selector: 'app-link',
  imports: [NgTemplateOutlet],
  templateUrl: './link.html',
})
export class LinkComponent {
  readonly href = input('');
  /** On its own, not inside a sentence: no underline until hover, and a 44px tap area on phones. */
  readonly standalone = input(false);
  /** Opens in a new tab, with an icon and "(opens in a new tab)" for screen readers. */
  readonly external = input(false);
  /** Standalone links only: sm 14px · md 16px · lg 18px. Inline links take the size of their text. */
  readonly size = input<LinkSize>('md');
  /** Not available right now: grey, not clickable, and not reachable with Tab. */
  readonly disabled = input(false);

  protected readonly classes = computed(() => {
    const cls = ['exos-link'];
    if (this.standalone()) cls.push('exos-link-standalone', `exos-link-${this.size()}`);
    if (this.disabled()) cls.push('is-disabled');
    return cls.join(' ');
  });
}
