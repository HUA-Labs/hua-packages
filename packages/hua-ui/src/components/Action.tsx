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

/**
 * Action 컴포넌트의 props / Action component props
 * @typedef {Object} ActionProps
 * @property {ActionKind} [actionType="primary"] - Action 타입 / Action type
 * @property {FeedbackKind} [feedback="ripple"] - 피드백 타입 / Feedback type
 * @property {boolean} [particleEffect=false] - 파티클 효과 활성화 / Enable particle effect
 * @property {boolean} [rippleEffect=false] - 리플 효과 활성화 / Enable ripple effect
 * @property {boolean} [soundEffect=false] - 사운드 효과 활성화 / Enable sound effect
 * @property {boolean} [hapticFeedback=false] - 햅틱 피드백 활성화 / Enable haptic feedback
 * @property {number} [transparency=1] - 투명도 (0-1) / Transparency (0-1)
 * @property {number} [blurIntensity=0] - blur 강도 (px) / Blur intensity (px)
 * @property {number} [glowIntensity=0] - 글로우 강도 (px) / Glow intensity (px)
 * @property {string} [glowColor="rgba(91,140,255,.8)"] - 글로우 색상 / Glow color
 * @extends {ButtonProps}
 */
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

/**
 * Action 컴포넌트 / Action component
 * 
 * 고급 효과를 가진 액션 버튼 컴포넌트입니다.
 * Button 컴포넌트를 기반으로 하며, 파티클, 리플, 사운드, 햅틱 피드백 등을 지원합니다.
 * 
 * Action button component with advanced effects.
 * Based on Button component, supports particle, ripple, sound, haptic feedback, etc.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Action>클릭</Action>
 * 
 * @example
 * // 고급 효과 / Advanced effects
 * <Action 
 *   actionType="magical"
 *   feedback="particle"
 *   particleEffect
 *   rippleEffect
 * >
 *   마법 버튼
 * </Action>
 * 
 * @param {ActionProps} props - Action 컴포넌트의 props / Action component props
 * @param {React.Ref<AnchorOrButton>} ref - button 또는 anchor 요소 ref / button or anchor element ref
 * @returns {JSX.Element} Action 컴포넌트 / Action component
 */
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

    const runEffects = React.useCallback((event: React.MouseEvent) => {
      if (hapticFeedback && isBrowser && "vibrate" in navigator && !reduced) {
        try { navigator.vibrate?.(30); } catch { /* ignore */ }
      }
      
      if (soundEffect && !reduced && isBrowser) {
        // 간단한 클릭 사운드 효과 (선택적)
        try {
          const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (!AudioContextClass) return;
          const audioContext = new AudioContextClass();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        } catch {
          // 오디오 컨텍스트를 지원하지 않는 환경에서는 무시
        }
      }
      
      if (rippleEffect && !reduced && event.currentTarget) {
        // Ripple 효과: 클릭 위치에 원형 애니메이션 생성
        const button = event.currentTarget as HTMLElement;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          width: ${size}px;
          height: ${size}px;
          left: ${x - size / 2}px;
          top: ${y - size / 2}px;
          pointer-events: none;
          animation: ripple-animation 0.6s ease-out;
        `;
        
        // CSS 애니메이션 정의 (한 번만)
        if (!document.getElementById('ripple-animation-style')) {
          const style = document.createElement('style');
          style.id = 'ripple-animation-style';
          style.textContent = `
            @keyframes ripple-animation {
              to {
                transform: scale(4);
                opacity: 0;
              }
            }
          `;
          document.head.appendChild(style);
        }
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
      
      if (particleEffect && !reduced && event.currentTarget) {
        // 간단한 파티클 효과: 클릭 위치에서 작은 원들이 퍼져나감
        const button = event.currentTarget as HTMLElement;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        for (let i = 0; i < 5; i++) {
          const particle = document.createElement('span');
          const angle = (Math.PI * 2 * i) / 5;
          const velocity = 30 + Math.random() * 20;
          const vx = Math.cos(angle) * velocity;
          const vy = Math.sin(angle) * velocity;
          
          particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: ${glowColor || 'rgba(91,140,255,0.8)'};
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            animation: particle-animation-${i} 0.5s ease-out forwards;
          `;
          
          // CSS 애니메이션 정의
          if (!document.getElementById(`particle-animation-${i}`)) {
            const style = document.createElement('style');
            style.id = `particle-animation-${i}`;
            style.textContent = `
              @keyframes particle-animation-${i} {
                to {
                  transform: translate(${vx}px, ${vy}px) scale(0);
                  opacity: 0;
                }
              }
            `;
            document.head.appendChild(style);
          }
          
          button.style.position = 'relative';
          button.appendChild(particle);
          
          setTimeout(() => {
            particle.remove();
          }, 500);
        }
      }
    }, [hapticFeedback, soundEffect, rippleEffect, particleEffect, reduced, glowColor]);

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
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
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
        runEffects(e);
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
      runEffects(e);
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
