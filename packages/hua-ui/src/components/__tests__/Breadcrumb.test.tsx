import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb, BreadcrumbItem } from '../Breadcrumb';

describe('Breadcrumb', () => {
  it('should render with children', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Details</BreadcrumbItem>
      </Breadcrumb>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('should render with items prop', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Details' },
    ];

    render(<Breadcrumb items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('should have nav with aria-label', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>Home</BreadcrumbItem>
      </Breadcrumb>
    );

    const nav = screen.getByLabelText('Breadcrumb');
    expect(nav).toBeInTheDocument();
  });

  it('should render separators between items', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );

    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('should mark current page with aria-current', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Current</BreadcrumbItem>
      </Breadcrumb>
    );

    const current = screen.getByText('Current');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('should render links with href', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/about">About</BreadcrumbItem>
      </Breadcrumb>
    );

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should show home icon when showHomeIcon is true', () => {
    render(
      <Breadcrumb showHomeIcon>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should apply default variant styles', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbItem>Home</BreadcrumbItem>
      </Breadcrumb>
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('inline-flex');
    expect(nav).toHaveClass('items-center');
  });

  it('should apply subtle variant styles', () => {
    const { container } = render(
      <Breadcrumb variant="subtle">
        <BreadcrumbItem>Home</BreadcrumbItem>
      </Breadcrumb>
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('bg-background/40');
    expect(nav).toHaveClass('backdrop-blur-md');
  });

  it('should apply glass variant styles', () => {
    const { container } = render(
      <Breadcrumb variant="glass">
        <BreadcrumbItem>Home</BreadcrumbItem>
      </Breadcrumb>
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('bg-background/30');
    expect(nav).toHaveClass('backdrop-blur-lg');
  });

  it('should render custom separator', () => {
    render(
      <Breadcrumb separator={<span>/</span>}>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );

    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('should merge custom className', () => {
    const { container } = render(
      <Breadcrumb className="custom-class">
        <BreadcrumbItem>Home</BreadcrumbItem>
      </Breadcrumb>
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
    expect(nav).toHaveClass('inline-flex');
  });
});

describe('BreadcrumbItem', () => {
  it('should render text content', () => {
    render(<BreadcrumbItem>Item</BreadcrumbItem>);

    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('should render as link when href provided', () => {
    render(<BreadcrumbItem href="/test">Link</BreadcrumbItem>);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should render as span when no href', () => {
    const { container } = render(<BreadcrumbItem>Text</BreadcrumbItem>);

    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
  });

  it('should apply current styles when isCurrent', () => {
    render(<BreadcrumbItem isCurrent>Current</BreadcrumbItem>);

    const current = screen.getByText('Current');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveClass('text-muted-foreground');
  });
});
