import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageNavigation } from '../PageNavigation';

describe('PageNavigation', () => {
  it('should render nothing when no pages provided', () => {
    const { container } = render(<PageNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it('should render previous page link', () => {
    render(<PageNavigation prevPage={{ title: 'Getting Started', href: '/start' }} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/start');
  });

  it('should render next page link', () => {
    render(<PageNavigation nextPage={{ title: 'Advanced', href: '/advanced' }} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/advanced');
  });

  it('should render both prev and next links', () => {
    render(
      <PageNavigation
        prevPage={{ title: 'Intro', href: '/intro' }}
        nextPage={{ title: 'Next', href: '/next' }}
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
      />
    );

    expect(screen.getByText('Previous Chapter')).toBeInTheDocument();
    expect(screen.getByText('Next Chapter')).toBeInTheDocument();
  });

  it('should be hidden on mobile by default', () => {
    const { container } = render(
      <PageNavigation prevPage={{ title: 'Prev', href: '/prev' }} />
    );

    const nav = container.firstChild as HTMLElement;
    expect(nav.className).toContain('hidden');
    expect(nav.className).toContain('md:flex');
  });

  it('should show on mobile when showOnMobile is true', () => {
    const { container } = render(
      <PageNavigation prevPage={{ title: 'Prev', href: '/prev' }} showOnMobile />
    );

    const nav = container.firstChild as HTMLElement;
    expect(nav.className).not.toContain('hidden');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PageNavigation
        prevPage={{ title: 'Prev', href: '/prev' }}
        className="my-nav"
      />
    );

    expect(container.querySelector('.my-nav')).toBeInTheDocument();
  });
});
