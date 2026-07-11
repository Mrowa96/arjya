import { type ChangeEvent, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from './Checkbox';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
  },
} satisfies Meta<typeof Checkbox>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Do you agree to check this checkbox?',
    value: false,
    onChange: () => undefined,
    onBlur: () => undefined,
  },
  render: (args) => {
    const [isChecked, setIsChecked] = useState(false);

    const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      setIsChecked(event.currentTarget.checked);
    };

    return <Checkbox {...args} value={isChecked} onChange={changeHandler} />;
  },
};

export default meta;
