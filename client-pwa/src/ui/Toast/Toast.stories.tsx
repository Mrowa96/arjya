import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { ToastsProvider, useToast } from './Toast';

const meta = {
  title: 'UI/Toast',
  component: ToastsProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastsProvider>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const { addToast } = useToast();

    return (
      <div style={{ display: 'flex', flexFlow: 'row wrap', gap: '16px' }}>
        <Button
          label="Open info toast"
          onClick={() => addToast({ message: 'Info message', type: 'info' })}
        />

        <Button
          label="Open success toast"
          onClick={() => addToast({ message: 'Success message', type: 'success' })}
        />

        <Button
          label="Open error toast"
          onClick={() => addToast({ message: 'Error message', type: 'error' })}
        />

        <Button
          label="Open same id toast"
          onClick={() => addToast({ id: 'same-id', message: 'Some random info', type: 'info' })}
        />
      </div>
    );
  },
};

export default meta;
