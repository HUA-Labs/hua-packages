"use client"

import React, { useState, useEffect } from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"
import { IconName } from "../lib/icons"

export interface ScrollToTopProps extends React.HTMLAttributes<HTMLButtonElement> {
  threshold?: number
  smooth?: boolean
  className?: string
  icon?: IconName
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost"
}

const ScrollToTop = React.forwardRef<HTMLButtonElement, ScrollToTopProps>(
  ({ 
    className, 
    threshold = 400, 
    smooth = true, 
    icon = "arrowUp",
    size = "md",
    variant = "default",
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
      const toggleVisibility = () => {
        if (window.pageYOffset > threshold) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      }

      window.addEventListener("scroll", toggleVisibility)
      return () => window.removeEventListener("scroll", toggleVisibility)
    }, [threshold])

    const scrollToTop = () => {
      if (smooth) {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        })
      } else {
        window.scrollTo(0, 0)
      }
    }

    const sizeClasses = {
      sm: "w-10 h-10",
      md: "w-12 h-12", 
      lg: "w-14 h-14"
    }

    const variantClasses = {
      default: "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:shadow-lg hover:shadow-black/20 dark:bg-slate-800/20 dark:border-slate-700/50 dark:text-slate-100 dark:hover:bg-slate-700/30",
      primary: "bg-blue-600/90 backdrop-blur-sm border border-blue-500/30 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25 dark:bg-blue-500/90 dark:border-blue-400/30 dark:hover:bg-blue-500",
      secondary: "bg-slate-100/80 backdrop-blur-sm border border-slate-200/50 text-slate-700 hover:bg-slate-200/80 hover:shadow-lg dark:bg-slate-700/20 dark:border-slate-600/50 dark:text-slate-200 dark:hover:bg-slate-600/30",
      outline: "border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:shadow-lg dark:border-slate-600/50 dark:bg-slate-800/10 dark:text-slate-200 dark:hover:bg-slate-700/20",
      ghost: "bg-transparent hover:bg-white/10 backdrop-blur-sm text-white hover:shadow-lg dark:text-slate-200 dark:hover:bg-slate-700/20"
    }

    if (!isVisible) return null

    return (
      <button
        ref={ref}
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-8 right-8 z-50 rounded-full transition-all duration-300 ease-in-out",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          "transform hover:scale-110 active:scale-95 shadow-lg",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <Icon name={icon} className="w-5 h-5" />
      </button>
    )
  }
)

ScrollToTop.displayName = "ScrollToTop"

export { ScrollToTop } 