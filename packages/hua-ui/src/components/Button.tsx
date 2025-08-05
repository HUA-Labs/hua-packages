"use client"

import * as React from "react"
import { merge } from "../lib/utils"
import { Link } from "./Link"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "neon" | "glass"
  size?: "sm" | "md" | "lg" | "xl" | "icon"
  href?: string
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  gradient?: "blue" | "purple" | "green" | "orange" | "pink" | "custom"
  customGradient?: string
  rounded?: "sm" | "md" | "lg" | "full"
  shadow?: "none" | "sm" | "md" | "lg" | "xl"
  hover?: "scale" | "glow" | "slide" | "none"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "md", 
    href,
    loading = false,
    icon,
    iconPosition = "left",
    gradient = "blue",
    customGradient,
    rounded = "md",
    shadow = "md",
    hover = "scale",
    children,
    disabled,
    ...props 
  }, ref): React.ReactElement => {
    const variantClasses = {
      default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
      destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
      outline: "border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
      link: "bg-transparent text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
      gradient: `bg-gradient-to-r ${customGradient || getGradientClass(gradient)} text-white hover:shadow-lg`,
      neon: "bg-gray-900 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40",
      glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
    }

    const sizeClasses = {
      sm: "h-8 px-3 py-1 text-sm",
      md: "h-10 px-4 py-2 text-base",
      lg: "h-12 px-6 py-3 text-lg",
      xl: "h-14 px-8 py-4 text-xl",
      icon: "h-10 w-10 p-0"
    }

    const roundedClasses = {
      sm: "rounded",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full"
    }

    const shadowClasses = {
      none: "",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl"
    }

    const hoverClasses = {
      scale: "hover:scale-105 transition-transform duration-200",
      glow: "hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-cyan-400/25 transition-shadow duration-300",
      slide: "hover:-translate-y-1 transition-transform duration-200",
      none: ""
    }

    const baseClasses = merge(
      "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variantClasses[variant],
      sizeClasses[size],
      roundedClasses[rounded],
      shadowClasses[shadow],
      hoverClasses[hover],
      className
    )

    const content = (
      <>
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!loading && icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
        {children}
        {!loading && icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
      </>
    )

    if (href) {
      const { onClick, ...linkProps } = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <Link
          href={href}
          className={baseClasses}
          onClick={onClick ? () => onClick({} as React.MouseEvent<HTMLAnchorElement>) : undefined}
          {...linkProps}
        >
          {content}
        </Link>
      )
    }

    return (
      <button
        className={baseClasses}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = "Button"

function getGradientClass(gradient: string): string {
  const gradients = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-red-500",
    pink: "from-pink-500 to-rose-500"
  }
  return gradients[gradient as keyof typeof gradients] || gradients.blue
}

export { Button } 