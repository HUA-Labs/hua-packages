import React, { useMemo } from "react"
import { Pressable as RNPressable } from "react-native"
import type { PressableProps as RNPressableProps, View } from "react-native"
import { useDotMap, mergeStyles } from "./useDotMap"
import type { RNStyleObject } from "./useDotMap"

export interface PressableProps extends Omit<RNPressableProps, "style"> {
  dot?: string
  style?: RNStyleObject | Record<string, unknown>
}

const Pressable = React.forwardRef<View, PressableProps>(
  ({ dot: dotProp, style, disabled, ...props }, ref) => {
    const { style: dotStyle, handlers } = useDotMap(dotProp ?? "", {
      disabled: !!disabled,
    })

    const computedStyle = useMemo(
      () => mergeStyles(dotStyle, style),
      [dotStyle, style],
    )

    return (
      <RNPressable
        ref={ref}
        style={computedStyle}
        disabled={disabled}
        accessibilityState={disabled ? { disabled: true } : undefined}
        {...handlers}
        {...props}
      />
    )
  },
)
Pressable.displayName = "Pressable"

export { Pressable }
