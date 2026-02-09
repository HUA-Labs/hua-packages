/**
 * @hua-labs/hua/framework - License Types
 * 
 * 라이선스 타입 정의
 */

/**
 * 라이선스 타입 / License type
 */
export type LicenseType = 'free' | 'pro' | 'enterprise';

/**
 * 라이선스 기능 / License feature
 * 
 * 각 기능은 특정 라이선스 타입에서만 사용 가능합니다.
 * Each feature is available only with specific license types.
 */
export type LicenseFeature =
  | 'core' // 기본 기능 (모든 라이선스)
  | 'motion-basic' // 기본 모션 (Free)
  | 'motion-pro' // 고급 모션 (Pro+)
  | 'i18n-basic' // 기본 i18n (Free)
  | 'i18n-pro' // 고급 i18n (Pro+)
  | 'preset-basic' // 기본 프리셋 (Free)
  | 'preset-pro' // 고급 프리셋 (Pro+)
  | 'white-labeling'; // 화이트 라벨링 (Enterprise)

/**
 * 라이선스 정보 / License information
 */
export interface LicenseInfo {
  /**
   * 라이선스 타입 / License type
   */
  type: LicenseType;
  
  /**
   * 라이선스 유효성 / License validity
   */
  valid: boolean;
  
  /**
   * 만료일 (선택적) / Expiration date (optional)
   */
  expiresAt?: Date;
  
  /**
   * 사용 가능한 기능 목록 / List of available features
   */
  features: LicenseFeature[];
  
  /**
   * 회사/서비스 이름 (Enterprise) / Company/service name (Enterprise)
   */
  companyName?: string;
  
  /**
   * API 키 (Pro/Enterprise) / API key (Pro/Enterprise)
   */
  apiKey?: string;
}

/**
 * 라이선스 검증 결과 / License check result
 */
export interface LicenseCheckResult {
  /**
   * 검증 성공 여부 / Validation success
   */
  valid: boolean;
  
  /**
   * 실패 이유 (검증 실패 시) / Failure reason (if validation failed)
   */
  reason?: string;
  
  /**
   * 만료일 (선택적) / Expiration date (optional)
   */
  expiresAt?: Date;
}

/**
 * 기능별 필요한 라이선스 타입 매핑 / Feature to license type mapping
 */
export const FEATURE_LICENSE_MAP: Record<LicenseFeature, LicenseType[]> = {
  'core': ['free', 'pro', 'enterprise'],
  'motion-basic': ['free', 'pro', 'enterprise'],
  'motion-pro': ['pro', 'enterprise'],
  'i18n-basic': ['free', 'pro', 'enterprise'],
  'i18n-pro': ['pro', 'enterprise'],
  'preset-basic': ['free', 'pro', 'enterprise'],
  'preset-pro': ['pro', 'enterprise'],
  'white-labeling': ['enterprise'],
};
