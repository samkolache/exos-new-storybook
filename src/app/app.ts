import { Component, signal } from '@angular/core';
import { ButtonComponent } from './components/button/button';
import { ChipComponent, ChipGroupValue, ChipOption } from './components/chip/chip';
import { DropdownComponent, DropdownItem } from './components/dropdown/dropdown';
import { DropdownCardComponent, DropdownCardRow } from './components/dropdown-card/dropdown-card';
import { InputComponent } from './components/input/input';
import { RadioGroupComponent, RadioOption } from './components/radio-group/radio-group';
import { SelectComponent, SelectOption } from './components/select/select';
import { TagComponent } from './components/tag/tag';

@Component({
  selector: 'app-root',
  imports: [ButtonComponent, ChipComponent, DropdownComponent, DropdownCardComponent, InputComponent, RadioGroupComponent, SelectComponent, TagComponent],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly clicks = signal(0);
  protected readonly room = signal('');
  protected readonly view = signal('');
  protected readonly section = signal<string | null>('interior');
  protected readonly lastAction = signal('');
  protected readonly condition = signal<ChipGroupValue>('average');
  protected readonly conditions: ChipOption[] = [
    { label: 'Good', value: 'good' },
    { label: 'Average', value: 'average', suggested: true },
    { label: 'Fair', value: 'fair' },
    { label: 'Poor', value: 'poor' },
  ];

  protected readonly rooms: SelectOption[] = [
    { label: 'Living room', value: 'living' },
    { label: 'Kitchen', value: 'kitchen' },
    { label: 'Bathroom', value: 'bath' },
  ];
  protected readonly sections: RadioOption[] = [
    { label: 'Interior', value: 'interior' },
    { label: 'Exterior', value: 'exterior' },
  ];
  protected readonly property: DropdownCardRow[] = [
    { label: 'Gated community', value: 'No' },
    { label: 'For-sale sign', value: 'No' },
    { label: 'Homes for sale on street', value: '0' },
    { label: 'Bathrooms', value: '3' },
  ];
  protected readonly actions: DropdownItem[] = [
    { label: 'Edit photo', value: 'edit' },
    { label: 'Move to…', value: 'move' },
    { type: 'divider' },
    { label: 'Delete photo', value: 'delete' },
  ];
}
