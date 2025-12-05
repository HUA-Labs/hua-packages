import React from 'react'
import { LucideProps } from 'lucide-react'
import { cn } from '../../lib/utils'
import { icons, IconName, emotionIcons, statusIcons } from '../../lib/icons'
import { getIconFromProvider, initPhosphorIcons } from '../../lib/icon-providers'
import { resolveIconAlias } from '../../lib/icon-aliases'
import { useIconContext, type IconSet } from './IconProvider'
import { type PhosphorWeight } from './icon-store'

export interface IconProps {
  name: IconName
  size?: number | string
  className?: string
  emotion?: keyof typeof emotionIcons
  status?: keyof typeof statusIcons
  provider?: IconSet // provider prop으로 오버라이드 가능
  animated?: boolean
  pulse?: boolean
  spin?: boolean
  bounce?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'
  weight?: PhosphorWeight // Phosphor weight 오버라이드
}

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(({
  name,
  size,
  className,
  emotion,
  status,
  provider,
  weight,
  animated = false,
  pulse = false,
  spin = false,
  bounce = false,
  variant = 'default'
}, ref) => {
  // Context에서 전역 설정 가져오기
  const config = useIconContext()
  
  // prop으로 오버라이드 가능, 없으면 Context에서 가져옴
  const iconSet = provider || config.set
  const iconSize = size ?? config.size
  const iconWeight = weight || config.weight
  const iconColor = config.color
  const iconStrokeWidth = config.strokeWidth ?? 1.25
  
  // 클라이언트 사이드에서만 아이콘 렌더링 (hydration 오류 방지)
  const [isClient, setIsClient] = React.useState(false)
  const [phosphorReady, setPhosphorReady] = React.useState(false)
  
  React.useEffect(() => {
    setIsClient(true)
    
    // Phosphor Icons 초기화 (provider가 phosphor일 때만)
    if (iconSet === 'phosphor') {
      initPhosphorIcons().then(() => {
        setPhosphorReady(true)
      })
    } else {
      setPhosphorReady(true)
    }
  }, [iconSet])

  // 감정이나 상태가 지정되면 해당 아이콘으로 오버라이드
  let iconName = emotion ? emotionIcons[emotion] : 
                 status ? statusIcons[status] : 
                 name
  
  // Alias 해결 (back, prev → arrowLeft 등)
  iconName = resolveIconAlias(iconName) as IconName
  
  // 서버사이드에서는 빈 span 반환 (hydration 오류 방지)
  if (!isClient || (iconSet === 'phosphor' && !phosphorReady)) {
    return <span style={{ width: iconSize, height: iconSize }} className={className} />
  }

  // Provider에 따라 아이콘 가져오기
  let IconComponent: React.ComponentType<any> | null = null
  
  if (iconSet === 'lucide') {
    // 1. icons.ts에서 먼저 찾기 (실제 사용되는 아이콘만 포함)
    IconComponent = icons[iconName] || null
    
    // 2. 없으면 동적으로 Lucide에서 가져오기 (fallback)
    if (!IconComponent) {
      IconComponent = getIconFromProvider(iconName, iconSet) as React.ComponentType<any> | null
    }
  } else {
    // Phosphor나 다른 provider는 getIconFromProvider 사용
    // phosphorReady가 true일 때만 호출됨 (위에서 체크)
    IconComponent = getIconFromProvider(iconName, iconSet) as React.ComponentType<any> | null
  }
  
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found for provider "${iconSet}"`)
    return <span style={{ width: iconSize, height: iconSize }} className={className} />
  }
  
  // 세트별 props 준비
  const iconProps: any = {
    size: typeof iconSize === 'number' ? iconSize : undefined,
    width: typeof iconSize === 'string' ? iconSize : iconSize,
    height: typeof iconSize === 'string' ? iconSize : iconSize,
    color: iconColor,
  }
  
  // Phosphor는 weight 사용
  if (iconSet === 'phosphor') {
    iconProps.weight = iconWeight
  } else {
    // Lucide/Untitled는 strokeWidth 사용
    iconProps.strokeWidth = iconStrokeWidth
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
      style={{ width: iconSize, height: iconSize }}
    >
      {IconComponent && React.createElement(IconComponent as any, { 
        ...iconProps,
        className: cn(variantClasses)
      })}
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

