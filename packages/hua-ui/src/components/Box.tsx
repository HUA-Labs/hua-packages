"use client";

import React, { useMemo } from "react";
import { dot as dotFn } from "@hua-labs/dot";
import { dotClass } from "@hua-labs/dot/class";
import { useDotEnv } from "../hooks/useDotEnv";
import { mergeStyles } from "../hooks/useDotMap";
import { joinWebClassNames } from "../lib/web-classname";

type BoxElement =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "main"
  | "nav"
  | "header"
  | "footer"
  | "figure"
  | "figcaption"
  | "details"
  | "summary"
  | "fieldset"
  | "form"
  | "ol"
  | "ul"
  | "li";

export interface BoxProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "className"
> {
  as?: BoxElement;
  dot?: string;
  /** CSS-rule features: responsive (sm:, md:), state (hover:, focus:), pseudo-elements */
  classDot?: string;
  /** Opaque Web class bytes. No Dot parsing or utility conflict resolution. */
  className?: string;
}

const Box = React.forwardRef<HTMLElement, BoxProps>(
  (
    { as: Tag = "div", dot: dotProp, classDot, className, style, ...props },
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
Box.displayName = "Box";

export { Box };
