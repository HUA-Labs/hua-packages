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

  it('should apply default vertical layout', () => {
    const { container } = render(
      <Menu>
        <MenuItem>Item</MenuItem>
      </Menu>
    );
    expect(container.querySelector('.flex-col')).toBeInTheDocument();
  });

  it('should apply horizontal layout', () => {
    const { container } = render(
      <Menu variant="horizontal">
        <MenuItem>Item</MenuItem>
      </Menu>
    );
    expect(container.firstChild).toHaveClass('flex');
    expect(container.querySelector('.space-x-1')).toBeInTheDocument();
  });

  it('should apply compact layout', () => {
    const { container } = render(
      <Menu variant="compact">
        <MenuItem>Item</MenuItem>
      </Menu>
    );
    expect(container.querySelector('.space-y-0\\.5')).toBeInTheDocument();
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

  it('should show active state', () => {
    const { container } = render(<MenuItem active>Active</MenuItem>);
    expect(container.querySelector('.bg-primary\\/10')).toBeInTheDocument();
  });

  it('should be disabled', () => {
    render(<MenuItem disabled>Disabled</MenuItem>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should render icon', () => {
    render(<MenuItem icon={<span data-testid="icon">🏠</span>}>Home</MenuItem>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

describe('MenuSeparator', () => {
  it('should render separator', () => {
    const { container } = render(<MenuSeparator />);
    expect(container.querySelector('.bg-border')).toBeInTheDocument();
  });

  it('should render vertical separator for horizontal variant', () => {
    const { container } = render(<MenuSeparator variant="horizontal" />);
    expect(container.querySelector('.w-px')).toBeInTheDocument();
  });
});

describe('MenuLabel', () => {
  it('should render label text', () => {
    render(<MenuLabel>Navigation</MenuLabel>);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('should have uppercase tracking', () => {
    const { container } = render(<MenuLabel>Label</MenuLabel>);
    expect(container.querySelector('.uppercase')).toBeInTheDocument();
  });
});

describe('Convenience components', () => {
  it('should render MenuHorizontal', () => {
    const { container } = render(
      <MenuHorizontal>
        <MenuItem>Item</MenuItem>
      </MenuHorizontal>
    );
    expect(container.querySelector('.space-x-1')).toBeInTheDocument();
  });

  it('should render MenuCompact', () => {
    const { container } = render(
      <MenuCompact>
        <MenuItem>Item</MenuItem>
      </MenuCompact>
    );
    expect(container.querySelector('.space-y-0\\.5')).toBeInTheDocument();
  });
});
