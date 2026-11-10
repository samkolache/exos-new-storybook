import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ButtonVariant, buttonClasses } from '../button/button';
import { uniqueId } from '../shared/form-field';

export interface DropdownItem {
  /** 'item' (default) is clickable; 'header' and 'divider' just group the list. */
  type?: 'item' | 'header' | 'divider';
  label?: string;
  value?: string;
  disabled?: boolean;
  active?: boolean;
}

export type DropdownDirection = 'down' | 'up' | 'start' | 'end';
export type DropdownAlign = 'start' | 'end';

const WRAPPER: Record<DropdownDirection, string> = {
  down: 'dropdown',
  up: 'dropup',
  start: 'dropstart',
  end: 'dropend',
};

/**
 * Bootstrap dropdown menu (a button that opens a list of actions), driven by Angular
 * rather than Bootstrap's JS. For picking a form value, use app-select.
 */
@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.html',
  host: {
    class: 'd-inline-block',
    '(document:click)': 'onDocumentClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DropdownComponent {
  readonly label = input('Dropdown');
  readonly items = input<DropdownItem[]>([]);
  readonly variant = input<ButtonVariant>('primary');
  /** Text-only toggle, like a ghost button. */
  readonly ghost = input(false);
  readonly direction = input<DropdownDirection>('down');
  /** Which edge of the button the menu lines up with. */
  readonly align = input<DropdownAlign>('start');
  readonly dark = input(false);
  readonly disabled = input(false);

  readonly open = model(false);
  readonly itemSelected = output<DropdownItem>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggleRef');
  private readonly itemButtons = viewChildren<ElementRef<HTMLButtonElement>>('menuItem');

  protected readonly menuId = uniqueId('dropdown-menu');
  protected readonly wrapperClass = computed(() => WRAPPER[this.direction()]);
  protected readonly toggleClasses = computed(() =>
    [...buttonClasses(this.variant(), this.ghost()), 'dropdown-toggle'].join(' '),
  );
  protected readonly menuClasses = computed(() => {
    const cls = ['dropdown-menu'];
    if (this.open()) cls.push('show');
    if (this.align() === 'end') cls.push('dropdown-menu-end');
    return cls.join(' ');
  });

  protected toggle(): void {
    if (this.disabled()) return;
    if (this.open()) this.close(false);
    else this.show();
  }

  protected select(item: DropdownItem): void {
    if (item.disabled) return;
    this.itemSelected.emit(item);
    this.close(true);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const items = this.enabledItems();
    const current = items.indexOf(document.activeElement as HTMLButtonElement);

    switch (event.key) {
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.close(true);
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        if (!this.open()) {
          this.show(step === 1 ? 'first' : 'last');
        } else if (items.length) {
          const next = current === -1 ? (step === 1 ? 0 : items.length - 1) : (current + step + items.length) % items.length;
          items[next].focus();
        }
        break;
      }
      case 'Home':
      case 'End':
        if (this.open() && items.length) {
          event.preventDefault();
          items[event.key === 'Home' ? 0 : items.length - 1].focus();
        }
        break;
      case 'Tab':
        if (this.open()) this.close(false);
        break;
    }
  }

  private show(focus?: 'first' | 'last'): void {
    this.open.set(true);
    if (!focus) return;
    afterNextRender(
      () => {
        const items = this.enabledItems();
        items[focus === 'first' ? 0 : items.length - 1]?.focus();
      },
      { injector: this.injector },
    );
  }

  private close(refocus: boolean): void {
    this.open.set(false);
    if (refocus) this.toggleButton().nativeElement.focus();
  }

  private enabledItems(): HTMLButtonElement[] {
    return this.itemButtons()
      .map((ref) => ref.nativeElement)
      .filter((el) => !el.disabled);
  }
}
