"use client";

import React from "react";
import { merge } from "../lib/utils";
import { buttonVariants, gradientPresets } from "./Button.variants";
import { Slot } from "../lib/Slot";

/**
 * 버튼 스타일 변형 / Button style variant
 */
type Variant =
  | "default" | "destructive" | "outline" | "secondary"
  | "ghost" | "link" | "gradient" | "neon" | "glass";

/**
 * 버튼 크기 / Button size
 */
type Size = "sm" | "md" | "lg" | "xl" | "icon";

/**
 * 버튼 모서리 둥글기 / Button border radius
 */
type Rounded = "sm" | "md" | "lg" | "full";

/**
 * 버튼 그림자 / Button shadow
 */
type Shadow = "none" | "sm" | "md" | "lg" | "xl";

/**
 * 버튼 호버 효과 / Button hover effect
 * "springy"가 HUA-UI 시그니처 - 공 튕기듯 미세한 반동
 */
type Hover = "springy" | "scale" | "glow" | "slide" | "none";

/**
 * 그라디언트 색상 이름 / Gradient color name
 */
type GradientName = "blue" | "purple" | "green" | "orange" | "pink" | "custom";

/**
 * Button 컴포넌트의 공통 props / Common props for Button component
 */
type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  gradient?: GradientName;
  customGradient?: string;
  rounded?: Rounded;
  shadow?: Shadow;
  hover?: Hover;
  fullWidth?: boolean;
  iconOnly?: boolean;
  "aria-label"?: string;
  className?: string;
  disabled?: boolean;
  asChild?: boolean;
};

type AnchorProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "type"> & {
    href?: undefined;
  };

/**
 * Button 컴포넌트의 props 타입 / Button component props type
 * href가 제공되면 앵커 태그로, 그렇지 않으면 버튼 태그로 렌더링됩니다.
 */
export type ButtonProps = AnchorProps | NativeButtonProps;

type AnchorOrButton = HTMLAnchorElement | HTMLButtonElement;

const isBrowser = typeof window !== "undefined";
function useReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    if (!isBrowser || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(!!mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduce;
}

/**
 * Button 컴포넌트 / Button component
 *
 * 다양한 스타일과 크기를 지원하는 범용 버튼 컴포넌트입니다.
 * href prop을 제공하면 앵커 태그로, 그렇지 않으면 버튼 태그로 렌더링됩니다.
 *
 * @example
 * <Button onClick={() => console.log('클릭')}>클릭하세요</Button>
 * <Button variant="destructive" size="lg">삭제</Button>
 * <Button variant="gradient" gradient="purple">그라디언트</Button>
 * <Button href="/about" variant="link">자세히 보기</Button>
 */
const ButtonInner = React.forwardRef<AnchorOrButton, ButtonProps>(function ButtonInner(
  {
    variant = "default",
    size = "md",
    loading = false,
    icon,
    iconPosition = "left",
    gradient = "blue",
    customGradient,
    rounded = "md",
    shadow = "md",
    hover = "springy",
    fullWidth,
    iconOnly,
    className,
    children,
    disabled,
    asChild = false,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();

  // gradient variant: 커스텀 그라디언트 클래스 처리
  const gradientClass =
    variant === "gradient"
      ? customGradient
        ? `bg-gradient-to-r ${customGradient}`
        : `bg-gradient-to-r ${gradientPresets[gradient] || gradientPresets.blue}`
      : undefined;

  const base = merge(
    buttonVariants({
      variant,
      size,
      rounded,
      shadow,
      hover: reduced ? "none" : hover,
      fullWidth: fullWidth ?? false,
    }),
    gradientClass,
    className
  );

  const Spinner = (
    <span role="status" aria-live="polite" className="-ml-1 mr-2 inline-flex">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="sr-only">로딩 중</span>
    </span>
  );

  const content = (
    <>
      {loading && Spinner}
      {!loading && icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </>
  );

  if (iconOnly && !("aria-label" in rest) && process.env.NODE_ENV !== "production") {
    console.warn("[Button] iconOnly 사용 시 aria-label을 제공하세요.");
  }

  // asChild 모드: Slot을 사용하여 자식 요소에 props 병합
  if (asChild) {
    const slotProps = {
      className: base,
      ref,
      disabled: disabled || loading,
      "aria-busy": loading || undefined,
      "aria-disabled": (disabled || loading) || undefined,
      ...rest,
    };
    return <Slot {...slotProps}>{children}</Slot>;
  }

  // 앵커 모드
  if ("href" in rest && rest.href) {
    const { onClick, target, rel, href, "aria-label": _ariaLabel, className: anchorClassName, ...anchorProps } = rest as AnchorProps;
    const isDisabled = !!disabled || loading;

    const handleAnchorClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
      if (isDisabled) { e.preventDefault(); e.stopPropagation(); return; }
      onClick?.(e);
    };

    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={merge(base, anchorClassName)}
        onClick={handleAnchorClick}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : anchorProps.tabIndex}
        target={target}
        rel={target === "_blank" ? rel ?? "noopener noreferrer" : rel}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  // 버튼 모드
  const { className: buttonClassName, ...btnProps } = rest as NativeButtonProps;
  const isDisabled = !!disabled || loading;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={merge(base, buttonClassName)}
      type="button"
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...btnProps}
    >
      {content}
    </button>
  );
});

ButtonInner.displayName = "Button";

export const Button = ButtonInner;
