import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card';

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Card content</Card>);

    const content = screen.getByText('Card content');
    expect(content).toBeInTheDocument();
  });

  it('should apply default variant classes', () => {
    const { container } = render(<Card>Content</Card>);

    const card = container.querySelector('div');
    expect(card).toHaveClass('bg-card');
    expect(card).toHaveClass('text-card-foreground');
    expect(card).toHaveClass('border');
  });

  it('should apply outline variant classes', () => {
    const { container } = render(<Card variant="outline">Content</Card>);

    const card = container.querySelector('div');
    expect(card).toHaveClass('bg-transparent');
    expect(card).toHaveClass('border-2');
  });

  it('should apply elevated variant classes', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);

    const card = container.querySelector('div');
    expect(card).toHaveClass('shadow-lg');
  });

  it('should apply shadow variants', () => {
    const { container } = render(<Card shadow="md">Content</Card>);

    const card = container.querySelector('div');
    expect(card).toHaveClass('shadow-md');
  });

  it('should apply padding variants', () => {
    const { container } = render(<Card padding="lg">Content</Card>);

    const card = container.querySelector('div');
    expect(card).toHaveClass('p-6');
  });

  it('should apply hoverable styles', () => {
    const { container } = render(<Card hoverable>Content</Card>);

    const card = container.querySelector('div');
    expect(card).toHaveClass('transition-shadow');
    expect(card).toHaveClass('hover:shadow-lg');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('should merge custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);

    const card = container.querySelector('div');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveClass('rounded-lg');
  });
});

describe('CardHeader', () => {
  it('should render children', () => {
    render(<CardHeader>Header content</CardHeader>);

    const header = screen.getByText('Header content');
    expect(header).toBeInTheDocument();
  });

  it('should apply default classes', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);

    const header = container.querySelector('div');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
    expect(header).toHaveClass('p-3');
  });
});

describe('CardTitle', () => {
  it('should render title', () => {
    render(<CardTitle>Title</CardTitle>);

    const title = screen.getByText('Title');
    expect(title).toBeInTheDocument();
  });

  it('should render as h3 element', () => {
    const { container } = render(<CardTitle>Title</CardTitle>);

    const title = container.querySelector('h3');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('font-semibold');
  });
});

describe('CardDescription', () => {
  it('should render description', () => {
    render(<CardDescription>Description text</CardDescription>);

    const description = screen.getByText('Description text');
    expect(description).toBeInTheDocument();
  });

  it('should apply muted text color', () => {
    const { container } = render(<CardDescription>Description</CardDescription>);

    const description = container.querySelector('p');
    expect(description).toHaveClass('text-muted-foreground');
  });
});

describe('CardContent', () => {
  it('should render content', () => {
    render(<CardContent>Content</CardContent>);

    const content = screen.getByText('Content');
    expect(content).toBeInTheDocument();
  });

  it('should apply padding classes', () => {
    const { container } = render(<CardContent>Content</CardContent>);

    const content = container.querySelector('div');
    expect(content).toHaveClass('px-3');
    expect(content).toHaveClass('pb-3');
  });
});

describe('CardFooter', () => {
  it('should render footer', () => {
    render(<CardFooter>Footer</CardFooter>);

    const footer = screen.getByText('Footer');
    expect(footer).toBeInTheDocument();
  });

  it('should apply flex layout', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);

    const footer = container.querySelector('div');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('items-center');
  });
});
