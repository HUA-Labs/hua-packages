import { describe, expect, it } from "vitest";
import { dot, dotExplain } from "../index";
import type { CapabilityLevel, DotTarget } from "../types";

type TargetContractBehavior =
  | "style-output"
  | "metadata-output"
  | "no-output"
  | "unsupported-dropped"
  | "unsupported-recipe-only"
  | "approximate-reported"
  | "runtime-fallback"
  | "plugin-backed";

type ContractCase = {
  name: string;
  input: string;
  target: DotTarget;
  behaviors: TargetContractBehavior[];
  present?: string[];
  absent?: string[];
  dropped?: string[];
  approximated?: string[];
  capabilities?: Record<string, CapabilityLevel>;
  noCapabilities?: string[];
};

function getPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (
      current &&
      typeof current === "object" &&
      Object.prototype.hasOwnProperty.call(current, segment)
    ) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, value);
}

function expectPathsDefined(value: unknown, paths: string[]): void {
  for (const path of paths) {
    expect(getPath(value, path), path).toBeDefined();
  }
}

function expectPathsUndefined(value: unknown, paths: string[]): void {
  for (const path of paths) {
    expect(getPath(value, path), path).toBeUndefined();
  }
}

function expectReportEntries(
  actual: string[] | undefined,
  expected: string[] | undefined,
): void {
  if (!expected) return;
  for (const prop of expected) {
    expect(actual ?? []).toContain(prop);
  }
}

function expectCapabilities(
  actual: Record<string, CapabilityLevel> | undefined,
  expected: Record<string, CapabilityLevel>,
  absent: string[],
): void {
  for (const [prop, capability] of Object.entries(expected)) {
    expect(actual?.[prop]).toBe(capability);
  }

  for (const prop of absent) {
    expect(actual ?? {}).not.toHaveProperty(prop);
  }
}

function expectBehaviorDeclared(
  contractCase: ContractCase,
  styles: Record<string, unknown>,
  report: Record<string, unknown>,
): void {
  const {
    behaviors,
    present = [],
    dropped = [],
    approximated = [],
  } = contractCase;
  const capabilityLevels = Object.values(contractCase.capabilities ?? {});
  const styleOutputPaths = present.filter((path) => !path.startsWith("_"));
  const metadataOutputPaths = present.filter((path) => path.startsWith("_"));

  if (behaviors.includes("style-output")) {
    expect(
      styleOutputPaths.length,
      `${contractCase.name} style output paths`,
    ).toBeGreaterThan(0);
  }

  if (behaviors.includes("metadata-output")) {
    expect(
      metadataOutputPaths.length,
      `${contractCase.name} metadata output paths`,
    ).toBeGreaterThan(0);
  }

  if (behaviors.includes("no-output")) {
    expect(present, `${contractCase.name} present paths`).toHaveLength(0);
    expect(dropped, `${contractCase.name} dropped props`).toHaveLength(0);
    expect(
      approximated,
      `${contractCase.name} approximated props`,
    ).toHaveLength(0);
    expect(
      capabilityLevels,
      `${contractCase.name} capability report`,
    ).toHaveLength(0);
    expect(styles, `${contractCase.name} actual styles`).toEqual({});
    expect(report, `${contractCase.name} actual report`).toEqual({});
  }

  if (behaviors.includes("unsupported-dropped")) {
    expect(
      dropped.length,
      `${contractCase.name} dropped props`,
    ).toBeGreaterThan(0);
    expect(
      capabilityLevels,
      `${contractCase.name} unsupported capability`,
    ).toContain("unsupported");
  }

  if (behaviors.includes("unsupported-recipe-only")) {
    expect(
      capabilityLevels,
      `${contractCase.name} recipe-only capability`,
    ).toContain("recipe-only");
  }

  if (behaviors.includes("approximate-reported")) {
    expect(
      approximated.length,
      `${contractCase.name} approximated props`,
    ).toBeGreaterThan(0);
  }

  if (behaviors.includes("plugin-backed")) {
    expect(
      capabilityLevels,
      `${contractCase.name} plugin-backed capability`,
    ).toContain("plugin-backed");
  }
}

function expectTargetContract(contractCase: ContractCase): void {
  const {
    input,
    target,
    present = [],
    absent = [],
    dropped,
    approximated,
    capabilities = {},
    noCapabilities = [],
  } = contractCase;
  const direct = dot(input, { target });
  const explained = dotExplain(input, { target });

  expect(explained.styles).toEqual(direct);
  expectBehaviorDeclared(contractCase, explained.styles, explained.report);
  expectPathsDefined(explained.styles, present);
  expectPathsUndefined(explained.styles, absent);
  expectReportEntries(explained.report._dropped, dropped);
  expectReportEntries(explained.report._approximated, approximated);
  expectCapabilities(
    explained.report._capabilities,
    capabilities,
    noCapabilities,
  );

  if (target === "web") {
    expect(explained.report).toEqual({});
  }
}

const contractCases: ContractCase[] = [
  {
    name: "web keeps CSS-native gradient output with no caveat report",
    input: "p-4 bg-gradient-to-r from-red-500 to-blue-500",
    target: "web",
    behaviors: ["style-output"],
    present: ["padding", "backgroundImage"],
  },
  {
    name: "web keeps gradient color stop positions in CSS output",
    input: "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500",
    target: "web",
    behaviors: ["style-output"],
    present: ["backgroundImage"],
  },
  {
    name: "native drops composed gradient background image as unsupported",
    input: "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: ["backgroundImage"],
    dropped: ["backgroundImage"],
    capabilities: { backgroundImage: "unsupported" },
  },
  {
    name: "flutter preserves gradient stop positions in recipe output",
    input: "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500",
    target: "flutter",
    behaviors: ["style-output", "unsupported-recipe-only"],
    present: ["decoration.gradient.colors", "decoration.gradient.stops"],
    capabilities: { backgroundImage: "recipe-only" },
  },
  {
    name: "flutter drops CSS variable gradient stops without recipe overclaim",
    input: "bg-gradient-to-r from-[#ff0000] to-[var(--color-brand)]",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    dropped: ["backgroundImage"],
    capabilities: { backgroundImage: "unsupported" },
  },
  {
    name: "native preserves renderable shadow output while dropping ring geometry",
    input: "shadow-xl ring-2",
    target: "native",
    behaviors: ["style-output", "approximate-reported"],
    present: [
      "shadowColor",
      "shadowOffset",
      "shadowOpacity",
      "shadowRadius",
      "elevation",
    ],
    absent: ["boxShadow"],
    approximated: ["boxShadow"],
    capabilities: { boxShadow: "approximate" },
  },
  {
    name: "native ring-only geometry has no rendered shadow approximation",
    input: "ring-2",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: ["shadowColor", "shadowOffset", "shadowOpacity", "elevation"],
    dropped: ["boxShadow"],
    capabilities: { boxShadow: "unsupported" },
  },
  {
    name: "native ring color alone is not reported as a false approximation",
    input: "ring-blue-500",
    target: "native",
    behaviors: ["no-output"],
    absent: ["shadowColor", "shadowOffset", "shadowOpacity", "elevation"],
    noCapabilities: ["boxShadow"],
  },
  {
    name: "native arbitrary var() shadow drops instead of rendering black fallback",
    input: "shadow-[0_4px_6px_var(--shadow-color)]",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: ["shadowColor", "shadowOffset", "shadowOpacity", "elevation"],
    dropped: ["boxShadow"],
    capabilities: { boxShadow: "unsupported" },
  },
  {
    name: "native filter is unsupported and omitted",
    input: "p-4 blur-md",
    target: "native",
    behaviors: ["style-output", "unsupported-dropped"],
    present: ["padding"],
    absent: ["filter"],
    dropped: ["filter"],
    capabilities: { filter: "unsupported" },
  },
  {
    name: "web accumulates multiple filter utilities into CSS filter output",
    input: "blur-md brightness-150",
    target: "web",
    behaviors: ["style-output"],
    present: ["filter"],
  },
  {
    name: "web accumulates backdrop utilities into CSS backdropFilter output",
    input: "backdrop-blur-md backdrop-brightness-75",
    target: "web",
    behaviors: ["style-output"],
    present: ["backdropFilter"],
  },
  {
    name: "native backdrop filter is unsupported and omitted",
    input: "p-4 backdrop-blur-md",
    target: "native",
    behaviors: ["style-output", "unsupported-dropped"],
    present: ["padding"],
    absent: ["backdropFilter"],
    dropped: ["backdropFilter"],
    capabilities: { backdropFilter: "unsupported" },
  },
  {
    name: "flutter preserves gradient recipe output",
    input: "bg-gradient-to-r from-red-500 to-blue-500",
    target: "flutter",
    behaviors: ["style-output", "unsupported-recipe-only"],
    present: ["decoration.gradient"],
    dropped: [],
    capabilities: { backgroundImage: "recipe-only" },
  },
  {
    name: "flutter plugin-backed filter drop is explicit in explain output",
    input: "blur-md",
    target: "flutter",
    behaviors: ["metadata-output", "plugin-backed"],
    present: ["_dropped"],
    dropped: ["filter"],
    capabilities: { filter: "plugin-backed" },
  },
  {
    name: "flutter plugin-backed backdrop filter drop is explicit in explain output",
    input: "backdrop-blur-md",
    target: "flutter",
    behaviors: ["metadata-output", "plugin-backed"],
    present: ["_dropped"],
    dropped: ["backdropFilter"],
    capabilities: { backdropFilter: "plugin-backed" },
  },
  {
    name: "web overflow and object-fit utilities render as CSS styles without caveats",
    input: "overflow-hidden object-cover",
    target: "web",
    behaviors: ["style-output"],
    present: ["overflow", "objectFit"],
  },
  {
    name: "native object-fit maps to resizeMode with approximation caveat",
    input: "overflow-hidden object-cover",
    target: "native",
    behaviors: ["style-output", "approximate-reported"],
    present: ["overflow", "resizeMode"],
    absent: ["objectFit"],
    approximated: ["objectFit"],
    capabilities: { objectFit: "approximate" },
  },
  {
    name: "flutter object-fit remains recipe-only drop evidence",
    input: "object-cover",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-recipe-only"],
    present: ["_dropped"],
    absent: ["objectFit"],
    dropped: ["objectFit"],
    capabilities: { objectFit: "recipe-only" },
  },
  {
    name: "web object-position utilities render as CSS styles without caveats",
    input: "object-left-bottom",
    target: "web",
    behaviors: ["style-output"],
    present: ["objectPosition"],
  },
  {
    name: "native object-position is unsupported and omitted",
    input: "object-center",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: ["objectPosition"],
    dropped: ["objectPosition"],
    capabilities: { objectPosition: "unsupported" },
  },
  {
    name: "flutter object-position remains unsupported drop evidence",
    input: "object-center",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    absent: ["objectPosition"],
    dropped: ["objectPosition"],
    capabilities: { objectPosition: "unsupported" },
  },
  {
    name: "web overflow axis utilities render CSS styles without caveats",
    input: "overflow-x-auto overflow-y-hidden",
    target: "web",
    behaviors: ["style-output"],
    present: ["overflowX", "overflowY"],
  },
  {
    name: "native overflow axis utilities remain unsupported drop evidence",
    input: "overflow-x-auto overflow-y-hidden",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: ["overflowX", "overflowY"],
    dropped: ["overflowX", "overflowY"],
    capabilities: {
      overflowX: "unsupported",
      overflowY: "unsupported",
    },
  },
  {
    name: "flutter overflow axis utilities remain unsupported drop evidence",
    input: "overflow-x-auto overflow-y-hidden",
    target: "flutter",
    behaviors: ["unsupported-dropped"],
    absent: ["overflowX", "overflowY"],
    dropped: ["overflowX", "overflowY"],
    capabilities: {
      overflowX: "unsupported",
      overflowY: "unsupported",
    },
  },
  {
    name: "web scroll utilities render CSS styles without caveats",
    input: "scroll-smooth scroll-mt-4 scroll-px-2",
    target: "web",
    behaviors: ["style-output"],
    present: [
      "scrollBehavior",
      "scrollMarginTop",
      "scrollPaddingLeft",
      "scrollPaddingRight",
    ],
  },
  {
    name: "native scroll utilities remain unsupported drop evidence",
    input: "scroll-smooth scroll-mt-4 scroll-px-2",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: [
      "scrollBehavior",
      "scrollMarginTop",
      "scrollPaddingLeft",
      "scrollPaddingRight",
    ],
    dropped: [
      "scrollBehavior",
      "scrollMarginTop",
      "scrollPaddingLeft",
      "scrollPaddingRight",
    ],
    capabilities: {
      scrollBehavior: "unsupported",
      scrollMarginTop: "unsupported",
      scrollPaddingLeft: "unsupported",
      scrollPaddingRight: "unsupported",
    },
  },
  {
    name: "flutter scroll utilities remain unsupported drop evidence",
    input: "scroll-smooth scroll-mt-4 scroll-px-2",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    absent: [
      "scrollBehavior",
      "scrollMarginTop",
      "scrollPaddingLeft",
      "scrollPaddingRight",
    ],
    dropped: [
      "scrollBehavior",
      "scrollMarginTop",
      "scrollPaddingLeft",
      "scrollPaddingRight",
    ],
    capabilities: {
      scrollBehavior: "unsupported",
      scrollMarginTop: "unsupported",
      scrollPaddingLeft: "unsupported",
      scrollPaddingRight: "unsupported",
    },
  },
  {
    name: "web transition utilities render CSS styles without caveats",
    input: "transition-all duration-300 ease-in-out",
    target: "web",
    behaviors: ["style-output"],
    present: [
      "transitionProperty",
      "transitionDuration",
      "transitionTimingFunction",
    ],
  },
  {
    name: "native transition utilities remain unsupported drop evidence",
    input: "transition-all duration-300 ease-in-out",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: [
      "transitionProperty",
      "transitionDuration",
      "transitionTimingFunction",
    ],
    dropped: [
      "transitionProperty",
      "transitionDuration",
      "transitionTimingFunction",
    ],
    capabilities: {
      transitionProperty: "unsupported",
      transitionDuration: "unsupported",
      transitionTimingFunction: "unsupported",
    },
  },
  {
    name: "flutter transition utilities remain unsupported drop evidence",
    input: "transition-all duration-300 ease-in-out",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    absent: [
      "transitionProperty",
      "transitionDuration",
      "transitionTimingFunction",
    ],
    dropped: [
      "transitionProperty",
      "transitionDuration",
      "transitionTimingFunction",
    ],
    capabilities: {
      transitionProperty: "unsupported",
      transitionDuration: "unsupported",
      transitionTimingFunction: "unsupported",
    },
  },
  {
    name: "web animation utilities render CSS styles without caveats",
    input: "animate-spin",
    target: "web",
    behaviors: ["style-output"],
    present: ["animation"],
  },
  {
    name: "native animation utilities remain unsupported drop evidence",
    input: "animate-spin",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: ["animation"],
    dropped: ["animation"],
    capabilities: { animation: "unsupported" },
  },
  {
    name: "flutter animation utilities remain unsupported drop evidence",
    input: "animate-spin",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    absent: ["animation"],
    dropped: ["animation"],
    capabilities: { animation: "unsupported" },
  },
  {
    name: "web animation composition utilities render CSS styles without caveats",
    input: "animate-in fade-in-50 zoom-in-95",
    target: "web",
    behaviors: ["style-output"],
    present: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-opacity",
      "--tw-enter-scale",
    ],
  },
  {
    name: "native animation composition utilities remain unsupported drop evidence",
    input: "animate-in fade-in-50 zoom-in-95",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-opacity",
      "--tw-enter-scale",
    ],
    dropped: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-opacity",
      "--tw-enter-scale",
    ],
    capabilities: {
      animationName: "unsupported",
      animationDuration: "unsupported",
      animationTimingFunction: "unsupported",
      animationFillMode: "unsupported",
      "--tw-enter-opacity": "unsupported",
      "--tw-enter-scale": "unsupported",
    },
  },
  {
    name: "flutter animation composition utilities remain unsupported drop evidence",
    input: "animate-in fade-in-50 zoom-in-95",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    absent: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-opacity",
      "--tw-enter-scale",
    ],
    dropped: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-opacity",
      "--tw-enter-scale",
    ],
    capabilities: {
      animationName: "unsupported",
      animationDuration: "unsupported",
      animationTimingFunction: "unsupported",
      animationFillMode: "unsupported",
      "--tw-enter-opacity": "unsupported",
      "--tw-enter-scale": "unsupported",
    },
  },
  {
    name: "web animation exit composition utilities render CSS styles without caveats",
    input: "animate-out fade-out-0 zoom-out-95",
    target: "web",
    behaviors: ["style-output"],
    present: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-exit-opacity",
      "--tw-exit-scale",
    ],
  },
  {
    name: "native animation exit composition utilities remain unsupported drop evidence",
    input: "animate-out fade-out-0 zoom-out-95",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-exit-opacity",
      "--tw-exit-scale",
    ],
    dropped: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-exit-opacity",
      "--tw-exit-scale",
    ],
    capabilities: {
      animationName: "unsupported",
      animationDuration: "unsupported",
      animationTimingFunction: "unsupported",
      animationFillMode: "unsupported",
      "--tw-exit-opacity": "unsupported",
      "--tw-exit-scale": "unsupported",
    },
  },
  {
    name: "flutter animation exit composition utilities remain unsupported drop evidence",
    input: "animate-out fade-out-0 zoom-out-95",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    absent: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-exit-opacity",
      "--tw-exit-scale",
    ],
    dropped: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-exit-opacity",
      "--tw-exit-scale",
    ],
    capabilities: {
      animationName: "unsupported",
      animationDuration: "unsupported",
      animationTimingFunction: "unsupported",
      animationFillMode: "unsupported",
      "--tw-exit-opacity": "unsupported",
      "--tw-exit-scale": "unsupported",
    },
  },
  {
    name: "web animation enter slide composition utilities render CSS styles without caveats",
    input: "animate-in slide-in-from-top-2",
    target: "web",
    behaviors: ["style-output"],
    present: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-translate-y",
    ],
  },
  {
    name: "native animation enter slide composition utilities remain unsupported drop evidence",
    input: "animate-in slide-in-from-top-2",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-translate-y",
    ],
    dropped: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-translate-y",
    ],
    capabilities: {
      animationName: "unsupported",
      animationDuration: "unsupported",
      animationTimingFunction: "unsupported",
      animationFillMode: "unsupported",
      "--tw-enter-translate-y": "unsupported",
    },
  },
  {
    name: "flutter animation enter slide composition utilities remain unsupported drop evidence",
    input: "animate-in slide-in-from-top-2",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    absent: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-translate-y",
    ],
    dropped: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-enter-translate-y",
    ],
    capabilities: {
      animationName: "unsupported",
      animationDuration: "unsupported",
      animationTimingFunction: "unsupported",
      animationFillMode: "unsupported",
      "--tw-enter-translate-y": "unsupported",
    },
  },
  {
    name: "web animation exit slide composition utilities render CSS styles without caveats",
    input: "animate-out slide-out-to-right-2",
    target: "web",
    behaviors: ["style-output"],
    present: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-exit-translate-x",
    ],
  },
  {
    name: "native animation exit slide composition utilities remain unsupported drop evidence",
    input: "animate-out slide-out-to-right-2",
    target: "native",
    behaviors: ["unsupported-dropped"],
    absent: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-exit-translate-x",
    ],
    dropped: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-exit-translate-x",
    ],
    capabilities: {
      animationName: "unsupported",
      animationDuration: "unsupported",
      animationTimingFunction: "unsupported",
      animationFillMode: "unsupported",
      "--tw-exit-translate-x": "unsupported",
    },
  },
  {
    name: "flutter animation exit slide composition utilities remain unsupported drop evidence",
    input: "animate-out slide-out-to-right-2",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    absent: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-exit-translate-x",
    ],
    dropped: [
      "animationName",
      "animationDuration",
      "animationTimingFunction",
      "animationFillMode",
      "--tw-exit-translate-x",
    ],
    capabilities: {
      animationName: "unsupported",
      animationDuration: "unsupported",
      animationTimingFunction: "unsupported",
      animationFillMode: "unsupported",
      "--tw-exit-translate-x": "unsupported",
    },
  },
  {
    name: "web grid utilities render CSS grid output without caveats",
    input: "grid grid-cols-3 gap-4",
    target: "web",
    behaviors: ["style-output"],
    present: ["display", "gridTemplateColumns", "gap"],
  },
  {
    name: "native grid preserves gap while reporting display approximation and dropped columns",
    input: "grid grid-cols-3 gap-4",
    target: "native",
    behaviors: ["style-output", "approximate-reported", "unsupported-dropped"],
    present: ["gap"],
    absent: ["display", "gridTemplateColumns"],
    dropped: ["gridTemplateColumns"],
    approximated: ["display"],
    capabilities: {
      display: "approximate",
      gridTemplateColumns: "unsupported",
    },
  },
  {
    name: "native grid placement start/end fields are dropped consistently",
    input: "grid grid-cols-3 gap-4 col-start-2 row-start-2 col-end-4 row-end-4",
    target: "native",
    behaviors: ["style-output", "approximate-reported", "unsupported-dropped"],
    present: ["gap"],
    absent: [
      "display",
      "gridTemplateColumns",
      "gridColumnStart",
      "gridRowStart",
      "gridColumnEnd",
      "gridRowEnd",
    ],
    dropped: [
      "gridTemplateColumns",
      "gridColumnStart",
      "gridRowStart",
      "gridColumnEnd",
      "gridRowEnd",
    ],
    approximated: ["display"],
    capabilities: {
      display: "approximate",
      gridTemplateColumns: "unsupported",
      gridColumnStart: "unsupported",
      gridRowStart: "unsupported",
      gridColumnEnd: "unsupported",
      gridRowEnd: "unsupported",
    },
  },
  {
    name: "native grid auto-flow field is dropped consistently",
    input: "grid grid-flow-col gap-4",
    target: "native",
    behaviors: ["style-output", "approximate-reported", "unsupported-dropped"],
    present: ["gap"],
    absent: ["display", "gridAutoFlow"],
    dropped: ["gridAutoFlow"],
    approximated: ["display"],
    capabilities: {
      display: "approximate",
      gridAutoFlow: "unsupported",
    },
  },
  {
    name: "native grid auto-track fields are dropped consistently",
    input: "grid auto-cols-fr auto-rows-min gap-4",
    target: "native",
    behaviors: ["style-output", "approximate-reported", "unsupported-dropped"],
    present: ["gap"],
    absent: ["display", "gridAutoColumns", "gridAutoRows"],
    dropped: ["gridAutoColumns", "gridAutoRows"],
    approximated: ["display"],
    capabilities: {
      display: "approximate",
      gridAutoColumns: "unsupported",
      gridAutoRows: "unsupported",
    },
  },
  {
    name: "native grid span fields remain dropped consistently",
    input: "grid grid-cols-3 gap-4 col-span-2 row-span-2",
    target: "native",
    behaviors: ["style-output", "approximate-reported", "unsupported-dropped"],
    present: ["gap"],
    absent: ["display", "gridTemplateColumns", "gridColumn", "gridRow"],
    dropped: ["gridTemplateColumns", "gridColumn", "gridRow"],
    approximated: ["display"],
    capabilities: {
      display: "approximate",
      gridTemplateColumns: "unsupported",
      gridColumn: "unsupported",
      gridRow: "unsupported",
    },
  },
  {
    name: "flutter grid recipe gap exposes both approximation and dropped grid columns",
    input: "grid grid-cols-3 gap-4",
    target: "flutter",
    behaviors: [
      "metadata-output",
      "approximate-reported",
      "unsupported-recipe-only",
    ],
    present: ["_dropped"],
    dropped: ["gridTemplateColumns"],
    approximated: ["display"],
    capabilities: {
      display: "approximate",
      gridTemplateColumns: "recipe-only",
    },
  },
  {
    name: "flutter viewport units are dropped without native capability overclaim",
    input: "w-screen h-screen",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    dropped: ["width", "height"],
    capabilities: {
      width: "unsupported",
      height: "unsupported",
    },
  },
  {
    name: "flutter transform utilities render into target recipe",
    input: "rotate-45 scale-110",
    target: "flutter",
    behaviors: ["style-output"],
    present: ["transform.rotate", "transform.scaleX", "transform.scaleY"],
  },
  {
    name: "web accumulates transform utilities into ordered CSS output",
    input: "rotate-45 scale-110 translate-x-4",
    target: "web",
    behaviors: ["style-output"],
    present: ["transform"],
  },
  {
    name: "native transforms render as React Native transform array",
    input: "rotate-45 scale-110 translate-x-4",
    target: "native",
    behaviors: ["style-output"],
    present: [
      "transform.0.rotate",
      "transform.1.scale",
      "transform.2.translateX",
    ],
  },
  {
    name: "flutter transform origin is folded into the transform recipe",
    input: "origin-top-left rotate-45 translate-y-2",
    target: "flutter",
    behaviors: ["style-output"],
    present: ["transform.origin", "transform.rotate", "transform.translateY"],
  },
  {
    name: "native typography utilities render without caveats",
    input: "text-lg font-bold leading-7 tracking-wide italic text-center",
    target: "native",
    behaviors: ["style-output"],
    present: [
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "fontStyle",
      "textAlign",
    ],
  },
  {
    name: "flutter typography utilities render as text style without caveats",
    input: "text-lg font-bold leading-7 tracking-wide italic text-center",
    target: "flutter",
    behaviors: ["style-output"],
    present: [
      "textStyle.fontSize",
      "textStyle.fontWeight",
      "textStyle.height",
      "textStyle.letterSpacing",
      "textStyle.fontStyle",
      "textStyle.textAlign",
    ],
  },
  {
    name: "web typography utilities render as CSS styles without caveats",
    input: "text-lg font-bold leading-7 tracking-wide italic text-center",
    target: "web",
    behaviors: ["style-output"],
    present: [
      "fontSize",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "fontStyle",
      "textAlign",
    ],
  },
  {
    name: "web layout and positioning utilities render as CSS styles without caveats",
    input: "flex flex-col items-center justify-between absolute top-4 left-0",
    target: "web",
    behaviors: ["style-output"],
    present: [
      "display",
      "flexDirection",
      "alignItems",
      "justifyContent",
      "position",
      "top",
      "left",
    ],
  },
  {
    name: "native layout and positioning utilities render without caveats",
    input: "flex flex-col items-center justify-between absolute top-4 left-0",
    target: "native",
    behaviors: ["style-output"],
    present: [
      "display",
      "flexDirection",
      "alignItems",
      "justifyContent",
      "position",
      "top",
      "left",
    ],
  },
  {
    name: "flutter layout renders directly while positioning remains recipe-only",
    input: "flex flex-col items-center justify-between absolute top-4 left-0",
    target: "flutter",
    behaviors: ["style-output", "unsupported-recipe-only"],
    present: [
      "layout.direction",
      "layout.crossAxisAlignment",
      "layout.mainAxisAlignment",
      "positioning.type",
      "positioning.top",
      "positioning.left",
    ],
    capabilities: {
      position: "recipe-only",
      top: "recipe-only",
      left: "recipe-only",
    },
  },
  {
    name: "web sizing and dimensions utilities render as CSS styles without caveats",
    input: "w-full h-full max-w-lg min-h-0",
    target: "web",
    behaviors: ["style-output"],
    present: ["width", "height", "maxWidth", "minHeight"],
  },
  {
    name: "native sizing and dimensions utilities render numeric constraints without caveats",
    input: "w-full h-full max-w-lg min-h-0",
    target: "native",
    behaviors: ["style-output"],
    present: ["width", "height", "maxWidth", "minHeight"],
  },
  {
    name: "flutter sizing and dimensions utilities render constraints without caveats",
    input: "w-full h-full max-w-lg min-h-0",
    target: "flutter",
    behaviors: ["style-output"],
    present: [
      "constraints.expandWidth",
      "constraints.expandHeight",
      "constraints.maxWidth",
      "constraints.minHeight",
    ],
  },
  {
    name: "web spacing and radius utilities render as CSS box-model styles without caveats",
    input: "p-4 m-2 rounded-lg",
    target: "web",
    behaviors: ["style-output"],
    present: ["padding", "margin", "borderRadius"],
  },
  {
    name: "native spacing and radius utilities render numeric box-model styles without caveats",
    input: "p-4 m-2 rounded-lg",
    target: "native",
    behaviors: ["style-output"],
    present: ["padding", "margin", "borderRadius"],
  },
  {
    name: "flutter spacing and radius utilities render box-model recipes without caveats",
    input: "p-4 m-2 rounded-lg",
    target: "flutter",
    behaviors: ["style-output"],
    present: [
      "padding.top",
      "padding.right",
      "padding.bottom",
      "padding.left",
      "margin.top",
      "margin.right",
      "margin.bottom",
      "margin.left",
      "decoration.borderRadius.topLeft",
      "decoration.borderRadius.topRight",
      "decoration.borderRadius.bottomLeft",
      "decoration.borderRadius.bottomRight",
    ],
  },
  {
    name: "web color and background utilities render as CSS colors without caveats",
    input: "bg-red-500 text-white",
    target: "web",
    behaviors: ["style-output"],
    present: ["backgroundColor", "color"],
  },
  {
    name: "native color and background utilities render direct colors without caveats",
    input: "bg-red-500 text-white",
    target: "native",
    behaviors: ["style-output"],
    present: ["backgroundColor", "color"],
  },
  {
    name: "flutter color and background utilities render decoration and text colors without caveats",
    input: "bg-red-500 text-white",
    target: "flutter",
    behaviors: ["style-output"],
    present: ["decoration.color", "textStyle.color"],
  },
  {
    name: "web border utilities render CSS border styles without caveats",
    input: "border-2 border-solid border-red-500",
    target: "web",
    behaviors: ["style-output"],
    present: ["borderWidth", "borderStyle", "borderColor"],
  },
  {
    name: "native border utilities render numeric border styles without caveats",
    input: "border-2 border-solid border-red-500",
    target: "native",
    behaviors: ["style-output"],
    present: ["borderWidth", "borderStyle", "borderColor"],
  },
  {
    name: "flutter border utilities render decoration border recipe without caveats",
    input: "border-2 border-solid border-red-500",
    target: "flutter",
    behaviors: ["style-output"],
    present: [
      "decoration.border.width",
      "decoration.border.style",
      "decoration.border.color",
    ],
  },
  {
    name: "web aspect-ratio utilities render CSS aspect ratio without caveats",
    input: "aspect-video",
    target: "web",
    behaviors: ["style-output"],
    present: ["aspectRatio"],
  },
  {
    name: "native aspect-ratio utilities render direct aspect ratio without caveats",
    input: "aspect-video",
    target: "native",
    behaviors: ["style-output"],
    present: ["aspectRatio"],
  },
  {
    name: "flutter aspect-ratio utilities render numeric aspect ratio without caveats",
    input: "aspect-video",
    target: "flutter",
    behaviors: ["style-output"],
    present: ["aspectRatio"],
  },
  {
    name: "web opacity and z-index utilities render CSS styles without caveats",
    input: "opacity-50 z-10",
    target: "web",
    behaviors: ["style-output"],
    present: ["opacity", "zIndex"],
  },
  {
    name: "native opacity and z-index utilities render numeric styles without caveats",
    input: "opacity-50 z-10",
    target: "native",
    behaviors: ["style-output"],
    present: ["opacity", "zIndex"],
  },
  {
    name: "flutter opacity renders directly while z-index remains approximate",
    input: "opacity-50 z-10",
    target: "flutter",
    behaviors: ["style-output", "approximate-reported"],
    present: ["opacity", "zIndex"],
    approximated: ["zIndex"],
    capabilities: { zIndex: "approximate" },
  },
  {
    name: "web interactivity utilities render CSS styles without caveats",
    input: "cursor-pointer select-none pointer-events-none",
    target: "web",
    behaviors: ["style-output"],
    present: ["cursor", "userSelect", "pointerEvents"],
  },
  {
    name: "native interactivity keeps pointer events while dropping web-only cursor/select",
    input: "cursor-pointer select-none pointer-events-none",
    target: "native",
    behaviors: ["style-output", "unsupported-dropped"],
    present: ["pointerEvents"],
    absent: ["cursor", "userSelect"],
    dropped: ["cursor", "userSelect"],
    capabilities: {
      cursor: "unsupported",
      userSelect: "unsupported",
    },
    noCapabilities: ["pointerEvents"],
  },
  {
    name: "flutter interactivity utilities remain unsupported drop evidence",
    input: "cursor-pointer select-none pointer-events-none",
    target: "flutter",
    behaviors: ["metadata-output", "unsupported-dropped"],
    present: ["_dropped"],
    absent: ["cursor", "userSelect", "pointerEvents"],
    dropped: ["cursor", "userSelect", "pointerEvents"],
    capabilities: {
      cursor: "unsupported",
      userSelect: "unsupported",
      pointerEvents: "unsupported",
    },
  },
  {
    name: "native common spacing, radius, and color utilities render directly",
    input: "p-4 m-2 rounded-lg bg-red-500",
    target: "native",
    behaviors: ["style-output"],
    present: ["padding", "margin", "borderRadius", "backgroundColor"],
  },
];

describe("target behavior contracts", () => {
  it.each(contractCases)("$name", (contractCase) => {
    expectTargetContract(contractCase);
  });
});
