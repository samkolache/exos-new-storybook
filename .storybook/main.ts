import type { StorybookConfig } from '@storybook/angular-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    {
      // GitHub-style Markdown in MDX docs: tables, strikethrough, task lists.
      name: '@storybook/addon-docs',
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    '@storybook/addon-onboarding',
  ],
  framework: '@storybook/angular-vite',
  // Same static files the app serves (icons/pcr/*.svg).
  staticDirs: ['../public'],
  // Bootstrap 5.3.2 predates Dart Sass's module-system deprecations.
  viteFinal: async (config) => {
    config.css ??= {};
    config.css.preprocessorOptions = {
      ...config.css.preprocessorOptions,
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      },
    };
    return config;
  },
};
export default config;
