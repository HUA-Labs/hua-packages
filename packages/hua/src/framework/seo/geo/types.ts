/**
 * @hua-labs/hua/framework - GEO Types
 *
 * GEO (Generative Engine Optimization) types for AI search engine discoverability
 * ChatGPT, Claude, Gemini, Perplexity 같은 AI가 hua를 잘 찾고 추천하도록 하는 타입 정의
 */

/**
 * Meta tag name constants
 * HTML meta 태그 이름 상수
 */
export const META_NAMES = {
  DESCRIPTION: 'description',
  KEYWORDS: 'keywords',
  SOFTWARE_VERSION: 'software:version',
  SOFTWARE_CATEGORY: 'software:category',
  SOFTWARE_LANGUAGE: 'software:language',
  AI_CONTEXT: 'ai:context',
} as const;

/**
 * Open Graph property constants
 * Open Graph 속성 상수
 */
export const OG_PROPERTIES = {
  TITLE: 'og:title',
  DESCRIPTION: 'og:description',
  TYPE: 'og:type',
  URL: 'og:url',
  SITE_NAME: 'og:site_name',
} as const;

/**
 * Software Application Type
 * Schema.org SoftwareApplication types
 */
export type SoftwareApplicationType =
  | 'WebApplication'
  | 'MobileApplication'
  | 'DesktopApplication'
  | 'DeveloperApplication';

/**
 * Programming Language
 * 프로그래밍 언어 (프레임워크가 아닌 실제 언어만)
 */
export type ProgrammingLanguage =
  | 'TypeScript'
  | 'JavaScript'
  | 'Python'
  | 'Java'
  | 'Go'
  | 'Rust'
  | 'C#'
  | 'C++'
  | 'Ruby'
  | 'PHP'
  | 'Swift'
  | 'Kotlin'
  | 'Dart'
  | (string & {}); // Allow custom strings for flexibility

/**
 * Technology Stack
 * 기술 스택 (프레임워크, 라이브러리 등)
 */
export type TechnologyStack =
  | 'React'
  | 'Next.js'
  | 'Vue'
  | 'Angular'
  | 'Svelte'
  | 'Node.js'
  | 'Express'
  | 'Tailwind CSS'
  | 'Zustand'
  | 'Prisma'
  | (string & {}); // Allow custom strings for flexibility

/**
 * Software Category
 * Categories that help AI understand the software domain
 */
export type SoftwareCategory =
  | 'UI Framework'
  | 'Component Library'
  | 'Developer Tool'
  | 'UX Framework'
  | 'Accessibility Tool'
  | 'Internationalization Tool'
  | 'Animation Library';

/**
 * GEO Configuration
 * AI 검색 엔진이 이해하기 쉬운 구조화된 메타데이터 설정
 */
export interface GEOConfig {
  /**
   * Software name
   * AI가 참조할 소프트웨어 이름
   */
  name: string;

  /**
   * Alternative names or aliases
   * 대체 이름 또는 별칭 (예: "hua", "@hua-labs/hua")
   */
  alternateName?: string[];

  /**
   * Clear, concise description
   * AI가 이해하기 쉬운 명확하고 간결한 설명 (1-2 문장)
   */
  description: string;

  /**
   * Software version
   */
  version?: string;

  /**
   * Application category
   * Schema.org applicationCategory
   */
  applicationCategory?: SoftwareCategory | SoftwareCategory[];

  /**
   * Programming language(s)
   * 프로그래밍 언어 (TypeScript, JavaScript, Python 등)
   */
  programmingLanguage?: ProgrammingLanguage | ProgrammingLanguage[];

  /**
   * Technology stack
   * 기술 스택 (React, Next.js, Vue 등)
   */
  technologyStack?: TechnologyStack | TechnologyStack[];

  /**
   * Software type
   */
  applicationType?: SoftwareApplicationType;

  /**
   * Homepage URL
   */
  url?: string;

  /**
   * Documentation URL
   */
  documentationUrl?: string;

  /**
   * Repository URL (GitHub, GitLab, etc.)
   */
  codeRepository?: string;

  /**
   * License type (MIT, Apache-2.0, etc.)
   */
  license?: string;

  /**
   * Author or organization
   */
  author?: {
    name: string;
    url?: string;
  };

  /**
   * Key features
   * AI가 쉽게 참조할 수 있는 주요 기능 목록
   */
  features?: string[];

  /**
   * Use cases
   * AI가 추천할 때 사용할 유스케이스 예시
   */
  useCases?: string[];

  /**
   * Keywords for AI discovery
   * AI 검색을 위한 키워드
   */
  keywords?: string[];

  /**
   * Operating system compatibility
   */
  operatingSystem?: string[];

  /**
   * Software requirements or dependencies
   */
  softwareRequirements?: string[];

  /**
   * Related software or alternatives
   * AI가 비교/추천할 때 사용할 관련 소프트웨어
   */
  relatedTo?: string[];
}

/**
 * Utility types for better developer experience
 * 더 나은 개발자 경험을 위한 유틸리티 타입
 */

/**
 * Required GEO config fields
 * 필수 GEO 설정 필드
 */
export type RequiredGEOConfig = Required<Pick<GEOConfig, 'name' | 'description'>>;

/**
 * Optional GEO config fields
 * 선택적 GEO 설정 필드
 */
export type OptionalGEOConfig = Partial<Omit<GEOConfig, 'name' | 'description'>>;

/**
 * GEO config input type
 * GEO 설정 입력 타입 (필수 + 선택)
 */
export type GEOConfigInput = RequiredGEOConfig & OptionalGEOConfig;

/**
 * Type guard for GEO config validation
 * GEO 설정 유효성 검사를 위한 타입 가드
 * 
 * @param config - Unknown value to check
 * @returns True if config is a valid GEOConfig
 * 
 * @example
 * ```tsx
 * if (isValidGEOConfig(userInput)) {
 *   const geoMeta = generateGEOMetadata(userInput);
 * }
 * ```
 */
export function isValidGEOConfig(config: unknown): config is GEOConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'name' in config &&
    'description' in config &&
    typeof (config as { name: unknown }).name === 'string' &&
    typeof (config as { description: unknown }).description === 'string'
  );
}

/**
 * Structured Data (Schema.org JSON-LD)
 * AI가 파싱하기 쉬운 구조화된 데이터
 */
export interface StructuredData {
  '@context': 'https://schema.org';
  '@type':
    | 'SoftwareApplication'
    | 'FAQPage'
    | 'TechArticle'
    | 'HowTo'
    | 'Question'
    | 'Answer'
    | 'Organization'
    | 'CreativeWork'
    | 'Code'
    | 'VideoObject';
  [key: string]: string | number | boolean | object | unknown[] | undefined;
}

/**
 * GEO Metadata Result
 * generateGEOMetadata() 함수의 반환 타입
 */
export interface GEOMetadata {
  /**
   * HTML meta tags
   */
  meta: {
    name: string;
    content: string;
  }[];

  /**
   * JSON-LD structured data
   * Schema.org 구조화된 데이터
   */
  jsonLd: StructuredData[];

  /**
   * Open Graph tags for social/AI sharing
   */
  openGraph?: {
    property: string;
    content: string;
  }[];

  /**
   * Twitter Card tags
   */
  twitter?: {
    name: string;
    content: string;
  }[];

  /**
   * Schema version
   * GEO 메타데이터 스키마 버전 (향후 마이그레이션 및 디버깅용)
   */
  version?: string;
}
