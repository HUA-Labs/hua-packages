import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from '../Grid';

describe('Grid', () => {
  it('should render children', () => {
    render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should apply grid layout', () => {
    const { container } = render(<Grid>Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveClass('grid');
  });

  it('should apply responsive columns by default', () => {
    const { container } = render(<Grid cols={3}>Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('should apply fixed columns when responsive is false', () => {
    const { container } = render(<Grid cols={4} responsive={false}>Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveClass('grid-cols-4');
  });

  it('should apply default gap', () => {
    const { container } = render(<Grid>Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveClass('gap-6');
  });

  it('should apply small gap', () => {
    const { container } = render(<Grid gap="sm">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveClass('gap-4');
  });

  it('should apply large gap', () => {
    const { container } = render(<Grid gap="lg">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveClass('gap-8');
  });

  it('should apply gapX', () => {
    const { container } = render(<Grid gapX="lg">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveClass('gap-x-8');
  });

  it('should apply gapY', () => {
    const { container } = render(<Grid gapY="sm">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveClass('gap-y-4');
  });

  it('should apply both gapX and gapY', () => {
    const { container } = render(<Grid gapX="lg" gapY="sm">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveClass('gap-x-8');
    expect(grid).toHaveClass('gap-y-4');
  });

  it('should merge custom className', () => {
    const { container } = render(<Grid className="custom-class">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveClass('custom-class');
    expect(grid).toHaveClass('grid');
  });
});
