import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentLayout } from '../ComponentLayout';

describe('ComponentLayout', () => {
  it('should render title', () => {
    render(<ComponentLayout title="Button" description="A button">Content</ComponentLayout>);
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<ComponentLayout title="T" description="My description">Content</ComponentLayout>);
    expect(screen.getByText('My description')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(<ComponentLayout title="T" description="D">Child content</ComponentLayout>);
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should render breadcrumb items', () => {
    render(
      <ComponentLayout
        title="T"
        description="D"
        breadcrumbItems={[
          { label: 'Home', href: '/' },
          { label: 'Components', href: '/components' },
          { label: 'Button' },
        ]}
      >
        Content
      </ComponentLayout>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('should render prev page link', () => {
    render(
      <ComponentLayout
        title="T"
        description="D"
        prevPage={{ title: 'Previous', href: '/prev' }}
      >
        Content
      </ComponentLayout>
    );
    const link = document.querySelector('a[href="/prev"]');
    expect(link).toBeInTheDocument();
  });

  it('should render next page link', () => {
    render(
      <ComponentLayout
        title="T"
        description="D"
        nextPage={{ title: 'Next', href: '/next' }}
      >
        Content
      </ComponentLayout>
    );
    const link = document.querySelector('a[href="/next"]');
    expect(link).toBeInTheDocument();
  });

  it('should show prev page title in mobile nav', () => {
    render(
      <ComponentLayout
        title="T"
        description="D"
        prevPage={{ title: 'Accordion', href: '/accordion' }}
      >
        Content
      </ComponentLayout>
    );
    expect(screen.getByText('Accordion')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ComponentLayout title="T" description="D" className="my-layout">Content</ComponentLayout>
    );
    expect(container.querySelector('.my-layout')).toBeInTheDocument();
  });
});
