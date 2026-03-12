"use client";

import React from "react";
import { dot } from "@hua-labs/dot";
import { dotCSS } from "@hua-labs/dot/class";
import { Section } from "../components/Section";
import { Container } from "../components/Container";
import { useLandingTheme } from "./LandingProvider";
import type { LandingShowcaseProps, LandingMotionOverride } from "./types";

interface StaggerResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  styles: React.CSSProperties[];
  isVisible: boolean;
}
interface StaggerOptions {
  count: number;
  staggerDelay?: number;
  duration?: number;
  motionType?: string;
  easing?: string;
}

let useStagger: ((opts: StaggerOptions) => StaggerResult) | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useStagger = require("@hua-labs/motion-core").useStagger;
} catch {
  // motion-core unavailable
}

export function LandingShowcase({
  items,
  title,
  subtitle,
  motion: motionOverride,
  staggerDelay: staggerProp,
  dot: dotProp,
  ...rest
}: LandingShowcaseProps) {
  const theme = useLandingTheme();
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.showcase.motion, ...motionOverride }
    : theme.showcase.motion;
  const staggerDelay = staggerProp ?? theme.showcase.staggerDelay;

  const containerCls = dotCSS("space-y-16 sm:space-y-24");
  const itemEvenCls = dotCSS("flex flex-col md:flex-row gap-8 items-center");
  const itemOddCls = dotCSS(
    "flex flex-col md:flex-row-reverse gap-8 items-center",
  );
  const titleCls = dotCSS("text-2xl sm:text-3xl font-bold");

  const stagger = useStagger?.({
    count: items.length,
    staggerDelay,
    duration: motion.duration,
    motionType: motion.type,
    easing: motion.easing,
  });

  const header =
    title || subtitle ? { title: title ?? "", subtitle } : undefined;

  return (
    <Section header={header} dot={dotProp} {...rest}>
      <div ref={stagger?.containerRef} className={containerCls.className}>
        {items.map((item, i) => {
          const isEven = i % 2 === 0;
          return (
            <Container key={i} size="lg" padding="none" dot="px-4">
              <div
                className={
                  isEven ? itemEvenCls.className : itemOddCls.className
                }
                style={stagger?.styles[i]}
              >
                {/* Image */}
                <div style={dot("flex-1 w-full")}>
                  <div
                    style={dot(
                      "relative overflow-hidden rounded-xl border border-border/30 shadow-lg",
                    )}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={dot("w-full h-auto object-cover")}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.2), transparent)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Text */}
                <div style={dot("flex-1 w-full space-y-4")}>
                  <h3 className={titleCls.className}>{item.title}</h3>
                  <p style={dot("text-muted-foreground leading-relaxed")}>
                    {item.description}
                  </p>
                </div>
              </div>
            </Container>
          );
        })}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `${containerCls.css}${itemEvenCls.css}${itemOddCls.css}${titleCls.css}`,
        }}
      />
    </Section>
  );
}
