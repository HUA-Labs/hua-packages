/**
 * SDUI (Server-Driven UI) Module
 *
 * JSON 스키마로 UI를 동적으로 렌더링하는 시스템
 *
 * @example
 * ```tsx
 * import { SDUIRenderer } from "@hua-labs/ui/sdui";
 *
 * const schema = {
 *   type: "Card",
 *   props: { className: "p-4" },
 *   children: [
 *     { type: "Heading", props: { level: 2 }, children: "Hello SDUI!" },
 *     { type: "Text", children: "Welcome, {{ user.name }}!" }
 *   ]
 * };
 *
 * <SDUIRenderer
 *   schema={schema}
 *   data={{ user: { name: "John" } }}
 * />
 * ```
 */

// Types
export type {
  SDUINode,
  SDUIPageSchema,
  SDUICondition,
  SDUIAction,
  SDUIEventHandlers,
  SDUIContext,
  SDUIRendererProps,
  SDUIComponentRegistry,
  SDUIEachBinding,
  SDUIConstraints,
} from "./types";

// Core (platform-agnostic utilities)
export {
  getByPath,
  setByPath,
  evaluateCondition,
  resolveProps,
  resolveTextBindings,
  resolveDotString,
  iterateEach,
} from "./core";
export type { EachIterationItem } from "./core";

// Registry
export { defaultRegistry, extendRegistry, hasComponent } from "./registry";

// Renderer
export { SDUIRenderer, SDUIFromJSON, useSDUI } from "./SDUIRenderer";
