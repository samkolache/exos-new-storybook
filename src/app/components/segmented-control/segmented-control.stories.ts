import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { SegmentItem, SegmentedControlComponent } from './segmented-control';

const SECTIONS: SegmentItem[] = [
  { label: 'Exterior', value: 'exterior', count: '4/6', countLabel: '4 of 6 photos' },
  { label: 'Interior', value: 'interior', count: '9/12', countLabel: '9 of 12 photos' },
];

const RANGES: SegmentItem[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { items: [], value: '', label: '', appearance: 'contrast', size: 'md', fullWidth: false, disabled: false };

/** The contrast look is made to sit on a colour or photo; this backdrop shows it as it's used. */
const ON_BACKDROP = (inner: string) =>
  `<div class="p-4 rounded-4" style="background: var(--color-background-subtle)">${inner}</div>`;

const TEMPLATE = `<app-segmented-control [items]="items" [(value)]="value" [label]="label" [appearance]="appearance" [size]="size" [fullWidth]="fullWidth" [disabled]="disabled" />`;

const meta: Meta<SegmentedControlComponent> = {
  title: 'Components/Segmented control',
  component: SegmentedControlComponent,
  parameters: {
    // Accessibility checks fail the tests (not just a warning).
    a11y: { test: 'error' },
    controls: { exclude: ['buttons', 'current', 'currentIndex', 'hostClasses', 'trackClasses', 'isDisabled', 'select', 'onKeydown'] },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-segmented-control',
          component: 'SegmentedControlComponent',
          importPath: './components/segmented-control/segmented-control',
          defaults: DEFAULTS,
          models: ['value'],
          types: { items: 'SegmentItem[]' },
          listType: 'SegmentItem[]',
        }),
      },
    },
  },
  argTypes: {
    valueChange: { action: 'valueChange', table: { category: 'outputs' } },
    items: { description: '`{ label, value, count?, countLabel?, disabled?, controls? }`. 2 to 5 items.' },
    value: { description: 'The picked segment. Two-way: `[(value)]`.' },
    label: { description: 'Names the control for screen readers, like "Photos". Always set one.' },
    appearance: {
      control: 'inline-radio',
      options: ['contrast', 'subtle'],
      description: 'contrast: white track, dark pick, over photos and busy screens · subtle: grey track, white pick, inside cards and toolbars.',
      table: { defaultValue: { summary: 'contrast' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm 32px · md 40px · lg 48px on web. Segments at least 44px on phones.',
      table: { defaultValue: { summary: 'md' } },
    },
    fullWidth: { description: 'Stretch across the container. Always full width on phones.', table: { defaultValue: { summary: 'false' } } },
    disabled: { description: 'Turns off the whole control. For one segment, set `disabled` on its item.', table: { defaultValue: { summary: 'false' } } },
  },
  args: { items: SECTIONS, value: 'interior', label: 'Photos', appearance: 'contrast', size: 'md', fullWidth: false, disabled: false },
  render: (args) => ({ props: args, template: ON_BACKDROP(TEMPLATE) }),
};

export default meta;
type Story = StoryObj<SegmentedControlComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Segmented control' };
export const Subtle: Story = {
  args: { items: RANGES, value: 'week', label: 'Range', appearance: 'subtle' },
  render: (args) => ({ props: args, template: TEMPLATE }),
};
export const Large: Story = { args: { size: 'lg' } };
export const Disabled: Story = { args: { disabled: true } };

// Docs: live demo. A photo gallery that switches between sections: full width on a phone, centred on web.

const GALLERY = (width: string) => `
<div class="position-relative overflow-hidden rounded-4 mx-auto" style="max-width: ${width}; aspect-ratio: 4 / 3; background: var(--color-background-subtle)">
  <p class="position-absolute top-50 start-50 translate-middle m-0 text-body-secondary">
    {{ section === 'exterior' ? 'Exterior · photo 4 of 6' : 'Interior · photo 9 of 12' }}
  </p>
  <div class="position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-center">
    <app-segmented-control label="Photos" [items]="sections" [(value)]="section" size="lg" />
  </div>
</div>`;

export const MobileExample: Story = {
  name: 'Mobile layout',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  args: { sections: SECTIONS, section: 'interior' } as Story['args'],
  render: (args) => ({ props: args, template: GALLERY('100%') }),
};

export const WebExample: Story = {
  name: 'Web layout',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  args: { sections: SECTIONS, section: 'interior' } as Story['args'],
  render: (args) => ({ props: args, template: GALLERY('40rem') }),
};

// The same layouts at their device width in the main canvas. Open these from the sidebar.

export const OnMobile: Story = {
  ...MobileExample,
  name: 'On mobile (375)',
  tags: ['!autodocs'],
  globals: { viewport: { value: 'exosMobile', isRotated: false } },
};

export const OnWeb: Story = {
  ...WebExample,
  name: 'On web (1312)',
  tags: ['!autodocs'],
  globals: { viewport: { value: 'exosDesktop', isRotated: false } },
};

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  parameters: { controls: { disable: true }, example: true },
  args: {
    parts: [
      { n: 1, target: '.exos-segmented', side: 'left', whole: true },
      { n: 2, target: '.exos-segmented-thumb', side: 'top', whole: true },
      { n: 3, target: '[aria-selected="false"] .exos-segment-label', side: 'bottom' },
      { n: 4, target: '[aria-selected="true"] .exos-segment-count', side: 'right' },
    ],
  } as Story['args'],
  render: (args) => ({ props: args, template: ON_BACKDROP(`
<app-anatomy [parts]="parts" [scale]="1.4">
  <app-segmented-control label="Photos" [items]="items" value="interior" size="lg" />
</app-anatomy>`) }),
};

// Docs: one decision each (clean code)

/** Base for the size switch: one control; the switch changes one input. */
export const Switchable: Story = { tags: ['!dev'] };

export const VarContrast: Story = { tags: ['!dev'] };
export const VarSubtle: Story = {
  tags: ['!dev'],
  args: { items: RANGES, value: 'week', label: 'Range', appearance: 'subtle' },
  render: (args) => ({ props: args, template: TEMPLATE }),
};

export const ModCount: Story = { tags: ['!dev'] };
export const ModFullWidth: Story = { tags: ['!dev'], args: { items: RANGES, value: 'week', label: 'Range', fullWidth: true } };
export const ModDisabledSegment: Story = {
  tags: ['!dev'],
  args: {
    items: [
      { label: 'Exterior', value: 'exterior', count: '4/6', countLabel: '4 of 6 photos' },
      { label: 'Interior', value: 'interior', count: '9/12', countLabel: '9 of 12 photos' },
      { label: 'Floor plan', value: 'plan', disabled: true },
    ],
    value: 'exterior',
  },
};

export const AllStates: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  args: { sections: SECTIONS, ranges: RANGES, withOff: ModDisabledSegment.args!.items } as Story['args'],
  render: (args) => ({ props: args, template: ON_BACKDROP(`
<div class="d-flex flex-column align-items-start gap-3">
  <app-segmented-control label="Photos" [items]="withOff" value="interior" />
  <app-segmented-control label="Photos" [items]="sections" value="interior" [disabled]="true" />
  <app-segmented-control label="Range" [items]="ranges" value="week" appearance="subtle" />
  <app-segmented-control label="Range" [items]="ranges" value="week" appearance="subtle" [disabled]="true" />
</div>`) }),
};

// Docs: content do's and don'ts

export const DoShortLabels: Story = { tags: ['!dev'], args: { items: RANGES, value: 'week', label: 'Range' } };
export const DontLongLabels: Story = {
  tags: ['!dev'],
  args: {
    items: [
      { label: 'Show the exterior photos', value: 'exterior' },
      { label: 'Show the interior photos', value: 'interior' },
    ],
    value: 'interior',
  },
};

export const DoFewSegments: Story = { tags: ['!dev'], args: { items: RANGES, value: 'week', label: 'Range' } };
export const DontManySegments: Story = {
  tags: ['!dev'],
  args: {
    items: ['Front', 'Back', 'Kitchen', 'Living', 'Bedroom', 'Bath', 'Garage'].map((l) => ({ label: l, value: l.toLowerCase() })),
    value: 'kitchen',
    label: 'Rooms',
    size: 'sm',
  },
};

export const DoViews: Story = { tags: ['!dev'] };
export const DontActions: Story = {
  tags: ['!dev'],
  args: {
    items: [
      { label: 'Edit', value: 'edit' },
      { label: 'Share', value: 'share' },
      { label: 'Delete', value: 'delete' },
    ],
    value: 'edit',
    label: 'Photo actions',
  },
};

// Docs: edge cases

export const EdgeLongLabel: Story = {
  tags: ['!dev'],
  args: {
    items: [
      { label: 'Exterior', value: 'exterior', count: '4/6' },
      { label: 'Interior and basement', value: 'interior', count: '9/12' },
    ],
  },
  render: (args) => ({ props: args, template: ON_BACKDROP(`<div style="width: 13rem">${TEMPLATE}</div>`) }),
};

// Tests (hidden; they still run)

/** Track 32 / 40 / 48px on web; segments at least 44px on phones. */
export const TestSizes: Story = {
  tags: ['!dev'],
  name: 'Test · Sizes',
  args: { sections: SECTIONS } as Story['args'],
  render: (args) => ({ props: args, template: `
<app-segmented-control id="sm" label="Small" [items]="sections" size="sm" />
<app-segmented-control id="md" label="Medium" [items]="sections" />
<app-segmented-control id="lg" label="Large" [items]="sections" size="lg" />` }),
  play: async ({ canvasElement }) => {
    const mobile = canvasElement.ownerDocument.defaultView!.innerWidth < 672;
    for (const [id, web] of [['sm', 32], ['md', 40], ['lg', 48]] as const) {
      const track = canvasElement.querySelector<HTMLElement>(`#${id} .exos-segmented`)!;
      const segment = track.querySelector<HTMLElement>('.exos-segment')!;
      if (mobile) await expect(segment.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      else await expect(Math.round(track.getBoundingClientRect().height)).toBe(web);
      await expect(getComputedStyle(segment).paddingLeft).toBe('16px');
    }
  },
};

/** Arrow keys move and pick, skipping disabled segments; Home and End jump; one Tab stop. */
export const TestKeyboard: Story = {
  tags: ['!dev'],
  name: 'Test · Keyboard',
  args: ModDisabledSegment.args,
  play: async ({ canvasElement }) => {
    const segments = within(canvasElement).getAllByRole('tab');
    await expect(segments.filter((s) => s.tabIndex === 0)).toHaveLength(1);
    await userEvent.tab();
    await expect(segments[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(segments[1]).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}');
    await expect(segments[0]).toHaveFocus(); // skips the disabled "Floor plan" and wraps
    await userEvent.keyboard('{End}');
    await expect(segments[1]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(segments[0]).toHaveAttribute('aria-selected', 'true');
  },
};

/** The count is read as words, and the thumb moves under the picked segment. */
export const TestClickAndCount: Story = {
  tags: ['!dev'],
  name: 'Test · Click and count',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const exterior = canvas.getByRole('tab', { name: /^Exterior\s*, 4 of 6 photos$/ });
    await expect(canvas.getByRole('tablist')).toHaveAccessibleName('Photos');
    await userEvent.click(exterior);
    await expect(exterior).toHaveAttribute('aria-selected', 'true');
    await new Promise((r) => setTimeout(r, 300)); // the thumb slides for 240ms
    const thumb = canvasElement.querySelector<HTMLElement>('.exos-segmented-thumb')!;
    await expect(Math.abs(thumb.getBoundingClientRect().left - exterior.getBoundingClientRect().left)).toBeLessThan(1);
  },
};

export const TestDisabled: Story = {
  tags: ['!dev'],
  name: 'Test · Disabled',
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    for (const segment of within(canvasElement).getAllByRole('tab')) await expect(segment).toBeDisabled();
  },
};
