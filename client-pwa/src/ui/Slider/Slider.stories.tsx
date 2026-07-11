import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Slider } from './Slider';

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    min: {
      control: 'number',
    },
    max: {
      control: 'number',
    },
    value: {
      table: {
        disable: true,
      },
    },
    onValueChange: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    min: 0,
    max: 100,
    value: 50,
    onValueChange: () => undefined,
  },
} satisfies Meta<typeof Slider>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (props) => {
    const [value, setValue] = useState(50);

    return (
      <div style={{ width: '200px' }}>
        <Slider {...props} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export default meta;
