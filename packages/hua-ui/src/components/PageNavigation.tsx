"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"

/**
 * PageNavigation 컴포넌트의 props / PageNavigation component props
 * @typedef {Object} PageNavigationProps
 * @property {Object} [prevPage] - 이전 페이지 정보 / Previous page information
 * @property {string} prevPage.title - 이전 페이지 제목 / Previous page title
 * @property {string} prevPage.href - 이전 페이지 링크 / Previous page link
 * @property {Object} [nextPage] - 다음 페이지 정보 / Next page information
 * @property {string} nextPage.title - 다음 페이지 제목 / Next page title
 * @property {string} nextPage.href - 다음 페이지 링크 / Next page link
 * @property {boolean} [showOnMobile=false] - 모바일에서 표시 여부 / Show on mobile
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
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

/**
 * PageNavigation 컴포넌트 / PageNavigation component
 * 
 * 이전/다음 페이지로 이동하는 네비게이션 컴포넌트입니다.
 * 문서 페이지나 가이드 페이지에서 사용하기 적합합니다.
 * 
 * Navigation component for moving to previous/next pages.
 * Suitable for documentation or guide pages.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <PageNavigation
 *   prevPage={{ title: "이전 페이지", href: "/prev" }}
 *   nextPage={{ title: "다음 페이지", href: "/next" }}
 * />
 * 
 * @param {PageNavigationProps} props - PageNavigation 컴포넌트의 props / PageNavigation component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} PageNavigation 컴포넌트 / PageNavigation component
 */
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
        className={merge(
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
              className="group inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
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
              className="group inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
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