import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('should render image when src provided', () => {
    render(<Avatar src="/avatar.jpg" alt="User" />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'User');
  });

  it('should show fallback when no image', () => {
    render(<Avatar alt="John Doe" />);

    const fallback = screen.getByText('J');
    expect(fallback).toBeInTheDocument();
  });

  it('should show fallback when image fails to load', () => {
    render(<Avatar src="/broken.jpg" alt="User" />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    const fallback = screen.getByText('U');
    expect(fallback).toBeInTheDocument();
  });

  it('should use fallbackText when provided', () => {
    render(<Avatar fallbackText="JD" alt="John Doe" />);

    const fallback = screen.getByText('JD');
    expect(fallback).toBeInTheDocument();
  });

  it('should use children as fallback', () => {
    render(<Avatar alt="User">AB</Avatar>);

    const fallback = screen.getByText('AB');
    expect(fallback).toBeInTheDocument();
  });

  it('should apply small size variant', () => {
    const { container } = render(<Avatar size="sm" alt="User" />);

    const avatar = container.querySelector('div');
    expect(avatar).toHaveClass('w-8');
    expect(avatar).toHaveClass('h-8');
  });

  it('should apply medium size variant (default)', () => {
    const { container } = render(<Avatar alt="User" />);

    const avatar = container.querySelector('div');
    expect(avatar).toHaveClass('w-10');
    expect(avatar).toHaveClass('h-10');
  });

  it('should apply large size variant', () => {
    const { container } = render(<Avatar size="lg" alt="User" />);

    const avatar = container.querySelector('div');
    expect(avatar).toHaveClass('w-12');
    expect(avatar).toHaveClass('h-12');
  });

  it('should apply glass variant classes', () => {
    const { container } = render(<Avatar variant="glass" alt="User" />);

    const avatar = container.querySelector('div');
    expect(avatar).toHaveClass('ring-1');
    expect(avatar).toHaveClass('ring-white/30');
    expect(avatar).toHaveClass('backdrop-blur-sm');
  });

  it('should merge custom className', () => {
    const { container } = render(<Avatar className="custom-class" alt="User" />);

    const avatar = container.querySelector('div');
    expect(avatar).toHaveClass('custom-class');
    expect(avatar).toHaveClass('rounded-full');
  });
});
