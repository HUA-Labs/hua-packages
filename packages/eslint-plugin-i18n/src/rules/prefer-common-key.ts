/**
 * i18n/prefer-common-key
 *
 * t('diary:save_button') → 값 "저장" → common:actions.save 발견 → 권유 + autofix.
 * common namespace에 같은 값의 키가 있으면 그쪽을 사용하도록 권유.
 */
import type { Rule } from 'eslint';
import { loadTranslations, findKeysForValue } from '../utils/translation-loader';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
    docs: {
      description:
        'Prefer using common namespace keys when the same translation value exists there',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          translationsDir: {
            type: 'string',
            description: 'Path to translations directory',
          },
          defaultLanguage: {
            type: 'string',
            description: 'Default language for lookup (default: "ko")',
          },
          commonNamespace: {
            type: 'string',
            description: 'Common namespace name (default: "common")',
          },
          functionNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Function names to check (default: ["t", "tArray"])',
          },
        },
        required: ['translationsDir'],
        additionalProperties: false,
      },
    ],
    messages: {
      preferCommon:
        '"{{currentKey}}" has the same value as "{{commonKey}}". Prefer using the common namespace key.',
      useCommonKey: 'Replace with "{{commonKey}}".',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const translationsDir: string | undefined = options.translationsDir;
    const defaultLanguage: string = options.defaultLanguage || 'ko';
    const commonNamespace: string = options.commonNamespace || 'common';
    const functionNames: string[] = options.functionNames || ['t', 'tArray'];

    if (!translationsDir) return {};

    const translationMap = loadTranslations(translationsDir, defaultLanguage);

    return {
      CallExpression(node) {
        const callee = node.callee;
        let funcName: string | null = null;

        if (
          callee.type === 'Identifier' &&
          functionNames.includes(callee.name)
        ) {
          funcName = callee.name;
        } else if (
          callee.type === 'MemberExpression' &&
          callee.property.type === 'Identifier' &&
          functionNames.includes(callee.property.name)
        ) {
          funcName = callee.property.name;
        }

        if (!funcName) return;

        const firstArg = node.arguments[0];
        if (
          !firstArg ||
          firstArg.type !== 'Literal' ||
          typeof firstArg.value !== 'string'
        ) {
          return;
        }

        const key = firstArg.value;

        // Skip if already using common namespace
        if (key.startsWith(`${commonNamespace}:`)) return;

        // Look up the value for this key
        const value = translationMap.keyToValue.get(key);
        if (!value) return;

        // Find if there's a common key with the same value
        const allKeys = findKeysForValue(
          translationMap,
          value,
          commonNamespace,
        );
        const commonKey = allKeys.find((k) =>
          k.startsWith(`${commonNamespace}:`),
        );

        if (commonKey && commonKey !== key) {
          context.report({
            node: firstArg,
            messageId: 'preferCommon',
            data: { currentKey: key, commonKey },
            suggest: [
              {
                messageId: 'useCommonKey',
                data: { commonKey },
                fix(fixer) {
                  return fixer.replaceText(firstArg, `'${commonKey}'`);
                },
              },
            ],
          });
        }
      },
    };
  },
};

export default rule;
