/**
 * @hua-labs/eslint-plugin-i18n
 *
 * ESLint plugin for i18n type safety.
 *
 * Rules:
 * - no-missing-key: t() 키가 생성된 타입에 없으면 에러 (did-you-mean 포함)
 * - no-unused-key: JSON 키가 코드에서 안 쓰이면 warn (CLI 권장)
 * - no-raw-text: JSX에 하드코딩 CJK 문자열 감지 (역참조 추천 포함)
 * - no-dynamic-key: t(variable) 동적 키 경고
 * - no-unlocalized-field: object 필드(description 등)에 i18n 키 대신 문자열 리터럴 경고
 * - prefer-common-key: 같은 값의 common 키가 있으면 common 사용 권유
 */
import noMissingKey from './rules/no-missing-key';
import noUnusedKey from './rules/no-unused-key';
import noRawText from './rules/no-raw-text';
import noDynamicKey from './rules/no-dynamic-key';
import noUnlocalizedField from './rules/no-unlocalized-field';
import preferCommonKey from './rules/prefer-common-key';
import { recommended } from './configs/recommended';

const plugin = {
  rules: {
    'no-missing-key': noMissingKey,
    'no-unused-key': noUnusedKey,
    'no-raw-text': noRawText,
    'no-dynamic-key': noDynamicKey,
    'no-unlocalized-field': noUnlocalizedField,
    'prefer-common-key': preferCommonKey,
  },
  configs: {
    recommended,
  },
};

export default plugin;
export const { rules } = plugin;
export const { configs } = plugin;
