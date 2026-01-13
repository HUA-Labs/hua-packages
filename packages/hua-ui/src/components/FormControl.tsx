"use client";

import React from "react";
import { merge } from "../lib/utils";

/**
 * FormControl 컴포넌트의 props / FormControl component props
 * @typedef {Object} FormControlProps
 * @property {string} [label] - 필드 레이블 / Field label
 * @property {string} [description] - 필드 설명 / Field description
 * @property {string} [error] - 에러 메시지 / Error message
 * @property {boolean} [required=false] - 필수 필드 표시 / Required field indicator
 * @property {string} [htmlFor] - 레이블의 for 속성 / Label's for attribute
 * @property {boolean} [showErrorIcon=true] - 에러 아이콘 표시 / Show error icon
 * @property {React.ReactNode} children - 폼 입력 요소 / Form input element
 */
export interface FormControlProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  showErrorIcon?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * FormControl 컴포넌트 / FormControl component
 *
 * 폼 입력 요소를 감싸서 레이블, 설명, 에러 메시지를 표시합니다.
 * 브라우저 기본 유효성 검사 팝업 대신 커스텀 에러 메시지를 사용합니다.
 *
 * Wraps form input elements with label, description, and error messages.
 * Uses custom error messages instead of browser default validation popups.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <FormControl label="Email" required error={errors.email}>
 *   <Input type="email" />
 * </FormControl>
 *
 * @example
 * // 설명 포함 / With description
 * <FormControl
 *   label="Password"
 *   description="Must be at least 8 characters"
 *   error={errors.password}
 * >
 *   <Input type="password" />
 * </FormControl>
 */
function FormControl({
  label,
  description,
  error,
  required = false,
  htmlFor,
  showErrorIcon = true,
  className,
  children,
}: FormControlProps) {
  const hasError = !!error;

  return (
    <div className={merge("space-y-2", className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={htmlFor}
          className={merge(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            hasError && "text-red-500 dark:text-red-400"
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* Description */}
      {description && !hasError && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Input */}
      <div className="relative">
        {children}
      </div>

      {/* Error Message */}
      {hasError && (
        <div
          className="flex items-start gap-2 text-sm text-red-500 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {showErrorIcon && <ErrorIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * useFormValidation 훅 / useFormValidation hook
 *
 * 폼 유효성 검사를 위한 훅입니다.
 * 브라우저 기본 유효성 검사를 비활성화하고 커스텀 에러 메시지를 사용합니다.
 *
 * Hook for form validation.
 * Disables browser default validation and uses custom error messages.
 *
 * @example
 * const { errors, validate, clearError } = useFormValidation();
 *
 * const handleSubmit = (e) => {
 *   e.preventDefault();
 *   const isValid = validate({
 *     email: { value: email, required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
 *     password: { value: password, required: true, minLength: 8 },
 *   });
 *   if (isValid) { ... }
 * };
 */
interface ValidationRule {
  value: string | number | boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: string | number | boolean) => string | undefined;
  messages?: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    min?: string;
    max?: string;
    pattern?: string;
  };
}

type ValidationRules = Record<string, ValidationRule>;
type ValidationErrors = Record<string, string>;

function useFormValidation(initialErrors: ValidationErrors = {}) {
  const [errors, setErrors] = React.useState<ValidationErrors>(initialErrors);

  const validate = React.useCallback((rules: ValidationRules): boolean => {
    const newErrors: ValidationErrors = {};

    for (const [field, rule] of Object.entries(rules)) {
      const { value, required, minLength, maxLength, min, max, pattern, custom, messages = {} } = rule;
      const stringValue = String(value);

      // Required check
      if (required && (!value || stringValue.trim() === "")) {
        newErrors[field] = messages.required || "This field is required";
        continue;
      }

      // Skip other validations if empty and not required
      if (!value || stringValue.trim() === "") continue;

      // MinLength check
      if (minLength !== undefined && stringValue.length < minLength) {
        newErrors[field] = messages.minLength || `Must be at least ${minLength} characters`;
        continue;
      }

      // MaxLength check
      if (maxLength !== undefined && stringValue.length > maxLength) {
        newErrors[field] = messages.maxLength || `Must be at most ${maxLength} characters`;
        continue;
      }

      // Min check (for numbers)
      if (min !== undefined && typeof value === "number" && value < min) {
        newErrors[field] = messages.min || `Must be at least ${min}`;
        continue;
      }

      // Max check (for numbers)
      if (max !== undefined && typeof value === "number" && value > max) {
        newErrors[field] = messages.max || `Must be at most ${max}`;
        continue;
      }

      // Pattern check
      if (pattern && !pattern.test(stringValue)) {
        newErrors[field] = messages.pattern || "Invalid format";
        continue;
      }

      // Custom validation
      if (custom) {
        const customError = custom(value);
        if (customError) {
          newErrors[field] = customError;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearError = React.useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = React.useCallback(() => {
    setErrors({});
  }, []);

  return { errors, validate, clearError, clearAllErrors, setErrors };
}

// Error icon component
function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export { FormControl, useFormValidation };
export type { ValidationRule, ValidationRules, ValidationErrors };
