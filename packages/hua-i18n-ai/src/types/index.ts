// AI 패키지용 타입 정의
export interface Plugin {
  id: string;
  name: string;
  version: string;
  priority?: PluginPriority;
  hooks: PluginHooks;
  options?: Record<string, any>;
}

export interface PluginFactory<T = any> {
  (options?: T): Plugin;
}

export interface PluginContext {
  config: any;
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
  beforeLoad?: (context: PluginContext) => Promise<void> | void;
  afterLoad?: (context: PluginContext & { data: any }) => Promise<void> | void;
  beforeTranslate?: (context: PluginContext) => Promise<void> | void;
  afterTranslate?: (context: PluginContext & { result: string }) => Promise<void> | void;
  onError?: (context: PluginContext & { error: Error }) => Promise<void> | void;
  onLanguageChange?: (context: PluginContext & { previousLanguage: string }) => Promise<void> | void;
  onNamespaceChange?: (context: PluginContext & { previousNamespace: string }) => Promise<void> | void;
  onInit?: (context: PluginContext) => Promise<void> | void;
  onDestroy?: (context: PluginContext) => Promise<void> | void;
}

export enum PluginPriority {
  LOW = 0,
  NORMAL = 50,
  HIGH = 100,
  CRITICAL = 200
} 