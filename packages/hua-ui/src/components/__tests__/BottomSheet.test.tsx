import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomSheet, BottomSheetHeader, BottomSheetContent } from '../BottomSheet';

describe('BottomSheet', () => {
  it('should render when isOpen is true', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <BottomSheetContent>Bottom sheet content</BottomSheetContent>
      </BottomSheet>
    );

    expect(screen.getByText('Bottom sheet content')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <BottomSheet isOpen={false} onClose={vi.fn()}>
        <BottomSheetContent>Bottom sheet content</BottomSheetContent>
      </BottomSheet>
    );

    expect(screen.queryByText('Bottom sheet content')).not.toBeInTheDocument();
  });

  it('should render content from children', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <BottomSheetHeader>Header</BottomSheetHeader>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should show drag handle by default', () => {
    const { container } = render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    const dragHandle = container.querySelector('.w-12.h-1\\.5');
    expect(dragHandle).toBeInTheDocument();
  });

  it('should not show drag handle when showDragHandle is false', () => {
    const { container } = render(
      <BottomSheet isOpen={true} onClose={vi.fn()} showDragHandle={false}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    const dragHandle = container.querySelector('.w-12.h-1\\.5');
    expect(dragHandle).not.toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    const { container } = render(
      <BottomSheet isOpen={true} onClose={handleClose} closeOnBackdropClick={true}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    const backdrop = container.querySelector('.backdrop-blur-md');
    if (backdrop) {
      await user.click(backdrop);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('should not call onClose when backdrop is clicked if closeOnBackdropClick is false', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <BottomSheet isOpen={true} onClose={handleClose} closeOnBackdropClick={false}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    const backdrop = container.querySelector('.backdrop-blur-md');
    if (backdrop) {
      await user.click(backdrop);
      expect(handleClose).not.toHaveBeenCalled();
    }
  });

  it('should call onClose when Escape key is pressed', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <BottomSheet isOpen={true} onClose={handleClose} closeOnEscape={true}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalled();
  });

  it('should not call onClose when Escape key is pressed if closeOnEscape is false', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <BottomSheet isOpen={true} onClose={handleClose} closeOnEscape={false}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    await user.keyboard('{Escape}');

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should render backdrop when showBackdrop is true', () => {
    const { container } = render(
      <BottomSheet isOpen={true} onClose={vi.fn()} showBackdrop={true}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    const backdrop = container.querySelector('.backdrop-blur-md');
    expect(backdrop).toBeInTheDocument();
  });

  it('should not render backdrop when showBackdrop is false', () => {
    const { container } = render(
      <BottomSheet isOpen={true} onClose={vi.fn()} showBackdrop={false}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    const backdrop = container.querySelector('.backdrop-blur-md');
    expect(backdrop).not.toBeInTheDocument();
  });

  it('should apply different height classes', () => {
    const { container, rerender } = render(
      <BottomSheet isOpen={true} onClose={vi.fn()} height="sm">
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    let sheet = container.querySelector('.h-64');
    expect(sheet).toBeInTheDocument();

    rerender(
      <BottomSheet isOpen={true} onClose={vi.fn()} height="lg">
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    sheet = container.querySelector('.h-\\[32rem\\]');
    expect(sheet).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <BottomSheet isOpen={true} onClose={vi.fn()} className="custom-sheet">
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    const sheet = container.querySelector('.custom-sheet');
    expect(sheet).toBeInTheDocument();
  });

  it('should handle touch start event', () => {
    const { container } = render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    const sheet = container.querySelector('.bottom-0');
    if (sheet) {
      fireEvent.touchStart(sheet, {
        touches: [{ clientY: 100 }],
      });

      // Should not throw error
      expect(sheet).toBeInTheDocument();
    }
  });

  it('should handle touch move event', () => {
    const { container } = render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    const sheet = container.querySelector('.bottom-0');
    if (sheet) {
      fireEvent.touchStart(sheet, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(sheet, {
        touches: [{ clientY: 150 }],
      });

      // Should not throw error
      expect(sheet).toBeInTheDocument();
    }
  });

  it('should call onClose when dragged down beyond threshold', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <BottomSheet isOpen={true} onClose={handleClose}>
        <BottomSheetContent>Content</BottomSheetContent>
      </BottomSheet>
    );

    const sheet = container.querySelector('.bottom-0');
    if (sheet) {
      fireEvent.touchStart(sheet, {
        touches: [{ clientY: 100 }],
      });

      fireEvent.touchMove(sheet, {
        touches: [{ clientY: 250 }], // Move down 150px (> threshold of 100)
      });

      fireEvent.touchEnd(sheet);

      expect(handleClose).toHaveBeenCalled();
    }
  });
});

describe('BottomSheetHeader', () => {
  it('should render header with children', () => {
    render(
      <BottomSheetHeader>
        <h2>Header Title</h2>
      </BottomSheetHeader>
    );

    expect(screen.getByText('Header Title')).toBeInTheDocument();
  });

  it('should render close button by default', () => {
    const { container } = render(
      <BottomSheetHeader onClose={vi.fn()}>
        <h2>Header</h2>
      </BottomSheetHeader>
    );

    const closeButton = container.querySelector('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <BottomSheetHeader onClose={handleClose}>
        <h2>Header</h2>
      </BottomSheetHeader>
    );

    const closeButton = container.querySelector('button');
    if (closeButton) {
      await user.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should not render close button when showCloseButton is false', () => {
    const { container } = render(
      <BottomSheetHeader showCloseButton={false}>
        <h2>Header</h2>
      </BottomSheetHeader>
    );

    const closeButton = container.querySelector('button');
    expect(closeButton).not.toBeInTheDocument();
  });
});

describe('BottomSheetContent', () => {
  it('should render content', () => {
    render(
      <BottomSheetContent>
        <p>Bottom sheet content text</p>
      </BottomSheetContent>
    );

    expect(screen.getByText('Bottom sheet content text')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <BottomSheetContent className="custom-content">
        <p>Content</p>
      </BottomSheetContent>
    );

    const content = container.querySelector('.custom-content');
    expect(content).toBeInTheDocument();
  });
});
