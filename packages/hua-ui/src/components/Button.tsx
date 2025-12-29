"use client";

import React from "react";
import { merge } from "../lib/utils";

/**
 * 버튼 스타일 변형 / Button style variant
 * @typedef {"default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "neon" | "glass"} Variant
 */
type Variant =
  | "default" | "destructive" | "outline" | "secondary"
  | "ghost" | "link" | "gradient" | "neon" | "glass";

/**
 * 버튼 크기 / Button size
 * @typedef {"sm" | "md" | "lg" | "xl" | "icon"} Size
 */
type Size = "sm" | "md" | "lg" | "xl" | "icon";

/**
 * 버튼 모서리 둥글기 / Button border radius
 * @typedef {"sm" | "md" | "lg" | "full"} Rounded
 */
type Rounded = "sm" | "md" | "lg" | "full";

/**
 * 버튼 그림자 / Button shadow
 * @typedef {"none" | "sm" | "md" | "lg" | "xl"} Shadow
 */
type Shadow = "none" | "sm" | "md" | "lg" | "xl";

/**
 * 버튼 호버 효과 / Button hover effect
 * @typedef {"scale" | "glow" | "slide" | "none"} Hover
 */
type Hover = "scale" | "glow" | "slide" | "none";

/**
 * 그라디언트 색상 이름 / Gradient color name
 * @typedef {"blue" | "purple" | "green" | "orange" | "pink" | "custom"} GradientName
 */
type GradientName = "blue" | "purple" | "green" | "orange" | "pink" | "custom";

/**
 * Button 컴포넌트의 공통 props / Common props for Button component
 * @typedef {Object} CommonProps
 * @property {Variant} [variant="default"] - 버튼 스타일 변형 / Button style variant
 * @property {Size} [size="md"] - 버튼 크기 / Button size
 * @property {boolean} [loading=false] - 로딩 상태 (스피너 표시) / Loading state (shows spinner)
 * @property {React.ReactNode} [icon] - 아이콘 요소 / Icon element
 * @property {"left" | "right"} [iconPosition="left"] - 아이콘 위치 / Icon position
 * @property {GradientName} [gradient="blue"] - 그라디언트 색상 (variant="gradient"일 때) / Gradient color (when variant="gradient")
 * @property {string} [customGradient] - 커스텀 그라디언트 클래스 (variant="gradient"일 때) / Custom gradient class (when variant="gradient")
 * @property {Rounded} [rounded="md"] - 모서리 둥글기 / Border radius
 * @property {Shadow} [shadow="md"] - 그림자 크기 / Shadow size
 * @property {Hover} [hover="scale"] - 호버 효과 / Hover effect
 * @property {boolean} [fullWidth=false] - 전체 너비 사용 / Use full width
 * @property {boolean} [iconOnly=false] - 아이콘만 표시 (aria-label 필수) / Icon only (aria-label required)
 * @property {string} [aria-label] - 접근성을 위한 레이블 (iconOnly일 때 필수) / Accessibility label (required when iconOnly)
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {boolean} [disabled=false] - 비활성화 상태 / Disabled state
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
  disabled?: boolean; // <-- 요놈 추가
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
 * Renders as anchor tag if href is provided, otherwise as button tag.
 * @typedef {AnchorProps | NativeButtonProps} ButtonProps
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
 * Universal button component supporting various styles and sizes.
 * Renders as anchor tag if href prop is provided, otherwise as button tag.
 * 
 * @component
 * @example
 * // 기본 버튼 / Basic button
 * <Button onClick={() => console.log('클릭')}>클릭하세요</Button>
 * 
 * @example
 * // 다양한 변형 / Various variants
 * <Button variant="destructive" size="lg">삭제</Button>
 * <Button variant="outline" size="sm">취소</Button>
 * <Button variant="ghost">보기</Button>
 * 
 * @example
 * // 아이콘과 함께 사용 / With icon
 * <Button icon={<Icon name="download" />} iconPosition="left">
 *   다운로드
 * </Button>
 * 
 * @example
 * // 로딩 상태 / Loading state
 * <Button loading disabled>저장 중...</Button>
 * 
 * @example
 * // 링크 버튼 / Link button
 * <Button href="/about" variant="link">자세히 보기</Button>
 * 
 * @example
 * // 아이콘만 표시 (aria-label 필수) / Icon only (aria-label required)
 * <Button iconOnly aria-label="닫기" icon={<Icon name="close" />} />
 * 
 * @param {ButtonProps} props - Button 컴포넌트의 props / Button component props
 * @param {React.Ref<HTMLAnchorElement | HTMLButtonElement>} ref - ref 객체 / ref object
 * @returns {JSX.Element} Button 컴포넌트 / Button component
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
    hover = "scale",
    fullWidth,
    iconOnly,
    className,
    children,
    disabled,
    ...rest
  },
  ref
) {
  const reduced = useReducedMotion();

  const variantClasses: Record<Variant, string> = {
    default:
      "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
    outline:
      "border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
    link:
      "bg-transparent text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
    gradient: `bg-gradient-to-r ${customGradient || getGradientClass(gradient)} text-white hover:shadow-lg`,
    neon:
      "bg-gray-900 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40",
    glass:
      "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
  };

  const sizeClasses: Record<Size, string> = {
    sm: "h-8 px-3 py-1 text-sm",
    md: "h-10 px-4 py-2 text-base",
    lg: "h-12 px-6 py-3 text-lg",
    xl: "h-14 px-8 py-4 text-xl",
    icon: "h-10 w-10 p-0",
  };

  const roundedClasses: Record<Rounded, string> = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const shadowClasses: Record<Shadow, string> = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const hoverClasses: Record<Hover, string> = {
    scale: reduced ? "" : "hover:scale-105 transition-transform duration-200",
    glow: reduced ? "" : "hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-cyan-400/25 transition-shadow duration-300",
    slide: reduced ? "" : "hover:-translate-y-1 transition-transform duration-200",
    none: "",
  };

  // variant별 포커스 스타일
  const focusClasses: Record<Variant, string> = {
    default: "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
    destructive: "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:ring-offset-1",
    outline: "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-600 focus-visible:ring-offset-0",
    secondary: "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-1",
    ghost: "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-0",
    link: "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0",
    gradient: "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
    neon: "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:ring-offset-1",
    glass: "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400/50 focus-visible:ring-offset-0",
  };

  const base = merge(
    "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200",
    focusClasses[variant],
    "disabled:pointer-events-none disabled:opacity-50 min-w-fit",
    fullWidth && "w-full",
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    shadowClasses[shadow],
    hoverClasses[hover],
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
    // eslint-disable-next-line no-console
    console.warn("[Button] iconOnly 사용 시 aria-label을 제공하세요.");
  }

  // 앵커 모드
  if ("href" in rest && rest.href) {
    const { onClick, target, rel, href, "aria-label": ariaLabel, className: anchorClassName, ...anchorProps } = rest as AnchorProps;
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
      type="button"                 // 폼 기본 제출 방지
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

function getGradientClass(gradient: GradientName): string {
  const g: Record<Exclude<GradientName, "custom">, string> = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400",
    orange: "from-orange-500 to-red-500 dark:from-orange-300 dark:to-red-300",
    pink: "from-pink-500 to-rose-500",
  };
  return g[gradient as keyof typeof g] || g.blue;
}
