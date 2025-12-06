"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Alert 컴포넌트의 props
 * @typedef {Object} AlertProps
 * @property {"default" | "success" | "warning" | "error" | "info"} [variant="default"] - Alert 스타일 변형
 * @property {string} [title] - Alert 제목
 * @property {string} [description] - Alert 설명
 * @property {React.ReactNode} [icon] - 커스텀 아이콘
 * @property {React.ReactNode} [action] - 액션 버튼/요소
 * @property {boolean} [closable=false] - 닫기 버튼 표시 여부
 * @property {() => void} [onClose] - 닫기 버튼 클릭 시 호출되는 콜백
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info"
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  closable?: boolean
  onClose?: () => void
}

/**
 * Alert 컴포넌트 / Alert component
 * 
 * 사용자에게 중요한 정보나 경고를 표시하는 컴포넌트입니다.
 * 다양한 변형(variant)을 지원하며, 아이콘, 제목, 설명, 액션 버튼을 포함할 수 있습니다.
 * 
 * Component for displaying important information or warnings to users.
 * Supports various variants and can include icons, titles, descriptions, and action buttons.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Alert variant="info" title="정보" description="이것은 정보 메시지입니다." />
 * 
 * @example
 * // 닫기 버튼 포함 / With close button
 * <Alert 
 *   variant="warning" 
 *   title="경고" 
 *   closable 
 *   onClose={() => console.log('닫기')}
 * />
 * 
 * @example
 * // 커스텀 아이콘과 액션 / Custom icon and action
 * <Alert 
 *   variant="success"
 *   icon={<Icon name="check" />}
 *   action={<Button size="sm">확인</Button>}
 * >
 *   작업이 완료되었습니다.
 * </Alert>
 * 
 * @param {AlertProps} props - Alert 컴포넌트의 props / Alert component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Alert 컴포넌트 / Alert component
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = "default",
    title,
    description,
    icon,
    action,
    closable = false,
    onClose,
    children,
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "success":
          return "bg-green-500/10 backdrop-blur-sm border-green-400/30 text-green-200 dark:bg-green-500/10 dark:border-green-400/30 dark:text-green-200"
        case "warning":
          return "bg-yellow-500/10 backdrop-blur-sm border-yellow-400/30 text-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-400/30 dark:text-yellow-200"
        case "error":
          return "bg-red-500/10 backdrop-blur-sm border-red-400/30 text-red-200 dark:bg-red-500/10 dark:border-red-400/30 dark:text-red-200"
        case "info":
          return "bg-blue-500/10 backdrop-blur-sm border-blue-400/30 text-blue-200 dark:bg-blue-500/10 dark:border-blue-400/30 dark:text-blue-200"
        default:
          return "bg-white/10 backdrop-blur-sm border-white/30 text-white dark:bg-slate-800/20 dark:border-slate-700/50 dark:text-slate-200"
      }
    }

    const getIconClasses = () => {
      switch (variant) {
        case "success":
          return "text-green-500 dark:text-green-400"
        case "warning":
          return "text-yellow-500 dark:text-yellow-400"
        case "error":
          return "text-red-500 dark:text-red-400"
        case "info":
          return "text-blue-500 dark:text-blue-400"
        default:
          return "text-gray-500 dark:text-gray-400"
      }
    }

    const getDefaultIcon = () => {
      switch (variant) {
        case "success":
          return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        case "warning":
          return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        case "error":
          return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        case "info":
          return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        default:
          return null
      }
    }

    return (
      <div
        ref={ref}
        className={merge(
          "relative rounded-lg border p-4", // 16px 패딩
          getVariantClasses(),
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3"> {/* 12px 간격 */}
          {/* 아이콘 */}
          {(icon || getDefaultIcon()) && (
            <div className={merge("flex-shrink-0 mt-0.5", getIconClasses())}>
              {icon || getDefaultIcon()}
            </div>
          )}

          {/* 내용 */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold mb-1"> {/* 4px 여백 */}
                {title}
              </h4>
            )}
            {description && (
              <p className="text-sm leading-relaxed">
                {description}
              </p>
            )}
            {children && (
              <div className="mt-2"> {/* 8px 여백 */}
                {children}
              </div>
            )}
          </div>

          {/* 액션 */}
          {(action || closable) && (
            <div className="flex-shrink-0 flex items-center gap-2"> {/* 8px 간격 */}
              {action}
              {closable && (
                <button
                  onClick={onClose}
                  className={merge(
                    "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5",
                    getIconClasses()
                  )}
                  aria-label="닫기"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

// 편의 컴포넌트들
export const AlertSuccess = React.forwardRef<HTMLDivElement, Omit<AlertProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Alert ref={ref} variant="success" className={className} {...props} />
  )
)
AlertSuccess.displayName = "AlertSuccess"

export const AlertWarning = React.forwardRef<HTMLDivElement, Omit<AlertProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Alert ref={ref} variant="warning" className={className} {...props} />
  )
)
AlertWarning.displayName = "AlertWarning"

export const AlertError = React.forwardRef<HTMLDivElement, Omit<AlertProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Alert ref={ref} variant="error" className={className} {...props} />
  )
)
AlertError.displayName = "AlertError"

export const AlertInfo = React.forwardRef<HTMLDivElement, Omit<AlertProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Alert ref={ref} variant="info" className={className} {...props} />
  )
)
AlertInfo.displayName = "AlertInfo"

export { Alert } 