"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Menu 컴포넌트의 props / Menu component props
 * @typedef {Object} MenuProps
 * @property {React.ReactNode} children - MenuItem, MenuSeparator, MenuLabel 컴포넌트들 / MenuItem, MenuSeparator, MenuLabel components
 * @property {"default" | "horizontal" | "vertical" | "compact"} [variant="default"] - 메뉴 방향 및 스타일 / Menu direction and style
 * @property {"sm" | "md" | "lg"} [size="md"] - 메뉴 아이템 크기 / Menu item size
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "horizontal" | "vertical" | "compact"
  size?: "sm" | "md" | "lg"
}

/**
 * Menu 컴포넌트 / Menu component
 * 
 * 메뉴 리스트를 제공하는 컴포넌트입니다.
 * MenuItem, MenuSeparator, MenuLabel과 함께 사용합니다.
 * 
 * Component that provides menu lists.
 * Used with MenuItem, MenuSeparator, and MenuLabel.
 * 
 * @component
 * @example
 * // 기본 수직 메뉴 / Basic vertical menu
 * <Menu>
 *   <MenuItem icon={<Icon name="home" />}>홈</MenuItem>
 *   <MenuItem icon={<Icon name="settings" />}>설정</MenuItem>
 *   <MenuSeparator />
 *   <MenuItem>로그아웃</MenuItem>
 * </Menu>
 * 
 * @example
 * // 수평 메뉴 / Horizontal menu
 * <Menu variant="horizontal">
 *   <MenuItem>메뉴 1</MenuItem>
 *   <MenuItem>메뉴 2</MenuItem>
 * </Menu>
 * 
 * @param {MenuProps} props - Menu 컴포넌트의 props / Menu component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Menu 컴포넌트 / Menu component
 */
const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ 
    className, 
    children,
    variant = "default",
    size = "md",
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "horizontal":
          return "flex items-center space-x-1" // 4px 간격
        case "vertical":
          return "flex flex-col space-y-1" // 4px 간격
        case "compact":
          return "flex flex-col space-y-0.5" // 2px 간격
        default:
          return "flex flex-col space-y-1" // 4px 간격
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "text-sm"
        case "lg":
          return "text-base"
        default:
          return "text-sm"
      }
    }

    return (
      <div
        ref={ref}
        className={merge(
          getVariantClasses(),
          getSizeClasses(),
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              variant,
              size
            } as Partial<MenuItemProps | MenuSeparatorProps | MenuLabelProps>)
          }
          return child
        })}
      </div>
    )
  }
)
Menu.displayName = "Menu"

/**
 * MenuItem 컴포넌트의 props / MenuItem component props
 * @typedef {Object} MenuItemProps
 * @property {React.ReactNode} [icon] - 메뉴 아이템 아이콘 / Menu item icon
 * @property {"default" | "horizontal" | "vertical" | "compact"} [variant] - 메뉴 변형 (Menu에서 자동 전달) / Menu variant (auto-passed from Menu)
 * @property {"sm" | "md" | "lg"} [size] - 메뉴 크기 (Menu에서 자동 전달) / Menu size (auto-passed from Menu)
 * @property {boolean} [active=false] - 활성화 상태 / Active state
 * @property {boolean} [disabled=false] - 비활성화 상태 / Disabled state
 * @extends {React.ButtonHTMLAttributes<HTMLButtonElement>}
 */
export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  variant?: "default" | "horizontal" | "vertical" | "compact"
  size?: "sm" | "md" | "lg"
  active?: boolean
  disabled?: boolean
}

/**
 * MenuItem 컴포넌트 / MenuItem component
 * 메뉴의 개별 아이템을 표시합니다.
 * Displays an individual menu item.
 * 
 * @component
 * @param {MenuItemProps} props - MenuItem 컴포넌트의 props / MenuItem component props
 * @param {React.Ref<HTMLButtonElement>} ref - button 요소 ref / button element ref
 * @returns {JSX.Element} MenuItem 컴포넌트 / MenuItem component
 */
const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ 
    className, 
    icon,
    variant = "default",
    size = "md",
    active = false,
    disabled = false,
    children,
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "horizontal":
          return merge(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors", // 12px, 8px 패딩
            active 
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          )
        case "vertical":
          return merge(
            "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors", // 16px, 12px 패딩
            active 
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          )
        case "compact":
          return merge(
            "flex items-center gap-2 px-2 py-1.5 rounded text-sm font-medium transition-colors", // 8px, 6px 패딩
            active 
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          )
        default:
          return merge(
            "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors", // 16px, 12px 패딩
            active 
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          )
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "text-xs"
        case "lg":
          return "text-base"
        default:
          return "text-sm"
      }
    }

    return (
      <button
        ref={ref}
        className={merge(
          getVariantClasses(),
          getSizeClasses(),
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled}
        {...props}
      >
        {icon && (
          <div className="flex-shrink-0 w-4 h-4">
            {icon}
          </div>
        )}
        <span className="flex-1 text-left">{children}</span>
      </button>
    )
  }
)
MenuItem.displayName = "MenuItem"

/**
 * MenuSeparator 컴포넌트의 props / MenuSeparator component props
 * @typedef {Object} MenuSeparatorProps
 * @property {"default" | "horizontal" | "vertical" | "compact"} [variant] - 메뉴 변형 (Menu에서 자동 전달) / Menu variant (auto-passed from Menu)
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface MenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "horizontal" | "vertical" | "compact"
}

/**
 * MenuSeparator 컴포넌트 / MenuSeparator component
 * 메뉴 아이템들을 구분하는 구분선을 표시합니다.
 * Displays a separator line between menu items.
 * 
 * @component
 * @param {MenuSeparatorProps} props - MenuSeparator 컴포넌트의 props / MenuSeparator component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} MenuSeparator 컴포넌트 / MenuSeparator component
 */
const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "horizontal":
          return "w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" // 4px 여백
        case "vertical":
        case "compact":
        default:
          return "h-px bg-gray-200 dark:bg-gray-700 my-2" // 8px 여백
      }
    }

    return (
      <div
        ref={ref}
        className={merge(getVariantClasses(), className)}
        {...props}
      />
    )
  }
)
MenuSeparator.displayName = "MenuSeparator"

/**
 * MenuLabel 컴포넌트의 props / MenuLabel component props
 * @typedef {Object} MenuLabelProps
 * @property {"default" | "horizontal" | "vertical" | "compact"} [variant] - 메뉴 변형 (Menu에서 자동 전달) / Menu variant (auto-passed from Menu)
 * @property {"sm" | "md" | "lg"} [size] - 메뉴 크기 (Menu에서 자동 전달) / Menu size (auto-passed from Menu)
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface MenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "horizontal" | "vertical" | "compact"
  size?: "sm" | "md" | "lg"
}

/**
 * MenuLabel 컴포넌트 / MenuLabel component
 * 메뉴 섹션의 레이블을 표시합니다.
 * Displays a label for a menu section.
 * 
 * @component
 * @param {MenuLabelProps} props - MenuLabel 컴포넌트의 props / MenuLabel component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} MenuLabel 컴포넌트 / MenuLabel component
 */
const MenuLabel = React.forwardRef<HTMLDivElement, MenuLabelProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "horizontal":
          return "px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide" // 12px, 4px 패딩
        case "vertical":
        case "compact":
        default:
          return "px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide" // 16px, 8px 패딩
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "text-xs"
        case "lg":
          return "text-sm"
        default:
          return "text-xs"
      }
    }

    return (
      <div
        ref={ref}
        className={merge(
          getVariantClasses(),
          getSizeClasses(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MenuLabel.displayName = "MenuLabel"

// 편의 컴포넌트들
export const MenuHorizontal = React.forwardRef<HTMLDivElement, Omit<MenuProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Menu ref={ref} variant="horizontal" className={className} {...props} />
  )
)
MenuHorizontal.displayName = "MenuHorizontal"

export const MenuVertical = React.forwardRef<HTMLDivElement, Omit<MenuProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Menu ref={ref} variant="vertical" className={className} {...props} />
  )
)
MenuVertical.displayName = "MenuVertical"

export const MenuCompact = React.forwardRef<HTMLDivElement, Omit<MenuProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Menu ref={ref} variant="compact" className={className} {...props} />
  )
)
MenuCompact.displayName = "MenuCompact"

export { Menu, MenuItem, MenuSeparator, MenuLabel } 