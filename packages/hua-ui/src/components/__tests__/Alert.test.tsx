import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert, AlertSuccess, AlertWarning, AlertError, AlertInfo } from '../Alert';

describe('Alert', () => {
  it('should render with default variant', () => {
    const { container } = render(<Alert title="Alert" />);

    const alert = container.querySelector('div');
    expect(alert).toHaveClass('bg-white/10');
    expect(alert).toHaveClass('backdrop-blur-sm');
  });

  it('should render title', () => {
    render(<Alert title="Alert Title" />);

    const title = screen.getByText('Alert Title');
    expect(title).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<Alert description="Alert description" />);

    const description = screen.getByText('Alert description');
    expect(description).toBeInTheDocument();
  });

  it('should render children', () => {
    render(<Alert>Custom content</Alert>);

    const content = screen.getByText('Custom content');
    expect(content).toBeInTheDocument();
  });

  it('should apply success variant classes', () => {
    const { container } = render(<Alert variant="success" title="Success" />);

    const alert = container.querySelector('div');
    expect(alert).toHaveClass('bg-green-500/10');
    expect(alert).toHaveClass('border-green-400/30');
  });

  it('should apply warning variant classes', () => {
    const { container } = render(<Alert variant="warning" title="Warning" />);

    const alert = container.querySelector('div');
    expect(alert).toHaveClass('bg-yellow-500/10');
    expect(alert).toHaveClass('border-yellow-400/30');
  });

  it('should apply error variant classes', () => {
    const { container } = render(<Alert variant="error" title="Error" />);

    const alert = container.querySelector('div');
    expect(alert).toHaveClass('bg-red-500/10');
    expect(alert).toHaveClass('border-red-400/30');
  });

  it('should apply info variant classes', () => {
    const { container } = render(<Alert variant="info" title="Info" />);

    const alert = container.querySelector('div');
    expect(alert).toHaveClass('bg-indigo-500/10');
    expect(alert).toHaveClass('border-cyan-400/30');
  });

  it('should show default icon based on variant', () => {
    const { container } = render(<Alert variant="success" title="Success" />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should render custom icon', () => {
    render(<Alert icon={<div data-testid="custom-icon">Icon</div>} title="Alert" />);

    const icon = screen.getByTestId('custom-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should show close button when closable', () => {
    render(<Alert closable title="Alert" />);

    const closeButton = screen.getByLabelText('닫기');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(<Alert closable onClose={handleClose} title="Alert" />);

    const closeButton = screen.getByLabelText('닫기');
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should render action element', () => {
    render(<Alert action={<button>Action</button>} title="Alert" />);

    const action = screen.getByRole('button', { name: 'Action' });
    expect(action).toBeInTheDocument();
  });

  it('should merge custom className', () => {
    const { container } = render(<Alert className="custom-class" title="Alert" />);

    const alert = container.querySelector('div');
    expect(alert).toHaveClass('custom-class');
    expect(alert).toHaveClass('rounded-lg');
  });
});

describe('AlertSuccess', () => {
  it('should render with success variant', () => {
    const { container } = render(<AlertSuccess title="Success" />);

    const alert = container.querySelector('div');
    expect(alert).toHaveClass('bg-green-500/10');
  });
});

describe('AlertWarning', () => {
  it('should render with warning variant', () => {
    const { container } = render(<AlertWarning title="Warning" />);

    const alert = container.querySelector('div');
    expect(alert).toHaveClass('bg-yellow-500/10');
  });
});

describe('AlertError', () => {
  it('should render with error variant', () => {
    const { container } = render(<AlertError title="Error" />);

    const alert = container.querySelector('div');
    expect(alert).toHaveClass('bg-red-500/10');
  });
});

describe('AlertInfo', () => {
  it('should render with info variant', () => {
    const { container } = render(<AlertInfo title="Info" />);

    const alert = container.querySelector('div');
    expect(alert).toHaveClass('bg-indigo-500/10');
  });
});
