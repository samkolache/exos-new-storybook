import { Component, signal } from '@angular/core';
import { ButtonComponent } from './components/button/button';

@Component({
  selector: 'app-root',
  imports: [ButtonComponent],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly clicks = signal(0);
}
