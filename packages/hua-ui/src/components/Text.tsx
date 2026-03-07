"use client"

import React, { useMemo } from "react"
import { dot as dotFn } from "@hua-labs/dot"
import { useDotEnv } from "../hooks/useDotEnv"
import { mergeStyles } from "../hooks/useDotMap"

type TextElement =
  | "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "label" | "em" | "strong" | "small" | "s" | "mark" | "abbr"
  | "time" | "code" | "pre" | "blockquote" | "cite" | "q"

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'className'> {
  as?: TextElement
  dot?: string
  /** For as="label" — associates the label with a form control */
  htmlFor?: string
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Tag = "span", dot: dotProp, style, ...props }, ref) => {
    const env = useDotEnv()
    const computedStyle = useMemo(
      () => mergeStyles(dotProp ? dotFn(dotProp, env) as React.CSSProperties : {}, style),
      [dotProp, env, style],
    )

    return <Tag ref={ref as React.Ref<never>} style={computedStyle} {...props} />
  },
)
Text.displayName = "Text"

export { Text }
