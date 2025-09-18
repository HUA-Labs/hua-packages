'use client'

import React, { useMemo } from 'react'

// 확장된 색상 프리셋 타입
export type ColorPreset = 
  | 'blue' | 'teal' | 'cyan' | 'emerald' 
  | 'purple' | 'violet' | 'indigo' 
  | 'orange' | 'amber' | 'yellow'
  | 'pink' | 'rose' | 'fuchsia'
  | 'slate' | 'gray' | 'zinc'

// 색상 프리셋 설정
export const colorPresets = {
  // 파란색 계열
  blue: {
    name: 'Blue',
    light: 'bg-blue-500 hover:bg-blue-600',
    dark: 'dark:bg-blue-400 dark:hover:bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-700',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-500 dark:text-blue-400'
  },
  teal: {
    name: 'Teal',
    light: 'bg-teal-500 hover:bg-teal-600',
    dark: 'dark:bg-teal-400 dark:hover:bg-teal-500',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-700',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    icon: 'text-teal-500 dark:text-teal-400'
  },
  cyan: {
    name: 'Cyan',
    light: 'bg-cyan-500 hover:bg-cyan-600',
    dark: 'dark:bg-cyan-400 dark:hover:bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-700',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    icon: 'text-cyan-500 dark:text-cyan-400'
  },
  
  // 초록색 계열 (다크모드 개선)
  emerald: {
    name: 'Emerald',
    light: 'bg-emerald-500 hover:bg-emerald-600',
    dark: 'dark:bg-emerald-400 dark:hover:bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-700',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-500 dark:text-emerald-400'
  },
  
  // 보라색 계열
  purple: {
    name: 'Purple',
    light: 'bg-purple-500 hover:bg-purple-600',
    dark: 'dark:bg-purple-400 dark:hover:bg-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-700',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-500 dark:text-purple-400'
  },
  violet: {
    name: 'Violet',
    light: 'bg-violet-500 hover:bg-violet-600',
    dark: 'dark:bg-violet-400 dark:hover:bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-700',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    icon: 'text-violet-500 dark:text-violet-400'
  },
  indigo: {
    name: 'Indigo',
    light: 'bg-indigo-500 hover:bg-indigo-600',
    dark: 'dark:bg-indigo-400 dark:hover:bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-700',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: 'text-indigo-500 dark:text-indigo-400'
  },
  
  // 주황색 계열
  orange: {
    name: 'Orange',
    light: 'bg-orange-500 hover:bg-orange-600',
    dark: 'dark:bg-orange-400 dark:hover:bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-700',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    icon: 'text-orange-500 dark:text-orange-400'
  },
  amber: {
    name: 'Amber',
    light: 'bg-amber-500 hover:bg-amber-600',
    dark: 'dark:bg-amber-400 dark:hover:bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-700',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-500 dark:text-amber-400'
  },
  yellow: {
    name: 'Yellow',
    light: 'bg-yellow-500 hover:bg-yellow-600',
    dark: 'dark:bg-yellow-400 dark:hover:bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-700',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'text-yellow-500 dark:text-yellow-400'
  },
  
  // 분홍색 계열
  pink: {
    name: 'Pink',
    light: 'bg-pink-500 hover:bg-pink-600',
    dark: 'dark:bg-pink-400 dark:hover:bg-pink-500',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-700',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    icon: 'text-pink-500 dark:text-pink-400'
  },
  rose: {
    name: 'Rose',
    light: 'bg-rose-500 hover:bg-rose-600',
    dark: 'dark:bg-rose-400 dark:hover:bg-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-700',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    icon: 'text-rose-500 dark:text-rose-400'
  },
  fuchsia: {
    name: 'Fuchsia',
    light: 'bg-fuchsia-500 hover:bg-fuchsia-600',
    dark: 'dark:bg-fuchsia-400 dark:hover:bg-fuchsia-500',
    text: 'text-fuchsia-600 dark:text-fuchsia-400',
    border: 'border-fuchsia-200 dark:border-fuchsia-700',
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    icon: 'text-fuchsia-500 dark:text-fuchsia-400'
  },
  
  // 회색 계열
  slate: {
    name: 'Slate',
    light: 'bg-slate-500 hover:bg-slate-600',
    dark: 'dark:bg-slate-400 dark:hover:bg-slate-500',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    icon: 'text-slate-500 dark:text-slate-400'
  },
  gray: {
    name: 'Gray',
    light: 'bg-gray-500 hover:bg-gray-600',
    dark: 'dark:bg-gray-400 dark:hover:bg-gray-500',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    icon: 'text-gray-500 dark:text-gray-400'
  },
  zinc: {
    name: 'Zinc',
    light: 'bg-zinc-500 hover:bg-zinc-600',
    dark: 'dark:bg-zinc-400 dark:hover:bg-zinc-500',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-200 dark:border-zinc-700',
    bg: 'bg-zinc-50 dark:bg-zinc-900/20',
    icon: 'text-zinc-500 dark:text-zinc-400'
  }
} as const

// 색상 프리셋 훅
export const useColorPreset = (color: ColorPreset) => {
  return useMemo(() => colorPresets[color], [color])
}

// 색상 프리셋 선택기 컴포넌트
interface ColorPresetSelectorProps {
  selectedColor: ColorPreset
  onColorChange: (color: ColorPreset) => void
  availableColors?: ColorPreset[]
  className?: string
}

export const ColorPresetSelector: React.FC<ColorPresetSelectorProps> = ({
  selectedColor,
  onColorChange,
  availableColors = Object.keys(colorPresets) as ColorPreset[],
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {availableColors.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          className={`
            w-8 h-8 rounded-full border-2 transition-all duration-200
            ${color === selectedColor 
              ? 'scale-110 border-gray-800 dark:border-white' 
              : 'border-gray-300 dark:border-gray-600 hover:scale-105'
            }
            ${colorPresets[color].light} ${colorPresets[color].dark}
          `}
          title={colorPresets[color].name}
        />
      ))}
    </div>
  )
}

// 색상 프리셋 유틸리티
export const getColorClasses = (color: ColorPreset, variant: 'button' | 'text' | 'border' | 'bg' | 'icon' = 'button') => {
  const preset = colorPresets[color]
  switch (variant) {
    case 'button':
      return `${preset.light} ${preset.dark}`
    case 'text':
      return preset.text
    case 'border':
      return preset.border
    case 'bg':
      return preset.bg
    case 'icon':
      return preset.icon
    default:
      return preset.light
  }
}
