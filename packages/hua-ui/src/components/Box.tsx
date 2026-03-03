"use client"

import React, { useMemo } from "react"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

type BoxElement =
  | "div" | "section" | "article" | "aside" | "main" | "nav"
  | "header" | "footer" | "figure" | "figcaption" | "details" | "summary"
  | "fieldset" | "form" | "ol" | "ul" | "li"

export interface BoxProps extends Omit<React.HTMLAttributes<HTMLElement>, 'className'> {
  as?: BoxElement
  dot?: string
}

const Box = React.forwardRef<HTMLElement, BoxProps>(
  ({ as: Tag = "div", dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(resolveDot(dotProp), style),
      [dotProp, style],
    )

    return <Tag ref={ref as React.Ref<never>} style={computedStyle} {...props} />
  },
)
Box.displayName = "Box"

export { Box }
