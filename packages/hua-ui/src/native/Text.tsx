import React, { useMemo } from "react"
import { Text as RNText } from "react-native"
import type { TextProps as RNTextProps } from "react-native"
import { resolveDot, mergeStyles } from "./useDotMap"
import type { RNStyleObject } from "./useDotMap"

export interface TextProps extends Omit<RNTextProps, "style"> {
  dot?: string
  style?: RNStyleObject | Record<string, unknown>
}

const Text = React.forwardRef<RNText, TextProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const resolved = useMemo(() => resolveDot(dotProp), [dotProp])

    // adaptNative converts WebkitLineClamp → numberOfLines
    // Extract it from style since it's a prop, not a style property in RN
    const numberOfLines =
      props.numberOfLines ??
      (resolved.numberOfLines as number | undefined)

    const computedStyle = useMemo(() => {
      if (resolved.numberOfLines != null) {
        const { numberOfLines: _, ...rest } = resolved
        return mergeStyles(rest, style)
      }
      return mergeStyles(resolved, style)
    }, [resolved, style])

    return (
      <RNText
        ref={ref}
        style={computedStyle}
        numberOfLines={numberOfLines}
        {...props}
      />
    )
  },
)
Text.displayName = "Text"

export { Text }
