import {
  Component,
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  Renderer2,
  inject,
  input,
  signal,
} from '@angular/core';
import { uniqueId } from '../shared/form-field';

export type TooltipPosition = 'top' | 'bottom';

/**
 * Tooltip: a short label that appears on hover or keyboard focus, like the name of an icon button.
 *
 *   <button appTooltip="Download" aria-label="Download">…</button>
 *
 * Touch screens have no hover, so a tooltip can't hold anything people need: on phones it's only
 * a label. For extra information people may need, use <app-toggletip>.
 */
@Directive({
  selector: '[appTooltip]',
  host: { '[attr.aria-describedby]': 'describedBy()' },
})
export class TooltipDirective implements OnDestroy {
  readonly appTooltip = input('');
  readonly tooltipPosition = input<TooltipPosition>('top');
  /** Set when the text repeats the element's name (like an icon button's aria-label), so it isn't read twice. */
  readonly tooltipIsLabel = input(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly id = uniqueId('tooltip');
  private tip: HTMLElement | null = null;
  private showTimer: ReturnType<typeof setTimeout> | undefined;

  protected describedBy(): string | null {
    return this.tooltipIsLabel() ? null : this.id;
  }

  constructor() {
    // The text is always in the page (hidden), so aria-describedby works before it shows.
    queueMicrotask(() => this.ensureTip());
  }

  private ensureTip(): HTMLElement {
    if (!this.tip) {
      this.tip = this.renderer.createElement('span');
      this.renderer.setAttribute(this.tip, 'id', this.id);
      this.renderer.setAttribute(this.tip, 'role', 'tooltip');
      this.renderer.addClass(this.tip, 'exos-tooltip');
      // Inside the themed area, so it gets the theme's colours (the body in the app).
      const themed = this.host.nativeElement.closest('.exos-theme-dcfc') ?? this.host.nativeElement.ownerDocument.body;
      this.renderer.appendChild(themed, this.tip);
    }
    this.tip!.textContent = this.appTooltip();
    return this.tip!;
  }

  /** Mouse only: a tap shouldn't leave a tooltip stuck on a touch screen. */
  @HostListener('pointerenter', ['$event'])
  protected onEnter(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => this.show(), 300);
  }

  @HostListener('focusin')
  protected onFocus(): void {
    if (this.host.nativeElement.matches(':focus-visible') || this.host.nativeElement.querySelector(':focus-visible')) this.show();
  }

  @HostListener('pointerleave')
  @HostListener('focusout')
  protected onLeave(): void {
    clearTimeout(this.showTimer);
    this.hide();
  }

  /** Esc hides it without moving focus. */
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.hide();
  }

  show(): void {
    const tip = this.ensureTip();
    if (!tip.textContent) return;
    tip.classList.add('is-visible');
    const rect = this.host.nativeElement.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const view = this.host.nativeElement.ownerDocument.documentElement;
    let below = this.tooltipPosition() === 'bottom';
    if (!below && rect.top - tipRect.height - 8 < 0) below = true;
    const top = below ? rect.bottom + 8 : rect.top - tipRect.height - 8;
    const left = Math.min(Math.max(8, rect.left + rect.width / 2 - tipRect.width / 2), view.clientWidth - tipRect.width - 8);
    tip.style.top = `${top + window.scrollY}px`;
    tip.style.left = `${left + window.scrollX}px`;
    tip.dataset['position'] = below ? 'bottom' : 'top';
  }

  hide(): void {
    this.tip?.classList.remove('is-visible');
  }

  ngOnDestroy(): void {
    clearTimeout(this.showTimer);
    this.tip?.remove();
  }
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
