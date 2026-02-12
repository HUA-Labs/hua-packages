import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmotionButton } from '../EmotionButton';

describe('EmotionButton', () => {
  it('should render emotion text', () => {
    render(<EmotionButton emotion="😊" />);

    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('should render as a button', () => {
    render(<EmotionButton emotion="😊" />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should apply default size (md)', () => {
    render(<EmotionButton emotion="😊" />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('w-12');
    expect(button.className).toContain('h-12');
  });

  it('should apply sm size', () => {
    render(<EmotionButton emotion="😊" size="sm" />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('w-8');
    expect(button.className).toContain('h-8');
  });

  it('should apply lg size', () => {
    render(<EmotionButton emotion="😊" size="lg" />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('w-16');
    expect(button.className).toContain('h-16');
  });

  it('should apply selected style when isSelected', () => {
    render(<EmotionButton emotion="😊" isSelected />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('border-indigo-500');
  });

  it('should apply unselected style by default', () => {
    render(<EmotionButton emotion="😊" />);

    const button = screen.getByRole('button');
    expect(button.className).toContain('border-gray-200');
  });

  it('should call onClick handler', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<EmotionButton emotion="😊" onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(<EmotionButton emotion="😊" className="custom-btn" />);

    expect(screen.getByRole('button').className).toContain('custom-btn');
  });

  it('should be disabled', () => {
    render(<EmotionButton emotion="😊" disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
