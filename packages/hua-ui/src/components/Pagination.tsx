"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outlined" | "minimal"
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ 
    className, 
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = true,
    showPrevNext = true,
    maxVisiblePages = 5,
    size = "md",
    variant = "default",
    ...props 
  }, ref) => {
    const getVisiblePages = () => {
      const pages: (number | string)[] = []
      const halfVisible = Math.floor(maxVisiblePages / 2)
      
      let start = Math.max(1, currentPage - halfVisible)
      let end = Math.min(totalPages, currentPage + halfVisible)
      
      // 조정
      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxVisiblePages - 1)
        } else {
          start = Math.max(1, end - maxVisiblePages + 1)
        }
      }
      
      // 첫 페이지
      if (start > 1) {
        pages.push(1)
        if (start > 2) {
          pages.push("...")
        }
      }
      
      // 중간 페이지들
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      // 마지막 페이지
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push("...")
        }
        pages.push(totalPages)
      }
      
      return pages
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-8 px-2 text-sm" // 32px 높이, 8px 패딩
        case "lg":
          return "h-12 px-4 text-base" // 48px 높이, 16px 패딩
        default:
          return "h-10 px-3 text-sm" // 40px 높이, 12px 패딩
      }
    }

    const getVariantClasses = (isActive: boolean = false) => {
      switch (variant) {
        case "outlined":
          return cn(
            "border border-gray-300 dark:border-gray-600",
            isActive 
              ? "bg-blue-500 border-blue-500 text-white" 
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          )
        case "minimal":
          return cn(
            "border-0",
            isActive 
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
              : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          )
        default:
          return cn(
            "border-0",
            isActive 
              ? "bg-blue-500 text-white" 
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          )
      }
    }

    const handlePageClick = (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page)
      }
    }

    const visiblePages = getVisiblePages()

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center space-x-1", className)} // 4px 간격
        {...props}
      >
        {/* 첫 페이지 버튼 */}
        {showFirstLast && currentPage > 1 && (
          <button
            onClick={() => handlePageClick(1)}
            className={cn(
              "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              getSizeClasses(),
              getVariantClasses()
            )}
            aria-label="첫 페이지로 이동"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* 이전 페이지 버튼 */}
        {showPrevNext && currentPage > 1 && (
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            className={cn(
              "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              getSizeClasses(),
              getVariantClasses()
            )}
            aria-label="이전 페이지로 이동"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* 페이지 번호들 */}
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className={cn(
                "inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400",
                getSizeClasses()
              )}>
                ...
              </span>
            ) : (
              <button
                onClick={() => handlePageClick(page as number)}
                className={cn(
                  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  getSizeClasses(),
                  getVariantClasses(page === currentPage)
                )}
                aria-label={`${page}페이지로 이동`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* 다음 페이지 버튼 */}
        {showPrevNext && currentPage < totalPages && (
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            className={cn(
              "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              getSizeClasses(),
              getVariantClasses()
            )}
            aria-label="다음 페이지로 이동"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* 마지막 페이지 버튼 */}
        {showFirstLast && currentPage < totalPages && (
          <button
            onClick={() => handlePageClick(totalPages)}
            className={cn(
              "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              getSizeClasses(),
              getVariantClasses()
            )}
            aria-label="마지막 페이지로 이동"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
Pagination.displayName = "Pagination"

// 편의 컴포넌트들
export const PaginationOutlined = React.forwardRef<HTMLDivElement, Omit<PaginationProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Pagination ref={ref} variant="outlined" className={className} {...props} />
  )
)
PaginationOutlined.displayName = "PaginationOutlined"

export const PaginationMinimal = React.forwardRef<HTMLDivElement, Omit<PaginationProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Pagination ref={ref} variant="minimal" className={className} {...props} />
  )
)
PaginationMinimal.displayName = "PaginationMinimal"

// 복합 컴포넌트들
export const PaginationWithInfo = React.forwardRef<HTMLDivElement, PaginationProps & { 
  totalItems?: number
  itemsPerPage?: number
  showInfo?: boolean
}>(
  ({ 
    totalItems = 0, 
    itemsPerPage = 10, 
    showInfo = true, 
    className, 
    ...props 
  }, ref) => {
    const startItem = (props.currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(props.currentPage * itemsPerPage, totalItems)

    return (
      <div ref={ref} className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
        {showInfo && totalItems > 0 && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {startItem}-{endItem} / {totalItems}개 항목
          </div>
        )}
        <Pagination {...props} />
      </div>
    )
  }
)
PaginationWithInfo.displayName = "PaginationWithInfo"

export { Pagination } 