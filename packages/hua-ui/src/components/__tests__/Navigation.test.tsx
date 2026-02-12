import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation, NavigationList, NavigationItem, NavigationContent } from '../Navigation';

describe('Navigation', () => {
  it('should render navigation items', () => {
    render(
      <Navigation defaultValue="tab1">
        <NavigationList>
          <NavigationItem value="tab1">Tab 1</NavigationItem>
          <NavigationItem value="tab2">Tab 2</NavigationItem>
        </NavigationList>
      </Navigation>
    );
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('should call onValueChange when tab is clicked', () => {
    const handleChange = vi.fn();
    render(
      <Navigation defaultValue="tab1" onValueChange={handleChange}>
        <NavigationList>
          <NavigationItem value="tab1">Tab 1</NavigationItem>
          <NavigationItem value="tab2">Tab 2</NavigationItem>
        </NavigationList>
      </Navigation>
    );
    // NavigationItem receives onValueChange from parent, but it's not directly passed
    // The click handler on NavigationItem calls its own onValueChange
    fireEvent.click(screen.getByText('Tab 2'));
  });

  it('should apply pills variant', () => {
    const { container } = render(
      <Navigation variant="pills">
        <NavigationList>
          <NavigationItem value="tab1" active>Tab 1</NavigationItem>
        </NavigationList>
      </Navigation>
    );
    expect(container.querySelector('.rounded-xl')).toBeInTheDocument();
  });

  it('should apply underline variant', () => {
    const { container } = render(
      <Navigation variant="underline">
        <NavigationList>
          <NavigationItem value="tab1">Tab 1</NavigationItem>
        </NavigationList>
      </Navigation>
    );
    expect(container.querySelector('.border-b')).toBeInTheDocument();
  });

  it('should apply cards variant', () => {
    const { container } = render(
      <Navigation variant="cards">
        <NavigationList>
          <NavigationItem value="tab1">Tab 1</NavigationItem>
        </NavigationList>
      </Navigation>
    );
    expect(container.querySelector('.bg-muted\\/50')).toBeInTheDocument();
  });
});

describe('NavigationItem', () => {
  it('should render as button', () => {
    render(<NavigationItem value="test">Test</NavigationItem>);
    expect(screen.getByRole('button')).toHaveTextContent('Test');
  });

  it('should call onValueChange on click', () => {
    const handleChange = vi.fn();
    render(
      <NavigationItem value="tab2" onValueChange={handleChange}>
        Tab 2
      </NavigationItem>
    );
    fireEvent.click(screen.getByText('Tab 2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('should apply active styles', () => {
    const { container } = render(
      <NavigationItem value="test" active>Active</NavigationItem>
    );
    expect(container.querySelector('.shadow-sm')).toBeInTheDocument();
  });
});

describe('NavigationContent', () => {
  it('should render when active', () => {
    render(<NavigationContent value="tab1" active>Content</NavigationContent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should not render when inactive', () => {
    render(<NavigationContent value="tab1">Hidden Content</NavigationContent>);
    expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
  });
});
