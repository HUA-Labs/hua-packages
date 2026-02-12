/**
 * @hua-labs/security/client
 *
 * Browser-only exports (invisible CAPTCHA).
 *
 * @example
 * ```typescript
 * import { startCaptcha, stopCaptcha, validateCaptcha } from '@hua-labs/security/client';
 * ```
 */

export {
  InvisibleCaptcha,
  initInvisibleCaptcha,
  startCaptcha,
  stopCaptcha,
  checkCaptchaScore,
  validateCaptcha,
} from './pro/captcha/invisible-captcha';

export type {
  CaptchaBehavior,
  CaptchaScore,
} from './pro/captcha/invisible-captcha';
