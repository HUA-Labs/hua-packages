import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Form, FormField, FormGroup } from '../Form';
import { Input } from '../Input';
import { Label } from '../Label';

describe('Form', () => {
  it('should render form element', () => {
    render(
      <Form>
        <FormField>
          <Label>Test</Label>
          <Input />
        </FormField>
      </Form>
    );
    
    const form = screen.getByRole('form', { hidden: true });
    expect(form).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(
      <Form onSubmit={handleSubmit}>
        <FormField>
          <Label>Test</Label>
          <Input />
        </FormField>
      </Form>
    );
    
    const form = screen.getByRole('form', { hidden: true });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('should display error message in FormField', () => {
    render(
      <Form>
        <FormField error="This field is required">
          <Label>Test</Label>
          <Input />
        </FormField>
      </Form>
    );
    
    const errorMessage = screen.getByText('This field is required');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('role', 'alert');
    expect(errorMessage).toHaveAttribute('aria-live', 'polite');
  });

  it('should connect aria-describedby to input when error exists', () => {
    render(
      <Form>
        <FormField error="Error message">
          <Label>Test</Label>
          <Input />
        </FormField>
      </Form>
    );
    
    const input = screen.getByRole('textbox');
    const errorId = screen.getByText('Error message').id;
    
    expect(input).toHaveAttribute('aria-describedby', errorId);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should set aria-required on input when FormField is required', () => {
    render(
      <Form>
        <FormField required>
          <Label>Test</Label>
          <Input />
        </FormField>
      </Form>
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('required');
  });
});

describe('FormGroup', () => {
  it('should render inline layout when inline prop is true', () => {
    const { container } = render(
      <FormGroup inline>
        <FormField>
          <Label>Field 1</Label>
          <Input />
        </FormField>
        <FormField>
          <Label>Field 2</Label>
          <Input />
        </FormField>
      </FormGroup>
    );
    
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass('flex', 'gap-4');
  });

  it('should render default layout when inline prop is false', () => {
    const { container } = render(
      <FormGroup>
        <FormField>
          <Label>Field 1</Label>
          <Input />
        </FormField>
      </FormGroup>
    );
    
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass('space-y-4');
  });
});

