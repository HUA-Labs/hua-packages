"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Pagination 컴포넌트의 props / Pagination component props
 * @typedef {Object} PaginationProps
 * @property {number} currentPage - 현재 페이지 번호 / Current page number
 * @property {number} totalPages - 전체 페이지 수 / Total number of pages
 * @property {(page: number) => void} onPageChange - 페이지 변경 콜백 / Page change callback
 * @property {boolean} [showFirstLast=true] - 첫/마지막 페이지 버튼 표시 여부 / Show first/last page buttons
 * @property {boolean} [showPrevNext=true] - 이전/다음 페이지 버튼 표시 여부 / Show previous/next page buttons
 * @property {number} [maxVisiblePages=5] - 최대 표시 페이지 수 / Maximum visible page numbers
 * @property {"sm" | "md" | "lg"} [size="md"] - Pagination 크기 / Pagination size
 * @property {"default" | "outlined" | "minimal"} [variant="default"] - Pagination 스타일 변형 / Pagination style variant
 * @property {"square" | "circle"} [shape="square"] - 버튼 모양 / Button shape
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outlined" | "minimal"
  shape?: "square" | "circle"
}

/**
 * Pagination 컴포넌트 / Pagination component
 * 
 * 페이지네이션 컨트롤을 제공하는 컴포넌트입니다.
 * 첫/마지막 페이지, 이전/다음 페이지 버튼을 지원하며,
 * 많은 페이지가 있을 경우 자동으로 생략 표시(...)를 합니다.
 * 
 * Component that provides pagination controls.
 * Supports first/last page and previous/next page buttons,
 * and automatically shows ellipsis (...) when there are many pages.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * const [page, setPage] = useState(1)
 * 
 * <Pagination
 *   currentPage={page}
 *   totalPages={10}
 *   onPageChange={setPage}
 * />
 * 
 * @example
 * // Outlined 스타일, 원형 버튼 / Outlined style, circular buttons
 * <Pagination
 *   currentPage={page}
 *   totalPages={20}
 *   onPageChange={setPage}
 *   variant="outlined"
 *   shape="circle"
 * />
 * 
 * @param {PaginationProps} props - Pagination 컴포넌트의 props / Pagination component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Pagination 컴포넌트 / Pagination component
 */
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
    shape = "square",
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

    const getShapeClasses = () => {
      switch (shape) {
        case "circle":
          return "rounded-full aspect-square flex items-center justify-center"
        default:
          return "rounded-md"
      }
    }

    const getVariantClasses = (isActive: boolean = false) => {
      switch (variant) {
        case "outlined":
          return merge(
            "border border-gray-300 dark:border-gray-600",
            isActive 
              ? "bg-blue-500 border-blue-500 text-white" 
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          )
        case "minimal":
          return merge(
            "border-0",
            isActive 
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
              : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          )
        default:
          return merge(
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
        className={merge(
          "flex items-center justify-center gap-1",
          className
        )}
        {...props}
      >
        {/* 첫 페이지 버튼 */}
        {showFirstLast && currentPage > 1 && (
          <button
            onClick={() => handlePageClick(1)}
            className={merge(
              "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              getSizeClasses(),
              getShapeClasses(),
              getVariantClasses()
            )}
            aria-label="첫 페이지로 이동"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* 이전 페이지 버튼 */}
        {showPrevNext && currentPage > 1 && (
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            className={merge(
              "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              getSizeClasses(),
              getShapeClasses(),
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
              <span className={merge(
                "inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400",
                getSizeClasses()
              )}>
                ...
              </span>
            ) : (
              <button
                onClick={() => handlePageClick(page as number)}
                className={merge(
                  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  getSizeClasses(),
                  getShapeClasses(),
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
            className={merge(
              "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              getSizeClasses(),
              getShapeClasses(),
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
            className={merge(
              "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              getSizeClasses(),
              getShapeClasses(),
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
      <div className={merge("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
        {showInfo && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {totalItems > 0 ? (
              <>
                <span className="font-medium">{startItem}</span>
                {" - "}
                <span className="font-medium">{endItem}</span>
                {" of "}
                <span className="font-medium">{totalItems}</span>
                {" results"}
              </>
            ) : (
              "No results"
            )}
          </div>
        )}
        <Pagination ref={ref} {...props} />
      </div>
    )
  }
)
PaginationWithInfo.displayName = "PaginationWithInfo"

export { Pagination } 