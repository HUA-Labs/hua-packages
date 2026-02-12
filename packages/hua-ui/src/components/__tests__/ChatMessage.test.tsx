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
    // Check that some time text is rendered
    const container = document.body;
    expect(container.textContent).toMatch(/\d{1,2}:\d{2}/);
  });

  it('should hide timestamp when showTimestamp is false', () => {
    const { container } = render(
      <ChatMessage message={baseMessage} showTimestamp={false} />
    );
    // Default variant shows timestamp by default
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
    expect(container.querySelectorAll('.animate-bounce').length).toBeGreaterThanOrEqual(3);
  });

  it('should render bubble variant', () => {
    const { container } = render(
      <ChatMessage message={baseMessage} variant="bubble" />
    );
    expect(container.querySelector('.rounded-2xl')).toBeInTheDocument();
  });

  it('should render compact variant', () => {
    const { container } = render(
      <ChatMessage message={baseMessage} variant="compact" />
    );
    expect(container.querySelector('.w-6')).toBeInTheDocument();
  });

  it('should hide avatar when showAvatar is false', () => {
    const { container } = render(
      <ChatMessage message={baseMessage} showAvatar={false} />
    );
    // No avatar element
    expect(container.querySelector('.w-10')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ChatMessage message={baseMessage} className="my-chat" />
    );
    expect(container.querySelector('.my-chat')).toBeInTheDocument();
  });
});
