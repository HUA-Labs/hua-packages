import React from 'react'
import type { IconProps as PhosphorIconProps } from '@phosphor-icons/react'
import { merge, mergeMap } from '../../lib/utils'
import { icons, IconName, emotionIcons, statusIcons } from '../../lib/icons'
import { getIconFromProvider, getIconsaxResolver, initPhosphorIcons, initLucideIcons, getIconNameForProvider } from '../../lib/icon-providers'
import { normalizeIconName } from '../../lib/normalize-icon-name'
import { useIconContext, type IconSet } from './IconProvider'
import { type PhosphorWeight } from './icon-store'
import type { AllIconName } from '../../lib/icon-names'

/**
 * Icon 컴포넌트 Props
 */
export interface IconProps {
  /** 아이콘 이름 / Icon name */
  name: AllIconName
  /** 아이콘 크기 (숫자 또는 문자열) / Icon size (number or string) */
  size?: number | string
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string
  /** 감정 아이콘 타입 / Emotion icon type */
  emotion?: keyof typeof emotionIcons
  /** 상태 아이콘 타입 / Status icon type */
  status?: keyof typeof statusIcons
  /** 아이콘 프로바이더 오버라이드 / Icon provider override */
  provider?: IconSet
  /** 부드러운 애니메이션 효과 / Smooth animation effect */
  animated?: boolean
  /** 펄스 애니메이션 / Pulse animation */
  pulse?: boolean
  /** 회전 애니메이션 / Spin animation */
  spin?: boolean
  /** 바운스 애니메이션 / Bounce animation */
  bounce?: boolean
  /** 색상 변형 / Color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted' | 'inherit'
  /** Phosphor 아이콘 weight 오버라이드 / Phosphor icon weight override */
  weight?: PhosphorWeight
  /** 스크린 리더용 라벨 / Screen reader label */
  'aria-label'?: string
  /** 장식용 아이콘 / Decorative icon (hidden from screen readers) */
  'aria-hidden'?: boolean
}

/**
 * Icon 컴포넌트
 *
 * 다중 아이콘 라이브러리(Phosphor, Lucide, Iconsax)를 지원하는 통합 아이콘 컴포넌트.
 * IconProvider를 통해 전역 설정을 관리하며, 개별 아이콘에서도 오버라이드 가능.
 *
 * Iconsax는 별도 entry('@hua-labs/ui/iconsax')를 import해야 동작합니다.
 *
 * @example
 * ```tsx
 * <Icon name="heart" />
 * <Icon name="user" size={24} />
 * <Icon name="check" variant="success" />
 * <Icon name="loader" spin />
 * ```
 */
const IconComponent = React.forwardRef<HTMLSpanElement, IconProps>(({
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
  variant = 'default',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden
}, ref) => {
  const config = useIconContext()

  const iconSet = provider || config.set
  const iconSize = size ?? config.size
  const iconWeight = weight || config.weight
  const iconColor = config.color
  const iconStrokeWidth = config.strokeWidth ?? 1.25
  const iconsaxVariant = config.iconsaxVariant ?? 'line'

  const [isClient, setIsClient] = React.useState(false)
  const [providerReady, setProviderReady] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)

    // Provider별 lazy load 초기화
    if (iconSet === 'lucide') {
      initLucideIcons().then(() => setProviderReady(true))
    } else if (iconSet === 'phosphor') {
      initPhosphorIcons().then(() => setProviderReady(true))
    } else {
      setProviderReady(true)
    }
  }, [iconSet])

  // 통합 정규화
  const resolvedIcon = React.useMemo(() => {
    const baseName = emotion ? emotionIcons[emotion] :
                     status ? statusIcons[status] : name
    const { normalized } = normalizeIconName(baseName)
    const providerName = getIconNameForProvider(normalized, iconSet)
    return { normalized, providerName }
  }, [name, emotion, status, iconSet])

  const iconName = resolvedIcon.normalized as AllIconName

  // Iconsax: resolver를 통해 가져오기 (iconsax entry import 시 자동 등록됨)
  const iconsaxIcon = React.useMemo(() => {
    if (iconSet === 'iconsax' && isClient) {
      const resolver = getIconsaxResolver()
      if (resolver) {
        return resolver(resolvedIcon.providerName, iconsaxVariant)
      }
    }
    return null
  }, [iconSet, resolvedIcon.providerName, isClient, iconsaxVariant])

  // 색상 변형 클래스
  const variantClasses = mergeMap({
    'text-current': variant === 'default',
    'text-primary': variant === 'primary',
    'text-muted-foreground': variant === 'secondary' || variant === 'muted',
    'text-green-600 dark:text-green-400': variant === 'success',
    'text-yellow-600 dark:text-yellow-400': variant === 'warning',
    'text-destructive': variant === 'error',
  })

  // 서버사이드에서는 빈 span 반환
  if (!isClient) {
    return (
      <span
        style={{ width: iconSize, height: iconSize }}
        className={merge(variantClasses, className)}
        aria-hidden={ariaHidden !== undefined ? ariaHidden : true}
        aria-label={ariaLabel}
      />
    )
  }

  // Provider에 따라 아이콘 가져오기
  type IconComponentType = React.ComponentType<PhosphorIconProps | React.SVGProps<SVGSVGElement> | Record<string, unknown>>
  let ResolvedIcon: IconComponentType | null = null

  if (iconSet === 'phosphor') {
    // 1. icons.ts에서 먼저 찾기 (Phosphor 아이콘이 기본, 정적 import)
    ResolvedIcon = (icons[iconName as IconName] || null) as IconComponentType | null
    // 2. 없으면 동적으로 Phosphor namespace에서 가져오기 (fallback, providerReady 필요)
    if (!ResolvedIcon && providerReady) {
      ResolvedIcon = getIconFromProvider(iconName, iconSet) as IconComponentType | null
    }
  } else if (iconSet === 'iconsax') {
    ResolvedIcon = iconsaxIcon as IconComponentType | null
    if (!ResolvedIcon) {
      ResolvedIcon = getIconFromProvider(iconName, iconSet) as IconComponentType | null
    }
  } else {
    // Lucide나 다른 provider
    ResolvedIcon = getIconFromProvider(iconName, iconSet) as IconComponentType | null
  }

  if (!ResolvedIcon) {
    // iconsax resolver 미등록 시 조용히 처리
    if (iconSet !== 'iconsax' || getIconsaxResolver()) {
      console.warn(`Icon "${iconName}" not found for provider "${iconSet}"`)
    }
    return (
      <span
        ref={ref}
        className={merge(
          'inline-flex items-center justify-center rounded-full border-2 border-dashed border-border',
          variantClasses,
          className
        )}
        style={{ width: iconSize, height: iconSize }}
        aria-label={ariaLabel || `아이콘을 찾을 수 없음: ${iconName}`}
        title={`Icon not found: ${iconName}`}
      >
        <span className="text-xs text-muted-foreground" aria-hidden="true">
          ?
        </span>
      </span>
    )
  }

  // 세트별 props 준비
  type IconPropsType = PhosphorIconProps & {
    size?: number
    width?: number | string
    height?: number | string
    color?: string
    weight?: PhosphorWeight
    strokeWidth?: number
  }

  const iconProps: IconPropsType = {
    size: typeof iconSize === 'number' ? iconSize : undefined,
    width: typeof iconSize === 'string' ? iconSize : iconSize,
    height: typeof iconSize === 'string' ? iconSize : iconSize,
    color: iconColor,
  } as IconPropsType

  if (iconSet === 'phosphor') {
    iconProps.weight = iconWeight
  } else {
    iconProps.strokeWidth = iconStrokeWidth
  }

  const animationClasses = mergeMap({
    'animate-pulse': pulse,
    'animate-spin': spin,
    'animate-bounce': bounce,
    'transition-all duration-200 ease-in-out': animated,
  })

  const accessibilityProps: React.AriaAttributes = {}

  if (ariaLabel) {
    accessibilityProps['aria-label'] = ariaLabel
    accessibilityProps['aria-hidden'] = false
  } else if (ariaHidden !== undefined) {
    accessibilityProps['aria-hidden'] = ariaHidden
  } else {
    accessibilityProps['aria-hidden'] = true
  }

  return (
    <span
      ref={ref}
      className={merge(
        'inline-flex items-center justify-center',
        animationClasses,
        variantClasses,
        className
      )}
      style={{ width: iconSize, height: iconSize }}
      {...accessibilityProps}
    >
      {ResolvedIcon && React.createElement(ResolvedIcon, {
        ...iconProps,
        className: variantClasses,
        'aria-hidden': true
      } as React.ComponentProps<typeof ResolvedIcon>)}
    </span>
  )
})

IconComponent.displayName = 'Icon'

const MemoizedIcon = React.memo(IconComponent, (prevProps, nextProps) => {
  return (
    prevProps.name === nextProps.name &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className &&
    prevProps.emotion === nextProps.emotion &&
    prevProps.status === nextProps.status &&
    prevProps.provider === nextProps.provider &&
    prevProps.animated === nextProps.animated &&
    prevProps.pulse === nextProps.pulse &&
    prevProps.spin === nextProps.spin &&
    prevProps.bounce === nextProps.bounce &&
    prevProps.variant === nextProps.variant &&
    prevProps.weight === nextProps.weight &&
    prevProps['aria-label'] === nextProps['aria-label'] &&
    prevProps['aria-hidden'] === nextProps['aria-hidden']
  )
})

export const Icon = MemoizedIcon as typeof IconComponent
Icon.displayName = 'Icon'

export const EmotionIcon = React.forwardRef<HTMLSpanElement, Omit<IconProps, 'name'> & { emotion: keyof typeof emotionIcons }>(
  (props, ref) => <Icon ref={ref} name="smile" {...props} />
)
EmotionIcon.displayName = 'EmotionIcon'

export const StatusIcon = React.forwardRef<HTMLSpanElement, Omit<IconProps, 'name'> & { status: keyof typeof statusIcons }>(
  (props, ref) => <Icon ref={ref} name="info" {...props} />
)
StatusIcon.displayName = 'StatusIcon'

export const LoadingIcon = React.forwardRef<HTMLDivElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="loader" status="loading" spin aria-label="로딩 중" {...props} />
  )
)
LoadingIcon.displayName = 'LoadingIcon'

export const SuccessIcon = React.forwardRef<HTMLDivElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="check" status="success" variant="success" aria-label="성공" {...props} />
  )
)
SuccessIcon.displayName = 'SuccessIcon'

export const ErrorIcon = React.forwardRef<HTMLDivElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="alertCircle" status="error" variant="error" aria-label="오류" {...props} />
  )
)
ErrorIcon.displayName = 'ErrorIcon'
