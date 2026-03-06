import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../ThemeProvider';

function renderWithTheme(ui: React.ReactElement, defaultTheme: 'light' | 'dark' = 'light') {
  return render(
    <ThemeProvider defaultTheme={defaultTheme}>
      {ui}
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('should render toggle button', () => {
    renderWithTheme(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should toggle from light to dark on click', () => {
    renderWithTheme(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should show label when showLabel is true', () => {
    renderWithTheme(<ThemeToggle showLabel />);
    expect(screen.getByText('라이트')).toBeInTheDocument();
  });

  it('should show custom label', () => {
    renderWithTheme(<ThemeToggle showLabel label={{ light: 'Light', dark: 'Dark' }} />);
    expect(screen.getByText('Light')).toBeInTheDocument();
  });

  it('should render icon variant with two animated icon layers', () => {
    const { container } = renderWithTheme(<ThemeToggle variant="icon" />);
    // Icon variant uses inline style with position:absolute for the two icon layers
    const absoluteDivs = Array.from(container.querySelectorAll('div')).filter(
      (el) => (el as HTMLElement).style.position === 'absolute'
    );
    expect(absoluteDivs.length).toBeGreaterThanOrEqual(2);
  });

  it('should render switch variant as a button', () => {
    renderWithTheme(<ThemeToggle variant="switch" />);
    const btn = screen.getByRole('button');
    // Switch track is styled via inline styles with borderRadius 9999
    expect(btn).toBeInTheDocument();
  });

  it('should accept dot prop without error', () => {
    const { container } = renderWithTheme(<ThemeToggle dot="p-2" />);
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('should pass through arbitrary button props', () => {
    renderWithTheme(<ThemeToggle aria-label="toggle theme" />);
    expect(screen.getByRole('button', { name: 'toggle theme' })).toBeInTheDocument();
  });
});
