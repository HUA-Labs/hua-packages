/**
 * Comprehensive integration tests for filter, backdrop-filter, transition,
 * animation, and mix-blend resolvers via the dot() public API.
 *
 * These tests exercise the full pipeline (parser → resolver → merge) using
 * exact token values from the filter.ts, backdrop.ts, animations.ts, and
 * transitions.ts token files.
 */
import { describe, it, expect } from "vitest";
import { dot } from "../../index";

// ---------------------------------------------------------------------------
// 1. Filter — blur
// ---------------------------------------------------------------------------
describe("filter: blur-*", () => {
  it('dot("blur-sm") → filter: blur(4px)', () => {
    expect(dot("blur-sm")).toEqual({ filter: "blur(4px)" });
  });

  it('dot("blur-md") → filter: blur(12px)', () => {
    expect(dot("blur-md")).toEqual({ filter: "blur(12px)" });
  });

  it('dot("blur-lg") → filter: blur(16px)', () => {
    expect(dot("blur-lg")).toEqual({ filter: "blur(16px)" });
  });

  it('dot("blur-xl") → filter: blur(24px)', () => {
    expect(dot("blur-xl")).toEqual({ filter: "blur(24px)" });
  });

  it('dot("blur-2xl") → filter: blur(40px)', () => {
    expect(dot("blur-2xl")).toEqual({ filter: "blur(40px)" });
  });

  it('dot("blur-3xl") → filter: blur(64px)', () => {
    expect(dot("blur-3xl")).toEqual({ filter: "blur(64px)" });
  });

  it('dot("blur") bare → filter: blur(8px)', () => {
    expect(dot("blur")).toEqual({ filter: "blur(8px)" });
  });

  it('dot("blur-none") → filter: blur(0)', () => {
    expect(dot("blur-none")).toEqual({ filter: "blur(0)" });
  });
});

// ---------------------------------------------------------------------------
// 2. Filter — brightness
// ---------------------------------------------------------------------------
describe("filter: brightness-*", () => {
  it('dot("brightness-50") → filter: brightness(.5)', () => {
    expect(dot("brightness-50")).toEqual({ filter: "brightness(.5)" });
  });

  it('dot("brightness-75") → filter: brightness(.75)', () => {
    expect(dot("brightness-75")).toEqual({ filter: "brightness(.75)" });
  });

  it('dot("brightness-100") → filter: brightness(1)', () => {
    expect(dot("brightness-100")).toEqual({ filter: "brightness(1)" });
  });

  it('dot("brightness-110") → filter: brightness(1.1)', () => {
    expect(dot("brightness-110")).toEqual({ filter: "brightness(1.1)" });
  });

  it('dot("brightness-125") → filter: brightness(1.25)', () => {
    expect(dot("brightness-125")).toEqual({ filter: "brightness(1.25)" });
  });

  it('dot("brightness-150") → filter: brightness(1.5)', () => {
    expect(dot("brightness-150")).toEqual({ filter: "brightness(1.5)" });
  });

  it('dot("brightness-200") → filter: brightness(2)', () => {
    expect(dot("brightness-200")).toEqual({ filter: "brightness(2)" });
  });

  it('dot("brightness-0") → filter: brightness(0)', () => {
    expect(dot("brightness-0")).toEqual({ filter: "brightness(0)" });
  });
});

// ---------------------------------------------------------------------------
// 3. Filter — contrast
// ---------------------------------------------------------------------------
describe("filter: contrast-*", () => {
  it('dot("contrast-0") → filter: contrast(0)', () => {
    expect(dot("contrast-0")).toEqual({ filter: "contrast(0)" });
  });

  it('dot("contrast-50") → filter: contrast(.5)', () => {
    expect(dot("contrast-50")).toEqual({ filter: "contrast(.5)" });
  });

  it('dot("contrast-75") → filter: contrast(.75)', () => {
    expect(dot("contrast-75")).toEqual({ filter: "contrast(.75)" });
  });

  it('dot("contrast-100") → filter: contrast(1)', () => {
    expect(dot("contrast-100")).toEqual({ filter: "contrast(1)" });
  });

  it('dot("contrast-125") → filter: contrast(1.25)', () => {
    expect(dot("contrast-125")).toEqual({ filter: "contrast(1.25)" });
  });

  it('dot("contrast-150") → filter: contrast(1.5)', () => {
    expect(dot("contrast-150")).toEqual({ filter: "contrast(1.5)" });
  });

  it('dot("contrast-200") → filter: contrast(2)', () => {
    expect(dot("contrast-200")).toEqual({ filter: "contrast(2)" });
  });
});

// ---------------------------------------------------------------------------
// 4. Filter — saturate
// ---------------------------------------------------------------------------
describe("filter: saturate-*", () => {
  it('dot("saturate-0") → filter: saturate(0)', () => {
    expect(dot("saturate-0")).toEqual({ filter: "saturate(0)" });
  });

  it('dot("saturate-50") → filter: saturate(.5)', () => {
    expect(dot("saturate-50")).toEqual({ filter: "saturate(.5)" });
  });

  it('dot("saturate-100") → filter: saturate(1)', () => {
    expect(dot("saturate-100")).toEqual({ filter: "saturate(1)" });
  });

  it('dot("saturate-150") → filter: saturate(1.5)', () => {
    expect(dot("saturate-150")).toEqual({ filter: "saturate(1.5)" });
  });

  it('dot("saturate-200") → filter: saturate(2)', () => {
    expect(dot("saturate-200")).toEqual({ filter: "saturate(2)" });
  });
});

// ---------------------------------------------------------------------------
// 5. Filter — grayscale / sepia / invert (boolean toggles)
// ---------------------------------------------------------------------------
describe("filter: grayscale / sepia / invert", () => {
  it('dot("grayscale") → filter: grayscale(100%)', () => {
    expect(dot("grayscale")).toEqual({ filter: "grayscale(100%)" });
  });

  it('dot("grayscale-0") → filter: grayscale(0)', () => {
    expect(dot("grayscale-0")).toEqual({ filter: "grayscale(0)" });
  });

  it('dot("sepia") → filter: sepia(100%)', () => {
    expect(dot("sepia")).toEqual({ filter: "sepia(100%)" });
  });

  it('dot("sepia-0") → filter: sepia(0)', () => {
    expect(dot("sepia-0")).toEqual({ filter: "sepia(0)" });
  });

  it('dot("invert") → filter: invert(100%)', () => {
    expect(dot("invert")).toEqual({ filter: "invert(100%)" });
  });

  it('dot("invert-0") → filter: invert(0)', () => {
    expect(dot("invert-0")).toEqual({ filter: "invert(0)" });
  });
});

// ---------------------------------------------------------------------------
// 6. Filter — hue-rotate
// ---------------------------------------------------------------------------
describe("filter: hue-rotate-*", () => {
  it('dot("hue-rotate-0") → filter: hue-rotate(0deg)', () => {
    expect(dot("hue-rotate-0")).toEqual({ filter: "hue-rotate(0deg)" });
  });

  it('dot("hue-rotate-15") → filter: hue-rotate(15deg)', () => {
    expect(dot("hue-rotate-15")).toEqual({ filter: "hue-rotate(15deg)" });
  });

  it('dot("hue-rotate-30") → filter: hue-rotate(30deg)', () => {
    expect(dot("hue-rotate-30")).toEqual({ filter: "hue-rotate(30deg)" });
  });

  it('dot("hue-rotate-60") → filter: hue-rotate(60deg)', () => {
    expect(dot("hue-rotate-60")).toEqual({ filter: "hue-rotate(60deg)" });
  });

  it('dot("hue-rotate-90") → filter: hue-rotate(90deg)', () => {
    expect(dot("hue-rotate-90")).toEqual({ filter: "hue-rotate(90deg)" });
  });

  it('dot("hue-rotate-180") → filter: hue-rotate(180deg)', () => {
    expect(dot("hue-rotate-180")).toEqual({ filter: "hue-rotate(180deg)" });
  });
});

// ---------------------------------------------------------------------------
// 7. Filter — drop-shadow
// ---------------------------------------------------------------------------
describe("filter: drop-shadow-*", () => {
  it('dot("drop-shadow-sm") → exact drop-shadow string', () => {
    expect(dot("drop-shadow-sm")).toEqual({
      filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.05))",
    });
  });

  it('dot("drop-shadow") bare → contains two drop-shadow calls', () => {
    const result = dot("drop-shadow");
    expect(result.filter).toContain("drop-shadow(");
    // bare = two stacked drop-shadows (default preset)
    expect(result.filter?.match(/drop-shadow\(/g)?.length).toBe(2);
  });

  it('dot("drop-shadow-md") → contains two drop-shadow calls', () => {
    const result = dot("drop-shadow-md");
    expect(result.filter).toContain("drop-shadow(");
    expect(result.filter?.match(/drop-shadow\(/g)?.length).toBe(2);
  });

  it('dot("drop-shadow-lg") → contains two drop-shadow calls', () => {
    const result = dot("drop-shadow-lg");
    expect(result.filter).toContain("drop-shadow(");
    expect(result.filter?.match(/drop-shadow\(/g)?.length).toBe(2);
  });

  it('dot("drop-shadow-xl") → contains two drop-shadow calls', () => {
    const result = dot("drop-shadow-xl");
    expect(result.filter).toContain("drop-shadow(");
    expect(result.filter?.match(/drop-shadow\(/g)?.length).toBe(2);
  });

  it('dot("drop-shadow-2xl") → single drop-shadow', () => {
    const result = dot("drop-shadow-2xl");
    expect(result.filter).toContain("drop-shadow(");
    expect(result.filter?.match(/drop-shadow\(/g)?.length).toBe(1);
  });

  it('dot("drop-shadow-none") → drop-shadow(0 0 0 transparent)', () => {
    expect(dot("drop-shadow-none")).toEqual({
      filter: "drop-shadow(0 0 0 transparent)",
    });
  });
});

// ---------------------------------------------------------------------------
// 8. Backdrop filter — blur
// ---------------------------------------------------------------------------
describe("backdrop-filter: backdrop-blur-*", () => {
  it('dot("backdrop-blur-sm") → backdropFilter: blur(4px)', () => {
    expect(dot("backdrop-blur-sm")).toEqual({ backdropFilter: "blur(4px)" });
  });

  it('dot("backdrop-blur-md") → backdropFilter: blur(12px)', () => {
    expect(dot("backdrop-blur-md")).toEqual({ backdropFilter: "blur(12px)" });
  });

  it('dot("backdrop-blur-lg") → backdropFilter: blur(16px)', () => {
    expect(dot("backdrop-blur-lg")).toEqual({ backdropFilter: "blur(16px)" });
  });

  it('dot("backdrop-blur-xl") → backdropFilter: blur(24px)', () => {
    expect(dot("backdrop-blur-xl")).toEqual({ backdropFilter: "blur(24px)" });
  });

  it('dot("backdrop-blur-2xl") → backdropFilter: blur(40px)', () => {
    expect(dot("backdrop-blur-2xl")).toEqual({ backdropFilter: "blur(40px)" });
  });

  it('dot("backdrop-blur-3xl") → backdropFilter: blur(64px)', () => {
    expect(dot("backdrop-blur-3xl")).toEqual({ backdropFilter: "blur(64px)" });
  });

  it('dot("backdrop-blur") bare → backdropFilter: blur(8px)', () => {
    expect(dot("backdrop-blur")).toEqual({ backdropFilter: "blur(8px)" });
  });

  it('dot("backdrop-blur-none") → backdropFilter: blur(0)', () => {
    expect(dot("backdrop-blur-none")).toEqual({ backdropFilter: "blur(0)" });
  });
});

// ---------------------------------------------------------------------------
// 9. Backdrop filter — brightness / contrast / saturate
// ---------------------------------------------------------------------------
describe("backdrop-filter: backdrop-brightness-*", () => {
  it('dot("backdrop-brightness-0") → backdropFilter: brightness(0)', () => {
    expect(dot("backdrop-brightness-0")).toEqual({
      backdropFilter: "brightness(0)",
    });
  });

  it('dot("backdrop-brightness-50") → backdropFilter: brightness(.5)', () => {
    expect(dot("backdrop-brightness-50")).toEqual({
      backdropFilter: "brightness(.5)",
    });
  });

  it('dot("backdrop-brightness-75") → backdropFilter: brightness(.75)', () => {
    expect(dot("backdrop-brightness-75")).toEqual({
      backdropFilter: "brightness(.75)",
    });
  });

  it('dot("backdrop-brightness-100") → backdropFilter: brightness(1)', () => {
    expect(dot("backdrop-brightness-100")).toEqual({
      backdropFilter: "brightness(1)",
    });
  });

  it('dot("backdrop-brightness-125") → backdropFilter: brightness(1.25)', () => {
    expect(dot("backdrop-brightness-125")).toEqual({
      backdropFilter: "brightness(1.25)",
    });
  });

  it('dot("backdrop-brightness-150") → backdropFilter: brightness(1.5)', () => {
    expect(dot("backdrop-brightness-150")).toEqual({
      backdropFilter: "brightness(1.5)",
    });
  });

  it('dot("backdrop-brightness-200") → backdropFilter: brightness(2)', () => {
    expect(dot("backdrop-brightness-200")).toEqual({
      backdropFilter: "brightness(2)",
    });
  });
});

describe("backdrop-filter: backdrop-contrast-*", () => {
  it('dot("backdrop-contrast-0") → backdropFilter: contrast(0)', () => {
    expect(dot("backdrop-contrast-0")).toEqual({
      backdropFilter: "contrast(0)",
    });
  });

  it('dot("backdrop-contrast-50") → backdropFilter: contrast(.5)', () => {
    expect(dot("backdrop-contrast-50")).toEqual({
      backdropFilter: "contrast(.5)",
    });
  });

  it('dot("backdrop-contrast-75") → backdropFilter: contrast(.75)', () => {
    expect(dot("backdrop-contrast-75")).toEqual({
      backdropFilter: "contrast(.75)",
    });
  });

  it('dot("backdrop-contrast-100") → backdropFilter: contrast(1)', () => {
    expect(dot("backdrop-contrast-100")).toEqual({
      backdropFilter: "contrast(1)",
    });
  });

  it('dot("backdrop-contrast-125") → backdropFilter: contrast(1.25)', () => {
    expect(dot("backdrop-contrast-125")).toEqual({
      backdropFilter: "contrast(1.25)",
    });
  });

  it('dot("backdrop-contrast-150") → backdropFilter: contrast(1.5)', () => {
    expect(dot("backdrop-contrast-150")).toEqual({
      backdropFilter: "contrast(1.5)",
    });
  });

  it('dot("backdrop-contrast-200") → backdropFilter: contrast(2)', () => {
    expect(dot("backdrop-contrast-200")).toEqual({
      backdropFilter: "contrast(2)",
    });
  });
});

describe("backdrop-filter: backdrop-saturate-*", () => {
  it('dot("backdrop-saturate-0") → backdropFilter: saturate(0)', () => {
    expect(dot("backdrop-saturate-0")).toEqual({
      backdropFilter: "saturate(0)",
    });
  });

  it('dot("backdrop-saturate-50") → backdropFilter: saturate(.5)', () => {
    expect(dot("backdrop-saturate-50")).toEqual({
      backdropFilter: "saturate(.5)",
    });
  });

  it('dot("backdrop-saturate-100") → backdropFilter: saturate(1)', () => {
    expect(dot("backdrop-saturate-100")).toEqual({
      backdropFilter: "saturate(1)",
    });
  });

  it('dot("backdrop-saturate-150") → backdropFilter: saturate(1.5)', () => {
    expect(dot("backdrop-saturate-150")).toEqual({
      backdropFilter: "saturate(1.5)",
    });
  });

  it('dot("backdrop-saturate-200") → backdropFilter: saturate(2)', () => {
    expect(dot("backdrop-saturate-200")).toEqual({
      backdropFilter: "saturate(2)",
    });
  });
});

// ---------------------------------------------------------------------------
// 10. Backdrop filter — grayscale / sepia / invert
// ---------------------------------------------------------------------------
describe("backdrop-filter: backdrop-grayscale / backdrop-sepia / backdrop-invert", () => {
  it('dot("backdrop-grayscale") → backdropFilter: grayscale(100%)', () => {
    expect(dot("backdrop-grayscale")).toEqual({
      backdropFilter: "grayscale(100%)",
    });
  });

  it('dot("backdrop-grayscale-0") → backdropFilter: grayscale(0)', () => {
    expect(dot("backdrop-grayscale-0")).toEqual({
      backdropFilter: "grayscale(0)",
    });
  });

  it('dot("backdrop-sepia") → backdropFilter: sepia(100%)', () => {
    expect(dot("backdrop-sepia")).toEqual({ backdropFilter: "sepia(100%)" });
  });

  it('dot("backdrop-sepia-0") → backdropFilter: sepia(0)', () => {
    expect(dot("backdrop-sepia-0")).toEqual({ backdropFilter: "sepia(0)" });
  });

  it('dot("backdrop-invert") → backdropFilter: invert(100%)', () => {
    expect(dot("backdrop-invert")).toEqual({ backdropFilter: "invert(100%)" });
  });

  it('dot("backdrop-invert-0") → backdropFilter: invert(0)', () => {
    expect(dot("backdrop-invert-0")).toEqual({ backdropFilter: "invert(0)" });
  });
});

// ---------------------------------------------------------------------------
// 11. Backdrop filter — hue-rotate
// ---------------------------------------------------------------------------
describe("backdrop-filter: backdrop-hue-rotate-*", () => {
  it('dot("backdrop-hue-rotate-0") → backdropFilter: hue-rotate(0deg)', () => {
    expect(dot("backdrop-hue-rotate-0")).toEqual({
      backdropFilter: "hue-rotate(0deg)",
    });
  });

  it('dot("backdrop-hue-rotate-90") → backdropFilter: hue-rotate(90deg)', () => {
    expect(dot("backdrop-hue-rotate-90")).toEqual({
      backdropFilter: "hue-rotate(90deg)",
    });
  });

  it('dot("backdrop-hue-rotate-180") → backdropFilter: hue-rotate(180deg)', () => {
    expect(dot("backdrop-hue-rotate-180")).toEqual({
      backdropFilter: "hue-rotate(180deg)",
    });
  });
});

// ---------------------------------------------------------------------------
// 12. Backdrop filter — opacity
// ---------------------------------------------------------------------------
describe("backdrop-filter: backdrop-opacity-*", () => {
  it('dot("backdrop-opacity-0") → backdropFilter: opacity(0)', () => {
    expect(dot("backdrop-opacity-0")).toEqual({ backdropFilter: "opacity(0)" });
  });

  it('dot("backdrop-opacity-50") → backdropFilter: opacity(0.5)', () => {
    expect(dot("backdrop-opacity-50")).toEqual({
      backdropFilter: "opacity(0.5)",
    });
  });

  it('dot("backdrop-opacity-75") → backdropFilter: opacity(0.75)', () => {
    expect(dot("backdrop-opacity-75")).toEqual({
      backdropFilter: "opacity(0.75)",
    });
  });

  it('dot("backdrop-opacity-100") → backdropFilter: opacity(1)', () => {
    expect(dot("backdrop-opacity-100")).toEqual({
      backdropFilter: "opacity(1)",
    });
  });
});

// ---------------------------------------------------------------------------
// 13. Transition — property
// ---------------------------------------------------------------------------
describe("transition: transition-*", () => {
  it('dot("transition-all") → transitionProperty: all', () => {
    expect(dot("transition-all")).toEqual({ transitionProperty: "all" });
  });

  it('dot("transition-none") → transitionProperty: none', () => {
    expect(dot("transition-none")).toEqual({ transitionProperty: "none" });
  });

  it('dot("transition-colors") → transitionProperty contains "color"', () => {
    const result = dot("transition-colors");
    expect(result).toHaveProperty("transitionProperty");
    expect(result.transitionProperty).toContain("color");
  });

  it('dot("transition-opacity") → transitionProperty: opacity', () => {
    expect(dot("transition-opacity")).toEqual({
      transitionProperty: "opacity",
    });
  });

  it('dot("transition-shadow") → transitionProperty: box-shadow', () => {
    expect(dot("transition-shadow")).toEqual({
      transitionProperty: "box-shadow",
    });
  });

  it('dot("transition-transform") → transitionProperty: transform', () => {
    expect(dot("transition-transform")).toEqual({
      transitionProperty: "transform",
    });
  });

  it('dot("transition") bare → transitionProperty containing filter and backdrop-filter', () => {
    const result = dot("transition");
    expect(result).toHaveProperty("transitionProperty");
    expect(result.transitionProperty).toContain("filter");
    expect(result.transitionProperty).toContain("backdrop-filter");
  });
});

// ---------------------------------------------------------------------------
// 14. Transition — duration
// ---------------------------------------------------------------------------
describe("transition: duration-*", () => {
  it('dot("duration-0") → transitionDuration: 0s', () => {
    expect(dot("duration-0")).toEqual({ transitionDuration: "0s" });
  });

  it('dot("duration-75") → transitionDuration: 75ms', () => {
    expect(dot("duration-75")).toEqual({ transitionDuration: "75ms" });
  });

  it('dot("duration-100") → transitionDuration: 100ms', () => {
    expect(dot("duration-100")).toEqual({ transitionDuration: "100ms" });
  });

  it('dot("duration-150") → transitionDuration: 150ms', () => {
    expect(dot("duration-150")).toEqual({ transitionDuration: "150ms" });
  });

  it('dot("duration-200") → transitionDuration: 200ms', () => {
    expect(dot("duration-200")).toEqual({ transitionDuration: "200ms" });
  });

  it('dot("duration-300") → transitionDuration: 300ms', () => {
    expect(dot("duration-300")).toEqual({ transitionDuration: "300ms" });
  });

  it('dot("duration-500") → transitionDuration: 500ms', () => {
    expect(dot("duration-500")).toEqual({ transitionDuration: "500ms" });
  });

  it('dot("duration-700") → transitionDuration: 700ms', () => {
    expect(dot("duration-700")).toEqual({ transitionDuration: "700ms" });
  });

  it('dot("duration-1000") → transitionDuration: 1000ms', () => {
    expect(dot("duration-1000")).toEqual({ transitionDuration: "1000ms" });
  });

  it("unknown duration returns empty object", () => {
    expect(dot("duration-999")).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// 15. Transition — timing function (ease)
// ---------------------------------------------------------------------------
describe("transition: ease-*", () => {
  it('dot("ease-linear") → transitionTimingFunction: linear', () => {
    expect(dot("ease-linear")).toEqual({ transitionTimingFunction: "linear" });
  });

  it('dot("ease-in") → transitionTimingFunction: cubic-bezier(0.4, 0, 1, 1)', () => {
    expect(dot("ease-in")).toEqual({
      transitionTimingFunction: "cubic-bezier(0.4, 0, 1, 1)",
    });
  });

  it('dot("ease-out") → transitionTimingFunction: cubic-bezier(0, 0, 0.2, 1)', () => {
    expect(dot("ease-out")).toEqual({
      transitionTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
    });
  });

  it('dot("ease-in-out") → transitionTimingFunction: cubic-bezier(0.4, 0, 0.2, 1)', () => {
    expect(dot("ease-in-out")).toEqual({
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    });
  });

  it('dot("ease-spring") → transitionTimingFunction: cubic-bezier(0.34, 1.56, 0.64, 1)', () => {
    expect(dot("ease-spring")).toEqual({
      transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    });
  });

  it('dot("ease-bounce") → transitionTimingFunction: cubic-bezier(0.68, -0.55, 0.265, 1.55)', () => {
    expect(dot("ease-bounce")).toEqual({
      transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    });
  });

  it('dot("ease-snap") → transitionTimingFunction: cubic-bezier(0.2, 0.8, 0.2, 1)', () => {
    expect(dot("ease-snap")).toEqual({
      transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    });
  });
});

// ---------------------------------------------------------------------------
// 16. Transition — delay
// ---------------------------------------------------------------------------
describe("transition: delay-*", () => {
  it('dot("delay-0") → transitionDelay: 0s', () => {
    expect(dot("delay-0")).toEqual({ transitionDelay: "0s" });
  });

  it('dot("delay-75") → transitionDelay: 75ms', () => {
    expect(dot("delay-75")).toEqual({ transitionDelay: "75ms" });
  });

  it('dot("delay-100") → transitionDelay: 100ms', () => {
    expect(dot("delay-100")).toEqual({ transitionDelay: "100ms" });
  });

  it('dot("delay-150") → transitionDelay: 150ms', () => {
    expect(dot("delay-150")).toEqual({ transitionDelay: "150ms" });
  });

  it('dot("delay-200") → transitionDelay: 200ms', () => {
    expect(dot("delay-200")).toEqual({ transitionDelay: "200ms" });
  });

  it('dot("delay-300") → transitionDelay: 300ms', () => {
    expect(dot("delay-300")).toEqual({ transitionDelay: "300ms" });
  });

  it('dot("delay-500") → transitionDelay: 500ms', () => {
    expect(dot("delay-500")).toEqual({ transitionDelay: "500ms" });
  });

  it('dot("delay-700") → transitionDelay: 700ms', () => {
    expect(dot("delay-700")).toEqual({ transitionDelay: "700ms" });
  });
});

// ---------------------------------------------------------------------------
// 17. Animation
// ---------------------------------------------------------------------------
describe("animation: animate-*", () => {
  it('dot("animate-none") → animation: none', () => {
    expect(dot("animate-none")).toEqual({ animation: "none" });
  });

  it('dot("animate-spin") → animation contains "spin"', () => {
    const result = dot("animate-spin");
    expect(result).toHaveProperty("animation");
    expect(result.animation).toContain("spin");
  });

  it('dot("animate-spin") → animation is "spin 1s linear infinite"', () => {
    expect(dot("animate-spin")).toEqual({
      animation: "spin 1s linear infinite",
    });
  });

  it('dot("animate-ping") → animation contains "ping"', () => {
    const result = dot("animate-ping");
    expect(result).toHaveProperty("animation");
    expect(result.animation).toContain("ping");
  });

  it('dot("animate-ping") → animation is "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite"', () => {
    expect(dot("animate-ping")).toEqual({
      animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
    });
  });

  it('dot("animate-pulse") → animation contains "pulse"', () => {
    const result = dot("animate-pulse");
    expect(result).toHaveProperty("animation");
    expect(result.animation).toContain("pulse");
  });

  it('dot("animate-pulse") → animation is "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"', () => {
    expect(dot("animate-pulse")).toEqual({
      animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    });
  });

  it('dot("animate-bounce") → animation contains "bounce"', () => {
    const result = dot("animate-bounce");
    expect(result).toHaveProperty("animation");
    expect(result.animation).toContain("bounce");
  });

  it('dot("animate-bounce") → animation is "bounce 1s infinite"', () => {
    expect(dot("animate-bounce")).toEqual({ animation: "bounce 1s infinite" });
  });

  it("unknown animate value returns empty object", () => {
    expect(dot("animate-unknown")).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// 18. Mix-blend-mode
// ---------------------------------------------------------------------------
describe("mix-blend-*", () => {
  it('dot("mix-blend-normal") → mixBlendMode: normal', () => {
    expect(dot("mix-blend-normal")).toEqual({ mixBlendMode: "normal" });
  });

  it('dot("mix-blend-multiply") → mixBlendMode: multiply', () => {
    expect(dot("mix-blend-multiply")).toEqual({ mixBlendMode: "multiply" });
  });

  it('dot("mix-blend-screen") → mixBlendMode: screen', () => {
    expect(dot("mix-blend-screen")).toEqual({ mixBlendMode: "screen" });
  });

  it('dot("mix-blend-overlay") → mixBlendMode: overlay', () => {
    expect(dot("mix-blend-overlay")).toEqual({ mixBlendMode: "overlay" });
  });

  it('dot("mix-blend-darken") → mixBlendMode: darken', () => {
    expect(dot("mix-blend-darken")).toEqual({ mixBlendMode: "darken" });
  });

  it('dot("mix-blend-lighten") → mixBlendMode: lighten', () => {
    expect(dot("mix-blend-lighten")).toEqual({ mixBlendMode: "lighten" });
  });

  it('dot("mix-blend-color-dodge") → mixBlendMode: color-dodge', () => {
    expect(dot("mix-blend-color-dodge")).toEqual({
      mixBlendMode: "color-dodge",
    });
  });

  it('dot("mix-blend-color-burn") → mixBlendMode: color-burn', () => {
    expect(dot("mix-blend-color-burn")).toEqual({ mixBlendMode: "color-burn" });
  });

  it('dot("mix-blend-hard-light") → mixBlendMode: hard-light', () => {
    expect(dot("mix-blend-hard-light")).toEqual({ mixBlendMode: "hard-light" });
  });

  it('dot("mix-blend-soft-light") → mixBlendMode: soft-light', () => {
    expect(dot("mix-blend-soft-light")).toEqual({ mixBlendMode: "soft-light" });
  });

  it('dot("mix-blend-difference") → mixBlendMode: difference', () => {
    expect(dot("mix-blend-difference")).toEqual({ mixBlendMode: "difference" });
  });

  it('dot("mix-blend-exclusion") → mixBlendMode: exclusion', () => {
    expect(dot("mix-blend-exclusion")).toEqual({ mixBlendMode: "exclusion" });
  });

  it('dot("mix-blend-hue") → mixBlendMode: hue', () => {
    expect(dot("mix-blend-hue")).toEqual({ mixBlendMode: "hue" });
  });

  it('dot("mix-blend-saturation") → mixBlendMode: saturation', () => {
    expect(dot("mix-blend-saturation")).toEqual({ mixBlendMode: "saturation" });
  });

  it('dot("mix-blend-color") → mixBlendMode: color', () => {
    expect(dot("mix-blend-color")).toEqual({ mixBlendMode: "color" });
  });

  it('dot("mix-blend-luminosity") → mixBlendMode: luminosity', () => {
    expect(dot("mix-blend-luminosity")).toEqual({ mixBlendMode: "luminosity" });
  });

  it('dot("mix-blend-plus-lighter") → mixBlendMode: plus-lighter', () => {
    expect(dot("mix-blend-plus-lighter")).toEqual({
      mixBlendMode: "plus-lighter",
    });
  });

  it("unknown mix-blend value returns empty object", () => {
    expect(dot("mix-blend-unknown")).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// 19. Combination tests — filter accumulation
// ---------------------------------------------------------------------------
describe("combination: filter accumulation via dot()", () => {
  it("blur-sm + brightness-110 + contrast-125 → single filter string", () => {
    const result = dot("blur-sm brightness-110 contrast-125");
    expect(result).toEqual({
      filter: "blur(4px) brightness(1.1) contrast(1.25)",
    });
  });

  it("blur-md + brightness-75 → accumulated filter", () => {
    const result = dot("blur-md brightness-75");
    expect(result.filter).toBe("blur(12px) brightness(.75)");
  });

  it("grayscale + sepia → accumulated filter", () => {
    const result = dot("grayscale sepia");
    expect(result.filter).toBe("grayscale(100%) sepia(100%)");
  });

  it("blur-lg + saturate-150 + hue-rotate-90 → accumulated filter", () => {
    const result = dot("blur-lg saturate-150 hue-rotate-90");
    expect(result.filter).toBe("blur(16px) saturate(1.5) hue-rotate(90deg)");
  });

  it("invert + hue-rotate-180 → accumulated filter", () => {
    const result = dot("invert hue-rotate-180");
    expect(result.filter).toBe("invert(100%) hue-rotate(180deg)");
  });

  it("drop-shadow-sm + blur-sm → drop-shadow precedes blur", () => {
    const result = dot("drop-shadow-sm blur-sm");
    expect(result.filter).toBe(
      "drop-shadow(0 1px 1px rgb(0 0 0 / 0.05)) blur(4px)",
    );
  });

  it("filter utilities + non-filter utilities coexist without interference", () => {
    const result = dot("blur-md p-4 opacity-50");
    expect(result).toEqual({
      filter: "blur(12px)",
      padding: "16px",
      opacity: "0.5",
    });
  });
});

// ---------------------------------------------------------------------------
// 20. Combination tests — transition accumulation
// ---------------------------------------------------------------------------
describe("combination: transition-all + duration-300 + ease-in-out", () => {
  it("produces three distinct CSS properties", () => {
    const result = dot("transition-all duration-300 ease-in-out");
    expect(result).toEqual({
      transitionProperty: "all",
      transitionDuration: "300ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    });
  });

  it("transition + duration-200 + ease-in + delay-100", () => {
    const result = dot("transition duration-200 ease-in delay-100");
    expect(result).toHaveProperty("transitionProperty");
    expect(result.transitionDuration).toBe("200ms");
    expect(result.transitionTimingFunction).toBe("cubic-bezier(0.4, 0, 1, 1)");
    expect(result.transitionDelay).toBe("100ms");
  });

  it("transition-opacity + duration-500 + ease-out + delay-300", () => {
    const result = dot("transition-opacity duration-500 ease-out delay-300");
    expect(result).toEqual({
      transitionProperty: "opacity",
      transitionDuration: "500ms",
      transitionTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
      transitionDelay: "300ms",
    });
  });

  it("transition-colors + duration-150 + ease-in-out", () => {
    const result = dot("transition-colors duration-150 ease-in-out");
    expect(result.transitionProperty).toContain("color");
    expect(result.transitionDuration).toBe("150ms");
    expect(result.transitionTimingFunction).toBe(
      "cubic-bezier(0.4, 0, 0.2, 1)",
    );
  });
});

// ---------------------------------------------------------------------------
// 21. Combination tests — backdrop filter accumulation
// ---------------------------------------------------------------------------
describe("combination: backdrop filter accumulation via dot()", () => {
  it("backdrop-blur-md + backdrop-saturate-150", () => {
    const result = dot("backdrop-blur-md backdrop-saturate-150");
    expect(result).toEqual({
      backdropFilter: "blur(12px) saturate(1.5)",
    });
  });

  it("backdrop-blur-sm + backdrop-brightness-125 + backdrop-contrast-75", () => {
    const result = dot(
      "backdrop-blur-sm backdrop-brightness-125 backdrop-contrast-75",
    );
    expect(result.backdropFilter).toBe(
      "blur(4px) brightness(1.25) contrast(.75)",
    );
  });

  it("backdrop-blur-lg + backdrop-grayscale", () => {
    const result = dot("backdrop-blur-lg backdrop-grayscale");
    expect(result.backdropFilter).toBe("blur(16px) grayscale(100%)");
  });

  it("backdrop-saturate-200 + backdrop-invert", () => {
    const result = dot("backdrop-saturate-200 backdrop-invert");
    expect(result.backdropFilter).toBe("saturate(2) invert(100%)");
  });

  it("backdrop-blur-xl + backdrop-brightness-75 + backdrop-sepia", () => {
    const result = dot(
      "backdrop-blur-xl backdrop-brightness-75 backdrop-sepia",
    );
    expect(result.backdropFilter).toBe(
      "blur(24px) brightness(.75) sepia(100%)",
    );
  });

  it("filter and backdropFilter are independent properties", () => {
    const result = dot("blur-md backdrop-blur-sm");
    expect(result.filter).toBe("blur(12px)");
    expect(result.backdropFilter).toBe("blur(4px)");
  });
});

// ---------------------------------------------------------------------------
// 22. Arbitrary value tests
// ---------------------------------------------------------------------------
describe("arbitrary values: filter", () => {
  it('dot("blur-[4px]") → filter: blur(4px)', () => {
    expect(dot("blur-[4px]")).toEqual({ filter: "blur(4px)" });
  });

  it('dot("blur-[2px]") → filter: blur(2px)', () => {
    expect(dot("blur-[2px]")).toEqual({ filter: "blur(2px)" });
  });

  it('dot("blur-[0.5rem]") → filter: blur(0.5rem)', () => {
    expect(dot("blur-[0.5rem]")).toEqual({ filter: "blur(0.5rem)" });
  });

  it('dot("brightness-[1.3]") → filter: brightness(1.3)', () => {
    expect(dot("brightness-[1.3]")).toEqual({ filter: "brightness(1.3)" });
  });

  it('dot("brightness-[.3]") → filter: brightness(.3)', () => {
    expect(dot("brightness-[.3]")).toEqual({ filter: "brightness(.3)" });
  });

  it('dot("contrast-[0.8]") → filter: contrast(0.8)', () => {
    expect(dot("contrast-[0.8]")).toEqual({ filter: "contrast(0.8)" });
  });

  it('dot("saturate-[1.75]") → filter: saturate(1.75)', () => {
    expect(dot("saturate-[1.75]")).toEqual({ filter: "saturate(1.75)" });
  });

  it('dot("grayscale-[50%]") → filter: grayscale(50%)', () => {
    expect(dot("grayscale-[50%]")).toEqual({ filter: "grayscale(50%)" });
  });

  it('dot("hue-rotate-[270deg]") → filter: hue-rotate(270deg)', () => {
    expect(dot("hue-rotate-[270deg]")).toEqual({
      filter: "hue-rotate(270deg)",
    });
  });

  it('dot("drop-shadow-[0_2px_4px_black]") → underscores replaced with spaces', () => {
    expect(dot("drop-shadow-[0_2px_4px_black]")).toEqual({
      filter: "drop-shadow(0 2px 4px black)",
    });
  });
});

describe("arbitrary values: transition / delay / duration", () => {
  it('dot("duration-[250ms]") → transitionDuration: 250ms', () => {
    expect(dot("duration-[250ms]")).toEqual({ transitionDuration: "250ms" });
  });

  it('dot("duration-[0.4s]") → transitionDuration: 0.4s', () => {
    expect(dot("duration-[0.4s]")).toEqual({ transitionDuration: "0.4s" });
  });

  it('dot("delay-[150ms]") → transitionDelay: 150ms', () => {
    expect(dot("delay-[150ms]")).toEqual({ transitionDelay: "150ms" });
  });

  it('dot("delay-[0.2s]") → transitionDelay: 0.2s', () => {
    expect(dot("delay-[0.2s]")).toEqual({ transitionDelay: "0.2s" });
  });

  it('dot("transition-[width]") → transitionProperty: width', () => {
    expect(dot("transition-[width]")).toEqual({ transitionProperty: "width" });
  });

  it('dot("transition-[width,transform]") → transitionProperty: width,transform', () => {
    expect(dot("transition-[width,transform]")).toEqual({
      transitionProperty: "width,transform",
    });
  });

  it('dot("ease-[cubic-bezier(0.4,0,0.2,1)]") → transitionTimingFunction passthrough', () => {
    expect(dot("ease-[cubic-bezier(0.4,0,0.2,1)]")).toEqual({
      transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
    });
  });
});

// ---------------------------------------------------------------------------
// 23. Dark variant tests
// ---------------------------------------------------------------------------
describe("dark variant: filter / transition / animation", () => {
  it("dark:blur-lg wins over blur-sm when dark=true", () => {
    expect(dot("blur-sm dark:blur-lg", { dark: true })).toEqual({
      filter: "blur(16px)",
    });
  });

  it("blur-sm wins when dark=false", () => {
    expect(dot("blur-sm dark:blur-lg", { dark: false })).toEqual({
      filter: "blur(4px)",
    });
  });

  it("dark:animate-spin overrides animate-none when dark=true", () => {
    const result = dot("animate-none dark:animate-spin", { dark: true });
    expect(result.animation).toContain("spin");
  });

  it("dark:transition-all applies when dark=true", () => {
    expect(
      dot("transition-opacity dark:transition-all", { dark: true }),
    ).toEqual({
      transitionProperty: "all",
    });
  });

  it("dark:backdrop-blur-xl applies when dark=true", () => {
    expect(
      dot("backdrop-blur-sm dark:backdrop-blur-xl", { dark: true }),
    ).toEqual({
      backdropFilter: "blur(24px)",
    });
  });
});

// ---------------------------------------------------------------------------
// 24. Complex real-world combinations
// ---------------------------------------------------------------------------
describe("real-world combinations", () => {
  it("glass morphism card: backdrop-blur-md + backdrop-saturate-150 + backdrop-brightness-110", () => {
    const result = dot(
      "backdrop-blur-md backdrop-saturate-150 backdrop-brightness-110",
    );
    expect(result.backdropFilter).toBe(
      "blur(12px) saturate(1.5) brightness(1.1)",
    );
  });

  it("image tint: grayscale + sepia + hue-rotate-180", () => {
    const result = dot("grayscale sepia hue-rotate-180");
    expect(result.filter).toBe(
      "grayscale(100%) sepia(100%) hue-rotate(180deg)",
    );
  });

  it("button hover transition: transition-all + duration-200 + ease-in-out + delay-0", () => {
    const result = dot("transition-all duration-200 ease-in-out delay-0");
    expect(result).toEqual({
      transitionProperty: "all",
      transitionDuration: "200ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      transitionDelay: "0s",
    });
  });

  it("loading spinner: animate-spin + opacity", () => {
    const result = dot("animate-spin opacity-75");
    expect(result.animation).toBe("spin 1s linear infinite");
    expect(result.opacity).toBe("0.75");
  });

  it("pulse overlay: animate-pulse + backdrop-blur-sm + mix-blend-overlay", () => {
    const result = dot("animate-pulse backdrop-blur-sm mix-blend-overlay");
    expect(result.animation).toContain("pulse");
    expect(result.backdropFilter).toBe("blur(4px)");
    expect(result.mixBlendMode).toBe("overlay");
  });

  it("filter + transition combined: blur-sm + transition-all + duration-300", () => {
    const result = dot("blur-sm transition-all duration-300");
    expect(result.filter).toBe("blur(4px)");
    expect(result.transitionProperty).toBe("all");
    expect(result.transitionDuration).toBe("300ms");
  });

  it("photo editor effect: brightness-125 + contrast-110 + saturate-150 + hue-rotate-15", () => {
    const result = dot(
      "brightness-125 contrast-125 saturate-150 hue-rotate-15",
    );
    expect(result.filter).toBe(
      "brightness(1.25) contrast(1.25) saturate(1.5) hue-rotate(15deg)",
    );
  });
});

// ---------------------------------------------------------------------------
// 25. Edge cases — unknown tokens
// ---------------------------------------------------------------------------
describe("edge cases: unknown tokens return empty", () => {
  it("blur-unknown → {}", () => {
    expect(dot("blur-unknown")).toEqual({});
  });

  it("brightness-999 → {}", () => {
    expect(dot("brightness-999")).toEqual({});
  });

  it("contrast-999 → {}", () => {
    expect(dot("contrast-999")).toEqual({});
  });

  it("saturate-999 → {}", () => {
    expect(dot("saturate-999")).toEqual({});
  });

  it("hue-rotate-45 (not in token table) → {}", () => {
    expect(dot("hue-rotate-45")).toEqual({});
  });

  it("animate-flip (unknown) → {}", () => {
    expect(dot("animate-flip")).toEqual({});
  });

  it("mix-blend-unknown → {}", () => {
    expect(dot("mix-blend-unknown")).toEqual({});
  });

  it("backdrop-blur-unknown → {}", () => {
    expect(dot("backdrop-blur-unknown")).toEqual({});
  });
});
