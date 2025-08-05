"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Modal } from "./Modal"
import { Button } from "./Button"

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  warning?: string
  confirmText?: string
  cancelText?: string
  confirmButtonText?: string
  type?: "danger" | "warning" | "info" | "success" | "error"
  loading?: boolean
  disabled?: boolean
  showInput?: boolean
  inputValue?: string
  onInputChange?: (value: string) => void
  inputPlaceholder?: string
  inputLabel?: string
  requiredInputValue?: string
  showCancel?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}

const ConfirmModal = React.forwardRef<HTMLDivElement, ConfirmModalProps>(
  ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    warning,
    confirmText = "확인",
    cancelText = "취소",
    confirmButtonText,
    type = "danger",
    loading = false,
    disabled = false,
    showInput = false,
    inputValue = "",
    onInputChange,
    inputPlaceholder,
    inputLabel,
    requiredInputValue,
    showCancel = true,
    size = "md"
  }, ref) => {
    // 타입별 아이콘과 색상
    const typeConfig = {
      danger: {
        icon: (
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        bgColor: "bg-red-100 dark:bg-red-900/20",
        buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        textColor: "text-red-600 dark:text-red-400"
      },
      warning: {
        icon: (
          <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
        buttonColor: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
        textColor: "text-yellow-600 dark:text-yellow-400"
      },
      info: {
        icon: (
          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
        buttonColor: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        textColor: "text-blue-600 dark:text-blue-400"
      },
      success: {
        icon: (
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        bgColor: "bg-green-100 dark:bg-green-900/20",
        buttonColor: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
        textColor: "text-green-600 dark:text-green-400"
      },
      error: {
        icon: (
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        bgColor: "bg-red-100 dark:bg-red-900/20",
        buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        textColor: "text-red-600 dark:text-red-400"
      }
    }

    const config = typeConfig[type]
    const isInputValid = !showInput || !requiredInputValue || inputValue === requiredInputValue
    const isDisabled = disabled || loading || !isInputValid

    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        showCloseButton={false}
        size={size}
      >
        <div className="text-center">
          {/* 아이콘 */}
          <div className={cn(
            "mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6", // 64px 아이콘, 24px 여백
            config.bgColor
          )}>
            {config.icon}
          </div>

          {/* 제목 */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4"> {/* 16px 여백 */}
            {title}
          </h3>

          {/* 메시지 */}
          <div className="mb-6"> {/* 24px 여백 */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </p>
            
            {/* 경고 메시지 */}
            {warning && (
              <p className={cn(
                "text-sm mt-3 font-medium", // 12px 여백
                config.textColor
              )}>
                {warning}
              </p>
            )}
          </div>

          {/* 입력 필드 */}
          {showInput && (
            <div className="mb-6"> {/* 24px 여백 */}
              <label htmlFor="confirmInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-left"> {/* 12px 여백 */}
                {inputLabel}
              </label>
              <input
                type="text"
                id="confirmInput"
                value={inputValue}
                onChange={(e) => onInputChange?.(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors" // 16px, 12px 패딩
              />
            </div>
          )}

          {/* 버튼 */}
          <div className={cn(
            "flex gap-3", // 12px 간격
            showCancel ? "justify-center" : "justify-center"
          )}>
            {showCancel && (
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3" // 24px, 12px 패딩
              >
                {cancelText}
              </Button>
            )}
            <Button
              variant="default"
              onClick={onConfirm}
              disabled={isDisabled}
              className={cn(
                "px-6 py-3", // 24px, 12px 패딩
                config.buttonColor
              )}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  처리 중...
                </div>
              ) : (
                confirmButtonText || confirmText
              )}
            </Button>
          </div>
        </div>
      </Modal>
    )
  }
)
ConfirmModal.displayName = "ConfirmModal"

export { ConfirmModal } 