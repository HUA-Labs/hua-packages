"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  title?: string
  description?: string
  showBackdrop?: boolean
  centered?: boolean
  className?: string
}

export function Modal({ 
  className,
  isOpen,
  onClose,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  title,
  description,
  showBackdrop = true,
  centered = true
}: ModalProps) {
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

  // 모달 크기 클래스 (반응형 포함)
  const sizeClasses = {
    sm: "md:w-80", // 20rem = 320px
    md: "md:w-96", // 24rem = 384px
    lg: "md:w-[32rem]", // 32rem = 512px
    xl: "md:w-[38rem]", // 38rem = 608px
    "2xl": "md:w-[50rem]" // 50rem = 800px
  }

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 bottom-0 z-50 flex justify-center p-4 overflow-hidden", // PWA 호환성 개선
        centered ? "items-center" : "items-start pt-16", // 64px 상단 여백
        className
      )}
      style={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh'
      }}
      onClick={handleOverlayClick}
    >
      {/* 배경 오버레이 */}
      {showBackdrop && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" />
      )}
      
      {/* 모달 컨테이너 */}
      <div
        ref={modalRef}
        className={cn(
          "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 ease-out overflow-hidden",
          // 반응형: 모바일 전체, 데스크톱 고정
          "w-[calc(100vw-2rem)]", // 모바일: 화면 너비 - 패딩
          sizeClasses[size],       // 데스크톱: md:w-[50rem]
          "max-w-[calc(100vw-2rem)]", // 최대 너비 제한
          "flex-none" // flex 컨테이너에서 크기 유지
        )}
        style={{
          animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          maxHeight: "90vh",
          marginTop: centered ? 'auto' : '0',
          marginBottom: centered ? 'auto' : '0'
        }}
      >
        {/* 그라데이션 배경 장식 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
        
        {/* 헤더 */}
        {title && (
          <div className="relative z-10 px-6 pt-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white pr-10">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{description}</p>
            )}
            {/* 닫기 버튼 */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 z-20"
                aria-label="닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* 타이틀이 없을 때만 별도 닫기 버튼 */}
        {!title && showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 z-20"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* 모달 내용 */}
        <div className={`relative z-10 ${title ? 'px-6 mb-6' : 'p-6'}`}>
          {children}
        </div>
      </div>
    </div>
  )
} 