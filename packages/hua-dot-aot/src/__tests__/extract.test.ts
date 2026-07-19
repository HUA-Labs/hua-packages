import { describe, it, expect } from "vitest";
import { dot } from "@hua-labs/dot";
import type { DotTarget } from "@hua-labs/dot";
import {
  extractStaticCalls,
  transformSource,
  styleToObjectLiteral,
} from "../extract";

type AotContractCase = {
  name: string;
  input: string;
  target: DotTarget;
  present?: string[];
  absent?: string[];
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

describe("extractStaticCalls", () => {
  it("extracts simple dot() call", () => {
    const source = `const style = dot('p-4 bg-red-500');`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
    expect(calls[0].input).toBe("p-4 bg-red-500");
    expect(calls[0].result).toHaveProperty("padding", "16px");
    expect(calls[0].result).toHaveProperty("backgroundColor");
  });

  it("extracts multiple dot() calls", () => {
    const source = `
      const a = dot('p-4');
      const b = dot('m-2');
    `;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(2);
  });

  it("extracts dot() with double quotes", () => {
    const source = `const style = dot("text-lg font-bold");`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
    expect(calls[0].input).toBe("text-lg font-bold");
  });

  it("skips dot() with non-string argument", () => {
    const source = `const style = dot(myVariable);`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it("skips template literal argument", () => {
    const source = "const style = dot(`p-${size}`);";
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it("extracts with static options { target }", () => {
    const source = `const style = dot('p-4', { target: 'native' });`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
    expect(calls[0].options?.target).toBe("native");
    // Native adapter converts px to numbers
    expect(calls[0].result.padding).toBe(16);
  });

  it("respects custom function names", () => {
    const source = `const style = css('p-4');`;
    const calls = extractStaticCalls(source, { functionNames: ["css"] });
    expect(calls).toHaveLength(1);
  });

  it("does not match property access dot()", () => {
    const source = `obj.dot('p-4');`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it("returns results sorted last-first", () => {
    const source = `const a = dot('p-4'); const b = dot('m-2');`;
    const calls = extractStaticCalls(source);
    expect(calls[0].start).toBeGreaterThan(calls[1].start);
  });
});

// ---------------------------------------------------------------------------
// Fix 1: string/comment false positives
// ---------------------------------------------------------------------------
describe("string/comment context detection", () => {
  it("skips dot() inside double-quoted string", () => {
    const source = `const msg = "call dot('p-4') later";`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it("skips dot() inside single-line comment", () => {
    const source = `// dot('p-4')\nconst x = 1;`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it("skips dot() inside block comment", () => {
    const source = `/* dot('p-4') */\nconst x = 1;`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it("skips dot() inside template literal", () => {
    const source = "const msg = `use dot('p-4') here`;";
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it("still extracts real dot() after comment line", () => {
    const source = `// some comment\nconst style = dot('p-4');`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
  });

  it("still extracts real dot() after block comment", () => {
    const source = `/* comment */ const style = dot('p-4');`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
  });

  it("does not transform string containing dot()", () => {
    const source = `const msg = "call dot('p-4') later";`;
    const result = transformSource(source);
    expect(result).toBeNull();
  });

  it("does not transform comment containing dot()", () => {
    const source = `// dot('p-4')\nconst x = 1;`;
    const result = transformSource(source);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Fix 2: nested object serialization (native/flutter)
// ---------------------------------------------------------------------------
describe("nested structure serialization", () => {
  it("serializes native transform array correctly", () => {
    const source = `const style = dot('rotate-45', { target: 'native' });`;
    const result = transformSource(source);
    expect(result).not.toBeNull();
    // Should contain transform array, not [object Object]
    expect(result!.code).not.toContain("[object Object]");
    expect(result!.code).toContain("transform:");
  });

  it("serializes flutter recipe correctly", () => {
    const source = `const style = dot('p-4', { target: 'flutter' });`;
    const result = transformSource(source);
    expect(result).not.toBeNull();
    // Flutter produces nested { padding: { top: 16, ... } }
    expect(result!.code).not.toContain("[object Object]");
    expect(result!.code).toContain("padding:");
  });

  it("serializes flutter gradient recipe correctly", () => {
    const source = `const style = dot('bg-gradient-to-r from-red-500 to-blue-500', { target: 'flutter' });`;
    const result = transformSource(source);
    expect(result).not.toBeNull();
    expect(result!.code).not.toContain("[object Object]");
    expect(result!.code).toContain("decoration:");
    expect(result!.code).toContain("gradient:");
  });

  it("handles nested objects in styleToObjectLiteral", () => {
    const result = styleToObjectLiteral({
      transform: [{ rotate: "45deg" }, { scale: 1.1 }],
      padding: 16,
    } as Record<string, unknown>);
    expect(result).toContain('[{rotate: "45deg"}, {scale: 1.1}]');
    expect(result).toContain("padding: 16");
  });

  it("handles deeply nested flutter decoration", () => {
    const result = styleToObjectLiteral({
      decoration: {
        gradient: { type: "linear", colors: ["#ff0000", "#0000ff"] },
      },
    } as Record<string, unknown>);
    expect(result).toContain('"linear"');
    expect(result).toContain('["#ff0000", "#0000ff"]');
  });
});

// ---------------------------------------------------------------------------
// Target contract parity with runtime dot()
// ---------------------------------------------------------------------------
describe("target contract parity", () => {
  const contractCases: AotContractCase[] = [
    {
      name: "web gradient output",
      input: "p-4 bg-gradient-to-r from-red-500 to-blue-500",
      target: "web",
      present: ["padding", "backgroundImage"],
    },
    {
      name: "web gradient stop position output",
      input: "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500",
      target: "web",
      present: ["backgroundImage"],
    },
    {
      name: "native unsupported composed gradient drop",
      input: "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500",
      target: "native",
      absent: ["backgroundImage"],
    },
    {
      name: "web accumulated filter output",
      input: "blur-md brightness-150",
      target: "web",
      present: ["filter"],
    },
    {
      name: "web accumulated backdrop filter output",
      input: "backdrop-blur-md backdrop-brightness-75",
      target: "web",
      present: ["backdropFilter"],
    },
    {
      name: "native renderable shadow approximation",
      input: "shadow-xl ring-2",
      target: "native",
      present: [
        "shadowColor",
        "shadowOffset",
        "shadowOpacity",
        "shadowRadius",
        "elevation",
      ],
      absent: ["boxShadow"],
    },
    {
      name: "native unsupported ring-only drop",
      input: "ring-2",
      target: "native",
      absent: ["shadowColor", "shadowOffset", "shadowOpacity", "elevation"],
    },
    {
      name: "native unsupported backdrop filter drop",
      input: "p-4 backdrop-blur-md",
      target: "native",
      present: ["padding"],
      absent: ["backdropFilter"],
    },
    {
      name: "flutter gradient recipe output",
      input: "bg-gradient-to-r from-red-500 to-blue-500",
      target: "flutter",
      present: ["decoration.gradient"],
    },
    {
      name: "flutter gradient stop position recipe output",
      input: "bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500",
      target: "flutter",
      present: ["decoration.gradient.colors", "decoration.gradient.stops"],
    },
    {
      name: "flutter unsupported CSS variable gradient stop drop",
      input: "bg-gradient-to-r from-[#ff0000] to-[var(--color-brand)]",
      target: "flutter",
      present: ["_dropped"],
      absent: ["decoration.gradient"],
    },
    {
      name: "flutter adapter-dropped filter evidence",
      input: "blur-md",
      target: "flutter",
      present: ["_dropped"],
    },
    {
      name: "flutter adapter-dropped backdrop filter evidence",
      input: "backdrop-blur-md",
      target: "flutter",
      present: ["_dropped"],
    },
    {
      name: "web overflow object-fit output",
      input: "overflow-hidden object-cover",
      target: "web",
      present: ["overflow", "objectFit"],
    },
    {
      name: "native object-fit resizeMode output",
      input: "overflow-hidden object-cover",
      target: "native",
      present: ["overflow", "resizeMode"],
      absent: ["objectFit"],
    },
    {
      name: "flutter object-fit recipe-only drop evidence",
      input: "object-cover",
      target: "flutter",
      present: ["_dropped"],
      absent: ["objectFit"],
    },
    {
      name: "web object-position output",
      input: "object-left-bottom",
      target: "web",
      present: ["objectPosition"],
    },
    {
      name: "native unsupported object-position drop",
      input: "object-center",
      target: "native",
      absent: ["objectPosition"],
    },
    {
      name: "flutter object-position drop evidence",
      input: "object-center",
      target: "flutter",
      present: ["_dropped"],
      absent: ["objectPosition"],
    },
    {
      name: "web overflow axis output",
      input: "overflow-x-auto overflow-y-hidden",
      target: "web",
      present: ["overflowX", "overflowY"],
    },
    {
      name: "native overflow axis drops",
      input: "overflow-x-auto overflow-y-hidden",
      target: "native",
      absent: ["overflowX", "overflowY"],
    },
    {
      name: "flutter overflow axis drops",
      input: "overflow-x-auto overflow-y-hidden",
      target: "flutter",
      absent: ["overflowX", "overflowY"],
    },
    {
      name: "web scroll output",
      input: "scroll-smooth scroll-mt-4 scroll-px-2",
      target: "web",
      present: [
        "scrollBehavior",
        "scrollMarginTop",
        "scrollPaddingLeft",
        "scrollPaddingRight",
      ],
    },
    {
      name: "native scroll drops",
      input: "scroll-smooth scroll-mt-4 scroll-px-2",
      target: "native",
      absent: [
        "scrollBehavior",
        "scrollMarginTop",
        "scrollPaddingLeft",
        "scrollPaddingRight",
      ],
    },
    {
      name: "flutter scroll drop evidence",
      input: "scroll-smooth scroll-mt-4 scroll-px-2",
      target: "flutter",
      present: ["_dropped"],
      absent: [
        "scrollBehavior",
        "scrollMarginTop",
        "scrollPaddingLeft",
        "scrollPaddingRight",
      ],
    },
    {
      name: "web transition output",
      input: "transition-all duration-300 ease-in-out",
      target: "web",
      present: [
        "transitionProperty",
        "transitionDuration",
        "transitionTimingFunction",
      ],
    },
    {
      name: "native unsupported transition drop",
      input: "transition-all duration-300 ease-in-out",
      target: "native",
      absent: [
        "transitionProperty",
        "transitionDuration",
        "transitionTimingFunction",
      ],
    },
    {
      name: "flutter transition drop evidence",
      input: "transition-all duration-300 ease-in-out",
      target: "flutter",
      present: ["_dropped"],
      absent: [
        "transitionProperty",
        "transitionDuration",
        "transitionTimingFunction",
      ],
    },
    {
      name: "web animation output",
      input: "animate-spin",
      target: "web",
      present: ["animation"],
    },
    {
      name: "native unsupported animation drop",
      input: "animate-spin",
      target: "native",
      absent: ["animation"],
    },
    {
      name: "flutter animation drop evidence",
      input: "animate-spin",
      target: "flutter",
      present: ["_dropped"],
      absent: ["animation"],
    },
    {
      name: "web animation composition output",
      input: "animate-in fade-in-50 zoom-in-95",
      target: "web",
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
      name: "native unsupported animation composition drop",
      input: "animate-in fade-in-50 zoom-in-95",
      target: "native",
      absent: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-opacity",
        "--tw-enter-scale",
      ],
    },
    {
      name: "flutter animation composition drop evidence",
      input: "animate-in fade-in-50 zoom-in-95",
      target: "flutter",
      present: ["_dropped"],
      absent: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-opacity",
        "--tw-enter-scale",
      ],
    },
    {
      name: "web animation exit composition output",
      input: "animate-out fade-out-0 zoom-out-95",
      target: "web",
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
      name: "native unsupported animation exit composition drop",
      input: "animate-out fade-out-0 zoom-out-95",
      target: "native",
      absent: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-opacity",
        "--tw-exit-scale",
      ],
    },
    {
      name: "flutter animation exit composition drop evidence",
      input: "animate-out fade-out-0 zoom-out-95",
      target: "flutter",
      present: ["_dropped"],
      absent: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-opacity",
        "--tw-exit-scale",
      ],
    },
    {
      name: "web animation enter slide composition output",
      input: "animate-in slide-in-from-top-2",
      target: "web",
      present: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-translate-y",
      ],
    },
    {
      name: "native unsupported animation enter slide composition drop",
      input: "animate-in slide-in-from-top-2",
      target: "native",
      absent: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-translate-y",
      ],
    },
    {
      name: "flutter animation enter slide composition drop evidence",
      input: "animate-in slide-in-from-top-2",
      target: "flutter",
      present: ["_dropped"],
      absent: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-enter-translate-y",
      ],
    },
    {
      name: "web animation exit slide composition output",
      input: "animate-out slide-out-to-right-2",
      target: "web",
      present: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-translate-x",
      ],
    },
    {
      name: "native unsupported animation exit slide composition drop",
      input: "animate-out slide-out-to-right-2",
      target: "native",
      absent: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-translate-x",
      ],
    },
    {
      name: "flutter animation exit slide composition drop evidence",
      input: "animate-out slide-out-to-right-2",
      target: "flutter",
      present: ["_dropped"],
      absent: [
        "animationName",
        "animationDuration",
        "animationTimingFunction",
        "animationFillMode",
        "--tw-exit-translate-x",
      ],
    },
    {
      name: "web grid output",
      input: "grid grid-cols-3 gap-4",
      target: "web",
      present: ["display", "gridTemplateColumns", "gap"],
    },
    {
      name: "native grid gap output with dropped columns",
      input: "grid grid-cols-3 gap-4",
      target: "native",
      present: ["gap"],
      absent: ["display", "gridTemplateColumns"],
    },
    {
      name: "native grid placement start/end drops",
      input:
        "grid grid-cols-3 gap-4 col-start-2 row-start-2 col-end-4 row-end-4",
      target: "native",
      present: ["gap"],
      absent: [
        "display",
        "gridTemplateColumns",
        "gridColumnStart",
        "gridRowStart",
        "gridColumnEnd",
        "gridRowEnd",
      ],
    },
    {
      name: "native grid auto-flow drop",
      input: "grid grid-flow-col gap-4",
      target: "native",
      present: ["gap"],
      absent: ["display", "gridAutoFlow"],
    },
    {
      name: "native grid auto-track drops",
      input: "grid auto-cols-fr auto-rows-min gap-4",
      target: "native",
      present: ["gap"],
      absent: ["display", "gridAutoColumns", "gridAutoRows"],
    },
    {
      name: "native grid span drops",
      input: "grid grid-cols-3 gap-4 col-span-2 row-span-2",
      target: "native",
      present: ["gap"],
      absent: ["display", "gridTemplateColumns", "gridColumn", "gridRow"],
    },
    {
      name: "flutter grid drop evidence",
      input: "grid grid-cols-3 gap-4",
      target: "flutter",
      present: ["_dropped"],
      absent: ["display", "gridTemplateColumns", "gap"],
    },
    {
      name: "flutter transform recipe output",
      input: "rotate-45 scale-110",
      target: "flutter",
      present: ["transform.rotate", "transform.scaleX", "transform.scaleY"],
    },
    {
      name: "web accumulated transform output",
      input: "rotate-45 scale-110 translate-x-4",
      target: "web",
      present: ["transform"],
    },
    {
      name: "native transform array output",
      input: "rotate-45 scale-110 translate-x-4",
      target: "native",
      present: [
        "transform.0.rotate",
        "transform.1.scale",
        "transform.2.translateX",
      ],
    },
    {
      name: "flutter transform origin recipe output",
      input: "origin-top-left rotate-45 translate-y-2",
      target: "flutter",
      present: ["transform.origin", "transform.rotate", "transform.translateY"],
    },
    {
      name: "web typography output",
      input: "text-lg font-bold leading-7 tracking-wide italic text-center",
      target: "web",
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
      name: "native typography output",
      input: "text-lg font-bold leading-7 tracking-wide italic text-center",
      target: "native",
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
      name: "flutter text style typography output",
      input: "text-lg font-bold leading-7 tracking-wide italic text-center",
      target: "flutter",
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
      name: "web layout and positioning output",
      input: "flex flex-col items-center justify-between absolute top-4 left-0",
      target: "web",
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
      name: "native layout and positioning output",
      input: "flex flex-col items-center justify-between absolute top-4 left-0",
      target: "native",
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
      name: "flutter layout and positioning recipe output",
      input: "flex flex-col items-center justify-between absolute top-4 left-0",
      target: "flutter",
      present: [
        "layout.direction",
        "layout.crossAxisAlignment",
        "layout.mainAxisAlignment",
        "positioning.type",
        "positioning.top",
        "positioning.left",
      ],
    },
    {
      name: "web sizing and dimensions output",
      input: "w-full h-full max-w-lg min-h-0",
      target: "web",
      present: ["width", "height", "maxWidth", "minHeight"],
    },
    {
      name: "native sizing and dimensions output",
      input: "w-full h-full max-w-lg min-h-0",
      target: "native",
      present: ["width", "height", "maxWidth", "minHeight"],
    },
    {
      name: "flutter sizing and dimensions constraints output",
      input: "w-full h-full max-w-lg min-h-0",
      target: "flutter",
      present: [
        "constraints.expandWidth",
        "constraints.expandHeight",
        "constraints.maxWidth",
        "constraints.minHeight",
      ],
    },
    {
      name: "web spacing and radius box-model output",
      input: "p-4 m-2 rounded-lg",
      target: "web",
      present: ["padding", "margin", "borderRadius"],
    },
    {
      name: "native spacing and radius box-model output",
      input: "p-4 m-2 rounded-lg",
      target: "native",
      present: ["padding", "margin", "borderRadius"],
    },
    {
      name: "flutter spacing and radius box-model recipe output",
      input: "p-4 m-2 rounded-lg",
      target: "flutter",
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
      name: "web color and background output",
      input: "bg-red-500 text-white",
      target: "web",
      present: ["backgroundColor", "color"],
    },
    {
      name: "native color and background output",
      input: "bg-red-500 text-white",
      target: "native",
      present: ["backgroundColor", "color"],
    },
    {
      name: "flutter color and background recipe output",
      input: "bg-red-500 text-white",
      target: "flutter",
      present: ["decoration.color", "textStyle.color"],
    },
    {
      name: "web border output",
      input: "border-2 border-solid border-red-500",
      target: "web",
      present: ["borderWidth", "borderStyle", "borderColor"],
    },
    {
      name: "native border output",
      input: "border-2 border-solid border-red-500",
      target: "native",
      present: ["borderWidth", "borderStyle", "borderColor"],
    },
    {
      name: "flutter border decoration recipe output",
      input: "border-2 border-solid border-red-500",
      target: "flutter",
      present: [
        "decoration.border.width",
        "decoration.border.style",
        "decoration.border.color",
      ],
    },
    {
      name: "web aspect-ratio output",
      input: "aspect-video",
      target: "web",
      present: ["aspectRatio"],
    },
    {
      name: "native aspect-ratio output",
      input: "aspect-video",
      target: "native",
      present: ["aspectRatio"],
    },
    {
      name: "flutter aspect-ratio output",
      input: "aspect-video",
      target: "flutter",
      present: ["aspectRatio"],
    },
    {
      name: "web opacity and z-index output",
      input: "opacity-50 z-10",
      target: "web",
      present: ["opacity", "zIndex"],
    },
    {
      name: "native opacity and z-index output",
      input: "opacity-50 z-10",
      target: "native",
      present: ["opacity", "zIndex"],
    },
    {
      name: "flutter opacity and z-index output",
      input: "opacity-50 z-10",
      target: "flutter",
      present: ["opacity", "zIndex"],
    },
    {
      name: "web interactivity output",
      input: "cursor-pointer select-none pointer-events-none",
      target: "web",
      present: ["cursor", "userSelect", "pointerEvents"],
    },
    {
      name: "native interactivity pointer events output",
      input: "cursor-pointer select-none pointer-events-none",
      target: "native",
      present: ["pointerEvents"],
      absent: ["cursor", "userSelect"],
    },
    {
      name: "flutter interactivity unsupported drop evidence",
      input: "cursor-pointer select-none pointer-events-none",
      target: "flutter",
      present: ["_dropped"],
      absent: ["cursor", "userSelect", "pointerEvents"],
    },
  ];

  it.each(contractCases)(
    "matches runtime dot() for $name",
    ({ input, target, present = [], absent = [] }) => {
      const source = `const style = dot('${input}', { target: '${target}' });`;
      const calls = extractStaticCalls(source);
      const runtime = dot(input, { target });

      expect(calls).toHaveLength(1);
      expect(calls[0].result).toEqual(runtime);

      for (const path of present) {
        expect(getPath(calls[0].result, path), path).toBeDefined();
      }

      for (const path of absent) {
        expect(getPath(calls[0].result, path), path).toBeUndefined();
      }

      const transformed = transformSource(source);
      expect(transformed).not.toBeNull();
      expect(transformed!.code).not.toContain("dot(");
      expect(transformed!.code).not.toContain("[object Object]");
      expect(transformed!.extractions).toBe(1);
    },
  );
});

// ---------------------------------------------------------------------------
// Fix 3: breakpoint option handling
// ---------------------------------------------------------------------------
describe("breakpoint option handling", () => {
  it("skips extraction when breakpoint option is present", () => {
    const source = `const style = dot('md:p-8', { breakpoint: 'md' });`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it("does not transform source with breakpoint option", () => {
    const source = `const style = dot('md:p-8', { breakpoint: 'md' });`;
    const result = transformSource(source);
    expect(result).toBeNull();
  });

  it("skips breakpoint even with other options", () => {
    const source = `const style = dot('md:p-8', { target: 'native', breakpoint: 'md' });`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(0);
  });

  it("still extracts when no breakpoint option", () => {
    const source = `const style = dot('p-4', { target: 'web' });`;
    const calls = extractStaticCalls(source);
    expect(calls).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Static option admission — fail closed on shapes the heuristic cannot prove
// ---------------------------------------------------------------------------
describe("static option admission", () => {
  it.each([
    [`{}`, undefined],
    [`{ target: "native" }`, { target: "native" }],
    [`{ dark: true }`, { dark: true }],
    [
      `{ "target": "flutter", 'dark': false, }`,
      { target: "flutter", dark: false },
    ],
  ])("extracts the bounded literal shape %s", (options, expected) => {
    const calls = extractStaticCalls(`const style = dot("p-4", ${options});`);

    expect(calls).toHaveLength(1);
    expect(calls[0].options).toEqual(expected);
  });

  it("keeps a trailing call comma aligned with the Babel path", () => {
    const calls = extractStaticCalls(`const style = dot("p-4",);`);

    expect(calls).toHaveLength(1);
    expect(calls[0].options).toBeUndefined();
  });

  it.each([
    ["dynamic target", `{ target }`],
    ["dynamic dark", `{ dark: enabled }`],
    ["unknown key", `{ target: "web", cache: true }`],
    ["spread", `{ ...options }`],
    ["computed key", `{ [key]: "native" }`],
    ["nested value", `{ target: { value: "native" } }`],
    ["duplicate key", `{ target: "web", target: "native" }`],
    ["unsupported target", `{ target: "desktop" }`],
    ["malformed supported value", `{ dark: }`],
    ["breakpoint", `{ breakpoint: "md" }`],
  ])("leaves %s at runtime", (_name, options) => {
    const source = `const style = dot("p-4", ${options});`;

    expect(extractStaticCalls(source)).toHaveLength(0);
    expect(transformSource(source)).toBeNull();
  });

  it.each([
    ["identifier options", `const style = dot("p-4", options);`],
    ["extra argument", `const style = dot("p-4", { dark: true }, extra);`],
  ])("leaves %s at runtime", (_name, source) => {
    expect(extractStaticCalls(source)).toHaveLength(0);
    expect(transformSource(source)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// styleToObjectLiteral
// ---------------------------------------------------------------------------
describe("styleToObjectLiteral", () => {
  it("converts empty object", () => {
    expect(styleToObjectLiteral({})).toBe("({})");
  });

  it("converts simple properties", () => {
    const result = styleToObjectLiteral({ padding: "16px", margin: "8px" });
    expect(result).toBe('({padding: "16px", margin: "8px"})');
  });

  it("converts numeric values", () => {
    const result = styleToObjectLiteral({ opacity: 0.5, zIndex: 10 });
    expect(result).toBe("({opacity: 0.5, zIndex: 10})");
  });

  it("escapes double quotes in string values", () => {
    const result = styleToObjectLiteral({ fontFamily: '"Inter", sans-serif' });
    expect(result).toContain('\\"Inter\\"');
  });

  it("handles boolean values", () => {
    const result = styleToObjectLiteral({ visible: true } as Record<
      string,
      unknown
    >);
    expect(result).toContain("visible: true");
  });

  it("handles null values", () => {
    const result = styleToObjectLiteral({ value: null } as Record<
      string,
      unknown
    >);
    expect(result).toContain("value: null");
  });
});

// ---------------------------------------------------------------------------
// transformSource
// ---------------------------------------------------------------------------
describe("transformSource", () => {
  it("replaces dot() calls with object literals", () => {
    const source = `const style = dot('p-4');`;
    const result = transformSource(source);
    expect(result).not.toBeNull();
    expect(result!.code).toContain('padding: "16px"');
    expect(result!.code).not.toContain("dot('p-4')");
    expect(result!.extractions).toBe(1);
  });

  it("returns null when no dot() calls found", () => {
    const source = `const x = 42;`;
    const result = transformSource(source);
    expect(result).toBeNull();
  });

  it("preserves surrounding code", () => {
    const source = `const before = 1;\nconst style = dot('p-4');\nconst after = 2;`;
    const result = transformSource(source);
    expect(result!.code).toContain("const before = 1;");
    expect(result!.code).toContain("const after = 2;");
  });

  it("handles multiple calls correctly", () => {
    const source = `const a = dot('p-4');\nconst b = dot('m-2');`;
    const result = transformSource(source);
    expect(result!.extractions).toBe(2);
    expect(result!.code).toContain('padding: "16px"');
    expect(result!.code).toContain('margin: "8px"');
  });

  it("handles empty dot() result", () => {
    const source = `const style = dot('bg-gradient-to-r');`;
    const result = transformSource(source);
    // bg-gradient-to-r alone produces empty (no color stops)
    expect(result!.code).toContain("({})");
  });
});
