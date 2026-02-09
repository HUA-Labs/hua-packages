"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Form 컴포넌트의 props / Form component props
 * @typedef {Object} FormProps
 * @property {(e: React.FormEvent<HTMLFormElement>) => void} [onSubmit] - 폼 제출 핸들러 / Form submit handler
 * @property {"default" | "glass"} [variant="default"] - Form 스타일 변형 / Form style variant
 * @extends {React.FormHTMLAttributes<HTMLFormElement>}
 */
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  variant?: "default" | "glass"
}

/**
 * FormField 컴포넌트의 props / FormField component props
 * @typedef {Object} FormFieldProps
 * @property {string} [error] - 에러 메시지 / Error message
 * @property {boolean} [required=false] - 필수 필드 여부 / Required field
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string
  required?: boolean
}

/**
 * FormGroup 컴포넌트의 props / FormGroup component props
 * @typedef {Object} FormGroupProps
 * @property {boolean} [inline=false] - 인라인 레이아웃 여부 / Inline layout
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  inline?: boolean
}

/**
 * Form 컴포넌트 / Form component
 * 
 * 폼 컨테이너 컴포넌트입니다.
 * FormField, FormGroup과 함께 사용하여 구조화된 폼을 구성합니다.
 * 
 * Form container component.
 * Used with FormField and FormGroup to create structured forms.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Form onSubmit={(e) => { e.preventDefault(); console.log('제출') }}>
 *   <FormField>
 *     <Label>이름</Label>
 *     <Input />
 *   </FormField>
 * </Form>
 * 
 * @example
 * // Glass 스타일 / Glass style
 * <Form variant="glass" onSubmit={handleSubmit}>
 *   <FormGroup>
 *     <FormField>
 *       <Label>이메일</Label>
 *       <Input type="email" />
 *     </FormField>
 *   </FormGroup>
 * </Form>
 * 
 * @param {FormProps} props - Form 컴포넌트의 props / Form component props
 * @param {React.Ref<HTMLFormElement>} ref - form 요소 ref / form element ref
 * @returns {JSX.Element} Form 컴포넌트 / Form component
 */
const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ 
    className, 
    children, 
    onSubmit,
    variant = "default",
    ...props 
  }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      onSubmit?.(e)
    }

    const variantClasses = {
      default: "space-y-6",
      glass: "space-y-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl dark:bg-slate-800/20 dark:border-slate-700/50"
    }

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={merge(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </form>
    )
  }
)
Form.displayName = "Form"

/**
 * FormField 컴포넌트 / FormField component
 * 
 * 폼 필드를 감싸는 컨테이너입니다.
 * 에러 메시지를 표시하고 필수 필드 표시를 지원합니다.
 * 
 * Container that wraps a form field.
 * Displays error messages and supports required field indication.
 * 
 * @component
 * @example
 * <FormField error="이 필드는 필수입니다" required>
 *   <Label>이름</Label>
 *   <Input />
 * </FormField>
 * 
 * @param {FormFieldProps} props - FormField 컴포넌트의 props / FormField component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} FormField 컴포넌트 / FormField component
 */
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    className, 
    children, 
    error,
    required,
    ...props 
  }, ref) => {
    const errorId = React.useId()

    // 자식 요소에 aria-describedby와 aria-invalid 연결
    // Connect aria-describedby and aria-invalid to child elements
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const childProps = child.props as Record<string, unknown>
        const childType = child.type
        
        // Input, Select, Textarea 컴포넌트 확인
        // Check for Input, Select, Textarea components
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
        
        // 네이티브 HTML 요소 확인
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

    return (
      <div
        ref={ref}
        className={merge("space-y-2", className)}
        {...props}
      >
        {enhancedChildren}
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600 dark:text-red-400"
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

/**
 * FormGroup 컴포넌트 / FormGroup component
 * 
 * 여러 폼 필드를 그룹화하는 컨테이너입니다.
 * Container that groups multiple form fields.
 * 
 * @component
 * @example
 * <FormGroup inline>
 *   <FormField>
 *     <Label>이름</Label>
 *     <Input />
 *   </FormField>
 *   <FormField>
 *     <Label>성</Label>
 *     <Input />
 *   </FormField>
 * </FormGroup>
 * 
 * @param {FormGroupProps} props - FormGroup 컴포넌트의 props / FormGroup component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} FormGroup 컴포넌트 / FormGroup component
 */
const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ 
    className, 
    children, 
    inline = false,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={merge(
          inline ? "flex gap-4" : "space-y-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FormGroup.displayName = "FormGroup"

export { Form, FormField, FormGroup } 