"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"

/**
 * Drawer 컴포넌트의 props / Drawer component props
 * @typedef {Object} DrawerProps
 * @property {boolean} open - Drawer 열림/닫힘 상태 / Drawer open/close state
 * @property {(open: boolean) => void} onOpenChange - 상태 변경 콜백 / State change callback
 * @property {React.ReactNode} children - Drawer 내용 / Drawer content
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {"left" | "right" | "top" | "bottom"} [side="right"] - Drawer 표시 위치 / Drawer display position
 * @property {"sm" | "md" | "lg" | "xl" | "full"} [size="md"] - Drawer 크기 / Drawer size
 * @property {boolean} [showBackdrop=true] - 배경 오버레이 표시 여부 / Show backdrop overlay
 * @property {string} [backdropClassName] - 배경 오버레이 추가 CSS 클래스 / Backdrop overlay additional CSS class
 * @property {boolean} [closeOnBackdropClick=true] - 배경 클릭 시 닫기 여부 / Close on backdrop click
 * @property {boolean} [closeOnEscape=true] - ESC 키로 닫기 여부 / Close on ESC key
 */
interface DrawerProps {
  /** Drawer 열림/닫힘 상태 / Drawer open/close state */
  isOpen?: boolean
  /** Drawer 닫기 콜백 / Drawer close callback */
  onClose?: () => void
  /** Drawer 내용 / Drawer content */
  children: React.ReactNode
  /** 추가 CSS 클래스 / Additional CSS class */
  className?: string
  /** Drawer 표시 위치 / Drawer display position */
  side?: "left" | "right" | "top" | "bottom"
  /** Drawer 크기 / Drawer size */
  size?: "sm" | "md" | "lg" | "xl" | "full"
  /** 배경 오버레이 표시 여부 / Show backdrop overlay */
  showBackdrop?: boolean
  /** 배경 오버레이 추가 CSS 클래스 / Backdrop overlay additional CSS class */
  backdropClassName?: string
  /** 배경 클릭 시 닫기 여부 / Close on backdrop click */
  closeOnBackdropClick?: boolean
  /** ESC 키로 닫기 여부 / Close on ESC key */
  closeOnEscape?: boolean
  /** 닫기 버튼 표시 여부 / Show close button */
  closable?: boolean
}

/**
 * Drawer 컴포넌트 / Drawer component
 * 
 * 사이드에서 슬라이드되는 패널 컴포넌트입니다.
 * Modal과 유사하지만 특정 방향에서 슬라이드되는 애니메이션을 제공합니다.
 * ESC 키로 닫기, 배경 클릭으로 닫기 기능을 지원합니다.
 * 
 * Panel component that slides from the side.
 * Similar to Modal but provides slide animation from a specific direction.
 * Supports closing with ESC key and backdrop click.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * const [open, setOpen] = useState(false)
 * 
 * <Drawer open={open} onOpenChange={setOpen}>
 *   <DrawerHeader>제목</DrawerHeader>
 *   <DrawerContent>내용</DrawerContent>
 *   <DrawerFooter>
 *     <Button onClick={() => setOpen(false)}>닫기</Button>
 *   </DrawerFooter>
 * </Drawer>
 * 
 * @example
 * // 왼쪽에서 열기 / Open from left
 * <Drawer open={open} onOpenChange={setOpen} side="left" size="lg">
 *   <DrawerContent>사이드바 내용</DrawerContent>
 * </Drawer>
 * 
 * @param {DrawerProps} props - Drawer 컴포넌트의 props / Drawer component props
 * @param {React.Ref<HTMLDivElement>} ref - Drawer 컨테이너 ref / Drawer container ref
 * @returns {JSX.Element} Drawer 컴포넌트 / Drawer component
 * 
 * @todo 접근성 개선: role="dialog", aria-modal="true" 추가 필요 / Accessibility: Add role="dialog", aria-modal="true"
 * @todo 접근성 개선: aria-labelledby, aria-describedby 연결 필요 / Accessibility: Connect aria-labelledby, aria-describedby
 */
const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({
    isOpen,
    onClose,
    children,
    className,
    side = "right",
    size = "md",
    showBackdrop = true,
    backdropClassName,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    closable = true,
    ...props
  }, ref) => {
    const _isOpen = isOpen ?? false
    const handleClose = () => {
      onClose?.()
    }

    const [isVisible, setIsVisible] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)

    React.useEffect(() => {
      if (_isOpen) {
        setIsVisible(true)
        setIsAnimating(true)
        // 애니메이션 시작을 위한 지연
        const timer = setTimeout(() => setIsAnimating(false), 50)
        return () => clearTimeout(timer)
      } else {
        setIsAnimating(true)
        const timer = setTimeout(() => {
          setIsVisible(false)
          setIsAnimating(false)
        }, 300) // 애니메이션 완료 후 숨김
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

    if (!isVisible) return null

    const sizeClasses = {
      sm: side === "left" || side === "right" ? "w-80" : "h-64",
      md: side === "left" || side === "right" ? "w-96" : "h-96",
      lg: side === "left" || side === "right" ? "w-[28rem]" : "h-[32rem]",
      xl: side === "left" || side === "right" ? "w-[32rem]" : "h-[40rem]",
      full: side === "left" || side === "right" ? "w-full" : "h-full"
    }

    const sideClasses = {
      left: "left-0 top-0 h-full",
      right: "right-0 top-0 h-full",
      top: "top-0 left-0 w-full",
      bottom: "bottom-0 left-0 w-full"
    }

    // Transform: _isOpen=true -> visible position, _isOpen=false -> hidden position
    const transformClasses = {
      left: _isOpen ? "translate-x-0" : "-translate-x-full",
      right: _isOpen ? "translate-x-0" : "translate-x-full",
      top: _isOpen ? "translate-y-0" : "-translate-y-full",
      bottom: _isOpen ? "translate-y-0" : "translate-y-full"
    }

    return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        {showBackdrop && (
          <div
            className={merge(
              "absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300",
              isAnimating ? (_isOpen ? "opacity-100" : "opacity-0") : "",
              backdropClassName
            )}
            onClick={closeOnBackdropClick ? handleClose : undefined}
          />
        )}

        {/* Drawer Content */}
        <div
          ref={ref}
          className={merge(
            "absolute bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl transition-transform duration-300 ease-out",
            sizeClasses[size],
            sideClasses[side],
            transformClasses[side],
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    )
  }
)
Drawer.displayName = "Drawer"

/**
 * DrawerHeader 컴포넌트의 props / DrawerHeader component props
 * @typedef {Object} DrawerHeaderProps
 * @property {React.ReactNode} children - 헤더 내용 / Header content
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {boolean} [showCloseButton=true] - 닫기 버튼 표시 여부 / Show close button
 * @property {() => void} [onClose] - 닫기 버튼 클릭 콜백 / Close button click callback
 */
interface DrawerHeaderProps {
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  onClose?: () => void
}

/**
 * DrawerHeader 컴포넌트 / DrawerHeader component
 * Drawer의 헤더 영역을 표시합니다.
 * Displays the header area of a Drawer.
 * 
 * @component
 * @param {DrawerHeaderProps} props - DrawerHeader 컴포넌트의 props / DrawerHeader component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} DrawerHeader 컴포넌트 / DrawerHeader component
 */
const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ children, className, showCloseButton = true, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={merge("flex items-center justify-between p-6 border-b border-border/50", className)}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        )}
      </div>
    )
  }
)
DrawerHeader.displayName = "DrawerHeader"

/**
 * DrawerContent 컴포넌트의 props / DrawerContent component props
 * @typedef {Object} DrawerContentProps
 * @property {React.ReactNode} children - 콘텐츠 / Content
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 */
interface DrawerContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * DrawerContent 컴포넌트 / DrawerContent component
 * Drawer의 메인 콘텐츠 영역을 표시합니다.
 * Displays the main content area of a Drawer.
 * 
 * @component
 * @param {DrawerContentProps} props - DrawerContent 컴포넌트의 props / DrawerContent component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} DrawerContent 컴포넌트 / DrawerContent component
 */
const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={merge("flex-1 p-6 overflow-y-auto", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DrawerContent.displayName = "DrawerContent"

/**
 * DrawerFooter 컴포넌트의 props / DrawerFooter component props
 * @typedef {Object} DrawerFooterProps
 * @property {React.ReactNode} children - 푸터 내용 / Footer content
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 */
interface DrawerFooterProps {
  children: React.ReactNode
  className?: string
}

/**
 * DrawerFooter 컴포넌트 / DrawerFooter component
 * Drawer의 푸터 영역을 표시합니다. 주로 액션 버튼을 배치합니다.
 * Displays the footer area of a Drawer. Typically used for action buttons.
 * 
 * @component
 * @param {DrawerFooterProps} props - DrawerFooter 컴포넌트의 props / DrawerFooter component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} DrawerFooter 컴포넌트 / DrawerFooter component
 */
const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={merge("flex items-center justify-end gap-3 p-6 border-t border-border/50", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DrawerFooter.displayName = "DrawerFooter"

export { Drawer, DrawerHeader, DrawerContent, DrawerFooter } 