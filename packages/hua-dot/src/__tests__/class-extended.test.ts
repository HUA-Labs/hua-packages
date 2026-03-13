import { describe, it, expect, beforeEach } from "vitest";
import {
  dotClass,
  dotCSS,
  dotFlush,
  dotReset,
  syncClassConfig,
} from "../class";
import { createDotConfig } from "../index";

beforeEach(() => {
  dotReset();
});

describe("dotCSS — extended coverage", () => {
  describe("pseudo-elements", () => {
    it("before:content-none generates ::before rule", () => {
      const { css } = dotCSS("before:p-4");
      expect(css).toMatch(/::before/);
      expect(css).toContain("padding: 16px");
    });

    it("after:block generates ::after rule", () => {
      const { css } = dotCSS("after:block");
      expect(css).toMatch(/::after/);
      expect(css).toContain("display: block");
    });

    it("placeholder:text-gray-400 generates ::placeholder rule", () => {
      const { css } = dotCSS("placeholder:text-gray-400");
      expect(css).toMatch(/::placeholder/);
      expect(css).toContain("color");
    });
  });

  describe("group variants", () => {
    it("group-hover:opacity-100 generates correct selector", () => {
      const { css } = dotCSS("group-hover:opacity-100");
      expect(css).toContain(".group:hover");
      expect(css).toContain("opacity: 1");
    });

    it("group-focus:ring-2 generates correct selector", () => {
      const { css } = dotCSS("group-focus:ring-2");
      expect(css).toContain(".group:focus");
    });

    it("group-active:scale-95 generates correct selector", () => {
      const { css } = dotCSS("group-active:scale-95");
      expect(css).toContain(".group:active");
    });
  });

  describe("peer variants", () => {
    it("peer-checked:bg-primary-500 generates correct selector", () => {
      const { css } = dotCSS("peer-checked:bg-primary-500");
      expect(css).toContain(".peer:checked ~");
      expect(css).toContain("background-color");
    });

    it("peer-focus:border-primary-500 generates correct selector", () => {
      const { css } = dotCSS("peer-focus:border-primary-500");
      expect(css).toContain(".peer:focus ~");
    });

    it("peer-hover:text-white generates correct selector", () => {
      const { css } = dotCSS("peer-hover:text-white");
      expect(css).toContain(".peer:hover ~");
      expect(css).toContain("color");
    });

    it("peer-disabled:opacity-50 generates correct selector", () => {
      const { css } = dotCSS("peer-disabled:opacity-50");
      expect(css).toContain(".peer:disabled ~");
      expect(css).toContain("opacity: 0.5");
    });
  });

  describe("child position variants", () => {
    it("first:pt-0 generates :first-child rule", () => {
      const { css } = dotCSS("first:pt-0");
      expect(css).toMatch(/:first-child/);
      expect(css).toContain("padding-top: 0px");
    });

    it("last:pb-0 generates :last-child rule", () => {
      const { css } = dotCSS("last:pb-0");
      expect(css).toMatch(/:last-child/);
      expect(css).toContain("padding-bottom");
    });

    it("odd:bg-gray-50 generates :nth-child(odd)", () => {
      const { css } = dotCSS("odd:bg-gray-50");
      expect(css).toMatch(/:nth-child\(odd\)/);
    });

    it("even:bg-white generates :nth-child(even)", () => {
      const { css } = dotCSS("even:bg-white");
      expect(css).toMatch(/:nth-child\(even\)/);
    });

    it("first-of-type:mt-0 generates :first-of-type", () => {
      const { css } = dotCSS("first-of-type:mt-0");
      expect(css).toMatch(/:first-of-type/);
    });

    it("last-of-type:mb-0 generates :last-of-type", () => {
      const { css } = dotCSS("last-of-type:mb-0");
      expect(css).toMatch(/:last-of-type/);
    });

    it("only:mx-auto generates :only-child", () => {
      const { css } = dotCSS("only:mx-auto");
      expect(css).toMatch(/:only-child/);
    });
  });

  describe("dark mode variants", () => {
    it("dark:text-white with class mode (default)", () => {
      const { css } = dotCSS("dark:text-white");
      expect(css).toContain(".dark");
      expect(css).toContain("color");
    });

    it("dark:bg-gray-800 with media mode", () => {
      const { css } = dotCSS("dark:bg-gray-800", { darkMode: "media" });
      expect(css).toContain("@media (prefers-color-scheme: dark)");
      expect(css).toContain("background-color");
    });

    it("dark:opacity-50 class vs media produces different CSS", () => {
      const { css: classCSS } = dotCSS("dark:opacity-50", {
        darkMode: "class",
      });
      const { css: mediaCSS } = dotCSS("dark:opacity-50", {
        darkMode: "media",
      });
      expect(classCSS).not.toEqual(mediaCSS);
      expect(classCSS).toContain(".dark");
      expect(mediaCSS).toContain("@media");
    });
  });

  describe("responsive + dark combination", () => {
    it("md:dark:bg-white generates both @media and .dark", () => {
      const { css } = dotCSS("md:dark:bg-white");
      expect(css).toContain("@media");
      expect(css).toContain(".dark");
      expect(css).toContain("background-color");
    });

    it("dark:md:p-8 with breakpoint first", () => {
      const { css } = dotCSS("dark:md:p-8");
      expect(css).toContain("@media");
      expect(css).toContain("padding: 32px");
    });
  });

  describe("CSS property names are kebab-case", () => {
    it("backgroundColor converts to background-color", () => {
      const { css } = dotCSS("bg-red-500");
      expect(css).toContain("background-color");
      expect(css).not.toContain("backgroundColor");
    });

    it("borderRadius converts to border-radius", () => {
      const { css } = dotCSS("rounded-lg");
      expect(css).toContain("border-radius");
      expect(css).not.toContain("borderRadius");
    });

    it("paddingLeft converts to padding-left", () => {
      const { css } = dotCSS("pl-4");
      expect(css).toContain("padding-left");
      expect(css).not.toContain("paddingLeft");
    });

    it("transitionDuration converts to transition-duration", () => {
      const { css } = dotCSS("duration-200");
      expect(css).toContain("transition-duration");
      expect(css).not.toContain("transitionDuration");
    });

    it("letterSpacing converts to letter-spacing", () => {
      const { css } = dotCSS("tracking-wide");
      expect(css).toContain("letter-spacing");
      expect(css).not.toContain("letterSpacing");
    });
  });

  describe("atomic naming mode — extended", () => {
    it("atomic class names use token raw string", () => {
      const cls = dotClass("hover:bg-red-500", { naming: "atomic" });
      expect(cls).toContain("hover");
      expect(cls).toContain("bg");
    });

    it("atomic mode: state variants get individual classes", () => {
      const { css } = dotCSS("p-4 hover:bg-gray-100 focus:ring-2", {
        naming: "atomic",
      });
      expect(css).toContain("padding: 16px");
      expect(css).toContain(":hover");
      expect(css).toContain(":focus");
    });

    it("atomic mode: responsive class", () => {
      const { css } = dotCSS("sm:p-8", { naming: "atomic" });
      expect(css).toContain("@media");
      expect(css).toContain("padding: 32px");
    });

    it("atomic mode: group variant class", () => {
      const { css } = dotCSS("group-hover:text-white", { naming: "atomic" });
      expect(css).toContain(".group:hover");
      expect(css).toContain("color");
    });
  });

  describe("hash mode determinism", () => {
    it("same input always produces same hash", () => {
      const a = dotClass("p-4 flex bg-white hover:bg-gray-100");
      dotReset();
      const b = dotClass("p-4 flex bg-white hover:bg-gray-100");
      expect(a).toBe(b);
    });

    it("different inputs have different hashes", () => {
      const inputs = ["p-4", "p-8", "m-4", "bg-white", "flex items-center"];
      const classes = inputs.map((i) => dotClass(i));
      const unique = new Set(classes);
      expect(unique.size).toBe(inputs.length);
    });
  });

  describe("flush behavior", () => {
    it("flush collects CSS from multiple dotCSS calls", () => {
      dotCSS("p-4");
      dotCSS("m-2");
      dotCSS("bg-white rounded-lg");
      const flushed = dotFlush();
      expect(flushed).toContain("padding: 16px");
      expect(flushed).toContain("margin: 8px");
      expect(flushed).toContain("background-color");
      expect(flushed).toContain("border-radius");
    });

    it("flush is empty after reset", () => {
      dotCSS("p-4");
      dotReset();
      expect(dotFlush()).toBe("");
    });

    it("flush clears buffer after call", () => {
      dotCSS("p-4");
      dotFlush();
      expect(dotFlush()).toBe("");
    });

    it("flush includes re-added rules after flush", () => {
      dotCSS("p-4");
      dotFlush(); // clears
      dotCSS("m-2");
      const flushed = dotFlush();
      expect(flushed).toContain("margin: 8px");
      expect(flushed).not.toContain("padding");
    });
  });

  describe("!important in class mode", () => {
    it("!p-4 generates CSS with !important", () => {
      const { css } = dotCSS("!p-4");
      expect(css).toContain("!important");
      expect(css).toContain("padding: 16px !important");
    });

    it("!m-2 generates margin with !important", () => {
      const { css } = dotCSS("!m-2");
      expect(css).toContain("margin: 8px !important");
    });
  });

  describe("complex real-world class mode patterns", () => {
    it("table row with odd/even striping", () => {
      const { css } = dotCSS(
        "p-4 odd:bg-gray-50 even:bg-white hover:bg-blue-50",
      );
      expect(css).toContain("padding: 16px");
      expect(css).toMatch(/:nth-child\(odd\)/);
      expect(css).toMatch(/:nth-child\(even\)/);
      expect(css).toMatch(/:hover/);
    });

    it("form control with focus + peer states", () => {
      const { className, css } = dotCSS(
        "peer-checked:bg-primary-500 focus:ring-2",
      );
      expect(className).toMatch(/^dot-/);
      expect(css).toContain(".peer:checked ~");
      expect(css).toContain(":focus");
    });

    it("navigation item with first/last modifiers", () => {
      const { css } = dotCSS("p-2 first:rounded-t-lg last:rounded-b-lg");
      expect(css).toContain("padding: 8px");
      expect(css).toMatch(/:first-child/);
      expect(css).toMatch(/:last-child/);
    });

    it("gradient with responsive + dark", () => {
      const { css } = dotCSS(
        "bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-700 dark:to-purple-700",
      );
      expect(css).toContain("background-image");
      expect(css).toContain(".dark");
    });
  });

  describe("syncClassConfig integration", () => {
    it("custom theme resolves after sync", () => {
      createDotConfig({
        theme: { colors: { neon: { "500": "#39ff14" } } },
      });
      syncClassConfig();

      const { css } = dotCSS("bg-neon-500");
      expect(css).toContain("#39ff14");

      createDotConfig();
      syncClassConfig();
    });
  });
});
