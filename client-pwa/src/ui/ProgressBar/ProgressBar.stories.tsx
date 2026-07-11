import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'number',
    },
    disabled: {
      control: 'boolean',
    },
    showAlways: {
      control: 'boolean',
    },
  },
  args: {
    value: 75,
  },
} satisfies Meta<typeof ProgressBar>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (props) => (
    <div style={{ width: '200px' }}>
      <ProgressBar {...props} />
    </div>
  ),
};

export default meta;
