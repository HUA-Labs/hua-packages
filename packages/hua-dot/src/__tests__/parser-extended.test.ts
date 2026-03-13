import { describe, it, expect } from "vitest";
import { parse } from "../parser";

describe("parser — extended coverage", () => {
  describe("important modifier", () => {
    it("parses !p-4 as important=true", () => {
      const tokens = parse("!p-4");
      expect(tokens[0]).toMatchObject({
        important: true,
        prefix: "p",
        value: "4",
      });
    });

    it("parses !flex as important=true on standalone", () => {
      const tokens = parse("!flex");
      expect(tokens[0]).toMatchObject({
        important: true,
        prefix: "",
        value: "flex",
      });
    });

    it("parses dark:!bg-red-500 with variant and important", () => {
      const tokens = parse("dark:!bg-red-500");
      expect(tokens[0]).toMatchObject({
        variants: ["dark"],
        important: true,
        prefix: "bg",
        value: "red-500",
      });
    });

    it("parses hover:!p-4 with state variant and important", () => {
      const tokens = parse("hover:!p-4");
      expect(tokens[0]).toMatchObject({
        variants: ["hover"],
        important: true,
        prefix: "p",
        value: "4",
      });
    });

    it("important is false for normal tokens", () => {
      const tokens = parse("p-4 flex bg-red-500");
      expect(tokens.every((t) => t.important === false)).toBe(true);
    });

    it("parses multiple important tokens", () => {
      const tokens = parse("!p-4 !m-2 flex");
      expect(tokens[0].important).toBe(true);
      expect(tokens[1].important).toBe(true);
      expect(tokens[2].important).toBe(false);
    });
  });

  describe("negative + important combination", () => {
    it("parses !-m-4 with both important and negative", () => {
      const tokens = parse("!-m-4");
      expect(tokens[0]).toMatchObject({
        important: true,
        negative: true,
        prefix: "m",
        value: "4",
      });
    });
  });

  describe("arbitrary values in parsing", () => {
    it("parses p-[20px] correctly", () => {
      const tokens = parse("p-[20px]");
      expect(tokens[0]).toMatchObject({ prefix: "p", value: "[20px]" });
    });

    it("parses bg-[#ff0000] correctly", () => {
      const tokens = parse("bg-[#ff0000]");
      expect(tokens[0]).toMatchObject({ prefix: "bg", value: "[#ff0000]" });
    });

    it("parses w-[calc(100%-32px)] correctly", () => {
      const tokens = parse("w-[calc(100%-32px)]");
      expect(tokens[0]).toMatchObject({
        prefix: "w",
        value: "[calc(100%-32px)]",
      });
    });

    it("parses dark:bg-[var(--color)] with variant", () => {
      const tokens = parse("dark:bg-[var(--color)]");
      expect(tokens[0]).toMatchObject({
        variants: ["dark"],
        prefix: "bg",
        value: "[var(--color)]",
      });
    });
  });

  describe("fractional values", () => {
    it("parses w-1/2", () => {
      const tokens = parse("w-1/2");
      expect(tokens[0]).toMatchObject({ prefix: "w", value: "1/2" });
    });

    it("parses h-2/3", () => {
      const tokens = parse("h-2/3");
      expect(tokens[0]).toMatchObject({ prefix: "h", value: "2/3" });
    });

    it("parses top-1/4", () => {
      const tokens = parse("top-1/4");
      expect(tokens[0]).toMatchObject({ prefix: "top", value: "1/4" });
    });

    it("parses left-full", () => {
      const tokens = parse("left-full");
      expect(tokens[0]).toMatchObject({ prefix: "left", value: "full" });
    });
  });

  describe("scroll multi-segment prefixes", () => {
    it("parses scroll-m-4", () => {
      const tokens = parse("scroll-m-4");
      expect(tokens[0]).toMatchObject({ prefix: "scroll-m", value: "4" });
    });

    it("parses scroll-mx-2", () => {
      const tokens = parse("scroll-mx-2");
      expect(tokens[0]).toMatchObject({ prefix: "scroll-mx", value: "2" });
    });

    it("parses scroll-mt-8", () => {
      const tokens = parse("scroll-mt-8");
      expect(tokens[0]).toMatchObject({ prefix: "scroll-mt", value: "8" });
    });

    it("parses scroll-p-4", () => {
      const tokens = parse("scroll-p-4");
      expect(tokens[0]).toMatchObject({ prefix: "scroll-p", value: "4" });
    });

    it("parses scroll-pt-2", () => {
      const tokens = parse("scroll-pt-2");
      expect(tokens[0]).toMatchObject({ prefix: "scroll-pt", value: "2" });
    });
  });

  describe("filter and special multi-segment prefixes", () => {
    it("parses hue-rotate-90", () => {
      const tokens = parse("hue-rotate-90");
      expect(tokens[0]).toMatchObject({ prefix: "hue-rotate", value: "90" });
    });

    it("parses drop-shadow-md", () => {
      const tokens = parse("drop-shadow-md");
      expect(tokens[0]).toMatchObject({ prefix: "drop-shadow", value: "md" });
    });

    it("parses mix-blend-multiply", () => {
      const tokens = parse("mix-blend-multiply");
      expect(tokens[0]).toMatchObject({
        prefix: "mix-blend",
        value: "multiply",
      });
    });

    it("parses underline-offset-4", () => {
      const tokens = parse("underline-offset-4");
      expect(tokens[0]).toMatchObject({
        prefix: "underline-offset",
        value: "4",
      });
    });
  });

  describe("divide multi-segment prefixes", () => {
    it("parses divide-x-2", () => {
      const tokens = parse("divide-x-2");
      expect(tokens[0]).toMatchObject({ prefix: "divide-x", value: "2" });
    });

    it("parses divide-y-4", () => {
      const tokens = parse("divide-y-4");
      expect(tokens[0]).toMatchObject({ prefix: "divide-y", value: "4" });
    });

    it("parses divide-gray-200", () => {
      const tokens = parse("divide-gray-200");
      expect(tokens[0]).toMatchObject({ prefix: "divide", value: "gray-200" });
    });
  });

  describe("ring prefixes", () => {
    it("parses ring-2", () => {
      const tokens = parse("ring-2");
      expect(tokens[0]).toMatchObject({ prefix: "ring", value: "2" });
    });

    it("parses ring-offset-2", () => {
      const tokens = parse("ring-offset-2");
      expect(tokens[0]).toMatchObject({ prefix: "ring-offset", value: "2" });
    });

    it("parses ring-red-500", () => {
      const tokens = parse("ring-red-500");
      expect(tokens[0]).toMatchObject({ prefix: "ring", value: "red-500" });
    });
  });

  describe("outline prefixes", () => {
    it("parses outline-2", () => {
      const tokens = parse("outline-2");
      expect(tokens[0]).toMatchObject({ prefix: "outline", value: "2" });
    });

    it("parses outline-offset-4", () => {
      const tokens = parse("outline-offset-4");
      expect(tokens[0]).toMatchObject({ prefix: "outline-offset", value: "4" });
    });

    it("parses bare outline", () => {
      const tokens = parse("outline");
      expect(tokens[0]).toMatchObject({ prefix: "outline", value: "" });
    });
  });

  describe("gradient prefixes", () => {
    it("parses bg-gradient-to-r", () => {
      const tokens = parse("bg-gradient-to-r");
      expect(tokens[0]).toMatchObject({ prefix: "bg-gradient-to", value: "r" });
    });

    it("parses from-red-500", () => {
      const tokens = parse("from-red-500");
      expect(tokens[0]).toMatchObject({ prefix: "from", value: "red-500" });
    });

    it("parses via-white", () => {
      const tokens = parse("via-white");
      expect(tokens[0]).toMatchObject({ prefix: "via", value: "white" });
    });

    it("parses to-blue-500", () => {
      const tokens = parse("to-blue-500");
      expect(tokens[0]).toMatchObject({ prefix: "to", value: "blue-500" });
    });
  });

  describe("standalone tokens — extended", () => {
    it("parses overflow-x-auto as standalone", () => {
      const tokens = parse("overflow-x-auto");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "overflow-x-auto" });
    });

    it("parses overflow-y-hidden as standalone", () => {
      const tokens = parse("overflow-y-hidden");
      expect(tokens[0]).toMatchObject({
        prefix: "",
        value: "overflow-y-hidden",
      });
    });

    it("parses bg-clip-text as standalone", () => {
      const tokens = parse("bg-clip-text");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "bg-clip-text" });
    });

    it("parses bg-clip-border as standalone", () => {
      const tokens = parse("bg-clip-border");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "bg-clip-border" });
    });

    it("parses antialiased as standalone", () => {
      const tokens = parse("antialiased");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "antialiased" });
    });

    it("parses subpixel-antialiased as standalone", () => {
      const tokens = parse("subpixel-antialiased");
      expect(tokens[0]).toMatchObject({
        prefix: "",
        value: "subpixel-antialiased",
      });
    });

    it("parses italic as standalone", () => {
      const tokens = parse("italic");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "italic" });
    });

    it("parses not-italic as standalone", () => {
      const tokens = parse("not-italic");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "not-italic" });
    });

    it("parses underline as standalone", () => {
      const tokens = parse("underline");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "underline" });
    });

    it("parses overline as standalone", () => {
      const tokens = parse("overline");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "overline" });
    });

    it("parses line-through as standalone", () => {
      const tokens = parse("line-through");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "line-through" });
    });

    it("parses no-underline as standalone", () => {
      const tokens = parse("no-underline");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "no-underline" });
    });

    it("parses container as standalone", () => {
      const tokens = parse("container");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "container" });
    });

    it("parses transform as standalone", () => {
      const tokens = parse("transform");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "transform" });
    });

    it("parses sr-only as standalone", () => {
      const tokens = parse("sr-only");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "sr-only" });
    });

    it("parses not-sr-only as standalone", () => {
      const tokens = parse("not-sr-only");
      expect(tokens[0]).toMatchObject({ prefix: "", value: "not-sr-only" });
    });
  });

  describe("multiple variant chaining", () => {
    it("parses dark:md:flex with two variants", () => {
      const tokens = parse("dark:md:flex");
      expect(tokens[0]).toMatchObject({
        variants: ["dark", "md"],
        prefix: "",
        value: "flex",
      });
    });

    it("parses hover:dark:bg-gray-900 with two variants (order preserved)", () => {
      const tokens = parse("hover:dark:bg-gray-900");
      expect(tokens[0]).toMatchObject({
        variants: ["hover", "dark"],
        prefix: "bg",
        value: "gray-900",
      });
    });

    it("parses sm:hover:p-8 with two variants", () => {
      const tokens = parse("sm:hover:p-8");
      expect(tokens[0]).toMatchObject({
        variants: ["sm", "hover"],
        prefix: "p",
        value: "8",
      });
    });

    it("parses dark:md:hover:bg-white with three variants", () => {
      const tokens = parse("dark:md:hover:bg-white");
      expect(tokens[0]).toMatchObject({
        variants: ["dark", "md", "hover"],
        prefix: "bg",
        value: "white",
      });
    });
  });

  describe("flex basis prefix", () => {
    it("parses basis-1/2", () => {
      const tokens = parse("basis-1/2");
      expect(tokens[0]).toMatchObject({ prefix: "basis", value: "1/2" });
    });

    it("parses basis-full", () => {
      const tokens = parse("basis-full");
      expect(tokens[0]).toMatchObject({ prefix: "basis", value: "full" });
    });

    it("parses basis-auto", () => {
      const tokens = parse("basis-auto");
      expect(tokens[0]).toMatchObject({ prefix: "basis", value: "auto" });
    });
  });

  describe("order prefix", () => {
    it("parses order-1", () => {
      const tokens = parse("order-1");
      expect(tokens[0]).toMatchObject({ prefix: "order", value: "1" });
    });

    it("parses order-first", () => {
      const tokens = parse("order-first");
      expect(tokens[0]).toMatchObject({ prefix: "order", value: "first" });
    });

    it("parses order-last", () => {
      const tokens = parse("order-last");
      expect(tokens[0]).toMatchObject({ prefix: "order", value: "last" });
    });
  });

  describe("line-clamp prefix", () => {
    it("parses line-clamp-3", () => {
      const tokens = parse("line-clamp-3");
      expect(tokens[0]).toMatchObject({ prefix: "line-clamp", value: "3" });
    });

    it("parses line-clamp-none", () => {
      const tokens = parse("line-clamp-none");
      expect(tokens[0]).toMatchObject({ prefix: "line-clamp", value: "none" });
    });
  });

  describe("extreme edge cases", () => {
    it("very long input still parses correctly", () => {
      const input = Array(50).fill("p-4").join(" ");
      const tokens = parse(input);
      expect(tokens).toHaveLength(50);
      expect(tokens.every((t) => t.prefix === "p" && t.value === "4")).toBe(
        true,
      );
    });

    it("mixed tabs, newlines, spaces as separators", () => {
      const input = "p-4\tm-2\nbg-white\t\tflex\n\n  text-sm  ";
      const tokens = parse(input);
      expect(tokens).toHaveLength(5);
    });

    it("single character non-token", () => {
      const tokens = parse("x");
      expect(tokens).toHaveLength(1);
      expect(tokens[0].prefix).toBe("x");
      expect(tokens[0].value).toBe("");
    });
  });
});
