/**
 * 플러그인 시스템 - 타입 정의
 * 확장 가능한 아키텍처를 위한 플러그인 인터페이스
 */

// 임시 타입 정의 (나중에 core 패키지에서 import할 예정)
export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

export interface TranslationData {
  [namespace: string]: TranslationNamespace;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
}

export interface I18nConfig {
  defaultLanguage: string;
  fallbackLanguage?: string;
  supportedLanguages: LanguageConfig[];
  namespaces?: string[];
  loadTranslations: (language: string, namespace: string) => Promise<TranslationNamespace>;
  debug?: boolean;
}

export interface PluginContext {
  config: I18nConfig;
  language: string;
  namespace: string;
  key: string;
  value?: string;
  error?: Error;
  performance?: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

export interface PluginHooks {
  // 번역 로드 전
  beforeLoad?: (context: PluginContext) => Promise<void> | void;
  
  // 번역 로드 후
  afterLoad?: (context: PluginContext & { data: TranslationData }) => Promise<void> | void;
  
  // 번역 키 조회 전
  beforeTranslate?: (context: PluginContext) => Promise<void> | void;
  
  // 번역 키 조회 후
  afterTranslate?: (context: PluginContext & { result: string }) => Promise<void> | void;
  
  // 에러 발생 시
  onError?: (context: PluginContext & { error: Error }) => Promise<void> | void;
  
  // 언어 변경 시
  onLanguageChange?: (context: PluginContext & { previousLanguage: string }) => Promise<void> | void;
  
  // 네임스페이스 변경 시
  onNamespaceChange?: (context: PluginContext & { previousNamespace: string }) => Promise<void> | void;
  
  // 초기화 시
  onInit?: (context: PluginContext) => Promise<void> | void;
  
  // 정리 시
  onDestroy?: (context: PluginContext) => Promise<void> | void;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  priority?: PluginPriority;
  hooks: PluginHooks;
  options?: Record<string, any>;
}

export interface PluginManager {
  register(plugin: Plugin): void;
  unregister(pluginName: string): void;
  getPlugin(pluginName: string): Plugin | undefined;
  getAllPlugins(): Plugin[];
  executeHook(hookName: keyof PluginHooks, context: PluginContext): Promise<void>;
  executeHookWithResult<T>(
    hookName: keyof PluginHooks, 
    context: PluginContext, 
    defaultValue: T
  ): Promise<T>;
}

export interface PluginFactory<T = any> {
  (options?: T): Plugin;
}

// 플러그인 이벤트 타입
export type PluginEvent = 
  | 'beforeLoad'
  | 'afterLoad'
  | 'beforeTranslate'
  | 'afterTranslate'
  | 'onError'
  | 'onLanguageChange'
  | 'onNamespaceChange'
  | 'onInit'
  | 'onDestroy';

// 플러그인 우선순위
export enum PluginPriority {
  LOW = 0,
  NORMAL = 50,
  HIGH = 100,
  CRITICAL = 200
}

export interface PluginWithPriority extends Plugin {
  priority?: PluginPriority;
}

// 플러그인 메타데이터
export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
  dependencies?: string[];
  peerDependencies?: string[];
}

// 플러그인 설정 스키마
export interface PluginConfigSchema {
  type: 'object' | 'string' | 'number' | 'boolean' | 'array';
  properties?: Record<string, any>;
  required?: string[];
  default?: any;
  description?: string;
}

export interface PluginConfig {
  schema: PluginConfigSchema;
  validate: (options: any) => boolean;
  sanitize: (options: any) => any;
} 