import { PreloadOptions, TranslationLoader } from './types';

const defaultLogger = console;

export async function preloadNamespaces(
  language: string,
  namespaces: string[],
  loader: TranslationLoader,
  options: PreloadOptions = {}
) {
  const logger = options.logger ?? defaultLogger;

  const results = await Promise.allSettled(
    namespaces.map(async (namespace) => {
      await loader(language, namespace);
      return namespace;
    })
  );

  const fulfilled = results.filter(
    (result): result is PromiseFulfilledResult<string> =>
      result.status === 'fulfilled'
  );
  const rejected = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected'
  );

  if (fulfilled.length > 0) {
    logger.log?.(
      `[i18n-loaders] Preloaded ${fulfilled.length}/${namespaces.length} namespaces for ${language}`
    );
  }

  if (rejected.length > 0 && !options.suppressErrors) {
    logger.warn?.(
      `[i18n-loaders] Failed to preload ${rejected.length} namespaces for ${language}`
    );
  }

  return {
    fulfilled: fulfilled.map((result) => result.value),
    rejected: rejected.map((result) => result.reason)
  };
}

export async function warmFallbackLanguages(
  currentLanguage: string,
  languages: string[],
  namespaces: string[],
  loader: TranslationLoader,
  options: PreloadOptions = {}
) {
  const targets = languages.filter((language) => language !== currentLanguage);
  if (targets.length === 0) {
    return [];
  }

  return Promise.all(
    targets.map((language) =>
      preloadNamespaces(language, namespaces, loader, options)
    )
  );
}

