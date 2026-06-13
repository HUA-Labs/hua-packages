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
    expect(grid).toHaveDotStyle('grid');
  });

  it('should apply responsive columns by default', () => {
    const { container } = render(<Grid cols={3}>Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid?.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
  });

  it('should apply fixed columns when responsive is false', () => {
    const { container } = render(<Grid cols={4} responsive={false}>Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveDotStyle('grid-cols-4');
  });

  it('should apply default gap', () => {
    const { container } = render(<Grid>Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveDotStyle('gap-6');
  });

  it('should apply small gap', () => {
    const { container } = render(<Grid gap="sm">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveDotStyle('gap-4');
  });

  it('should apply large gap', () => {
    const { container } = render(<Grid gap="lg">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveDotStyle('gap-8');
  });

  it('should apply gapX', () => {
    const { container } = render(<Grid gapX="lg">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid?.style.columnGap).toBe('2rem');
  });

  it('should apply gapY', () => {
    const { container } = render(<Grid gapY="sm">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid?.style.rowGap).toBe('1rem');
  });

  it('should apply both gapX and gapY', () => {
    const { container } = render(<Grid gapX="lg" gapY="sm">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid?.style.columnGap).toBe('2rem');
    expect(grid?.style.rowGap).toBe('1rem');
  });

  it('should merge custom className', () => {
    const { container } = render(<Grid className="custom-class">Content</Grid>);

    const grid = container.querySelector('div');
    expect(grid).toHaveDotStyle('custom-class');
    expect(grid).toHaveDotStyle('grid');
  });
});
