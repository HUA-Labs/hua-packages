import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeBlock, InlineCode } from '../CodeBlock';

// Mock sugar-high
vi.mock('sugar-high', () => ({
  highlight: (code: string) => `<span class="sh-highlighted">${code}</span>`,
}));

// Mock clipboard
const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  mockWriteText.mockClear();
});

describe('CodeBlock', () => {
  it('should render code content', () => {
    render(<CodeBlock code="console.log('hello')" />);

    expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
  });

  it('should apply dark theme by default', () => {
    const { container } = render(<CodeBlock code="const x = 1" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('bg-[#0d1117]');
  });

  it('should apply light theme', () => {
    const { container } = render(<CodeBlock code="const x = 1" theme="light" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('bg-muted/50');
  });

  it('should display language label when no filename', () => {
    render(<CodeBlock code="x = 1" language="python" />);

    expect(screen.getByText('python')).toBeInTheDocument();
  });

  it('should display filename in header', () => {
    render(<CodeBlock code="x = 1" filename="app.ts" />);

    expect(screen.getByText('app.ts')).toBeInTheDocument();
  });

  it('should display both filename and language', () => {
    render(<CodeBlock code="x = 1" filename="app.ts" language="typescript" />);

    expect(screen.getByText('app.ts')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('should show line numbers when showLineNumbers is true', () => {
    render(<CodeBlock code={"line1\nline2\nline3"} showLineNumbers />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should not show line numbers by default', () => {
    render(<CodeBlock code={"line1\nline2"} />);

    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should show copy button by default', () => {
    render(<CodeBlock code="test" />);

    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
  });

  it('should hide copy button when showCopyButton is false', () => {
    render(<CodeBlock code="test" showCopyButton={false} />);

    expect(screen.queryByRole('button', { name: 'Copy code' })).not.toBeInTheDocument();
  });

  it('should copy code to clipboard on button click', async () => {
    vi.useRealTimers();

    render(<CodeBlock code="const x = 42" />);

    const copyButton = screen.getByRole('button', { name: 'Copy code' });
    await act(async () => {
      copyButton.click();
      // Flush the async clipboard.writeText promise
      await mockWriteText.mock.results[0]?.value;
    });

    expect(mockWriteText).toHaveBeenCalledWith('const x = 42');
  });

  it('should call onCopy callback after copying', async () => {
    vi.useRealTimers();
    const handleCopy = vi.fn();
    const user = userEvent.setup();

    render(<CodeBlock code="test" onCopy={handleCopy} />);

    await user.click(screen.getByRole('button', { name: 'Copy code' }));

    expect(handleCopy).toHaveBeenCalledTimes(1);
  });

  it('should show "Copied" state after copying', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();

    render(<CodeBlock code="test" />);

    await user.click(screen.getByRole('button', { name: 'Copy code' }));

    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<CodeBlock code="x" className="custom-class" />);

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should apply maxHeight style', () => {
    const { container } = render(<CodeBlock code="x" maxHeight="200px" />);

    const scrollContainer = container.querySelector('.overflow-auto') as HTMLElement;
    expect(scrollContainer.style.maxHeight).toBe('200px');
  });
});

describe('InlineCode', () => {
  it('should render inline code', () => {
    render(<InlineCode>npm install</InlineCode>);

    expect(screen.getByText('npm install')).toBeInTheDocument();
    expect(screen.getByText('npm install').tagName).toBe('CODE');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <InlineCode className="my-custom">test</InlineCode>
    );

    expect(container.querySelector('.my-custom')).toBeInTheDocument();
  });
});
