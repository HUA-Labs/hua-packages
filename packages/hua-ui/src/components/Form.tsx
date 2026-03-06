"use client"

import React, { useMemo } from "react"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

// ---------------------------------------------------------------------------
// Base style constants
// ---------------------------------------------------------------------------

const FORM_BASE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
}

const FORM_GLASS: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  backgroundColor: 'var(--form-glass-bg)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  border: '1px solid var(--form-glass-border)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  boxShadow: 'var(--form-glass-shadow)',
}

const FORM_FIELD_BASE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
}

const FORM_GROUP_STACK: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const FORM_GROUP_INLINE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: '1rem',
}

const FORM_ERROR: React.CSSProperties = {
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: 'var(--form-error-text)',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Form component props
 */
export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'className'> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  variant?: "default" | "glass"
  dot?: string
  style?: React.CSSProperties
}

/**
 * FormField component props
 */
export interface FormFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  error?: string
  required?: boolean
  dot?: string
  style?: React.CSSProperties
}

/**
 * FormGroup component props
 */
export interface FormGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  inline?: boolean
  dot?: string
  style?: React.CSSProperties
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

/**
 * Form container component.
 * Used with FormField and FormGroup to create structured forms.
 *
 * @example
 * <Form onSubmit={(e) => { e.preventDefault(); console.log('submit') }}>
 *   <FormField>
 *     <Label>Name</Label>
 *     <Input />
 *   </FormField>
 * </Form>
 *
 * @example
 * // Glass variant
 * <Form variant="glass" onSubmit={handleSubmit}>
 *   <FormGroup>
 *     <FormField>
 *       <Label>Email</Label>
 *       <Input type="email" />
 *     </FormField>
 *   </FormGroup>
 * </Form>
 */
const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({
    dot: dotProp,
    children,
    onSubmit,
    variant = "default",
    style,
    ...props
  }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      onSubmit?.(e)
    }

    const computedStyle = useMemo(() => {
      const base = variant === "glass" ? FORM_GLASS : FORM_BASE
      return mergeStyles(base, resolveDot(dotProp), style)
    }, [variant, dotProp, style])

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        style={computedStyle}
        {...props}
      >
        {children}
      </form>
    )
  }
)
Form.displayName = "Form"

// ---------------------------------------------------------------------------
// FormField
// ---------------------------------------------------------------------------

/**
 * Container that wraps a form field.
 * Displays error messages and supports required field indication.
 *
 * @example
 * <FormField error="This field is required" required>
 *   <Label>Name</Label>
 *   <Input />
 * </FormField>
 */
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({
    dot: dotProp,
    children,
    error,
    required,
    style,
    ...props
  }, ref) => {
    const errorId = React.useId()

    // Connect aria-describedby and aria-invalid to child form elements
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const childProps = child.props as Record<string, unknown>
        const childType = child.type

        // Check for hua-ui Input, Select, Textarea components
        let isFormComponent = false
        if (typeof childType === 'object' && childType !== null) {
          const typeObj = childType as Record<string, unknown>
          const displayName = typeObj.displayName as string | undefined
          const name = typeObj.name as string | undefined
          isFormComponent =
            displayName === 'Input' ||
            displayName === 'Select' ||
            displayName === 'Textarea' ||
            name === 'Input' ||
            name === 'Select' ||
            name === 'Textarea'
        }

        // Check for native HTML elements
        const isNativeFormElement =
          typeof childType === 'string' &&
          ['input', 'select', 'textarea'].includes(childType.toLowerCase())

        if (isFormComponent || isNativeFormElement) {
          const existingAriaDescribedBy = childProps['aria-describedby'] as string | undefined
          const ariaDescribedBy = error
            ? existingAriaDescribedBy
              ? `${existingAriaDescribedBy} ${errorId}`
              : errorId
            : existingAriaDescribedBy

          return React.cloneElement(child, {
            'aria-describedby': ariaDescribedBy,
            'aria-invalid': error ? true : childProps['aria-invalid'],
            required: required || childProps.required,
          } as Record<string, unknown>)
        }
      }
      return child
    })

    const computedStyle = useMemo(() => {
      return mergeStyles(FORM_FIELD_BASE, resolveDot(dotProp), style)
    }, [dotProp, style])

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      >
        {enhancedChildren}
        {error && (
          <p
            id={errorId}
            style={FORM_ERROR}
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

// ---------------------------------------------------------------------------
// FormGroup
// ---------------------------------------------------------------------------

/**
 * Container that groups multiple form fields.
 *
 * @example
 * <FormGroup inline>
 *   <FormField>
 *     <Label>First Name</Label>
 *     <Input />
 *   </FormField>
 *   <FormField>
 *     <Label>Last Name</Label>
 *     <Input />
 *   </FormField>
 * </FormGroup>
 */
const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({
    dot: dotProp,
    children,
    inline = false,
    style,
    ...props
  }, ref) => {
    const computedStyle = useMemo(() => {
      const base = inline ? FORM_GROUP_INLINE : FORM_GROUP_STACK
      return mergeStyles(base, resolveDot(dotProp), style)
    }, [inline, dotProp, style])

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FormGroup.displayName = "FormGroup"

export { Form, FormField, FormGroup }
