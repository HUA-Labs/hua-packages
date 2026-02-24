/**
 * Test fixture for no-missing-key rule tests.
 * Simulates the output of generate-i18n-types.ts.
 */
export interface I18nKeys {
  common: {
    strings: 'welcome' | 'goodbye' | 'save' | 'cancel';
    arrays: 'items' | 'options';
  };
  'docs-cards': {
    strings: 'title' | 'description';
    arrays: never;
  };
  user: {
    strings: 'profile.name' | 'profile.email' | 'settings.theme';
    arrays: never;
  };
}

export type TranslationStringKey =
  | `common:${I18nKeys['common']['strings']}`
  | `${'docs-cards'}:${I18nKeys['docs-cards']['strings']}`
  | `user:${I18nKeys['user']['strings']}`;

export type TranslationArrayKey =
  | `common:${I18nKeys['common']['arrays']}`;
