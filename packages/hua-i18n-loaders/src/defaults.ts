import {
  DefaultTranslations,
  TranslationLoader,
  TranslationRecord
} from './types';

export function withDefaultTranslations(
  loader: TranslationLoader,
  defaults: DefaultTranslations
): TranslationLoader {
  return async (language, namespace) => {
    const fallback = defaults[language]?.[namespace];

    try {
      const remote = await loader(language, namespace);
      
      // API 응답이 빈 객체이거나 null/undefined인 경우 fallback 반환
      if (!remote || (typeof remote === 'object' && Object.keys(remote).length === 0)) {
        if (fallback) {
          return fallback;
        }
        return remote || {};
      }
      
      if (!fallback) {
        return remote;
      }

      return mergeTranslations(fallback, remote);
    } catch (error) {
      if (fallback) {
        return fallback;
      }
      throw error;
    }
  };
}

function mergeTranslations(
  base: TranslationRecord,
  override: TranslationRecord
): TranslationRecord {
  const result: TranslationRecord = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = mergeTranslations(
        result[key] as TranslationRecord,
        value as TranslationRecord
      );
      continue;
    }

    result[key] = value;
  }

  return result;
}

function isPlainObject(value: unknown): value is TranslationRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

