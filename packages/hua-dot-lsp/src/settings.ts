import type { DotTarget } from "@hua-labs/dot";

export interface DotLspSettings {
  target?: DotTarget;
}

export const DOT_TARGETS = ["web", "native", "flutter"] as const;

export function parseDotTarget(value: unknown): DotTarget | undefined {
  if (typeof value !== "string") return undefined;
  return DOT_TARGETS.includes(value as DotTarget)
    ? (value as DotTarget)
    : undefined;
}

export function readDotLspSettings(input: unknown): DotLspSettings {
  if (!input || typeof input !== "object") return {};

  const record = input as Record<string, unknown>;
  const directTarget = parseDotTarget(record.target);
  if (directTarget) return { target: directTarget };

  const dot = record.dot;
  if (dot && typeof dot === "object") {
    const nestedTarget = parseDotTarget(
      (dot as Record<string, unknown>).target,
    );
    if (nestedTarget) return { target: nestedTarget };
  }

  return {};
}
