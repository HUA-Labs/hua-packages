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

  it('should apply default size (md) via inline style', () => {
    render(<EmotionButton emotion="😊" />);

    const button = screen.getByRole('button');
    expect(button.style.width).toBe('3rem');
    expect(button.style.height).toBe('3rem');
  });

  it('should apply sm size via inline style', () => {
    render(<EmotionButton emotion="😊" size="sm" />);

    const button = screen.getByRole('button');
    expect(button.style.width).toBe('2rem');
    expect(button.style.height).toBe('2rem');
  });

  it('should apply lg size via inline style', () => {
    render(<EmotionButton emotion="😊" size="lg" />);

    const button = screen.getByRole('button');
    expect(button.style.width).toBe('4rem');
    expect(button.style.height).toBe('4rem');
  });

  it('should apply selected border color when isSelected', () => {
    render(<EmotionButton emotion="😊" isSelected />);

    const button = screen.getByRole('button');
    expect(button.style.borderColor).toBe('rgb(99 102 241)');
  });

  it('should apply rounded-full style by default', () => {
    render(<EmotionButton emotion="😊" />);

    const button = screen.getByRole('button');
    expect(button.style.borderRadius).toBe('9999px');
  });

  it('should call onClick handler', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<EmotionButton emotion="😊" onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom style via style prop', () => {
    render(<EmotionButton emotion="😊" style={{ opacity: 0.5 }} />);

    const button = screen.getByRole('button');
    expect(button.style.opacity).toBe('0.5');
  });

  it('should be disabled', () => {
    render(<EmotionButton emotion="😊" disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
