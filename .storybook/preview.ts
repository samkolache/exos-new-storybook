import type { Preview } from '@storybook/angular-vite';
import { componentWrapperDecorator } from '@storybook/angular-vite';
import '../src/styles.scss';

const preview: Preview = {
  // The theme's CSS variables are scoped to .exos-theme-dcfc, so every story renders inside it.
  decorators: [
    componentWrapperDecorator((story) => `<div class="exos-theme-dcfc p-3">${story}</div>`),
  ],
  parameters: {
    layout: 'fullscreen',
    // Sidebar: Welcome and Catalog first, then the components.
    options: {
      storySort: {
        order: ['Welcome', 'Catalog', 'Foundations', ['Grid', 'Spacing', 'Mobile and web', '*'], 'Components', ['Button', 'IconButton', 'ProgressButton', 'Dropdown', 'Link', 'Tabs', 'Accordion', 'Forms', ['Input', 'Select', 'Number Input', 'Date Picker', 'Radio Group', 'Checkbox', 'File Uploader', '*'], 'Chip', 'Tag', 'Notification', 'Modal', 'Tooltip', 'Loading', '*'], 'Patterns', ['Forms', 'Disabled and read only', 'Empty states', 'Loading', 'Notifications', '*'], 'Examples'],
      },
    },
    // Viewports that match the Exos grid: one per grid (4 / 8 / 16 columns).
    viewport: {
      options: {
        exosMobile: { name: 'Exos Mobile (375)', styles: { width: '375px', height: '812px' }, type: 'mobile' },
        exosTablet: { name: 'Exos Tablet (768)', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
        exosDesktop: { name: 'Exos Desktop (1312)', styles: { width: '1312px', height: '900px' }, type: 'desktop' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
