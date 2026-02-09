/**
 * @hua-labs/i18n-core/server
 *
 * Server-only entry point — no React hooks, no "use client" directives.
 * Safe to use in Next.js Server Components, API routes, and middleware.
 */

export { Translator, ssrTranslate, serverTranslate } from './core/translator';
export type { I18nConfig } from './types';
