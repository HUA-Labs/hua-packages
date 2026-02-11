/**
 * i18n/no-dynamic-key
 *
 * t(variable) 또는 t(`template ${literal}`) 등 동적 키 경고.
 * 타입 안전성을 위해 정적 문자열 리터럴만 허용.
 */
import type { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn about dynamic translation keys that bypass type checking',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          functionNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Function names to check (default: ["t", "tArray"])',
          },
          allowPatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Regex patterns for allowed dynamic key prefixes (e.g., "^analysis:metrics\\.")',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      dynamicKey:
        'Dynamic translation key detected. Static keys are preferred for type safety. ' +
        'If unavoidable, use // eslint-disable-next-line i18n/no-dynamic-key',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const functionNames = options.functionNames || ['t', 'tArray'];
    const allowPatterns = (options.allowPatterns || []).map((p: string) => new RegExp(p));

    function isAllowedTemplate(node: { type: string; quasis?: Array<{ value: { raw: string } }> }): boolean {
      if (node.type !== 'TemplateLiteral' || !node.quasis || allowPatterns.length === 0) {
        return false;
      }
      // 템플릿 리터럴의 시작 부분이 allowPatterns와 매칭되면 허용
      const prefix = node.quasis[0]?.value?.raw || '';
      return allowPatterns.some((p: RegExp) => p.test(prefix));
    }

    return {
      CallExpression(node) {
        const callee = node.callee;
        let funcName: string | null = null;

        if (callee.type === 'Identifier' && functionNames.includes(callee.name)) {
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
        if (!firstArg) return;

        // 정적 문자열 리터럴은 OK
        if (firstArg.type === 'Literal' && typeof (firstArg as { value: unknown }).value === 'string') {
          return;
        }

        // 허용된 패턴의 템플릿 리터럴은 OK
        if (firstArg.type === 'TemplateLiteral' && isAllowedTemplate(firstArg as { type: string; quasis?: Array<{ value: { raw: string } }> })) {
          return;
        }

        context.report({
          node: firstArg,
          messageId: 'dynamicKey',
        });
      },
    };
  },
};

export default rule;
