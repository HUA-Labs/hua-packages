/**
 * @hua-labs/hua/framework - License Errors
 * 
 * 라이선스 관련 에러 메시지
 */

import type { LicenseFeature } from './types';

/**
 * 구매 링크 (향후 실제 링크로 변경)
 */
const PURCHASE_URL = ''; // TODO: Add purchase link when domain is available

/**
 * 라이선스 에러 메시지 생성
 * 
 * @param feature - 필요한 기능
 * @param currentLicense - 현재 라이선스 타입
 * @returns 에러 메시지
 */
export function createLicenseError(
  feature: LicenseFeature,
  currentLicense: 'free' | 'pro' | 'enterprise' = 'free'
): string {
  const featureNames: Record<LicenseFeature, string> = {
    'core': 'Core features',
    'motion-basic': 'Basic motion',
    'motion-pro': 'Motion Pro',
    'i18n-basic': 'Basic i18n',
    'i18n-pro': 'i18n Pro',
    'preset-basic': 'Basic presets',
    'preset-pro': 'Preset Pro',
    'white-labeling': 'White Labeling',
  };
  
  const featureName = featureNames[feature] || feature;
  
  // 필요한 라이선스 타입 결정
  let requiredLicense: 'pro' | 'enterprise' = 'pro';
  if (feature === 'white-labeling') {
    requiredLicense = 'enterprise';
  }
  
  const messages = {
    ko: [
      `[hua] ❌ "${featureName}" 기능을 사용하려면 ${requiredLicense === 'enterprise' ? 'Enterprise' : 'Pro'} 라이선스가 필요합니다.`,
      `[hua] ❌ Feature "${featureName}" requires a ${requiredLicense === 'enterprise' ? 'Enterprise' : 'Pro'} license.`,
      '',
      `현재 라이선스: ${currentLicense === 'free' ? 'Free' : currentLicense === 'pro' ? 'Pro' : 'Enterprise'}`,
      `Current license: ${currentLicense === 'free' ? 'Free' : currentLicense === 'pro' ? 'Pro' : 'Enterprise'}`,
      '',
      `💡 해결 방법 / Solution:`,
      `   - ${requiredLicense === 'enterprise' ? 'Enterprise' : 'Pro'} 라이선스를 구매하세요.`,
      `   - Purchase a ${requiredLicense === 'enterprise' ? 'Enterprise' : 'Pro'} license.`,
      '',
      `📖 가이드 / Guide: https://github.com/HUA-Labs/hua-platform/tree/main/packages/hua/docs`,
    ],
  };
  
  return messages.ko.join('\n');
}
