"use client"

import React from "react"
import { Icon } from "./Icon"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

/**
 * Drawer 컴포넌트의 props / Drawer component props
 * @typedef {Object} DrawerProps
 * @property {boolean} open - Drawer 열림/닫힘 상태 / Drawer open/close state
 * @property {(open: boolean) => void} onOpenChange - 상태 변경 콜백 / State change callback
 * @property {React.ReactNode} children - Drawer 내용 / Drawer content
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 * @property {"left" | "right" | "top" | "bottom"} [side="right"] - Drawer 표시 위치 / Drawer display position
 * @property {"sm" | "md" | "lg" | "xl" | "full"} [size="md"] - Drawer 크기 / Drawer size
 * @property {boolean} [showBackdrop=true] - 배경 오버레이 표시 여부 / Show backdrop overlay
 * @property {string} [backdropDot] - 배경 오버레이 추가 dot 스트링 / Backdrop overlay additional dot string
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
  /** dot 유틸리티 스트링 (인라인 스타일로 변환) / dot utility string (converted to inline style) */
  dot?: string
  /** 인라인 스타일 / Inline style */
  style?: React.CSSProperties
  /** Drawer 표시 위치 / Drawer display position */
  side?: "left" | "right" | "top" | "bottom"
  /** Drawer 크기 / Drawer size */
  size?: "sm" | "md" | "lg" | "xl" | "full"
  /** 배경 오버레이 표시 여부 / Show backdrop overlay */
  showBackdrop?: boolean
  /** 배경 오버레이 추가 dot 스트링 / Backdrop overlay additional dot string */
  backdropDot?: string
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
    dot: dotProp,
    style,
    side = "right",
    size = "md",
    showBackdrop = true,
    backdropDot,
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

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: side === "left" || side === "right" ? { width: '20rem' } : { height: '16rem' },
      md: side === "left" || side === "right" ? { width: '24rem' } : { height: '24rem' },
      lg: side === "left" || side === "right" ? { width: '28rem' } : { height: '32rem' },
      xl: side === "left" || side === "right" ? { width: '32rem' } : { height: '40rem' },
      full: side === "left" || side === "right" ? { width: '100%' } : { height: '100%' }
    }

    const sideStyles: Record<string, React.CSSProperties> = {
      left: { left: 0, top: 0, height: '100%' },
      right: { right: 0, top: 0, height: '100%' },
      top: { top: 0, left: 0, width: '100%' },
      bottom: { bottom: 0, left: 0, width: '100%' }
    }

    // Transform: _isOpen=true -> visible position, _isOpen=false -> hidden position
    const transformStyles: Record<string, React.CSSProperties> = {
      left: { transform: _isOpen ? 'translateX(0)' : 'translateX(-100%)' },
      right: { transform: _isOpen ? 'translateX(0)' : 'translateX(100%)' },
      top: { transform: _isOpen ? 'translateY(0)' : 'translateY(-100%)' },
      bottom: { transform: _isOpen ? 'translateY(0)' : 'translateY(100%)' }
    }

    // Backdrop opacity animation
    const backdropOpacity = isAnimating
      ? (_isOpen ? 1 : 0)
      : undefined

    return (
      <div style={resolveDot('fixed inset-0 z-50')}>
        {/* Backdrop */}
        {showBackdrop && (
          <div
            style={mergeStyles(
              resolveDot('absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300'),
              resolveDot(backdropDot),
              backdropOpacity !== undefined ? { opacity: backdropOpacity } : undefined
            )}
            onClick={closeOnBackdropClick ? handleClose : undefined}
          />
        )}

        {/* Drawer Content */}
        <div
          ref={ref}
          style={mergeStyles(
            resolveDot('absolute bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl transition-transform duration-300 ease-out'),
            sizeStyles[size],
            sideStyles[side],
            transformStyles[side],
            resolveDot(dotProp),
            style
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
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 * @property {boolean} [showCloseButton=true] - 닫기 버튼 표시 여부 / Show close button
 * @property {() => void} [onClose] - 닫기 버튼 클릭 콜백 / Close button click callback
 */
interface DrawerHeaderProps {
  children: React.ReactNode
  /** 인라인 스타일 / Inline style */
  style?: React.CSSProperties
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
  ({ children, style, showCloseButton = true, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={mergeStyles(resolveDot('flex items-center justify-between p-6 border-b border-border/50'), style)}
        {...props}
      >
        <div style={resolveDot('flex-1')}>{children}</div>
        {showCloseButton && (
          <button
            onClick={onClose}
            style={resolveDot('p-2 rounded-lg hover:bg-muted transition-colors')}
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
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 */
interface DrawerContentProps {
  children: React.ReactNode
  /** 인라인 스타일 / Inline style */
  style?: React.CSSProperties
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
  ({ children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={mergeStyles(resolveDot('flex-1 p-6 overflow-y-auto'), style)}
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
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 */
interface DrawerFooterProps {
  children: React.ReactNode
  /** 인라인 스타일 / Inline style */
  style?: React.CSSProperties
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
  ({ children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={mergeStyles(resolveDot('flex items-center justify-end gap-3 p-6 border-t border-border/50'), style)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DrawerFooter.displayName = "DrawerFooter"

export { Drawer, DrawerHeader, DrawerContent, DrawerFooter }
