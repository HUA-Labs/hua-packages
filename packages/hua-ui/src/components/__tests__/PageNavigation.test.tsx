import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageNavigation } from '../PageNavigation';

describe('PageNavigation', () => {
  it('should render nothing when no pages provided', () => {
    const { container } = render(<PageNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it('should render previous page link', () => {
    render(<PageNavigation prevPage={{ title: 'Getting Started', href: '/start' }} showOnMobile />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/start');
  });

  it('should render next page link', () => {
    render(<PageNavigation nextPage={{ title: 'Advanced', href: '/advanced' }} showOnMobile />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/advanced');
  });

  it('should render both prev and next links', () => {
    render(
      <PageNavigation
        prevPage={{ title: 'Intro', href: '/intro' }}
        nextPage={{ title: 'Next', href: '/next' }}
        showOnMobile
      />
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
  });

  it('should display page titles', () => {
    render(
      <PageNavigation
        prevPage={{ title: 'Previous Chapter', href: '/prev' }}
        nextPage={{ title: 'Next Chapter', href: '/next' }}
        showOnMobile
      />
    );

    expect(screen.getByText('Previous Chapter')).toBeInTheDocument();
    expect(screen.getByText('Next Chapter')).toBeInTheDocument();
  });

  it('should be hidden on mobile by default (display: none)', () => {
    const { container } = render(
      <PageNavigation prevPage={{ title: 'Prev', href: '/prev' }} />
    );

    const nav = container.firstChild as HTMLElement;
    expect(nav.style.display).toBe('none');
  });

  it('should show when showOnMobile is true (display not none)', () => {
    const { container } = render(
      <PageNavigation prevPage={{ title: 'Prev', href: '/prev' }} showOnMobile />
    );

    const nav = container.firstChild as HTMLElement;
    expect(nav.style.display).not.toBe('none');
  });

  it('should apply custom dot styles', () => {
    const { container } = render(
      <PageNavigation
        prevPage={{ title: 'Prev', href: '/prev' }}
        dot="py-8"
        showOnMobile
      />
    );

    const nav = container.firstChild as HTMLElement;
    expect(nav.style.paddingTop).toBeTruthy();
    expect(nav.style.paddingBottom).toBeTruthy();
  });

  it('should apply custom inline style', () => {
    const { container } = render(
      <PageNavigation
        prevPage={{ title: 'Prev', href: '/prev' }}
        style={{ marginTop: '2rem' }}
        showOnMobile
      />
    );

    const nav = container.firstChild as HTMLElement;
    expect(nav.style.marginTop).toBe('2rem');
  });
});
