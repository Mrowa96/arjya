import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from './Text';
import { asOptions, variantOptions } from './consts';

const meta = {
  title: 'UI/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  argTypes: {
    as: { control: 'select', options: asOptions },
    variant: { control: 'select', options: variantOptions },
    children: { control: 'text' },
    className: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof Text>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Overview: Story = {
  argTypes: {
    as: {
      table: {
        disable: true,
      },
    },
    variant: {
      table: {
        disable: true,
      },
    },
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
                <Text variant={variant}>{props.children}</Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};

export default meta;
