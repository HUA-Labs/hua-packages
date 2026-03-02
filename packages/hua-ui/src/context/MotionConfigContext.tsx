"use client"

import React, { createContext, useContext } from "react"

/**
 * Component-level motion configuration
 * Matches MotionPreset from @hua-labs/motion-core
 */
export interface ComponentMotionConfig {
  entrance: string
  delay: number
  duration: number
  hover: boolean
  click: boolean
}

/**
 * MotionConfig context value
 */
export interface MotionConfigContextValue {
  enableAnimations: boolean
  components: Record<string, ComponentMotionConfig>
}

const defaultValue: MotionConfigContextValue = {
  enableAnimations: true,
  components: {},
}

const MotionConfigContext = createContext<MotionConfigContextValue>(defaultValue)

/**
 * MotionConfigProvider
 *
 * Provides motion configuration to all descendant components.
 * Used by hua framework to inject preset motion data.
 */
export function MotionConfigProvider({
  value,
  children,
}: {
  value: MotionConfigContextValue
  children: React.ReactNode
}) {
  return (
    <MotionConfigContext.Provider value={value}>
      {children}
    </MotionConfigContext.Provider>
  )
}

/**
 * useMotionConfig — returns full motion config context
 */
export function useMotionConfig(): MotionConfigContextValue {
  return useContext(MotionConfigContext)
}

/**
 * useComponentMotion — returns motion config for a specific component role
 *
 * @param role - Component role key (e.g. 'card', 'hero', 'button')
 * @returns ComponentMotionConfig or undefined if not configured
 */
export function useComponentMotion(
  role: string
): ComponentMotionConfig | undefined {
  const { components } = useContext(MotionConfigContext)
  return components[role]
}
