import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollIndicator } from '../ScrollIndicator';

/** When animated=true (default), the render is a Fragment: <style> + <div>.
 *  When animated=false, it's just <div>.
 *  Use querySelector to target the wrapper div reliably.
 */
function getWrapper(container: HTMLElement): HTMLElement {
  return container.querySelector('div') as HTMLElement;
}

describe('ScrollIndicator', () => {
  it('should render default text', () => {
    render(<ScrollIndicator />);
    expect(screen.getByText('Scroll down')).toBeInTheDocument();
  });

  it('should render custom text', () => {
    render(<ScrollIndicator text="Next section" />);
    expect(screen.getByText('Next section')).toBeInTheDocument();
  });

  it('should have aria-label on the button', () => {
    render(<ScrollIndicator text="Go down" />);
    expect(screen.getByLabelText('Go down')).toBeInTheDocument();
  });

  it('should apply bottom-center position by default', () => {
    const { container } = render(<ScrollIndicator />);
    const wrapper = getWrapper(container);
    expect(wrapper).toHaveStyle({ position: 'absolute', left: '50%' });
  });

  it('should apply bottom-right position', () => {
    const { container } = render(<ScrollIndicator position="bottom-right" />);
    const wrapper = getWrapper(container);
    expect(wrapper).toHaveStyle({ position: 'absolute', right: '32px' });
  });

  it('should apply bottom-left position', () => {
    const { container } = render(<ScrollIndicator position="bottom-left" />);
    const wrapper = getWrapper(container);
    expect(wrapper).toHaveStyle({ position: 'absolute', left: '32px' });
  });

  it('should render button when animated', () => {
    render(<ScrollIndicator animated />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should not apply entry animation when animated is false', () => {
    const { container } = render(<ScrollIndicator animated={false} />);
    const button = container.querySelector('button') as HTMLElement;
    expect(button.style.animation).toBe('');
  });

  it('should pass dot prop to wrapper style', () => {
    const { container } = render(<ScrollIndicator dot="z-20" />);
    const wrapper = getWrapper(container);
    expect(wrapper).toHaveStyle({ zIndex: 20 });
  });

  it('should pass style prop to wrapper', () => {
    const { container } = render(<ScrollIndicator style={{ opacity: 0.5 }} />);
    const wrapper = getWrapper(container);
    expect(wrapper).toHaveStyle({ opacity: 0.5 });
  });
});
