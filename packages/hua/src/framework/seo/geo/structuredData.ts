/**
 * @hua-labs/hua/framework - Structured Data Helpers
 *
 * Schema.org JSON-LD helpers for AI search engines
 * AI 검색 엔진이 이해하기 쉬운 구조화된 데이터 생성
 */

import type {
  GEOConfig,
  StructuredData,
  SoftwareApplicationType,
  ProgrammingLanguage,
  SoftwareCategory,
  TechnologyStack,
} from './types';

/**
 * Normalize array (single value or array to array)
 */
function normalizeToArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Join non-empty array values
 */
function joinNonEmpty(values: string[] | undefined, separator: string): string | undefined {
  if (!values || values.length === 0) return undefined;
  const nonEmpty = values.filter(v => v && v.trim().length > 0);
  return nonEmpty.length > 0 ? nonEmpty.join(separator) : undefined;
}

/**
 * Generate Schema.org SoftwareApplication JSON-LD
 *
 * AI 검색 엔진이 소프트웨어를 정확하게 이해하도록 Schema.org 구조화된 데이터 생성
 *
 * @param config - GEO configuration
 * @returns Schema.org JSON-LD structured data
 *
 * @example
 * ```tsx
 * const jsonLd = generateSoftwareApplicationLD({
 *   name: 'hua-ux',
 *   description: 'Privacy-first UX framework for Next.js',
 *   version: '1.0.0',
 *   applicationCategory: 'UX Framework',
 *   programmingLanguage: ['TypeScript', 'React'],
 *   features: ['i18n', 'Motion', 'Accessibility'],
 * });
 * ```
 */
export function generateSoftwareApplicationLD(config: GEOConfig): StructuredData {
  const jsonLd: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config.name,
    description: config.description,
  };

  // Alternative names (filter empty values)
  const alternateNames = normalizeToArray(config.alternateName);
  const validAlternateNames = alternateNames.filter(name => name && name.trim().length > 0);
  if (validAlternateNames.length > 0) {
    jsonLd.alternateName = validAlternateNames;
  }

  // Version
  if (config.version) {
    jsonLd.softwareVersion = config.version;
  }

  // Application category (filter empty values)
  const categories = normalizeToArray(config.applicationCategory);
  const categoryContent = joinNonEmpty(categories, ', ');
  if (categoryContent) {
    jsonLd.applicationCategory = categoryContent;
  }

  // Programming language (filter empty values)
  const languages = normalizeToArray(config.programmingLanguage);
  const languageContent = joinNonEmpty(languages, ', ');
  if (languageContent) {
    jsonLd.programmingLanguage = languageContent;
  }

  // Technology stack (filter empty values)
  // Note: Schema.org doesn't have a direct "technologyStack" field,
  // so we include it in keywords for AI discoverability
  const techStack = normalizeToArray(config.technologyStack);
  const techStackContent = joinNonEmpty(techStack, ', ');
  if (techStackContent && jsonLd.keywords) {
    // Append to existing keywords
    jsonLd.keywords = `${jsonLd.keywords}, ${techStackContent}`;
  } else if (techStackContent) {
    // Create keywords if doesn't exist
    jsonLd.keywords = techStackContent;
  }

  // Application type
  if (config.applicationType) {
    jsonLd.applicationSubType = config.applicationType;
  }

  // URLs
  if (config.url) {
    jsonLd.url = config.url;
  }

  if (config.documentationUrl) {
    jsonLd.softwareHelp = {
      '@type': 'CreativeWork',
      url: config.documentationUrl,
    };
  }

  if (config.codeRepository) {
    jsonLd.codeRepository = config.codeRepository;
  }

  // License
  if (config.license) {
    jsonLd.license = config.license;
  }

  // Author
  if (config.author) {
    jsonLd.author = {
      '@type': 'Organization',
      name: config.author.name,
      ...(config.author.url && { url: config.author.url }),
    };
  }

  // Features as keywords (filter empty values)
  const featureList = joinNonEmpty(config.features, ', ');
  if (featureList) {
    jsonLd.featureList = featureList;
  }

  // Keywords (filter empty values)
  const keywordsContent = joinNonEmpty(config.keywords, ', ');
  if (keywordsContent) {
    jsonLd.keywords = keywordsContent;
  }

  // Operating system (filter empty values)
  const osContent = joinNonEmpty(config.operatingSystem, ', ');
  if (osContent) {
    jsonLd.operatingSystem = osContent;
  }

  // Software requirements (filter empty values)
  const requirementsContent = joinNonEmpty(config.softwareRequirements, ', ');
  if (requirementsContent) {
    jsonLd.softwareRequirements = requirementsContent;
  }

  return jsonLd;
}

/**
 * Generate Schema.org Code JSON-LD
 *
 * AI가 코드 스니펫과 예제를 이해하도록 Code 구조화된 데이터 생성
 *
 * @param code - Code configuration
 * @returns Schema.org Code JSON-LD
 *
 * @example
 * ```tsx
 * const codeLd = generateCodeLD({
 *   programmingLanguage: 'TypeScript',
 *   text: 'const x = 1;',
 *   name: 'Example Code',
 * });
 * ```
 */
export function generateCodeLD(code: {
  programmingLanguage: string;
  text: string;
  name?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Code',
    programmingLanguage: code.programmingLanguage,
    text: code.text,
    ...(code.name && { name: code.name }),
  };
}

/**
 * Generate Schema.org VideoObject JSON-LD
 *
 * AI가 튜토리얼 비디오를 이해하고 추천할 수 있도록 VideoObject 구조화된 데이터 생성
 *
 * @param video - Video configuration
 * @returns Schema.org VideoObject JSON-LD
 *
 * @example
 * ```tsx
 * const videoLd = generateVideoLD({
 *   name: 'Getting Started with hua-ux',
 *   description: 'Learn how to build with hua-ux',
 *   thumbnailUrl: 'https://example.com/thumb.jpg',
 *   uploadDate: '2025-12-29',
 *   duration: 'PT10M30S',
 * });
 * ```
 */
export function generateVideoLD(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    ...(video.duration && { duration: video.duration }),
    ...(video.contentUrl && { contentUrl: video.contentUrl }),
  };
}

/**
 * Generate Schema.org Organization JSON-LD
 *
 * AI가 조직/회사 정보를 이해하도록 Organization 구조화된 데이터 생성
 *
 * @param org - Organization configuration
 * @returns Schema.org Organization JSON-LD
 *
 * @example
 * ```tsx
 * const orgLd = generateOrganizationLD({
 *   name: 'hua-labs',
 *   url: 'https://example.com', // TODO: Update when domain is available
 *   logo: 'https://example.com/logo.png', // TODO: Update when domain is available
 *   description: 'Privacy-first development tools',
 * });
 * ```
 */
export function generateOrganizationLD(org: {
  name: string;
  url?: string;
  logo?: string;
  description?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    ...(org.url && { url: org.url }),
    ...(org.logo && { logo: org.logo }),
    ...(org.description && { description: org.description }),
  };
}

/**
 * Generate Schema.org FAQPage JSON-LD
 *
 * AI가 자주 묻는 질문에 답변할 수 있도록 FAQ 구조화된 데이터 생성
 *
 * @param faqs - Array of FAQ items
 * @returns Schema.org FAQ JSON-LD
 *
 * @example
 * ```tsx
 * const faqLd = generateFAQPageLD([
 *   {
 *     question: 'What is hua-ux?',
 *     answer: 'hua-ux is a privacy-first UX framework for Next.js applications.',
 *   },
 *   {
 *     question: 'How do I install hua-ux?',
 *     answer: 'Run: npx @hua-labs/create-hua-ux my-app',
 *   },
 * ]);
 * ```
 */
export function generateFAQPageLD(
  faqs: Array<{ question: string; answer: string }>
): StructuredData {
  // Input validation
  if (!faqs || faqs.length === 0) {
    throw new Error('FAQPage requires at least one FAQ item');
  }

  // Filter and validate FAQ items
  const validFaqs = faqs.filter(faq => {
    return faq.question?.trim() && faq.answer?.trim();
  });

  if (validFaqs.length === 0) {
    throw new Error('All FAQ items have empty questions or answers');
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer.trim(),
      },
    })),
  };
}

/**
 * Generate Schema.org TechArticle JSON-LD
 *
 * AI가 기술 문서를 정확하게 이해하도록 기술 아티클 구조화된 데이터 생성
 *
 * @param article - Article configuration
 * @returns Schema.org TechArticle JSON-LD
 *
 * @example
 * ```tsx
 * const articleLd = generateTechArticleLD({
 *   headline: 'Getting Started with hua-ux',
 *   description: 'Learn how to build privacy-first UX with hua-ux',
 *   datePublished: '2025-12-29',
 *   author: { name: 'hua-labs' },
 * });
 * ```
 */
export function generateTechArticleLD(article: {
  headline: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  author?: { name: string; url?: string };
  image?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.headline,
    ...(article.description && { description: article.description }),
    ...(article.datePublished && { datePublished: article.datePublished }),
    ...(article.dateModified && { dateModified: article.dateModified }),
    ...(article.author && {
      author: {
        '@type': 'Organization',
        name: article.author.name,
        ...(article.author.url && { url: article.author.url }),
      },
    }),
    ...(article.image && { image: article.image }),
  };
}

/**
 * Generate Schema.org HowTo JSON-LD
 *
 * AI가 튜토리얼/가이드를 이해하고 추천할 수 있도록 HowTo 구조화된 데이터 생성
 *
 * @param howTo - HowTo configuration
 * @returns Schema.org HowTo JSON-LD
 *
 * @example
 * ```tsx
 * const howToLd = generateHowToLD({
 *   name: 'How to add i18n to your Next.js app',
 *   description: 'Step-by-step guide to internationalization',
 *   steps: [
 *     { name: 'Install hua-ux', text: 'Run: npx @hua-labs/create-hua-ux my-app' },
 *     { name: 'Configure i18n', text: 'Add locales to your config' },
 *   ],
 * });
 * ```
 */
export function generateHowToLD(howTo: {
  name: string;
  description?: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string;
}): StructuredData {
  // Input validation
  if (!howTo.name || howTo.name.trim().length === 0) {
    throw new Error('HowTo.name is required and cannot be empty');
  }

  if (!howTo.steps || howTo.steps.length === 0) {
    throw new Error('HowTo requires at least one step');
  }

  // Filter and validate steps
  const validSteps = howTo.steps
    .filter(step => step.name?.trim() && step.text?.trim())
    .map((step, index) => ({
      '@type': 'HowToStep' as const,
      position: index + 1,
      name: step.name.trim(),
      text: step.text.trim(),
      ...(step.image && { image: step.image }),
    }));

  if (validSteps.length === 0) {
    throw new Error('All HowTo steps have empty names or text');
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name.trim(),
    step: validSteps,
    ...(howTo.description && { description: howTo.description }),
    ...(howTo.totalTime && { totalTime: howTo.totalTime }),
  };
}
