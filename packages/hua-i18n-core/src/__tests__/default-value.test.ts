import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Translator } from "../core/translator";
import { I18nConfig } from "../types";

function createConfig(overrides?: Partial<I18nConfig>): I18nConfig {
  return {
    defaultLanguage: "ko",
    fallbackLanguage: "en",
    supportedLanguages: [
      { code: "ko", name: "Korean", nativeName: "한국어" },
      { code: "en", name: "English", nativeName: "English" },
    ],
    namespaces: ["common"],
    loadTranslations: vi
      .fn()
      .mockImplementation(async (lang: string, ns: string) => {
        if (lang === "ko" && ns === "common") {
          return { greeting: "안녕하세요", welcome: "{name}님 환영합니다" };
        }
        if (lang === "en" && ns === "common") {
          return { greeting: "Hello", welcome: "Welcome {name}" };
        }
        return {};
      }),
    ...overrides,
  };
}

describe("defaultValue support", () => {
  let translator: Translator;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Translator.translate()", () => {
    beforeEach(async () => {
      translator = new Translator(createConfig());
      await translator.initialize();
      vi.advanceTimersByTime(100);
    });

    it("returns translation when key exists (ignores defaultValue)", () => {
      const result = translator.translate("common:greeting", {
        defaultValue: "Fallback",
      });
      expect(result).toBe("안녕하세요");
    });

    it("returns defaultValue when key is missing", () => {
      const result = translator.translate("common:nonexistent", {
        defaultValue: "Fallback text",
      });
      expect(result).toBe("Fallback text");
    });

    it("interpolates variables in defaultValue", () => {
      const result = translator.translate("common:missing", {
        defaultValue: "Hello {{name}}",
        name: "World",
      });
      expect(result).toBe("Hello World");
    });

    it("returns empty string when key is missing and no defaultValue (production)", () => {
      const result = translator.translate("common:nonexistent");
      expect(result).toBe("");
    });

    it("returns defaultValue before initialization", () => {
      const fresh = new Translator(createConfig());
      // Not initialized — should still return defaultValue
      const result = fresh.translate("common:missing", {
        defaultValue: "Hello {{name}}",
        name: "World",
      });
      expect(result).toBe("Hello World");
    });

    it("returns key when missing and debug mode (no defaultValue)", () => {
      const debugTranslator = new Translator(createConfig({ debug: true }));
      // Use initialTranslations to bypass async init
      const config = createConfig({
        debug: true,
        initialTranslations: { ko: { common: {} }, en: { common: {} } },
      });
      const t = new Translator(config);
      const result = t.translate("common:nonexistent");
      expect(result).toBe("common:nonexistent");
    });
  });

  describe("Translator.translateAsync()", () => {
    beforeEach(async () => {
      translator = new Translator(createConfig());
      await translator.initialize();
      vi.advanceTimersByTime(100);
    });

    it("returns defaultValue when key is missing", async () => {
      const result = await translator.translateAsync("common:missing", {
        defaultValue: "Async fallback",
      });
      expect(result).toBe("Async fallback");
    });

    it("returns translation when key exists", async () => {
      const result = await translator.translateAsync("common:greeting", {
        defaultValue: "Fallback",
      });
      expect(result).toBe("안녕하세요");
    });
  });

  describe("Translator.translateSync()", () => {
    beforeEach(async () => {
      translator = new Translator(createConfig());
      await translator.initialize();
      vi.advanceTimersByTime(100);
    });

    it("returns defaultValue when key is missing", () => {
      const result = translator.translateSync("common:missing", {
        defaultValue: "Sync fallback",
      });
      expect(result).toBe("Sync fallback");
    });

    it("returns translation when key exists", () => {
      const result = translator.translateSync("common:greeting", {
        defaultValue: "Fallback",
      });
      expect(result).toBe("안녕하세요");
    });

    it("returns defaultValue even before initialization", () => {
      const fresh = new Translator(createConfig());
      // Not initialized — should still return defaultValue
      const result = fresh.translateSync("common:missing", {
        defaultValue: "Before init",
      });
      expect(result).toBe("Before init");
    });
  });
});
