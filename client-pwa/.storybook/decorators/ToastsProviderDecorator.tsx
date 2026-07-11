import type { ReactNode } from 'react';

import type { ReactRenderer } from '@storybook/react-vite';
import type { PartialStoryFn } from 'storybook/internal/types';

import { ToastsProvider } from '../../src/ui/Toast/Toast';

export function ToastsProviderDecorator(
  Story: PartialStoryFn<
    ReactRenderer,
    {
      children?: ReactNode;
    }
  >,
) {
  return (
    <ToastsProvider>
      <Story />
    </ToastsProvider>
  );
}
