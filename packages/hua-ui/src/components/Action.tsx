"use client";

import React from "react";
import { merge } from "../lib/utils";
import { Button, type ButtonProps } from "./Button";

/** Action 전용 옵션(버튼 공통 옵션은 ButtonProps에서 상속) */
type ActionKind =
  | "primary" | "secondary" | "tertiary"
  | "magical" | "cyberpunk" | "ninja" | "wizard" | "sniper";
type FeedbackKind = "ripple" | "particle" | "sound" | "haptic" | "glitch" | "sparkle" | "smoke";

type ActionExtras = {
  actionType?: ActionKind;
  feedback?: FeedbackKind;

  particleEffect?: boolean;
  rippleEffect?: boolean;
  soundEffect?: boolean;
  hapticFeedback?: boolean;

  transparency?: number;    // 0~1
  blurIntensity?: number;   // px
  glowIntensity?: number;   // px
  glowColor?: string;       // css color
};

/** 👉 Action은 ButtonProps에 ActionExtras를 더한 *같은* 분기형 union을 그대로 사용 */
export type ActionProps = ButtonProps & ActionExtras;

type AnchorEl = HTMLAnchorElement;
type ButtonEl = HTMLButtonElement;
type AnchorOrButton = AnchorEl | ButtonEl;

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

export const Action = React.forwardRef<AnchorOrButton, ActionProps>(
  (
    {
      className,
      children,
      actionType = "primary",
      feedback = "ripple",
      particleEffect = false,
      rippleEffect = false,
      soundEffect = false,
      hapticFeedback = false,
      transparency = 1,
      blurIntensity = 0,
      glowIntensity = 0,
      glowColor = "rgba(91,140,255,.8)",
      loading = false,
      iconOnly = false,
      disabled,
      ...rest
    },
    ref
  ) => {
    const reduced = useReducedMotion();

    const runEffects = React.useCallback(() => {
      if (hapticFeedback && isBrowser && "vibrate" in navigator && !reduced) {
        try { navigator.vibrate?.(30); } catch {}
      }
      if (soundEffect && !reduced) {
        // TODO: lazy load & play
      }
      if (rippleEffect && !reduced) {
        // TODO: data-ripple 토글
      }
      if (particleEffect && !reduced) {
        // TODO: spawn particles
      }
    }, [hapticFeedback, soundEffect, rippleEffect, particleEffect, reduced]);

    const styleVars = React.useMemo<React.CSSProperties>(() => ({
      "--action-opacity": String(transparency),
      "--action-blur": `${blurIntensity}px`,
      "--action-glow-size": `${glowIntensity}px`,
      "--action-glow-color": glowColor,
    }) as React.CSSProperties, [transparency, blurIntensity, glowIntensity, glowColor]);

    const cls = React.useMemo(
      () =>
        merge(
          "hua-action relative inline-flex items-center rounded-xl px-4 py-2 font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          loading && "cursor-wait opacity-80",
          iconOnly && "justify-center",
          className
        ),
      [className, loading, iconOnly]
    );

    /** 분기 1) href가 있으면 앵커 브랜치 */
    if ("href" in rest && rest.href) {
      const { onClick, href, ...anchorRest } = rest as Extract<ButtonProps, { href: string }>;

      const handleClick: React.MouseEventHandler<AnchorEl> = (e) => {
        if (disabled || loading) { e.preventDefault(); e.stopPropagation(); return; }
        runEffects();
        onClick?.(e);
      };

      return (
        <Button
          ref={ref as React.Ref<AnchorEl>}
          href={href}
          className={cls}
          style={styleVars}
          onClick={handleClick}
          aria-busy={loading || undefined}
          aria-label={iconOnly ? (anchorRest["aria-label"] as string) : undefined}
          data-action={actionType}
          data-feedback={feedback}
          data-reduced-motion={reduced ? "true" : "false"}
          disabled={disabled}
          {...anchorRest}
        >
          {children}
        </Button>
      );
    }

    /** 분기 2) 기본 버튼 브랜치 */
    const { onClick, ...btnRest } = rest as Extract<ButtonProps, { href?: undefined }>;

    const handleClick: React.MouseEventHandler<ButtonEl> = (e) => {
      if (disabled || loading) return;
      runEffects();
      onClick?.(e);
    };

    return (
      <Button
        ref={ref as React.Ref<ButtonEl>}
        className={cls}
        style={styleVars}
        onClick={handleClick}
        disabled={disabled}
        aria-busy={loading || undefined}
        aria-label={iconOnly ? (btnRest["aria-label"] as string) : undefined}
        data-action={actionType}
        data-feedback={feedback}
        data-reduced-motion={reduced ? "true" : "false"}
        {...btnRest}
      >
        {children}
      </Button>
    );
  }
);

Action.displayName = "Action";
