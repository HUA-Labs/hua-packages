import { describe, it, expect, beforeEach } from "vitest";
import { dotCSS, dotReset } from "../../class";

beforeEach(() => {
  dotReset();
});

describe("dotCSS — divide-y / divide-x child-combinator rules", () => {
  describe("divide-y", () => {
    it("divide-y generates > * + * rule with border-top-width: 1px", () => {
      const { css } = dotCSS("divide-y");
      expect(css).toContain("> * + *");
      expect(css).toContain("border-top-width: 1px");
    });

    it("divide-y-0 generates border-top-width: 0px", () => {
      const { css } = dotCSS("divide-y-0");
      expect(css).toContain("> * + *");
      expect(css).toContain("border-top-width: 0px");
    });

    it("divide-y-2 generates border-top-width: 2px", () => {
      const { css } = dotCSS("divide-y-2");
      expect(css).toContain("> * + *");
      expect(css).toContain("border-top-width: 2px");
    });

    it("divide-y-4 generates border-top-width: 4px", () => {
      const { css } = dotCSS("divide-y-4");
      expect(css).toContain("> * + *");
      expect(css).toContain("border-top-width: 4px");
    });

    it("divide-y-8 generates border-top-width: 8px", () => {
      const { css } = dotCSS("divide-y-8");
      expect(css).toContain("> * + *");
      expect(css).toContain("border-top-width: 8px");
    });

    it("divide-y selector uses the generated class name", () => {
      const { className, css } = dotCSS("divide-y");
      expect(css).toContain(`.${className} > * + *`);
    });

    it("divide-y border-style: solid is included", () => {
      const { css } = dotCSS("divide-y");
      expect(css).toContain("border-style: solid");
    });
  });

  describe("divide-x", () => {
    it("divide-x generates > * + * rule with border-left-width: 1px", () => {
      const { css } = dotCSS("divide-x");
      expect(css).toContain("> * + *");
      expect(css).toContain("border-left-width: 1px");
    });

    it("divide-x-2 generates border-left-width: 2px", () => {
      const { css } = dotCSS("divide-x-2");
      expect(css).toContain("> * + *");
      expect(css).toContain("border-left-width: 2px");
    });

    it("divide-x-4 generates border-left-width: 4px", () => {
      const { css } = dotCSS("divide-x-4");
      expect(css).toContain("> * + *");
      expect(css).toContain("border-left-width: 4px");
    });

    it("divide-x selector uses the generated class name", () => {
      const { className, css } = dotCSS("divide-x");
      expect(css).toContain(`.${className} > * + *`);
    });
  });

  describe("divide-y-reverse", () => {
    it("divide-y-reverse uses border-bottom-width instead of border-top-width", () => {
      const { css } = dotCSS("divide-y divide-y-reverse");
      expect(css).toContain("> * + *");
      expect(css).toContain("border-bottom-width: 1px");
      expect(css).not.toContain("border-top-width");
    });
  });

  describe("divide-x-reverse", () => {
    it("divide-x-reverse uses border-right-width instead of border-left-width", () => {
      const { css } = dotCSS("divide-x divide-x-reverse");
      expect(css).toContain("> * + *");
      expect(css).toContain("border-right-width: 1px");
      expect(css).not.toContain("border-left-width");
    });
  });

  describe("combined with other utilities", () => {
    it("divide-y combined with padding generates both rules", () => {
      const { className, css } = dotCSS("p-4 divide-y");
      // Regular base rule
      expect(css).toContain(`padding: 16px`);
      // Child-combinator rule
      expect(css).toContain(`.${className} > * + *`);
      expect(css).toContain("border-top-width: 1px");
    });

    it("divide-y combined with divide-color propagates color to child rule", () => {
      const { css } = dotCSS("divide-y divide-gray-200");
      // Child combinator rule should include border-color
      const childRule = css.split("}").find((r) => r.includes("> * + *"));
      expect(childRule).toContain("border-top-width: 1px");
      expect(childRule).toContain("border-color");
    });

    it("divide-x combined with divide-color propagates color to child rule", () => {
      const { css } = dotCSS("divide-x divide-red-500");
      const childRule = css.split("}").find((r) => r.includes("> * + *"));
      expect(childRule).toContain("border-left-width: 1px");
      expect(childRule).toContain("border-color");
    });

    it("divide-y does not leak internal key into regular declarations", () => {
      const { css } = dotCSS("divide-y");
      expect(css).not.toContain("__dot_divideY");
      expect(css).not.toContain("__dot_divideX");
    });

    it("cross-bucket: divide-y hover:divide-gray-200 propagates color to hover child rule", () => {
      const { css } = dotCSS("divide-y hover:divide-gray-200");
      // Base child rule: border-top-width without color
      expect(css).toContain("> * + *");
      expect(css).toContain("border-top-width: 1px");
      // Hover child rule: border-color in > * + * under :hover
      const hoverChildRule = css
        .split("}")
        .find((r) => r.includes(":hover") && r.includes("> * + *"));
      expect(hoverChildRule).toBeDefined();
      expect(hoverChildRule).toContain("border-color");
    });

    it("cross-bucket: divide-y md:divide-gray-200 propagates color to responsive child rule", () => {
      const { css } = dotCSS("divide-y md:divide-gray-200");
      // Media query should contain child rule with border-color
      expect(css).toContain("@media");
      expect(css).toContain("border-color");
    });
  });

  describe("dot() inline mode — divide markers stripped", () => {
    it("dot() returns empty object for divide-y (class mode only)", async () => {
      const { dot } = await import("../../index");
      const result = dot("divide-y");
      expect(result).toEqual({});
    });

    it("dot() returns empty object for divide-x (class mode only)", async () => {
      const { dot } = await import("../../index");
      const result = dot("divide-x");
      expect(result).toEqual({});
    });
  });
});
