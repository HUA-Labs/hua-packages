"use client"

import React from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  separator?: React.ReactNode
}

export interface BreadcrumbItemProps {
  href?: string
  isCurrent?: boolean
  children: React.ReactNode
  className?: string
}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, children, separator = <Icon name="chevronRight" className="w-4 h-4 text-slate-400" />, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("flex items-center space-x-2 text-sm", className)}
        {...props}
      >
        <ol className="flex items-center space-x-2">
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return (
                <li key={index} className="flex items-center">
                  {child}
                  {index < React.Children.count(children) - 1 && (
                    <span className="mx-2 text-slate-400" aria-hidden="true">
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
            "text-slate-600 dark:text-slate-400 font-medium",
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
            "text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors",
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
          "text-slate-500 dark:text-slate-500",
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