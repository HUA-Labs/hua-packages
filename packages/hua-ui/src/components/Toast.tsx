"use client"

import React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { cn } from "../lib/utils"

// Toast 타입 정의
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

// Toast Hook
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Toast Provider Props
interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
}

// Toast Provider
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
    <div className={cn(
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
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
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
      className={cn(
        "flex items-start p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 transform",
        getToastStyles(toast.type),
        isVisible 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95"
      )}
      style={{
        animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      {/* 아이콘 */}
      <div className={cn("flex-shrink-0 mr-3", getIconStyles(toast.type))}> {/* 12px 여백 */}
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
          className={cn(
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

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInRight {
            from {
              transform: translateX(100%) scale(0.95);
              opacity: 0;
            }
            to {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
          }
        `
      }} />
    </div>
  )
}

// 편의 함수들
export const showToast = (toast: Omit<Toast, "id">) => {
  // 이 함수는 ToastProvider 내부에서만 사용 가능
  console.warn("showToast is deprecated. Use useToast hook instead.")
}

export const showSuccessToast = (message: string, title?: string, duration?: number) => {
  console.warn("showSuccessToast is deprecated. Use useToast hook instead.")
}

export const showErrorToast = (message: string, title?: string, duration?: number) => {
  console.warn("showErrorToast is deprecated. Use useToast hook instead.")
}

export const showWarningToast = (message: string, title?: string, duration?: number) => {
  console.warn("showWarningToast is deprecated. Use useToast hook instead.")
}

export const showInfoToast = (message: string, title?: string, duration?: number) => {
  console.warn("showInfoToast is deprecated. Use useToast hook instead.")
} 