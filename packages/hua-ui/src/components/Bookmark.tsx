"use client"

import React, { useState, useEffect } from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"

export interface BookmarkProps extends React.HTMLAttributes<HTMLButtonElement> {
  id: string
  storageKey?: string
  defaultBookmarked?: boolean
  onBookmarkChange?: (bookmarked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outline'
}

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
        className={cn(
          "flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <Icon 
          name="star" 
          className={cn(
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