"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"

/**
 * Accordion 컴포넌트의 props / Accordion component props
 * @typedef {Object} AccordionProps
 * @property {React.ReactNode} children - AccordionItem 컴포넌트들 / AccordionItem components
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {"single" | "multiple"} [type="single"] - 단일 또는 다중 아이템 열기 허용 / Allow single or multiple items to be open
 * @property {string | string[]} [defaultValue] - 초기 열린 아이템 값 (비제어 컴포넌트) / Initial open item value (uncontrolled component)
 * @property {string | string[]} [value] - 현재 열린 아이템 값 (제어 컴포넌트) / Current open item value (controlled component)
 * @property {(value: string | string[]) => void} [onValueChange] - 아이템 열림/닫힘 콜백 / Item open/close callback
 * @property {boolean} [collapsible=false] - 단일 모드에서 열린 아이템을 닫을 수 있는지 여부 / Whether open item can be closed in single mode
 */
interface AccordionProps {
  children: React.ReactNode
  className?: string
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
}

/**
 * Accordion 컴포넌트 / Accordion component
 * 
 * 접을 수 있는 콘텐츠 섹션을 제공하는 컴포넌트입니다.
 * 키보드 네비게이션(Arrow keys, Home/End)을 지원하며, ARIA 속성을 자동으로 설정합니다.
 * 
 * Component that provides collapsible content sections.
 * Supports keyboard navigation (Arrow keys, Home/End) and automatically sets ARIA attributes.
 * 
 * @component
 * @example
 * // 기본 사용 (단일 열기) / Basic usage (single open)
 * <Accordion type="single">
 *   <AccordionItem value="item1">
 *     <AccordionTrigger>제목 1</AccordionTrigger>
 *     <AccordionContent>내용 1</AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem value="item2">
 *     <AccordionTrigger>제목 2</AccordionTrigger>
 *     <AccordionContent>내용 2</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * 
 * @example
 * // 다중 열기 / Multiple open
 * <Accordion type="multiple" defaultValue={["item1", "item2"]}>
 *   <AccordionItem value="item1">
 *     <AccordionTrigger>제목 1</AccordionTrigger>
 *     <AccordionContent>내용 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * 
 * @example
 * // 제어 컴포넌트 / Controlled component
 * const [openItems, setOpenItems] = useState<string[]>([])
 * <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
 *   <AccordionItem value="item1">
 *     <AccordionTrigger>제목</AccordionTrigger>
 *     <AccordionContent>내용</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * 
 * @param {AccordionProps} props - Accordion 컴포넌트의 props / Accordion component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Accordion 컴포넌트 / Accordion component
 */
const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ 
    children, 
    className,
    type = "single",
    defaultValue,
    value,
    onValueChange,
    collapsible = false,
    ...props 
  }, ref) => {
    const [openItems, setOpenItems] = React.useState<string[]>(
      value ? (Array.isArray(value) ? value : [value]) : 
      defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : []
    )

    React.useEffect(() => {
      if (value !== undefined) {
        setOpenItems(Array.isArray(value) ? value : [value])
      }
    }, [value])

    const handleItemToggle = (itemValue: string) => {
      let newOpenItems: string[]

      if (type === "single") {
        if (openItems.includes(itemValue)) {
          newOpenItems = collapsible ? [] : openItems
        } else {
          newOpenItems = [itemValue]
        }
      } else {
        if (openItems.includes(itemValue)) {
          newOpenItems = openItems.filter(item => item !== itemValue)
        } else {
          newOpenItems = [...openItems, itemValue]
        }
      }

      setOpenItems(newOpenItems)
      onValueChange?.(type === "single" ? newOpenItems[0] || "" : newOpenItems)
    }

    // 모든 아이템의 value를 수집
    const itemValues = React.useMemo(() => {
      const values: string[] = []
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as { value?: string }
          if (childProps.value) {
            values.push(childProps.value)
          }
        }
      })
      return values
    }, [children])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement
      if (!target.hasAttribute('data-accordion-trigger')) return

      const currentValue = target.getAttribute('data-accordion-value')
      if (!currentValue) return

      const currentIndex = itemValues.indexOf(currentValue)
      if (currentIndex === -1) return

      let newIndex = currentIndex

      if (e.key === "ArrowDown") {
        e.preventDefault()
        newIndex = currentIndex < itemValues.length - 1 ? currentIndex + 1 : 0
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : itemValues.length - 1
      } else if (e.key === "Home") {
        e.preventDefault()
        newIndex = 0
      } else if (e.key === "End") {
        e.preventDefault()
        newIndex = itemValues.length - 1
      }

      if (newIndex !== currentIndex && itemValues[newIndex]) {
        const triggerElement = target.closest('[data-accordion-item]')?.querySelector(
          `[data-accordion-value="${itemValues[newIndex]}"]`
        ) as HTMLElement
        triggerElement?.focus()
      }
    }

    return (
      <div
        ref={ref}
        className={merge("space-y-2", className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              openItems,
              onToggle: handleItemToggle
            } as Partial<AccordionItemProps>)
          }
          return child
        })}
      </div>
    )
  }
)
Accordion.displayName = "Accordion"

/**
 * AccordionItem 컴포넌트의 props / AccordionItem component props
 * @typedef {Object} AccordionItemProps
 * @property {string} value - 아이템의 고유 값 / Item unique value
 * @property {React.ReactNode} children - AccordionTrigger와 AccordionContent / AccordionTrigger and AccordionContent
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {boolean} [disabled=false] - 아이템 비활성화 여부 / Item disabled state
 * @property {string[]} [openItems] - 열린 아이템 목록 (Accordion에서 자동 전달) / Open items list (auto-passed from Accordion)
 * @property {(value: string) => void} [onToggle] - 토글 콜백 (Accordion에서 자동 전달) / Toggle callback (auto-passed from Accordion)
 */
interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  openItems?: string[]
  onToggle?: (value: string) => void
}

/**
 * AccordionItem 컴포넌트 / AccordionItem component
 * 아코디언의 개별 아이템을 감싸는 컨테이너입니다.
 * Container that wraps an individual accordion item.
 * 
 * @component
 * @param {AccordionItemProps} props - AccordionItem 컴포넌트의 props / AccordionItem component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} AccordionItem 컴포넌트 / AccordionItem component
 */
const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ 
    value, 
    children, 
    className,
    disabled = false,
    openItems = [],
    onToggle,
    ...props 
  }, ref) => {
    const isOpen = openItems.includes(value)

    return (
      <div
        ref={ref}
        data-accordion-item
        className={merge(
          "border border-gray-200/50 dark:border-gray-700/50 rounded-lg overflow-hidden",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              value,
              isOpen,
              disabled,
              onToggle: () => onToggle?.(value),
              'data-accordion-value': value
            } as Partial<AccordionTriggerProps | AccordionContentProps>)
          }
          return child
        })}
      </div>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  value?: string // Optional: AccordionItem에서 자동으로 전달됨 / Optional: Auto-passed from AccordionItem
  isOpen?: boolean
  disabled?: boolean
  onToggle?: () => void
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ 
    children, 
    className,
    icon,
    iconPosition = "right",
    value,
    isOpen = false,
    disabled = false,
    onToggle,
    ...props 
  }, ref) => {
    const defaultIcon = (
      <Icon 
        name="chevronDown" 
        size={20} 
        className={merge(
          "transition-transform duration-300 ease-out text-gray-500 dark:text-gray-400",
          isOpen && "rotate-180"
        )} 
      />
    )

    const contentId = `accordion-content-${value}`
    const triggerId = `accordion-trigger-${value}`

    return (
      <button
        ref={ref}
        id={triggerId}
        data-accordion-trigger
        data-accordion-value={value}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={onToggle}
        disabled={disabled}
        className={merge(
          "flex w-full items-center justify-between px-6 py-4 text-left font-medium transition-all hover:bg-gray-50/80 dark:hover:bg-gray-800/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3 flex-1">
          {iconPosition === "left" && (icon || defaultIcon)}
          <span className="flex-1">{children}</span>
        </div>
        {iconPosition === "right" && (icon || defaultIcon)}
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

/**
 * AccordionTrigger 컴포넌트 / AccordionTrigger component
 * 아코디언 아이템을 열고 닫는 트리거 버튼입니다.
 * Button that opens and closes an accordion item.
 * 
 * @component
 * @param {AccordionTriggerProps} props - AccordionTrigger 컴포넌트의 props / AccordionTrigger component props
 * @param {React.Ref<HTMLButtonElement>} ref - button 요소 ref / button element ref
 * @returns {JSX.Element} AccordionTrigger 컴포넌트 / AccordionTrigger component
 */

/**
 * AccordionContent 컴포넌트의 props
 * @typedef {Object} AccordionContentProps
 * @property {React.ReactNode} children - 콘텐츠
 * @property {string} [className] - 추가 CSS 클래스
 * @property {boolean} [isOpen] - 열림 상태 (AccordionItem에서 자동 전달)
 * @property {string} [value] - 아이템 값 (AccordionItem에서 자동 전달)
 * @property {string} ['data-accordion-value'] - 아이템 값 (내부 사용)
 */
interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
  value?: string
  'data-accordion-value'?: string
}

/**
 * AccordionContent 컴포넌트 / AccordionContent component
 * 아코디언 아이템의 콘텐츠를 표시합니다.
 * Displays the content of an accordion item.
 * 
 * @component
 * @param {AccordionContentProps} props - AccordionContent 컴포넌트의 props / AccordionContent component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} AccordionContent 컴포넌트 / AccordionContent component
 */
const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, isOpen = false, value, 'data-accordion-value': dataValue, ...props }, ref) => {
    const [height, setHeight] = React.useState(0)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const itemValue = value || dataValue || 'unknown'

    React.useEffect(() => {
      if (contentRef.current) {
        if (isOpen) {
          setHeight(contentRef.current.scrollHeight)
        } else {
          setHeight(0)
        }
      }
    }, [isOpen, children])

    const triggerId = `accordion-trigger-${itemValue}`
    const contentId = `accordion-content-${itemValue}`

    return (
      <div
        ref={ref}
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ height: `${height}px` }}
        {...props}
      >
        <div
          ref={contentRef}
          className={merge("px-6 pt-2 pb-4", className)}
        >
          {children}
        </div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } 