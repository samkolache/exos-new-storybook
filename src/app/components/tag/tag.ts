import { Component, computed, input } from '@angular/core';

export type TagColor = 'neutral' | 'blue' | 'attention' | 'info';
/** md is the Figma tag. */
export type TagSize = 'sm' | 'md' | 'lg';

/** Icon scale per size: 12px icons become 10px (sm) and 14px (lg). */
const ICON_SCALE: Record<TagSize, number> = { sm: 10 / 12, md: 1, lg: 14 / 12 };

export type TagIcon =
  | 'none'
  | 'sparkle'
  | 'voice'
  | 'records'
  | 'calendar'
  | 'note'
  | 'dot'
  | 'conflict'
  | 'camera'
  | 'skip'
  | 'lock'
  | 'flag';

/** Icon sizes from the Figma assets (public/icons/pcr/tag-icon-<name>.svg). */
const ICON_SIZE: Record<Exclude<TagIcon, 'none'>, [number, number]> = {
  sparkle: [10, 10],
  voice: [7.857, 7.5],
  records: [12, 12],
  calendar: [12, 12],
  note: [12, 12],
  dot: [12, 12],
  conflict: [12, 12],
  camera: [12, 12],
  skip: [12, 12],
  lock: [12, 12],
  flag: [12, 12],
};

/**
 * Tag from the PCR Figma ("Review / Source tag"): a small read-only label.
 *
 *   <app-tag label="From order" icon="calendar" />
 *   <app-tag label="Needs your input" color="attention" icon="dot" />
 *   <app-tag label="Photos" [ai]="true" />
 *   <app-tag label="Skipped" icon="skip" [disabled]="true" />
 *   <app-tag label="From order" icon="calendar" size="lg" />
 *
 * `ai` makes it blue with a sparkle (an icon you pass still wins).
 * `disabled` greys it out whatever the colour.
 */
@Component({
  selector: 'app-tag',
  templateUrl: './tag.html',
  // Never wider than its column, so long labels can truncate.
  host: { class: 'd-inline-flex', style: 'max-width: 100%' },
})
export class TagComponent {
  readonly label = input('Tag');
  readonly color = input<TagColor>('neutral');
  readonly size = input<TagSize>('md');
  readonly icon = input<TagIcon>('none');
  /** AI-sourced: blue with a sparkle. */
  readonly ai = input(false);
  /** Greyed out (Skipped, Set by system). */
  readonly disabled = input(false);

  /** Long labels end in an ellipsis; the full text shows on hover. */
  protected readonly title = computed(() => (this.label().length > 24 ? this.label() : null));

  protected readonly resolvedIcon = computed<TagIcon>(() =>
    this.icon() === 'none' && this.ai() ? 'sparkle' : this.icon(),
  );

  /** Icon size in the 12px slot; CSS scales it per size and per device (phones get bigger icons). */
  protected readonly iconBase = computed(() => {
    const icon = this.resolvedIcon();
    return icon === 'none' ? null : ICON_SIZE[icon];
  });

  protected readonly iconSize = computed(() => {
    const icon = this.resolvedIcon();
    if (icon === 'none') return null;
    const scale = ICON_SCALE[this.size()];
    const [width, height] = ICON_SIZE[icon];
    return [width * scale, height * scale];
  });

  protected readonly classes = computed(() => {
    const color = this.ai() ? 'blue' : this.color();
    const cls = ['exos-tag', `exos-tag-${color}`];
    if (this.size() !== 'md') cls.push(`exos-tag-${this.size()}`);
    if (this.disabled()) cls.push('exos-tag-disabled');
    if (this.resolvedIcon() === 'none') cls.push('exos-tag-text-only');
    return cls.join(' ');
  });
}
