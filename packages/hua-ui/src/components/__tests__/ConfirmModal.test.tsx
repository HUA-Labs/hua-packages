import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from '../ConfirmModal';

describe('ConfirmModal', () => {
  it('should render when isOpen is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test Title"
        message="Test Message"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ConfirmModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test Title"
        message="Test Message"
      />
    );

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should show title and message', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const handleConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
        title="Confirm"
        message="Please confirm"
      />
    );

    const confirmButton = screen.getByRole('button', { name: '확인' });
    await user.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when cancel button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={vi.fn()}
        title="Confirm"
        message="Please confirm"
      />
    );

    const cancelButton = screen.getByRole('button', { name: '취소' });
    await user.click(cancelButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should render custom confirm and cancel text', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message="Test"
        confirmText="Yes"
        cancelText="No"
      />
    );

    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('should show warning message when provided', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        message="Delete this item?"
        warning="This action cannot be undone!"
      />
    );

    expect(screen.getByText('This action cannot be undone!')).toBeInTheDocument();
  });

  it('should render an icon for danger type (default)', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        message="Delete this item?"
      />
    );

    // Icon is an SVG with aria-hidden, rendered inside the modal
    const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should render an icon for warning type', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Warning"
        message="Warning message"
        type="warning"
      />
    );

    const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should render an icon for info type', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Info"
        message="Info message"
        type="info"
      />
    );

    const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should disable confirm button when disabled prop is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message="Test"
        disabled={true}
      />
    );

    const confirmButton = screen.getByRole('button', { name: '확인' });
    expect(confirmButton).toBeDisabled();
  });

  it('should show loading state', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message="Test"
        loading={true}
      />
    );

    expect(screen.getByText('처리 중...')).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: /처리 중/ });
    expect(confirmButton).toBeDisabled();
  });

  it('should render input field when showInput is true', () => {
    const handleInputChange = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        message="Type DELETE to confirm"
        showInput={true}
        inputLabel="Confirmation"
        inputPlaceholder="Type DELETE"
        inputValue=""
        onInputChange={handleInputChange}
      />
    );

    const input = screen.getByLabelText('Confirmation');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Type DELETE');
  });

  it('should handle input value change', async () => {
    const handleInputChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        message="Type DELETE to confirm"
        showInput={true}
        inputLabel="Confirmation"
        inputValue=""
        onInputChange={handleInputChange}
      />
    );

    const input = screen.getByLabelText('Confirmation');
    await user.type(input, 'DELETE');

    expect(handleInputChange).toHaveBeenCalled();
  });

  it('should disable confirm button when requiredInputValue does not match', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        message="Type DELETE to confirm"
        showInput={true}
        inputLabel="Confirmation"
        inputValue="DELE"
        requiredInputValue="DELETE"
        onInputChange={vi.fn()}
      />
    );

    const confirmButton = screen.getByRole('button', { name: '확인' });
    expect(confirmButton).toBeDisabled();
  });

  it('should enable confirm button when requiredInputValue matches', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete"
        message="Type DELETE to confirm"
        showInput={true}
        inputLabel="Confirmation"
        inputValue="DELETE"
        requiredInputValue="DELETE"
        onInputChange={vi.fn()}
      />
    );

    const confirmButton = screen.getByRole('button', { name: '확인' });
    expect(confirmButton).not.toBeDisabled();
  });

  it('should not show cancel button when showCancel is false', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Alert"
        message="This is an alert"
        showCancel={false}
      />
    );

    const cancelButton = screen.queryByRole('button', { name: '취소' });
    expect(cancelButton).not.toBeInTheDocument();
  });

  it('should use confirmButtonText when provided', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Test"
        message="Test"
        confirmButtonText="Proceed"
      />
    );

    expect(screen.getByRole('button', { name: 'Proceed' })).toBeInTheDocument();
  });
});
