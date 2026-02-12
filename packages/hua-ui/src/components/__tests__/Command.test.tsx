import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandSeparator,
  CommandEmpty,
  CommandDialog,
} from '../Command';

// Mock scrollIntoView
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('Command', () => {
  it('should not render content when closed', () => {
    render(
      <Command>
        <CommandItem>Item 1</CommandItem>
      </Command>
    );

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('should render content when open', () => {
    render(
      <Command open>
        <CommandItem>Item 1</CommandItem>
        <CommandItem>Item 2</CommandItem>
      </Command>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should render search input with default placeholder', () => {
    render(
      <Command open>
        <CommandItem>Item</CommandItem>
      </Command>
    );

    expect(screen.getByPlaceholderText('명령어를 검색하세요...')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(
      <Command open placeholder="Type a command...">
        <CommandItem>Item</CommandItem>
      </Command>
    );

    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
  });

  it('should render CommandGroup with heading', () => {
    render(
      <Command open>
        <CommandGroup heading="Actions">
          <CommandItem>New File</CommandItem>
        </CommandGroup>
      </Command>
    );

    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('New File')).toBeInTheDocument();
  });

  it('should render CommandSeparator', () => {
    const { container } = render(
      <Command open>
        <CommandItem>Item 1</CommandItem>
        <CommandSeparator />
        <CommandItem>Item 2</CommandItem>
      </Command>
    );

    expect(container.querySelector('.bg-border')).toBeInTheDocument();
  });

  it('should render CommandEmpty', () => {
    render(
      <Command open>
        <CommandEmpty>No results found</CommandEmpty>
      </Command>
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('should render CommandDialog (alias)', () => {
    render(
      <CommandDialog open>
        <CommandItem>Dialog Item</CommandItem>
      </CommandDialog>
    );

    expect(screen.getByText('Dialog Item')).toBeInTheDocument();
  });
});

describe('Command - Open/Close', () => {
  it('should open with Ctrl+K', () => {
    const handleOpenChange = vi.fn();

    render(
      <Command onOpenChange={handleOpenChange}>
        <CommandItem>Item</CommandItem>
      </Command>
    );

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it('should open with Cmd+K (Mac)', () => {
    const handleOpenChange = vi.fn();

    render(
      <Command onOpenChange={handleOpenChange}>
        <CommandItem>Item</CommandItem>
      </Command>
    );

    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it('should close with Escape', () => {
    const handleOpenChange = vi.fn();

    render(
      <Command open onOpenChange={handleOpenChange}>
        <CommandItem>Item</CommandItem>
      </Command>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('should close when clicking backdrop', async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <Command open onOpenChange={handleOpenChange}>
        <CommandItem>Item</CommandItem>
      </Command>
    );

    // Click the backdrop (the fixed overlay)
    const backdrop = container.querySelector('.fixed.inset-0') as HTMLElement;
    await user.click(backdrop);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Command - Search', () => {
  it('should call onSearchChange when typing', async () => {
    const handleSearchChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Command open onSearchChange={handleSearchChange}>
        <CommandItem>Item</CommandItem>
      </Command>
    );

    const input = screen.getByPlaceholderText('명령어를 검색하세요...');
    await user.type(input, 'test');

    expect(handleSearchChange).toHaveBeenCalled();
  });

  it('should support controlled search value', () => {
    render(
      <Command open searchValue="hello">
        <CommandItem>Item</CommandItem>
      </Command>
    );

    const input = screen.getByPlaceholderText('명령어를 검색하세요...') as HTMLInputElement;
    expect(input.value).toBe('hello');
  });
});

describe('Command - Keyboard Navigation', () => {
  it('should highlight first item when opened', () => {
    render(
      <Command open>
        <CommandItem>First</CommandItem>
        <CommandItem>Second</CommandItem>
      </Command>
    );

    // First item (index 0) should be selected
    const items = screen.getAllByText(/First|Second/);
    const firstButton = items[0].closest('button');
    expect(firstButton?.className).toContain('bg-muted');
  });

  it('should navigate with ArrowDown', async () => {
    const user = userEvent.setup();

    render(
      <Command open>
        <CommandItem>First</CommandItem>
        <CommandItem>Second</CommandItem>
        <CommandItem>Third</CommandItem>
      </Command>
    );

    const input = screen.getByPlaceholderText('명령어를 검색하세요...');
    await user.type(input, '{ArrowDown}');

    // Second item should now be selected (index 1)
    const secondButton = screen.getByText('Second').closest('button');
    expect(secondButton?.className).toContain('bg-muted');
  });

  it('should navigate with ArrowUp', async () => {
    const user = userEvent.setup();

    render(
      <Command open>
        <CommandItem>First</CommandItem>
        <CommandItem>Second</CommandItem>
        <CommandItem>Third</CommandItem>
      </Command>
    );

    const input = screen.getByPlaceholderText('명령어를 검색하세요...');
    // Go down twice then up once: 0 -> 1 -> 2 -> 1
    await user.type(input, '{ArrowDown}{ArrowDown}{ArrowUp}');

    const secondButton = screen.getByText('Second').closest('button');
    expect(secondButton?.className).toContain('bg-muted');
  });

  it('should wrap around on ArrowDown at end', async () => {
    const user = userEvent.setup();

    render(
      <Command open>
        <CommandItem>First</CommandItem>
        <CommandItem>Second</CommandItem>
      </Command>
    );

    const input = screen.getByPlaceholderText('명령어를 검색하세요...');
    // Start at 0, down twice should wrap: 0 -> 1 -> 0
    await user.type(input, '{ArrowDown}{ArrowDown}');

    const firstButton = screen.getByText('First').closest('button');
    expect(firstButton?.className).toContain('bg-muted');
  });

  it('should call scrollIntoView on navigation', async () => {
    const user = userEvent.setup();

    render(
      <Command open>
        <CommandItem>First</CommandItem>
        <CommandItem>Second</CommandItem>
      </Command>
    );

    const input = screen.getByPlaceholderText('명령어를 검색하세요...');
    await user.type(input, '{ArrowDown}');

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});

describe('Command - Selection', () => {
  it('should call onSelect when item is clicked', async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <Command open>
        <CommandItem onSelect={handleSelect}>Clickable</CommandItem>
      </Command>
    );

    await user.click(screen.getByText('Clickable'));

    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect on Enter key', async () => {
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <Command open>
        <CommandItem onSelect={handleSelect}>Selectable</CommandItem>
      </Command>
    );

    const input = screen.getByPlaceholderText('명령어를 검색하세요...');
    await user.type(input, '{Enter}');

    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('should render item with icon', () => {
    render(
      <Command open>
        <CommandItem icon={<span data-testid="cmd-icon">*</span>}>
          With Icon
        </CommandItem>
      </Command>
    );

    expect(screen.getByTestId('cmd-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });
});

describe('Command - Disabled', () => {
  it('should not open when disabled', () => {
    const handleOpenChange = vi.fn();

    render(
      <Command disabled onOpenChange={handleOpenChange}>
        <CommandItem>Item</CommandItem>
      </Command>
    );

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    // handleOpenChange is called but the internal logic prevents opening
    // Because disabled check is inside handleOpenChange
    expect(screen.queryByText('Item')).not.toBeInTheDocument();
  });
});
