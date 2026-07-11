import type { Preview } from '@storybook/react-vite';
import { withRouter } from 'storybook-addon-remix-react-router';

import { ToastsProviderDecorator } from './decorators/ToastsProviderDecorator';

import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withRouter, ToastsProviderDecorator],
};

export default preview;
