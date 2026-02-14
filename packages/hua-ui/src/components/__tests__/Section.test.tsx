import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from '../Section';

describe('Section', () => {
  it('should render as <section> element', () => {
    const { container } = render(<Section>Content</Section>);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('should render children', () => {
    render(<Section>Section content</Section>);
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('should apply default spacing (lg)', () => {
    const { container } = render(<Section>Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-20');
  });

  it('should apply sm spacing', () => {
    const { container } = render(<Section spacing="sm">Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-12');
  });

  it('should apply md spacing', () => {
    const { container } = render(<Section spacing="md">Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-16');
  });

  it('should apply xl spacing', () => {
    const { container } = render(<Section spacing="xl">Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-28');
  });

  it('should apply none spacing', () => {
    const { container } = render(<Section spacing="none">Content</Section>);
    const section = container.querySelector('section');
    expect(section).not.toHaveClass('py-20');
    expect(section).not.toHaveClass('py-12');
  });

  it('should apply muted background', () => {
    const { container } = render(<Section background="muted">Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-muted/30');
  });

  it('should apply accent background', () => {
    const { container } = render(<Section background="accent">Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-accent/5');
  });

  it('should apply primary background', () => {
    const { container } = render(<Section background="primary">Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-primary/5');
  });

  it('should render header with title', () => {
    render(<Section header={{ title: "Test Title" }}>Content</Section>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('should render header with subtitle', () => {
    render(
      <Section header={{ title: "Title", subtitle: "Subtitle text" }}>
        Content
      </Section>
    );
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('should render header action', () => {
    render(
      <Section header={{ title: "Title", action: <button>Click me</button> }}>
        Content
      </Section>
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render section-line decorator by default', () => {
    const { container } = render(
      <Section header={{ title: "Title" }}>Content</Section>
    );
    const decorator = container.querySelector('[aria-hidden="true"]');
    expect(decorator).not.toBeNull();
  });

  it('should hide section-line when decorator is false', () => {
    const { container } = render(
      <Section header={{ title: "Title", decorator: false }}>Content</Section>
    );
    const decorator = container.querySelector('[aria-hidden="true"]');
    expect(decorator).toBeNull();
  });

  it('should use Container by default (not fullWidth)', () => {
    const { container } = render(<Section>Content</Section>);
    // Container renders a div with max-w-6xl by default
    const innerDiv = container.querySelector('section > div');
    expect(innerDiv).toHaveClass('max-w-6xl');
  });

  it('should skip Container in fullWidth mode', () => {
    const { container } = render(<Section fullWidth>Content</Section>);
    const section = container.querySelector('section');
    // In fullWidth mode, children are directly inside section (no Container wrapper)
    const innerDiv = section?.querySelector('.max-w-6xl');
    expect(innerDiv).toBeNull();
  });

  it('should merge custom className', () => {
    const { container } = render(
      <Section className="custom-class">Content</Section>
    );
    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
    expect(section).toHaveClass('relative');
  });

  it('should forward ref', () => {
    const ref = { current: null as HTMLElement | null };
    render(
      <Section ref={ref}>Content</Section>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('SECTION');
  });

  it('should not render h2 when header is not provided', () => {
    const { container } = render(<Section>Content</Section>);
    expect(container.querySelector('h2')).toBeNull();
  });

  it('should apply px-6 padding', () => {
    const { container } = render(<Section>Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveClass('px-6');
  });

  it('should pass container size prop', () => {
    const { container } = render(<Section container="sm">Content</Section>);
    const innerDiv = container.querySelector('section > div');
    expect(innerDiv).toHaveClass('max-w-2xl');
  });
});
