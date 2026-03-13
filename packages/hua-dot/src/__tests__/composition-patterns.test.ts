import { describe, it, expect, beforeEach } from "vitest";
import { dot, createDotConfig, clearDotCache } from "../index";

describe("composition patterns — real-world utility combinations", () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  describe("layout compositions", () => {
    it("flex row with gap and padding", () => {
      const result = dot(
        "flex flex-row items-center justify-between gap-4 p-4",
      );
      expect(result).toMatchObject({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "16px",
      });
    });

    it("flex column with full height and scroll", () => {
      const result = dot("flex flex-col h-full overflow-y-auto");
      expect(result).toMatchObject({
        display: "flex",
        flexDirection: "column",
        height: "100%",
      });
    });

    it("absolute centering pattern", () => {
      const result = dot(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
      );
      expect(result).toMatchObject({
        position: "absolute",
        top: "50%",
        left: "50%",
      });
      expect(String(result.transform)).toContain("translateX(-50%)");
      expect(String(result.transform)).toContain("translateY(-50%)");
    });

    it("fixed overlay", () => {
      const result = dot("fixed inset-0 z-50 bg-black opacity-75");
      expect(result).toMatchObject({
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
        zIndex: "50",
        backgroundColor: "#000000",
        opacity: "0.75",
      });
    });

    it("sticky header", () => {
      const result = dot("sticky top-0 z-40 bg-white border-b border-gray-200");
      expect(result).toMatchObject({
        position: "sticky",
        top: "0px",
        zIndex: "40",
        backgroundColor: "#ffffff",
        borderBottomWidth: "1px",
        borderColor: "#c1c4c8",
      });
    });

    it("grid with auto-rows pattern", () => {
      const result = dot("grid grid-cols-3 auto-rows-fr gap-6");
      expect(result).toMatchObject({
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gridAutoRows: "minmax(0, 1fr)",
        gap: "24px",
      });
    });
  });

  describe("card component patterns", () => {
    it("basic card", () => {
      const result = dot(
        "bg-white rounded-lg shadow-md p-6 border border-gray-100",
      );
      expect(result).toMatchObject({
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        padding: "24px",
        borderWidth: "1px",
        borderColor: "#dee1e4",
      });
      expect(result).toHaveProperty("boxShadow");
    });

    it("card with accent border", () => {
      const result = dot(
        "bg-white rounded-xl border-l-4 border-l-primary-500 p-6 shadow-sm",
      );
      expect(result).toMatchObject({
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "24px",
      });
    });

    it("dark card", () => {
      const result = dot(
        "bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl",
        { dark: true },
      );
      expect(result).toMatchObject({
        backgroundColor: "#26292d",
        borderRadius: "12px",
        padding: "24px",
      });
      expect(result).toHaveProperty("boxShadow");
    });
  });

  describe("button component patterns", () => {
    it("primary button", () => {
      const result = dot(
        "inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md font-medium text-sm",
      );
      expect(result).toMatchObject({
        display: "inline-flex",
        alignItems: "center",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "8px",
        paddingBottom: "8px",
        backgroundColor: "#2b6cd6",
        color: "#ffffff",
        borderRadius: "6px",
        fontWeight: "500",
        fontSize: "14px",
      });
    });

    it("ghost button", () => {
      const result = dot(
        "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-transparent border border-gray-300 text-gray-700",
      );
      expect(result).toMatchObject({
        display: "inline-flex",
        paddingLeft: "16px",
        backgroundColor: "transparent",
        borderWidth: "1px",
        borderColor: "#a3a7ae",
      });
    });

    it("icon button with rounded-full", () => {
      const result = dot(
        "inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100",
      );
      expect(result).toMatchObject({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "9999px",
      });
    });
  });

  describe("badge/chip patterns", () => {
    it("badge with rounded-full", () => {
      const result = dot(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800",
      );
      expect(result).toMatchObject({
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "9999px",
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingTop: "2px",
        paddingBottom: "2px",
        fontSize: "12px",
        fontWeight: "500",
      });
    });
  });

  describe("input field patterns", () => {
    it("text input", () => {
      const result = dot(
        "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white",
      );
      expect(result).toMatchObject({
        display: "block",
        width: "100%",
        borderRadius: "6px",
        borderWidth: "1px",
        borderColor: "#a3a7ae",
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "8px",
        paddingBottom: "8px",
        fontSize: "14px",
        backgroundColor: "#ffffff",
      });
    });
  });

  describe("typography patterns", () => {
    it("heading pattern", () => {
      const result = dot("text-2xl font-bold tracking-tight text-gray-900");
      expect(result).toMatchObject({
        fontSize: "24px",
        fontWeight: "700",
        letterSpacing: "-0.025em",
        color: "#121418",
      });
    });

    it("body text", () => {
      const result = dot("text-base leading-relaxed text-gray-600");
      expect(result).toMatchObject({
        fontSize: "16px",
        lineHeight: "1.625",
        color: "#54585e",
      });
    });

    it("caption text", () => {
      const result = dot("text-xs text-gray-500 uppercase tracking-wider");
      expect(result).toMatchObject({
        fontSize: "12px",
        color: "#6d7178",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      });
    });

    it("link style", () => {
      const result = dot("text-primary-500 underline font-medium");
      expect(result).toMatchObject({
        color: "#2b6cd6",
        textDecorationLine: "underline",
        fontWeight: "500",
      });
    });

    it("truncated text", () => {
      const result = dot("truncate max-w-xs");
      expect(result).toMatchObject({
        maxWidth: "320px",
      });
      // truncate should set overflow, whitespace, text-overflow
      expect(result).toHaveProperty("overflow");
    });
  });

  describe("transform compositions", () => {
    it("multiple transforms accumulate in order", () => {
      const result = dot("rotate-12 scale-105 translate-x-2");
      const transform = String(result.transform);
      expect(transform).toContain("rotate(12deg)");
      expect(transform).toContain("scale(1.05)");
      expect(transform).toContain("translateX(8px)");
    });

    it("skew + translate", () => {
      const result = dot("skew-x-3 skew-y-3 translate-y-1");
      const transform = String(result.transform);
      expect(transform).toContain("skewX(3deg)");
      expect(transform).toContain("skewY(3deg)");
      expect(transform).toContain("translateY(4px)");
    });

    it("scale-x and scale-y independently", () => {
      const result = dot("scale-x-125 scale-y-75");
      const transform = String(result.transform);
      expect(transform).toContain("scaleX(1.25)");
      expect(transform).toContain("scaleY(.75)");
    });
  });

  describe("filter compositions", () => {
    it("multiple filters accumulate", () => {
      const result = dot("blur-sm brightness-110 contrast-100");
      const filter = String(result.filter);
      expect(filter).toContain("blur(4px)");
      expect(filter).toContain("brightness(1.1)");
      expect(filter).toContain("contrast(1)");
    });

    it("grayscale + sepia + opacity (not a filter)", () => {
      const result = dot("grayscale sepia opacity-75");
      const filter = String(result.filter);
      expect(filter).toContain("grayscale(100%)");
      expect(filter).toContain("sepia(100%)");
      expect(result).toHaveProperty("opacity", "0.75");
    });
  });

  describe("responsive composition patterns", () => {
    it("mobile-first column → desktop row", () => {
      const result = dot("flex flex-col md:flex-row gap-4 md:gap-6", {
        breakpoint: "md",
      });
      expect(result).toMatchObject({
        display: "flex",
        flexDirection: "row",
        gap: "24px",
      });
    });

    it("responsive type scale", () => {
      const result = dot("text-sm md:text-base lg:text-lg", {
        breakpoint: "lg",
      });
      expect(result).toMatchObject({ fontSize: "18px" });
    });

    it("responsive padding", () => {
      const result = dot("p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16", {
        breakpoint: "xl",
      });
      expect(result).toMatchObject({ padding: "64px" });
    });
  });

  describe("dark mode composition patterns", () => {
    it("dark mode card", () => {
      const result = dot(
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6",
        { dark: true },
      );
      expect(result).toMatchObject({
        backgroundColor: "#26292d",
        borderColor: "#3c4045",
        borderRadius: "8px",
        padding: "24px",
      });
    });

    it("dark mode typography", () => {
      const result = dot("text-gray-900 dark:text-gray-100 font-medium", {
        dark: true,
      });
      expect(result).toMatchObject({
        color: "#dee1e4",
        fontWeight: "500",
      });
    });
  });

  describe("negative value compositions", () => {
    it("negative inset pattern", () => {
      const result = dot("absolute -inset-1");
      expect(result).toMatchObject({
        position: "absolute",
        top: "-4px",
        right: "-4px",
        bottom: "-4px",
        left: "-4px",
      });
    });

    it("negative translate centering", () => {
      const result = dot("translate-x-1/2 -translate-y-1/2");
      const transform = String(result.transform);
      expect(transform).toContain("translateX(50%)");
      expect(transform).toContain("translateY(-50%)");
    });

    it("negative margin trick", () => {
      const result = dot("-mx-4 px-4");
      expect(result).toMatchObject({
        marginLeft: "-16px",
        marginRight: "-16px",
        paddingLeft: "16px",
        paddingRight: "16px",
      });
    });
  });

  describe("arbitrary value compositions", () => {
    it("custom width + padding + color", () => {
      const result = dot("w-[320px] p-[20px] bg-[#f5f5f5]");
      expect(result).toEqual({
        width: "320px",
        padding: "20px",
        backgroundColor: "#f5f5f5",
      });
    });

    it("min-h with dvh unit", () => {
      const result = dot("min-h-[100dvh] flex flex-col");
      expect(result).toMatchObject({
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      });
    });

    it("max-w with clamp()", () => {
      const result = dot("max-w-[clamp(300px,50vw,800px)]");
      expect(result).toEqual({ maxWidth: "clamp(300px,50vw,800px)" });
    });

    it("arbitrary color with opacity modifier", () => {
      const result = dot("bg-primary-500/50");
      expect(result).toHaveProperty("backgroundColor");
      const bg = String(result.backgroundColor);
      expect(bg).toMatch(/rgb\(\d+ \d+ \d+ \/ 0\.5\)/);
    });
  });

  describe("border composition patterns", () => {
    it("all border sides", () => {
      const result = dot("border-t border-r border-b border-l");
      expect(result).toMatchObject({
        borderTopWidth: "1px",
        borderRightWidth: "1px",
        borderBottomWidth: "1px",
        borderLeftWidth: "1px",
      });
    });

    it("border-x and border-y shorthand", () => {
      const result = dot("border-x-2 border-y-4");
      expect(result).toMatchObject({
        borderLeftWidth: "2px",
        borderRightWidth: "2px",
        borderTopWidth: "4px",
        borderBottomWidth: "4px",
      });
    });

    it("full border with all properties", () => {
      const result = dot("border-2 border-solid border-primary-500 rounded-lg");
      expect(result).toMatchObject({
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#2b6cd6",
        borderRadius: "8px",
      });
    });
  });

  describe("z-index layering patterns", () => {
    it("modal stack", () => {
      const dropdown = dot("absolute z-10");
      const modal = dot("fixed inset-0 z-50");
      const tooltip = dot("absolute z-[100]");

      expect(dropdown).toMatchObject({ zIndex: "10" });
      expect(modal).toMatchObject({ zIndex: "50" });
      expect(tooltip).toMatchObject({ zIndex: "100" });
    });
  });
});
