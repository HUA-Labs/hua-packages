/**
 * @hua-labs/hua/framework - Plugin Registry
 * 
 * 플러그인 등록 및 관리 시스템
 */

import type { HuaPlugin } from './types';
import { hasLicense } from '../license';
import type { LicenseFeature } from '../license/types';

/**
 * 플러그인 레지스트리 / Plugin registry
 * 
 * 모든 플러그인을 등록하고 관리하는 싱글톤 클래스
 * Singleton class that registers and manages all plugins
 */
class PluginRegistry {
  private plugins: Map<string, HuaPlugin> = new Map();
  private initialized: Set<string> = new Set();

  /**
   * 플러그인 등록 / Register plugin
   * 
   * @param plugin - 등록할 플러그인
   * @throws 라이선스가 없을 경우 에러
   * 
   * @example
   * ```ts
   * import { registerPlugin } from '@hua-labs/hua/framework';
   * import { motionProPlugin } from '@hua-labs/motion-core/pro';
   * 
   * registerPlugin(motionProPlugin);
   * ```
   */
  register(plugin: HuaPlugin): void {
    // 중복 등록 확인
    if (this.plugins.has(plugin.name)) {
      console.warn(
        `[hua] Plugin "${plugin.name}" is already registered. Overwriting...`
      );
    }

    // 라이선스 검증
    if (plugin.license !== 'free') {
      // 플러그인의 checkLicense 함수가 있으면 사용
      if (plugin.checkLicense) {
        if (!plugin.checkLicense()) {
          throw new Error(
            `[hua] ❌ Plugin "${plugin.name}" requires a valid ${plugin.license} license.\n` +
            `[hua] ❌ Please purchase a ${plugin.license} license.`
          );
        }
      } else {
        // 기본 라이선스 검증 (license feature 기반)
        // Note: Plugin features may not be in FEATURE_LICENSE_MAP, so this is a best-effort check
        const feature = `plugin-${plugin.name}` as LicenseFeature;
        if (!hasLicense(feature)) {
          // 라이선스가 없어도 경고만 표시 (개발 환경)
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `[hua] ⚠️ Plugin "${plugin.name}" may require a ${plugin.license} license.\n` +
              `[hua] ⚠️ Some features may not work without a valid license.`
            );
          }
        }
      }
    }

    // 플러그인 등록
    this.plugins.set(plugin.name, plugin);

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[hua] ✅ Plugin "${plugin.name}" v${plugin.version} registered successfully`
      );
    }
  }

  /**
   * 플러그인 초기화 / Initialize plugin
   * 
   * 등록된 플러그인의 init 함수를 호출합니다.
   * Calls the init function of registered plugins.
   * 
   * @param pluginName - 플러그인 이름
   * @param config - 프레임워크 설정
   */
  async initialize(pluginName: string, config: any): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`[hua] Plugin "${pluginName}" not found`);
    }

    // 이미 초기화된 경우 스킵
    if (this.initialized.has(pluginName)) {
      return;
    }

    // init 함수 호출
    if (plugin.init) {
      await plugin.init(config);
      this.initialized.add(pluginName);
    }
  }

  /**
   * 모든 플러그인 초기화 / Initialize all plugins
   * 
   * @param config - 프레임워크 설정
   */
  async initializeAll(config: any): Promise<void> {
    const promises = Array.from(this.plugins.keys()).map(name =>
      this.initialize(name, config)
    );
    await Promise.all(promises);
  }

  /**
   * 플러그인 가져오기 / Get plugin
   * 
   * @param name - 플러그인 이름
   * @returns 플러그인 또는 undefined
   */
  get(name: string): HuaPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 모든 플러그인 가져오기 / Get all plugins
   * 
   * @returns 플러그인 배열
   */
  getAll(): HuaPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 플러그인 등록 해제 / Unregister plugin
   * 
   * @param name - 플러그인 이름
   */
  unregister(name: string): void {
    this.plugins.delete(name);
    this.initialized.delete(name);
  }

  /**
   * 레지스트리 초기화 (테스트용) / Reset registry (for testing)
   */
  reset(): void {
    this.plugins.clear();
    this.initialized.clear();
  }
}

/**
 * 전역 플러그인 레지스트리 인스턴스 / Global plugin registry instance
 */
export const pluginRegistry = new PluginRegistry();

/**
 * 플러그인 등록 (편의 함수) / Register plugin (convenience function)
 * 
 * @param plugin - 등록할 플러그인
 */
export function registerPlugin(plugin: HuaPlugin): void {
  pluginRegistry.register(plugin);
}

/**
 * 플러그인 가져오기 (편의 함수) / Get plugin (convenience function)
 * 
 * @param name - 플러그인 이름
 * @returns 플러그인 또는 undefined
 */
export function getPlugin(name: string): HuaPlugin | undefined {
  return pluginRegistry.get(name);
}

/**
 * 모든 플러그인 가져오기 (편의 함수) / Get all plugins (convenience function)
 * 
 * @returns 플러그인 배열
 */
export function getAllPlugins(): HuaPlugin[] {
  return pluginRegistry.getAll();
}
