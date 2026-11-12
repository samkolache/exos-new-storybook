import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { InputComponent } from '../input/input';
import { LinkComponent } from '../link/link';
import { AnatomyComponent } from '../shared/anatomy';
import { storySource } from '../shared/story-source';
import { DefinitionTooltipComponent, ToggletipComponent, TooltipDirective } from './tooltip';
import { RedlineComponent, RedlineMark } from '../shared/redline';
import { checkSpecPicture } from '../shared/spec-check';

/** Component defaults: the code panel only prints props that differ. */
const DEFAULTS = { label: 'More information', align: 'start' };

const EXAMPLE = { controls: { disable: true }, example: true };

/** An icon button for tooltip examples (the tooltip is its visible name). */
const ICON_BUTTON = (label: string, path: string, extra = '') => `
<button type="button" class="btn btn-secondary d-inline-flex align-items-center justify-content-center p-0" style="width: 40px; height: 40px" [appTooltip]="'${label}'" aria-label="${label}" [tooltipIsLabel]="true" ${extra}>
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}" /></svg>
</button>`;
const DOWNLOAD = 'M9 2.5v9M5 8l4 4 4-4M3 15h12';
const SHARE = 'M12 6l-6 3M6 9l6 3M14 4.5a2 2 0 11-4 0 2 2 0 014 0zM6 9a2 2 0 11-4 0 2 2 0 014 0zM14 13.5a2 2 0 11-4 0 2 2 0 014 0z';
const PRINT = 'M5 7V2.5h8V7M5 13H3V7h12v6h-2M5 10.5h8v5H5z';

const meta: Meta<ToggletipComponent> = {
  title: 'Components/Tooltip',
  component: ToggletipComponent,
  decorators: [moduleMetadata({ imports: [TooltipDirective, DefinitionTooltipComponent, InputComponent, LinkComponent] })],
  parameters: {
    // Accessibility checks fail the tests for tooltips (not just a warning).
    a11y: { test: 'error' },
    controls: { exclude: ['close', 'onDocumentClick', 'onFocusOut', 'open', 'popId', 'toggle', 'keepOnScreen', 'host'] },
    docs: {
      source: {
        language: 'typescript',
        transform: storySource({
          selector: 'app-toggletip',
          component: 'ToggletipComponent',
          importPath: './components/tooltip/tooltip',
          defaults: DEFAULTS,
        }),
      },
    },
  },
  argTypes: {
    label: { description: 'What the (i) button is for, read by screen readers: "About delivery times".' },
    align: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: 'start: opens to the right · end: to the left, near the right edge.',
      table: { defaultValue: { summary: 'start' } },
    },
  },
  args: { label: 'About delivery times', align: 'start' },
  render: (args) => ({
    props: args,
    template: `<p class="mb-0 d-flex align-items-center gap-1">Delivery time <app-toggletip [label]="label" [align]="align">Orders placed before 2 pm ship the same day.</app-toggletip></p>`,
  }),
};

export default meta;
type Story = StoryObj<ToggletipComponent>;

// Playgrounds (sidebar)

export const Default: Story = { name: 'Toggletip' };
export const Tooltip: Story = {
  parameters: EXAMPLE,
  render: () => ({ template: `<div class="d-flex gap-2" style="padding-top: 48px">${ICON_BUTTON('Download', DOWNLOAD)}${ICON_BUTTON('Share', SHARE)}${ICON_BUTTON('Print', PRINT)}</div>` }),
};

// Docs: live demo

export const Overview: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div class="d-flex flex-column gap-4" style="max-width: 22rem; padding-top: 48px; min-height: 260px">
  <div class="d-flex gap-2">${ICON_BUTTON('Download', DOWNLOAD)}${ICON_BUTTON('Share', SHARE)}${ICON_BUTTON('Print', PRINT)}</div>
  <p class="mb-0">The <app-definition-tooltip definition="The price agreed when the order was placed, before any discount.">list price</app-definition-tooltip> includes tax.</p>
  <p class="mb-0 d-flex align-items-center gap-1">Delivery time <app-toggletip label="About delivery times">Orders placed before 2 pm ship the same day. <app-link href="#shipping">Shipping rates</app-link></app-toggletip></p>
</div>` }),
};

// Docs: anatomy (a tooltip shown open)

export const Anatomy: Story = {
  tags: ['!dev'],
  decorators: [moduleMetadata({ imports: [AnatomyComponent] })],
  args: {
    parts: [
      { n: 1, target: '.btn', side: 'left', whole: true },
      { n: 2, target: '.exos-tooltip-caret', side: 'right', whole: true },
      { n: 3, target: '.exos-tooltip', side: 'bottom', whole: true },
    ],
  } as Story['args'],
  parameters: EXAMPLE,
  render: (args) => ({ props: args, template: `
<app-anatomy [parts]="parts" width="14rem">
  <div class="exos-tooltip-layer d-flex justify-content-center" style="padding: 8px 0 56px">
    ${ICON_BUTTON('Download', DOWNLOAD, 'tooltipPosition="bottom" [tooltipOpen]="true"')}
  </div>
</app-anatomy>` }),
};

// Docs: one decision each

export const VarTooltip: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<div style="padding-top: 48px">${ICON_BUTTON('Download', DOWNLOAD)}</div>` }),
};
export const VarToggletip: Story = { tags: ['!dev'] };
export const VarDefinition: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<p class="mb-0" style="max-width: 24rem; min-height: 96px">The <app-definition-tooltip definition="The price agreed when the order was placed, before any discount.">list price</app-definition-tooltip> includes tax.</p>` }),
};

/** Alignment: the tooltip lines up with the start, centre or end of the element (shown open). */
export const ModAlignment: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div class="exos-tooltip-layer d-grid justify-content-center" style="grid-template-columns: repeat(3, minmax(0, 10rem)); justify-items: center; padding: 8px 0 64px">
  <div class="d-flex flex-column align-items-center gap-1"><span class="small text-body-secondary">Start</span>${ICON_BUTTON('Download', DOWNLOAD, 'tooltipPosition="bottom" tooltipAlign="start" [tooltipOpen]="true"')}</div>
  <div class="d-flex flex-column align-items-center gap-1"><span class="small text-body-secondary">Center</span>${ICON_BUTTON('Share', SHARE, 'tooltipPosition="bottom" [tooltipOpen]="true"')}</div>
  <div class="d-flex flex-column align-items-center gap-1"><span class="small text-body-secondary">End</span>${ICON_BUTTON('Print', PRINT, 'tooltipPosition="bottom" tooltipAlign="end" [tooltipOpen]="true"')}</div>
</div>` }),
};

/** Placement: top, right, bottom or left of the element (shown open). Each flips if there's no room. */
export const ModPlacement: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div class="exos-tooltip-layer d-grid justify-content-center align-items-center" style="grid-template-columns: repeat(2, 11rem); row-gap: 72px; padding: 48px 0">
  <div class="d-flex justify-content-center">${ICON_BUTTON('Top', DOWNLOAD, 'tooltipPosition="top" [tooltipOpen]="true"')}</div>
  <div class="d-flex justify-content-center">${ICON_BUTTON('Right', SHARE, 'tooltipPosition="right" [tooltipOpen]="true"')}</div>
  <div class="d-flex justify-content-center">${ICON_BUTTON('Bottom', PRINT, 'tooltipPosition="bottom" [tooltipOpen]="true"')}</div>
  <div class="d-flex justify-content-center">${ICON_BUTTON('Left', DOWNLOAD, 'tooltipPosition="left" [tooltipOpen]="true"')}</div>
</div>` }),
};
export const ModAlignEnd: Story = {
  tags: ['!dev'],
  args: { align: 'end' },
  render: (args) => ({
    props: args,
    template: `<p class="mb-0 d-flex align-items-center justify-content-end gap-1">Delivery time <app-toggletip [label]="label" [align]="align">Orders placed before 2 pm ship the same day.</app-toggletip></p>`,
  }),
};
export const ModNextToField: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div style="max-width: 20rem; min-height: 180px">
  <div class="d-flex align-items-center gap-1 mb-2"><span class="fw-medium" id="cvc-label">Security code</span><app-toggletip label="About the security code">The 3 digits on the back of your card.</app-toggletip></div>
  <app-input label="Security code" [hideLabel]="true" inputMode="numeric" autocomplete="cc-csc" [maxLength]="4" />
</div>` }),
};

// Docs: Do / Don't

export const DoTooltipForIcons: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `<div class="d-flex gap-2 justify-content-center">${ICON_BUTTON('Download', DOWNLOAD)}${ICON_BUTTON('Print', PRINT)}</div>` }),
};
export const DontTooltipEssential: Story = {
  tags: ['!dev'],
  parameters: EXAMPLE,
  render: () => ({ template: `
<div style="width: 16rem; margin: 0 auto">
  <app-input label="Password" type="password" autocomplete="new-password" appTooltip="At least 12 characters, with a number" />
</div>` }),
};
/** A toggletip drawn open, for side-by-side examples. */
const OPEN_TIP = (label: string, text: string) => `
<div style="min-height: 150px; width: 15rem; margin: 0 auto">
  <span class="d-inline-flex align-items-center gap-1">${label}
    <span class="exos-toggletip-host">
      <span class="exos-toggletip-button" style="color: var(--color-text-heading)"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4" /><path d="M8 7.2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /><circle cx="8" cy="4.9" r="0.9" fill="currentColor" /></svg></span>
      <span class="exos-toggletip-anchor"><span class="exos-toggletip">${text}</span></span>
    </span>
  </span>
</div>`;

export const DoToggletipShort: Story = {
  tags: ['!dev'],
  render: () => ({ template: OPEN_TIP('Delivery time', 'Orders before 2 pm ship the same day.') }),
};
export const DontToggletipLong: Story = {
  tags: ['!dev'],
  render: () => ({
    template: OPEN_TIP(
      'Returns',
      'You can return most items within 30 days. Items must be unused and in their box. Sale items can only be exchanged. Refunds take 5 to 10 days. Shipping isn’t refunded unless the item was damaged.',
    ),
  }),
};

// Tests (hidden; they still run)

/** Keyboard focus shows the tooltip; Esc hides it. Mouse hover shows it too. */
export const TestTooltip: Story = {
  tags: ['!dev'],
  name: 'Test · Tooltip',
  render: VarTooltip.render,
  parameters: EXAMPLE,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Download' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    const tip = canvasElement.ownerDocument.querySelector('.exos-tooltip')!;
    await waitFor(() => expect(tip).toHaveClass('is-visible'));
    await expect(tip).toHaveAttribute('role', 'tooltip');
    await userEvent.keyboard('{Escape}');
    await expect(tip).not.toHaveClass('is-visible');
  },
};

/** People can move the pointer from the element onto the tooltip to read it; it hides once the pointer leaves both. */
export const TestHoverable: Story = {
  tags: ['!dev'],
  name: 'Test · Hover onto the tooltip',
  render: VarTooltip.render,
  parameters: EXAMPLE,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Download' });
    const tip = () => canvasElement.ownerDocument.querySelector<HTMLElement>('.exos-tooltip')!;
    await userEvent.hover(button);
    await waitFor(() => expect(tip()).toHaveClass('is-visible'), { timeout: 1500 });
    // The caret is there and the tooltip says which side it's on.
    await expect(tip().querySelector('.exos-tooltip-caret')).not.toBeNull();
    await expect(tip().dataset['position']).toMatch(/top|bottom/);
    await userEvent.unhover(button);
    await userEvent.hover(tip());
    await new Promise((done) => setTimeout(done, 250));
    await expect(tip()).toHaveClass('is-visible');
    await userEvent.unhover(tip());
    await waitFor(() => expect(tip()).not.toHaveClass('is-visible'));
  },
};

/** Definition tooltip: the term is a button; a click keeps the definition open, Esc closes it. */
export const TestDefinition: Story = {
  tags: ['!dev'],
  name: 'Test · Definition tooltip',
  render: VarDefinition.render,
  parameters: EXAMPLE,
  play: async ({ canvasElement }) => {
    const term = within(canvasElement).getByRole('button', { name: 'list price' });
    const tip = canvasElement.ownerDocument.getElementById(term.getAttribute('aria-describedby')!)!;
    await expect(tip).toHaveTextContent('The price agreed when the order was placed');
    await userEvent.click(term);
    await waitFor(() => expect(tip).toHaveClass('is-visible'));
    // It opens below the term, so it never covers the line being read.
    await expect(tip.dataset['position']).toBe('bottom');
    await userEvent.keyboard('{Escape}');
    await expect(tip).not.toHaveClass('is-visible');
  },
};

/** Toggletip: opens on click or Enter, says it's expanded, closes on Esc and returns focus. */
export const TestToggletip: Story = {
  tags: ['!dev'],
  name: 'Test · Toggletip',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'About delivery times' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Orders placed before 2 pm ship the same day.')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  },
};


// Specs: the measurements drawn on a live, non-clickable example. Every number is measured from the code.
const SPEC_MARKS: RedlineMark[] = [
  { kind: 'style', target: '.exos-tooltip', prop: 'font-size', side: 'top', label: '{v} text' },
  { kind: 'style', target: '.exos-tooltip', prop: 'radius', side: 'top', label: '{v} corners' },
  { kind: 'size', target: '.exos-tooltip-caret', side: 'bottom', label: '{v} caret' },
  { kind: 'padding', target: '.exos-tooltip', label: '{v} top and bottom', labelSides: '{v} left and right' },
];

export const SpecDrawing: Story = {
  tags: ['!dev'],
  // The docs show a saved picture of this; the test checks it still matches the code.
  play: (context) => checkSpecPicture(context as never),
  decorators: [moduleMetadata({ imports: [RedlineComponent] })],
  parameters: { controls: { disable: true }, example: true, specs: { sizes: false, switches: [] } },
  render: (args) => ({
    props: { ...args, marks: SPEC_MARKS },
    template: `<app-redline [marks]="marks" [scale]="1.8" [key]="false"><span class="exos-tooltip is-visible" data-position="bottom" style="position: relative; display: inline-block; margin-top: 4px; --exos-tooltip-caret: 20px"><span class="exos-tooltip-text">Download</span><span class="exos-tooltip-caret"></span></span></app-redline>`,
  }),
};
