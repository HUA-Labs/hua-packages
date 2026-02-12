import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormControl, useFormValidation } from '../FormControl';
import React from 'react';

describe('FormControl', () => {
  it('should render children', () => {
    render(
      <FormControl>
        <input data-testid="input" />
      </FormControl>
    );
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('should render label', () => {
    render(
      <FormControl label="Email">
        <input />
      </FormControl>
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should show required asterisk', () => {
    render(
      <FormControl label="Name" required>
        <input />
      </FormControl>
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should render description when no error', () => {
    render(
      <FormControl description="Enter your email address">
        <input />
      </FormControl>
    );
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('should hide description when error exists', () => {
    render(
      <FormControl description="Help text" error="Something went wrong">
        <input />
      </FormControl>
    );
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('should render error message with alert role', () => {
    render(
      <FormControl error="Invalid email">
        <input />
      </FormControl>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('should set aria-invalid on child when error', () => {
    render(
      <FormControl error="Bad value" htmlFor="test">
        <input data-testid="input" />
      </FormControl>
    );
    expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
  });

  it('should set aria-describedby pointing to error', () => {
    render(
      <FormControl error="Err" htmlFor="myfield">
        <input data-testid="input" />
      </FormControl>
    );
    expect(screen.getByTestId('input')).toHaveAttribute('aria-describedby', 'myfield-error');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FormControl className="my-form">
        <input />
      </FormControl>
    );
    expect(container.querySelector('.my-form')).toBeInTheDocument();
  });
});

describe('useFormValidation', () => {
  function TestComponent() {
    const { errors, validate, clearError, clearAllErrors } = useFormValidation();

    return (
      <div>
        <button onClick={() => validate({
          email: { value: '', required: true },
          name: { value: 'ab', minLength: 3 },
        })}>
          Validate
        </button>
        <button onClick={() => clearError('email')}>Clear email</button>
        <button onClick={() => clearAllErrors()}>Clear all</button>
        {errors.email && <span data-testid="email-error">{errors.email}</span>}
        {errors.name && <span data-testid="name-error">{errors.name}</span>}
      </div>
    );
  }

  it('should validate required fields', () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText('Validate'));
    expect(screen.getByTestId('email-error')).toHaveTextContent('This field is required');
  });

  it('should validate minLength', () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText('Validate'));
    expect(screen.getByTestId('name-error')).toHaveTextContent('Must be at least 3 characters');
  });

  it('should clear specific error', () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText('Validate'));
    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear email'));
    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
  });

  it('should clear all errors', () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText('Validate'));
    fireEvent.click(screen.getByText('Clear all'));
    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
  });
});
