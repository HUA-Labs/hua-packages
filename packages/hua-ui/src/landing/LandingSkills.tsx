"use client";

import React from "react";
import { dot } from "@hua-labs/dot";
import { mergeStyles } from "../hooks/useDotMap";
import { Section } from "../components/Section";
import { Icon } from "../components/Icon/Icon";
import { Marquee } from "../components/advanced/Marquee";
import { useLandingTheme } from "./LandingProvider";
import type {
  LandingSkillsProps,
  LandingSkillItem,
  LandingMotionOverride,
} from "./types";

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

function getBarColor(level: number): string {
  if (level >= 90) return "bg-green-500";
  if (level >= 70) return "bg-blue-500";
  if (level >= 50) return "bg-yellow-500";
  return "bg-gray-500";
}

export function LandingSkills({
  items,
  title,
  subtitle,
  variant = "grid",
  motion: motionOverride,
  staggerDelay: staggerProp,
  className,
  ...rest
}: LandingSkillsProps) {
  const theme = useLandingTheme();
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.features.motion, ...motionOverride }
    : theme.features.motion;
  const staggerDelay = staggerProp ?? theme.features.staggerDelay;

  const stagger = useStagger?.({
    count: items.length,
    staggerDelay,
    duration: motion.duration,
    motionType: motion.type,
    easing: motion.easing,
  });

  const header =
    title || subtitle ? { title: title ?? "", subtitle } : undefined;

  // Marquee variant
  if (variant === "marquee") {
    return (
      <Section header={header} dot={className} {...rest}>
        <Marquee speed={50} pauseOnHover gradient>
          {items.map((item, i) => (
            <div
              key={i}
              style={dot("w-40 shrink-0 flex items-center gap-3 px-4 py-2")}
            >
              {item.icon && <Icon name={item.icon as any} size={24} />}
              <span style={dot("font-medium")}>{item.name}</span>
            </div>
          ))}
        </Marquee>
      </Section>
    );
  }

  // Grid variant
  if (variant === "grid") {
    return (
      <Section header={header} dot={className} {...rest}>
        <div
          ref={stagger?.containerRef}
          style={dot("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6")}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                ...dot(
                  "flex flex-col items-center gap-3 p-6 bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl hover:shadow-lg transition-shadow",
                ),
                ...stagger?.styles[i],
              }}
            >
              {item.icon && (
                <Icon name={item.icon as any} size={32} variant="primary" />
              )}
              <span style={dot("font-semibold text-center")}>{item.name}</span>
              {item.category && (
                <span style={dot("text-xs text-muted-foreground")}>
                  {item.category}
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>
    );
  }

  // Bars variant
  return (
    <Section header={header} dot={className} {...rest}>
      <div
        ref={stagger?.containerRef}
        style={dot("space-y-6 max-w-3xl mx-auto")}
      >
        {items.map((item, i) => {
          const level = item.level ?? 100;
          return (
            <div key={i} style={{ ...dot("space-y-2"), ...stagger?.styles[i] }}>
              <div style={dot("flex justify-between items-center")}>
                <div style={dot("flex items-center gap-2")}>
                  {item.icon && <Icon name={item.icon as any} size={20} />}
                  <span style={dot("font-semibold")}>{item.name}</span>
                </div>
                <span style={dot("text-sm text-muted-foreground")}>
                  {level}%
                </span>
              </div>
              <div style={dot("h-2 bg-secondary rounded-full overflow-hidden")}>
                <div
                  style={mergeStyles(
                    dot(
                      `h-full rounded-full transition-all duration-1000 ${getBarColor(level)}`,
                    ),
                    {
                      width: `${level}%`,
                      animation: "skill-bar-fill 1s ease-out forwards",
                    },
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes skill-bar-fill {
          from { width: 0; }
        }
      `,
        }}
      />
    </Section>
  );
}
