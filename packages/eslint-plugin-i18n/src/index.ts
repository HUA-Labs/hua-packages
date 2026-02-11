/**
 * @hua-labs/eslint-plugin-i18n
 *
 * ESLint plugin for i18n type safety.
 *
 * Rules:
 * - no-missing-key: t() 키가 생성된 타입에 없으면 에러
 * - no-unused-key: JSON 키가 코드에서 안 쓰이면 warn (CLI 권장)
 * - no-raw-text: JSX에 하드코딩 CJK 문자열 감지
 * - no-dynamic-key: t(variable) 동적 키 경고
 */
import noMissingKey from './rules/no-missing-key';
import noUnusedKey from './rules/no-unused-key';
import noRawText from './rules/no-raw-text';
import noDynamicKey from './rules/no-dynamic-key';
import { recommended } from './configs/recommended';

const plugin = {
  rules: {
    'no-missing-key': noMissingKey,
    'no-unused-key': noUnusedKey,
    'no-raw-text': noRawText,
    'no-dynamic-key': noDynamicKey,
  },
  configs: {
    recommended,
  },
};

export default plugin;
export const { rules } = plugin;
export const { configs } = plugin;
