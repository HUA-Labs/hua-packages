import React, { useMemo } from "react"
import { View } from "react-native"
import type { ViewProps } from "react-native"
import { resolveDot, mergeStyles } from "./useDotMap"
import type { RNStyleObject } from "./useDotMap"

export interface BoxProps extends Omit<ViewProps, "style"> {
  dot?: string
  style?: RNStyleObject | Record<string, unknown>
}

const Box = React.forwardRef<View, BoxProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(resolveDot(dotProp), style),
      [dotProp, style],
    )

    return <View ref={ref} style={computedStyle} {...props} />
  },
)
Box.displayName = "Box"

export { Box }
