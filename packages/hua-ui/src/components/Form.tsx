"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  variant?: "default" | "glass"
}

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string
  required?: boolean
}

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  inline?: boolean
}

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
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </form>
    )
  }
)
Form.displayName = "Form"

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    className, 
    children, 
    error,
    required,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        {children}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

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
        className={cn(
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