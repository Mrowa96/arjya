import type { Meta, StoryObj } from '@storybook/react-vite';

import { Loader } from './Loader';

const meta = {
  title: 'UI/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'number',
    },
    withWrapper: {
      control: 'boolean',
    },
    wrapperSize: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      if: {
        arg: 'withWrapper',
        truthy: true,
      },
    },
  },
} satisfies Meta<typeof Loader>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export default meta;
