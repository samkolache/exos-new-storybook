import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { TagComponent } from './tag';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { label: 'Tag', color: 'neutral', size: 'md', icon: 'none', ai: false, disabled: false };

const ICONS = ['none', 'sparkle', 'voice', 'records', 'calendar', 'note', 'dot', 'conflict', 'camera', 'skip', 'lock', 'flag'];

const meta: Meta<TagComponent> = {
  title: 'Components/Tag',
  component: TagComponent,
  parameters: {
    // Accessibility checks fail the tests for tags (not just a warning).
    a11y: { test: 'error' },
    // Internal members: keep the API table to real inputs and outputs.
    controls: { exclude: ['classes', 'iconSize', 'resolvedIcon', 'title'] },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-tag',
          component: 'TagComponent',
          importPath: './components/tag/tag',
          defaults: DEFAULTS,
        }),
      },
    },
  },
  argTypes: {
    label: { control: 'text', table: { defaultValue: { summary: 'Tag' } } },
    color: {
      control: 'inline-radio',
      options: ['neutral', 'blue', 'attention', 'info'],
      description: 'neutral: grey · blue: AI · attention: orange · info: light blue.',
      table: { defaultValue: { summary: 'neutral' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'sm 16px · md 20px (the Figma tag) · lg 26px.',
      table: { defaultValue: { summary: 'md' } },
    },
    icon: { control: 'select', options: ICONS, description: 'Leading icon.', table: { defaultValue: { summary: 'none' } } },
    ai: {
      control: 'boolean',
      description: 'AI-sourced: blue with a sparkle (an icon you pass still wins).',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Greyed out, whatever the colour.',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { label: 'From order' },
};

export default meta;
type Story = StoryObj<TagComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Tag' };
export const WithIcon: Story = { args: { icon: 'calendar' } };
export const AI: Story = { name: 'AI', args: { label: 'Photos', ai: true } };
export const Disabled: Story = { args: { label: 'Skipped', icon: 'skip', disabled: true } };

// Docs: live demo (general set of tags)

export const Overview: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-wrap gap-2">
  <app-tag label="Photos" [ai]="true" />
  <app-tag label="From order" icon="calendar" />
  <app-tag label="Needs your input" color="attention" icon="dot" />
  <app-tag label="Waiting on photo" color="info" icon="camera" />
  <app-tag label="Skipped" icon="skip" [disabled]="true" />
</div>` }),
};

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  parameters: { controls: { disable: true }, example: true },
  args: {
    parts: [
      { n: 1, target: '.exos-tag', side: 'left', whole: true },
      { n: 2, target: '.exos-tag img', side: 'bottom', whole: true },
      { n: 3, target: '.exos-tag-label', side: 'top' },
    ],
  } as Story['args'],
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" [scale]="2">
  <app-tag label="From order" icon="calendar" size="lg" />
</app-anatomy>` }),
};

// Docs: one decision each (clean code)

/** Base for the colour and size switches: one tag; the switch changes one input. */
export const Switchable: Story = { tags: ['!dev'], args: { label: 'From order', icon: 'calendar' } };

export const ModIcon: Story = { tags: ['!dev'], args: { label: 'From order', icon: 'calendar' } };
export const ModAI: Story = { tags: ['!dev'], args: { label: 'Photos', ai: true } };
export const ModDisabled: Story = { tags: ['!dev'], args: { label: 'Skipped', icon: 'skip', disabled: true } };

// Docs: visual references (no code)

export const AllColors: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-grid gap-3" style="grid-template-columns: 6rem repeat(4, max-content); align-items: center">
  <span></span>
  <span class="small text-body-secondary">Neutral</span>
  <span class="small text-body-secondary">Blue</span>
  <span class="small text-body-secondary">Attention</span>
  <span class="small text-body-secondary">Info</span>
  <span class="small text-body-secondary">Default</span>
  <app-tag label="From order" icon="calendar" />
  <app-tag label="Photos" color="blue" icon="sparkle" />
  <app-tag label="Client note" color="attention" icon="note" />
  <app-tag label="Waiting on photo" color="info" icon="camera" />
  <span class="small text-body-secondary">Disabled</span>
  <app-tag label="From order" icon="calendar" [disabled]="true" />
  <app-tag label="Photos" color="blue" icon="sparkle" [disabled]="true" />
  <app-tag label="Client note" color="attention" icon="note" [disabled]="true" />
  <app-tag label="Waiting on photo" color="info" icon="camera" [disabled]="true" />
</div>` }),
};

export const IconSet: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-wrap gap-2">
  <app-tag label="sparkle" icon="sparkle" />
  <app-tag label="voice" icon="voice" />
  <app-tag label="records" icon="records" />
  <app-tag label="calendar" icon="calendar" />
  <app-tag label="note" icon="note" />
  <app-tag label="dot" icon="dot" />
  <app-tag label="conflict" icon="conflict" />
  <app-tag label="camera" icon="camera" />
  <app-tag label="skip" icon="skip" />
  <app-tag label="lock" icon="lock" />
  <app-tag label="flag" icon="flag" />
</div>` }),
};

export const FigmaSourceTags: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <div class="d-flex flex-wrap gap-2">
    <app-tag label="Photos" [ai]="true" />
    <app-tag label="Voice" [ai]="true" icon="voice" />
    <app-tag label="From property records" icon="records" />
  </div>
  <div class="d-flex flex-wrap gap-2">
    <app-tag label="From order" icon="calendar" />
    <app-tag label="Client note" color="attention" icon="note" />
    <app-tag label="Needs your input" color="attention" icon="dot" />
    <app-tag label="Sources disagree" color="attention" icon="conflict" />
  </div>
  <div class="d-flex flex-wrap gap-2">
    <app-tag label="Waiting on photo" color="info" icon="camera" />
    <app-tag label="Skipped" icon="skip" [disabled]="true" />
    <app-tag label="Set by system" icon="lock" [disabled]="true" />
    <app-tag label="Final check" icon="flag" />
  </div>
</div>` }),
};

// Docs: Do / Don't

export const DoShortLabel: Story = { tags: ['!dev'], render: () => ({ template: `<app-tag label="Waiting on photo" color="info" icon="camera" />` }) };
export const DontSentence: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div style="max-width: 260px; margin: 0 auto"><app-tag label="We are still waiting for the exterior photo to be taken" color="info" icon="camera" /></div>` }),
};
export const DoAttentionSparingly: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="d-flex flex-wrap gap-2 justify-content-center"><app-tag label="From order" icon="calendar" /><app-tag label="Needs your input" color="attention" icon="dot" /><app-tag label="Photos" [ai]="true" /></div>` }),
};
export const DontAllAttention: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="d-flex flex-wrap gap-2 justify-content-center"><app-tag label="From order" color="attention" icon="calendar" /><app-tag label="Needs your input" color="attention" icon="dot" /><app-tag label="Photos" color="attention" /></div>` }),
};
export const DoOneTag: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="d-flex align-items-center gap-2 justify-content-center"><span>Gated community</span><app-tag label="From property records" icon="records" /></div>` }),
};
export const DontManyTags: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="d-flex flex-wrap align-items-center gap-2 justify-content-center"><span>Gated community</span><app-tag label="Records" icon="records" /><app-tag label="Photos" [ai]="true" /><app-tag label="Order" icon="calendar" /><app-tag label="Final check" icon="flag" /></div>` }),
};

// Docs: edge cases

export const EdgeLongLabel: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div style="width: 160px"><app-tag label="From the client's note on the order" icon="note" color="attention" /></div>` }),
};
export const EdgeWrap: Story = {
  tags: ['!dev'],
  render: () => ({ template: `<div class="d-flex flex-wrap gap-1" style="width: 190px"><app-tag label="Photos" [ai]="true" size="sm" /><app-tag label="From order" icon="calendar" size="sm" /><app-tag label="Needs your input" color="attention" icon="dot" size="sm" /></div>` }),
};
export const EdgeNoIcon: Story = { tags: ['!dev'], args: { label: 'Draft' } };

// Tests (hidden; they still run)

/** Sizes are 16 / 20 / 26px tall. */
export const TestSizes: Story = {
  tags: ['!dev'],
  name: 'Test · Sizes',
  render: () => ({ template: `<app-tag id="sm" size="sm" label="Small" /><app-tag id="md" label="Medium" /><app-tag id="lg" size="lg" label="Large" />` }),
  play: async ({ canvasElement }) => {
    for (const [id, h] of [['sm', 16], ['md', 20], ['lg', 26]] as const) {
      const tag = canvasElement.querySelector<HTMLElement>(`#${id} .exos-tag`)!;
      await expect(Math.round(tag.getBoundingClientRect().height)).toBe(h);
    }
  },
};

/** Long labels end in an ellipsis inside a narrow column, with the full text as a tooltip. */
export const TestLongLabel: Story = {
  tags: ['!dev'],
  name: 'Test · Long label',
  render: () => ({ template: `<div style="width: 140px"><app-tag label="From the client's note on the order" icon="note" /></div>` }),
  play: async ({ canvasElement }) => {
    const tag = canvasElement.querySelector<HTMLElement>('.exos-tag')!;
    const label = tag.querySelector<HTMLElement>('.exos-tag-label')!;
    await expect(tag.getBoundingClientRect().width).toBeLessThanOrEqual(140);
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(tag).toHaveAttribute('title', "From the client's note on the order");
  },
};

/** What a screen reader reads: the AI icon is announced, decorative icons are not. */
export const TestScreenReader: Story = {
  tags: ['!dev'],
  name: 'Test · Screen reader text',
  render: () => ({ template: `<app-tag id="ai" label="Photos" [ai]="true" /><app-tag id="order" label="From order" icon="calendar" />` }),
  play: async ({ canvasElement }) => {
    const ai = within(canvasElement.querySelector<HTMLElement>('#ai')!);
    await expect(ai.getByAltText('AI')).toBeInTheDocument();
    await expect(canvasElement.querySelector('#order img')).toHaveAttribute('alt', '');
    await expect(canvasElement.querySelector('#order')!.textContent!.trim()).toBe('From order');
  },
};
