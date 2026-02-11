import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input type="text" placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should set aria-invalid when error state', () => {
    render(<Input type="text" aria-invalid={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should have hover and focus styles', () => {
    const { container } = render(<Input type="text" />);
    
    const input = container.querySelector('input');
    expect(input).toHaveClass('hover:border-accent-foreground', 'hover:shadow-sm');
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    render(<Input type="text" />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    
    expect(input).toHaveValue('Hello');
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Input type="text" disabled />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });
});

