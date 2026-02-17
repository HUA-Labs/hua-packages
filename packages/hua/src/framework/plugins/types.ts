/**
 * @hua-labs/hua/framework - Plugin Types
 * 
 * 플러그인 타입 정의
 */

import type { ComponentType } from 'react';
import type { HuaConfig } from '../types';
import type { LicenseType } from '../license/types';

/**
 * 플러그인 인터페이스 / Plugin interface
 */
export interface HuaPlugin {
  /**
   * 플러그인 이름 / Plugin name
   * 
   * 고유한 식별자로 사용됩니다.
   * Used as a unique identifier.
   */
  name: string;
  
  /**
   * 플러그인 버전 / Plugin version
   * 
   * Semantic versioning 형식 (예: '1.0.0')
   * Semantic versioning format (e.g., '1.0.0')
   */
  version: string;
  
  /**
   * 라이선스 타입 / License type
   * 
   * 이 플러그인이 필요한 라이선스 타입
   * Required license type for this plugin
   */
  license: LicenseType;
  
  /**
   * 플러그인 초기화 / Plugin initialization
   * 
   * 플러그인이 등록될 때 호출됩니다.
   * Called when the plugin is registered.
   * 
   * @param config - 프레임워크 설정
   */
  init?(config: HuaConfig): void | Promise<void>;
  
  /**
   * 컴포넌트 확장 / Component extensions
   * 
   * 플러그인이 제공하는 컴포넌트들
   * Components provided by the plugin
   * 
   * @example
   * ```ts
   * components: {
   *   ParallaxScroll: ParallaxScrollComponent,
   *   Motion3D: Motion3DComponent,
   * }
   * ```
   */
  components?: Record<string, ComponentType<any>>;
  
  /**
   * 훅 확장 / Hook extensions
   * 
   * 플러그인이 제공하는 커스텀 훅들
   * Custom hooks provided by the plugin
   * 
   * @example
   * ```ts
   * hooks: {
   *   useParallax: useParallaxHook,
   *   useMotion3D: useMotion3DHook,
   * }
   * ```
   */
  hooks?: Record<string, (...args: unknown[]) => unknown>;
  
  /**
   * 설정 스키마 확장 / Config schema extension
   * 
   * 플러그인이 추가하는 설정 스키마 (향후 Zod 스키마 지원)
   * Additional config schema added by the plugin (future Zod schema support)
   */
  configSchema?: any; // 향후 ZodSchema로 변경
  
  /**
   * 라이선스 검증 / License validation
   * 
   * 플러그인 등록 시 라이선스를 검증하는 함수
   * Function to validate license when plugin is registered
   * 
   * @returns 라이선스 유효 여부
   */
  checkLicense?(): boolean;
  
  /**
   * 플러그인 설명 / Plugin description
   * 
   * 플러그인의 기능 설명
   * Description of plugin features
   */
  description?: string;
}
