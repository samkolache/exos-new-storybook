import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { LinkComponent } from './link';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { href: '', standalone: false, external: false, size: 'md', disabled: false };

/** Every example is a template, since a link's text goes between its tags. */
const EXAMPLE = { controls: { disable: true }, example: true };

const meta: Meta<LinkComponent> = {
  title: 'Components/Link',
  component: LinkComponent,
  parameters: {
    // Accessibility checks fail the tests for links (not just a warning).
    a11y: { test: 'error' },
    controls: { exclude: ['classes'] },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({ selector: 'app-link', component: 'LinkComponent', importPath: './components/link/link', defaults: DEFAULTS }),
      },
    },
  },
  argTypes: {
    href: { description: 'Where it goes.' },
    standalone: { description: 'On its own, not in a sentence: no underline until hover, 44px tap area on phones.' },
    external: { description: 'Opens in a new tab, with an icon, and says so to screen readers.' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Standalone only: sm 14px · md 16px · lg 18px. Inline links match their text.',
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: { description: 'Not available right now. Not clickable or reachable with Tab.' },
  },
  args: { href: '#help', standalone: false, external: false, size: 'md', disabled: false },
  render: (args) => ({ props: args, template: `<app-link [href]="href" [standalone]="standalone" [external]="external" [size]="size" [disabled]="disabled">Get help</app-link>` }),
};

export default meta;
type Story = StoryObj<LinkComponent>;

// Playground (sidebar)

export const Default: Story = { name: 'Link', args: { standalone: true } };

// Docs: live demo

export const Overview: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div style="max-width: 32rem">
  <p>By placing your order you agree to the <app-link href="#terms">terms of service</app-link> and the <app-link href="#privacy">privacy policy</app-link>.</p>
  <div class="d-flex flex-wrap gap-4">
    <app-link href="#orders" [standalone]="true">View your orders</app-link>
    <app-link href="https://example.com" [standalone]="true" [external]="true">Shipping rates</app-link>
  </div>
</div>` }),
};

// Docs: anatomy

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    parts: [
      { n: 1, target: 'a', side: 'top' },
      { n: 2, target: 'a', side: 'bottom', whole: true },
      { n: 3, target: '.exos-link-icon', side: 'right', whole: true },
    ],
  } as Story['args'],
  parameters: EXAMPLE,
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" [scale]="1.6">
  <app-link href="https://example.com" [external]="true">Shipping rates</app-link>
</app-anatomy>` }),
};

// Docs: one decision each

export const VarInline: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<p class="mb-0">Read the <app-link href="#terms">terms of service</app-link> before you order.</p>` }),
};
export const VarStandalone: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<app-link href="#orders" [standalone]="true">View your orders</app-link>` }),
};
export const SizeSwitchable: Story = { tags: ['!dev'], args: { standalone: true } };
export const ModExternal: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<app-link href="https://example.com" [standalone]="true" [external]="true">Shipping rates</app-link>` }),
};
export const ModDisabled: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<app-link href="#download" [standalone]="true" [disabled]="true">Download invoice</app-link>` }),
};

// Docs: states (visual reference)

export const AllStates: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div class="d-grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr))">
  <div><p class="small text-body-secondary mb-1">Default</p><app-link href="#a">Inline link</app-link></div>
  <div><p class="small text-body-secondary mb-1">Standalone</p><app-link href="#b" [standalone]="true">Standalone link</app-link></div>
  <div><p class="small text-body-secondary mb-1">External</p><app-link href="https://example.com" [external]="true">External link</app-link></div>
  <div><p class="small text-body-secondary mb-1">Disabled</p><app-link href="#c" [disabled]="true">Disabled link</app-link></div>
</div>` }),
};

// Docs: Do / Don't

export const DoDescriptive: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<p class="mb-0 text-center">See our <app-link href="#returns">return policy</app-link>.</p>` }),
};
export const DontClickHere: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<p class="mb-0 text-center">For our return policy, <app-link href="#returns">click here</app-link>.</p>` }),
};
export const DoLinkToGo: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<div class="text-center"><app-link href="#orders" [standalone]="true">View your orders</app-link></div>` }),
};
export const DontLinkToAct: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<div class="text-center"><app-link href="#" [standalone]="true">Delete order</app-link></div>` }),
};

// Docs: edge cases

export const EdgeLongLink: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<p class="mb-0" style="width: 200px">Read <app-link href="#guide">the complete guide to returning items you bought online</app-link>.</p>` }),
};
export const EdgeNextToText: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<p class="mb-0">Questions? <app-link href="#contact">Contact us</app-link> or <app-link href="#faq">read the FAQ</app-link>.</p>` }),
};

// Tests (hidden; they still run)

/** External links open safely in a new tab and say so. */
export const TestExternal: Story = {
  tags: ['!dev'],
  name: 'Test · External',
  args: ModExternal.args,
  render: ModExternal.render,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Shipping rates (opens in a new tab)' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

/** Disabled links aren't links any more: no href, not focusable, announced as unavailable. */
export const TestDisabled: Story = {
  tags: ['!dev'],
  name: 'Test · Disabled',
  render: ModDisabled.render,
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Download invoice' });
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).not.toHaveAttribute('href');
    await expect(link.tabIndex).toBe(-1);
  },
};

/** Standalone links are at least 44px tall on phones. */
export const TestTapArea: Story = {
  tags: ['!dev'],
  name: 'Test · Tap area',
  render: VarStandalone.render,
  play: async ({ canvasElement }) => {
    const mobile = canvasElement.ownerDocument.defaultView!.innerWidth < 672;
    const link = within(canvasElement).getByRole('link', { name: 'View your orders' });
    if (mobile) await expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    else await expect(link.getBoundingClientRect().height).toBeLessThan(44);
  },
};
