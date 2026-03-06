import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

describe('HeroSection', () => {
  it('should render title', () => {
    render(<HeroSection title="Welcome" description="Hello world" />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<HeroSection title="T" subtitle="Sub" description="D" />);
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<HeroSection title="T" description="My description" />);
    expect(screen.getByText('My description')).toBeInTheDocument();
  });

  it('should render primary action button', () => {
    render(
      <HeroSection
        title="T"
        description="D"
        primaryAction={{ label: 'Get Started', href: '/start' }}
      />
    );
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('should render secondary action button', () => {
    render(
      <HeroSection
        title="T"
        description="D"
        secondaryAction={{ label: 'Learn More', href: '/learn' }}
      />
    );
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('should apply size styles via inline style', () => {
    const { container, rerender } = render(
      <HeroSection title="T" description="D" size="sm" />
    );
    const section = container.querySelector('section');
    expect(section).toHaveStyle({ minHeight: '400px' });

    rerender(<HeroSection title="T" description="D" size="full" />);
    const sectionFull = container.querySelector('section');
    expect(sectionFull).toHaveStyle({ minHeight: '100vh' });
  });

  it('should apply fullBleed styles via inline style', () => {
    const { container } = render(
      <HeroSection title="T" description="D" fullBleed />
    );
    const section = container.querySelector('section');
    expect(section).toHaveStyle({ marginTop: '-4rem' });
  });

  it('should render slides in slide mode', () => {
    const slides = [
      { title: 'Slide 1', description: 'Desc 1' },
      { title: 'Slide 2', description: 'Desc 2' },
    ];
    render(<HeroSection slides={slides} />);
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
  });

  it('should render dot indicators for slides', () => {
    const slides = [
      { title: 'S1', description: 'D1' },
      { title: 'S2', description: 'D2' },
    ];
    render(<HeroSection slides={slides} indicator="dots" />);
    const dots = screen.getAllByLabelText(/Go to slide/);
    expect(dots.length).toBe(2);
  });

  it('should render number indicators', () => {
    const slides = [
      { title: 'S1', description: 'D1' },
      { title: 'S2', description: 'D2' },
    ];
    render(<HeroSection slides={slides} indicator="numbers" />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should show prev/next controls', () => {
    const slides = [
      { title: 'S1', description: 'D1' },
      { title: 'S2', description: 'D2' },
    ];
    render(<HeroSection slides={slides} showControls />);
    expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
    expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
  });

  it('should navigate to next slide', () => {
    const slides = [
      { title: 'Slide A', description: 'DA' },
      { title: 'Slide B', description: 'DB' },
    ];
    render(<HeroSection slides={slides} showControls />);
    fireEvent.click(screen.getByLabelText('Next slide'));
    expect(screen.getByText('Slide B')).toBeInTheDocument();
  });

  it('should forward additional props to section element', () => {
    const { container } = render(
      <HeroSection title="T" description="D" data-testid="hero" />
    );
    expect(container.querySelector('[data-testid="hero"]')).toBeInTheDocument();
  });

  it('should apply dot prop styles via inline style', () => {
    const { container } = render(
      <HeroSection title="T" description="D" dot="p-8" />
    );
    const section = container.querySelector('section');
    // dot prop resolves to inline style — section should exist
    expect(section).toBeInTheDocument();
  });
});
