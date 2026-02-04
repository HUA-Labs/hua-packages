"use client"

import React from "react"
import { createPortal } from "react-dom"
import { merge } from "../lib/utils"

/**
 * Modal 컴포넌트의 props / Modal component props
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen - 모달 열림/닫힘 상태 / Modal open/close state
 * @property {() => void} onClose - 모달 닫기 콜백 함수 / Modal close callback function
 * @property {React.ReactNode} children - 모달 내용 / Modal content
 * @property {"sm" | "md" | "lg" | "xl" | "2xl" | "3xl"} [size="md"] - 모달 크기 / Modal size
 * @property {boolean} [showCloseButton=true] - 닫기 버튼 표시 여부 / Show close button
 * @property {boolean} [closeOnOverlayClick=true] - 오버레이 클릭 시 닫기 여부 / Close on overlay click
 * @property {string} [title] - 모달 제목 / Modal title
 * @property {string} [description] - 모달 설명 / Modal description
 * @property {boolean} [showBackdrop=true] - 배경 오버레이 표시 여부 / Show backdrop overlay
 * @property {string} [backdropClassName] - 배경 오버레이 추가 CSS 클래스 / Additional CSS class for backdrop
 * @property {boolean} [centered=true] - 모달을 화면 중앙에 배치할지 여부 / Center modal on screen
 * @property {string} [className] - 모달 컨테이너 추가 CSS 클래스 / Additional CSS class for modal container
 */
export interface ModalProps {
  /** 모달 열림/닫힘 상태 / Modal open/close state */
  isOpen: boolean
  /** 모달 닫기 콜백 함수 / Modal close callback function */
  onClose: () => void
  /** 모달 내용 / Modal content */
  children: React.ReactNode
  /** 모달 크기 / Modal size */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
  /** 닫기 버튼 표시 여부 / Show close button */
  closable?: boolean
  /** @deprecated use closable instead */
  showCloseButton?: boolean
  /** 오버레이 클릭 시 닫기 여부 / Close on overlay click */
  closeOnOverlayClick?: boolean
  /** 모달 제목 / Modal title */
  title?: string
  /** 모달 설명 / Modal description */
  description?: string
  /** 배경 오버레이 표시 여부 / Show backdrop overlay */
  showBackdrop?: boolean
  /** 배경 오버레이 추가 CSS 클래스 / Additional CSS class for backdrop */
  backdropClassName?: string
  /** 모달을 화면 중앙에 배치할지 여부 / Center modal on screen */
  centered?: boolean
  /** 모달 컨테이너 추가 CSS 클래스 / Additional CSS class for modal container */
  className?: string
}

// Ref 병합 유틸리티
function useCombinedRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return React.useCallback(
    (node: T) => {
      refs.forEach((ref) => {
        if (!ref) return;
        if (typeof ref === "function") {
          ref(node);
        } else {
          (ref as React.MutableRefObject<T | null>).current = node;
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}

/**
 * Modal 컴포넌트 / Modal component
 * 
 * 오버레이와 함께 표시되는 모달 다이얼로그 컴포넌트입니다.
 * ESC 키로 닫기, 오버레이 클릭으로 닫기, 접근성 속성(ARIA)을 지원합니다.
 * 
 * Modal dialog component displayed with overlay.
 * Supports closing with ESC key, overlay click, and ARIA accessibility attributes.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * const [isOpen, setIsOpen] = useState(false)
 * 
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <p>모달 내용</p>
 * </Modal>
 * 
 * @example
 * // 제목과 설명 포함 / With title and description
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="확인"
 *   description="이 작업을 계속하시겠습니까?"
 * >
 *   <Button onClick={handleConfirm}>확인</Button>
 * </Modal>
 * 
 * @example
 * // 큰 크기 모달 / Large size modal
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   size="xl"
 *   closeOnOverlayClick={false}
 * >
 *   <div>큰 모달 내용</div>
 * </Modal>
 * 
 * @param {ModalProps} props - Modal 컴포넌트의 props / Modal component props
 * @param {React.Ref<HTMLDivElement>} ref - 모달 컨테이너 ref / Modal container ref
 * @returns {JSX.Element} Modal 컴포넌트 / Modal component
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
  className,
  isOpen,
  onClose,
  children,
  size = "md",
  closable,
  showCloseButton,
  closeOnOverlayClick = true,
  title,
  description,
  showBackdrop = true,
  backdropClassName,
  centered = true
  }, ref) => {
  // closable과 showCloseButton 둘 다 지원 (closable 우선)
  const _closable = closable ?? showCloseButton ?? true
  const modalRef = React.useRef<HTMLDivElement>(null)
    const combinedRef = useCombinedRefs(ref, modalRef)

  // ESC 키로 모달 닫기 및 스크롤 잠금 (화면 흔들림 방지)
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // 스크롤바 너비 계산하여 padding 추가 (화면 흔들림 방지)
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = "hidden"
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
      document.body.style.paddingRight = "unset"
    }
  }, [isOpen, onClose])

  // 모달 외부 클릭으로 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  // 모달 크기 클래스 (max-w 기반, 콘텐츠에 맞게 자연스럽게 축소)
  const sizeClasses = {
    sm: "max-w-xs", // 320px
    md: "max-w-sm", // 384px
    lg: "max-w-md", // 448px
    xl: "max-w-lg", // 512px
    "2xl": "max-w-xl", // 576px
    "3xl": "max-w-2xl" // 672px
  }

  // 접근성을 위한 ID 생성
  const generatedTitleId = React.useId()
  const generatedDescId = React.useId()
  const titleId = title ? `modal-title-${generatedTitleId}` : undefined;
  const descriptionId = description ? `modal-description-${generatedDescId}` : undefined;

  // SSR에서는 document가 없으므로 체크
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen) return null

  const modalContent = (
    <div
      className={merge(
        "fixed inset-0 z-50 overflow-y-auto",
        className
      )}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* 배경 오버레이 - pointer-events-none으로 클릭이 뒤로 전달됨 */}
      {showBackdrop && (
        <div className={merge(
          "fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 pointer-events-none",
          backdropClassName
        )} />
      )}

      {/* 센터링 컨테이너 */}
      <div className={merge(
        "flex h-full justify-center p-4",
        centered ? "items-center" : "items-start pt-16"
      )}>
        {/* 모달 컨테이너 */}
        {/* CSS 변수 기반 배경색 (Tailwind v4 dark: + bg-* 충돌 우회) */}
        <div
          ref={combinedRef}
          className={merge(
            "relative bg-[var(--modal-bg)] rounded-lg shadow-2xl border border-[var(--modal-border)] transform transition-all duration-300 ease-out",
            sizeClasses[size]
          )}
          style={{
            animation: "modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
        
        {/* 헤더 */}
        {title && (
          <div className="relative z-10 px-6 pt-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
            {/* 타이틀과 닫기 버튼 - 같은 줄, 양쪽 끝 */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <h2 id={titleId} className="text-xl font-semibold text-gray-900 dark:text-white flex-1 min-w-0">{title}</h2>
              {/* 닫기 버튼 - 타이틀과 같은 계층의 오른쪽 끝 */}
              {_closable && (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-2 z-20"
                  aria-label="닫기"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {/* 설명 - 아래 줄 */}
            {description && (
              <p id={descriptionId} className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}

        {/* 타이틀이 없을 때만 별도 닫기 버튼 */}
        {!title && showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-2 z-20"
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
    </div>
  )

  // 브라우저에서만 createPortal 사용 (SSR 호환)
  if (mounted && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  // SSR fallback - 그냥 렌더링 (첫 렌더링에는 보이지 않음)
  return null
})

Modal.displayName = "Modal" 