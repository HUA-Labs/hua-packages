import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Action } from '../Action';

describe('Action', () => {
  it('should render children', () => {
    render(<Action>Click me</Action>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should set data-action attribute', () => {
    render(<Action actionType="magical">Btn</Action>);
    expect(screen.getByText('Btn').closest('[data-action]')).toHaveAttribute('data-action', 'magical');
  });

  it('should set data-feedback attribute', () => {
    render(<Action feedback="particle">Btn</Action>);
    expect(screen.getByText('Btn').closest('[data-feedback]')).toHaveAttribute('data-feedback', 'particle');
  });

  it('should default to primary actionType', () => {
    render(<Action>Btn</Action>);
    expect(screen.getByText('Btn').closest('[data-action]')).toHaveAttribute('data-action', 'primary');
  });

  it('should apply style variables', () => {
    const { container } = render(
      <Action transparency={0.5} blurIntensity={10} glowIntensity={5} glowColor="red">Btn</Action>
    );
    const btn = container.querySelector('.hua-action') as HTMLElement;
    expect(btn.style.getPropertyValue('--action-opacity')).toBe('0.5');
    expect(btn.style.getPropertyValue('--action-blur')).toBe('10px');
  });

  it('should call onClick', () => {
    const handleClick = vi.fn();
    render(<Action onClick={handleClick}>Btn</Action>);
    fireEvent.click(screen.getByText('Btn'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Action onClick={handleClick} disabled>Btn</Action>);
    fireEvent.click(screen.getByText('Btn'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(<Action onClick={handleClick} loading>Btn</Action>);
    fireEvent.click(screen.getByText('Btn'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should set aria-busy when loading', () => {
    const { container } = render(<Action loading>Btn</Action>);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Action className="my-action">Btn</Action>);
    expect(container.querySelector('.my-action')).toBeInTheDocument();
  });
});
