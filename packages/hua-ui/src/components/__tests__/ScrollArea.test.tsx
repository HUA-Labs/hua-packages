import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ScrollArea, ScrollBar } from '../ScrollArea';

describe('ScrollArea', () => {
  it('should render children', () => {
    render(<ScrollArea>Scroll content</ScrollArea>);

    expect(screen.getByText('Scroll content')).toBeInTheDocument();
  });

  it('should apply vertical orientation by default', () => {
    const { container } = render(<ScrollArea>Content</ScrollArea>);

    const area = container.firstChild as HTMLElement;
    expect(area.className).toContain('overflow-y-auto');
    expect(area.className).toContain('overflow-x-hidden');
  });

  it('should apply horizontal orientation', () => {
    const { container } = render(
      <ScrollArea orientation="horizontal">Content</ScrollArea>
    );

    const area = container.firstChild as HTMLElement;
    expect(area.className).toContain('overflow-x-auto');
    expect(area.className).toContain('overflow-y-hidden');
  });

  it('should apply both orientation', () => {
    const { container } = render(
      <ScrollArea orientation="both">Content</ScrollArea>
    );

    const area = container.firstChild as HTMLElement;
    expect(area.className).toContain('overflow-auto');
  });

  it('should show scrollbar on hover', () => {
    const { container } = render(<ScrollArea>Content</ScrollArea>);

    const area = container.firstChild as HTMLElement;
    expect(area.className).toContain('scrollbar-hidden');

    fireEvent.mouseEnter(area);
    expect(area.className).toContain('scrollbar-visible');
  });

  it('should hide scrollbar on mouse leave', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { container } = render(<ScrollArea scrollHideDelay={0}>Content</ScrollArea>);

    const area = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(area);
    expect(area.className).toContain('scrollbar-visible');

    fireEvent.mouseLeave(area);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(area.className).toContain('scrollbar-hidden');
    vi.useRealTimers();
  });

  it('should always show scrollbar when type is always', () => {
    const { container } = render(
      <ScrollArea type="always">Content</ScrollArea>
    );

    const area = container.firstChild as HTMLElement;
    expect(area.className).toContain('scrollbar-visible');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ScrollArea className="my-scroll">Content</ScrollArea>
    );

    expect(container.querySelector('.my-scroll')).toBeInTheDocument();
  });
});

describe('ScrollBar', () => {
  it('should render vertical scrollbar by default', () => {
    const { container } = render(<ScrollBar />);

    const bar = container.firstChild as HTMLElement;
    expect(bar.className).toContain('h-full');
    expect(bar.className).toContain('w-2.5');
  });

  it('should render horizontal scrollbar', () => {
    const { container } = render(<ScrollBar orientation="horizontal" />);

    const bar = container.firstChild as HTMLElement;
    expect(bar.className).toContain('h-2.5');
    expect(bar.className).toContain('flex-col');
  });

  it('should apply custom className', () => {
    const { container } = render(<ScrollBar className="my-bar" />);

    expect(container.querySelector('.my-bar')).toBeInTheDocument();
  });
});
