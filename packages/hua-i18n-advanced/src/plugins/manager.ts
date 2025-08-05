/**
 * 플러그인 매니저 - 플러그인 시스템의 핵심
 * 플러그인 등록, 실행, 관리 기능 제공
 */

import { Plugin, PluginManager, PluginContext, PluginHooks, PluginWithPriority, PluginPriority } from './types';

export class I18nPluginManager implements PluginManager {
  private plugins: Map<string, PluginWithPriority> = new Map();
  private hookExecutors: Map<keyof PluginHooks, PluginWithPriority[]> = new Map();

  constructor() {
    this.initializeHookExecutors();
  }

  /**
   * 플러그인 등록
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered. Overwriting...`);
    }

    const pluginWithPriority: PluginWithPriority = {
      ...plugin,
      priority: (plugin as any).priority || PluginPriority.NORMAL
    };

    this.plugins.set(plugin.name, pluginWithPriority);
    this.updateHookExecutors();
    
    console.log(`Plugin ${plugin.name} v${plugin.version} registered successfully`);
  }

  /**
   * 플러그인 등록 해제
   */
  unregister(pluginName: string): void {
    if (!this.plugins.has(pluginName)) {
      console.warn(`Plugin ${pluginName} is not registered`);
      return;
    }

    this.plugins.delete(pluginName);
    this.updateHookExecutors();
    
    console.log(`Plugin ${pluginName} unregistered successfully`);
  }

  /**
   * 특정 플러그인 조회
   */
  getPlugin(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName);
  }

  /**
   * 모든 플러그인 조회
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 훅 실행 (결과값 없음)
   */
  async executeHook(hookName: keyof PluginHooks, context: PluginContext): Promise<void> {
    const plugins = this.hookExecutors.get(hookName) || [];
    
    for (const plugin of plugins) {
      const hook = plugin.hooks[hookName];
      if (hook) {
        try {
          await hook(context as any);
        } catch (error) {
          console.error(`Error executing ${hookName} hook in plugin ${plugin.name}:`, error);
          
          // 에러 훅 실행
          await this.executeErrorHook(plugin, context, error as Error);
        }
      }
    }
  }

  /**
   * 훅 실행 (결과값 있음)
   */
  async executeHookWithResult<T>(
    hookName: keyof PluginHooks, 
    context: PluginContext, 
    defaultValue: T
  ): Promise<T> {
    const plugins = this.hookExecutors.get(hookName) || [];
    let result = defaultValue;
    
    for (const plugin of plugins) {
      const hook = plugin.hooks[hookName];
      if (hook) {
        try {
          // 결과를 수정할 수 있는 훅의 경우
          const hookResult = await hook(context as any);
          if (hookResult !== undefined) {
            result = hookResult as T;
          }
        } catch (error) {
          console.error(`Error executing ${hookName} hook in plugin ${plugin.name}:`, error);
          
          // 에러 훅 실행
          await this.executeErrorHook(plugin, context, error as Error);
        }
      }
    }
    
    return result;
  }

  /**
   * 에러 훅 실행
   */
  private async executeErrorHook(plugin: Plugin, context: PluginContext, error: Error): Promise<void> {
    const errorContext = {
      ...context,
      error,
      metadata: {
        ...context.metadata,
        pluginName: plugin.name,
        pluginVersion: plugin.version
      }
    };

    try {
      await this.executeHook('onTranslateError', errorContext);
    } catch (hookError) {
      console.error(`Error in error hook for plugin ${plugin.name}:`, hookError);
    }
  }

  /**
   * 훅 실행자 초기화
   */
  private initializeHookExecutors(): void {
    const hookNames: (keyof PluginHooks)[] = [
      'beforeTranslate',
      'afterTranslate',
      'onTranslateError',
      'onLanguageChange',
      'onNamespaceLoad',
      'onNamespaceLoadError',
      'onInitialize',
      'onDestroy'
    ];

    hookNames.forEach(hookName => {
      this.hookExecutors.set(hookName, []);
    });
  }

  /**
   * 훅 실행자 업데이트
   */
  private updateHookExecutors(): void {
    // 모든 훅 실행자 초기화
    this.hookExecutors.forEach((_, hookName) => {
      this.hookExecutors.set(hookName, []);
    });

    // 플러그인들을 우선순위별로 정렬하여 훅 실행자에 추가
    const sortedPlugins = Array.from(this.plugins.values())
      .sort((a, b) => b.priority - a.priority);

    sortedPlugins.forEach(plugin => {
      Object.keys(plugin.hooks).forEach(hookName => {
        const hook = hookName as keyof PluginHooks;
        const executors = this.hookExecutors.get(hook) || [];
        executors.push(plugin);
        this.hookExecutors.set(hook, executors);
      });
    });
  }

  /**
   * 플러그인 매니저 상태 조회
   */
  getStatus(): {
    totalPlugins: number;
    activeHooks: Record<string, number>;
    pluginList: Array<{ name: string; version: string; priority: number }>;
  } {
    const activeHooks: Record<string, number> = {};
    
    this.hookExecutors.forEach((plugins, hookName) => {
      activeHooks[hookName] = plugins.length;
    });

    const pluginList = Array.from(this.plugins.values()).map(plugin => ({
      name: plugin.name,
      version: plugin.version,
      priority: plugin.priority
    }));

    return {
      totalPlugins: this.plugins.size,
      activeHooks,
      pluginList
    };
  }

  /**
   * 플러그인 유효성 검사
   */
  validatePlugin(plugin: Plugin): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 필수 필드 검사
    if (!plugin.name) {
      errors.push('Plugin name is required');
    }

    if (!plugin.version) {
      errors.push('Plugin version is required');
    }

    if (!plugin.hooks) {
      errors.push('Plugin hooks are required');
    }

    // 훅 함수 검사
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hookName, hook]) => {
        if (hook && typeof hook !== 'function') {
          errors.push(`Hook ${hookName} must be a function`);
        }
      });
    }

    // 우선순위 검사
    if (plugin.priority !== undefined) {
      if (typeof plugin.priority !== 'number' || plugin.priority < 0) {
        errors.push('Plugin priority must be a non-negative number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 모든 플러그인 초기화
   */
  async initializePlugins(context: PluginContext): Promise<void> {
    await this.executeHook('onInitialize', context);
  }

  /**
   * 모든 플러그인 정리
   */
  async destroyPlugins(context: PluginContext): Promise<void> {
    await this.executeHook('onDestroy', context);
  }
} 