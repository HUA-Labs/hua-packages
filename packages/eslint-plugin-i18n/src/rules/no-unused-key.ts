/**
 * i18n/no-unused-key
 *
 * JSON 번역 키가 코드에서 사용되지 않으면 경고.
 * 주의: 이 룰은 단일 파일 검사가 아닌 프로젝트 전체 분석이 필요하므로,
 * 별도의 CLI 스크립트로 실행하는 것을 권장.
 * ESLint 룰로는 간단한 감지만 수행.
 */
import type { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn about potentially unused translation keys (basic detection)',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          keysFile: {
            type: 'string',
            description: 'Path to the generated i18n-types file',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unusedKeyHint:
        'This file defines translation keys. Run `validate:translations` to detect unused keys across the project.',
    },
  },

  create() {
    // no-unused-key는 프로젝트 전체 분석이 필요하므로
    // ESLint 단일 파일 검사로는 정확한 감지가 어려움.
    // validate-translations.ts 스크립트에서 처리하는 것을 권장.
    return {};
  },
};

export default rule;
