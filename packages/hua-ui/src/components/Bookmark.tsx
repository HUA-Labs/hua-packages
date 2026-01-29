"use client"

import React, { useState, useEffect } from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"

/**
 * Bookmark 컴포넌트의 props / Bookmark component props
 * @typedef {Object} BookmarkProps
 * @property {string} id - 북마크 고유 ID / Bookmark unique ID
 * @property {string} [storageKey='bookmarks'] - localStorage 키 / localStorage key
 * @property {boolean} [defaultBookmarked=false] - 기본 북마크 상태 / Default bookmarked state
 * @property {(bookmarked: boolean) => void} [onBookmarkChange] - 북마크 상태 변경 콜백 / Bookmark state change callback
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Bookmark 크기 / Bookmark size
 * @property {'default' | 'filled' | 'outline'} [variant='default'] - Bookmark 스타일 변형 / Bookmark style variant
 * @extends {React.HTMLAttributes<HTMLButtonElement>}
 */
export interface BookmarkProps extends React.HTMLAttributes<HTMLButtonElement> {
  id: string
  storageKey?: string
  defaultBookmarked?: boolean
  onBookmarkChange?: (bookmarked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outline'
}

/**
 * Bookmark 컴포넌트 / Bookmark component
 * 
 * 북마크 기능을 제공하는 버튼 컴포넌트입니다.
 * localStorage에 북마크 상태를 저장하며, 여러 항목의 북마크를 관리할 수 있습니다.
 * 
 * Button component that provides bookmark functionality.
 * Saves bookmark state to localStorage and can manage bookmarks for multiple items.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Bookmark id="article-1" />
 * 
 * @example
 * // 상태 변경 감지 / State change detection
 * <Bookmark 
 *   id="article-1"
 *   onBookmarkChange={(bookmarked) => console.log(bookmarked)}
 *   variant="filled"
 * />
 * 
 * @param {BookmarkProps} props - Bookmark 컴포넌트의 props / Bookmark component props
 * @param {React.Ref<HTMLButtonElement>} ref - button 요소 ref / button element ref
 * @returns {JSX.Element} Bookmark 컴포넌트 / Bookmark component
 */
const Bookmark = React.forwardRef<HTMLButtonElement, BookmarkProps>(
  ({ 
    className, 
    id, 
    storageKey = 'bookmarks',
    defaultBookmarked = false,
    onBookmarkChange,
    size = 'md',
    variant = 'default',
    ...props 
  }, ref) => {
    const [isBookmarked, setIsBookmarked] = useState(defaultBookmarked)

    // 로컬 스토리지에서 북마크 상태 불러오기
    useEffect(() => {
      const savedBookmarks = localStorage.getItem(storageKey)
      if (savedBookmarks) {
        const bookmarks = JSON.parse(savedBookmarks)
        setIsBookmarked(bookmarks.includes(id))
      }
    }, [id, storageKey])

    // 북마크 토글
    const toggleBookmark = () => {
      const newBookmarked = !isBookmarked
      setIsBookmarked(newBookmarked)
      
      // 로컬 스토리지 업데이트
      const savedBookmarks = localStorage.getItem(storageKey)
      const bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : []
      
      if (newBookmarked) {
        if (!bookmarks.includes(id)) {
          bookmarks.push(id)
        }
      } else {
        const index = bookmarks.indexOf(id)
        if (index > -1) {
          bookmarks.splice(index, 1)
        }
      }
      
      localStorage.setItem(storageKey, JSON.stringify(bookmarks))
      onBookmarkChange?.(newBookmarked)
    }

    const sizeClasses = {
      sm: "w-6 h-6",
      md: "w-8 h-8", 
      lg: "w-10 h-10"
    }

    const variantClasses = {
      default: "text-slate-400 hover:text-yellow-500 transition-colors",
      filled: "text-yellow-500 hover:text-yellow-600 transition-colors",
      outline: "border border-slate-300 dark:border-slate-600 text-slate-400 hover:text-yellow-500 hover:border-yellow-500 transition-colors rounded"
    }

    return (
      <button
        ref={ref}
        onClick={toggleBookmark}
        className={merge(
          "flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:ring-offset-2",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <Icon 
          name="star" 
          className={merge(
            "transition-all duration-200",
            isBookmarked && "fill-current"
          )}
        />
      </button>
    )
  }
)

Bookmark.displayName = "Bookmark"

export { Bookmark } 