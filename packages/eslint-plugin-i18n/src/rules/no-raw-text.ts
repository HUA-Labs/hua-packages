/**
 * i18n/no-raw-text
 *
 * JSX에 하드코딩된 한국어/일본어/중국어 문자열을 감지.
 * aria-label, placeholder, title 등 속성도 검사.
 * translationsDir 설정 시 역참조 맵으로 정확한 번역 키 추천.
 */
import type { Rule } from 'eslint';
import { loadTranslations, findKeysForValue } from '../utils/translation-loader';

// CJK 유니코드 범위
const CJK_PATTERN = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u3400-\u4DBF]/;

// 기본 허용 목록 (공백, 숫자, 유니코드 구두점/기호만 허용 — CJK 문자 제외)
// \W는 CJK 문자도 매칭하므로 사용 금지. \p{P}(구두점) + \p{S}(기호)로 대체.
const DEFAULT_ALLOW_PATTERN = /^[\s\d\p{P}\p{S}]*$/u;

// 검사할 JSX 속성
const CHECKABLE_ATTRS = ['aria-label', 'placeholder', 'title', 'alt', 'label'];

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
    docs: {
      description: 'Disallow hardcoded CJK text in JSX — use t() instead',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedTerms: {
            type: 'array',
            items: { type: 'string' },
            description: 'Terms to allow without i18n (e.g., brand names)',
          },
          checkAttributes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional JSX attributes to check',
          },
          ignorePattern: {
            type: 'string',
            description: 'Regex pattern for text to ignore (e.g., "^\\\\d+[가-힣]$" for counters like "3건")',
          },
          translationsDir: {
            type: 'string',
            description: 'Path to translations directory for reverse-lookup key suggestions',
          },
          defaultLanguage: {
            type: 'string',
            description: 'Default language for translation lookup (default: "ko")',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      rawText: 'Hardcoded CJK text detected: "{{text}}". Use t() for internationalization.',
      rawTextWithKey:
        'Hardcoded CJK text detected: "{{text}}". Use {{suggestion}} instead.',
      suggestKey: 'Replace with {t(\'{{key}}\')}',
      rawAttr: 'Hardcoded CJK text in {{attr}} attribute. Use t() for internationalization.',
      rawAttrWithKey:
        'Hardcoded CJK text in {{attr}} attribute. Use {{suggestion}} instead.',
      suggestAttrKey: 'Replace with t(\'{{key}}\')',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedTerms = new Set(options.allowedTerms || []);
    const extraAttrs = options.checkAttributes || [];
    const allCheckableAttrs = [...CHECKABLE_ATTRS, ...extraAttrs];
    const translationsDir: string | undefined = options.translationsDir;
    const defaultLanguage: string = options.defaultLanguage || 'ko';

    // ignorePattern: compile user-provided regex (ignore on invalid regex)
    let ignoreRegex: RegExp | null = null;
    if (options.ignorePattern) {
      try {
        ignoreRegex = new RegExp(options.ignorePattern, 'u');
      } catch {
        // Invalid regex — silently ignore
      }
    }

    // Lazy-load translation map
    let translationMap: ReturnType<typeof loadTranslations> | null = null;
    function getTranslationMap() {
      if (translationMap) return translationMap;
      if (!translationsDir) return null;
      translationMap = loadTranslations(translationsDir, defaultLanguage);
      return translationMap;
    }

    function isAllowed(text: string): boolean {
      const trimmed = text.trim();
      if (!trimmed || DEFAULT_ALLOW_PATTERN.test(trimmed)) return true;
      if (allowedTerms.has(trimmed)) return true;
      if (ignoreRegex && ignoreRegex.test(trimmed)) return true;
      return false;
    }

    function hasCJK(text: string): boolean {
      return CJK_PATTERN.test(text);
    }

    return {
      // JSX 텍스트 노드
      JSXText(node: Rule.Node & { value?: string }) {
        const text = (node as { value: string }).value;
        if (!text || isAllowed(text) || !hasCJK(text)) return;

        const trimmed = text.trim();
        const map = getTranslationMap();
        const matchedKeys = map ? findKeysForValue(map, trimmed) : [];

        if (matchedKeys.length > 0) {
          const best = matchedKeys[0];
          context.report({
            node,
            messageId: 'rawTextWithKey',
            data: {
              text: trimmed.slice(0, 40),
              suggestion: `t('${best}')`,
            },
            suggest: matchedKeys.slice(0, 3).map((key) => ({
              messageId: 'suggestKey' as const,
              data: { key },
              fix(fixer: Rule.RuleFixer) {
                return fixer.replaceText(node, `{t('${key}')}`);
              },
            })),
          });
        } else {
          context.report({
            node,
            messageId: 'rawText',
            data: { text: trimmed.slice(0, 40) },
          });
        }
      },

      // JSX 속성의 문자열 리터럴
      JSXAttribute(node: Rule.Node) {
        const jsxAttr = node as unknown as {
          name: { type: string; name: string };
          value: { type: string; value?: string; range?: [number, number] } | null;
        };
        const attrName = jsxAttr.name?.name;
        if (!attrName || !allCheckableAttrs.includes(attrName)) return;

        const value = jsxAttr.value;
        if (!value || value.type !== 'Literal' || typeof value.value !== 'string') return;

        if (!isAllowed(value.value) && hasCJK(value.value)) {
          const trimmed = value.value.trim();
          const map = getTranslationMap();
          const matchedKeys = map ? findKeysForValue(map, trimmed) : [];

          if (matchedKeys.length > 0) {
            const best = matchedKeys[0];
            context.report({
              node,
              messageId: 'rawAttrWithKey',
              data: { attr: attrName, suggestion: `t('${best}')` },
              suggest: matchedKeys.slice(0, 3).map((key) => ({
                messageId: 'suggestAttrKey' as const,
                data: { key },
                fix(fixer: Rule.RuleFixer) {
                  return fixer.replaceText(
                    value as unknown as Rule.Node,
                    `{t('${key}')}`,
                  );
                },
              })),
            });
          } else {
            context.report({
              node,
              messageId: 'rawAttr',
              data: { attr: attrName },
            });
          }
        }
      },
    };
  },
};

export default rule;
