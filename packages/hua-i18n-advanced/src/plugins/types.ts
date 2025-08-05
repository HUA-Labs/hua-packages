/**
 * 플러그인 시스템 타입 정의
 */

export interface PluginContext {
  language: string;
  namespace: string;
  key?: string;
  value?: string;
  params?: Record<string, unknown>;
  error?: Error;
  metadata?: Record<string, unknown>;
}

export interface PluginHooks {
  // 번역 전
  beforeTranslate?: (context: PluginContext) => Promise<void> | void;
  
  // 번역 후
  afterTranslate?: (context: PluginContext & { result: string }) => Promise<void> | void;
  
  // 번역 실패
  onTranslateError?: (context: PluginContext & { error: Error }) => Promise<void> | void;
  
  // 언어 변경
  onLanguageChange?: (context: PluginContext & { previousLanguage: string }) => Promise<void> | void;
  
  // 네임스페이스 로드
  onNamespaceLoad?: (context: PluginContext & { data: Record<string, string> }) => Promise<void> | void;
  
  // 네임스페이스 로드 실패
  onNamespaceLoadError?: (context: PluginContext & { error: Error }) => Promise<void> | void;
  
  // 플러그인 초기화
  onInitialize?: (context: PluginContext) => Promise<void> | void;
  
  // 플러그인 정리
  onDestroy?: (context: PluginContext) => Promise<void> | void;
}

export interface Plugin {
  name: string;
  version: string;
  description?: string;
  hooks: PluginHooks;
  priority?: number;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface PluginFactory {
  (): Plugin;
}

export interface PluginWithPriority extends Plugin {
  priority: number;
}

export enum PluginPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 15
}

export interface PluginManager {
  register(plugin: Plugin): void;
  unregister(pluginName: string): void;
  getPlugin(pluginName: string): Plugin | undefined;
  getAllPlugins(): Plugin[];
  executeHook(hookName: keyof PluginHooks, context: PluginContext): Promise<void>;
  executeHookWithResult<T>(hookName: keyof PluginHooks, context: PluginContext, defaultValue: T): Promise<T>;
} 