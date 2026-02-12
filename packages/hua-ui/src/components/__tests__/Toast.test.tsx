import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ToastProvider, useToast, useToastSafe } from '../Toast';

// Helper component to trigger toast actions
function ToastTrigger({
  type = 'success',
  message = 'Test message',
  title,
  duration,
  action,
}: {
  type?: 'success' | 'error' | 'warning' | 'info';
  message?: string;
  title?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}) {
  const { addToast, removeToast, clearToasts, toasts } = useToast();

  return (
    <div>
      <button
        onClick={() => addToast({ type, message, title, duration, action })}
      >
        Add Toast
      </button>
      <button onClick={() => clearToasts()}>Clear All</button>
      {toasts.map((t) => (
        <button key={t.id} onClick={() => removeToast(t.id)}>
          Remove {t.id}
        </button>
      ))}
    </div>
  );
}

// Helper for useToastSafe
function SafeToastConsumer() {
  const { addToast } = useToastSafe();

  return (
    <button onClick={() => addToast({ type: 'info', message: 'safe toast' })}>
      Safe Add
    </button>
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ToastProvider', () => {
  it('should render children', () => {
    render(
      <ToastProvider>
        <div>App Content</div>
      </ToastProvider>
    );

    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('should throw when useToast is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    function BadComponent() {
      useToast();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    );

    consoleError.mockRestore();
  });

  it('should return no-op functions from useToastSafe without provider', () => {
    render(<SafeToastConsumer />);

    // Should not throw
    const button = screen.getByText('Safe Add');
    expect(button).toBeInTheDocument();
  });
});

describe('Toast - Adding', () => {
  it('should add a success toast', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <ToastTrigger type="success" message="Saved!" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));

    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('should add an error toast', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <ToastTrigger type="error" message="Failed!" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));

    expect(screen.getByText('Failed!')).toBeInTheDocument();
  });

  it('should add a warning toast', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <ToastTrigger type="warning" message="Caution!" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));

    expect(screen.getByText('Caution!')).toBeInTheDocument();
  });

  it('should add an info toast', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <ToastTrigger type="info" message="Notice" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));

    expect(screen.getByText('Notice')).toBeInTheDocument();
  });

  it('should display title and message', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <ToastTrigger title="Success" message="Operation completed" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('should render action button', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <ToastTrigger
          message="Deleted"
          action={{ label: 'Undo', onClick: handleAction }}
        />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));

    const undoButton = screen.getByText('Undo');
    expect(undoButton).toBeInTheDocument();

    await user.click(undoButton);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should limit toasts to maxToasts', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider maxToasts={2}>
        <ToastTrigger duration={0} />
      </ToastProvider>
    );

    const addButton = screen.getByText('Add Toast');

    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    // Only 2 toasts should be visible (maxToasts=2)
    const messages = screen.getAllByText('Test message');
    expect(messages).toHaveLength(2);
  });
});

describe('Toast - Auto Close', () => {
  it('should auto-remove after duration', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <ToastTrigger duration={3000} message="Temporary" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));
    expect(screen.getByText('Temporary')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.queryByText('Temporary')).not.toBeInTheDocument();
  });

  it('should not auto-remove when duration is 0', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <ToastTrigger duration={0} message="Persistent" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('Persistent')).toBeInTheDocument();
  });
});

describe('Toast - Manual Close', () => {
  it('should close on close button click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <ToastTrigger duration={0} message="Closeable" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));
    expect(screen.getByText('Closeable')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: '닫기' });
    await user.click(closeButton);

    // Wait for exit animation (300ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.queryByText('Closeable')).not.toBeInTheDocument();
  });

  it('should clear all toasts', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <ToastTrigger duration={0} message="Toast A" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));
    expect(screen.getByText('Toast A')).toBeInTheDocument();

    await user.click(screen.getByText('Clear All'));
    expect(screen.queryByText('Toast A')).not.toBeInTheDocument();
  });
});

describe('Toast - Position', () => {
  it('should render in top-right by default', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const { container } = render(
      <ToastProvider>
        <ToastTrigger duration={0} />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));

    const toastContainer = container.querySelector('.fixed.z-50');
    expect(toastContainer?.className).toContain('top-4');
    expect(toastContainer?.className).toContain('right-4');
  });

  it('should render in specified position', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const { container } = render(
      <ToastProvider position="bottom-left">
        <ToastTrigger duration={0} />
      </ToastProvider>
    );

    await user.click(screen.getByText('Add Toast'));

    const toastContainer = container.querySelector('.fixed.z-50');
    expect(toastContainer?.className).toContain('bottom-4');
    expect(toastContainer?.className).toContain('left-4');
  });
});
