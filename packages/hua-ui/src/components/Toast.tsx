"use client"

import React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { merge } from "../lib/utils"

/**
 * Toast 메시지 타입 / Toast message type
 * @typedef {Object} Toast
 * @property {string} id - Toast 고유 ID / Toast unique ID
 * @property {"success" | "error" | "warning" | "info"} type - Toast 타입 / Toast type
 * @property {string} [title] - Toast 제목 / Toast title
 * @property {string} message - Toast 메시지 / Toast message
 * @property {number} [duration] - 표시 시간(ms), 0이면 자동 제거 안 함 / Display duration (ms), 0 means no auto-remove
 * @property {Object} [action] - 액션 버튼 / Action button
 * @property {string} action.label - 액션 버튼 레이블 / Action button label
 * @property {() => void} action.onClick - 액션 버튼 클릭 핸들러 / Action button click handler
 */
export interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Toast Context 타입
interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

// Toast Context 생성
const ToastContext = createContext<ToastContextType | undefined>(undefined)

/**
 * useToast Hook
 *
 * Toast를 추가, 제거, 초기화하는 훅입니다.
 * ToastProvider 내부에서만 사용 가능합니다.
 *
 * Hook for adding, removing, and clearing toasts.
 * Can only be used within ToastProvider.
 *
 * @example
 * const { addToast, removeToast, clearToasts } = useToast()
 *
 * addToast({
 *   type: "success",
 *   message: "저장되었습니다",
 *   duration: 3000
 * })
 *
 * @returns {ToastContextType} Toast 컨텍스트 값 / Toast context value
 * @throws {Error} ToastProvider 외부에서 사용 시 에러 발생 / Error when used outside ToastProvider
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// No-op functions for safe toast hook
const noopAddToast = () => {}
const noopRemoveToast = () => {}
const noopClearToasts = () => {}

/**
 * useToastSafe Hook
 *
 * ToastProvider 없이도 안전하게 사용할 수 있는 useToast 훅입니다.
 * Provider가 없으면 no-op 함수를 반환합니다.
 *
 * Safe version of useToast that works without ToastProvider.
 * Returns no-op functions when used outside ToastProvider.
 *
 * @example
 * const { addToast } = useToastSafe()
 *
 * // 안전하게 호출 가능 - Provider 없으면 아무 일도 안 함
 * addToast({ type: "success", message: "저장됨" })
 *
 * @returns {ToastContextType} Toast 컨텍스트 값 또는 no-op 함수들
 */
export function useToastSafe(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      toasts: [],
      addToast: noopAddToast,
      removeToast: noopRemoveToast,
      clearToasts: noopClearToasts,
    }
  }
  return context
}

/**
 * ToastProvider 컴포넌트의 props / ToastProvider component props
 * @typedef {Object} ToastProviderProps
 * @property {React.ReactNode} children - 자식 컴포넌트 / Child components
 * @property {number} [maxToasts=5] - 최대 Toast 개수 / Maximum number of toasts
 * @property {"top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"} [position="top-right"] - Toast 표시 위치 / Toast display position
 */
interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
}

/**
 * ToastProvider 컴포넌트 / ToastProvider component
 * 
 * Toast 시스템의 컨텍스트를 제공하는 Provider 컴포넌트입니다.
 * 앱의 루트 레벨에서 사용하여 전역 Toast 기능을 활성화합니다.
 * 
 * Provider component that provides context for the Toast system.
 * Use at the root level of your app to enable global Toast functionality.
 * 
 * @component
 * @example
 * // App.tsx
 * <ToastProvider position="top-center" maxToasts={3}>
 *   <App />
 * </ToastProvider>
 * 
 * @example
 * // 컴포넌트에서 사용 / Usage in component
 * const { addToast } = useToast()
 * 
 * const handleSave = () => {
 *   addToast({
 *     type: "success",
 *     message: "저장되었습니다",
 *     title: "성공"
 *   })
 * }
 * 
 * @param {ToastProviderProps} props - ToastProvider 컴포넌트의 props / ToastProvider component props
 * @returns {JSX.Element} ToastProvider 컴포넌트 / ToastProvider component
 * 
 * @todo 접근성 개선: ToastItem에 role="alert" 또는 role="status" 추가 필요 / Accessibility: Add role="alert" or role="status" to ToastItem
 * @todo 접근성 개선: aria-live="polite" 또는 aria-live="assertive" 추가 필요 / Accessibility: Add aria-live="polite" or aria-live="assertive"
 */
export function ToastProvider({
  children,
  maxToasts = 5,
  position = "top-right"
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { ...toast, id }

    setToasts(prev => {
      const updatedToasts = [...prev, newToast]
      return updatedToasts.slice(-maxToasts) // 최대 개수 제한
    })

    // 자동 제거
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [maxToasts, removeToast])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} position={position} />
    </ToastContext.Provider>
  )
}

// Toast Container Props
interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
  position: string
}

// Toast Container
function ToastContainer({ toasts, removeToast, position }: ToastContainerProps) {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2"
  }

  if (toasts.length === 0) return null

  return (
    <div className={merge(
      "fixed z-50 space-y-3 max-w-sm", // 12px 간격
      positionClasses[position as keyof typeof positionClasses]
    )}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

// Toast Item Props
interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

// Toast Item
function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getToastStyles = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100/90 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
      case "error":
        return "bg-red-100/90 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
      case "warning":
        return "bg-yellow-100/90 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
      case "info":
        return "bg-blue-100/90 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
    }
  }

  const getIconStyles = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "text-green-500 dark:text-green-400"
      case "error":
        return "text-red-500 dark:text-red-400"
      case "warning":
        return "text-yellow-500 dark:text-yellow-400"
      case "info":
        return "text-blue-500 dark:text-blue-400"
    }
  }

  const getToastIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "error":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case "warning":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case "info":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div
      className={merge(
        "flex items-start p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 transform",
        getToastStyles(toast.type),
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      )}
      style={{
        animation: isVisible ? "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)" : undefined
      }}
    >
      {/* 아이콘 */}
      <div className={merge("flex-shrink-0 mr-3", getIconStyles(toast.type))}> {/* 12px 여백 */}
        {getToastIcon(toast.type)}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold mb-1"> {/* 4px 여백 */}
            {toast.title}
          </h4>
        )}
        <p className="text-sm leading-relaxed">
          {toast.message}
        </p>

        {/* 액션 버튼 */}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-3 text-sm font-medium underline hover:no-underline transition-all duration-200" // 12px 여백
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* 닫기 버튼 */}
      <div className="flex-shrink-0 ml-4"> {/* 16px 여백 */}
        <button
          onClick={handleRemove}
          className={merge(
            "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5",
            getIconStyles(toast.type)
          )}
          aria-label="닫기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// 편의 함수들 (ToastProvider 내부에서만 사용 가능 - 스텁 함수)
export const showToast = (_toast: Omit<Toast, "id">) => {
  // ToastProvider 컨텍스트 필요
}

export const showSuccessToast = (_message: string, _title?: string, _duration?: number) => {
  // ToastProvider 컨텍스트 필요
}

export const showErrorToast = (_message: string, _title?: string, _duration?: number) => {
  // ToastProvider 컨텍스트 필요
}

export const showWarningToast = (_message: string, _title?: string, _duration?: number) => {
  // ToastProvider 컨텍스트 필요
}

export const showInfoToast = (_message: string, _title?: string, _duration?: number) => {
  // ToastProvider 컨텍스트 필요
} 