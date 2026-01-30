import React from 'react'
import type { LucideProps } from 'lucide-react'
import { merge, mergeMap } from '../../lib/utils'
import { icons, IconName, emotionIcons, statusIcons } from '../../lib/icons'
import { getIconFromProvider, initPhosphorIcons, getIconNameForProvider } from '../../lib/icon-providers'
import { getIconsaxIconSync } from '../../lib/iconsax-loader'
import { normalizeIconName } from '../../lib/normalize-icon-name'
import { useIconContext, type IconSet } from './IconProvider'
import { type PhosphorWeight } from './icon-store'
import type { AllIconName } from '../../lib/icon-names'

/**
 * Icon 컴포넌트 Props
 * 
 * Icon component props interface.
 * 
 * @interface IconProps
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
  /** 아이콘 프로바이더 오버라이드 (전역 설정 무시) / Icon provider override (ignores global config) */
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
  /** 스크린 리더용 라벨 (의미 있는 아이콘인 경우) / Screen reader label (for meaningful icons) */
  'aria-label'?: string
  /** 장식용 아이콘인 경우 true (스크린 리더에서 숨김) / Set to true for decorative icons (hidden from screen readers) */
  'aria-hidden'?: boolean
}

/**
 * Icon 컴포넌트
 * 
 * 다중 아이콘 라이브러리(Lucide, Phosphor, Untitled)를 지원하는 통합 아이콘 컴포넌트입니다.
 * IconProvider를 통해 전역 설정을 관리할 수 있으며, 개별 아이콘에서도 설정을 오버라이드할 수 있습니다.
 * 
 * Icon component that supports multiple icon libraries (Lucide, Phosphor, Untitled).
 * Global settings can be managed through IconProvider, and individual icons can override settings.
 * 
 * @component
 * @example
 * ```tsx
 * // 기본 사용 / Basic usage
 * <Icon name="heart" />
 * 
 * // 크기 지정 / Specify size
 * <Icon name="user" size={24} />
 * 
 * // 색상 변형 / Color variant
 * <Icon name="check" variant="success" />
 * 
 * // 애니메이션 / Animation
 * <Icon name="loader" spin />
 * <Icon name="heart" pulse />
 * 
 * // 접근성 / Accessibility
 * <Icon name="search" aria-label="검색" />
 * <Icon name="decorative-icon" aria-hidden />
 * 
 * // 감정 아이콘 / Emotion icon
 * <Icon emotion="happy" />
 * 
 * // 상태 아이콘 / Status icon
 * <Icon status="loading" spin />
 * ```
 * 
 * @param props - Icon 컴포넌트 props / Icon component props
 * @returns Icon 컴포넌트 / Icon component
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
  // Context에서 전역 설정 가져오기
  const config = useIconContext()

  // prop으로 오버라이드 가능, 없으면 Context에서 가져옴
  const iconSet = provider || config.set
  const iconSize = size ?? config.size
  const iconWeight = weight || config.weight
  const iconColor = config.color
  const iconStrokeWidth = config.strokeWidth ?? 1.25
  const iconsaxVariant = config.iconsaxVariant ?? 'line'
  
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

  // 통합 정규화: 감정/상태 → 기본 이름 → alias 해결 → provider별 이름 변환
  // Unified normalization: emotion/status → base name → alias resolution → provider name
  const resolvedIcon = React.useMemo(() => {
    const baseName = emotion ? emotionIcons[emotion] :
                     status ? statusIcons[status] : name
    const { normalized } = normalizeIconName(baseName)
    // PROJECT_ICONS 매핑을 통해 provider별 아이콘 이름 가져오기
    const providerName = getIconNameForProvider(normalized, iconSet)
    return { normalized, providerName }
  }, [name, emotion, status, iconSet])

  // 기존 iconName 변수는 하위 호환성을 위해 유지
  const iconName = resolvedIcon.normalized as AllIconName

  // Iconsax 아이콘은 동기적으로 가져오기 (getIconsaxIconSync 사용)
  // Iconsax icons are fetched synchronously using getIconsaxIconSync
  const iconsaxIcon = React.useMemo(() => {
    if (iconSet === 'iconsax' && isClient) {
      return getIconsaxIconSync(resolvedIcon.providerName, iconsaxVariant)
    }
    return null
  }, [iconSet, resolvedIcon.providerName, isClient, iconsaxVariant])
  
  // 색상 변형 클래스 (먼저 선언 - fallback에서 사용)
  const variantClasses = mergeMap({
    'text-gray-900 dark:text-white': variant === 'default',
    'text-indigo-600 dark:text-indigo-400': variant === 'primary',
    'text-gray-600 dark:text-gray-400': variant === 'secondary',
    'text-green-600 dark:text-green-400': variant === 'success',
    'text-yellow-600 dark:text-yellow-400': variant === 'warning',
    'text-red-600 dark:text-red-400': variant === 'error',
    'text-gray-500 dark:text-gray-500': variant === 'muted',
  })
  
  // 서버사이드에서는 빈 span 반환 (hydration 오류 방지)
  // Return empty span on server-side (prevent hydration errors)
  if (!isClient || (iconSet === 'phosphor' && !phosphorReady)) {
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
  type IconComponentType = React.ComponentType<LucideProps | React.SVGProps<SVGSVGElement> | Record<string, unknown>>
  let IconComponent: IconComponentType | null = null
  
  if (iconSet === 'lucide') {
    // 1. icons.ts에서 먼저 찾기 (실제 사용되는 아이콘만 포함)
    // 타입 단언: AllIconName에는 있지만 icons 객체에 없는 경우를 위해
    IconComponent = (icons[iconName as IconName] || null) as IconComponentType | null
    
    // 2. 없으면 동적으로 Lucide에서 가져오기 (fallback)
    if (!IconComponent) {
      IconComponent = getIconFromProvider(iconName, iconSet) as IconComponentType | null
    }
  } else if (iconSet === 'iconsax') {
    // Iconsax 아이콘은 state에서 가져오기 (비동기 로딩)
    IconComponent = iconsaxIcon as IconComponentType | null
    // 캐시에서도 확인 (이미 로드된 경우)
    if (!IconComponent) {
      IconComponent = getIconFromProvider(iconName, iconSet) as IconComponentType | null
    }
  } else {
    // Phosphor나 다른 provider는 getIconFromProvider 사용
    // phosphorReady가 true일 때만 호출됨 (위에서 체크)
    IconComponent = getIconFromProvider(iconName, iconSet) as IconComponentType | null
  }
  
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found for provider "${iconSet}"`)
    // Fallback: 빈 원형 아이콘 표시 (에러 표시)
    // Fallback: display empty circle icon (error indicator)
    return (
      <span
        ref={ref}
        className={merge(
          'inline-flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600',
          variantClasses,
          className
        )}
        style={{ width: iconSize, height: iconSize }}
        aria-label={ariaLabel || `아이콘을 찾을 수 없음: ${iconName}`}
        title={`Icon not found: ${iconName}`}
      >
        <span className="text-xs text-gray-400 dark:text-gray-500" aria-hidden="true">
          ?
        </span>
      </span>
    )
  }
  
  // 세트별 props 준비
  type IconPropsType = LucideProps & {
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
  
  // Phosphor는 weight 사용
  if (iconSet === 'phosphor') {
    iconProps.weight = iconWeight
  } else {
    // Lucide/Iconsax/Untitled는 strokeWidth 사용
    iconProps.strokeWidth = iconStrokeWidth
  }

  // 애니메이션 클래스 생성
  const animationClasses = mergeMap({
    'animate-pulse': pulse,
    'animate-spin': spin,
    'animate-bounce': bounce,
    'transition-all duration-200 ease-in-out': animated,
  })

  // 접근성 속성 결정 / Determine accessibility attributes
  // aria-label이 제공되면 사용, 없으면 aria-hidden이 true인지 확인
  // If aria-label is provided, use it; otherwise check if aria-hidden is true
  const accessibilityProps: React.AriaAttributes = {}
  
  if (ariaLabel) {
    accessibilityProps['aria-label'] = ariaLabel
    accessibilityProps['aria-hidden'] = false
  } else if (ariaHidden !== undefined) {
    accessibilityProps['aria-hidden'] = ariaHidden
  } else {
    // 기본값: 장식용으로 간주 (의미 있는 아이콘은 명시적으로 aria-label 제공 필요)
    // Default: considered decorative (meaningful icons should explicitly provide aria-label)
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
      {IconComponent && React.createElement(IconComponent, { 
        ...iconProps,
        className: variantClasses,
        'aria-hidden': true // SVG 내부 요소는 항상 숨김 (외부 span이 접근성 담당)
      } as React.ComponentProps<typeof IconComponent>)}
    </span>
  )
})

IconComponent.displayName = 'Icon'

// 성능 최적화: React.memo 적용
// Performance optimization: Apply React.memo
// forwardRef와 함께 사용할 때는 React.memo로 감싸기
// When using with forwardRef, wrap with React.memo
const MemoizedIcon = React.memo(IconComponent, (prevProps, nextProps) => {
  // props 비교 함수: 변경된 props만 체크
  // Props comparison function: only check changed props
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

// 타입 안전성을 위해 export
// Export for type safety
export const Icon = MemoizedIcon as typeof IconComponent

Icon.displayName = 'Icon'

/**
 * EmotionIcon 컴포넌트
 * 
 * 감정을 표현하는 아이콘 컴포넌트입니다.
 * Icon component for expressing emotions.
 * 
 * @component
 * @example
 * ```tsx
 * <EmotionIcon emotion="happy" />
 * <EmotionIcon emotion="sad" size={24} />
 * ```
 */
export const EmotionIcon = React.forwardRef<HTMLSpanElement, Omit<IconProps, 'name'> & { emotion: keyof typeof emotionIcons }>(
  (props, ref) => <Icon ref={ref} name="smile" {...props} />
)

EmotionIcon.displayName = 'EmotionIcon'

/**
 * StatusIcon 컴포넌트
 * 
 * 상태를 표현하는 아이콘 컴포넌트입니다.
 * Icon component for expressing status.
 * 
 * @component
 * @example
 * ```tsx
 * <StatusIcon status="loading" spin />
 * <StatusIcon status="success" variant="success" />
 * ```
 */
export const StatusIcon = React.forwardRef<HTMLSpanElement, Omit<IconProps, 'name'> & { status: keyof typeof statusIcons }>(
  (props, ref) => <Icon ref={ref} name="info" {...props} />
)

StatusIcon.displayName = 'StatusIcon'

/**
 * LoadingIcon 컴포넌트
 * 
 * 로딩 상태를 표시하는 전용 아이콘 컴포넌트입니다.
 * Dedicated icon component for displaying loading status.
 * 
 * @component
 * @example
 * ```tsx
 * <LoadingIcon />
 * <LoadingIcon size={32} />
 * ```
 */
export const LoadingIcon = React.forwardRef<HTMLDivElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="loader" status="loading" spin aria-label="로딩 중" {...props} />
  )
)

LoadingIcon.displayName = 'LoadingIcon'

/**
 * SuccessIcon 컴포넌트
 * 
 * 성공 상태를 표시하는 전용 아이콘 컴포넌트입니다.
 * Dedicated icon component for displaying success status.
 * 
 * @component
 * @example
 * ```tsx
 * <SuccessIcon />
 * <SuccessIcon size={24} />
 * ```
 */
export const SuccessIcon = React.forwardRef<HTMLDivElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="check" status="success" variant="success" aria-label="성공" {...props} />
  )
)

SuccessIcon.displayName = 'SuccessIcon'

/**
 * ErrorIcon 컴포넌트
 * 
 * 에러 상태를 표시하는 전용 아이콘 컴포넌트입니다.
 * Dedicated icon component for displaying error status.
 * 
 * @component
 * @example
 * ```tsx
 * <ErrorIcon />
 * <ErrorIcon size={24} />
 * ```
 */
export const ErrorIcon = React.forwardRef<HTMLDivElement, Omit<IconProps, 'name' | 'status'>>(
  (props, ref) => (
    <Icon ref={ref} name="alertCircle" status="error" variant="error" aria-label="오류" {...props} />
  )
)

ErrorIcon.displayName = 'ErrorIcon'

