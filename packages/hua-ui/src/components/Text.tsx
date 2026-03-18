"use client";

import React, { useMemo } from "react";
import { dot as dotFn } from "@hua-labs/dot";
import { useDotEnv } from "../hooks/useDotEnv";
import { mergeStyles } from "../hooks/useDotMap";

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
  ({ as: Tag = "span", dot: dotProp, style, ...props }, ref) => {
    const env = useDotEnv();
    const computedStyle = useMemo(
      () =>
        mergeStyles(
          TAG_DEFAULTS[Tag] ?? {},
          dotProp ? (dotFn(dotProp, env) as React.CSSProperties) : {},
          style,
        ),
      [Tag, dotProp, env, style],
    );

    return (
      <Tag ref={ref as React.Ref<never>} style={computedStyle} {...props} />
    );
  },
);
Text.displayName = "Text";

export { Text };
