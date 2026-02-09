import { Translator } from './translator';
import { I18nConfig } from '../types';

/**
 * Translator 인스턴스를 관리하는 Factory 클래스
 * - Config 변경 감지
 * - 테스트 환경 격리
 * - 메모리 관리
 */
export class TranslatorFactory {
  private static instances = new Map<string, Translator>();
  private static configCache = new Map<string, I18nConfig>();
  private static readonly MAX_INSTANCES = 10; // 최대 인스턴스 수 제한

  /**
   * Config를 기반으로 고유 키 생성
   */
  private static generateConfigKey(config: I18nConfig): string {
    // Config의 핵심 속성들을 기반으로 키 생성
    const keyParts = [
      config.defaultLanguage,
      config.fallbackLanguage || 'en',
      config.namespaces?.join(',') || 'common',
      config.debug ? 'debug' : 'prod',
    ];
    return keyParts.join('|');
  }

  /**
   * Config가 변경되었는지 확인
   */
  private static isConfigChanged(configKey: string, newConfig: I18nConfig): boolean {
    const cachedConfig = this.configCache.get(configKey);
    if (!cachedConfig) return true;

    // 핵심 속성들만 비교
    return (
      cachedConfig.defaultLanguage !== newConfig.defaultLanguage ||
      cachedConfig.fallbackLanguage !== newConfig.fallbackLanguage ||
      JSON.stringify(cachedConfig.namespaces) !== JSON.stringify(newConfig.namespaces) ||
      cachedConfig.debug !== newConfig.debug
    );
  }

  /**
   * Translator 인스턴스 생성 또는 반환
   */
  static create(config: I18nConfig): Translator {
    const configKey = this.generateConfigKey(config);
    
    // Config가 변경되었거나 인스턴스가 없으면 새로 생성
    if (!this.instances.has(configKey) || this.isConfigChanged(configKey, config)) {
      // 최대 인스턴스 수 초과 시 오래된 인스턴스 제거 (LRU 방식)
      if (this.instances.size >= this.MAX_INSTANCES && !this.instances.has(configKey)) {
        // 가장 오래된 인스턴스 제거 (Map은 삽입 순서 유지)
        const oldestKey = this.instances.keys().next().value;
        if (oldestKey) {
          const oldInstance = this.instances.get(oldestKey);
          if (oldInstance) {
            oldInstance.clearCache();
          }
          this.instances.delete(oldestKey);
          this.configCache.delete(oldestKey);
        }
      }

      // 기존 인스턴스 정리
      if (this.instances.has(configKey)) {
        const oldInstance = this.instances.get(configKey)!;
        oldInstance.clearCache();
      }
      
      // 새 인스턴스 생성
      const newInstance = new Translator(config);
      this.instances.set(configKey, newInstance);
      this.configCache.set(configKey, { ...config });
    }
    
    return this.instances.get(configKey)!;
  }

  /**
   * 특정 Config 키의 Translator 인스턴스 반환
   */
  static get(config: I18nConfig): Translator | null {
    const configKey = this.generateConfigKey(config);
    return this.instances.get(configKey) || null;
  }

  /**
   * 모든 Translator 인스턴스 정리 (테스트용)
   */
  static clear(): void {
    // 모든 인스턴스의 캐시 정리
    for (const instance of this.instances.values()) {
      instance.clearCache();
    }
    
    this.instances.clear();
    this.configCache.clear();
  }

  /**
   * 특정 Config 키의 인스턴스만 정리
   */
  static clearConfig(config: I18nConfig): void {
    const configKey = this.generateConfigKey(config);
    const instance = this.instances.get(configKey);
    if (instance) {
      instance.clearCache();
      this.instances.delete(configKey);
      this.configCache.delete(configKey);
    }
  }

  /**
   * 현재 관리 중인 인스턴스 수 반환
   */
  static getInstanceCount(): number {
    return this.instances.size;
  }

  /**
   * 디버깅용: 모든 인스턴스 정보 반환
   */
  static debug(): {
    instanceCount: number;
    configKeys: string[];
    instances: Map<string, Translator>;
  } {
    return {
      instanceCount: this.instances.size,
      configKeys: Array.from(this.instances.keys()),
      instances: this.instances,
    };
  }
} 