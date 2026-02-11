import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withDefaultTranslations } from '../defaults';
import type { TranslationLoader, TranslationRecord, DefaultTranslations } from '../types';

describe('withDefaultTranslations', () => {
  let mockLoader: TranslationLoader;

  beforeEach(() => {
    mockLoader = vi.fn();
  });

  it('should return merged translations when loader succeeds', async () => {
    const remoteTranslations: TranslationRecord = {
      hello: 'world',
      goodbye: 'farewell',
    };

    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue(remoteTranslations);

    const defaults: DefaultTranslations = {
      en: {
        common: {
          hello: 'default hello',
          other: 'default other',
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);
    const result = await loader('en', 'common');

    expect(result).toEqual({
      hello: 'world', // Remote overrides default
      goodbye: 'farewell', // From remote
      other: 'default other', // From defaults
    });
  });

  it('should merge remote translations with defaults', async () => {
    const remoteTranslations: TranslationRecord = {
      hello: 'remote hello',
    };

    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue(remoteTranslations);

    const defaults: DefaultTranslations = {
      en: {
        common: {
          hello: 'default hello',
          goodbye: 'default goodbye',
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);
    const result = await loader('en', 'common');

    expect(result).toEqual({
      hello: 'remote hello', // Remote overrides default
      goodbye: 'default goodbye', // Default is preserved
    });
  });

  it('should return defaults when loader fails', async () => {
    const error = new Error('Failed to load');
    (mockLoader as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    const defaults: DefaultTranslations = {
      en: {
        common: {
          hello: 'default hello',
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);
    const result = await loader('en', 'common');

    expect(result).toEqual({
      hello: 'default hello',
    });
  });

  it('should throw error when loader fails and no defaults available', async () => {
    const error = new Error('Failed to load');
    (mockLoader as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    const defaults: DefaultTranslations = {
      es: {
        common: {
          hola: 'mundo',
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);

    await expect(loader('en', 'common')).rejects.toThrow('Failed to load');
  });

  it('should return defaults when remote returns empty object', async () => {
    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const defaults: DefaultTranslations = {
      en: {
        common: {
          hello: 'default hello',
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);
    const result = await loader('en', 'common');

    expect(result).toEqual({
      hello: 'default hello',
    });
  });

  it('should return defaults when remote returns null', async () => {
    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const defaults: DefaultTranslations = {
      en: {
        common: {
          hello: 'default hello',
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);
    const result = await loader('en', 'common');

    expect(result).toEqual({
      hello: 'default hello',
    });
  });

  it('should return empty object when both remote and defaults are empty', async () => {
    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const defaults: DefaultTranslations = {};

    const loader = withDefaultTranslations(mockLoader, defaults);
    const result = await loader('en', 'common');

    expect(result).toEqual({});
  });

  it('should deep merge nested translations', async () => {
    const remoteTranslations: TranslationRecord = {
      user: {
        profile: {
          name: 'remote name',
        },
      },
    };

    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue(remoteTranslations);

    const defaults: DefaultTranslations = {
      en: {
        common: {
          user: {
            profile: {
              name: 'default name',
              email: 'default email',
            },
            settings: {
              theme: 'default theme',
            },
          },
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);
    const result = await loader('en', 'common');

    expect(result).toEqual({
      user: {
        profile: {
          name: 'remote name', // Overridden by remote
          email: 'default email', // From defaults
        },
        settings: {
          theme: 'default theme', // From defaults
        },
      },
    });
  });

  it('should handle arrays as leaf values', async () => {
    const remoteTranslations: TranslationRecord = {
      items: ['remote1', 'remote2'],
    };

    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue(remoteTranslations);

    const defaults: DefaultTranslations = {
      en: {
        common: {
          items: ['default1', 'default2', 'default3'],
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);
    const result = await loader('en', 'common');

    // Arrays are replaced, not merged
    expect(result).toEqual({
      items: ['remote1', 'remote2'],
    });
  });

  it('should handle mixed types between defaults and remote', async () => {
    const remoteTranslations: TranslationRecord = {
      value: {
        nested: 'remote nested',
      },
    };

    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue(remoteTranslations);

    const defaults: DefaultTranslations = {
      en: {
        common: {
          value: 'default string',
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);
    const result = await loader('en', 'common');

    // Remote value replaces default entirely
    expect(result).toEqual({
      value: {
        nested: 'remote nested',
      },
    });
  });

  it('should not mutate original defaults', async () => {
    const remoteTranslations: TranslationRecord = {
      hello: 'remote hello',
    };

    (mockLoader as ReturnType<typeof vi.fn>).mockResolvedValue(remoteTranslations);

    const defaults: DefaultTranslations = {
      en: {
        common: {
          hello: 'default hello',
          goodbye: 'default goodbye',
        },
      },
    };

    const defaultsCopy = JSON.parse(JSON.stringify(defaults));

    const loader = withDefaultTranslations(mockLoader, defaults);
    await loader('en', 'common');

    // Defaults should remain unchanged
    expect(defaults).toEqual(defaultsCopy);
  });

  it('should handle multiple namespaces', async () => {
    const translations1: TranslationRecord = { hello: 'world' };
    const translations2: TranslationRecord = { login: 'sign in' };

    (mockLoader as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(translations1)
      .mockResolvedValueOnce(translations2);

    const defaults: DefaultTranslations = {
      en: {
        common: {
          hello: 'default hello',
        },
        auth: {
          login: 'default login',
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);

    const result1 = await loader('en', 'common');
    const result2 = await loader('en', 'auth');

    expect(result1).toEqual({ hello: 'world' });
    expect(result2).toEqual({ login: 'sign in' });
  });

  it('should handle multiple languages', async () => {
    const enTranslations: TranslationRecord = { hello: 'world' };
    const esTranslations: TranslationRecord = { hello: 'mundo' };

    (mockLoader as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(enTranslations)
      .mockResolvedValueOnce(esTranslations);

    const defaults: DefaultTranslations = {
      en: {
        common: {
          hello: 'default hello',
        },
      },
      es: {
        common: {
          hello: 'default hola',
        },
      },
    };

    const loader = withDefaultTranslations(mockLoader, defaults);

    const enResult = await loader('en', 'common');
    const esResult = await loader('es', 'common');

    expect(enResult).toEqual({ hello: 'world' });
    expect(esResult).toEqual({ hello: 'mundo' });
  });
});
