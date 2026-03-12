"use client";

import React, { useMemo } from "react";
import { dotVariants, dot as dotFn } from "@hua-labs/dot";
import { dotCSS } from "@hua-labs/dot/class";
import { mergeStyles } from "../hooks/useDotMap";
import { Container, type ContainerProps } from "./Container";

const s = (input: string) => dotFn(input) as React.CSSProperties;

const spacingTokens: Record<string, string> = {
  none: "",
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-20 lg:py-24",
  lg: "py-20 sm:py-28",
  xl: "py-28 sm:py-36",
};

const bgTokens: Record<string, string> = {
  none: "",
  muted: "bg-[var(--color-muted)]/30",
  accent: "bg-[var(--color-accent)]/5",
  primary: "bg-[var(--color-primary)]/5",
};

export const sectionVariantStyles = dotVariants({
  base: "relative w-full",
  variants: {
    spacing: spacingTokens,
    background: bgTokens,
  },
  defaultVariants: { spacing: "lg", background: "none" },
});

export interface SectionHeaderConfig {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** section-line 데코레이터 표시 @default true */
  decorator?: boolean;
  /** 텍스트 정렬 @default 'center' */
  align?: "left" | "center";
}

export interface SectionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "className"
> {
  /** Container 사이즈 @default 'lg' */
  container?: ContainerProps["size"];
  /** Container 패딩 @default 'none' */
  containerPadding?: ContainerProps["padding"];
  /** 섹션 헤더 설정 */
  header?: SectionHeaderConfig;
  /** 풀위드 모드 (Container 없이 직접) */
  fullWidth?: boolean;
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  background?: "none" | "muted" | "accent" | "primary";
  dot?: string;
  style?: React.CSSProperties;
}

const sectionLineStyle: React.CSSProperties = {
  width: "80px",
  height: "3px",
  borderRadius: "9999px",
  background:
    "linear-gradient(90deg, var(--color-primary), var(--color-accent-foreground))",
  marginBottom: "1.5rem",
};

function SectionHeader({ config }: { config: SectionHeaderConfig }) {
  const isCenter = config.align !== "left";

  const wrapperStyle = useMemo(
    () =>
      mergeStyles(
        s("mb-16"),
        isCenter ? { textAlign: "center" as const } : undefined,
      ),
    [isCenter],
  );

  const decoratorStyle = useMemo(
    () =>
      mergeStyles(
        sectionLineStyle,
        isCenter ? { marginLeft: "auto", marginRight: "auto" } : undefined,
      ),
    [isCenter],
  );

  return (
    <div style={wrapperStyle}>
      {config.decorator !== false && (
        <div style={decoratorStyle} aria-hidden="true" />
      )}
      <h2 style={s("text-3xl md:text-5xl font-extrabold mb-4")}>
        {config.title}
      </h2>
      {config.subtitle && (
        <p
          style={mergeStyles(s("text-lg max-w-2xl mx-auto"), {
            color: "var(--color-muted-foreground)",
          })}
        >
          {config.subtitle}
        </p>
      )}
      {config.action && <div style={s("mt-6")}>{config.action}</div>}
    </div>
  );
}

/**
 * Section 컴포넌트
 *
 * 랜딩 페이지 섹션의 보일러플레이트를 줄이는 시맨틱 래퍼.
 * 내부적으로 Container를 사용하며, header prop으로 제목/부제/데코레이터를 자동 생성합니다.
 *
 * @example
 * <Section header={{ title: "제목", subtitle: "부제" }}>
 *   {children}
 * </Section>
 *
 * <Section spacing="xl" background="muted" fullWidth>
 *   {fullWidthContent}
 * </Section>
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      dot: dotProp,
      spacing,
      background,
      container = "lg",
      containerPadding = "none",
      header,
      fullWidth = false,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const sectionCls = useMemo(() => {
      const tokens = [
        "relative w-full px-6",
        spacingTokens[spacing ?? "lg"],
        dotProp,
      ]
        .filter(Boolean)
        .join(" ");
      return dotCSS(tokens);
    }, [spacing, dotProp]);

    const bgStyle = useMemo<React.CSSProperties | undefined>(() => {
      const key = background ?? "none";
      if (key === "none") return undefined;
      return dotFn(bgTokens[key]) as React.CSSProperties;
    }, [background]);

    const content = (
      <>
        {header && <SectionHeader config={header} />}
        {children}
      </>
    );

    return (
      <section
        ref={ref}
        className={sectionCls.className}
        style={mergeStyles(bgStyle, style)}
        {...props}
      >
        {fullWidth ? (
          content
        ) : (
          <Container size={container} padding={containerPadding} centered>
            {content}
          </Container>
        )}
        {sectionCls.css && (
          <style dangerouslySetInnerHTML={{ __html: sectionCls.css }} />
        )}
      </section>
    );
  },
);
Section.displayName = "Section";

export { Section };
