/**
 * Shared hover style utilities for HUA-UI components
 */

import type { CSSProperties } from "react";

/** Form input hover style (Input, Select, Textarea) */
export const FORM_HOVER: CSSProperties = {
  borderColor: "var(--color-accent-foreground)",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
};

/** Control hover border — unchecked Checkbox */
export const CONTROL_HOVER_BORDER: CSSProperties = {
  borderColor: "var(--color-foreground)",
};
