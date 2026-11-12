import {
  Component,
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  Renderer2,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { uniqueId } from '../shared/form-field';

/** Which side of the element the tooltip goes on. It flips to the other side if there's no room. */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
/** Where the tooltip lines up along that side: with the element's start, centre or end. */
export type TooltipAlign = 'start' | 'center' | 'end';

const GAP = 8; // between the element and the tooltip (the caret sits in it)
const EDGE = 8; // the tooltip never goes closer than this to the edge of the screen
const SHOW_DELAY = 300; // hover this long before it shows, so it doesn't flash while the pointer passes
const HIDE_DELAY = 120; // time to move the pointer from the element onto the tooltip

const OPPOSITE: Record<TooltipPosition, TooltipPosition> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/**
 * Tooltip: a short label that appears on hover or keyboard focus, like the name of an icon button.
 *
 *   <button appTooltip="Download" aria-label="Download" [tooltipIsLabel]="true">…</button>
 *   <button appTooltip="Share" tooltipPosition="right" tooltipAlign="start">…</button>
 *
 * - It has a caret that points at the element, and stays on screen: it flips to the other side
 *   if there's no room, and slides along its side to stay inside the screen.
 * - People can move the pointer onto it to read it; it stays until the pointer leaves both.
 * - Touch screens have no hover, so a tooltip can't hold anything people need. On phones it's
 *   only a label. For extra information use <app-toggletip>, and for terms <app-definition-tooltip>.
 */
@Directive({
  selector: '[appTooltip]',
  host: { '[attr.aria-describedby]': 'describedBy()' },
})
export class TooltipDirective implements OnDestroy {
  readonly appTooltip = input('');
  readonly tooltipPosition = input<TooltipPosition>('top');
  readonly tooltipAlign = input<TooltipAlign>('center');
  /** Set when the text repeats the element's name (like an icon button's aria-label), so it isn't read twice. */
  readonly tooltipIsLabel = input(false);
  /** Clicking or tapping the element keeps it open until a click elsewhere or Esc (definition tooltips). */
  readonly tooltipPinOnClick = input(false);
  /** Always shown. For docs and specs, never for real screens. */
  readonly tooltipOpen = input(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly id = uniqueId('tooltip');
  private tip: HTMLElement | null = null;
  private text: HTMLElement | null = null;
  private showTimer: ReturnType<typeof setTimeout> | undefined;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private pinned = false;

  protected describedBy(): string | null {
    return this.tooltipIsLabel() ? null : this.id;
  }

  constructor() {
    // The text is always in the page (hidden), so aria-describedby works before it shows.
    queueMicrotask(() => this.ensureTip());
    effect(() => {
      this.appTooltip();
      if (this.tooltipOpen()) setTimeout(() => this.show());
      else if (!this.pinned) this.hide();
    });
  }

  private ensureTip(): HTMLElement {
    if (!this.tip) {
      const tip = (this.tip = this.renderer.createElement('span') as HTMLElement);
      this.renderer.setAttribute(tip, 'id', this.id);
      this.renderer.setAttribute(tip, 'role', 'tooltip');
      this.renderer.addClass(tip, 'exos-tooltip');
      this.text = this.renderer.createElement('span');
      this.renderer.addClass(this.text, 'exos-tooltip-text');
      const caret = this.renderer.createElement('span');
      this.renderer.addClass(caret, 'exos-tooltip-caret');
      this.renderer.setAttribute(caret, 'aria-hidden', 'true');
      this.renderer.appendChild(tip, this.text);
      this.renderer.appendChild(tip, caret);
      // Moving onto the tooltip keeps it open, so people can read it (and select the text).
      this.renderer.listen(tip, 'pointerenter', () => clearTimeout(this.hideTimer));
      this.renderer.listen(tip, 'pointerleave', () => this.scheduleHide());
      // In a .exos-tooltip-layer if there is one (docs), else in the themed area so it gets the theme.
      const el = this.host.nativeElement;
      const parent = el.closest('.exos-tooltip-layer') ?? el.closest('.exos-theme-dcfc') ?? el.ownerDocument.body;
      this.renderer.appendChild(parent, tip);
    }
    this.text!.textContent = this.appTooltip();
    return this.tip!;
  }

  /** Mouse only: a tap shouldn't leave a tooltip stuck on a touch screen. */
  @HostListener('pointerenter', ['$event'])
  protected onEnter(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(this.hideTimer);
    if (this.tip?.classList.contains('is-visible')) return;
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => this.show(), SHOW_DELAY);
  }

  @HostListener('pointerleave')
  protected onLeave(): void {
    clearTimeout(this.showTimer);
    this.scheduleHide();
  }

  @HostListener('focusin')
  protected onFocus(): void {
    if (this.host.nativeElement.matches(':focus-visible') || this.host.nativeElement.querySelector(':focus-visible')) this.show();
  }

  @HostListener('focusout')
  protected onBlur(): void {
    this.pinned = false;
    clearTimeout(this.showTimer);
    this.hide();
  }

  @HostListener('click')
  protected onClick(): void {
    if (!this.tooltipPinOnClick()) return;
    this.pinned = !this.pinned;
    if (this.pinned) this.show();
    else this.hide();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (this.pinned && !this.host.nativeElement.contains(target) && !this.tip?.contains(target)) {
      this.pinned = false;
      this.hide();
    }
  }

  /** Esc hides it without moving focus. */
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.pinned = false;
    this.hide();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    if (this.tip?.classList.contains('is-visible')) this.place();
  }

  private scheduleHide(): void {
    if (this.pinned || this.tooltipOpen()) return;
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.hide(), HIDE_DELAY);
  }

  show(): void {
    const tip = this.ensureTip();
    if (!this.text?.textContent) return;
    clearTimeout(this.hideTimer);
    tip.classList.add('is-visible');
    this.place();
  }

  hide(): void {
    if (this.tooltipOpen()) return;
    this.tip?.classList.remove('is-visible');
  }

  /** Puts the tooltip on its side, flips it if there's no room, keeps it on screen, and aims the caret. */
  private place(): void {
    const tip = this.tip!;
    const doc = this.host.nativeElement.ownerDocument;
    const view = doc.documentElement;
    const r = this.host.nativeElement.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    const fits: Record<TooltipPosition, boolean> = {
      top: r.top - t.height - GAP >= EDGE,
      bottom: r.bottom + t.height + GAP <= view.clientHeight - EDGE,
      left: r.left - t.width - GAP >= EDGE,
      right: r.right + t.width + GAP <= view.clientWidth - EDGE,
    };
    let side = this.tooltipPosition();
    if (!fits[side] && fits[OPPOSITE[side]]) side = OPPOSITE[side];
    const align = this.tooltipAlign();
    const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));
    let top: number;
    let left: number;
    let caret: number;
    if (side === 'top' || side === 'bottom') {
      top = side === 'top' ? r.top - t.height - GAP : r.bottom + GAP;
      left = align === 'start' ? r.left : align === 'end' ? r.right - t.width : r.left + r.width / 2 - t.width / 2;
      left = clamp(left, EDGE, view.clientWidth - t.width - EDGE);
      caret = clamp(r.left + r.width / 2 - left, 10, t.width - 10);
    } else {
      left = side === 'left' ? r.left - t.width - GAP : r.right + GAP;
      top = align === 'start' ? r.top : align === 'end' ? r.bottom - t.height : r.top + r.height / 2 - t.height / 2;
      top = clamp(top, EDGE, view.clientHeight - t.height - EDGE);
      caret = clamp(r.top + r.height / 2 - top, 10, t.height - 10);
    }
    // From screen coordinates to the tooltip's containing block (the page, or a positioned layer).
    const parent = tip.offsetParent as HTMLElement | null;
    const inLayer = parent && parent !== doc.body && parent !== doc.documentElement;
    const base = inLayer ? parent!.getBoundingClientRect() : { left: -doc.defaultView!.scrollX, top: -doc.defaultView!.scrollY };
    const scroll = inLayer ? { x: parent!.scrollLeft - parent!.clientLeft, y: parent!.scrollTop - parent!.clientTop } : { x: 0, y: 0 };
    tip.style.top = `${top - base.top + scroll.y}px`;
    tip.style.left = `${left - base.left + scroll.x}px`;
    tip.style.setProperty('--exos-tooltip-caret', `${caret}px`);
    tip.dataset['position'] = side;
  }

  ngOnDestroy(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    this.tip?.remove();
  }
}

/**
 * Definition tooltip: a term with a dotted underline that shows its definition, for words people
 * may not know inside a sentence, a label or a table.
 *
 *   The <app-definition-tooltip definition="The price agreed when the order was placed.">list price</app-definition-tooltip> includes tax.
 *
 * Shows on hover and keyboard focus like a tooltip, and a click or tap keeps it open (so it works
 * on phones too). It opens below the term, lined up with its start, so it never covers the line
 * being read.
 */
@Component({
  selector: 'app-definition-tooltip',
  imports: [TooltipDirective],
  template: `<button
  type="button"
  class="exos-definition"
  [appTooltip]="definition()"
  [tooltipPosition]="position()"
  [tooltipAlign]="align()"
  [tooltipPinOnClick]="true"
  [tooltipOpen]="open()"
><ng-content /></button>`,
})
export class DefinitionTooltipComponent {
  /** The definition: a sentence, in sentence case, with a full stop. */
  readonly definition = input('');
  readonly position = input<TooltipPosition>('bottom');
  readonly align = input<TooltipAlign>('start');
  /** Always shown. For docs only. */
  readonly open = input(false);
}

/**
 * Toggletip: an (i) button that opens a short explanation, which can include links.
 * Works the same with a mouse, a keyboard and a finger, so it's the one to use on phones.
 *
 *   <app-toggletip label="About delivery times">Orders before 2 pm ship the same day.</app-toggletip>
 */
@Component({
  selector: 'app-toggletip',
  template: `
<button
  type="button"
  class="exos-toggletip-button"
  [attr.aria-label]="label()"
  [attr.aria-expanded]="open()"
  [attr.aria-controls]="popId"
  (click)="toggle()"
>
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4" />
    <path d="M8 7.2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="8" cy="4.9" r="0.9" fill="currentColor" />
  </svg>
</button>
<span [id]="popId" role="status" class="exos-toggletip-anchor" [class.exos-toggletip-end]="align() === 'end'">
  @if (open()) {
    <span class="exos-toggletip"><ng-content /></span>
  }
</span>`,
  host: { class: 'exos-toggletip-host', '(keydown.escape)': 'close()', '(focusout)': 'onFocusOut($event)' },
})
export class ToggletipComponent {
  /** What the button is for, read by screen readers: "About delivery times". */
  readonly label = input('More information');
  /** start: opens to the right of the button · end: to the left, for buttons near the right edge. */
  readonly align = input<'start' | 'end'>('start');

  protected readonly open = signal(false);
  protected readonly popId = uniqueId('toggletip');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  close(): void {
    this.open.set(false);
  }

  protected toggle(): void {
    this.open.set(!this.open());
    // Once drawn, slide it back on screen if it runs past either edge (narrow phones).
    if (this.open()) setTimeout(() => this.keepOnScreen());
  }

  private keepOnScreen(): void {
    const tip = this.host.nativeElement.querySelector<HTMLElement>('.exos-toggletip');
    if (!tip) return;
    tip.style.translate = '';
    const rect = tip.getBoundingClientRect();
    const view = this.host.nativeElement.ownerDocument.documentElement.clientWidth;
    const gutter = 16;
    const shift = rect.right > view - gutter ? view - gutter - rect.right : rect.left < gutter ? gutter - rect.left : 0;
    if (shift) tip.style.translate = `${shift}px 0`;
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) this.close();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }
}
