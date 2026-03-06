import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Menu, MenuItem, MenuSeparator, MenuLabel, MenuHorizontal, MenuCompact } from '../Menu';

describe('Menu', () => {
  it('should render children', () => {
    render(
      <Menu>
        <MenuItem>Home</MenuItem>
        <MenuItem>Settings</MenuItem>
      </Menu>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should apply default vertical layout (flexDirection: column)', () => {
    const { container } = render(
      <Menu>
        <MenuItem>Item</MenuItem>
      </Menu>
    );
    const menu = container.firstChild as HTMLElement;
    expect(menu.style.flexDirection).toBe('column');
  });

  it('should apply horizontal layout (flexDirection: row)', () => {
    const { container } = render(
      <Menu variant="horizontal">
        <MenuItem>Item</MenuItem>
      </Menu>
    );
    const menu = container.firstChild as HTMLElement;
    expect(menu.style.display).toBe('flex');
    expect(menu.style.flexDirection).toBe('row');
  });

  it('should apply compact layout (gap: 2px)', () => {
    const { container } = render(
      <Menu variant="compact">
        <MenuItem>Item</MenuItem>
      </Menu>
    );
    const menu = container.firstChild as HTMLElement;
    expect(menu.style.gap).toBe('2px');
  });
});

describe('MenuItem', () => {
  it('should render text', () => {
    render(<MenuItem>Click me</MenuItem>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click', () => {
    const handleClick = vi.fn();
    render(<MenuItem onClick={handleClick}>Click</MenuItem>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show active state with primary color variable', () => {
    const { container } = render(<MenuItem active>Active</MenuItem>);
    const btn = container.querySelector('button') as HTMLElement;
    // Active state sets a CSS variable for backgroundColor
    expect(btn.style.backgroundColor).toContain('var(');
    expect(btn.style.color).toContain('var(');
  });

  it('should be disabled', () => {
    render(<MenuItem disabled>Disabled</MenuItem>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply opacity 0.5 when disabled', () => {
    const { container } = render(<MenuItem disabled>Disabled</MenuItem>);
    const btn = container.querySelector('button') as HTMLElement;
    expect(btn.style.opacity).toBe('0.5');
  });

  it('should render icon', () => {
    render(<MenuItem icon={<span data-testid="icon">home</span>}>Home</MenuItem>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

describe('MenuSeparator', () => {
  it('should render separator with backgroundColor', () => {
    const { container } = render(<MenuSeparator />);
    const sep = container.firstChild as HTMLElement;
    expect(sep.style.backgroundColor).toContain('var(');
  });

  it('should render vertical separator (width: 1px) for horizontal variant', () => {
    const { container } = render(<MenuSeparator variant="horizontal" />);
    const sep = container.firstChild as HTMLElement;
    expect(sep.style.width).toBe('1px');
  });

  it('should render horizontal separator (height: 1px) for default variant', () => {
    const { container } = render(<MenuSeparator />);
    const sep = container.firstChild as HTMLElement;
    expect(sep.style.height).toBe('1px');
  });
});

describe('MenuLabel', () => {
  it('should render label text', () => {
    render(<MenuLabel>Navigation</MenuLabel>);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('should have uppercase text transform', () => {
    const { container } = render(<MenuLabel>Label</MenuLabel>);
    const label = container.firstChild as HTMLElement;
    expect(label.style.textTransform).toBe('uppercase');
  });
});

describe('Convenience components', () => {
  it('should render MenuHorizontal with row direction', () => {
    const { container } = render(
      <MenuHorizontal>
        <MenuItem>Item</MenuItem>
      </MenuHorizontal>
    );
    const menu = container.firstChild as HTMLElement;
    expect(menu.style.flexDirection).toBe('row');
  });

  it('should render MenuCompact with 2px gap', () => {
    const { container } = render(
      <MenuCompact>
        <MenuItem>Item</MenuItem>
      </MenuCompact>
    );
    const menu = container.firstChild as HTMLElement;
    expect(menu.style.gap).toBe('2px');
  });
});
