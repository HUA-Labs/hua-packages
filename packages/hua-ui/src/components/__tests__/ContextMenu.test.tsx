import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextMenu, ContextMenuItem } from '../ContextMenu';

describe('ContextMenu', () => {
  it('should open on right-click', async () => {
    render(
      <ContextMenu trigger={<div>Right-click me</div>}>
        <ContextMenuItem>Item 1</ContextMenuItem>
        <ContextMenuItem>Item 2</ContextMenuItem>
      </ContextMenu>
    );

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

    const trigger = screen.getByText('Right-click me');
    fireEvent.contextMenu(trigger);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should show menu items', () => {
    render(
      <ContextMenu trigger={<div>Right-click</div>}>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
        <ContextMenuItem>Delete</ContextMenuItem>
      </ContextMenu>
    );

    const trigger = screen.getByText('Right-click');
    fireEvent.contextMenu(trigger);

    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call handler on item click', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ContextMenu trigger={<div>Right-click</div>}>
        <ContextMenuItem onClick={handleClick}>Action</ContextMenuItem>
      </ContextMenu>
    );

    const trigger = screen.getByText('Right-click');
    fireEvent.contextMenu(trigger);

    const item = screen.getByText('Action');
    await user.click(item);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should close on outside click', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <ContextMenu trigger={<div>Right-click</div>}>
          <ContextMenuItem>Item 1</ContextMenuItem>
        </ContextMenu>
        <div data-testid="outside">Outside</div>
      </div>
    );

    const trigger = screen.getByText('Right-click');
    fireEvent.contextMenu(trigger);

    expect(screen.getByText('Item 1')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    await user.click(outside);

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('should prevent default context menu', () => {
    render(
      <ContextMenu trigger={<div>Right-click</div>}>
        <ContextMenuItem>Item 1</ContextMenuItem>
      </ContextMenu>
    );

    const trigger = screen.getByText('Right-click');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });

    fireEvent(trigger, event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('should position menu at cursor location', () => {
    const { container } = render(
      <ContextMenu trigger={<div>Right-click</div>}>
        <ContextMenuItem>Item 1</ContextMenuItem>
      </ContextMenu>
    );

    const trigger = screen.getByText('Right-click');
    fireEvent.contextMenu(trigger, { clientX: 100, clientY: 200 });

    const menu = container.querySelector('.fixed') as HTMLElement;
    expect(menu).toHaveStyle({ left: '100px', top: '200px' });
  });

  it('should work in controlled mode', () => {
    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <ContextMenu trigger={<div>Right-click</div>} open={false} onOpenChange={handleOpenChange}>
        <ContextMenuItem>Item 1</ContextMenuItem>
      </ContextMenu>
    );

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

    const trigger = screen.getByText('Right-click');
    fireEvent.contextMenu(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);

    // Simulate parent updating open state
    rerender(
      <ContextMenu trigger={<div>Right-click</div>} open={true} onOpenChange={handleOpenChange}>
        <ContextMenuItem>Item 1</ContextMenuItem>
      </ContextMenu>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should support disabled state', () => {
    render(
      <ContextMenu trigger={<div>Right-click</div>} disabled>
        <ContextMenuItem>Item 1</ContextMenuItem>
      </ContextMenu>
    );

    const trigger = screen.getByText('Right-click');
    fireEvent.contextMenu(trigger);

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });
});
