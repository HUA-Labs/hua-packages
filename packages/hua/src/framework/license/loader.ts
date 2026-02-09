/**
 * @hua-labs/hua/framework - License Loader
 * 
 * 라이선스 로드 및 검증
 */

import type { LicenseInfo, LicenseType } from './types';

/**
 * 라이선스 캐시
 */
let cachedLicense: LicenseInfo | null = null;

/**
 * Free 라이선스 기본값 / Free license default
 */
const FREE_LICENSE: LicenseInfo = {
  type: 'free',
  valid: true,
  features: ['core', 'motion-basic', 'i18n-basic', 'preset-basic'],
};

/**
 * API 키 검증 (미구현 - 향후 구현)
 * 
 * 실제 구현 시에는 서버 API를 호출하여 라이선스를 검증합니다.
 * In actual implementation, this would call a server API to validate the license.
 * 
 * @param apiKey - API 키
 * @returns 라이선스 정보 또는 null
 */
function validateLicenseKey(apiKey: string): LicenseInfo | null {
  // TODO: 실제 API 호출 구현
  // TODO: Implement actual API call
  
  // 현재는 기본값 반환 (개발 단계)
  // Currently returns default (development phase)
  if (apiKey.startsWith('pro_')) {
    return {
      type: 'pro',
      valid: true,
      features: ['core', 'motion-basic', 'motion-pro', 'i18n-basic', 'i18n-pro', 'preset-basic', 'preset-pro'],
      apiKey,
    };
  }
  
  if (apiKey.startsWith('enterprise_')) {
    return {
      type: 'enterprise',
      valid: true,
      features: ['core', 'motion-basic', 'motion-pro', 'i18n-basic', 'i18n-pro', 'preset-basic', 'preset-pro', 'white-labeling'],
      apiKey,
      companyName: 'Enterprise Customer',
    };
  }
  
  return null;
}

/**
 * 환경 변수에서 라이선스 로드
 * 
 * @returns 라이선스 정보 또는 null
 */
function loadLicenseFromEnv(): LicenseInfo | null {
  // Node.js 환경에서만 동작
  if (typeof process === 'undefined' || !process.env) {
    return null;
  }
  
  const apiKey = process.env.HUA_LICENSE_KEY;
  if (!apiKey) {
    return null;
  }
  
  return validateLicenseKey(apiKey);
}

/**
 * 설정 파일에서 라이선스 로드
 * 
 * @param configLicense - 설정 파일의 라이선스 정보
 * @returns 라이선스 정보 또는 null
 */
function loadLicenseFromConfig(configLicense?: { apiKey?: string; type?: LicenseType }): LicenseInfo | null {
  if (!configLicense) {
    return null;
  }
  
  // API 키가 있으면 검증
  if (configLicense.apiKey) {
    return validateLicenseKey(configLicense.apiKey);
  }
  
  // 타입만 지정된 경우 (개발용)
  if (configLicense.type) {
    if (configLicense.type === 'pro') {
      return {
        type: 'pro',
        valid: true,
        features: ['core', 'motion-basic', 'motion-pro', 'i18n-basic', 'i18n-pro', 'preset-basic', 'preset-pro'],
      };
    }
    
    if (configLicense.type === 'enterprise') {
      return {
        type: 'enterprise',
        valid: true,
        features: ['core', 'motion-basic', 'motion-pro', 'i18n-basic', 'i18n-pro', 'preset-basic', 'preset-pro', 'white-labeling'],
      };
    }
  }
  
  return null;
}

/**
 * 라이선스 로드
 * 
 * 로드 순서:
 * 1. 환경 변수 (HUA_LICENSE_KEY)
 * 2. 설정 파일 (hua.config.ts)
 * 3. 기본값 (Free)
 * 
 * @param configLicense - 설정 파일의 라이선스 정보 (선택적)
 * @returns 라이선스 정보
 */
export function loadLicense(configLicense?: { apiKey?: string; type?: LicenseType }): LicenseInfo {
  // 캐시 확인
  if (cachedLicense) {
    return cachedLicense;
  }
  
  // 1. 환경 변수에서 로드
  const envLicense = loadLicenseFromEnv();
  if (envLicense) {
    cachedLicense = envLicense;
    return cachedLicense;
  }
  
  // 2. 설정 파일에서 로드
  const configLicenseInfo = loadLicenseFromConfig(configLicense);
  if (configLicenseInfo) {
    cachedLicense = configLicenseInfo;
    return cachedLicense;
  }
  
  // 3. 기본값 (Free)
  cachedLicense = FREE_LICENSE;
  return cachedLicense;
}

/**
 * 라이선스 캐시 초기화 (테스트용)
 */
export function resetLicenseCache(): void {
  cachedLicense = null;
}
