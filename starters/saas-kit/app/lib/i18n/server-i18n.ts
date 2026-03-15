/**
 * Server-side i18n utilities
 * Detects language from Accept-Language header and returns the resolved locale
 */

export type SupportedLocale = "ko" | "en" | "ja";

/**
 * Detect supported locale from Accept-Language header
 */
export function detectLocaleFromHeader(
  acceptLanguage: string | null,
): SupportedLocale {
  if (!acceptLanguage) return "ko";

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      return {
        code: code.toLowerCase().split("-")[0],
        q: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const lang of languages) {
    if (lang.code === "ko") return "ko";
    if (lang.code === "en") return "en";
    if (lang.code === "ja") return "ja";
  }

  return "ko";
}

/**
 * Detect locale from NextRequest
 */
export function detectLocaleFromRequest(request: {
  headers: { get: (name: string) => string | null };
}): SupportedLocale {
  return detectLocaleFromHeader(request.headers.get("accept-language"));
}
