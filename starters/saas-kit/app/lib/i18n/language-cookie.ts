/**
 * Language cookie utility
 *
 * Cookie management for synchronizing language state between SSR and client
 * - Cookie is set in proxy.ts (auto-detected from Accept-Language)
 * - Cookie is read in layout.tsx (SSR html lang attribute)
 * - Cookie is saved when the user changes language on the client
 */

export const LANGUAGE_COOKIE = "app-lang";
export const SUPPORTED_LANGUAGES = ["ko", "en", "ja"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = "ko";

/**
 * Check if the given language is supported
 */
export function isSupportedLanguage(
  lang: string | undefined | null,
): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Set cookie on the client
 */
export function setLanguageCookie(lang: SupportedLanguage): void {
  if (typeof document !== "undefined") {
    document.cookie = `${LANGUAGE_COOKIE}=${lang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
  }
}

/**
 * Read cookie on the client
 */
export function getLanguageCookie(): SupportedLanguage | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${LANGUAGE_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return isSupportedLanguage(value) ? value : null;
}

/**
 * Parse cookie value on the server
 */
export function parseLanguageFromCookies(
  cookieHeader: string | null | undefined,
): SupportedLanguage {
  if (!cookieHeader) return DEFAULT_LANGUAGE;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === LANGUAGE_COOKIE && isSupportedLanguage(value)) {
      return value;
    }
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Parse preferred language from Accept-Language header
 * Example: "ja-JP,ja;q=0.9,en;q=0.8" → "ja"
 */
export function parseAcceptLanguage(
  acceptLanguage: string | null,
): SupportedLanguage {
  if (!acceptLanguage) return DEFAULT_LANGUAGE;

  // Extract the first language (highest priority)
  const preferred = acceptLanguage.split(",")[0].split("-")[0].toLowerCase();
  return isSupportedLanguage(preferred) ? preferred : DEFAULT_LANGUAGE;
}
