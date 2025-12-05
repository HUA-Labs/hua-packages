'use client'

/**
 * IconProvider - Icon 시스템 전역 설정 Provider
 * 
 * React Context를 사용하여 전역 아이콘 설정을 제공합니다.
 * 서비스 레벨에서 Zustand 등으로 상태관리 후 props로 전달 가능합니다.
 */

import React, { createContext, useContext } from 'react'
import { type IconConfig, type IconSet, type PhosphorWeight, defaultIconConfig } from './icon-store'

export interface IconProviderProps {
  set?: IconSet
  weight?: PhosphorWeight
  size?: number
  color?: string
  strokeWidth?: number
  children: React.ReactNode
}

interface IconContextValue extends IconConfig {}

const IconContext = createContext<IconContextValue>(defaultIconConfig)

/**
 * IconProvider 컴포넌트
 * 
 * 전역 아이콘 설정을 Context로 제공합니다.
 * 서비스에서 Zustand로 관리한 값을 props로 전달할 수 있습니다.
 * 
 * @example
 * ```tsx
 * // 기본 사용
 * <IconProvider set="phosphor" weight="regular" size={20}>
 *   <App />
 * </IconProvider>
 * 
 * // Zustand와 함께 사용
 * const iconConfig = useIconStore(state => state.iconConfig)
 * <IconProvider {...iconConfig}>
 *   <App />
 * </IconProvider>
 * ```
 */
export function IconProvider({
  set = defaultIconConfig.set,
  weight = defaultIconConfig.weight,
  size = defaultIconConfig.size,
  color = defaultIconConfig.color,
  strokeWidth = defaultIconConfig.strokeWidth,
  children,
}: IconProviderProps) {
  const value: IconContextValue = {
    set,
    weight,
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

/**
 * Icon Context를 사용하는 Hook
 * Icon 컴포넌트 내부에서 사용됩니다.
 */
export function useIconContext(): IconContextValue {
  return useContext(IconContext)
}

// Re-export types for convenience
export type { IconSet, PhosphorWeight, IconConfig } from './icon-store'
export { defaultIconConfig, getDefaultStrokeWidth } from './icon-store'

