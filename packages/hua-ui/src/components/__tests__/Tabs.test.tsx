import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';

describe('Tabs', () => {
  it('should render tabs with list and panels', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
  });

  it('should switch active panel when clicking tabs', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');

    await user.click(tab2);

    expect(tab1).toHaveAttribute('aria-selected', 'false');
    expect(tab2).toHaveAttribute('aria-selected', 'true');

    const panel2 = screen.getByRole('tabpanel', { hidden: false });
    expect(panel2).toHaveTextContent('Content 2');
  });

  it('should show default active tab', () => {
    render(
      <Tabs defaultValue="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab2).toHaveAttribute('aria-selected', 'true');

    const panel = screen.getByRole('tabpanel', { hidden: false });
    expect(panel).toHaveTextContent('Content 2');
  });

  it('should work in controlled mode', async () => {
    const handleValueChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <Tabs value="tab1" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    await user.click(tab2);

    expect(handleValueChange).toHaveBeenCalledWith('tab2');

    // Simulate parent updating value
    rerender(
      <Tabs value="tab2" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(tab2).toHaveAttribute('aria-selected', 'true');
  });

  it('should have proper ARIA attributes', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    const tabList = screen.getByRole('tablist');
    expect(tabList).toHaveAttribute('aria-orientation', 'horizontal');

    const tab = screen.getByRole('tab');
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('aria-controls', 'tabpanel-tab1');

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-tab1');
  });

  it('should support different variants', () => {
    const { container } = render(
      <Tabs variant="pills" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    const tabList = container.querySelector('[role="tablist"]');
    expect(tabList).toHaveClass('bg-muted');
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    tab1.focus();

    // Arrow right should move to next tab
    await user.keyboard('{ArrowRight}');
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab2).toHaveAttribute('aria-selected', 'true');
  });

  it('should hide inactive tab panels', () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const panel1 = screen.getByText('Content 1').closest('[role="tabpanel"]');
    // Panel 2 is hidden (not rendered in DOM when active=false), so we query by id
    const panel2 = container.querySelector('#tabpanel-tab2');

    expect(panel1).not.toHaveAttribute('hidden');
    expect(panel2).toBeNull(); // hidden panels are not rendered
  });
});
