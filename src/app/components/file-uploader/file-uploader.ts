import { Component, ElementRef, computed, input, model, output, signal, viewChild } from '@angular/core';
import { ProgressBarComponent } from '../loading/loading';
import { uniqueId } from '../shared/form-field';
import { StatusIconComponent } from '../shared/status-icon';

export interface UploadFile {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  /** ready: added, not sent yet · uploading · done · error. */
  status: 'ready' | 'uploading' | 'done' | 'error';
  /** 0–100 while uploading. */
  progress?: number;
  /** Why it failed, like "Over 20 MB". */
  error?: string;
  /** The file itself, for files people added (not for files that were already there). */
  file?: File;
}

/**
 * File uploader: add files, see each one's progress, and remove them.
 *
 *   <app-file-uploader label="Photos" accept="image/*" [maxSizeMb]="20" [multiple]="true"
 *                      [(files)]="files" (added)="upload($event)" />
 *
 * It checks type and size, lists the files, and emits `added` with the good ones. Sending
 * them is up to you: update each file's `status` and `progress` in `files` as it goes.
 * Web: a drop area and a button. Phones: "Take photo" (camera) and "Choose files".
 */
@Component({
  selector: 'app-file-uploader',
  imports: [ProgressBarComponent, StatusIconComponent],
  templateUrl: './file-uploader.html',
  host: { class: 'd-block' },
})
export class FileUploaderComponent {
  readonly label = input('');
  /** What people can add, in plain words: "JPG or PNG, up to 20 MB each." */
  readonly description = input('');
  /** File types, like 'image/*' or '.pdf,.docx'. */
  readonly accept = input('');
  readonly multiple = input(false);
  /** Largest file in MB. Bigger files are listed with an error and not sent. */
  readonly maxSizeMb = input<number | null>(null);
  /** Shows "Take photo" on phones, which opens the camera. Needs an image `accept`. */
  readonly camera = input(false);
  readonly disabled = input(false);

  readonly files = model<UploadFile[]>([]);
  /** The files that passed the checks, ready to send. */
  readonly added = output<UploadFile[]>();
  readonly removed = output<UploadFile>();

  protected readonly inputId = uniqueId('upload');
  protected readonly descriptionId = `${this.inputId}-description`;
  protected readonly dragging = signal(false);
  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>('picker');
  private readonly cameraPicker = viewChild<ElementRef<HTMLInputElement>>('cameraPicker');

  protected readonly buttonLabel = computed(() => (this.multiple() ? 'Choose files' : 'Choose a file'));

  protected openPicker(): void {
    this.picker().nativeElement.click();
  }

  protected openCamera(): void {
    this.cameraPicker()?.nativeElement.click();
  }

  protected onPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.add([...(input.files ?? [])]);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.disabled()) this.add([...(event.dataTransfer?.files ?? [])]);
  }

  /** Checks each file, lists it (with an error if it fails), and emits the good ones. */
  add(list: File[]): void {
    const picked = this.multiple() ? list : list.slice(0, 1);
    const items = picked.map<UploadFile>((file) => {
      const error = this.check(file);
      return { id: uniqueId('file'), name: file.name, size: file.size, status: error ? 'error' : 'ready', error, file };
    });
    if (!items.length) return;
    this.files.set(this.multiple() ? [...this.files(), ...items] : items);
    const good = items.filter((i) => i.status === 'ready');
    if (good.length) this.added.emit(good);
  }

  protected remove(item: UploadFile): void {
    this.files.set(this.files().filter((f) => f.id !== item.id));
    this.removed.emit(item);
  }

  private check(file: File): string | undefined {
    const max = this.maxSizeMb();
    if (max !== null && file.size > max * 1024 * 1024) return `Over ${max} MB. Choose a smaller file.`;
    const accept = this.accept().split(',').map((a) => a.trim().toLowerCase()).filter(Boolean);
    if (accept.length) {
      const name = file.name.toLowerCase();
      const ok = accept.some((a) =>
        a.startsWith('.') ? name.endsWith(a) : a.endsWith('/*') ? file.type.startsWith(a.slice(0, -1)) : file.type === a,
      );
      if (!ok) return 'This file type isn’t supported.';
    }
    return undefined;
  }

  protected sizeOf(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
