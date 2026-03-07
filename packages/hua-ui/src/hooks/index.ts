// Motion & Interaction Hooks
// 모션 & 인터랙션 훅

export { useInView } from "./useInView";
export type { UseInViewOptions, UseInViewReturn } from "./useInView";

export { useScrollProgress } from "./useScrollProgress";
export type { UseScrollProgressOptions, UseScrollProgressReturn } from "./useScrollProgress";

export { useMouse } from "./useMouse";
export type { UseMouseOptions, UseMouseReturn } from "./useMouse";

export { useReducedMotion } from "./useReducedMotion";

export { useWindowSize } from "./useWindowSize";
export type { UseWindowSizeOptions, UseWindowSizeReturn } from "./useWindowSize";

export { useAnimatedEntrance } from "./useAnimatedEntrance";
export type { UseAnimatedEntranceOptions, UseAnimatedEntranceReturn } from "./useAnimatedEntrance";

// Dot environment hooks
export { useBreakpoint } from "./useBreakpoint";
export { useDotEnv } from "./useDotEnv";
export { useDotMap, mergeStyles, resolveDot } from "./useDotMap";
export type { DotStyleMap, StyleObject } from "./useDotMap";
