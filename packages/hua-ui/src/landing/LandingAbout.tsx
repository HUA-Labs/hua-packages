"use client";

import React from "react";
import type { CSSProperties } from "react";
import { dot as dotFn } from "@hua-labs/dot";
import { dotCSS } from "@hua-labs/dot/class";
import { mergeStyles } from "../hooks/useDotMap";
import { Section } from "../components/Section";
import { Container } from "../components/Container";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon/Icon";
import { useLandingTheme } from "./LandingProvider";
import type { LandingAboutProps, LandingMotionOverride } from "./types";

const s = (input: string) => dotFn(input) as CSSProperties;

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

export function LandingAbout({
  name,
  role,
  bio,
  avatar,
  socialLinks,
  motion: motionOverride,
  dot: dotProp,
  ...rest
}: LandingAboutProps) {
  const theme = useLandingTheme();
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.hero.motion, ...motionOverride }
    : theme.hero.motion;

  const scrollReveal = useScrollReveal?.({
    motionType: motion.type as "fadeIn" | "slideUp",
    duration: motion.duration,
    delay: motion.delay,
  });

  const fallbackStyle: React.CSSProperties = scrollReveal
    ? {}
    : {
        opacity: 0,
        transform: motion.type === "slideUp" ? "translateY(32px)" : "none",
        animation: `landing-about-enter ${motion.duration}ms ${motion.easing} ${motion.delay}ms forwards`,
      };

  const avatarCls = dotCSS("w-32 h-32 md:w-40 md:h-40");

  return (
    <Section dot={dotProp} {...rest}>
      <Container size="lg" padding="none" centered>
        <div
          ref={scrollReveal?.ref as React.Ref<HTMLDivElement>}
          style={mergeStyles(
            scrollReveal?.style ?? fallbackStyle,
            s("flex flex-col items-center gap-8"),
          )}
        >
          {/* Avatar */}
          {avatar && (
            <div className={avatarCls.className} style={{ flexShrink: 0 }}>
              <Avatar size="lg" src={avatar} alt={name} dot="w-full h-full" />
            </div>
          )}

          {/* Text Content */}
          <div style={s("flex-1 text-center")}>
            <h2 style={s("text-3xl font-bold mb-2")}>{name}</h2>
            <p style={s("text-xl text-muted-foreground mb-4")}>{role}</p>
            <div style={s("leading-relaxed mb-6")}>
              {typeof bio === "string" ? <p>{bio}</p> : bio}
            </div>

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div style={s("flex gap-4 justify-center")}>
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={s("text-muted-foreground")}
                    aria-label={link.label}
                  >
                    <Icon name={link.icon as any} size={24} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>

      <style
        dangerouslySetInnerHTML={{
          __html: `${avatarCls.css}@keyframes landing-about-enter{to{opacity:1;transform:none}}`,
        }}
      />
    </Section>
  );
}
