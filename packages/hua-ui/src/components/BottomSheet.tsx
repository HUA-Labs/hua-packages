"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"

/**
 * BottomSheet 컴포넌트의 props / BottomSheet component props
 * @typedef {Object} BottomSheetProps
 * @property {boolean} open - BottomSheet 열림/닫힘 상태 / BottomSheet open/close state
 * @property {(open: boolean) => void} onOpenChange - 상태 변경 콜백 / State change callback
 * @property {React.ReactNode} children - BottomSheet 내용 / BottomSheet content
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {"sm" | "md" | "lg" | "xl" | "full"} [height="md"] - BottomSheet 높이 / BottomSheet height
 * @property {boolean} [showBackdrop=true] - 배경 오버레이 표시 여부 / Show backdrop overlay
 * @property {string} [backdropClassName] - 배경 오버레이 추가 CSS 클래스 / Backdrop overlay additional CSS class
 * @property {boolean} [closeOnBackdropClick=true] - 배경 클릭 시 닫기 여부 / Close on backdrop click
 * @property {boolean} [closeOnEscape=true] - ESC 키로 닫기 여부 / Close on ESC key
 * @property {boolean} [showDragHandle=true] - 드래그 핸들 표시 여부 / Show drag handle
 * @property {number[]} [snapPoints=[25, 50, 75, 100]] - 스냅 포인트 (퍼센트) / Snap points (percentage)
 * @property {number} [defaultSnap=50] - 기본 스냅 포인트 (퍼센트) / Default snap point (percentage)
 */
interface BottomSheetProps {
  /** BottomSheet 열림/닫힘 상태 / BottomSheet open/close state */
  isOpen?: boolean
  /** @deprecated use isOpen instead */
  open?: boolean
  /** BottomSheet 닫기 콜백 / BottomSheet close callback */
  onClose?: () => void
  /** @deprecated use onClose instead */
  onOpenChange?: (open: boolean) => void
  /** BottomSheet 내용 / BottomSheet content */
  children: React.ReactNode
  /** 추가 CSS 클래스 / Additional CSS class */
  className?: string
  /** BottomSheet 높이 / BottomSheet height */
  height?: "sm" | "md" | "lg" | "xl" | "full"
  /** 배경 오버레이 표시 여부 / Show backdrop overlay */
  showBackdrop?: boolean
  /** 배경 오버레이 추가 CSS 클래스 / Backdrop overlay additional CSS class */
  backdropClassName?: string
  /** 배경 클릭 시 닫기 여부 / Close on backdrop click */
  closeOnBackdropClick?: boolean
  /** ESC 키로 닫기 여부 / Close on ESC key */
  closeOnEscape?: boolean
  /** 드래그 핸들 표시 여부 / Show drag handle */
  showDragHandle?: boolean
  /** 닫기 버튼 표시 여부 / Show close button */
  closable?: boolean
  /** 스냅 포인트 (퍼센트) / Snap points (percentage) */
  snapPoints?: number[]
  /** 기본 스냅 포인트 (퍼센트) / Default snap point (percentage) */
  defaultSnap?: number
}

/**
 * BottomSheet 컴포넌트 / BottomSheet component
 * 
 * 화면 하단에서 올라오는 시트 컴포넌트입니다.
 * 모바일 친화적인 UI를 제공하며, 드래그로 높이를 조절할 수 있습니다.
 * 스냅 포인트를 지원하여 특정 높이에서 멈출 수 있습니다.
 * 
 * Sheet component that slides up from the bottom of the screen.
 * Provides mobile-friendly UI and allows height adjustment by dragging.
 * Supports snap points to stop at specific heights.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * const [open, setOpen] = useState(false)
 * 
 * <BottomSheet open={open} onOpenChange={setOpen}>
 *   <BottomSheetHeader>제목</BottomSheetHeader>
 *   <BottomSheetContent>내용</BottomSheetContent>
 * </BottomSheet>
 * 
 * @example
 * // 커스텀 스냅 포인트 / Custom snap points
 * <BottomSheet 
 *   open={open} 
 *   onOpenChange={setOpen}
 *   snapPoints={[30, 60, 90]}
 *   defaultSnap={30}
 * >
 *   <BottomSheetContent>내용</BottomSheetContent>
 * </BottomSheet>
 * 
 * @param {BottomSheetProps} props - BottomSheet 컴포넌트의 props / BottomSheet component props
 * @param {React.Ref<HTMLDivElement>} ref - BottomSheet 컨테이너 ref / BottomSheet container ref
 * @returns {JSX.Element} BottomSheet 컴포넌트 / BottomSheet component
 * 
 * @todo 접근성 개선: role="dialog", aria-modal="true" 추가 필요 / Accessibility: Add role="dialog", aria-modal="true"
 * @todo 접근성 개선: aria-labelledby, aria-describedby 연결 필요 / Accessibility: Connect aria-labelledby, aria-describedby
 */
const BottomSheet = React.forwardRef<HTMLDivElement, BottomSheetProps>(
  ({
    isOpen,
    open,
    onClose,
    onOpenChange,
    children,
    className,
    height = "md",
    showBackdrop = true,
    backdropClassName,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    showDragHandle = true,
    closable = true,
    snapPoints = [25, 50, 75, 100],
    defaultSnap = 50,
    ...props
  }, ref) => {
    // isOpen과 open 둘 다 지원 (isOpen 우선)
    const _isOpen = isOpen ?? open ?? false
    // onClose와 onOpenChange 둘 다 지원
    const handleClose = () => {
      onClose?.()
      onOpenChange?.(false)
    }

    const [isVisible, setIsVisible] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)
    const [currentHeight, setCurrentHeight] = React.useState(defaultSnap)
    const [isDragging, setIsDragging] = React.useState(false)
    const [startY, setStartY] = React.useState(0)
    const [currentY, setCurrentY] = React.useState(0)

    const heightClasses = {
      sm: "h-64",
      md: "h-96",
      lg: "h-[32rem]",
      xl: "h-[40rem]",
      full: "h-full"
    }

    React.useEffect(() => {
      if (_isOpen) {
        setIsVisible(true)
        setIsAnimating(true)
        const timer = setTimeout(() => setIsAnimating(false), 50)
        return () => clearTimeout(timer)
      } else {
        setIsAnimating(true)
        const timer = setTimeout(() => {
          setIsVisible(false)
          setIsAnimating(false)
        }, 300)
        return () => clearTimeout(timer)
      }
    }, [_isOpen])

    React.useEffect(() => {
      if (!closeOnEscape) return

      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && _isOpen) {
          handleClose()
        }
      }

      if (_isOpen) {
        document.addEventListener("keydown", handleEscapeKey)
        document.body.style.overflow = "hidden"
      }

      return () => {
        document.removeEventListener("keydown", handleEscapeKey)
        document.body.style.overflow = ""
      }
    }, [_isOpen, closeOnEscape])

    const handleTouchStart = (e: React.TouchEvent) => {
      setIsDragging(true)
      setStartY(e.touches[0].clientY)
      setCurrentY(e.touches[0].clientY)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return
      setCurrentY(e.touches[0].clientY)
    }

    const handleTouchEnd = () => {
      if (!isDragging) return
      setIsDragging(false)

      const deltaY = currentY - startY
      const threshold = 100

      if (deltaY > threshold) {
        // 아래로 드래그 - 닫기
        handleClose()
      } else if (deltaY < -threshold) {
        // 위로 드래그 - 다음 스냅 포인트
        const currentIndex = snapPoints.indexOf(currentHeight)
        const nextIndex = Math.min(currentIndex + 1, snapPoints.length - 1)
        setCurrentHeight(snapPoints[nextIndex])
      }
    }

    if (!isVisible) return null

    return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        {showBackdrop && (
          <div
            className={merge(
              "absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300",
              isAnimating ? (_isOpen ? "opacity-100" : "opacity-0") : "",
              backdropClassName
            )}
            onClick={closeOnBackdropClick ? handleClose : undefined}
          />
        )}

        {/* Bottom Sheet */}
        <div
          ref={ref}
          className={merge(
            "absolute bottom-0 left-0 right-0 bg-white/95 dark:!bg-gray-800/95 backdrop-blur-xl border-t border-gray-200/50 dark:!border-gray-600/50 shadow-2xl rounded-t-lg transition-transform duration-300 ease-out pb-safe",
            height !== "full" ? heightClasses[height] : "",
            isAnimating ? (_isOpen ? "translate-y-0" : "translate-y-full") : "",
            className
          )}
          style={{
            // height prop이 "full"일 때만 퍼센트 높이 사용 (스냅 포인트)
            // 그 외에는 heightClasses의 고정 높이 사용
            height: height === "full" ? `${currentHeight}%` : undefined,
            maxHeight: height !== "full" ? undefined : "100%",
            transform: isDragging ? `translateY(${currentY - startY}px)` : undefined
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          {...props}
        >
          {/* Drag Handle */}
          {showDragHandle && (
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
          )}

          {children}
        </div>
      </div>
    )
  }
)
BottomSheet.displayName = "BottomSheet"

/**
 * BottomSheetHeader 컴포넌트의 props / BottomSheetHeader component props
 * @typedef {Object} BottomSheetHeaderProps
 * @property {React.ReactNode} children - 헤더 내용 / Header content
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {boolean} [showCloseButton=true] - 닫기 버튼 표시 여부 / Show close button
 * @property {() => void} [onClose] - 닫기 버튼 클릭 콜백 / Close button click callback
 */
interface BottomSheetHeaderProps {
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  onClose?: () => void
}

/**
 * BottomSheetHeader 컴포넌트 / BottomSheetHeader component
 * BottomSheet의 헤더 영역을 표시합니다.
 * Displays the header area of a BottomSheet.
 * 
 * @component
 * @param {BottomSheetHeaderProps} props - BottomSheetHeader 컴포넌트의 props / BottomSheetHeader component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} BottomSheetHeader 컴포넌트 / BottomSheetHeader component
 */
const BottomSheetHeader = React.forwardRef<HTMLDivElement, BottomSheetHeaderProps>(
  ({ children, className, showCloseButton = true, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={merge("flex items-center justify-between px-6 py-4", className)}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        )}
      </div>
    )
  }
)
BottomSheetHeader.displayName = "BottomSheetHeader"

/**
 * BottomSheetContent 컴포넌트의 props / BottomSheetContent component props
 * @typedef {Object} BottomSheetContentProps
 * @property {React.ReactNode} children - 콘텐츠 / Content
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 */
interface BottomSheetContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * BottomSheetContent 컴포넌트 / BottomSheetContent component
 * BottomSheet의 메인 콘텐츠 영역을 표시합니다.
 * Displays the main content area of a BottomSheet.
 * 
 * @component
 * @param {BottomSheetContentProps} props - BottomSheetContent 컴포넌트의 props / BottomSheetContent component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} BottomSheetContent 컴포넌트 / BottomSheetContent component
 */
const BottomSheetContent = React.forwardRef<HTMLDivElement, BottomSheetContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={merge("flex-1 px-6 pb-6 overflow-y-auto", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BottomSheetContent.displayName = "BottomSheetContent"

export { BottomSheet, BottomSheetHeader, BottomSheetContent } 