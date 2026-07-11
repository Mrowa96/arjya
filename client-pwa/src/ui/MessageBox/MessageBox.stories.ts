import type { Meta, StoryObj } from '@storybook/react-vite';

import { MessageBox } from './MessageBox';

const meta = {
  title: 'UI/MessageBox',
  component: MessageBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
    variant: { control: 'select', options: ['info', 'success', 'error', 'warning'] },
  },
} satisfies Meta<typeof MessageBox>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Some message for user to see',
    variant: 'info',
  },
};

export default meta;
