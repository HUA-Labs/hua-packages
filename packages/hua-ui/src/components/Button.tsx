"use client";

import * as React from "react";
import { merge } from "../lib/utils";

/** 공통 옵션 */
type Variant =
  | "default" | "destructive" | "outline" | "secondary"
  | "ghost" | "link" | "gradient" | "neon" | "glass";
type Size = "sm" | "md" | "lg" | "xl" | "icon";
type Rounded = "sm" | "md" | "lg" | "full";
type Shadow = "none" | "sm" | "md" | "lg" | "xl";
type Hover = "scale" | "glow" | "slide" | "none";
type GradientName = "blue" | "purple" | "green" | "orange" | "pink" | "custom";

/** disabled를 공통에 명시해 앵커/버튼 모두에서 사용 */
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

/** ✅ 내부 이름은 ButtonInner로, export는 마지막에 한 번만 */
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

  const base = merge(
    "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
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
    const { onClick, target, rel, href, ...anchorProps } = rest as AnchorProps;
    const isDisabled = !!disabled || loading;

    const handleAnchorClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
      if (isDisabled) { e.preventDefault(); e.stopPropagation(); return; }
      onClick?.(e);
    };

    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={base}
        onClick={handleAnchorClick}
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
  const btnProps = rest as NativeButtonProps;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={base}
      type="button"                 // 폼 기본 제출 방지
      disabled={disabled || loading}
      aria-busy={loading || undefined}
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
