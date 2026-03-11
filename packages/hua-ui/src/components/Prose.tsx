"use client";

import React, { useMemo } from "react";
import { dot as dotFn } from "@hua-labs/dot";
import { useDotEnv } from "../hooks/useDotEnv";
import { mergeStyles } from "../hooks/useDotMap";

type ProseElement =
  | "div"
  | "article"
  | "section"
  | "main"
  | "aside"
  | "nav"
  | "header"
  | "footer";

export interface ProseProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "className"
> {
  /** Semantic HTML element to render */
  as?: ProseElement;
  /** Typography size scale */
  size?: "sm" | "base" | "lg";
  /** Text color variant */
  color?: "default" | "gray";
  /** Additional dot utility styles */
  dot?: string;
  children?: React.ReactNode;
}

/**
 * Prose — Rich content typography container
 *
 * Provides consistent typography styling for markdown-like content
 * (headings, paragraphs, lists, blockquotes, code, tables) using
 * CSS variables for automatic light/dark theme support.
 *
 * No Tailwind typography plugin required.
 *
 * @remarks
 * Requires the prose CSS file to be imported in your app:
 * ```tsx
 * import '@hua-labs/ui/styles/prose.css';
 * ```
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Prose>
 *   <h1>Title</h1>
 *   <p>Paragraph text...</p>
 * </Prose>
 *
 * // With size and dot prop
 * <Prose size="lg" dot="mt-4">
 *   <h2>Section</h2>
 *   <p>Content</p>
 * </Prose>
 *
 * // Gray color variant
 * <Prose color="gray">
 *   <p>Muted text content</p>
 * </Prose>
 * ```
 */
const Prose = React.forwardRef<HTMLElement, ProseProps>(
  (
    {
      as: Tag = "div",
      size = "base",
      color = "default",
      dot: dotProp,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const env = useDotEnv();
    const computedStyle = useMemo(
      () =>
        mergeStyles(
          dotProp ? (dotFn(dotProp, env) as React.CSSProperties) : {},
          style,
        ),
      [dotProp, env, style],
    );

    // Destructure className from props to prevent it from overriding hua-prose
    const { className: _className, ...safeProps } = props as Record<
      string,
      unknown
    >;

    return (
      <Tag
        ref={ref as React.Ref<never>}
        {...safeProps}
        className="hua-prose"
        data-prose-size={size !== "base" ? size : undefined}
        data-prose-color={color !== "default" ? color : undefined}
        style={computedStyle}
      >
        {children}
      </Tag>
    );
  },
);
Prose.displayName = "Prose";

export { Prose };
