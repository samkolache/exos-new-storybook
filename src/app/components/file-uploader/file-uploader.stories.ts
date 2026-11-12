import { Component, input, signal } from '@angular/core';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { FileUploaderComponent, UploadFile } from './file-uploader';

const SAMPLE: UploadFile[] = [
  { id: 'a', name: 'kitchen-01.jpg', size: 2_400_000, status: 'done' },
  { id: 'b', name: 'kitchen-02.jpg', size: 3_100_000, status: 'uploading', progress: 45 },
  { id: 'c', name: 'floor-plan.pdf', size: 26_000_000, status: 'error', error: 'Over 20 MB. Choose a smaller file.' },
];

/** Docs only: an uploader that "uploads" what people add, to show progress. */
@Component({
  selector: 'app-upload-demo',
  imports: [FileUploaderComponent],
  template: `
<app-file-uploader
  label="Photos"
  description="JPG or PNG, up to 20 MB each."
  accept="image/*"
  [maxSizeMb]="20"
  [multiple]="true"
  [camera]="camera()"
  [(files)]="files"
  (added)="upload($event)"
/>`,
})
class UploadDemoComponent {
  readonly camera = input(true);
  protected readonly files = signal<UploadFile[]>([]);

  protected upload(added: UploadFile[]): void {
    for (const item of added) {
      let progress = 0;
      const timer = setInterval(() => {
        progress = Math.min(100, progress + 20);
        this.files.update((list) =>
          list.map((f) => (f.id === item.id ? { ...f, status: progress < 100 ? 'uploading' : 'done', progress } : f)),
        );
        if (progress >= 100) clearInterval(timer);
      }, 300);
    }
  }
}

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { label: '', description: '', accept: '', multiple: false, maxSizeMb: null, camera: false, disabled: false, files: [] };

const meta: Meta<FileUploaderComponent> = {
  title: 'Components/Forms/File Uploader',
  component: FileUploaderComponent,
  decorators: [moduleMetadata({ imports: [UploadDemoComponent] })],
  parameters: {
    // Accessibility checks fail the tests for the uploader (not just a warning).
    a11y: { test: 'error' },
    controls: {
      exclude: ['add', 'buttonLabel', 'cameraPicker', 'check', 'descriptionId', 'dragging', 'inputId', 'onDragOver', 'onDrop', 'onPicked', 'openCamera', 'openPicker', 'picker', 'remove', 'sizeOf'],
    },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-file-uploader',
          component: 'FileUploaderComponent',
          importPath: './components/file-uploader/file-uploader',
          defaults: DEFAULTS,
          models: ['files'],
          types: { files: 'UploadFile[]' },
          listType: 'UploadFile[]',
        }),
      },
    },
  },
  argTypes: {
    filesChange: { action: 'filesChange', table: { category: 'outputs' } },
    added: { action: 'added', table: { category: 'outputs' } },
    removed: { action: 'removed', table: { category: 'outputs' } },
    description: { description: 'What people can add, in plain words: "JPG or PNG, up to 20 MB each."' },
    accept: { description: 'File types, like "image/*" or ".pdf,.docx".' },
    maxSizeMb: { control: 'number', description: 'Largest file in MB.' },
    camera: { description: 'Shows "Take photo" on phones (opens the camera).' },
    files: { description: '`{ id, name, size, status, progress?, error? }`. Update status and progress as files upload.' },
  },
  args: {
    label: 'Photos',
    description: 'JPG or PNG, up to 20 MB each.',
    accept: 'image/*',
    multiple: true,
    maxSizeMb: 20,
    camera: true,
    disabled: false,
    files: SAMPLE,
  },
};

export default meta;
type Story = StoryObj<FileUploaderComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'File uploader' };
export const TryIt: Story = {
  name: 'Try it',
  parameters: { controls: { disable: true } },
  render: () => ({ template: `<div style="max-width: 28rem"><app-upload-demo /></div>` }),
};

// Docs

export const Overview: Story = { tags: ['!dev'], parameters: { controls: { disable: true } }, render: TryIt.render };

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    sample: SAMPLE,
    parts: [
      { n: 1, target: '.form-label', side: 'left' },
      { n: 2, target: '.form-text', side: 'left' },
      { n: 3, target: '.exos-dropzone', side: 'left', whole: true },
      { n: 4, target: '.exos-upload-item:nth-child(1) .exos-upload-status', side: 'right', whole: true },
      { n: 5, target: '.exos-upload-item:nth-child(2) .exos-progress-track', side: 'left', whole: true },
      { n: 6, target: '.exos-upload-error', side: 'left' },
      { n: 7, target: '.exos-upload-item:nth-child(3) .exos-upload-remove', side: 'right', whole: true },
    ],
  } as Story['args'],
  parameters: { controls: { disable: true }, example: true },
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="22rem">
  <app-file-uploader label="Photos" description="JPG or PNG, up to 20 MB each." accept="image/*" [multiple]="true" [files]="sample" />
</app-anatomy>` }),
};

export const VarMultiple: Story = { tags: ['!dev'], args: { files: [] } };
export const VarSingle: Story = {
  tags: ['!dev'],
  args: { label: 'Signed contract', description: 'One PDF, up to 10 MB.', accept: '.pdf', multiple: false, maxSizeMb: 10, camera: false, files: [] },
};
export const ModCamera: Story = { tags: ['!dev'], args: { files: [] } };
export const ModList: Story = { tags: ['!dev'] };
export const ModDisabled: Story = { tags: ['!dev'], args: { disabled: true, files: [] } };

export const DoSayLimits: Story = { tags: ['!dev'], args: { files: [], camera: false } };
export const DontHideLimits: Story = { tags: ['!dev'], args: { description: '', files: [], camera: false } };
export const DoSayWhyFailed: Story = {
  tags: ['!dev'],
  args: { files: [{ id: 'c', name: 'floor-plan.pdf', size: 26_000_000, status: 'error', error: 'Over 20 MB. Choose a smaller file.' }], camera: false },
};
export const DontVagueError: Story = {
  tags: ['!dev'],
  args: { files: [{ id: 'c', name: 'floor-plan.pdf', size: 26_000_000, status: 'error', error: 'Upload failed.' }], camera: false },
};

// Tests (hidden; they still run)

/** Good files are listed and emitted; too big or wrong type are listed with a reason, not emitted. */
export const TestChecks: Story = {
  tags: ['!dev'],
  name: 'Test · Checks',
  args: { files: [], added: fn() },
  play: async ({ canvasElement, args }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    const ok = new File(['x'], 'room.jpg', { type: 'image/jpeg' });
    const big = new File([new Uint8Array(21 * 1024 * 1024)], 'huge.jpg', { type: 'image/jpeg' });
    const wrong = new File(['x'], 'notes.txt', { type: 'text/plain' });
    await userEvent.upload(input, [ok, big, wrong], { applyAccept: false });
    const canvas = within(canvasElement);
    await expect(canvas.getByText('room.jpg')).toBeInTheDocument();
    await expect(canvas.getByText('Over 20 MB. Choose a smaller file.')).toBeInTheDocument();
    await expect(canvas.getByText('This file type isn’t supported.')).toBeInTheDocument();
    await expect(args.added).toHaveBeenCalledTimes(1);
    await expect((args.added as ReturnType<typeof fn>).mock.calls[0][0]).toHaveLength(1);
  },
};

/** Remove buttons say which file; removing takes it off the list. */
export const TestRemove: Story = {
  tags: ['!dev'],
  name: 'Test · Remove',
  args: { removed: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove floor-plan.pdf' }));
    await expect(canvas.queryByText('floor-plan.pdf')).toBeNull();
    await expect(args.removed).toHaveBeenCalled();
  },
};

/** The demo uploads: progress shows, then done. */
export const TestUpload: Story = {
  tags: ['!dev'],
  name: 'Test · Upload progress',
  render: TryIt.render,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, new File(['x'], 'room.jpg', { type: 'image/jpeg' }));
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('progressbar', { name: 'Uploading room.jpg' })).toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('Uploaded')).toBeInTheDocument(), { timeout: 4000 });
  },
};
