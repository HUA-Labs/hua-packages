import { describe, it, expect, vi } from 'vitest';
import {
  isPluralValue,
  isTranslationNamespace,
  isLanguageConfig,
  isTranslationError,
  validateI18nConfig,
  createTranslationError,
  createUserFriendlyError,
  isRecoverableError,
  logTranslationError,
} from '../types';

describe('isPluralValue', () => {
  it('should return true for valid plural value with other key', () => {
    expect(isPluralValue({ other: 'items' })).toBe(true);
  });

  it('should return true for full plural value', () => {
    expect(isPluralValue({ zero: 'no items', one: '1 item', other: '{count} items' })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isPluralValue(null)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isPluralValue(['a', 'b'])).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isPluralValue({})).toBe(false);
  });

  it('should return false for object without "other" key', () => {
    expect(isPluralValue({ one: 'item' })).toBe(false);
  });

  it('should return false for object with non-plural keys', () => {
    expect(isPluralValue({ other: 'items', invalid: 'key' })).toBe(false);
  });

  it('should return false for object with non-string values', () => {
    expect(isPluralValue({ other: 123 })).toBe(false);
  });
});

describe('isTranslationNamespace', () => {
  it('should return true for plain object', () => {
    expect(isTranslationNamespace({ key: 'value' })).toBe(true);
  });

  it('should return true for empty object', () => {
    expect(isTranslationNamespace({})).toBe(true);
  });

  it('should return false for null', () => {
    expect(isTranslationNamespace(null)).toBe(false);
  });

  it('should return false for array', () => {
    expect(isTranslationNamespace(['a'])).toBe(false);
  });

  it('should return false for primitive', () => {
    expect(isTranslationNamespace('string')).toBe(false);
  });
});

describe('isLanguageConfig', () => {
  it('should return true for valid config', () => {
    expect(isLanguageConfig({ code: 'ko', name: 'Korean', nativeName: '한국어' })).toBe(true);
  });

  it('should return false for missing code', () => {
    expect(isLanguageConfig({ name: 'Korean', nativeName: '한국어' })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isLanguageConfig(null)).toBe(false);
  });

  it('should return false for non-string fields', () => {
    expect(isLanguageConfig({ code: 123, name: 'Korean', nativeName: '한국어' })).toBe(false);
  });
});

describe('isTranslationError', () => {
  it('should return true for valid translation error', () => {
    const error = createTranslationError('MISSING_KEY', 'Key not found');
    expect(isTranslationError(error)).toBe(true);
  });

  it('should return false for regular error', () => {
    expect(isTranslationError(new Error('normal error'))).toBe(false);
  });

  it('should return false for non-error', () => {
    expect(isTranslationError({ code: 'MISSING_KEY', message: 'test' })).toBe(false);
  });
});

describe('validateI18nConfig', () => {
  const validConfig = {
    defaultLanguage: 'ko',
    supportedLanguages: [{ code: 'ko', name: 'Korean', nativeName: '한국어' }],
    loadTranslations: async () => ({}),
  };

  it('should return true for valid config', () => {
    expect(validateI18nConfig(validConfig)).toBe(true);
  });

  it('should return false for null', () => {
    expect(validateI18nConfig(null)).toBe(false);
  });

  it('should return false for missing defaultLanguage', () => {
    expect(validateI18nConfig({ ...validConfig, defaultLanguage: undefined })).toBe(false);
  });

  it('should return false for missing supportedLanguages', () => {
    expect(validateI18nConfig({ ...validConfig, supportedLanguages: undefined })).toBe(false);
  });

  it('should return false for missing loadTranslations', () => {
    expect(validateI18nConfig({ ...validConfig, loadTranslations: undefined })).toBe(false);
  });
});

describe('createTranslationError', () => {
  it('should create error with correct code', () => {
    const error = createTranslationError('MISSING_KEY', 'Key not found');
    expect(error.code).toBe('MISSING_KEY');
    expect(error.message).toBe('Key not found');
    expect(error.name).toBe('TranslationError');
    expect(error.timestamp).toBeDefined();
  });

  it('should include context information', () => {
    const error = createTranslationError('LOAD_FAILED', 'Failed', undefined, {
      language: 'ko',
      namespace: 'common',
      key: 'test',
    });
    expect(error.language).toBe('ko');
    expect(error.namespace).toBe('common');
    expect(error.key).toBe('test');
  });

  it('should include original error', () => {
    const original = new Error('original');
    const error = createTranslationError('NETWORK_ERROR', 'Network failed', original);
    expect(error.originalError).toBe(original);
  });
});

describe('createUserFriendlyError', () => {
  it('should return user-friendly message for MISSING_KEY', () => {
    const error = createTranslationError('MISSING_KEY', 'Key not found');
    const friendly = createUserFriendlyError(error);
    expect(friendly.code).toBe('MISSING_KEY');
    expect(friendly.severity).toBe('low');
    expect(friendly.message).toBeTruthy();
  });

  it('should return critical severity for INITIALIZATION_ERROR', () => {
    const error = createTranslationError('INITIALIZATION_ERROR', 'Init failed');
    const friendly = createUserFriendlyError(error);
    expect(friendly.severity).toBe('critical');
  });
});

describe('isRecoverableError', () => {
  it('should return true for LOAD_FAILED with retries remaining', () => {
    const error = createTranslationError('LOAD_FAILED', 'Failed', undefined, { retryCount: 0, maxRetries: 3 });
    expect(isRecoverableError(error)).toBe(true);
  });

  it('should return true for NETWORK_ERROR', () => {
    const error = createTranslationError('NETWORK_ERROR', 'Network error');
    expect(isRecoverableError(error)).toBe(true);
  });

  it('should return false for MISSING_KEY', () => {
    const error = createTranslationError('MISSING_KEY', 'Missing');
    expect(isRecoverableError(error)).toBe(false);
  });

  it('should return false when retries exhausted', () => {
    const error = createTranslationError('LOAD_FAILED', 'Failed', undefined, { retryCount: 3, maxRetries: 3 });
    expect(isRecoverableError(error)).toBe(false);
  });
});

describe('logTranslationError', () => {
  it('should not log when disabled', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = createTranslationError('LOAD_FAILED', 'Failed');
    logTranslationError(error, { enabled: false, level: 'error', includeStack: false, includeContext: false });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should call custom logger when provided', () => {
    const customLogger = vi.fn();
    const error = createTranslationError('LOAD_FAILED', 'Failed');
    logTranslationError(error, { enabled: true, level: 'error', includeStack: false, includeContext: false, customLogger });
    expect(customLogger).toHaveBeenCalledWith(error);
  });
});
