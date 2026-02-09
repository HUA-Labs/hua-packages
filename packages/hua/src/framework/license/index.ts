/**
 * @hua-labs/hua/framework - License System
 * 
 * 라이선스 검증 및 관리 시스템
 */

import type { LicenseInfo, LicenseFeature, LicenseCheckResult } from './types';
import { loadLicense } from './loader';
import { FEATURE_LICENSE_MAP } from './types';
import { createLicenseError } from './errors';

/**
 * 전역 라이선스 인스턴스
 */
let globalLicense: LicenseInfo | null = null;

/**
 * 라이선스 초기화
 * 
 * 설정 파일의 라이선스 정보를 사용하여 라이선스를 로드합니다.
 * 
 * @param configLicense - 설정 파일의 라이선스 정보 (선택적)
 */
export function initLicense(configLicense?: { apiKey?: string; type?: 'free' | 'pro' | 'enterprise' }): void {
  globalLicense = loadLicense(configLicense);
}

/**
 * 현재 라이선스 가져오기
 * 
 * @returns 라이선스 정보
 */
export function getLicense(): LicenseInfo {
  if (!globalLicense) {
    // 초기화되지 않은 경우 기본값 (Free) 로드
    globalLicense = loadLicense();
  }
  return globalLicense;
}

/**
 * 라이선스 검증
 * 
 * 특정 기능이 현재 라이선스에서 사용 가능한지 확인합니다.
 * 
 * @param feature - 확인할 기능
 * @returns 검증 결과
 * 
 * @example
 * ```ts
 * const result = checkLicense('motion-pro');
 * if (result.valid) {
 *   // Pro 기능 사용
 * }
 * ```
 */
export function checkLicense(feature: LicenseFeature): LicenseCheckResult {
  const license = getLicense();
  
  // 라이선스가 유효하지 않은 경우
  if (!license.valid) {
    return {
      valid: false,
      reason: 'License is not valid',
    };
  }
  
  // 만료 확인
  if (license.expiresAt && license.expiresAt < new Date()) {
    return {
      valid: false,
      reason: 'License has expired',
      expiresAt: license.expiresAt,
    };
  }
  
  // 기능 확인
  const requiredLicenses = FEATURE_LICENSE_MAP[feature];
  // If feature is not in the map (e.g., plugin features), skip this check
  if (requiredLicenses && !requiredLicenses.includes(license.type)) {
    return {
      valid: false,
      reason: `Feature "${feature}" requires one of: ${requiredLicenses.join(', ')}`,
    };
  }
  
  // 기능이 features 목록에 있는지 확인 (Enterprise는 모든 기능 사용 가능)
  if (license.type !== 'enterprise' && !license.features.includes(feature)) {
    return {
      valid: false,
      reason: `Feature "${feature}" is not included in the license`,
    };
  }
  
  return {
    valid: true,
    expiresAt: license.expiresAt,
  };
}

/**
 * 라이선스 확인 (간단한 boolean 반환)
 * 
 * @param feature - 확인할 기능
 * @returns 사용 가능 여부
 * 
 * @example
 * ```ts
 * if (hasLicense('motion-pro')) {
 *   // Pro 기능 사용
 * }
 * ```
 */
export function hasLicense(feature: LicenseFeature): boolean {
  return checkLicense(feature).valid;
}

/**
 * 라이선스 필수 확인
 * 
 * 라이선스가 없으면 에러를 throw합니다.
 * 
 * @param feature - 확인할 기능
 * @throws 라이선스가 없을 경우 에러
 * 
 * @example
 * ```ts
 * requireLicense('motion-pro');
 * // Pro 기능 사용 (에러 없음)
 * ```
 */
export function requireLicense(feature: LicenseFeature): void {
  const result = checkLicense(feature);
  if (!result.valid) {
    const license = getLicense();
    throw new Error(createLicenseError(feature, license.type));
  }
}
