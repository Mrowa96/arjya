import { RiAddLine } from '@remixicon/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button';
import { variantOptions } from './consts';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    icon: {
      control: 'select',
      options: ['none', 'plus'],
      mapping: {
        none: undefined,
        plus: <RiAddLine />,
      },
    },
    isDisabled: {
      control: 'boolean',
    },
    isLoading: {
      control: 'boolean',
    },
    onClick: {
      table: {
        disable: true,
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
    variant: {
      control: 'select',
      options: variantOptions,
    },
    isRound: { control: 'boolean', if: { arg: 'label', truthy: false } },
    type: { control: 'select', options: ['text', 'submit'] },
  },
  args: {
    label: 'Click me',
  },
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Overview: Story = {
  argTypes: {
    icon: { table: { disable: true } },
    isDisabled: { table: { disable: true } },
    isLoading: { table: { disable: true } },
    isRound: { table: { disable: true } },
    label: { table: { disable: true } },
    size: { table: { disable: true } },
    title: { table: { disable: true } },
    type: { table: { disable: true } },
    variant: { table: { disable: true } },
  },
  render: (props) => {
    return (
      <table>
        <thead>
          <tr>
            <th>Variant</th>
            <th>Display</th>
          </tr>
        </thead>
        <tbody>
          {variantOptions.map((variant) => (
            <tr key={variant}>
              <td style={{ padding: 'var(--spacing-md', minWidth: '150px', textAlign: 'center' }}>
                {variant}
              </td>
              <td style={{ padding: 'var(--spacing-md' }}>
                <Button {...props} variant={variant} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};

export default meta;
