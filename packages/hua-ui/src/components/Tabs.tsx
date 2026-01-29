"use client"

import React from 'react'
import { merge } from '../lib/utils'

/**
 * TabsContent 컴포넌트의 props / TabsContent component props
 * @typedef {Object} TabsContentProps
 * @property {string} value - 탭 패널의 고유 값 (TabsTrigger의 value와 일치해야 함) / Unique value for tab panel (must match TabsTrigger value)
 * @property {boolean} [active] - 탭 패널 활성화 상태 (자동 설정됨) / Tab panel active state (auto-set)
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  active?: boolean
}

/**
 * TabsContent 컴포넌트 / TabsContent component
 * 탭의 콘텐츠 패널을 표시합니다. Tabs 컴포넌트 내부에서 사용됩니다.
 * Displays the tab content panel. Used inside Tabs component.
 * 
 * @component
 * @param {TabsContentProps} props - TabsContent 컴포넌트의 props / TabsContent component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} TabsContent 컴포넌트 / TabsContent component
 */
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, active, children, ...props }, ref) => {
    // active prop이 명시적으로 false로 설정된 경우에만 숨김
    if (active === false) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabpanel-${value}`}
        aria-labelledby={`tab-${value}`}
        hidden={!active}
        className={merge(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

/**
 * Tabs 컴포넌트의 props / Tabs component props
 * @typedef {Object} TabsProps
 * @property {string} [value] - 현재 활성화된 탭 값 (제어 컴포넌트) / Currently active tab value (controlled component)
 * @property {string} [defaultValue] - 초기 활성화된 탭 값 (비제어 컴포넌트) / Initial active tab value (uncontrolled component)
 * @property {(value: string) => void} [onValueChange] - 탭 변경 시 호출되는 콜백 / Callback when tab changes
 * @property {"horizontal" | "vertical"} [orientation="horizontal"] - 탭 방향 / Tab orientation
 * @property {"default" | "pills" | "underline" | "cards"} [variant="default"] - 탭 스타일 변형 / Tab style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - 탭 크기 / Tab size
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline" | "cards"
  size?: "sm" | "md" | "lg"
}

/**
 * Tabs 컴포넌트 / Tabs component
 * 
 * 탭 네비게이션을 제공하는 컴포넌트입니다.
 * 키보드 네비게이션(Arrow keys, Home/End)을 지원하며, ARIA 속성을 자동으로 설정합니다.
 * 
 * Component that provides tab navigation.
 * Supports keyboard navigation (Arrow keys, Home/End) and automatically sets ARIA attributes.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">탭 1</TabsTrigger>
 *     <TabsTrigger value="tab2">탭 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">탭 1 내용</TabsContent>
 *   <TabsContent value="tab2">탭 2 내용</TabsContent>
 * </Tabs>
 * 
 * @example
 * // 제어 컴포넌트 / Controlled component
 * const [activeTab, setActiveTab] = useState("tab1")
 * <Tabs value={activeTab} onValueChange={setActiveTab}>
 *   <TabsList>
 *     <TabsTrigger value="tab1">탭 1</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">내용</TabsContent>
 * </Tabs>
 * 
 * @example
 * // 다양한 변형 / Various variants
 * <Tabs variant="pills" size="lg">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Pills 스타일</TabsTrigger>
 *   </TabsList>
 * </Tabs>
 * 
 * @param {TabsProps} props - Tabs 컴포넌트의 props / Tabs component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Tabs 컴포넌트 / Tabs component
 */
const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    className, 
    value,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    variant = "default",
    size = "md",
    children,
    ...props 
  }, ref) => {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue || "")
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : activeTab

    const handleTabChange = (newValue: string) => {
      if (!isControlled) {
        setActiveTab(newValue)
      }
      onValueChange?.(newValue)
    }

    React.useEffect(() => {
      if (value !== undefined) {
        setActiveTab(value)
      }
    }, [value])

    return (
      <div
        ref={ref}
        className={merge(
          "w-full",
          orientation === "vertical" && "flex",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // TabsContent인 경우 active prop만 설정 (value는 원래 값 유지)
            if (child.type === TabsContent) {
              const childProps = child.props as TabsContentProps
              return React.cloneElement(child, {
                active: childProps.value === currentValue
              } as Partial<TabsContentProps>)
            }
            // TabsList인 경우에만 onValueChange 전달
            if (child.type === TabsList) {
              return React.cloneElement(child, {
                value: currentValue,
                onValueChange: handleTabChange,
                orientation,
                variant,
                size
              } as Partial<TabsListProps>)
            }
            // 다른 React 컴포넌트들 (다른 custom wrapper 등)
            // HTML 요소가 아닌 경우에만 props 전달
            if (typeof child.type !== 'string') {
              return React.cloneElement(child, {
                value: currentValue,
                onValueChange: handleTabChange,
                orientation,
                variant,
                size
              } as Record<string, unknown>)
            }
          }
          return child
        })}
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

/**
 * TabsList 컴포넌트의 props / TabsList component props
 * @typedef {Object} TabsListProps
 * @property {string} [value] - 현재 활성화된 탭 값 (Tabs에서 자동 전달) / Currently active tab value (auto-passed from Tabs)
 * @property {(value: string) => void} [onValueChange] - 탭 변경 콜백 (Tabs에서 자동 전달) / Tab change callback (auto-passed from Tabs)
 * @property {"horizontal" | "vertical"} [orientation] - 탭 방향 (Tabs에서 자동 전달) / Tab orientation (auto-passed from Tabs)
 * @property {"default" | "pills" | "underline" | "cards"} [variant] - 탭 스타일 (Tabs에서 자동 전달) / Tab style (auto-passed from Tabs)
 * @property {"sm" | "md" | "lg"} [size] - 탭 크기 (Tabs에서 자동 전달) / Tab size (auto-passed from Tabs)
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline" | "cards"
  size?: "sm" | "md" | "lg"
}

/**
 * TabsList 컴포넌트 / TabsList component
 * 탭 트리거 목록을 표시합니다. Tabs 컴포넌트 내부에서 사용됩니다.
 * Displays the list of tab triggers. Used inside Tabs component.
 * 
 * @component
 * @param {TabsListProps} props - TabsList 컴포넌트의 props / TabsList component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} TabsList 컴포넌트 / TabsList component
 */
const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ 
    className, 
    value,
    onValueChange,
    orientation = "horizontal",
    variant = "default",
    size = "md",
    children,
    ...props 
  }, ref) => {
    const listRef = React.useRef<HTMLDivElement>(null)
    React.useImperativeHandle(ref, () => listRef.current as HTMLDivElement)
    
    // 모든 탭 트리거의 value를 수집
    const tabValues = React.useMemo(() => {
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
      if (!value || tabValues.length === 0) return

      const currentIndex = tabValues.indexOf(value)
      if (currentIndex === -1) return

      let newIndex = currentIndex

      if (orientation === "horizontal") {
        if (e.key === "ArrowLeft") {
          e.preventDefault()
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabValues.length - 1
        } else if (e.key === "ArrowRight") {
          e.preventDefault()
          newIndex = currentIndex < tabValues.length - 1 ? currentIndex + 1 : 0
        } else if (e.key === "Home") {
          e.preventDefault()
          newIndex = 0
        } else if (e.key === "End") {
          e.preventDefault()
          newIndex = tabValues.length - 1
        }
      } else {
        if (e.key === "ArrowUp") {
          e.preventDefault()
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabValues.length - 1
        } else if (e.key === "ArrowDown") {
          e.preventDefault()
          newIndex = currentIndex < tabValues.length - 1 ? currentIndex + 1 : 0
        } else if (e.key === "Home") {
          e.preventDefault()
          newIndex = 0
        } else if (e.key === "End") {
          e.preventDefault()
          newIndex = tabValues.length - 1
        }
      }

      if (newIndex !== currentIndex && tabValues[newIndex]) {
        onValueChange?.(tabValues[newIndex])
        // 포커스 이동
        const triggerElement = listRef.current?.querySelector(
          `[data-tab-value="${tabValues[newIndex]}"]`
        ) as HTMLElement
        triggerElement?.focus()
      }
    }
    const getVariantClasses = () => {
      switch (variant) {
        case "pills":
          return "bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        case "underline":
          return "border-b border-gray-200 dark:border-gray-700"
        case "cards":
          return "bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        default:
          return "bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-12"
        case "lg":
          return "h-16"
        default:
          return "h-14"
      }
    }

    return (
      <div
        ref={listRef}
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={merge(
          "flex items-center justify-center",
          orientation === "vertical" && "flex-col",
          getVariantClasses(),
          getSizeClasses(),
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Only pass tab props to non-HTML elements (React components)
            if (typeof child.type === 'string') {
              return child
            }
            const childProps = child.props as { value?: string }
            return React.cloneElement(child, {
              onValueChange,
              orientation,
              variant,
              size,
              active: childProps.value === value
            } as Partial<TabsTriggerProps>)
          }
          return child
        })}
      </div>
    )
  }
)
TabsList.displayName = "TabsList"

/**
 * TabsTrigger 컴포넌트의 props
 * @typedef {Object} TabsTriggerProps
 * @property {string} value - 탭 트리거의 고유 값 (TabsContent의 value와 일치해야 함)
 * @property {(value: string) => void} [onValueChange] - 탭 변경 콜백 (TabsList에서 자동 전달)
 * @property {"horizontal" | "vertical"} [orientation] - 탭 방향 (TabsList에서 자동 전달)
 * @property {"default" | "pills" | "underline" | "cards"} [variant] - 탭 스타일 (TabsList에서 자동 전달)
 * @property {"sm" | "md" | "lg"} [size] - 탭 크기 (TabsList에서 자동 전달)
 * @property {boolean} [active] - 탭 활성화 상태 (자동 설정됨)
 * @extends {React.ButtonHTMLAttributes<HTMLButtonElement>}
 */
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline" | "cards"
  size?: "sm" | "md" | "lg"
  active?: boolean
}

/**
 * TabsTrigger 컴포넌트 / TabsTrigger component
 * 탭을 활성화하는 버튼입니다. TabsList 컴포넌트 내부에서 사용됩니다.
 * Button that activates a tab. Used inside TabsList component.
 * 
 * @component
 * @param {TabsTriggerProps} props - TabsTrigger 컴포넌트의 props / TabsTrigger component props
 * @param {React.Ref<HTMLButtonElement>} ref - button 요소 ref / button element ref
 * @returns {JSX.Element} TabsTrigger 컴포넌트 / TabsTrigger component
 */
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ 
    className,
    value,
    onValueChange,
    orientation: _orientation = "horizontal",
    variant = "default",
    size = "md",
    active = false,
    children,
    ...props
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "pills":
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          )
        case "underline":
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" 
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          )
        case "cards":
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          )
        default:
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          )
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-10 px-4 py-2 text-xs"
        case "lg":
          return "h-14 px-6 py-3 text-base"
        default:
          return "h-12 px-5 py-2.5 text-sm"
      }
    }

    const handleClick = () => {
      if (onValueChange) {
        onValueChange(value)
      }
    }

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={active}
        aria-controls={`tabpanel-${value}`}
        id={`tab-${value}`}
        data-tab-value={value}
        tabIndex={active ? 0 : -1}
        className={merge(
          getVariantClasses(),
          getSizeClasses(),
          className
        )}
        onClick={handleClick}
        type="button"
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

// 편의 컴포넌트들
const TabsPills = React.forwardRef<HTMLDivElement, TabsProps>(
  (props, ref) => <Tabs ref={ref} variant="pills" {...props} />
)
TabsPills.displayName = "TabsPills"

const TabsUnderline = React.forwardRef<HTMLDivElement, TabsProps>(
  (props, ref) => <Tabs ref={ref} variant="underline" {...props} />
)
TabsUnderline.displayName = "TabsUnderline"

const TabsCards = React.forwardRef<HTMLDivElement, TabsProps>(
  (props, ref) => <Tabs ref={ref} variant="cards" {...props} />
)
TabsCards.displayName = "TabsCards"

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsPills, TabsUnderline, TabsCards } 