// Page-level orchestration (Stage 2)
export { usePageMotions } from '../hooks/usePageMotions';
export { useMotionOrchestra } from '../hooks/useMotionOrchestra';
export { useOrchestration } from '../hooks/useOrchestration';
export { useLayoutMotion, createLayoutTransition } from '../hooks/useLayoutMotion';
export { useSequence } from '../hooks/useSequence';
export { useToggleMotion } from '../hooks/useToggleMotion';

export type {
  PageType,
  MotionType,
  EntranceType,
  MotionElement,
  PageMotionElement,
  PageMotionsConfig,
  OrchestrationOptions,
  OrchestrationConfig,
} from '../types';

export { MotionStateManager } from '../managers/MotionStateManager';

