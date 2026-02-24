/**
 * i18n/no-unlocalized-field
 *
 * 특정 object property(description, label, value 등)에 i18n 키 대신
 * 하드코딩된 문자열 리터럴이 사용될 때 경고.
 * doc.yaml, metadata 배열, accessibility 배열 등에서 활용.
 */
import type { Rule } from 'eslint';

// 기본 검사 대상 필드
const DEFAULT_FIELDS = ['description'];

// 기본 i18n 키 패턴: "namespace:key.path"
const DEFAULT_PATTERN = /^[a-zA-Z_-]+:[a-zA-Z0-9_.-]+$/;

// 항상 무시할 프로퍼티 이름 (코드/식별자 성격)
const ALWAYS_IGNORED_PROPERTIES = new Set([
  'type',
  'name',
  'default',
  'id',
  'packageName',
  'version',
  'since',
  'category',
  'code',
  'href',
  'url',
  'className',
  'key',
  'ref',
  'as',
]);

// 상위 객체에서 이 프로퍼티가 있으면 i18n 컨텍스트를 무시
const DEFAULT_IGNORE_PARENT_PROPERTIES = ['codeExamples'];

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn when object fields (e.g. description, label) contain literal strings instead of i18n keys',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          fields: {
            type: 'array',
            items: { type: 'string' },
            description: 'Property names to check (default: ["description"])',
          },
          pattern: {
            type: 'string',
            description:
              'Regex pattern that valid i18n keys must match (default: "^[a-zA-Z_-]+:[a-zA-Z0-9_.-]+$")',
          },
          ignoreParentProperties: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Parent property names where the rule does not apply (default: ["codeExamples"])',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unlocalizedField:
        'Field "{{field}}" contains a literal string "{{value}}" instead of an i18n key (expected format: "namespace:key.path").',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const fields = new Set<string>(options.fields ?? DEFAULT_FIELDS);
    const pattern = options.pattern ? new RegExp(options.pattern) : DEFAULT_PATTERN;
    const ignoreParentProperties = new Set<string>(
      options.ignoreParentProperties ?? DEFAULT_IGNORE_PARENT_PROPERTIES,
    );

    /**
     * 노드의 조상 체인을 위로 올라가며 무시해야 할 상위 프로퍼티가
     * 있는지 확인한다.
     */
    function isInsideIgnoredParent(node: Rule.Node): boolean {
      let current: Rule.Node | null = node.parent ?? null;
      while (current) {
        if (
          current.type === 'Property' &&
          (current as unknown as { key: { type: string; name?: string; value?: string } }).key
        ) {
          const prop = current as unknown as {
            key: { type: string; name?: string; value?: string };
          };
          const keyName =
            prop.key.type === 'Identifier'
              ? prop.key.name
              : prop.key.type === 'Literal'
                ? String(prop.key.value)
                : undefined;

          if (keyName && ignoreParentProperties.has(keyName)) {
            return true;
          }
        }
        current = (current as Rule.Node & { parent?: Rule.Node }).parent ?? null;
      }
      return false;
    }

    return {
      Property(node) {
        const prop = node as unknown as {
          key: { type: string; name?: string; value?: unknown };
          value: { type: string; value?: unknown };
          computed: boolean;
        };

        // computed 프로퍼티([expr]: ...) 는 무시
        if (prop.computed) return;

        // 프로퍼티 이름 추출
        let fieldName: string | undefined;
        if (prop.key.type === 'Identifier') {
          fieldName = prop.key.name;
        } else if (prop.key.type === 'Literal') {
          fieldName = String(prop.key.value);
        }

        if (!fieldName) return;

        // 항상 무시하는 프로퍼티
        if (ALWAYS_IGNORED_PROPERTIES.has(fieldName)) return;

        // 검사 대상 필드가 아닌 경우 무시
        if (!fields.has(fieldName)) return;

        // 값이 문자열 리터럴이 아닌 경우 무시 (변수, 함수 호출 등)
        if (prop.value.type !== 'Literal') return;
        if (typeof prop.value.value !== 'string') return;

        const strValue = prop.value.value as string;

        // 빈 문자열은 무시
        if (!strValue.trim()) return;

        // 이미 유효한 i18n 키 패턴이면 OK
        if (pattern.test(strValue)) return;

        // 무시해야 할 상위 프로퍼티 안에 있으면 무시
        if (isInsideIgnoredParent(node as Rule.Node)) return;

        context.report({
          node: node as Rule.Node,
          messageId: 'unlocalizedField',
          data: {
            field: fieldName,
            value: strValue.length > 40 ? strValue.slice(0, 40) + '…' : strValue,
          },
        });
      },
    };
  },
};

export default rule;
