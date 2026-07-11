import { type ChangeEvent, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from './Switch';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
  },
} satisfies Meta<typeof Switch>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Wanna switch me?',
    value: false,
    onChange: () => undefined,
    onBlur: () => undefined,
  },
  render: (args) => {
    const [isChecked, setIsChecked] = useState(false);

    const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      setIsChecked(event.currentTarget.checked);
    };

    return <Switch {...args} value={isChecked} onChange={changeHandler} />;
  },
};

export default meta;
