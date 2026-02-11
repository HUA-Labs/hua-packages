import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../Label';

describe('Label', () => {
  it('should render label text', () => {
    render(<Label>Email</Label>);

    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
  });

  it('should associate with input via htmlFor', () => {
    render(<Label htmlFor="email-input">Email</Label>);

    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('should show required indicator when required', () => {
    render(<Label required>Name</Label>);

    const indicator = screen.getByLabelText('필수 필드');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent('*');
  });

  it('should set aria-required when required', () => {
    render(<Label required>Name</Label>);

    const label = screen.getByText('Name');
    expect(label).toHaveAttribute('aria-required', 'true');
  });

  it('should apply error text color', () => {
    const { container } = render(<Label error>Error Label</Label>);

    const label = container.querySelector('label');
    expect(label).toHaveClass('text-destructive');
  });

  it('should apply disabled text color', () => {
    const { container } = render(<Label disabled>Disabled Label</Label>);

    const label = container.querySelector('label');
    expect(label).toHaveClass('text-muted-foreground');
  });

  it('should apply glass variant classes', () => {
    const { container } = render(<Label variant="glass">Glass Label</Label>);

    const label = container.querySelector('label');
    expect(label).toHaveClass('text-white');
  });

  it('should apply glass variant error color', () => {
    const { container } = render(<Label variant="glass" error>Error</Label>);

    const label = container.querySelector('label');
    expect(label).toHaveClass('text-red-400');
  });

  it('should merge custom className', () => {
    const { container } = render(<Label className="custom-class">Label</Label>);

    const label = container.querySelector('label');
    expect(label).toHaveClass('custom-class');
    expect(label).toHaveClass('text-sm');
  });
});
