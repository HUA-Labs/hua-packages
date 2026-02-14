import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    const content = screen.getByText('Modal content');
    expect(content).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    const content = screen.queryByText('Modal content');
    expect(content).not.toBeInTheDocument();
  });

  it('should show title and description', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Title" description="Test Description">
        <div>Content</div>
      </Modal>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: '닫기' });
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );

    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalled();
  });

  it('should call onClose when overlay is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    const { baseElement } = render(
      <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={true}>
        <div>Content</div>
      </Modal>
    );

    // Click the overlay (role="dialog" container)
    const dialog = baseElement.querySelector('[role="dialog"]');
    if (dialog) {
      await user.click(dialog);
    }

    expect(handleClose).toHaveBeenCalled();
  });

  it('should not call onClose when overlay is clicked if closeOnOverlayClick is false', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    const { baseElement } = render(
      <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
        <div>Content</div>
      </Modal>
    );

    const dialog = baseElement.querySelector('[role="dialog"]');
    if (dialog) {
      await user.click(dialog);
    }

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should render backdrop when showBackdrop is true', () => {
    const { baseElement } = render(
      <Modal isOpen={true} onClose={vi.fn()} showBackdrop={true}>
        <div>Content</div>
      </Modal>
    );

    const backdrop = baseElement.querySelector('.backdrop-blur-md');
    expect(backdrop).toBeInTheDocument();
  });

  it('should not render backdrop when showBackdrop is false', () => {
    const { baseElement } = render(
      <Modal isOpen={true} onClose={vi.fn()} showBackdrop={false}>
        <div>Content</div>
      </Modal>
    );

    const backdrop = baseElement.querySelector('.bg-black\\/60');
    expect(backdrop).not.toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    const { baseElement } = render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Title" description="Test Description">
        <div>Content</div>
      </Modal>
    );

    const dialog = baseElement.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('should render in portal (document.body)', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    // Modal should be rendered in document.body via portal
    const modalContent = screen.getByText('Modal content');
    expect(modalContent).toBeInTheDocument();

    // Check that it's in the body (via portal)
    expect(document.body).toContainElement(modalContent);
  });

  it('should not show close button when closable is false', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} closable={false}>
        <div>Content</div>
      </Modal>
    );

    const closeButton = screen.queryByRole('button', { name: '닫기' });
    expect(closeButton).not.toBeInTheDocument();
  });

  it('should apply different size classes', () => {
    const { rerender, baseElement } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="sm">
        <div>Content</div>
      </Modal>
    );

    let modalContainer = baseElement.querySelector('.max-w-xs');
    expect(modalContainer).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={vi.fn()} size="xl">
        <div>Content</div>
      </Modal>
    );

    modalContainer = baseElement.querySelector('.max-w-lg');
    expect(modalContainer).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { baseElement } = render(
      <Modal isOpen={true} onClose={vi.fn()} className="custom-modal-class">
        <div>Content</div>
      </Modal>
    );

    const dialog = baseElement.querySelector('.custom-modal-class');
    expect(dialog).toBeInTheDocument();
  });

  it('should apply custom backdropClassName', () => {
    const { baseElement } = render(
      <Modal isOpen={true} onClose={vi.fn()} backdropClassName="custom-backdrop">
        <div>Content</div>
      </Modal>
    );

    const backdrop = baseElement.querySelector('.custom-backdrop');
    expect(backdrop).toBeInTheDocument();
  });
});
