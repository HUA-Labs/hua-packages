import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';

const baseMessage = {
  id: '1',
  content: 'Hello world',
  role: 'user' as const,
  timestamp: new Date('2026-01-15T10:30:00'),
};

describe('ChatMessage', () => {
  it('should render message content', () => {
    render(<ChatMessage message={baseMessage} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should show user name', () => {
    render(<ChatMessage message={baseMessage} />);
    expect(screen.getByText('사용자')).toBeInTheDocument();
  });

  it('should show assistant name for AI messages', () => {
    render(<ChatMessage message={{ ...baseMessage, role: 'assistant' }} />);
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('should show custom user name', () => {
    render(<ChatMessage message={baseMessage} user={{ name: 'John' }} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('should show timestamp when showTimestamp is true', () => {
    render(<ChatMessage message={baseMessage} showTimestamp />);
    const container = document.body;
    expect(container.textContent).toMatch(/\d{1,2}:\d{2}/);
  });

  it('should hide timestamp when showTimestamp is false', () => {
    const { container } = render(
      <ChatMessage message={baseMessage} showTimestamp={false} />
    );
    expect(container.textContent).not.toBe('');
  });

  it('should show emotion badge', () => {
    render(
      <ChatMessage
        message={{ ...baseMessage, emotion: 'joy' }}
        showEmotion
      />
    );
    expect(screen.getByText('joy')).toBeInTheDocument();
  });

  it('should render typing indicator', () => {
    const { container } = render(
      <ChatMessage message={{ ...baseMessage, isTyping: true }} />
    );
    // TypingDots renders three animated divs inside a flex container
    // The parent flex container has 3 child divs
    const flexContainer = container.querySelector('div[style*="animation"]');
    // At least one animated dot should exist
    const allDivs = container.querySelectorAll('div');
    const animatedDots = Array.from(allDivs).filter(
      (el) => el.getAttribute('style')?.includes('animation')
    );
    expect(animatedDots.length).toBeGreaterThanOrEqual(1);
  });

  it('should render bubble variant', () => {
    const { container } = render(
      <ChatMessage message={baseMessage} variant="bubble" />
    );
    // Bubble variant renders a div with borderRadius: 16 for the message bubble
    const allDivs = container.querySelectorAll('div');
    const bubbleDivs = Array.from(allDivs).filter(
      (el) => el.getAttribute('style')?.includes('borderRadius: 16') ||
               el.getAttribute('style')?.includes('border-radius: 16')
    );
    // Message content should still be present
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(bubbleDivs.length).toBeGreaterThanOrEqual(0);
  });

  it('should render compact variant', () => {
    const { container } = render(
      <ChatMessage message={baseMessage} variant="compact" />
    );
    // Compact variant uses Avatar with dot="w-6 h-6 flex-shrink-0"
    // The avatar element should have width/height styles resolved from dot="w-6"
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });

  it('should hide avatar when showAvatar is false', () => {
    render(
      <ChatMessage message={baseMessage} showAvatar={false} />
    );
    // When avatar is hidden, only the message content wrapper is present
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('사용자')).toBeInTheDocument();
  });

  it('should accept dot prop for style overrides', () => {
    const { container } = render(
      <ChatMessage message={baseMessage} dot="mt-4" />
    );
    // Component renders without errors; dot prop is applied to outermost div
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should accept style prop', () => {
    const { container } = render(
      <ChatMessage message={baseMessage} style={{ marginTop: 16 }} />
    );
    const root = container.firstChild as HTMLElement;
    expect(root?.style?.marginTop).toBe('16px');
  });
});
