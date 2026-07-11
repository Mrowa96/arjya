import type { Meta, StoryObj } from '@storybook/react-vite';

import { Image } from './Image';

const meta = {
  title: 'UI/Image',
  component: Image,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    alt: {
      control: 'text',
    },
    className: {
      table: {
        disable: true,
      },
    },
    height: {
      control: 'number',
    },
    width: {
      control: 'number',
    },
    src: {
      control: 'select',
      options: ['https://picsum.photos/200/300', 'https://picsum.photos/id/237/200/200'],
    },
  },
} satisfies Meta<typeof Image>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    alt: 'Test image',
    width: 200,
    height: 300,
    src: 'https://picsum.photos/200/300',
  },
};

export default meta;
