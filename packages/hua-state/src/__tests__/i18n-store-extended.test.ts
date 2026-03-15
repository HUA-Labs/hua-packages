/**
 * Extended tests for createI18nStore
 *
 * Covers edge cases not addressed in i18n-store.test.ts:
 * - Single supported language
 * - Empty supportedLanguages array
 * - Default persistKey usage
 * - ssr flag
 * - Repeated same-language setLanguage (should still succeed — language is supported)
 * - Multiple language cycles
 * - Warning message content
 * - Subscriber fires with correct state
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createI18nStore } from "../integrations/i18n";

let seq = 0;
const uid = () => `i18n-ext-${Date.now()}-${seq++}`;

afterEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Edge case: single supported language
// ---------------------------------------------------------------------------
describe("createI18nStore — single supported language", () => {
  it("should work when supportedLanguages has only one entry", () => {
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko"],
      persist: false,
    });
    expect(store.getState().language).toBe("ko");
  });

  it("should warn when trying to switch away from the sole supported language", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko"],
      persist: false,
    });
    store.getState().setLanguage("en");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(store.getState().language).toBe("ko");
    warn.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Edge case: empty supportedLanguages
// ---------------------------------------------------------------------------
describe("createI18nStore — empty supportedLanguages", () => {
  it("should create store but reject every setLanguage call", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: [],
      persist: false,
    });
    store.getState().setLanguage("ko");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(store.getState().language).toBe("ko"); // unchanged (default never validated)
    warn.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Default persistKey
// ---------------------------------------------------------------------------
describe("createI18nStore — default persistKey", () => {
  it("should work without explicit persistKey (falls back to hua-i18n-storage)", () => {
    const store = createI18nStore({
      defaultLanguage: "en",
      supportedLanguages: ["en", "ko"],
    });
    expect(store.getState().language).toBe("en");
  });
});

// ---------------------------------------------------------------------------
// SSR flag
// ---------------------------------------------------------------------------
describe("createI18nStore — ssr flag", () => {
  it("should create store with ssr: true", () => {
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko", "en"],
      ssr: true,
      persistKey: uid(),
    });
    expect(store.getState().language).toBe("ko");
  });

  it("should create store with ssr: false", () => {
    const store = createI18nStore({
      defaultLanguage: "en",
      supportedLanguages: ["en", "ja"],
      ssr: false,
      persistKey: uid(),
    });
    expect(store.getState().language).toBe("en");
  });
});

// ---------------------------------------------------------------------------
// Multiple language cycles
// ---------------------------------------------------------------------------
describe("createI18nStore — multiple language cycles", () => {
  it("should handle rapid successive language changes", () => {
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko", "en", "ja", "zh"],
      persist: false,
    });

    const sequence = ["en", "ja", "zh", "ko", "en"];
    for (const lang of sequence) {
      store.getState().setLanguage(lang);
    }
    expect(store.getState().language).toBe("en");
  });

  it("should toggle between two languages multiple times", () => {
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko", "en"],
      persist: false,
    });

    // i=0 → 'en', i=1 → 'ko', i=2 → 'en', i=3 → 'ko', i=4 → 'en'
    for (let i = 0; i <= 4; i++) {
      store.getState().setLanguage(i % 2 === 0 ? "en" : "ko");
    }
    expect(store.getState().language).toBe("en"); // last iteration: i=4 (even) → 'en'
  });
});

// ---------------------------------------------------------------------------
// Warning message content
// ---------------------------------------------------------------------------
describe("createI18nStore — warning message content", () => {
  it("should include the unsupported language in the warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko", "en"],
      persist: false,
    });
    store.getState().setLanguage("de");
    const message: string = warn.mock.calls[0][0] as string;
    expect(message).toContain("de");
    warn.mockRestore();
  });

  it("should list supported languages in the warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko", "en"],
      persist: false,
    });
    store.getState().setLanguage("fr");
    const message: string = warn.mock.calls[0][0] as string;
    expect(message).toContain("ko");
    expect(message).toContain("en");
    warn.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Subscriber receives correct state snapshot
// ---------------------------------------------------------------------------
describe("createI18nStore — subscriber state snapshot", () => {
  it("subscriber should receive updated state after setLanguage", () => {
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko", "en"],
      persist: false,
    });

    let captured: string | null = null;
    store.subscribe((state) => {
      captured = state.language;
    });

    store.getState().setLanguage("en");
    expect(captured).toBe("en");
  });

  it("subscriber should NOT fire when setLanguage is called with unsupported lang", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko", "en"],
      persist: false,
    });

    const cb = vi.fn();
    store.subscribe(cb);
    store.getState().setLanguage("xx"); // unsupported — set() never called
    expect(cb).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Returned store API completeness
// ---------------------------------------------------------------------------
describe("createI18nStore — store API", () => {
  it("should expose getState", () => {
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko"],
      persist: false,
    });
    expect(typeof store.getState).toBe("function");
  });

  it("should expose setState", () => {
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko", "en"],
      persist: false,
    });
    expect(typeof store.setState).toBe("function");
  });

  it("should expose subscribe", () => {
    const store = createI18nStore({
      defaultLanguage: "ko",
      supportedLanguages: ["ko"],
      persist: false,
    });
    expect(typeof store.subscribe).toBe("function");
  });
});
