"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  maxItems?: number
  showHomeIcon?: boolean
  homeLabel?: string
  homeHref?: string
}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ 
    items, 
    separator = <Icon name="chevron-right" size={16} className="text-gray-400" />,
    className,
    maxItems,
    showHomeIcon = true,
    homeLabel = "홈",
    homeHref = "/",
    ...props 
  }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(false)
    
    // 홈 아이템 추가
    const allItems = [
      {
        label: homeLabel,
        href: homeHref,
        icon: showHomeIcon ? "home" : undefined
      },
      ...items
    ]

    // 최대 아이템 수 제한
    const displayItems = maxItems && allItems.length > maxItems && !isExpanded
      ? [
          ...allItems.slice(0, 1),
          { label: "...", href: undefined },
          ...allItems.slice(-maxItems + 2)
        ]
      : allItems

    const renderItem = (item: BreadcrumbItem, index: number) => {
      const isLast = index === displayItems.length - 1
      const isClickable = item.href || item.onClick

      const itemContent = (
        <div className="flex items-center gap-2">
          {item.icon && <Icon name={item.icon as any} size={16} />}
          <span className="truncate">{item.label}</span>
        </div>
      )

      if (isLast) {
        return (
          <span
            key={index}
            className="text-gray-900 dark:text-gray-100 font-medium truncate"
          >
            {itemContent}
          </span>
        )
      }

      if (isClickable) {
        return (
          <a
            key={index}
            href={item.href}
            onClick={item.onClick}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors truncate hover:underline"
          >
            {itemContent}
          </a>
        )
      }

      return (
        <span
          key={index}
          className="text-gray-500 dark:text-gray-500 truncate cursor-default"
        >
          {itemContent}
        </span>
      )
    }

    return (
      <nav
        ref={ref}
        className={cn("flex items-center gap-2 text-sm", className)}
        aria-label="Breadcrumb"
        {...props}
      >
        {displayItems.map((item, index) => (
          <React.Fragment key={index}>
            {renderItem(item, index)}
            {index < displayItems.length - 1 && (
              <span className="flex-shrink-0" aria-hidden="true">
                {separator}
              </span>
            )}
          </React.Fragment>
        ))}
        
        {maxItems && allItems.length > maxItems && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline text-xs"
          >
            {isExpanded ? "접기" : "펼치기"}
          </button>
        )}
      </nav>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

interface BreadcrumbItemProps {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
  isActive?: boolean
}

const BreadcrumbItem = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, BreadcrumbItemProps>(
  ({ children, className, href, onClick, isActive = false, ...props }, ref) => {
    const Component = href ? "a" : "button"
    
    return (
      <Component
        ref={ref as any}
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 text-sm transition-colors",
          isActive
            ? "text-gray-900 dark:text-gray-100 font-medium"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

export { Breadcrumb, BreadcrumbItem } 