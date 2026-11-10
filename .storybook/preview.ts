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
        order: ['Welcome', 'Catalog', 'Components', ['Button', 'IconButton', 'ProgressButton', 'Dropdown', 'Forms', '*'], 'Examples'],
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
