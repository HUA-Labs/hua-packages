import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../Accordion';

describe('Accordion', () => {
  it('should render accordion items', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const triggers = screen.getAllByRole('button');
    expect(triggers).toHaveLength(2);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should expand and collapse on click', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByText('Item 1').closest('button') as HTMLButtonElement;
    const content = screen.getByText('Content 1').closest('[role="region"]');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('hidden');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(content).not.toHaveAttribute('hidden');

    await user.click(trigger);

    // In single mode without collapsible, it should stay open
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('should support single mode', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByText('Item 1').closest('button') as HTMLButtonElement;
    const trigger2 = screen.getByText('Item 2').closest('button') as HTMLButtonElement;

    await user.click(trigger1);
    expect(trigger1).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger2);
    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
    expect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });

  it('should support multiple mode', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="multiple">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByText('Item 1').closest('button') as HTMLButtonElement;
    const trigger2 = screen.getByText('Item 2').closest('button') as HTMLButtonElement;

    await user.click(trigger1);
    await user.click(trigger2);

    expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    expect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });

  it('should support default expanded item', () => {
    render(
      <Accordion type="single" defaultValue="item2">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger2 = screen.getByText('Item 2').closest('button') as HTMLButtonElement;
    expect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });

  it('should have proper ARIA attributes', () => {
    render(
      <Accordion type="single" defaultValue="item1">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', 'accordion-content-item1');

    const content = screen.getByRole('region');
    expect(content).toHaveAttribute('aria-labelledby', 'accordion-trigger-item1');
  });

  it('should hide content when collapsed', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const content = screen.getByText('Content 1').closest('[role="region"]');
    expect(content).toHaveAttribute('hidden');
    expect(content).toHaveStyle({ height: '0px' });
  });

  it('should work in controlled mode', async () => {
    const handleValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Accordion type="single" value="item1" onValueChange={handleValueChange}>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger2 = screen.getByText('Item 2').closest('button') as HTMLButtonElement;
    await user.click(trigger2);

    expect(handleValueChange).toHaveBeenCalledWith('item2');
  });

  it('should support collapsible mode', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByText('Item 1').closest('button') as HTMLButtonElement;

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
