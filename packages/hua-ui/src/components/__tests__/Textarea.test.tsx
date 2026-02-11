import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../Textarea';

describe('Textarea', () => {
  it('should render textarea element', () => {
    render(<Textarea aria-label="Description" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('should render with placeholder', () => {
    render(<Textarea placeholder="Enter your text here" />);

    const textarea = screen.getByPlaceholderText('Enter your text here');
    expect(textarea).toBeInTheDocument();
  });

  it('should allow user to type', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Comment" />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hello World');

    expect(textarea).toHaveValue('Hello World');
  });

  it('should respect rows prop', () => {
    render(<Textarea rows={10} aria-label="Large text" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '10');
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Textarea disabled aria-label="Disabled textarea" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('should have error state with aria-invalid', () => {
    render(<Textarea error aria-label="Error textarea" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('should apply resize variants', () => {
    const { container } = render(<Textarea resize="none" aria-label="No resize" />);

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('resize-none');
  });

  it('should apply size variants', () => {
    const { container } = render(<Textarea size="sm" aria-label="Small textarea" />);

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('text-sm');
    expect(textarea).toHaveClass('min-h-[80px]');
  });
});
