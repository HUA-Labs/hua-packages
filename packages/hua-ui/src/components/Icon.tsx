import React from 'react'
import { LucideProps } from 'lucide-react'
import { cn } from '../lib/utils'
import { icons, IconName, emotionIcons, statusIcons } from '../lib/icons'

export interface IconProps {
  name: IconName
  size?: number | string
  className?: string
  emotion?: keyof typeof emotionIcons
  status?: keyof typeof statusIcons
  animated?: boolean
  pulse?: boolean
  spin?: boolean
  bounce?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'
}

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(({
  name,
  size = 24,
  className,
  emotion,
  status,
  animated = false,
  pulse = false,
  spin = false,
  bounce = false,
  variant = 'default'
}, ref) => {
  // 클라이언트 사이드에서만 아이콘 렌더링 (hydration 오류 방지)
  const [isClient, setIsClient] = React.useState(false)
  
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // 감정이나 상태가 지정되면 해당 아이콘으로 오버라이드
  const iconName = emotion ? emotionIcons[emotion] : 
                   status ? statusIcons[status] : 
                   name
  
  const IconComponent = icons[iconName]
  
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found`)
    return <span style={{ width: size, height: size }} className={className} />
  }

  // 서버사이드에서는 빈 span 반환 (hydration 오류 방지)
  if (!isClient) {
    return <span style={{ width: size, height: size }} className={className} />
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

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center',
        animationClasses,
        variantClasses,
        className
      )}
      style={{ width: size, height: size }}
    >
      {IconComponent && React.createElement(IconComponent as any)}
    </span>
  )
})

Icon.displayName = 'Icon'

// 편의를 위한 특화된 아이콘 컴포넌트들
export const EmotionIcon = React.forwardRef<HTMLSpanElement, Omit<IconProps, 'name'> & { emotion: keyof typeof emotionIcons }>(
  (props, ref) => <Icon ref={ref} name="smile" {...props} />
)

EmotionIcon.displayName = 'EmotionIcon'

export const StatusIcon = React.forwardRef<HTMLSpanElement, Omit<IconProps, 'name'> & { status: keyof typeof statusIcons }>(
  (props, ref) => <Icon ref={ref} name="info" {...props} />
)

StatusIcon.displayName = 'StatusIcon'

// 로딩 상태 전용 아이콘
export const LoadingIcon = React.forwardRef<HTMLDivElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="loader" status="loading" spin {...props} />
  )
)

LoadingIcon.displayName = 'LoadingIcon'

// 성공 상태 전용 아이콘
export const SuccessIcon = React.forwardRef<HTMLDivElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="check" status="success" variant="success" {...props} />
  )
)

SuccessIcon.displayName = 'SuccessIcon'

// 에러 상태 전용 아이콘
export const ErrorIcon = React.forwardRef<HTMLDivElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="alertCircle" status="error" variant="error" {...props} />
  )
)

ErrorIcon.displayName = 'ErrorIcon' 