"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"
import type { IconName } from "../lib/icons"

/**
 * Breadcrumb 항목 타입 / Breadcrumb item type
 */
export interface BreadcrumbItemData {
  label: string
  href?: string
  icon?: IconName
}

/**
 * Breadcrumb 컴포넌트의 props / Breadcrumb component props
 * @typedef {Object} BreadcrumbProps
 * @property {React.ReactNode} [children] - BreadcrumbItem 컴포넌트들 / BreadcrumbItem components
 * @property {BreadcrumbItemData[]} [items] - Breadcrumb 항목 배열 (children 대신 사용 가능) / Breadcrumb items array (alternative to children)
 * @property {number} [maxItems] - 최대 표시할 항목 수 (긴 경로 처리) / Maximum number of items to display (for long paths)
 * @property {boolean} [showHomeIcon] - 홈 아이콘 표시 여부 / Show home icon
 * @property {string} [homeLabel] - 홈 라벨 (기본: "Home") / Home label (default: "Home")
 * @property {React.ReactNode} [separator] - 항목 사이 구분자 (기본: chevronRight 아이콘) / Separator between items (default: chevronRight icon)
 * @property {'default' | 'subtle' | 'transparent' | 'glass'} [variant='default'] - Breadcrumb 스타일 변형 / Breadcrumb style variant
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  items?: BreadcrumbItemData[]
  maxItems?: number
  showHomeIcon?: boolean
  homeLabel?: string
  separator?: React.ReactNode
  variant?: 'default' | 'subtle' | 'transparent' | 'glass'
}

/**
 * BreadcrumbItem 컴포넌트의 props / BreadcrumbItem component props
 * @typedef {Object} BreadcrumbItemProps
 * @property {string} [href] - 링크 URL (없으면 일반 텍스트) / Link URL (plain text if not provided)
 * @property {boolean} [isCurrent=false] - 현재 페이지 여부 / Current page indicator
 * @property {React.ReactNode} children - 항목 텍스트 / Item text
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 */
export interface BreadcrumbItemProps {
  href?: string
  isCurrent?: boolean
  children: React.ReactNode
  className?: string
}

/**
 * Breadcrumb 컴포넌트 / Breadcrumb component
 * 
 * 네비게이션 경로를 표시하는 breadcrumb 컴포넌트입니다.
 * 현재 위치와 경로를 시각적으로 표현합니다.
 * 
 * Breadcrumb component for displaying navigation paths.
 * Visually represents current location and path.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Breadcrumb>
 *   <BreadcrumbItem href="/">홈</BreadcrumbItem>
 *   <BreadcrumbItem href="/products">상품</BreadcrumbItem>
 *   <BreadcrumbItem isCurrent>상세</BreadcrumbItem>
 * </Breadcrumb>
 * 
 * @example
 * // 커스텀 구분자 / Custom separator
 * <Breadcrumb separator={<span>/</span>}>
 *   <BreadcrumbItem href="/">홈</BreadcrumbItem>
 *   <BreadcrumbItem isCurrent>현재</BreadcrumbItem>
 * </Breadcrumb>
 * 
 * @param {BreadcrumbProps} props - Breadcrumb 컴포넌트의 props / Breadcrumb component props
 * @param {React.Ref<HTMLDivElement>} ref - nav 요소 ref / nav element ref
 * @returns {JSX.Element} Breadcrumb 컴포넌트 / Breadcrumb component
 */
const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ 
    className, 
    children, 
    items,
    maxItems,
    showHomeIcon,
    homeLabel = "Home",
    separator = <Icon name="chevronRight" className="w-3 h-3 text-muted-foreground flex-shrink-0" />, 
    variant = 'default', 
    ...props 
  }, ref) => {
    const variantStyles = {
      default: "inline-flex items-center text-sm w-fit",
      subtle: "inline-flex items-center text-xs bg-background/40 backdrop-blur-md rounded-md px-3 py-2 border border-border/30 w-fit shadow-sm",
      transparent: "inline-flex items-center text-xs w-fit",
      glass: "inline-flex items-center text-xs bg-background/30 backdrop-blur-lg rounded-lg px-4 py-2 border border-border/25 w-fit shadow-lg"
    }
    
    // items prop이 있으면 BreadcrumbItem으로 변환
    const renderItems = () => {
      if (items) {
        let displayItems = [...items]
        
        // maxItems 처리
        if (maxItems && displayItems.length > maxItems) {
          const firstItem = displayItems[0]
          const lastItems = displayItems.slice(-(maxItems - 1))
          displayItems = [firstItem, { label: '...', href: undefined }, ...lastItems]
        }
        
        // 마지막 항목은 isCurrent로 표시
        return displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const isCurrent = isLast && !item.href
          
          return (
            <BreadcrumbItem
              key={index}
              href={item.href}
              isCurrent={isCurrent}
            >
              {item.icon && (
                <Icon name={item.icon} className="w-4 h-4 mr-1" />
              )}
              {item.label}
            </BreadcrumbItem>
          )
        })
      }
      
      // children이 있으면 그대로 사용
      if (children) {
        return React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return (
              <li key={index} className="flex items-center">
                {child}
                {index < React.Children.count(children) - 1 && (
                  <span className="mx-3 text-muted-foreground flex items-center justify-center" aria-hidden="true">
                    {separator}
                  </span>
                )}
              </li>
            )
          }
          return child
        })
      }
      
      return null
    }
    
    const renderedItems = renderItems()
    const itemsCount = items ? items.length : (children ? React.Children.count(children) : 0)
    
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={merge(variantStyles[variant], className)}
        {...props}
      >
        <ol className="inline-flex items-center">
          {showHomeIcon && (
            <li className="flex items-center">
              <BreadcrumbItem href="/">
                <Icon name="home" className="w-4 h-4 mr-1" />
                {homeLabel}
              </BreadcrumbItem>
              {itemsCount > 0 && (
                <span className="mx-3 text-muted-foreground flex items-center justify-center" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          )}
          {items ? (
            renderedItems?.map((item, index) => (
              <li key={index} className="flex items-center">
                {item}
                {index < (renderedItems?.length || 0) - 1 && (
                  <span className="mx-3 text-muted-foreground flex items-center justify-center" aria-hidden="true">
                    {separator}
                  </span>
                )}
              </li>
            ))
          ) : (
            renderedItems
          )}
        </ol>
      </nav>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

/**
 * BreadcrumbItem 컴포넌트
 * Breadcrumb의 개별 항목을 표시합니다.
 * 
 * @component
 * @param {BreadcrumbItemProps} props - BreadcrumbItem 컴포넌트의 props
 * @param {React.Ref<HTMLLIElement>} ref - li 요소 ref
 * @returns {JSX.Element} BreadcrumbItem 컴포넌트
 */
const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, href, isCurrent = false, children, ...props }, ref) => {
    if (isCurrent) {
      return (
        <span
          ref={ref}
          aria-current="page"
          className={merge(
            "text-muted-foreground font-medium",
            className
          )}
          {...props}
        >
          {children}
        </span>
      )
    }

    if (href) {
      return (
        <a
          href={href}
          className={merge(
            "text-muted-foreground hover:text-foreground transition-colors",
            className
          )}
          {...props}
        >
          {children}
        </a>
      )
    }

    return (
      <span
        ref={ref}
        className={merge(
          "text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

export { Breadcrumb, BreadcrumbItem } 