"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Button } from "./Button"

export interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  subtitle?: string
  description: string
  primaryAction?: {
    label: string
    href: string
    icon?: string
  }
  secondaryAction?: {
    label: string
    href: string
    icon?: string
  }
  variant?: "default" | "gradient" | "glass" | "neon"
  background?: "none" | "gradient" | "particles" | "video"
  customBackground?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  ({ 
    className, 
    title, 
    subtitle, 
    description, 
    primaryAction, 
    secondaryAction,
    variant = "default",
    background = "gradient",
    customBackground,
    size = "lg",
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: "py-16",
      md: "py-20", 
      lg: "py-24",
      xl: "py-32"
    }

    const titleSizeClasses = {
      sm: "text-3xl md:text-4xl",
      md: "text-4xl md:text-5xl",
      lg: "text-5xl md:text-6xl",
      xl: "text-6xl md:text-7xl"
    }

    const subtitleSizeClasses = {
      sm: "text-lg md:text-xl",
      md: "text-xl md:text-2xl", 
      lg: "text-2xl md:text-3xl",
      xl: "text-3xl md:text-4xl"
    }

    const descriptionSizeClasses = {
      sm: "text-base md:text-lg",
      md: "text-lg md:text-xl",
      lg: "text-lg md:text-2xl",
      xl: "text-xl md:text-3xl"
    }

    const backgroundClasses = {
      none: "",
      gradient: "relative overflow-hidden",
      particles: "relative overflow-hidden",
      video: "relative overflow-hidden"
    }

    const backgroundContent = {
      none: null,
      gradient: (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 opacity-60 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-400 via-pink-500 to-red-600 opacity-40 rounded-full blur-2xl animate-pulse" />
        </div>
      ),
      particles: (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900" />
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      ),
      video: (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          >
            <source src={customBackground} type="video/mp4" />
          </video>
        </div>
      )
    }

    return (
      <section
        ref={ref}
        className={merge(
          "flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8",
          sizeClasses[size],
          backgroundClasses[background],
          className
        )}
        {...props}
      >
        {backgroundContent[background]}
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className={merge(
            "font-extrabold mb-6 text-gray-900 dark:text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_4px_24px_rgba(0,0,0,0.25)]",
            titleSizeClasses[size]
          )}>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-cyan-300 dark:via-blue-400 dark:to-purple-400 drop-shadow-[0_2px_8px_rgba(39,94,254,0.3)]">
              {title}
            </span>
            {subtitle && (
              <span className={merge(
                "block font-semibold mt-4 text-gray-700 dark:text-white/90",
                subtitleSizeClasses[size]
              )}>
                {subtitle}
              </span>
            )}
          </h1>
          
          <p className={merge(
            "text-gray-600 dark:text-white/80 mb-10 max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
            descriptionSizeClasses[size]
          )}>
            {description}
          </p>
          
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {primaryAction && (
                <Button
                  href={primaryAction.href}
                  variant="gradient"
                  size={size === "xl" ? "lg" : "md"}
                  className="inline-flex items-center"
                >
                  {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
                  {primaryAction.label}
                </Button>
              )}
              
              {secondaryAction && (
                <Button
                  href={secondaryAction.href}
                  variant="outline"
                  size={size === "xl" ? "lg" : "md"}
                  className="inline-flex items-center"
                >
                  {secondaryAction.icon && <span className="mr-2">{secondaryAction.icon}</span>}
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    )
  }
)

HeroSection.displayName = "HeroSection"

export { HeroSection } 