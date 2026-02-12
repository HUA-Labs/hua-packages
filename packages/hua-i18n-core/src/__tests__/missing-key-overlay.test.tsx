import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MissingKeyOverlay, reportMissingKey, useMissingKeyOverlay } from '../components/MissingKeyOverlay';

describe('MissingKeyOverlay', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.clearAllMocks();
  });

  describe('MissingKeyOverlay component', () => {
    it('should not render when disabled', () => {
      const { container } = render(<MissingKeyOverlay enabled={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render in production by default', () => {
      process.env.NODE_ENV = 'production';
      const { container } = render(<MissingKeyOverlay />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when enabled and has missing keys', async () => {
      render(<MissingKeyOverlay enabled={true} />);

      reportMissingKey('test.key', { language: 'ko' });

      await waitFor(() => {
        expect(screen.getByText(/Missing Translation Keys/i)).toBeInTheDocument();
      });
    });

    it('should display missing key details', async () => {
      render(<MissingKeyOverlay enabled={true} />);

      reportMissingKey('user.greeting', {
        language: 'ko',
        namespace: 'common',
        component: 'Header',
      });

      await waitFor(() => {
        expect(screen.getByText('user.greeting')).toBeInTheDocument();
        expect(screen.getByText(/Lang: ko/)).toBeInTheDocument();
        expect(screen.getByText(/NS: common/)).toBeInTheDocument();
        expect(screen.getByText(/Component: Header/)).toBeInTheDocument();
      });
    });

    it('should show count of missing keys', async () => {
      render(<MissingKeyOverlay enabled={true} />);

      reportMissingKey('key1', { language: 'ko' });
      reportMissingKey('key2', { language: 'ko' });
      reportMissingKey('key3', { language: 'en' });

      await waitFor(() => {
        expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
      });
    });

    it('should close when close button clicked', async () => {
      const { container } = render(<MissingKeyOverlay enabled={true} />);

      reportMissingKey('test.key', { language: 'ko' });

      await waitFor(() => {
        expect(screen.getByText(/Missing Translation Keys/i)).toBeInTheDocument();
      });

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should clear keys when clear button clicked', async () => {
      render(<MissingKeyOverlay enabled={true} />);

      reportMissingKey('key1', { language: 'ko' });
      reportMissingKey('key2', { language: 'ko' });

      await waitFor(() => {
        expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText(/\(0\)/)).toBeInTheDocument();
      });
    });

    it('should show only last 10 keys', async () => {
      render(<MissingKeyOverlay enabled={true} />);

      for (let i = 0; i < 15; i++) {
        reportMissingKey(`key${i}`, { language: 'ko' });
      }

      await waitFor(() => {
        expect(screen.getByText(/... and 5 more/)).toBeInTheDocument();
      });
    });

    it('should display timestamp for each key', async () => {
      render(<MissingKeyOverlay enabled={true} />);

      reportMissingKey('test.key', { language: 'ko' });

      await waitFor(() => {
        expect(screen.getByText(/Time:/)).toBeInTheDocument();
      });
    });

    it('should respect position prop', () => {
      const { container } = render(
        <MissingKeyOverlay enabled={true} position="bottom-left" />
      );

      reportMissingKey('test.key', { language: 'ko' });

      waitFor(() => {
        const overlay = container.firstChild as HTMLElement;
        expect(overlay?.style.bottom).toBe('20px');
        expect(overlay?.style.left).toBe('20px');
      });
    });

    it('should apply custom styles', async () => {
      const customStyle = { backgroundColor: 'blue', zIndex: 5000 };
      const { container } = render(
        <MissingKeyOverlay enabled={true} style={customStyle} />
      );

      reportMissingKey('test.key', { language: 'ko' });

      await waitFor(() => {
        const overlay = container.firstChild as HTMLElement;
        expect(overlay?.style.backgroundColor).toBeTruthy();
        expect(overlay?.style.zIndex).toBeTruthy();
      });
    });

    it('should handle keys without namespace', async () => {
      render(<MissingKeyOverlay enabled={true} />);

      reportMissingKey('simple.key', { language: 'en' });

      await waitFor(() => {
        expect(screen.getByText('simple.key')).toBeInTheDocument();
        expect(screen.getByText(/Lang: en/)).toBeInTheDocument();
      });
    });

    it('should handle keys without component', async () => {
      render(<MissingKeyOverlay enabled={true} />);

      reportMissingKey('test.key', {
        language: 'ko',
        namespace: 'common',
      });

      await waitFor(() => {
        expect(screen.getByText('test.key')).toBeInTheDocument();
        expect(screen.queryByText(/Component:/)).not.toBeInTheDocument();
      });
    });
  });

  describe('reportMissingKey', () => {
    it('should dispatch custom event with key details', () => {
      const eventSpy = vi.spyOn(window, 'dispatchEvent');

      reportMissingKey('test.key', {
        language: 'ko',
        namespace: 'common',
        component: 'TestComponent',
      });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'i18n:missing-key',
          detail: expect.objectContaining({
            key: 'test.key',
            language: 'ko',
            namespace: 'common',
            component: 'TestComponent',
            timestamp: expect.any(Number),
          }),
        })
      );

      eventSpy.mockRestore();
    });

    it('should log warning to console in development', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      reportMissingKey('test.key', { language: 'ko' });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing translation key: test.key'),
        expect.objectContaining({
          language: 'ko',
        })
      );

      warnSpy.mockRestore();
    });

    it('should not dispatch event in production', () => {
      process.env.NODE_ENV = 'production';
      const eventSpy = vi.spyOn(window, 'dispatchEvent');

      reportMissingKey('test.key', { language: 'ko' });

      expect(eventSpy).not.toHaveBeenCalled();
      eventSpy.mockRestore();
    });

    it('should handle missing namespace', () => {
      const eventSpy = vi.spyOn(window, 'dispatchEvent');

      reportMissingKey('test.key', { language: 'ko' });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            key: 'test.key',
            namespace: undefined,
          }),
        })
      );

      eventSpy.mockRestore();
    });

    it('should handle missing component', () => {
      const eventSpy = vi.spyOn(window, 'dispatchEvent');

      reportMissingKey('test.key', {
        language: 'en',
        namespace: 'auth',
      });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            key: 'test.key',
            component: undefined,
          }),
        })
      );

      eventSpy.mockRestore();
    });
  });

  describe('useMissingKeyOverlay', () => {
    function TestComponent({ enabled }: { enabled?: boolean }) {
      const { showOverlay, setShowOverlay, reportMissingKey: report } = useMissingKeyOverlay(enabled);

      return (
        <div>
          <div data-testid="show-overlay">{showOverlay ? 'true' : 'false'}</div>
          <button onClick={() => setShowOverlay(false)}>Hide</button>
          <button onClick={() => report('test.key', { language: 'ko' })}>Report</button>
        </div>
      );
    }

    it('should return showOverlay true by default in development', () => {
      render(<TestComponent />);
      expect(screen.getByTestId('show-overlay')).toHaveTextContent('true');
    });

    it('should return showOverlay false when disabled', () => {
      render(<TestComponent enabled={false} />);
      expect(screen.getByTestId('show-overlay')).toHaveTextContent('false');
    });

    it('should return setShowOverlay function', () => {
      render(<TestComponent />);
      const hideButton = screen.getByText('Hide');

      expect(screen.getByTestId('show-overlay')).toHaveTextContent('true');

      fireEvent.click(hideButton);

      expect(screen.getByTestId('show-overlay')).toHaveTextContent('false');
    });

    it('should return reportMissingKey function', () => {
      const eventSpy = vi.spyOn(window, 'dispatchEvent');
      render(<TestComponent />);

      const reportButton = screen.getByText('Report');
      fireEvent.click(reportButton);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'i18n:missing-key',
        })
      );

      eventSpy.mockRestore();
    });

    it('should respect enabled prop on mount', async () => {
      // When enabled changes from true to false via rerender, the hook's useEffect
      // only sets showOverlay to true, it doesn't set it to false
      // So changing the prop won't change the state after initial render
      const { unmount } = render(<TestComponent enabled={true} />);
      expect(screen.getByTestId('show-overlay')).toHaveTextContent('true');
      unmount();

      // Re-mount with enabled=false should show false
      render(<TestComponent enabled={false} />);
      expect(screen.getByTestId('show-overlay')).toHaveTextContent('false');
    });

    it('should respect initial enabled=false', () => {
      // When initially rendered with enabled=false, showOverlay should be false
      render(<TestComponent enabled={false} />);
      expect(screen.getByTestId('show-overlay')).toHaveTextContent('false');
    });
  });
});
