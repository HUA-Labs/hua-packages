/**
 * Translation data management
 *
 * Loads and returns static translation files.
 * Can be extended to use a database or external API in the future.
 */

import { TranslationRecord } from "@hua-labs/i18n-loaders";

// Static translation data imports
import * as commonKo from "./ko/common.json";
import * as commonEn from "./en/common.json";
import * as commonJa from "./ja/common.json";
import * as navigationKo from "./ko/navigation.json";
import * as navigationEn from "./en/navigation.json";
import * as navigationJa from "./ja/navigation.json";
import * as footerKo from "./ko/footer.json";
import * as footerEn from "./en/footer.json";
import * as footerJa from "./ja/footer.json";
import * as landingKo from "./ko/landing.json";
import * as landingEn from "./en/landing.json";
import * as landingJa from "./ja/landing.json";
import * as settingsKo from "./ko/settings.json";
import * as settingsEn from "./en/settings.json";
import * as settingsJa from "./ja/settings.json";
import * as adminKo from "./ko/admin.json";
import * as adminEn from "./en/admin.json";
import * as adminJa from "./ja/admin.json";
import * as privacyKo from "./ko/privacy.json";
import * as privacyEn from "./en/privacy.json";
import * as privacyJa from "./ja/privacy.json";
import * as emailPolicyKo from "./ko/email-policy.json";
import * as emailPolicyEn from "./en/email-policy.json";
import * as emailPolicyJa from "./ja/email-policy.json";
import * as termsKo from "./ko/terms.json";
import * as termsEn from "./en/terms.json";
import * as termsJa from "./ja/terms.json";
import * as securityKo from "./ko/security.json";
import * as securityEn from "./en/security.json";
import * as securityJa from "./ja/security.json";

// Translation data map
const translations: Record<string, Record<string, TranslationRecord>> = {
  ko: {
    common: commonKo as TranslationRecord,
    navigation: navigationKo as TranslationRecord,
    footer: footerKo as TranslationRecord,
    landing: landingKo as TranslationRecord,
    settings: settingsKo as TranslationRecord,
    admin: adminKo as TranslationRecord,
    privacy: privacyKo as TranslationRecord,
    "email-policy": emailPolicyKo as TranslationRecord,
    terms: termsKo as TranslationRecord,
    security: securityKo as TranslationRecord,
  },
  en: {
    common: commonEn as TranslationRecord,
    navigation: navigationEn as TranslationRecord,
    footer: footerEn as TranslationRecord,
    landing: landingEn as TranslationRecord,
    settings: settingsEn as TranslationRecord,
    admin: adminEn as TranslationRecord,
    privacy: privacyEn as TranslationRecord,
    "email-policy": emailPolicyEn as TranslationRecord,
    terms: termsEn as TranslationRecord,
    security: securityEn as TranslationRecord,
  },
  ja: {
    common: commonJa as TranslationRecord,
    navigation: navigationJa as TranslationRecord,
    footer: footerJa as TranslationRecord,
    landing: landingJa as TranslationRecord,
    settings: settingsJa as TranslationRecord,
    admin: adminJa as TranslationRecord,
    privacy: privacyJa as TranslationRecord,
    "email-policy": emailPolicyJa as TranslationRecord,
    terms: termsJa as TranslationRecord,
    security: securityJa as TranslationRecord,
  },
};

/**
 * Convert module object to plain object
 * JSON imports may return module objects, so convert to plain objects
 */
function toPlainObject(obj: unknown): Record<string, string> {
  // Already a plain object
  if (
    obj &&
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    obj.constructor === Object
  ) {
    return obj as Record<string, string>;
  }

  // Module object (default export or direct value)
  if (obj && typeof obj === "object") {
    const moduleObj = obj as { default?: unknown; [key: string]: unknown };
    if (moduleObj.default && typeof moduleObj.default === "object") {
      return toPlainObject(moduleObj.default);
    }
    // No default export — try direct conversion
    return Object.fromEntries(
      Object.entries(moduleObj).filter(([key]) => key !== "default"),
    ) as Record<string, string>;
  }

  return {};
}

/**
 * Get translation data
 *
 * @param language Language code ('ko', 'en', 'ja')
 * @param namespace Namespace ('common', 'navigation', 'footer', 'landing', 'settings', 'admin', ...)
 * @returns Translation data object (plain object)
 */
export async function getTranslations(
  language: string,
  namespace: string,
): Promise<TranslationRecord> {
  // Default: Korean common
  const defaultTranslations = toPlainObject(translations.ko.common);

  // Get translations for the language
  const languageTranslations =
    translations[language as keyof typeof translations];
  if (!languageTranslations) {
    console.warn(`Language ${language} not found, using default`);
    return defaultTranslations;
  }

  // Get translations for the namespace
  const namespaceTranslations = languageTranslations[namespace];
  if (!namespaceTranslations) {
    console.warn(
      `Namespace ${namespace} not found for language ${language}, using default`,
    );
    return defaultTranslations;
  }

  // Convert module object to plain object and return
  return toPlainObject(namespaceTranslations);
}
