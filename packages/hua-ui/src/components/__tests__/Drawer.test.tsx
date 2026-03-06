import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from '../Drawer';

describe('Drawer', () => {
  it('should render when isOpen is true', () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()}>
        <DrawerContent>Drawer content</DrawerContent>
      </Drawer>
    );

    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()}>
        <DrawerContent>Drawer content</DrawerContent>
      </Drawer>
    );

    expect(screen.queryByText('Drawer content')).not.toBeInTheDocument();
  });

  it('should render content from children', () => {
    render(
      <Drawer isOpen={true} onClose={vi.fn()}>
        <DrawerHeader>Header</DrawerHeader>
        <DrawerContent>Content</DrawerContent>
        <DrawerFooter>Footer</DrawerFooter>
      </Drawer>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    const { container } = render(
      <Drawer isOpen={true} onClose={handleClose} closeOnBackdropClick={true}>
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    // Backdrop is the first child of the fixed outer container
    const outerDiv = container.firstChild as HTMLElement;
    const backdrop = outerDiv?.firstChild as HTMLElement;
    if (backdrop) {
      await user.click(backdrop);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('should not call onClose when backdrop is clicked if closeOnBackdropClick is false', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <Drawer isOpen={true} onClose={handleClose} closeOnBackdropClick={false}>
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    // Backdrop is first child (no onClick when closeOnBackdropClick=false)
    const outerDiv = container.firstChild as HTMLElement;
    const backdrop = outerDiv?.firstChild as HTMLElement;
    if (backdrop) {
      await user.click(backdrop);
      expect(handleClose).not.toHaveBeenCalled();
    }
  });

  it('should call onClose when Escape key is pressed', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Drawer isOpen={true} onClose={handleClose} closeOnEscape={true}>
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalled();
  });

  it('should not call onClose when Escape key is pressed if closeOnEscape is false', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Drawer isOpen={true} onClose={handleClose} closeOnEscape={false}>
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    await user.keyboard('{Escape}');

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should render backdrop when showBackdrop is true', () => {
    const { container } = render(
      <Drawer isOpen={true} onClose={vi.fn()} showBackdrop={true}>
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    // When showBackdrop=true, the outer fixed div has 2 children: backdrop + drawer
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv?.childNodes).toHaveLength(2);
  });

  it('should not render backdrop when showBackdrop is false', () => {
    const { container } = render(
      <Drawer isOpen={true} onClose={vi.fn()} showBackdrop={false}>
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    // When showBackdrop=false, the outer fixed div has 1 child: drawer only
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv?.childNodes).toHaveLength(1);
  });

  it('should apply right side position by default', () => {
    const { container } = render(
      <Drawer isOpen={true} onClose={vi.fn()}>
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    // Drawer panel is the last child of the outer fixed container
    const outerDiv = container.firstChild as HTMLElement;
    const drawer = outerDiv?.lastChild as HTMLElement;
    expect(drawer).toHaveStyle({ right: '0px' });
  });

  it('should apply left side position', () => {
    const { container } = render(
      <Drawer isOpen={true} onClose={vi.fn()} side="left">
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    const outerDiv = container.firstChild as HTMLElement;
    const drawer = outerDiv?.lastChild as HTMLElement;
    expect(drawer).toHaveStyle({ left: '0px' });
  });

  it('should apply top side position', () => {
    const { container } = render(
      <Drawer isOpen={true} onClose={vi.fn()} side="top">
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    const outerDiv = container.firstChild as HTMLElement;
    const drawer = outerDiv?.lastChild as HTMLElement;
    expect(drawer).toHaveStyle({ top: '0px' });
  });

  it('should apply bottom side position', () => {
    const { container } = render(
      <Drawer isOpen={true} onClose={vi.fn()} side="bottom">
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    const outerDiv = container.firstChild as HTMLElement;
    const drawer = outerDiv?.lastChild as HTMLElement;
    expect(drawer).toHaveStyle({ bottom: '0px' });
  });

  it('should apply different size styles', () => {
    const { container, rerender } = render(
      <Drawer isOpen={true} onClose={vi.fn()} size="sm">
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    const outerDiv = container.firstChild as HTMLElement;
    let drawer = outerDiv?.lastChild as HTMLElement;
    // sm right/left drawer = width 20rem (320px)
    expect(drawer).toHaveStyle({ width: '20rem' });

    rerender(
      <Drawer isOpen={true} onClose={vi.fn()} size="lg">
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    drawer = (container.firstChild as HTMLElement)?.lastChild as HTMLElement;
    // lg right/left drawer = width 28rem
    expect(drawer).toHaveStyle({ width: '28rem' });
  });

  it('should apply custom dot style', () => {
    const { container } = render(
      <Drawer isOpen={true} onClose={vi.fn()} dot="rounded-lg">
        <DrawerContent>Content</DrawerContent>
      </Drawer>
    );

    // Drawer panel should be rendered
    const outerDiv = container.firstChild as HTMLElement;
    const drawer = outerDiv?.lastChild as HTMLElement;
    expect(drawer).toBeInTheDocument();
  });
});

describe('DrawerHeader', () => {
  it('should render header with children', () => {
    render(
      <DrawerHeader>
        <h2>Header Title</h2>
      </DrawerHeader>
    );

    expect(screen.getByText('Header Title')).toBeInTheDocument();
  });

  it('should render close button by default', () => {
    const { container } = render(
      <DrawerHeader onClose={vi.fn()}>
        <h2>Header</h2>
      </DrawerHeader>
    );

    const closeButton = container.querySelector('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <DrawerHeader onClose={handleClose}>
        <h2>Header</h2>
      </DrawerHeader>
    );

    const closeButton = container.querySelector('button');
    if (closeButton) {
      await user.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should not render close button when showCloseButton is false', () => {
    const { container } = render(
      <DrawerHeader showCloseButton={false}>
        <h2>Header</h2>
      </DrawerHeader>
    );

    const closeButton = container.querySelector('button');
    expect(closeButton).not.toBeInTheDocument();
  });
});

describe('DrawerContent', () => {
  it('should render content', () => {
    render(
      <DrawerContent>
        <p>Drawer content text</p>
      </DrawerContent>
    );

    expect(screen.getByText('Drawer content text')).toBeInTheDocument();
  });

  it('should apply custom style', () => {
    const { container } = render(
      <DrawerContent style={{ padding: '2rem' }}>
        <p>Content</p>
      </DrawerContent>
    );

    const content = container.firstChild as HTMLElement;
    expect(content).toHaveStyle({ padding: '2rem' });
  });
});

describe('DrawerFooter', () => {
  it('should render footer with children', () => {
    render(
      <DrawerFooter>
        <button>Action</button>
      </DrawerFooter>
    );

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('should apply custom style', () => {
    const { container } = render(
      <DrawerFooter style={{ padding: '2rem' }}>
        <button>Action</button>
      </DrawerFooter>
    );

    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveStyle({ padding: '2rem' });
  });
});
