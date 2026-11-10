import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: '@storybook/angular-vite',
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
