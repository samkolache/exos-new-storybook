import { Component, computed, input } from '@angular/core';
import { uniqueId } from '../shared/form-field';
import { StatusIconComponent } from '../shared/status-icon';

export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Spinner: something is loading and you can't say how long it will take.
 *
 *   <app-spinner label="Loading photos" />
 *   <app-spinner [overlay]="true" label="Loading report" />   (covers its container)
 */
@Component({
  selector: 'app-spinner',
  template: `
<span [class]="classes()" role="status">
  <svg class="exos-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle class="exos-spinner-track" cx="16" cy="16" r="13" />
    <circle class="exos-spinner-arc" cx="16" cy="16" r="13" />
  </svg>
  <span [class]="showLabel() ? 'exos-spinner-label' : 'visually-hidden'">{{ label() }}</span>
</span>`,
  host: { '[class.exos-spinner-overlay]': 'overlay()' },
})
export class SpinnerComponent {
  /** Read by screen readers, and shown with showLabel. Say what's loading: "Loading photos". */
  readonly label = input('Loading');
  readonly showLabel = input(false);
  /** sm 16px: in a button or row · md 32px: a section · lg 64px: a whole page. */
  readonly size = input<SpinnerSize>('md');
  /** Covers the nearest positioned container with a light layer, so it can't be used while loading. */
  readonly overlay = input(false);

  protected readonly classes = computed(() => `exos-spinner exos-spinner-${this.size()}`);
}

export type InlineLoadingStatus = 'active' | 'finished' | 'error';

/**
 * Inline loading: the progress of one action, right where people started it.
 *
 *   <app-inline-loading status="active" label="Saving…" />
 *   <app-inline-loading status="finished" label="Saved" />
 */
@Component({
  selector: 'app-inline-loading',
  imports: [StatusIconComponent],
  template: `
<span class="exos-inline-loading" [class.is-error]="status() === 'error'" role="status">
  @switch (status()) {
    @case ('finished') { <app-status-icon kind="success" [size]="16" /> }
    @case ('error') { <app-status-icon kind="error" [size]="16" /> }
    @default {
      <svg class="exos-spinner-svg exos-inline-loading-spinner" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle class="exos-spinner-track" cx="16" cy="16" r="13" />
        <circle class="exos-spinner-arc" cx="16" cy="16" r="13" />
      </svg>
    }
  }
  <span>{{ label() }}</span>
</span>`,
})
export class InlineLoadingComponent {
  readonly status = input<InlineLoadingStatus>('active');
  /** What's happening, in a few words: "Saving…", "Saved", "Couldn't save". */
  readonly label = input('Loading…');
}

/**
 * Progress bar: how far along something is, when you can measure it.
 *
 *   <app-progress-bar label="Uploading 3 photos" [value]="40" />
 *   <app-progress-bar label="Preparing report" />          (no value: indeterminate)
 */
@Component({
  selector: 'app-progress-bar',
  imports: [StatusIconComponent],
  template: `
<div class="exos-progress" [class]="'is-' + status()" [class.exos-progress-sm]="size() === 'sm'">
  <div class="exos-progress-head" [class.visually-hidden]="hideLabel()">
    <span class="exos-progress-label" [id]="labelId">{{ label() }}</span>
    @if (status() === 'finished') {
      <app-status-icon kind="success" [size]="16" />
    } @else if (status() === 'error') {
      <app-status-icon kind="error" [size]="16" />
    } @else if (value() !== null && showValue()) {
      <span class="exos-progress-value" aria-hidden="true">{{ percent() }}%</span>
    }
  </div>
  <div
    class="exos-progress-track"
    role="progressbar"
    [attr.aria-labelledby]="labelId"
    [attr.aria-describedby]="helperText() ? helpId : null"
    [attr.aria-valuemin]="value() === null ? null : 0"
    [attr.aria-valuemax]="value() === null ? null : max()"
    [attr.aria-valuenow]="value() === null ? null : shown()"
    [attr.aria-busy]="status() === 'active' || null"
  >
    <div class="exos-progress-fill" [class.is-indeterminate]="value() === null && status() === 'active'" [style.width.%]="fillWidth()"></div>
  </div>
  @if (helperText()) {
    <p class="exos-progress-helper" [id]="helpId">{{ helperText() }}</p>
  }
</div>`,
  host: { class: 'd-block' },
})
export class ProgressBarComponent {
  readonly label = input('');
  /** Leave unset (null) when you can't measure progress: the bar moves without a number. */
  readonly value = input<number | null>(null);
  readonly max = input(100);
  readonly status = input<'active' | 'finished' | 'error'>('active');
  /** A line under the bar: "2 of 5 photos", or what went wrong. */
  readonly helperText = input('');
  readonly showValue = input(true);
  /** Hides the label row on screen (screen readers still get it), e.g. a bar inside a file row. */
  readonly hideLabel = input(false);
  /** sm 4px: inside cards and rows · md 8px (default): on its own. */
  readonly size = input<'sm' | 'md'>('md');

  protected readonly labelId = uniqueId('progress-label');
  protected readonly helpId = uniqueId('progress-help');
  protected readonly shown = computed(() => Math.min(Math.max(this.value() ?? 0, 0), this.max()));
  protected readonly percent = computed(() => Math.round((this.shown() / this.max()) * 100));
  protected readonly fillWidth = computed(() => {
    if (this.status() !== 'active') return 100;
    return this.value() === null ? null : this.percent();
  });
}
