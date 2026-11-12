import { Component, ElementRef, computed, input, model, viewChildren } from '@angular/core';

export interface SegmentItem {
  label: string;
  value: string;
  /** Short text after the label, like a total (12) or progress (4/6). */
  count?: string | number;
  /** What a screen reader says for the count, like "4 of 6 photos". Defaults to the count. */
  countLabel?: string;
  disabled?: boolean;
  /** Id of the region this segment shows, if there is one (aria-controls). */
  controls?: string;
}

/** contrast: white track, dark pick; over photos and busy screens · subtle: grey track, white pick; inside cards and toolbars. */
export type SegmentedAppearance = 'contrast' | 'subtle';
/** sm 32px · md 40px · lg 48px on web. Segments at least 44px on phones. */
export type SegmentedSize = 'sm' | 'md' | 'lg';

/**
 * Segmented control: switch between 2 to 5 views of the same content, one at a time.
 * Like iOS's segmented control and Carbon's content switcher.
 *
 *   <app-segmented-control label="Photos" [items]="sections" [(value)]="section" />
 *   <app-segmented-control label="Range" appearance="subtle" size="sm" [items]="ranges" [(value)]="range" />
 *
 * Arrow keys move between segments and pick them; Home / End jump to the ends.
 */
@Component({
  selector: 'app-segmented-control',
  templateUrl: './segmented-control.html',
  host: { '[class]': 'hostClasses()' },
})
export class SegmentedControlComponent {
  readonly items = input<SegmentItem[]>([]);
  readonly value = model('');
  /** Names the control for screen readers, like "Photos". Always set one. */
  readonly label = input('');
  readonly appearance = input<SegmentedAppearance>('contrast');
  readonly size = input<SegmentedSize>('md');
  /** Stretch across the container. Always full width on phones. */
  readonly fullWidth = input(false);
  /** Turns off the whole control. To turn off one segment, set `disabled` on its item. */
  readonly disabled = input(false);

  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('segment');

  /** The picked segment: `value`, or the first one that isn't disabled. */
  readonly current = computed(() => {
    const items = this.items();
    return items.find((i) => i.value === this.value() && !i.disabled)?.value ?? items.find((i) => !i.disabled)?.value ?? '';
  });

  protected readonly currentIndex = computed(() => this.items().findIndex((i) => i.value === this.current()));

  protected readonly hostClasses = computed(() => (this.fullWidth() ? 'exos-segmented-host is-full' : 'exos-segmented-host'));

  protected readonly trackClasses = computed(() => {
    const cls = ['exos-segmented', `exos-segmented-${this.appearance()}`];
    if (this.size() !== 'md') cls.push(`exos-segmented-${this.size()}`);
    if (this.fullWidth()) cls.push('exos-segmented-full');
    if (this.disabled()) cls.push('is-disabled');
    return cls.join(' ');
  });

  protected isDisabled(item: SegmentItem): boolean {
    return this.disabled() || !!item.disabled;
  }

  protected select(item: SegmentItem): void {
    if (!this.isDisabled(item)) this.value.set(item.value);
  }

  /** Roving focus: arrows move and pick, Home / End jump, disabled segments are skipped. */
  protected onKeydown(event: KeyboardEvent, index: number): void {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const items = this.items();
    const enabled = (i: number) => !this.isDisabled(items[i]);
    let next = -1;
    if (event.key in keys) {
      for (let step = 1; step <= items.length; step++) {
        const i = (index + keys[event.key] * step + items.length) % items.length;
        if (enabled(i)) {
          next = i;
          break;
        }
      }
    } else if (event.key === 'Home') {
      next = items.findIndex((_, i) => enabled(i));
    } else if (event.key === 'End') {
      for (let i = items.length - 1; i >= 0; i--) if (enabled(i)) { next = i; break; }
    }
    if (next < 0) return;
    event.preventDefault();
    this.select(items[next]);
    this.buttons()[next]?.nativeElement.focus();
  }
}
