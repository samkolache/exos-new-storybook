import { Component, ElementRef, computed, contentChildren, forwardRef, inject, input, model, viewChildren } from '@angular/core';
import { uniqueId } from '../shared/form-field';

export interface TabItem {
  label: string;
  value: string;
  disabled?: boolean;
  /** A number after the label, like unread items. */
  count?: number;
}

/**
 * Tabs: switch between views of the same page, one at a time.
 *
 *   <app-tabs [items]="tabs" [(value)]="tab" label="Order details">
 *     <app-tab-panel value="summary">…</app-tab-panel>
 *     <app-tab-panel value="history">…</app-tab-panel>
 *   </app-tabs>
 *
 * Arrow keys move between tabs and show them; Tab moves into the panel.
 * For a compact switch between views of the same content, use app-segmented-control.
 */
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.html',
  host: { class: 'd-block' },
})
export class TabsComponent {
  readonly items = input<TabItem[]>([]);
  readonly value = model('');
  /** Names the tab list for screen readers, like "Order details". */
  readonly label = input('');

  readonly baseId = uniqueId('tabs');
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('tab');
  /** Tabs point only at panels that exist. */
  private readonly panels = contentChildren(forwardRef(() => TabPanelComponent));

  protected controlsOf(value: string): string | null {
    return this.panels().some((p) => p.value() === value) ? this.panelId(value) : null;
  }

  /** The shown tab: `value`, or the first one that isn't disabled. */
  readonly current = computed(() => {
    const items = this.items();
    return items.find((i) => i.value === this.value() && !i.disabled)?.value ?? items.find((i) => !i.disabled)?.value ?? '';
  });

  protected readonly listClasses = 'exos-tabs exos-tabs-line';

  tabId(value: string): string {
    return `${this.baseId}-tab-${value}`;
  }

  panelId(value: string): string {
    return `${this.baseId}-panel-${value}`;
  }

  protected select(item: TabItem): void {
    if (!item.disabled) this.value.set(item.value);
  }

  /** Roving focus: arrows move and show, Home / End jump, disabled tabs are skipped. */
  protected onKeydown(event: KeyboardEvent, index: number): void {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const items = this.items();
    let next = -1;
    if (event.key in keys) {
      for (let step = 1; step <= items.length; step++) {
        const i = (index + keys[event.key] * step + items.length) % items.length;
        if (!items[i].disabled) {
          next = i;
          break;
        }
      }
    } else if (event.key === 'Home') {
      next = items.findIndex((i) => !i.disabled);
    } else if (event.key === 'End') {
      next = items.length - 1 - [...items].reverse().findIndex((i) => !i.disabled);
    }
    if (next < 0) return;
    event.preventDefault();
    this.select(items[next]);
    const button = this.buttons()[next]?.nativeElement;
    button?.focus();
    button?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

/** One tab's content. Shown while its tab is picked. */
@Component({
  selector: 'app-tab-panel',
  template: `<ng-content />`,
  host: {
    role: 'tabpanel',
    class: 'exos-tab-panel',
    '[id]': 'tabs.panelId(value())',
    '[attr.aria-labelledby]': 'tabs.tabId(value())',
    '[hidden]': 'tabs.current() !== value()',
    tabindex: '0',
  },
})
export class TabPanelComponent {
  readonly value = input.required<string>();
  protected readonly tabs = inject(TabsComponent);
}
