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

  it('should render icon variant', () => {
    const { container } = renderWithTheme(<ThemeToggle variant="icon" />);
    // Icon variant has double rotating icons
    expect(container.querySelectorAll('.absolute').length).toBeGreaterThanOrEqual(2);
  });

  it('should render switch variant', () => {
    const { container } = renderWithTheme(<ThemeToggle variant="switch" />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = renderWithTheme(<ThemeToggle className="my-toggle" />);
    expect(container.querySelector('.my-toggle')).toBeInTheDocument();
  });
});
