import type { Meta, StoryObj } from '@storybook/angular-vite';
import { storySource } from '../shared/story-source';
import { TagComponent } from './tag';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { label: 'Tag', color: 'neutral', size: 'md', icon: 'none', ai: false, disabled: false };

const ICONS = ['none', 'sparkle', 'voice', 'records', 'calendar', 'note', 'dot', 'conflict', 'camera', 'skip', 'lock', 'flag'];

const meta: Meta<TagComponent> = {
  title: 'Components/Tag',
  component: TagComponent,
  parameters: {
    // Internal members: keep the API table to real inputs and outputs.
    controls: { exclude: ['classes', 'iconSize', 'resolvedIcon'] },
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
      description: 'Bootstrap sizes. md is the Figma tag.',
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

// Building blocks
export const Default: Story = {};
export const WithIcon: Story = { args: { icon: 'calendar' } };
export const AI: Story = { name: 'AI', args: { label: 'Photos', ai: true } };
export const Disabled: Story = { args: { label: 'Skipped', icon: 'skip', disabled: true } };
export const Attention: Story = { args: { label: 'Needs your input', color: 'attention', icon: 'dot' } };
export const Info: Story = { args: { label: 'Waiting on photo', color: 'info', icon: 'camera' } };

export const Small: Story = { args: { icon: 'calendar', size: 'sm' } };
export const Large: Story = { args: { icon: 'calendar', size: 'lg' } };

/** sm, md (Figma) and lg side by side, across tag kinds. */
export const Sizes: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  @for (size of ['sm', 'md', 'lg']; track size) {
    <div class="d-flex flex-wrap align-items-center gap-2">
      <code class="small" style="width: 2rem">{{ size }}</code>
      <app-tag label="Neutral" [size]="size" />
      <app-tag label="From order" icon="calendar" [size]="size" />
      <app-tag label="Photos" [ai]="true" [size]="size" />
      <app-tag label="Needs your input" color="attention" icon="dot" [size]="size" />
      <app-tag label="Waiting on photo" color="info" icon="camera" [size]="size" />
      <app-tag label="Skipped" icon="skip" [disabled]="true" [size]="size" />
    </div>
  }
</div>` }),
};

/** Every colour, with and without an icon, plus disabled. */
export const Colors: Story = {
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-column gap-3">
  <div class="d-flex flex-wrap gap-2">
    <app-tag label="Neutral" />
    <app-tag label="Blue" color="blue" />
    <app-tag label="Attention" color="attention" />
    <app-tag label="Info" color="info" />
  </div>
  <div class="d-flex flex-wrap gap-2">
    <app-tag label="Neutral" icon="records" />
    <app-tag label="Blue" color="blue" icon="sparkle" />
    <app-tag label="Attention" color="attention" icon="note" />
    <app-tag label="Info" color="info" icon="camera" />
  </div>
  <div class="d-flex flex-wrap gap-2">
    <app-tag label="Neutral" icon="records" [disabled]="true" />
    <app-tag label="Blue" color="blue" icon="sparkle" [disabled]="true" />
    <app-tag label="Attention" color="attention" icon="note" [disabled]="true" />
    <app-tag label="Info" color="info" icon="camera" [disabled]="true" />
  </div>
</div>` }),
};

/** Every icon. */
export const Icons: Story = {
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

// Examples
/** AI tags: where the AI got the answer. */
export const ExampleAITags: Story = {
  name: 'Example · AI tags',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-wrap gap-2">
  <app-tag label="Photos" [ai]="true" />
  <app-tag label="Voice" [ai]="true" icon="voice" />
  <app-tag label="3 photos" [ai]="true" />
</div>` }),
};

/** Disabled tags: answers nobody needs to act on. */
export const ExampleDisabledTags: Story = {
  name: 'Example · Disabled tags',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-wrap gap-2">
  <app-tag label="Skipped" icon="skip" [disabled]="true" />
  <app-tag label="Set by system" icon="lock" [disabled]="true" />
  <app-tag label="Not applicable" [disabled]="true" />
</div>` }),
};

/** Coloured tags with icons: status that needs (or doesn't need) attention. */
export const ExampleStatusTags: Story = {
  name: 'Example · Status tags',
  tags: ['!dev'],
  parameters: { controls: { disable: true }, example: true },
  render: () => ({ template: `
<div class="d-flex flex-wrap gap-2">
  <app-tag label="From property records" icon="records" />
  <app-tag label="From order" icon="calendar" />
  <app-tag label="Final check" icon="flag" />
  <app-tag label="Client note" color="attention" icon="note" />
  <app-tag label="Needs your input" color="attention" icon="dot" />
  <app-tag label="Sources disagree" color="attention" icon="conflict" />
  <app-tag label="Waiting on photo" color="info" icon="camera" />
</div>` }),
};

/** The Figma "Review / Source tag" set, laid out like the frame. */
export const ExampleFigmaSourceTags: Story = {
  name: 'Example · Figma source tags',
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
