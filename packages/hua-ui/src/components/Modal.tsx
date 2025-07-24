"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "../lib/utils"

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  title?: string
  showBackdrop?: boolean
  centered?: boolean
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    className,
    isOpen,
    onClose,
    children,
    size = "md",
    showCloseButton = true,
    closeOnOverlayClick = true,
    title,
    showBackdrop = true,
    centered = true,
    ...props 
  }, ref) => {
    const modalRef = React.useRef<HTMLDivElement>(null)

    // ESC 키로 모달 닫기
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener("keydown", handleEscape)
        document.body.style.overflow = "hidden"
      }

      return () => {
        document.removeEventListener("keydown", handleEscape)
        document.body.style.overflow = "unset"
      }
    }, [isOpen, onClose])

    // 모달 외부 클릭으로 닫기
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose()
      }
    }

    // 모달 크기 클래스 (4의 배수, 8의 배수 스페이싱)
    const sizeClasses = {
      sm: "w-80 max-w-sm", // 320px
      md: "w-96 max-w-md", // 384px
      lg: "w-[500px] max-w-lg", // 500px
      xl: "w-[600px] max-w-xl", // 600px
      "2xl": "w-[800px] max-w-2xl" // 800px
    }

    if (!isOpen) return null

    return createPortal(
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4", // 16px 패딩
          centered ? "items-center" : "items-start pt-16", // 64px 상단 여백
          className
        )}
        onClick={handleOverlayClick}
        {...props}
      >
        {/* 배경 오버레이 */}
        {showBackdrop && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" />
        )}
        
        {/* 모달 컨테이너 */}
        <div
          ref={modalRef}
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 mx-4 transform transition-all duration-300 ease-out overflow-hidden",
            sizeClasses[size]
          )}
          style={{
            animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* 그라데이션 배경 장식 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          {/* 헤더 */}
          {title && (
            <div className="relative z-10 px-8 pt-8 pb-6 border-b border-gray-200/50 dark:border-gray-700/50"> {/* 32px, 32px, 24px 여백 */}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            </div>
          )}
          
          {/* 닫기 버튼 */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 z-20" // 24px 여백
              aria-label="닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* 모달 내용 */}
          <div className={cn(
            "relative z-10",
            title ? "px-8 py-8" : "p-8" // 32px 여백
          )}>
            {children}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes modalSlideIn {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(20px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `
        }} />
      </div>,
      document.body
    )
  }
)
Modal.displayName = "Modal"

export { Modal } 