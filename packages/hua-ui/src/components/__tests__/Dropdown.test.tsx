import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown, DropdownItem, DropdownMenu } from '../Dropdown';
import { Button } from '../Button';

describe('Dropdown', () => {
  it('should open on trigger click', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown trigger={<Button>Open Menu</Button>}>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
          <DropdownItem>Item 2</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: 'Open Menu' });
    await user.click(trigger);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should show menu items', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown trigger={<Button>Menu</Button>}>
        <DropdownMenu>
          <DropdownItem>Copy</DropdownItem>
          <DropdownItem>Paste</DropdownItem>
          <DropdownItem>Delete</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );

    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);

    const items = screen.getAllByRole('button');
    expect(items.length).toBeGreaterThanOrEqual(3); // Trigger + menu items
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call handler on item click', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Dropdown trigger={<Button>Menu</Button>}>
        <DropdownMenu>
          <DropdownItem onClick={handleClick}>Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );

    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);

    const item = screen.getByText('Action');
    await user.click(item);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should close on outside click', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Dropdown trigger={<Button>Menu</Button>}>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <div data-testid="outside">Outside</div>
      </div>
    );

    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);

    expect(screen.getByText('Item 1')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    await user.click(outside);

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('should support disabled items', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown trigger={<Button>Menu</Button>}>
        <DropdownMenu>
          <DropdownItem disabled>Disabled Item</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );

    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);

    const disabledItem = screen.getByText('Disabled Item').closest('button');
    expect(disabledItem).toBeDisabled();
  });

  it('should work in controlled mode', async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <Dropdown trigger={<Button>Menu</Button>} open={false} onOpenChange={handleOpenChange}>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);

    // Simulate parent updating open state
    rerender(
      <Dropdown trigger={<Button>Menu</Button>} open={true} onOpenChange={handleOpenChange}>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should not open when disabled', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown trigger={<Button>Menu</Button>} disabled>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );

    const trigger = screen.getByRole('button', { name: 'Menu' });
    await user.click(trigger);

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('should support different placements', () => {
    const { container } = render(
      <Dropdown trigger={<Button>Menu</Button>} placement="top" open={true}>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );

    const dropdown = container.querySelector('.absolute');
    expect(dropdown).toHaveClass('bottom-full');
  });
});
