import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bookmark } from '../Bookmark';

beforeEach(() => {
  localStorage.clear();
});

describe('Bookmark', () => {
  it('should render as a button', () => {
    render(<Bookmark id="item-1" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should toggle bookmark on click', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<Bookmark id="item-1" onBookmarkChange={handleChange} />);

    await user.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('should persist bookmark to localStorage', async () => {
    const user = userEvent.setup();

    render(<Bookmark id="article-1" />);

    await user.click(screen.getByRole('button'));

    const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    expect(saved).toContain('article-1');
  });

  it('should remove from localStorage on second click', async () => {
    const user = userEvent.setup();

    render(<Bookmark id="article-1" />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByRole('button'));

    const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    expect(saved).not.toContain('article-1');
  });

  it('should use custom storageKey', async () => {
    const user = userEvent.setup();

    render(<Bookmark id="item-1" storageKey="favorites" />);

    await user.click(screen.getByRole('button'));

    expect(localStorage.getItem('favorites')).toBeTruthy();
    expect(localStorage.getItem('bookmarks')).toBeNull();
  });

  it('should load initial state from localStorage', async () => {
    localStorage.setItem('bookmarks', JSON.stringify(['existing-1']));

    render(<Bookmark id="existing-1" />);

    await waitFor(() => {
      const icon = screen.getByRole('button').querySelector('span');
      expect(icon?.style.fill).toBe('currentcolor');
    });
  });

  it('should apply size variants', () => {
    const { rerender } = render(<Bookmark id="item-1" size="sm" />);
    expect(screen.getByRole('button')).toHaveDotStyle('w-6');

    rerender(<Bookmark id="item-1" size="lg" />);
    expect(screen.getByRole('button')).toHaveDotStyle('w-10');
  });

  it('should apply variant styles', () => {
    const { rerender } = render(<Bookmark id="item-1" variant="outline" />);
    expect(screen.getByRole('button')).toHaveDotStyle('border');

    rerender(<Bookmark id="item-1" variant="filled" />);
    expect(screen.getByRole('button').style.color).toBe('rgb(137, 110, 0)');
  });

  it('should apply custom className', () => {
    render(<Bookmark id="item-1" className="my-bookmark" />);
    expect(screen.getByRole('button')).toHaveDotStyle('my-bookmark');
  });

  it('should respect defaultBookmarked prop', () => {
    render(<Bookmark id="new-item" defaultBookmarked />);

    const icon = screen.getByRole('button').querySelector('span');
    expect(icon?.style.fill).toBe('currentcolor');
  });
});
