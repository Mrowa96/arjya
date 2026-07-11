import type { Meta, StoryObj } from '@storybook/react-vite';

import { PodcastCard } from './PodcastCard';

const meta = {
  title: 'UI/PodcastCard',
  component: PodcastCard,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'Podcast name',
        "Podcast name which is super long and not neceseraily so useful for end user to understand what's going on",
      ],
    },
    thumbnailUrl: { control: 'select', options: ['/example-1.jpg', ''] },
  },
  args: {
    id: 'podcast-id',
    name: 'Podcast name',
    thumbnailUrl: '/example-1.jpg',
  },
} satisfies Meta<typeof PodcastCard>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (props) => (
    <div style={{ width: '250px' }}>
      <PodcastCard {...props} />
    </div>
  ),
};

export default meta;
