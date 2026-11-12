import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { DiagramBlock, GridDiagramComponent } from './grid-diagram';

/** Demo-only styling so the columns are visible. Not part of the grid. */
const DEMO_STYLES = [
  `
  .demo-label { font-size: 13px; color: var(--color-text-secondary, #5B6475); margin-bottom: 12px; }
  .demo-cell {
    background: var(--primitive-blue-50, #EDF5FF);
    border: 1px dashed var(--primitive-blue-500, #438AF5);
    border-radius: 8px;
    padding: 12px 8px;
    font-size: 12px;
    text-align: center;
    color: var(--primitive-ink-900, #3A3F4A);
  }
  .demo-block { min-height: 96px; display: flex; align-items: center; justify-content: center; }
  `,
];

/** Diagram styles: app frames, the breakpoint ruler and side-by-side figures. */
const FIGURE_STYLES = [
  `
  .fig-pair { display: grid; grid-template-columns: minmax(0, 13rem) minmax(0, 1fr); gap: 24px; align-items: start; }
  @media (max-width: 640px) { .fig-pair { grid-template-columns: minmax(0, 1fr); } }
  .fig-title { margin: 0 0 8px; font: 600 12px/1.3 Geist, system-ui, sans-serif; letter-spacing: .04em; text-transform: uppercase; color: #5b6475; }
  .fig-stack { display: flex; flex-direction: column; gap: 20px; }

  .app { display: grid; border: 1px solid #c3cad6; border-radius: 10px; overflow: hidden; background: #fff; font: 600 11px/1.2 Geist, system-ui, sans-serif; color: #3a3f4a; }
  .app-web { grid-template: 36px 1fr / 120px 1fr 150px; height: 230px; }
  .app-phone { grid-template: 36px 1fr 44px / 1fr; height: 300px; }
  .app > * { display: flex; align-items: center; justify-content: center; }
  .app-top { grid-column: 1 / -1; background: #eef1f6; border-bottom: 1px solid #dde2ea; }
  .app-nav { background: #f6f7f9; border-right: 1px solid #dde2ea; }
  .app-panel { background: #f6f7f9; border-left: 1px solid #dde2ea; }
  .app-bottom { background: #f6f7f9; border-top: 1px solid #dde2ea; }
  .app-main { position: relative; padding: 0 var(--m); }
  .app-main::before { content: ""; position: absolute; inset: 0 var(--m); background: repeating-linear-gradient(90deg, rgba(67,138,245,.14) 0 var(--c), transparent var(--c) calc(var(--c) + var(--g))); }
  .app-main::after { content: "Grid"; position: relative; padding: 4px 8px; border-radius: 6px; background: #2160d4; color: #fff; }

  .ruler { display: flex; height: 64px; border: 1px solid #c3cad6; border-radius: 10px; overflow: hidden; font: 11px/1.3 Geist, system-ui, sans-serif; }
  .ruler > div { display: flex; flex-direction: column; justify-content: center; padding: 0 10px; border-right: 1px solid #fff; color: #0f121a; min-width: 0; }
  .ruler b { font-weight: 600; }
  .ruler .r-phone { background: rgba(232,62,140,.16); }
  .ruler .r-tablet { background: rgba(242,140,40,.18); }
  .ruler .r-web { background: rgba(67,138,245,.16); }
  .ruler-scale { display: flex; margin-top: 4px; font: 11px Geist, system-ui, sans-serif; color: #5b6475; }
  .ruler-scale span { flex-basis: 0; }

  .card-demo { border: 1px solid #c3cad6; border-radius: 12px; padding: 16px; background: #fff; display: flex; flex-direction: column; gap: 8px; font: 13px/1.4 Geist, system-ui, sans-serif; }
  .card-demo .bar { height: 10px; border-radius: 5px; background: #dde2ea; }
  .card-demo .btns { display: flex; gap: 8px; margin-top: 4px; }
  .card-demo .btns span { height: 24px; width: 64px; border-radius: 12px; background: #438af5; }
  .card-demo .btns span + span { background: #dde2ea; }
  `,
];

/** Shows which grid is active at the current width. */
const CURRENT = `<p class="demo-label">
  <span class="d-md-none">Mobile: 4 columns, 16px margin, 16px gutter</span>
  <span class="d-none d-md-inline d-lg-none">Tablet: 8 columns, 24px margin, 16px gutter</span>
  <span class="d-none d-lg-inline">Web: 16 columns, 32px margin, 32px gutter</span>
</p>`;

const COLUMNS = Array.from({ length: 16 }, (_, i) => i + 1)
  .map((n) => {
    // Only the first 4 show on mobile and the first 8 on tablet.
    const hide = n > 8 ? 'd-none d-lg-block' : n > 4 ? 'd-none d-md-block' : '';
    return `<div class="exos-col-1 demo-cell ${hide}">${n}</div>`;
  })
  .join('\n  ');

/** Real screen sizes the diagrams are drawn at. */
const PHONE = { width: 375, columns: 4, margin: 16, gutter: 16, ratio: '375 / 300' };
const WEB = { width: 1312, columns: 16, margin: 32, gutter: 32, ratio: '1312 / 380' };

const meta: Meta = {
  title: 'Foundations/Grid',
  decorators: [moduleMetadata({ imports: [GridDiagramComponent] })],
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
};

export default meta;
type Story = StoryObj;

// Playgrounds (sidebar)

/** The column grid. Resize the viewport to see it switch between 4, 8 and 16 columns. */
export const Columns: Story = {
  render: () => ({
    styles: DEMO_STYLES,
    template: `${CURRENT}
<div class="exos-grid">
  ${COLUMNS}
</div>`,
  }),
};

/** A typical page: main content and a side panel. Stacks on mobile, sits side by side on wider screens. */
export const PageLayout: Story = {
  render: () => ({
    styles: DEMO_STYLES,
    template: `${CURRENT}
<div class="exos-grid">
  <div class="demo-cell demo-block">Header (full width)</div>
  <div class="exos-col-4 exos-col-md-5 exos-col-lg-11 demo-cell demo-block">Main content</div>
  <div class="exos-col-4 exos-col-md-3 exos-col-lg-5 demo-cell demo-block">Side panel</div>
</div>`,
  }),
};

/** Cards: 1 per row on mobile, 2 on tablet, 4 on web. */
export const Cards: Story = {
  render: () => ({
    styles: DEMO_STYLES,
    template: `${CURRENT}
<div class="exos-grid">
  ${[1, 2, 3, 4, 5, 6, 7, 8]
    .map((n) => `<div class="exos-col-4 exos-col-md-4 exos-col-lg-4 demo-cell demo-block">Card ${n}</div>`)
    .join('\n  ')}
</div>`,
  }),
};

/** A centred reading column: 10 of 16 on the web, the full width on phones. */
export const Centered: Story = {
  render: () => ({
    styles: DEMO_STYLES,
    template: `${CURRENT}
<div class="exos-grid">
  <div class="exos-col-lg-10 exos-col-lg-offset-3 demo-cell demo-block">Article (10 of 16, centred)</div>
</div>`,
  }),
};

// The page layout locked to each device width. Open these from the sidebar:
// viewport sizes only apply on the story canvas, not on the docs page.

export const OnMobile: Story = {
  ...PageLayout,
  name: 'On mobile (375)',
  tags: ['!autodocs'],
  globals: { viewport: { value: 'exosMobile', isRotated: false } },
};

export const OnTablet: Story = {
  ...PageLayout,
  name: 'On tablet (768)',
  tags: ['!autodocs'],
  globals: { viewport: { value: 'exosTablet', isRotated: false } },
};

export const OnWeb: Story = {
  ...PageLayout,
  name: 'On web (1312)',
  tags: ['!autodocs'],
  globals: { viewport: { value: 'exosDesktop', isRotated: false } },
};

// Docs: diagrams (drawn to scale from the real numbers)

const pair = (phone: string, web: string) => `
<div class="fig-pair">
  <div><p class="fig-title">Phone · 375px</p>${phone}</div>
  <div><p class="fig-title">Web · 1312px</p>${web}</div>
</div>`;

const diagram = (d: typeof PHONE, blocks: DiagramBlock[][], extra = '') =>
  `<app-grid-diagram [width]="${d.width}" [columns]="${d.columns}" [margin]="${d.margin}" [gutter]="${d.gutter}" ratio="${d.ratio}" [blocks]='${JSON.stringify(blocks)}' ${extra} />`;

/** Where the grid sits: inside the main area, not under navigation or panels. */
export const AppAnatomy: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: pair(
      `<div class="app app-phone"><div class="app-top">Top bar</div><div class="app-main" style="--m: 6%; --c: 21%; --g: 4.6%"></div><div class="app-bottom">Tab bar</div></div>`,
      `<div class="app app-web"><div class="app-top">Top bar</div><div class="app-nav">Side nav</div><div class="app-main" style="--m: 3%; --c: 4.2%; --g: 1.9%"></div><div class="app-panel">Panel</div></div>`,
    ),
  }),
};

/** Columns, gutters and margins, labelled. */
export const Basics: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: pair(diagram(PHONE, [], '[labels]="true"'), diagram(WEB, [], '[labels]="true"')),
  }),
};

/** Blocks span whole columns. */
export const Spans: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: pair(
      diagram(PHONE, [[{ start: 1, span: 4 }], [{ start: 1, span: 2 }, { start: 3, span: 2 }], [{ start: 1, span: 1 }, { start: 2, span: 3 }]]),
      diagram(WEB, [
        [{ start: 1, span: 16 }],
        [{ start: 1, span: 8 }, { start: 9, span: 8 }],
        [{ start: 1, span: 4 }, { start: 5, span: 4 }, { start: 9, span: 4 }, { start: 13, span: 4 }],
        [{ start: 1, span: 11 }, { start: 12, span: 5 }],
      ]),
    ),
  }),
};

/** Centred blocks, for reading and focused tasks. */
export const CenteredSpans: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: diagram(WEB, [[{ start: 5, span: 8 }], [{ start: 4, span: 10 }], [{ start: 3, span: 12 }]]),
  }),
};

export const DoAligned: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: diagram(WEB, [[{ start: 1, span: 4, label: 'Card' }, { start: 5, span: 4, label: 'Card' }, { start: 9, span: 4, label: 'Card' }, { start: 13, span: 4, label: 'Card' }], [{ start: 1, span: 11, label: 'Table' }, { start: 12, span: 5, label: 'Panel' }]]),
  }),
};

export const DontOverflow: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: diagram(WEB, [[{ off: [1, 37], label: 'Into the margin' }], [{ off: [25, 52], label: 'Across gutters' }]]),
  }),
};

/** Containers sit on columns; what's inside them uses spacing. */
export const AlignContainers: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: `
<div class="fig-stack">
  ${diagram(WEB, [[{ start: 1, span: 5, label: 'Card', height: 60 }, { start: 6, span: 5, label: 'Card', height: 60 }, { start: 11, span: 6, label: 'Card', height: 60 }]])}
  <div style="max-width: 20rem">
    <p class="fig-title">Inside a card: spacing, not columns</p>
    <div class="card-demo"><b>Order 1042</b><div class="bar" style="width: 80%"></div><div class="bar" style="width: 55%"></div><div class="btns"><span></span><span></span></div></div>
  </div>
</div>`,
  }),
};

/** A grid inside a card, for complex content. */
export const Nested: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: `
<div class="fig-stack">
  <div><p class="fig-title">The page: a card spans 10 of 16 columns</p>${diagram(WEB, [[{ start: 1, span: 10, label: 'Card', height: 60 }, { start: 11, span: 6, label: 'Panel', height: 60 }]])}</div>
  <div style="max-width: 50rem"><p class="fig-title">Inside the card: its own grid, no outer margin</p>${diagram(
    { width: 800, columns: 8, margin: 24, gutter: 16, ratio: '800 / 170' },
    [[{ start: 1, span: 5, label: 'Photo' }, { start: 6, span: 3, label: 'Details' }], [{ start: 1, span: 8, label: 'Notes' }]],
  )}</div>
</div>`,
  }),
};

/** The breakpoints, as a ruler. */
export const Breakpoints: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: `
<div class="ruler" aria-hidden="true">
  <div class="r-phone" style="flex: 672"><b>Phone · xs, sm</b>4 columns · 16px</div>
  <div class="r-tablet" style="flex: 384"><b>Tablet · md</b>8 columns · 24px</div>
  <div class="r-web" style="flex: 528"><b>Web · lg, xl</b>16 columns · 32px</div>
  <div class="r-web" style="flex: 200"><b>xxl</b>stays 1584px</div>
</div>
<div class="ruler-scale" aria-hidden="true"><span style="flex-grow: 672">0</span><span style="flex-grow: 384">672</span><span style="flex-grow: 528">1056</span><span style="flex-grow: 200">1584</span></div>`,
  }),
};

/** The three grid widths at a wide screen. */
export const Widths: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: `
<div class="fig-stack">
  <div><p class="fig-title">Default · up to 1584px · on a 1920px screen</p>${diagram({ width: 1920, columns: 16, margin: 200, gutter: 32, ratio: '1920 / 300' }, [[{ start: 1, span: 11, label: 'Table' }, { start: 12, span: 5, label: 'Filters' }]])}</div>
  <div><p class="fig-title">Narrow · up to 960px · on a 1440px screen</p>${diagram({ width: 1440, columns: 16, margin: 272, gutter: 32, ratio: '1440 / 260' }, [[{ start: 1, span: 16, label: 'Article or form' }]])}</div>
  <div><p class="fig-title">Fluid · no limit · on a 1920px screen</p>${diagram({ width: 1920, columns: 16, margin: 32, gutter: 32, ratio: '1920 / 300' }, [[{ start: 1, span: 4, label: 'To do' }, { start: 5, span: 4, label: 'Doing' }, { start: 9, span: 4, label: 'Review' }, { start: 13, span: 4, label: 'Done' }]])}</div>
</div>`,
  }),
};

// Docs: live examples for the Mobile / Web switch.

/** A form page: one column on phones; on web the form takes 10 columns and help sits beside it. */
export const FormLayout: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: DEMO_STYLES,
    template: `${CURRENT}
<div class="exos-grid">
  <div class="exos-col-4 exos-col-md-8 exos-col-lg-10 demo-cell demo-block">Form (10 of 16)</div>
  <div class="exos-col-4 exos-col-md-8 exos-col-lg-6 demo-cell demo-block">Help and summary (6 of 16)</div>
</div>`,
  }),
};

export const DoReadingWidth: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: diagram(WEB, [[{ start: 4, span: 10, label: 'Text: 10 columns, about 70 characters a line', height: 70 }]]),
  }),
};

export const DontFullWidthText: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: diagram(WEB, [[{ start: 1, span: 16, label: 'Text: 16 columns, 180 characters a line', height: 70 }]]),
  }),
};

export const DoPhoneStack: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: `<div style="max-width: 13rem; margin: 0 auto">${diagram(PHONE, [[{ start: 1, span: 4, label: 'Main' }], [{ start: 1, span: 4, label: 'Panel' }]])}</div>`,
  }),
};

export const DontPhoneSqueeze: Story = {
  tags: ['!dev'],
  render: () => ({
    styles: FIGURE_STYLES,
    template: `<div style="max-width: 13rem; margin: 0 auto">${diagram(PHONE, [[{ start: 1, span: 3, label: 'Main', height: 120 }, { start: 4, span: 1, label: '…', height: 120 }]])}</div>`,
  }),
};
