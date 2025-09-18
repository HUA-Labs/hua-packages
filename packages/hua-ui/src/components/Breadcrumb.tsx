"use client"

import React from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  separator?: React.ReactNode
  variant?: 'default' | 'subtle' | 'transparent' | 'glass'
}

export interface BreadcrumbItemProps {
  href?: string
  isCurrent?: boolean
  children: React.ReactNode
  className?: string
}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, children, separator = <Icon name="chevronRight" className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: "inline-flex items-center text-sm w-fit",
      subtle: "inline-flex items-center text-xs bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-md px-3 py-2 border border-slate-200/30 dark:border-white/20 w-fit shadow-sm",
      transparent: "inline-flex items-center text-xs w-fit",
      glass: "inline-flex items-center text-xs bg-white/30 dark:bg-slate-800/30 backdrop-blur-lg rounded-lg px-4 py-2 border border-slate-200/25 dark:border-white/15 w-fit shadow-lg"
    }
    
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn(variantStyles[variant], className)}
        {...props}
      >
        <ol className="inline-flex items-center">
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return (
                <li key={index} className="flex items-center">
                  {child}
                  {index < React.Children.count(children) - 1 && (
                    <span className="mx-3 text-slate-400 dark:text-slate-500 flex items-center justify-center" aria-hidden="true">
                      {separator}
                    </span>
                  )}
                </li>
              )
            }
            return child
          })}
        </ol>
      </nav>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, href, isCurrent = false, children, ...props }, ref) => {
    if (isCurrent) {
      return (
        <span
          ref={ref}
          aria-current="page"
          className={cn(
            "text-slate-500 dark:text-slate-400 font-medium",
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
          className={cn(
            "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors",
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
        className={cn(
          "text-slate-400 dark:text-slate-500",
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