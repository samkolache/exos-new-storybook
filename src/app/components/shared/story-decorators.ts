import { componentWrapperDecorator, type Decorator } from '@storybook/angular-vite';

/**
 * Form fields sit in a 24rem column, like in a real form. Layout examples set
 * `parameters.fullWidth` to use the whole width, so the grid can do its work.
 */
export const fieldColumn: Decorator = (storyFn, context) =>
  context.parameters['fullWidth']
    ? storyFn()
    : componentWrapperDecorator((story) => `<div style="max-width: 24rem">${story}</div>`)(storyFn, context);
