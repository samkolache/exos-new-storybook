/** Real theme classes, measured live: [name, rule, the element's markup]. */
export const PADDING_SAMPLES: [string, string, string][] = [
  ['Button', 'Control', '<button type="button" class="btn btn-primary btn-lg" tabindex="-1">Save changes</button>'],
  ['Input', 'Control', '<input class="form-control" value="Alex Morgan" aria-label="Sample" tabindex="-1" readonly />'],
  ['Segment', 'Control', '<span class="exos-segmented exos-segmented-contrast"><span class="exos-segment">Interior</span></span>'],
  ['Tab', 'Control', '<span class="exos-tabs exos-tabs-line"><span class="exos-tab">Summary</span></span>'],
  ['Chip', 'Compact', '<span class="chip chip-single">Average</span>'],
  ['Tag', 'Compact', '<span class="exos-tag exos-tag-text-only">Pending</span>'],
  ['Tooltip', 'Small surface', '<span class="exos-tooltip is-visible position-static d-inline-block">Copy link</span>'],
  ['Notification', 'Small surface', '<div class="exos-notification exos-notification-success" style="width: 18rem"><span class="exos-notification-icon"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor" style="color: var(--color-status-success)" /><path d="M6 10.5l2.5 2.5L14 7.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></span><div class="exos-notification-body"><p class="exos-notification-title">Changes saved</p></div></div>'],
];

/** The element that carries the padding: the segment or tab inside its track, else the sample itself. */
export function paddedElement(box: Element): HTMLElement {
  return (box.querySelector('.exos-segment, .exos-tab') ?? box.firstElementChild) as HTMLElement;
}
