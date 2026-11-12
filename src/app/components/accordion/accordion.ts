import { Component, contentChildren, effect, forwardRef, inject, input, model, untracked } from '@angular/core';
import { uniqueId } from '../shared/form-field';

export type AccordionSize = 'sm' | 'md' | 'lg';

/**
 * Accordion: a list of sections people open one by one, to keep a long page short.
 *
 *   <app-accordion>
 *     <app-accordion-item title="Shipping">…</app-accordion-item>
 *     <app-accordion-item title="Returns" [(open)]="returnsOpen">…</app-accordion-item>
 *   </app-accordion>
 */
@Component({
  selector: 'app-accordion',
  template: `<ng-content />`,
  host: {
    '[class]': "'exos-accordion d-block exos-accordion-' + size() + (chevron() === 'start' ? ' exos-accordion-chevron-start' : '')",
  },
})
export class AccordionComponent {
  /** Lets several sections be open at once. Off: opening one closes the others. */
  readonly multiple = input(true);
  /** Row height on web: sm 32px · md 40px · lg 48px. At least 44px on phones. */
  readonly size = input<AccordionSize>('md');
  /** Where the chevron sits: end (default), or start for nested or indented lists. */
  readonly chevron = input<'start' | 'end'>('end');
  /** The heading level of each title, so it fits the page outline. */
  readonly headingLevel = input<2 | 3 | 4 | 5 | 6>(3);

  private readonly items = contentChildren(forwardRef(() => AccordionItemComponent));

  constructor() {
    // Single mode: when one opens, the rest close.
    effect(() => {
      const items = this.items();
      if (this.multiple()) return;
      items.forEach((item) => item.open());
      untracked(() => {
        const opened = items.filter((i) => i.open());
        if (opened.length > 1) {
          const keep = opened.find((i) => i.lastOpenedAt === Math.max(...opened.map((o) => o.lastOpenedAt))) ?? opened[0];
          opened.filter((i) => i !== keep).forEach((i) => i.open.set(false));
        }
      });
    });
  }
}

@Component({
  selector: 'app-accordion-item',
  template: `
<div role="heading" [attr.aria-level]="parent?.headingLevel() ?? 3" class="exos-accordion-heading">
  <button
    type="button"
    class="exos-accordion-trigger"
    [id]="triggerId"
    [attr.aria-expanded]="open()"
    [attr.aria-controls]="panelId"
    [disabled]="disabled()"
    (click)="toggle()"
  >
    <span class="exos-accordion-title">{{ title() }}</span>
    @if (meta()) {
      <span class="exos-accordion-meta">{{ meta() }}</span>
    }
    <svg class="exos-accordion-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 6l4 4 4-4" />
    </svg>
  </button>
</div>
<div class="exos-accordion-panel" role="region" [id]="panelId" [attr.aria-labelledby]="triggerId" [hidden]="!open()">
  <div class="exos-accordion-content"><ng-content /></div>
</div>`,
  host: { class: 'exos-accordion-item', '[class.is-open]': 'open()', '[class.is-disabled]': 'disabled()' },
})
export class AccordionItemComponent {
  readonly title = input('');
  /** Short text at the end of the row, like "3 items" or a status. */
  readonly meta = input('');
  readonly open = model(false);
  readonly disabled = input(false);

  protected readonly parent = inject(AccordionComponent, { optional: true });
  protected readonly triggerId = uniqueId('accordion-trigger');
  protected readonly panelId = uniqueId('accordion-panel');
  lastOpenedAt = 0;
  private static clock = 0;

  protected toggle(): void {
    if (!this.open()) this.lastOpenedAt = ++AccordionItemComponent.clock;
    this.open.set(!this.open());
  }
}
