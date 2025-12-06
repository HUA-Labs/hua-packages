'use client'

/**
 * IconProvider - Icon 시스템 전역 설정 Provider
 * 
 * React Context를 사용하여 전역 아이콘 설정을 제공합니다.
 * 서비스 레벨에서 Zustand 등으로 상태관리 후 props로 전달 가능합니다.
 * 
 * IconProvider - Global Icon Settings Provider
 * 
 * Provides global icon settings using React Context API.
 * Can be integrated with state management (e.g., Zustand) at the service level.
 */

import React, { createContext, useContext } from 'react'
import { type IconConfig, type IconSet, type PhosphorWeight, defaultIconConfig } from './icon-store'

/**
 * IconProvider 컴포넌트 Props
 * 
 * IconProvider component props interface.
 * 
 * @interface IconProviderProps
 */
export interface IconProviderProps {
  /** 아이콘 세트 (lucide, phosphor, untitled) / Icon set (lucide, phosphor, untitled) */
  set?: IconSet
  /** Phosphor 아이콘 weight (thin, light, regular, bold, duotone, fill) / Phosphor icon weight */
  weight?: PhosphorWeight
  /** 기본 아이콘 크기 / Default icon size */
  size?: number
  /** 기본 아이콘 색상 / Default icon color */
  color?: string
  /** Lucide/Untitled 아이콘 stroke width / Lucide/Untitled icon stroke width */
  strokeWidth?: number
  /** 자식 컴포넌트 / Child components */
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
 * IconProvider component
 * 
 * Provides global icon settings through Context API.
 * Can receive values managed by Zustand at the service level.
 * 
 * @component
 * @example
 * ```tsx
 * // 기본 사용 / Basic usage
 * <IconProvider set="phosphor" weight="regular" size={20}>
 *   <App />
 * </IconProvider>
 * 
 * // Zustand와 함께 사용 / With Zustand
 * const iconConfig = useIconStore(state => state.iconConfig)
 * <IconProvider {...iconConfig}>
 *   <App />
 * </IconProvider>
 * 
 * // Lucide 아이콘 사용 / Using Lucide icons
 * <IconProvider set="lucide" size={24} strokeWidth={1.5}>
 *   <App />
 * </IconProvider>
 * ```
 * 
 * @param props - IconProvider 컴포넌트 props / IconProvider component props
 * @returns IconProvider 컴포넌트 / IconProvider component
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
 * useIconContext Hook
 * 
 * Icon Context를 사용하는 Hook입니다.
 * Icon 컴포넌트 내부에서 사용됩니다.
 * 
 * Hook to use Icon Context.
 * Used internally by Icon component.
 * 
 * @returns Icon 설정 값 / Icon configuration value
 * 
 * @example
 * ```tsx
 * // Icon 컴포넌트 내부에서 사용 / Used inside Icon component
 * const config = useIconContext()
 * const iconSet = config.set
 * const iconSize = config.size
 * ```
 */
export function useIconContext(): IconContextValue {
  return useContext(IconContext)
}

// Re-export types for convenience
export type { IconSet, PhosphorWeight, IconConfig } from './icon-store'
export { defaultIconConfig, getDefaultStrokeWidth } from './icon-store'

