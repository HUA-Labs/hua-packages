/**
 * i18n/no-raw-text
 *
 * JSX에 하드코딩된 한국어/일본어/중국어 문자열을 감지.
 * aria-label, placeholder, title 등 속성도 검사.
 */
import type { Rule } from 'eslint';

// CJK 유니코드 범위
const CJK_PATTERN = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u3400-\u4DBF]/;

// 기본 허용 목록 (숫자, 기호, 짧은 영문)
const DEFAULT_ALLOW_PATTERN = /^[\s\d\W]*$/;

// 검사할 JSX 속성
const CHECKABLE_ATTRS = ['aria-label', 'placeholder', 'title', 'alt', 'label'];

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
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
        },
        additionalProperties: false,
      },
    ],
    messages: {
      rawText: 'Hardcoded CJK text detected: "{{text}}". Use t() for internationalization.',
      rawAttr: 'Hardcoded CJK text in {{attr}} attribute. Use t() for internationalization.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedTerms = new Set(options.allowedTerms || []);
    const extraAttrs = options.checkAttributes || [];
    const allCheckableAttrs = [...CHECKABLE_ATTRS, ...extraAttrs];

    function isAllowed(text: string): boolean {
      const trimmed = text.trim();
      if (!trimmed || DEFAULT_ALLOW_PATTERN.test(trimmed)) return true;
      if (allowedTerms.has(trimmed)) return true;
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

        context.report({
          node,
          messageId: 'rawText',
          data: { text: text.trim().slice(0, 40) },
        });
      },

      // JSX 속성의 문자열 리터럴
      JSXAttribute(node: Rule.Node) {
        const jsxAttr = node as unknown as {
          name: { type: string; name: string };
          value: { type: string; value?: string } | null;
        };
        const attrName = jsxAttr.name?.name;
        if (!attrName || !allCheckableAttrs.includes(attrName)) return;

        const value = jsxAttr.value;
        if (!value || value.type !== 'Literal' || typeof value.value !== 'string') return;

        if (!isAllowed(value.value) && hasCJK(value.value)) {
          context.report({
            node,
            messageId: 'rawAttr',
            data: { attr: attrName },
          });
        }
      },
    };
  },
};

export default rule;
