import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('should render page numbers', () => {
    const handlePageChange = vi.fn();

    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should highlight current page', () => {
    const handlePageChange = vi.fn();

    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    const currentPageButton = screen.getByRole('button', { name: '3페이지로 이동' });
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('should show previous and next buttons', () => {
    const handlePageChange = vi.fn();

    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.getByLabelText('이전 페이지로 이동')).toBeInTheDocument();
    expect(screen.getByLabelText('다음 페이지로 이동')).toBeInTheDocument();
  });

  it('should call onChange when clicking page', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    const page3Button = screen.getByRole('button', { name: '3페이지로 이동' });
    await user.click(page3Button);

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  it('should hide previous button on first page', () => {
    const handlePageChange = vi.fn();

    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.queryByLabelText('이전 페이지로 이동')).not.toBeInTheDocument();
  });

  it('should hide next button on last page', () => {
    const handlePageChange = vi.fn();

    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.queryByLabelText('다음 페이지로 이동')).not.toBeInTheDocument();
  });

  it('should show first and last page buttons', () => {
    const handlePageChange = vi.fn();

    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={handlePageChange}
      />
    );

    expect(screen.getByLabelText('첫 페이지로 이동')).toBeInTheDocument();
    expect(screen.getByLabelText('마지막 페이지로 이동')).toBeInTheDocument();
  });

  it('should navigate to previous page', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    const prevButton = screen.getByLabelText('이전 페이지로 이동');
    await user.click(prevButton);

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('should navigate to next page', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    );

    const nextButton = screen.getByLabelText('다음 페이지로 이동');
    await user.click(nextButton);

    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('should show ellipsis for many pages', () => {
    const handlePageChange = vi.fn();

    render(
      <Pagination
        currentPage={10}
        totalPages={20}
        onPageChange={handlePageChange}
        maxVisiblePages={5}
      />
    );

    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('should navigate to first page', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={handlePageChange}
      />
    );

    const firstButton = screen.getByLabelText('첫 페이지로 이동');
    await user.click(firstButton);

    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  it('should navigate to last page', async () => {
    const handlePageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={handlePageChange}
      />
    );

    const lastButton = screen.getByLabelText('마지막 페이지로 이동');
    await user.click(lastButton);

    expect(handlePageChange).toHaveBeenCalledWith(10);
  });

  it('should support different variants', () => {
    const handlePageChange = vi.fn();

    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={handlePageChange}
        variant="outlined"
      />
    );

    const button = container.querySelector('button[aria-current="page"]');
    expect(button).toHaveClass('border-primary');
  });
});
