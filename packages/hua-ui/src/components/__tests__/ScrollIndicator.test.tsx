import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollIndicator } from '../ScrollIndicator';

describe('ScrollIndicator', () => {
  it('should render default text', () => {
    render(<ScrollIndicator />);
    expect(screen.getByText('Scroll down')).toBeInTheDocument();
  });

  it('should render custom text', () => {
    render(<ScrollIndicator text="Next section" />);
    expect(screen.getByText('Next section')).toBeInTheDocument();
  });

  it('should have aria-label', () => {
    render(<ScrollIndicator text="Go down" />);
    expect(screen.getByLabelText('Go down')).toBeInTheDocument();
  });

  it('should apply bottom-center position by default', () => {
    const { container } = render(<ScrollIndicator />);
    expect(container.querySelector('.left-1\\/2')).toBeInTheDocument();
  });

  it('should apply bottom-right position', () => {
    const { container } = render(<ScrollIndicator position="bottom-right" />);
    expect(container.querySelector('.right-8')).toBeInTheDocument();
  });

  it('should apply bottom-left position', () => {
    const { container } = render(<ScrollIndicator position="bottom-left" />);
    expect(container.querySelector('.left-8')).toBeInTheDocument();
  });

  it('should apply animate-bounce when animated', () => {
    const { container } = render(<ScrollIndicator animated />);
    expect(container.querySelector('.animate-bounce')).toBeInTheDocument();
  });

  it('should not animate when animated is false', () => {
    const { container } = render(<ScrollIndicator animated={false} />);
    expect(container.querySelector('.animate-bounce')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<ScrollIndicator className="my-indicator" />);
    expect(container.querySelector('.my-indicator')).toBeInTheDocument();
  });
});
