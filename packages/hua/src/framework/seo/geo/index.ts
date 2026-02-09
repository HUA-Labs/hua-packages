/**
 * @hua-labs/hua/framework - GEO (Generative Engine Optimization)
 *
 * Make your application discoverable and recommendable by AI search engines
 * (ChatGPT, Claude, Gemini, Perplexity)
 *
 * ChatGPT, Claude, Gemini, Perplexity 같은 AI 검색 엔진이
 * 당신의 애플리케이션을 잘 찾고 추천하도록 최적화
 */

// Main GEO function
export {
  generateGEOMetadata,
  renderJSONLD,
  createAIContext,
  metaToObject,
  openGraphToObject,
} from './generateGEOMetadata';

// Server Component helpers (Next.js 15/16)
export {
  generateGEOForMetadata,
  generateGEOScripts,
  getGEOMetadata,
  generateGEOForMetadataAsync,
  combineGEOConfigs,
  createGEOFromEnv,
} from './server';

// Structured data helpers
export {
  generateSoftwareApplicationLD,
  generateFAQPageLD,
  generateTechArticleLD,
  generateHowToLD,
  generateCodeLD,
  generateVideoLD,
  generateOrganizationLD,
} from './structuredData';

// Presets
export { GEO_PRESETS } from './presets';
export type { GEOPreset } from './presets';

// Validator
export {
  validateJsonLd,
  validateGEOMetadata as validateGEOMetadataStructure,
  formatValidationResult,
} from './validator';
export type { ValidationError, ValidationResult } from './validator';

// Test utilities
export {
  validateGEOMetadata,
  prettyPrintGEOMetadata,
  compareGEOMetadata,
} from './test-utils';
export type { GEOValidationResult } from './test-utils';

// Constants
export { META_NAMES, OG_PROPERTIES } from './types';

// Types
export type {
  GEOConfig,
  GEOMetadata,
  StructuredData,
  SoftwareApplicationType,
  SoftwareCategory,
  ProgrammingLanguage,
  TechnologyStack,
  RequiredGEOConfig,
  OptionalGEOConfig,
  GEOConfigInput,
} from './types';

// Type guards
export { isValidGEOConfig } from './types';
