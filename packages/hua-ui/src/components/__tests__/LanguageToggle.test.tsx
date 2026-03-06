import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageToggle } from '../LanguageToggle';

describe('LanguageToggle', () => {
  it('should render current language flag', () => {
    render(<LanguageToggle currentLanguage="ko" />);
    expect(screen.getByText('🇰🇷')).toBeInTheDocument();
  });

  it('should cycle to next language on button click', () => {
    const handleChange = vi.fn();
    render(<LanguageToggle currentLanguage="ko" onLanguageChange={handleChange} />);
    fireEvent.click(screen.getByText('🇰🇷'));
    expect(handleChange).toHaveBeenCalledWith('en');
  });

  it('should wrap around languages', () => {
    const handleChange = vi.fn();
    render(<LanguageToggle currentLanguage="zh" onLanguageChange={handleChange} />);
    fireEvent.click(screen.getByText('🇨🇳'));
    expect(handleChange).toHaveBeenCalledWith('ko');
  });

  it('should show label when showLabel is true', () => {
    render(<LanguageToggle showLabel currentLanguage="en" />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should render dropdown variant', () => {
    render(<LanguageToggle variant="dropdown" currentLanguage="ko" />);
    fireEvent.click(screen.getByText('🇰🇷'));
    // Dropdown opens, showing all languages
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('should select language from dropdown', () => {
    const handleChange = vi.fn();
    render(
      <LanguageToggle variant="dropdown" currentLanguage="ko" onLanguageChange={handleChange} />
    );
    fireEvent.click(screen.getByText('🇰🇷'));
    fireEvent.click(screen.getByText('English'));
    expect(handleChange).toHaveBeenCalledWith('en');
  });

  it('should render icon variant', () => {
    render(<LanguageToggle variant="icon" currentLanguage="ko" />);
    fireEvent.click(screen.getByText('🇰🇷'));
    expect(screen.getByText('한국어')).toBeInTheDocument();
  });

  it('should close dropdown on outside click', () => {
    render(<LanguageToggle variant="dropdown" currentLanguage="ko" />);
    fireEvent.click(screen.getByText('🇰🇷'));
    expect(screen.getByText('English')).toBeInTheDocument();
    // Click outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('English')).not.toBeInTheDocument();
  });

  it('should apply custom dot style', () => {
    const { container } = render(<LanguageToggle style={{ opacity: 0.5 }} />);
    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.style.opacity).toBe('0.5');
  });
});
