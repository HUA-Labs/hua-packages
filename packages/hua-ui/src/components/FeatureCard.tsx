"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"
import type { IconName } from "../lib/icons"

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: IconName | string
  title: string
  description: string
  variant?: "default" | "gradient" | "glass" | "neon"
  size?: "sm" | "md" | "lg"
  hover?: "scale" | "glow" | "slide" | "none"
  gradient?: "blue" | "purple" | "green" | "orange" | "pink" | "custom"
  customGradient?: string
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ 
    className, 
    icon, 
    title, 
    description, 
    variant = "default", 
    size = "md",
    hover = "scale",
    gradient = "blue",
    customGradient,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8"
    }

    const variantClasses = {
      default: "bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50",
      gradient: `bg-gradient-to-br ${customGradient || getGradientClass(gradient)}`,
      glass: "bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20",
      neon: "bg-gray-900/90 dark:bg-gray-900/90 border border-cyan-400/30 dark:border-cyan-400/30 shadow-lg shadow-cyan-400/20"
    }

    const hoverClasses = {
      scale: "hover:scale-105 transition-transform duration-300",
      glow: "hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-cyan-400/25 transition-shadow duration-300",
      slide: "hover:-translate-y-2 transition-transform duration-300",
      none: ""
    }

    const iconSize = size === "lg" ? "text-5xl" : size === "md" ? "text-4xl" : "text-3xl"

    return (
      <div
        ref={ref}
        className={merge(
          "rounded-2xl shadow-lg transition-all duration-300 flex flex-col items-center text-center",
          sizeClasses[size],
          variantClasses[variant],
          hoverClasses[hover],
          className
        )}
        {...props}
      >
        {icon && (
          <div className={`mb-4 ${iconSize} ${variant === "neon" ? "text-cyan-400" : ""}`}>
            {typeof icon === "string" && icon.startsWith("http") ? (
              <img src={icon} alt={title} className="w-full h-full object-contain" />
            ) : typeof icon === "string" ? (
              <span>{icon}</span>
            ) : (
              <Icon name={icon} className="w-full h-full" />
            )}
          </div>
        )}
        
        <h3 className={merge(
          "font-bold mb-2",
          size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-lg",
          variant === "gradient" ? "text-white" : "text-gray-900 dark:text-white"
        )}>
          {title}
        </h3>
        
        <p className={merge(
          size === "lg" ? "text-base" : "text-sm",
          variant === "gradient" ? "text-white/90" : "text-gray-600 dark:text-gray-300"
        )}>
          {description}
        </p>
      </div>
    )
  }
)

FeatureCard.displayName = "FeatureCard"

function getGradientClass(gradient: string): string {
  const gradients = {
    blue: "from-blue-500 via-cyan-500 to-blue-600",
    purple: "from-purple-500 via-pink-500 to-purple-600",
    green: "from-green-500 via-emerald-500 to-green-600",
    orange: "from-orange-500 via-red-500 to-orange-600",
    pink: "from-pink-500 via-rose-500 to-pink-600"
  }
  return gradients[gradient as keyof typeof gradients] || gradients.blue
}

export { FeatureCard } 