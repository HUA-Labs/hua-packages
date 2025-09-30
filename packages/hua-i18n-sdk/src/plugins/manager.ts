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
          if (hookName === 'beforeTranslate' || hookName === 'afterTranslate') {
            const hookResult = await hook(context as any);
            if (hookResult !== undefined) {
              result = hookResult as T;
            }
          } else {
            await hook(context as any);
          }
        } catch (error) {
          console.error(`Error executing ${hookName} hook in plugin ${plugin.name}:`, error);
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
    const errorContext = { ...context, error };
    const errorHook = plugin.hooks.onError;
    
    if (errorHook) {
      try {
        await errorHook(errorContext);
      } catch (hookError) {
        console.error(`Error in error hook of plugin ${plugin.name}:`, hookError);
      }
    }
  }

  /**
   * 훅 실행자 초기화
   */
  private initializeHookExecutors(): void {
    const hookNames: (keyof PluginHooks)[] = [
      'beforeLoad',
      'afterLoad', 
      'beforeTranslate',
      'afterTranslate',
      'onError',
      'onLanguageChange',
      'onNamespaceChange',
      'onInit',
      'onDestroy'
    ];

    hookNames.forEach(hookName => {
      this.hookExecutors.set(hookName, []);
    });
  }

  /**
   * 훅 실행자 업데이트 (우선순위 정렬)
   */
  private updateHookExecutors(): void {
    const plugins = Array.from(this.plugins.values());
    
    // 우선순위별로 정렬
    plugins.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // 각 훅별로 플러그인 재정렬
    this.hookExecutors.forEach((_, hookName) => {
      const hookPlugins = plugins.filter(plugin => 
        plugin.hooks[hookName] !== undefined
      );
      this.hookExecutors.set(hookName, hookPlugins);
    });
  }

  /**
   * 플러그인 상태 조회
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
      priority: (plugin as any).priority || PluginPriority.NORMAL
    }));

    return {
      totalPlugins: this.plugins.size,
      activeHooks,
      pluginList
    };
  }

  /**
   * 플러그인 검증
   */
  validatePlugin(plugin: Plugin): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 필수 필드 검증
    if (!plugin.name) {
      errors.push('Plugin name is required');
    }
    
    if (!plugin.version) {
      errors.push('Plugin version is required');
    }
    
    if (!plugin.hooks) {
      errors.push('Plugin hooks are required');
    }

    // 훅 함수 검증
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hookName, hook]) => {
        if (hook && typeof hook !== 'function') {
          errors.push(`Hook ${hookName} must be a function`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 플러그인 초기화
   */
  async initializePlugins(context: PluginContext): Promise<void> {
    await this.executeHook('onInit', context);
  }

  /**
   * 플러그인 정리
   */
  async destroyPlugins(context: PluginContext): Promise<void> {
    await this.executeHook('onDestroy', context);
    this.plugins.clear();
    this.hookExecutors.clear();
    this.initializeHookExecutors();
  }
} 