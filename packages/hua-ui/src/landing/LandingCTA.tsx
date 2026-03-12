"use client";

import React, { useMemo } from "react";
import { dot } from "@hua-labs/dot";
import { dotCSS } from "@hua-labs/dot/class";
import { mergeStyles } from "../hooks/useDotMap";
import { Container } from "../components/Container";
import { AnimatedGradient } from "../components/advanced/AnimatedGradient";
import { useLandingTheme } from "./LandingProvider";
import type { LandingCTAProps, LandingMotionOverride } from "./types";

function getInitialTransform(type: string): string {
  switch (type) {
    case "slideUp":
      return "translateY(32px)";
    case "slideLeft":
      return "translateX(-32px)";
    case "slideRight":
      return "translateX(32px)";
    case "scaleIn":
      return "scale(0.95)";
    case "bounceIn":
      return "scale(0.75)";
    default:
      return "none";
  }
}

interface ScrollRevealResult {
  ref: React.RefObject<HTMLElement | null>;
  style: React.CSSProperties;
  isVisible: boolean;
}

interface ScrollRevealOptions {
  motionType?: string;
  duration?: number;
  delay?: number;
}

let useScrollReveal:
  | ((opts: ScrollRevealOptions) => ScrollRevealResult)
  | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useScrollReveal = require("@hua-labs/motion-core").useScrollReveal;
} catch {
  // motion-core unavailable
}

export function LandingCTA({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  background: bgProp,
  gradientColors,
  motion: motionOverride,
  dot: dotProp,
  ...rest
}: LandingCTAProps) {
  const theme = useLandingTheme();
  const bg = bgProp ?? theme.cta.background;
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.cta.motion, ...motionOverride }
    : theme.cta.motion;

  const sectionCls = dotCSS(
    `relative overflow-hidden py-20 sm:py-28${bg === "dark" ? " bg-gray-950 text-white" : ""}${dotProp ? ` ${dotProp}` : ""}`,
  );
  const titleCls = dotCSS(
    "text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4",
  );
  const actionsCls = dotCSS(
    "flex flex-col sm:flex-row items-center justify-center gap-4",
  );

  const scrollReveal = useScrollReveal?.({
    motionType: motion.type as "fadeIn" | "slideUp" | "bounceIn",
    duration: motion.duration,
    delay: motion.delay,
  });

  const fallbackStyle = useMemo<React.CSSProperties>(() => {
    if (scrollReveal) return {};
    return {
      opacity: 0,
      transform: getInitialTransform(motion.type),
      animation: `landing-cta-enter ${motion.duration}ms ${motion.easing} ${motion.delay}ms forwards`,
    };
  }, [scrollReveal, motion]);

  return (
    <section className={sectionCls.className} {...rest}>
      {/* Background */}
      {bg === "gradient-soft" && (
        <div
          style={{
            ...dot("absolute inset-0"),
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 15%, transparent) 0%, color-mix(in srgb, var(--color-accent-foreground) 10%, transparent) 100%)",
          }}
          aria-hidden="true"
        />
      )}
      {bg === "animated-gradient" && (
        <AnimatedGradient
          colors={gradientColors}
          type="mesh"
          dot="absolute inset-0 z-0"
          aria-hidden="true"
        />
      )}
      {bg === "dark" && (
        <div
          style={mergeStyles(dot("absolute inset-0"), {
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(120, 119, 198, 0.08), transparent)",
          })}
          aria-hidden="true"
        />
      )}

      <Container size="md" padding="none" centered dot="relative z-10 px-6">
        <div
          ref={scrollReveal?.ref as React.Ref<HTMLDivElement>}
          style={mergeStyles(
            dot("text-center"),
            scrollReveal?.style ?? fallbackStyle,
          )}
        >
          <h2 className={titleCls.className}>{title}</h2>

          {subtitle && (
            <p
              style={dot(
                "text-lg text-muted-foreground max-w-2xl mx-auto mb-8",
              )}
            >
              {subtitle}
            </p>
          )}

          {(primaryAction || secondaryAction) && (
            <div className={actionsCls.className}>
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>
      </Container>

      <style
        dangerouslySetInnerHTML={{
          __html: `${sectionCls.css}${titleCls.css}${actionsCls.css}@keyframes landing-cta-enter{to{opacity:1;transform:none}}`,
        }}
      />
    </section>
  );
}
