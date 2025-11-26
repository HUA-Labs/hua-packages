import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { useSimpleMotion } from '../hooks/useSimpleMotion';

type DemoProps = {
  preset: Parameters<typeof useSimpleMotion>[0];
};

const MotionDemo: React.FC<DemoProps> = ({ preset }) => {
  const motions = useSimpleMotion(preset);

  return (
    <div className="space-y-6 max-w-xl">
      <div
        data-motion-id="hero"
        ref={motions.hero?.ref}
        style={motions.hero?.style}
        className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8 shadow-lg"
      >
        <p className="text-sm uppercase opacity-80">Preset: {preset}</p>
        <h3 className="text-3xl font-semibold mt-2">Hero Section</h3>
        <p className="mt-2 text-blue-50">
          useSimpleMotion automatically applies entrance presets for the selected page type.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {['card-1', 'card-2', 'card-3', 'card-4'].map((id, index) => (
          <div
            key={id}
            data-motion-id={id}
            ref={motions[id as keyof typeof motions]?.ref}
            style={motions[id as keyof typeof motions]?.style}
            className="rounded-xl border border-slate-200 p-4 shadow-sm bg-white"
          >
            <p className="text-xs text-slate-500 uppercase">Card {index + 1}</p>
            <p className="text-slate-800 font-medium mt-1">Auto motion area</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const meta: Meta<typeof MotionDemo> = {
  title: 'Motion/useSimpleMotion',
  component: MotionDemo,
  args: {
    preset: 'home',
  },
  argTypes: {
    preset: {
      control: {
        type: 'select',
        options: ['home', 'landing', 'dashboard', 'pricing'],
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof MotionDemo>;

export const HomePreset: Story = {
  args: {
    preset: 'home',
  },
};

export const DashboardPreset: Story = {
  args: {
    preset: 'dashboard',
  },
};

