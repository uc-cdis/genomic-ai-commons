import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LoadedFiles from './LoadedFiles';

const meta = {
  component: LoadedFiles,
} satisfies Meta<typeof LoadedFiles>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
