"use client";

import React, { useMemo } from "react";
import { dot as dotFn } from "@hua-labs/dot";
import { dotClass } from "@hua-labs/dot/class";
import { useDotEnv } from "../hooks/useDotEnv";
import { mergeStyles } from "../hooks/useDotMap";
import { joinWebClassNames } from "../lib/web-classname";

type TextElement =
  | "span"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "label"
  | "em"
  | "strong"
  | "small"
  | "s"
  | "mark"
  | "abbr"
  | "time"
  | "code"
  | "pre"
  | "blockquote"
  | "cite"
  | "q";

export interface TextProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "className"
> {
  as?: TextElement;
  dot?: string;
  /** CSS-rule features: responsive (sm:, md:), state (hover:, focus:), pseudo-elements */
  classDot?: string;
  /** Opaque Web class bytes. No Dot parsing or utility conflict resolution. */
  className?: string;
  /** Remove Text-owned tag visuals while preserving dot and style. */
  unstyled?: boolean;
  /** For as="label" — associates the label with a form control */
  htmlFor?: string;
}

/** Default line-height / letter-spacing by tag — overridable via dot or style props */
const TAG_DEFAULTS: Partial<Record<TextElement, React.CSSProperties>> = {
  p: { lineHeight: "1.625" },
  h1: { lineHeight: "1.25", letterSpacing: "-0.025em" },
  h2: { lineHeight: "1.25", letterSpacing: "-0.025em" },
  h3: { lineHeight: "1.375" },
};

const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Tag = "span",
      dot: dotProp,
      classDot,
      className,
      unstyled = false,
      style,
      ...props
    },
    ref,
  ) => {
    const env = useDotEnv();
    const computedStyle = useMemo(
      () =>
        mergeStyles(
          unstyled ? {} : (TAG_DEFAULTS[Tag] ?? {}),
          dotProp ? (dotFn(dotProp, env) as React.CSSProperties) : {},
          style,
        ),
      [Tag, dotProp, env, style, unstyled],
    );
    const classDotName = useMemo(
      () => (classDot ? dotClass(classDot) : undefined),
      [classDot],
    );
    const composedClassName = useMemo(
      () => joinWebClassNames(classDotName, className),
      [classDotName, className],
    );

    return (
      <Tag
        ref={ref as React.Ref<never>}
        className={composedClassName}
        style={computedStyle}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export { Text };
