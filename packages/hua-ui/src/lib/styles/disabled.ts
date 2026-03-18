/**
 * Shared disabled styles for HUA-UI components
 *
 * Two patterns:
 * - DISABLED_INTERACTIVE: For custom interactive elements (Button, Toggle)
 *   Uses pointerEvents:none because there's no native disabled attribute.
 * - DISABLED_INPUT: For native form elements (Input, Select, Textarea, Checkbox, Radio, Switch)
 *   Uses cursor:not-allowed because the browser's native disabled attribute handles event blocking.
 */

import type { CSSProperties } from "react";

/** Button, Toggle — no native disabled, block events via pointerEvents */
export const DISABLED_INTERACTIVE: CSSProperties = {
  pointerEvents: "none",
  opacity: 0.5,
};

/** Form elements — native disabled blocks events, show not-allowed cursor */
export const DISABLED_INPUT: CSSProperties = {
  cursor: "not-allowed",
  opacity: 0.5,
};
