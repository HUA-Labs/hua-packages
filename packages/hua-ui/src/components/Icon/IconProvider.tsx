'use client'

/**
 * IconProvider - Icon 시스템 전역 설정 Provider
 *
 * React Context를 사용하여 전역 아이콘 설정을 제공합니다.
 *
 * @example
 * ```tsx
 * <IconProvider set="phosphor" weight="regular" size={20}>
 *   <App />
 * </IconProvider>
 * ```
 */

import React, { createContext, useContext } from 'react'
import { type IconConfig, type IconSet, type PhosphorWeight, type IconsaxVariant, defaultIconConfig } from './icon-store'

/**
 * IconProvider 컴포넌트 Props
 */
export interface IconProviderProps {
  /** 아이콘 세트 (lucide, phosphor, iconsax) */
  set?: IconSet
  /** Phosphor 아이콘 weight */
  weight?: PhosphorWeight
  /** Iconsax 아이콘 변형 (line, bold) */
  iconsaxVariant?: IconsaxVariant
  /** 기본 아이콘 크기 */
  size?: number
  /** 기본 아이콘 색상 */
  color?: string
  /** Lucide/Iconsax 아이콘 stroke width */
  strokeWidth?: number
  /** 자식 컴포넌트 */
  children: React.ReactNode
}

interface IconContextValue extends IconConfig {}

const IconContext = createContext<IconContextValue>(defaultIconConfig)

export function IconProvider({
  set = defaultIconConfig.set,
  weight = defaultIconConfig.weight,
  iconsaxVariant = defaultIconConfig.iconsaxVariant,
  size = defaultIconConfig.size,
  color = defaultIconConfig.color,
  strokeWidth = defaultIconConfig.strokeWidth,
  children,
}: IconProviderProps) {
  const value: IconContextValue = {
    set,
    weight,
    iconsaxVariant,
    size,
    color,
    strokeWidth,
  }

  return (
    <IconContext.Provider value={value}>
      {children}
    </IconContext.Provider>
  )
}

export function useIconContext(): IconContextValue {
  return useContext(IconContext)
}

// Re-export types for convenience
export type { IconSet, PhosphorWeight, IconsaxVariant, IconConfig } from './icon-store'
export { defaultIconConfig, getDefaultStrokeWidth } from './icon-store'
