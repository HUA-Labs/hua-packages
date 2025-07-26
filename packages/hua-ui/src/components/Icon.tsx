import React from 'react'
import { LucideProps } from 'lucide-react'
import { cn } from '../lib/utils'
import { icons, IconName, emotionIcons, statusIcons } from '../lib/icons'

// React 19 호환성을 위한 타입 정의
export type SvgIconComponent = React.ElementType<LucideProps>

export interface IconProps extends Omit<LucideProps, 'size'> {
  name: IconName
  size?: number | string
  className?: string
  // 감정 표현을 위한 추가 props
  emotion?: keyof typeof emotionIcons
  status?: keyof typeof statusIcons
  // 애니메이션 관련
  animated?: boolean
  pulse?: boolean
  spin?: boolean
  bounce?: boolean
  // 색상 테마
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(({
  name,
  size = 24,
  className,
  emotion,
  status,
  animated = false,
  pulse = false,
  spin = false,
  bounce = false,
  variant = 'default',
  ...props
}, ref): React.ReactElement | null => {
  // 감정이나 상태가 지정되면 해당 아이콘으로 오버라이드
  const iconName = emotion ? emotionIcons[emotion] : 
                   status ? statusIcons[status] : 
                   name
  
  const IconComponent = icons[iconName]
  
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found`)
    return null
  }

  // 애니메이션 클래스 생성
  const animationClasses = cn({
    'animate-pulse': pulse,
    'animate-spin': spin,
    'animate-bounce': bounce,
    'transition-all duration-200 ease-in-out': animated,
  })

  // 색상 변형 클래스
  const variantClasses = cn({
    'text-gray-900 dark:text-white': variant === 'default',
    'text-blue-600 dark:text-blue-400': variant === 'primary',
    'text-gray-600 dark:text-gray-400': variant === 'secondary',
    'text-green-600 dark:text-green-400': variant === 'success',
    'text-yellow-600 dark:text-yellow-400': variant === 'warning',
    'text-red-600 dark:text-red-400': variant === 'error',
    'text-gray-500 dark:text-gray-500': variant === 'muted',
  })

  const IconElement = IconComponent as SvgIconComponent
  return (
    <IconElement
      ref={ref}
      size={size}
      className={cn(
        'inline-block',
        animationClasses,
        variantClasses,
        className
      )}
      {...props}
    />
  )
})

Icon.displayName = 'Icon'

// 편의를 위한 특화된 아이콘 컴포넌트들
export const EmotionIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'name'> & { emotion: keyof typeof emotionIcons }>(
  ({ emotion, ...props }, ref) => (
    <Icon ref={ref} name="smile" emotion={emotion} {...props} />
  )
)

EmotionIcon.displayName = 'EmotionIcon'

export const StatusIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'name'> & { status: keyof typeof statusIcons }>(
  ({ status, ...props }, ref) => (
    <Icon ref={ref} name="info" status={status} {...props} />
  )
)

StatusIcon.displayName = 'StatusIcon'

// 로딩 상태 전용 아이콘
export const LoadingIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="loader" status="loading" spin {...props} />
  )
)

LoadingIcon.displayName = 'LoadingIcon'

// 성공 상태 전용 아이콘
export const SuccessIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="check" status="success" variant="success" {...props} />
  )
)

SuccessIcon.displayName = 'SuccessIcon'

// 에러 상태 전용 아이콘
export const ErrorIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="alertCircle" status="error" variant="error" {...props} />
  )
)

ErrorIcon.displayName = 'ErrorIcon' 