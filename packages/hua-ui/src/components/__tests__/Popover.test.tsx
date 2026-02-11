import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent } from '../Popover';

describe('Popover', () => {
  it('should render trigger element', () => {
    render(
      <Popover trigger={<button>Open</button>}>
        <div>Popover content</div>
      </Popover>
    );

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('should not show popover initially', () => {
    render(
      <Popover trigger={<button>Open</button>}>
        <div>Popover content</div>
      </Popover>
    );

    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });

  it('should show popover when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <Popover trigger={<button>Open</button>}>
        <div>Popover content</div>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('should hide popover when trigger is clicked again', async () => {
    const user = userEvent.setup();

    render(
      <Popover trigger={<button>Open</button>}>
        <div>Popover content</div>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });

    // Open
    await user.click(trigger);
    expect(screen.getByText('Popover content')).toBeInTheDocument();

    // Close
    await user.click(trigger);
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });

  it('should close popover when clicking outside', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Popover trigger={<button>Open</button>}>
          <div>Popover content</div>
        </Popover>
        <button>Outside</button>
      </div>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    expect(screen.getByText('Popover content')).toBeInTheDocument();

    const outsideButton = screen.getByRole('button', { name: 'Outside' });
    await user.click(outsideButton);

    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });

  it('should not close popover when clicking inside content', async () => {
    const user = userEvent.setup();

    render(
      <Popover trigger={<button>Open</button>}>
        <button>Inside</button>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    const insideButton = screen.getByRole('button', { name: 'Inside' });
    await user.click(insideButton);

    // Popover should still be visible
    expect(insideButton).toBeInTheDocument();
  });

  it('should work in controlled mode', async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <Popover trigger={<button>Open</button>} open={false} onOpenChange={handleOpenChange}>
        <div>Popover content</div>
      </Popover>
    );

    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);

    // Simulate parent updating the open prop
    rerender(
      <Popover trigger={<button>Open</button>} open={true} onOpenChange={handleOpenChange}>
        <div>Popover content</div>
      </Popover>
    );

    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('should not open when disabled', async () => {
    const user = userEvent.setup();

    render(
      <Popover trigger={<button>Open</button>} disabled={true}>
        <div>Popover content</div>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
  });

  it('should apply default bottom position', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Popover trigger={<button>Open</button>}>
        <div>Popover content</div>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    const popover = container.querySelector('.top-full');
    expect(popover).toBeInTheDocument();
  });

  it('should apply top position', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Popover trigger={<button>Open</button>} position="top">
        <div>Popover content</div>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    const popover = container.querySelector('.bottom-full');
    expect(popover).toBeInTheDocument();
  });

  it('should apply left position', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Popover trigger={<button>Open</button>} position="left">
        <div>Popover content</div>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    const popover = container.querySelector('.right-full');
    expect(popover).toBeInTheDocument();
  });

  it('should apply right position', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Popover trigger={<button>Open</button>} position="right">
        <div>Popover content</div>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    const popover = container.querySelector('.left-full');
    expect(popover).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Popover trigger={<button>Open</button>} className="custom-popover">
        <div>Popover content</div>
      </Popover>
    );

    const popoverContainer = container.querySelector('.custom-popover');
    expect(popoverContainer).toBeInTheDocument();
  });

  it('should apply custom contentClassName', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Popover trigger={<button>Open</button>} contentClassName="custom-content">
        <div>Popover content</div>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    const popoverContent = container.querySelector('.custom-content');
    expect(popoverContent).toBeInTheDocument();
  });

  it('should call onOpenChange when state changes', async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Popover trigger={<button>Open</button>} onOpenChange={handleOpenChange}>
        <div>Popover content</div>
      </Popover>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });

    await user.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    await user.click(trigger);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('PopoverTrigger', () => {
  it('should render children', () => {
    render(
      <PopoverTrigger>
        <button>Trigger</button>
      </PopoverTrigger>
    );

    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PopoverTrigger className="custom-trigger">
        <button>Trigger</button>
      </PopoverTrigger>
    );

    const trigger = container.querySelector('.custom-trigger');
    expect(trigger).toBeInTheDocument();
  });
});

describe('PopoverContent', () => {
  it('should render children', () => {
    render(
      <PopoverContent>
        <div>Content</div>
      </PopoverContent>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PopoverContent className="custom-content">
        <div>Content</div>
      </PopoverContent>
    );

    const content = container.querySelector('.custom-content');
    expect(content).toBeInTheDocument();
  });

  it('should have default popover styles', () => {
    const { container } = render(
      <PopoverContent>
        <div>Content</div>
      </PopoverContent>
    );

    const content = container.querySelector('.bg-popover');
    expect(content).toBeInTheDocument();
  });
});
