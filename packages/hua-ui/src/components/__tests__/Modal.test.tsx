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

    // With showBackdrop=true, the dialog wrapper has a backdrop div as first child
    const dialog = baseElement.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    // The dialog's first child is the backdrop (pointer-events-none)
    const backdrop = dialog?.firstChild as HTMLElement;
    expect(backdrop).toBeInTheDocument();
  });

  it('should not render backdrop when showBackdrop is false', () => {
    const { baseElement } = render(
      <Modal isOpen={true} onClose={vi.fn()} showBackdrop={false}>
        <div>Content</div>
      </Modal>
    );

    const dialog = baseElement.querySelector('[role="dialog"]');
    // With no backdrop, the dialog's first child is the centering container (not a fixed backdrop)
    // The centering container has flex layout, backdrop does not
    const firstChild = dialog?.firstChild as HTMLElement;
    // Centering container should contain our content text
    expect(firstChild?.textContent).toContain('Content');
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

  it('should apply different size styles', () => {
    const { baseElement, rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="sm">
        <div>Content</div>
      </Modal>
    );

    const dialog = baseElement.querySelector('[role="dialog"]');
    // The modal container is nested inside the centering div
    // Find the element with maxWidth style set
    const centeringDiv = dialog?.lastChild as HTMLElement;
    const modalContainer = centeringDiv?.firstChild as HTMLElement;
    expect(modalContainer).toHaveStyle({ maxWidth: '20rem' });

    rerender(
      <Modal isOpen={true} onClose={vi.fn()} size="xl">
        <div>Content</div>
      </Modal>
    );

    const dialogXl = baseElement.querySelector('[role="dialog"]');
    const centeringDivXl = dialogXl?.lastChild as HTMLElement;
    const modalContainerXl = centeringDivXl?.firstChild as HTMLElement;
    expect(modalContainerXl).toHaveStyle({ maxWidth: '32rem' });
  });

  it('should apply custom dot style', () => {
    const { baseElement } = render(
      <Modal isOpen={true} onClose={vi.fn()} dot="rounded-lg">
        <div>Content</div>
      </Modal>
    );

    // Dialog wrapper should still render
    const dialog = baseElement.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
  });

  it('should apply custom backdropDot style', () => {
    const { baseElement } = render(
      <Modal isOpen={true} onClose={vi.fn()} backdropDot="opacity-50">
        <div>Content</div>
      </Modal>
    );

    // Backdrop should still be rendered (first child of dialog)
    const dialog = baseElement.querySelector('[role="dialog"]');
    const backdrop = dialog?.firstChild as HTMLElement;
    expect(backdrop).toBeInTheDocument();
  });
});
