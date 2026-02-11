/**
 * i18n/no-missing-key
 *
 * t() / tArray() 호출에서 생성된 타입에 없는 키를 사용하면 에러.
 * 빌드 시 생성된 .generated.ts 파일의 키 목록을 로드하여 대조.
 */
import type { Rule } from 'eslint';
import * as fs from 'fs';
import * as path from 'path';

// 키 목록 캐시 (파일별)
const keyCache = new Map<string, Set<string>>();

function loadKeys(keysFilePath: string): Set<string> | null {
  if (keyCache.has(keysFilePath)) {
    return keyCache.get(keysFilePath)!;
  }

  const resolvedPath = path.resolve(keysFilePath);
  if (!fs.existsSync(resolvedPath)) {
    return null;
  }

  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const keys = new Set<string>();

  // TranslationStringKey와 TranslationArrayKey의 리터럴 추출
  // 패턴: 'namespace:key.path'
  const matches = content.matchAll(/'([a-zA-Z_-]+:[a-zA-Z0-9_.]+)'/g);
  for (const match of matches) {
    keys.add(match[1]);
  }

  keyCache.set(keysFilePath, keys);
  return keys;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow translation keys that are not defined in generated types',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          keysFile: {
            type: 'string',
            description: 'Path to the generated i18n-types file',
          },
          functionNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Function names to check (default: ["t", "tArray"])',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingKey: 'Translation key "{{key}}" is not defined in the generated types file.',
      noKeysFile: 'i18n keys file not found at "{{path}}". Run generate:types first.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const keysFile = options.keysFile;
    const functionNames = options.functionNames || ['t', 'tArray'];

    if (!keysFile) return {};

    const keys = loadKeys(keysFile);

    return {
      CallExpression(node) {
        // t('key') 또는 tArray('key') 패턴 매칭
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
        if (!firstArg || firstArg.type !== 'Literal' || typeof firstArg.value !== 'string') {
          return; // 동적 키 → no-dynamic-key 룰에서 처리
        }

        const key = firstArg.value;

        if (!keys) {
          context.report({
            node: firstArg,
            messageId: 'noKeysFile',
            data: { path: keysFile },
          });
          return;
        }

        if (!keys.has(key)) {
          context.report({
            node: firstArg,
            messageId: 'missingKey',
            data: { key },
          });
        }
      },
    };
  },
};

export default rule;
