import { describe, it, expect } from "vitest";
import { normalizeIconName, getProviderIconName } from "../normalize-icon-name";

describe("normalizeIconName", () => {
  it("should return normalized result with wasAlias true for kebab-case that is aliased", () => {
    // 'arrow-left' exists in ICON_ALIASES as a mapping
    const result = normalizeIconName("arrow-left");
    expect(result).toEqual({
      normalized: "arrowLeft",
      wasAlias: true,
      originalAlias: "arrow-left",
    });
  });

  it("should return normalized result with wasAlias false for non-aliased names", () => {
    // 'someIcon' is not in ICON_ALIASES
    const result = normalizeIconName("someIcon");
    expect(result).toEqual({
      normalized: "someIcon",
      wasAlias: false,
    });
  });

  it("should return normalized result with wasAlias true for aliases", () => {
    const result = normalizeIconName("back");
    expect(result).toEqual({
      normalized: "arrowLeft",
      wasAlias: true,
      originalAlias: "back",
    });
  });

  it("should convert kebab-case to camelCase", () => {
    const result = normalizeIconName("heart-circle");
    expect(result.normalized).toBe("heartCircle");
    expect(result.wasAlias).toBe(false);
  });

  it("should convert PascalCase to camelCase", () => {
    const result = normalizeIconName("ArrowLeft");
    expect(result.normalized).toBe("arrowLeft");
    expect(result.wasAlias).toBe(false);
  });

  it("should keep camelCase unchanged", () => {
    const result = normalizeIconName("arrowLeft");
    expect(result.normalized).toBe("arrowLeft");
    expect(result.wasAlias).toBe(false);
  });

  it("should resolve multiple aliases correctly", () => {
    const backResult = normalizeIconName("back");
    expect(backResult.normalized).toBe("arrowLeft");
    expect(backResult.wasAlias).toBe(true);

    const prevResult = normalizeIconName("prev");
    expect(prevResult.normalized).toBe("arrowLeft");
    expect(prevResult.wasAlias).toBe(true);

    const closeResult = normalizeIconName("close");
    expect(closeResult.normalized).toBe("close");
    expect(closeResult.wasAlias).toBe(false);
  });

  it("preserves canonical names that previously collided with aliases", () => {
    expect(normalizeIconName("monitor")).toEqual({
      normalized: "monitor",
      wasAlias: false,
    });
    expect(normalizeIconName("remove")).toEqual({
      normalized: "remove",
      wasAlias: false,
    });
    expect(normalizeIconName("pencil")).toEqual({
      normalized: "pencil",
      wasAlias: false,
    });
  });

  it("should handle empty string", () => {
    const result = normalizeIconName("");
    expect(result).toEqual({
      normalized: "",
      wasAlias: false,
    });
  });

  it("should handle non-string input gracefully", () => {
    const result = normalizeIconName(null as any);
    expect(result).toEqual({
      normalized: "",
      wasAlias: false,
    });
  });

  it("should resolve aliases even for kebab-case input", () => {
    // 'arrow-left' is in ICON_ALIASES mapping to 'arrowLeft'
    const result = normalizeIconName("arrow-left");
    expect(result.normalized).toBe("arrowLeft");
    // This should be true because 'arrow-left' is an alias in ICON_ALIASES
    expect(result.wasAlias).toBe(true);
    expect(result.originalAlias).toBe("arrow-left");
  });

  it("should handle camelCase aliases", () => {
    // Test that it checks both original and camelCased version for aliases
    const result = normalizeIconName("magnify");
    expect(result.normalized).toBe("search");
    expect(result.wasAlias).toBe(true);
  });

  it.each(["constructor", "toString", "hasOwnProperty", "__proto__"])(
    "does not treat inherited object key %s as a catalog entry or alias",
    (name) => {
      const normalized = normalizeIconName(name);
      expect(normalized.wasAlias).toBe(false);
      expect(typeof normalized.normalized).toBe("string");
      expect(getProviderIconName(name, "phosphor")).toBeNull();
      expect(getProviderIconName(name, "lucide")).toBeNull();
      expect(getProviderIconName(name, "iconsax")).toBeNull();
    },
  );
});

describe("getProviderIconName", () => {
  it("returns exact catalog names for lucide", () => {
    expect(getProviderIconName("arrowLeft", "lucide")).toBe("ArrowLeft");
    expect(getProviderIconName("heart", "lucide")).toBe("Heart");
    expect(getProviderIconName("layout-dashboard", "lucide")).toBe(
      "LayoutDashboard",
    );
  });

  it("returns exact catalog names for phosphor", () => {
    expect(getProviderIconName("arrowLeft", "phosphor")).toBe("ArrowLeft");
    expect(getProviderIconName("heart", "phosphor")).toBe("Heart");
    expect(getProviderIconName("github", "phosphor")).toBe("GithubLogo");
  });

  it("returns exact supported catalog names for iconsax", () => {
    expect(getProviderIconName("arrowLeft", "iconsax")).toBe("ArrowLeft");
    expect(getProviderIconName("heart", "iconsax")).toBe("Heart");
    expect(getProviderIconName("home", "iconsax")).toBe("Home2");
  });

  it("should handle all provider types correctly", () => {
    const iconName = "arrowLeft";
    expect(getProviderIconName(iconName, "lucide")).toBe("ArrowLeft");
    expect(getProviderIconName(iconName, "phosphor")).toBe("ArrowLeft");
    expect(getProviderIconName(iconName, "iconsax")).toBe("ArrowLeft");
  });

  it("does not guess provider component names", () => {
    expect(getProviderIconName("arrowUpRight", "lucide")).toBeNull();
    expect(getProviderIconName("heartCircle", "iconsax")).toBeNull();
  });

  it("should handle lowercase input", () => {
    expect(getProviderIconName("heart", "lucide")).toBe("Heart");
    expect(getProviderIconName("user", "phosphor")).toBe("User");
  });

  it("marks unavailable optional provider mappings explicitly", () => {
    expect(getProviderIconName("upload", "iconsax")).toBeNull();
    expect(getProviderIconName("download", "iconsax")).toBeNull();
    expect(getProviderIconName("bell", "iconsax")).toBeNull();
    expect(getProviderIconName("rocket", "iconsax")).toBeNull();
  });
});
