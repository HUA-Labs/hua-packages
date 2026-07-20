import React from "react";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import { dot } from "@hua-labs/dot";
import { dotClass } from "@hua-labs/dot/class";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { icons, IconName, emotionIcons, statusIcons } from "../../lib/icons";
import {
  getIconProviderServerSnapshot,
  getIconProviderSnapshot,
  getIconFromProvider,
  getIconsaxResolver,
  getLucideResolver,
  subscribeIconProvider,
} from "../../lib/icon-providers";
import { getIconProviderBinding } from "../../lib/icon-catalog";
import { normalizeIconName } from "../../lib/normalize-icon-name";
import { useIconContext, type IconSet } from "./IconProvider";
import { type PhosphorWeight } from "./icon-store";
import type { AllIconName } from "../../lib/icon-names";

/**
 * Icon 컴포넌트 Props
 */
export interface IconProps {
  /** 아이콘 이름 / Icon name */
  name: AllIconName;
  /** 아이콘 크기 (숫자 또는 문자열) / Icon size (number or string) */
  size?: number | string;
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string;
  /** dot 스타일 유틸리티 문자열 / Dot style utility string */
  dot?: string;
  /** CSS-rule features: responsive (sm:, md:), state (hover:, focus:), pseudo-elements */
  classDot?: string;
  /** 인라인 스타일 / Inline style */
  style?: React.CSSProperties;
  /** 감정 아이콘 타입 / Emotion icon type */
  emotion?: keyof typeof emotionIcons;
  /** 상태 아이콘 타입 / Status icon type */
  status?: keyof typeof statusIcons;
  /** 아이콘 프로바이더 오버라이드 / Icon provider override */
  provider?: IconSet;
  /** 부드러운 애니메이션 효과 / Smooth animation effect */
  animated?: boolean;
  /** 펄스 애니메이션 / Pulse animation */
  pulse?: boolean;
  /** 회전 애니메이션 / Spin animation */
  spin?: boolean;
  /** 바운스 애니메이션 / Bounce animation */
  bounce?: boolean;
  /** 색상 변형 / Color variant */
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "muted"
    | "inherit";
  /** Phosphor 아이콘 weight 오버라이드 / Phosphor icon weight override */
  weight?: PhosphorWeight;
  /** 스크린 리더용 라벨 / Screen reader label */
  "aria-label"?: string;
  /** 장식용 아이콘 / Decorative icon (hidden from screen readers) */
  "aria-hidden"?: boolean;
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
const IconComponent = React.forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      name,
      size,
      className,
      dot: dotProp,
      classDot,
      style: styleProp,
      emotion,
      status,
      provider,
      weight,
      animated = false,
      pulse = false,
      spin = false,
      bounce = false,
      variant = "default",
      "aria-label": ariaLabel,
      "aria-hidden": ariaHidden,
    },
    ref,
  ) => {
    const config = useIconContext();

    const iconSet = provider || config.set;
    React.useSyncExternalStore(
      React.useCallback(
        (listener) => subscribeIconProvider(iconSet, listener),
        [iconSet],
      ),
      React.useCallback(() => getIconProviderSnapshot(iconSet), [iconSet]),
      getIconProviderServerSnapshot,
    );
    const iconSize = size ?? config.size;
    const iconWeight = weight || config.weight;
    const iconColor = config.color;
    const iconStrokeWidth = config.strokeWidth ?? 1.25;
    const iconsaxVariant = config.iconsaxVariant ?? "line";

    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
      setIsClient(true);
    }, []);

    // 통합 정규화
    const resolvedIcon = React.useMemo(() => {
      const baseName = emotion
        ? emotionIcons[emotion]
        : status
          ? statusIcons[status]
          : name;
      const { normalized } = normalizeIconName(baseName);
      const providerBinding = getIconProviderBinding(normalized, iconSet);
      return {
        normalized,
        providerName: providerBinding?.component ?? null,
        providerTier: providerBinding?.tier ?? null,
        providerCapabilities: providerBinding?.capabilities ?? [],
      };
    }, [name, emotion, status, iconSet]);

    const iconName = resolvedIcon.normalized as AllIconName;

    // Iconsax: resolver를 통해 가져오기 (iconsax entry import 시 자동 등록됨)
    let iconsaxIcon = null;
    if (iconSet === "iconsax" && isClient) {
      const resolver = getIconsaxResolver();
      if (resolver && resolvedIcon.providerName) {
        iconsaxIcon = resolver(resolvedIcon.providerName, iconsaxVariant);
      }
    }

    // 색상 변형 클래스
    const variantClasses =
      variant === "default"
        ? "text-current"
        : variant === "primary"
          ? "text-primary"
          : variant === "secondary" || variant === "muted"
            ? "text-muted-foreground"
            : variant === "success"
              ? "text-green-600 dark:text-green-400"
              : variant === "warning"
                ? "text-yellow-600 dark:text-yellow-400"
                : variant === "error"
                  ? "text-destructive"
                  : "";

    const dotStyle = React.useMemo(
      () => (dotProp ? resolveDot(dotProp) : undefined),
      [dotProp],
    );
    const classDotName = React.useMemo(
      () => (classDot ? dotClass(classDot) : undefined),
      [classDot],
    );

    // 서버사이드에서는 빈 span 반환
    if (!isClient) {
      return (
        <span
          style={mergeStyles(
            dot([variantClasses, className].filter(Boolean).join(" ")),
            { width: iconSize, height: iconSize },
            dotStyle,
            styleProp,
          )}
          aria-hidden={ariaHidden !== undefined ? ariaHidden : true}
          aria-label={ariaLabel}
        />
      );
    }

    // Provider에 따라 아이콘 가져오기
    type IconComponentType = React.ComponentType<
      | PhosphorIconProps
      | React.SVGProps<SVGSVGElement>
      | Record<string, unknown>
    >;
    let ResolvedIcon: IconComponentType | null;
    let resolvedProvider = iconSet;

    if (iconSet === "phosphor") {
      // 1. icons.ts에서 먼저 찾기 (Phosphor 아이콘이 기본, 정적 import)
      ResolvedIcon = (icons[iconName as IconName] ||
        null) as IconComponentType | null;
      // 2. 정적 맵에 없으면 null (fallback UI "?" 표시)
      // getIconFromProvider는 iconsax 전용, phosphor는 정적 맵만 사용
    } else if (iconSet === "iconsax") {
      ResolvedIcon = iconsaxIcon as IconComponentType | null;
    } else if (iconSet === "lucide") {
      ResolvedIcon = getIconFromProvider(
        iconName,
        iconSet,
      ) as IconComponentType | null;
    } else {
      ResolvedIcon = getIconFromProvider(
        iconName,
        iconSet,
      ) as IconComponentType | null;
    }

    if (!ResolvedIcon && iconSet !== "phosphor") {
      const phosphorFallback = icons[iconName as IconName] as
        | IconComponentType
        | undefined;
      if (phosphorFallback) {
        ResolvedIcon = phosphorFallback;
        resolvedProvider = "phosphor";
        if (process.env.NODE_ENV === "development") {
          const reason =
            resolvedIcon.providerTier === "unsupported"
              ? "is explicitly unsupported"
              : "did not resolve";
          console.warn(
            `Icon "${iconName}" ${reason} for provider "${iconSet}"; falling back to Phosphor`,
          );
        }
      }
    }

    if (!ResolvedIcon) {
      if (iconSet === "iconsax" && !getIconsaxResolver()) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Icon "${iconName}" — iconsax resolver not registered. ` +
              `Use HuaProvider with icons.set='iconsax', or add: import '@hua-labs/ui/iconsax'`,
          );
        }
      } else if (iconSet === "lucide" && !getLucideResolver()) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Icon "${iconName}" — lucide resolver not registered. ` +
              `Register a compatible resolver with registerLucideResolver(...) before using provider="lucide".`,
          );
        }
      } else {
        console.warn(`Icon "${iconName}" not found for provider "${iconSet}"`);
      }
      return (
        <span
          ref={ref}
          style={mergeStyles(
            dot(
              [
                "inline-flex items-center justify-center rounded-full border-2 border-dashed border-border",
                variantClasses,
                className,
              ]
                .filter(Boolean)
                .join(" "),
            ),
            { width: iconSize, height: iconSize },
            dotStyle,
            styleProp,
          )}
          aria-label={ariaLabel || `아이콘을 찾을 수 없음: ${iconName}`}
          title={`Icon not found: ${iconName}`}
        >
          <span style={dot("text-xs text-muted-foreground")} aria-hidden="true">
            ?
          </span>
        </span>
      );
    }

    // 세트별 props 준비
    type IconPropsType = PhosphorIconProps & {
      size?: number;
      width?: number | string;
      height?: number | string;
      color?: string;
      weight?: PhosphorWeight;
      strokeWidth?: number;
    };

    const iconProps: IconPropsType = {
      size: typeof iconSize === "number" ? iconSize : undefined,
      width: typeof iconSize === "string" ? iconSize : iconSize,
      height: typeof iconSize === "string" ? iconSize : iconSize,
      color: iconColor,
    } as IconPropsType;

    if (resolvedProvider === "phosphor") {
      iconProps.weight = iconWeight;
    } else if (
      resolvedProvider === "lucide" &&
      resolvedIcon.providerCapabilities.includes("stroke-width")
    ) {
      iconProps.strokeWidth = iconStrokeWidth;
    }

    const animationClasses = [
      pulse ? "animate-pulse" : "",
      spin ? "animate-spin" : "",
      bounce ? "animate-bounce" : "",
      animated ? "transition-all duration-200 ease-in-out" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const accessibilityProps: React.AriaAttributes = {};

    if (ariaLabel) {
      accessibilityProps["aria-label"] = ariaLabel;
      accessibilityProps["aria-hidden"] = false;
    } else if (ariaHidden !== undefined) {
      accessibilityProps["aria-hidden"] = ariaHidden;
    } else {
      accessibilityProps["aria-hidden"] = true;
    }

    return (
      <span
        ref={ref}
        className={classDotName}
        style={mergeStyles(
          dot(
            [
              "inline-flex items-center justify-center",
              animationClasses,
              variantClasses,
              className,
            ]
              .filter(Boolean)
              .join(" "),
          ),
          { width: iconSize, height: iconSize },
          dotStyle,
          styleProp,
        )}
        {...accessibilityProps}
      >
        {ResolvedIcon &&
          React.createElement(ResolvedIcon, {
            ...iconProps,
            className: variantClasses,
            "aria-hidden": true,
          } as React.ComponentProps<typeof ResolvedIcon>)}
      </span>
    );
  },
);

IconComponent.displayName = "Icon";

export const Icon = IconComponent;
Icon.displayName = "Icon";

export const EmotionIcon = React.forwardRef<
  HTMLSpanElement,
  Omit<IconProps, "name"> & { emotion: keyof typeof emotionIcons }
>((props, ref) => <Icon ref={ref} name="smile" {...props} />);
EmotionIcon.displayName = "EmotionIcon";

export const StatusIcon = React.forwardRef<
  HTMLSpanElement,
  Omit<IconProps, "name"> & { status: keyof typeof statusIcons }
>((props, ref) => <Icon ref={ref} name="info" {...props} />);
StatusIcon.displayName = "StatusIcon";

export const LoadingIcon = React.forwardRef<
  HTMLDivElement,
  Omit<IconProps, "name" | "status">
>((props, ref) => (
  <Icon
    ref={ref}
    name="loader"
    status="loading"
    spin
    aria-label="로딩 중"
    {...props}
  />
));
LoadingIcon.displayName = "LoadingIcon";

export const SuccessIcon = React.forwardRef<
  HTMLDivElement,
  Omit<IconProps, "name" | "status">
>((props, ref) => (
  <Icon
    ref={ref}
    name="check"
    status="success"
    variant="success"
    aria-label="성공"
    {...props}
  />
));
SuccessIcon.displayName = "SuccessIcon";

export const ErrorIcon = React.forwardRef<
  HTMLDivElement,
  Omit<IconProps, "name" | "status">
>((props, ref) => (
  <Icon
    ref={ref}
    name="alertCircle"
    status="error"
    variant="error"
    aria-label="오류"
    {...props}
  />
));
ErrorIcon.displayName = "ErrorIcon";
