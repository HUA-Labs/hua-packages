"use client"

import React from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"

export interface PageNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  prevPage?: {
    title: string
    href: string
  }
  nextPage?: {
    title: string
    href: string
  }
  showOnMobile?: boolean
}

const PageNavigation = React.forwardRef<HTMLDivElement, PageNavigationProps>(
  ({ 
    className, 
    prevPage, 
    nextPage, 
    showOnMobile = false,
    ...props 
  }, ref) => {
    if (!prevPage && !nextPage) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between py-4",
          !showOnMobile && "hidden md:flex",
          className
        )}
        {...props}
      >
        {/* 이전 페이지 */}
        <div className="flex-1">
          {prevPage && (
            <a
              href={prevPage.href}
              className="group inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
            >
              <Icon 
                name="chevronLeft" 
                className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" 
              />
              <span className="hidden sm:inline">{prevPage.title}</span>
            </a>
          )}
        </div>

        {/* 다음 페이지 */}
        <div className="flex-1 flex justify-end">
          {nextPage && (
            <a
              href={nextPage.href}
              className="group inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
            >
              <span className="hidden sm:inline mr-2">{nextPage.title}</span>
              <Icon 
                name="chevronRight" 
                className="w-4 h-4 transition-transform group-hover:translate-x-1" 
              />
            </a>
          )}
        </div>
      </div>
    )
  }
)
PageNavigation.displayName = "PageNavigation"

export { PageNavigation } 