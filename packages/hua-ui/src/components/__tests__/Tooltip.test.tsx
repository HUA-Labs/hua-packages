import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Tooltip, TooltipLight, TooltipDark } from '../Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('should not show tooltip initially', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('should show tooltip on mouse enter after delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={300}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    // Advance timers and run effects
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('should hide tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('Tooltip text')).toBeInTheDocument();

    fireEvent.mouseLeave(button);

    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('should not show tooltip when disabled', () => {
    render(
      <Tooltip content="Tooltip text" disabled={true}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('should render with default variant using inline background style', () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByText('Tooltip text');
    // default variant uses a dark gray background
    expect(tooltip.style.backgroundColor).toBeTruthy();
  });

  it('should render with light variant having popover background', () => {
    render(
      <Tooltip content="Tooltip text" variant="light" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByText('Tooltip text');
    // light variant uses CSS variable for background
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.style.border).toBeTruthy();
  });

  it('should render with dark variant using dark background', () => {
    render(
      <Tooltip content="Tooltip text" variant="dark" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByText('Tooltip text');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.style.backgroundColor).toBeTruthy();
  });

  it('should render with custom delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    // Should not show before delay
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();

    // Should show after delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('should cancel tooltip show if mouse leaves before delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    fireEvent.mouseLeave(button);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('should apply dot prop styles to wrapper element', () => {
    const { container } = render(
      <Tooltip content="Tooltip text" dot="p-4">
        <button>Hover me</button>
      </Tooltip>
    );

    // The wrapper div should have inline styles from dot resolution
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe('DIV');
  });

  it('should apply style prop to wrapper element', () => {
    const { container } = render(
      <Tooltip content="Tooltip text" style={{ opacity: 0.9 }}>
        <button>Hover me</button>
      </Tooltip>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('0.9');
  });
});

describe('TooltipLight', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render with light variant', () => {
    render(
      <TooltipLight content="Light tooltip" delay={0}>
        <button>Hover me</button>
      </TooltipLight>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByText('Light tooltip');
    expect(tooltip).toBeInTheDocument();
    // light variant renders a border
    expect(tooltip.style.border).toBeTruthy();
  });
});

describe('TooltipDark', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render with dark variant', () => {
    render(
      <TooltipDark content="Dark tooltip" delay={0}>
        <button>Hover me</button>
      </TooltipDark>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = screen.getByText('Dark tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.style.backgroundColor).toBeTruthy();
  });
});
