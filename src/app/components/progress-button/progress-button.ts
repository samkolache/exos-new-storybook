import { Component, computed, input, output } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';

export type ProgressButtonStatus = 'pending' | 'progress' | 'complete';

@Component({
  selector: 'app-progress-button',
  imports: [LucideArrowRight],
  templateUrl: './progress-button.html',
})
export class ProgressButtonComponent {
  readonly label = input<string>('Review interior');
  readonly completed = input<number>(0);
  readonly total = input<number>(8);
  readonly disabled = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly clicked = output<MouseEvent>();

  /** Look follows the count: none done → pending, some → progress, all → complete. */
  protected readonly status = computed<ProgressButtonStatus>(() => {
    const done = this.completed();
    if (done <= 0) return 'pending';
    return done >= this.total() ? 'complete' : 'progress';
  });

  protected readonly classes = computed(() => `btn btn-progress btn-progress-${this.status()}`);
}
