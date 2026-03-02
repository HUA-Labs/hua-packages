/**
 * i18n/no-missing-key
 *
 * t() / tArray() 호출에서 생성된 타입에 없는 키를 사용하면 에러.
 * 빌드 시 생성된 .generated.ts 파일의 키 목록을 로드하여 대조.
 * Did-you-mean: 가장 유사한 키를 최대 3개까지 제안.
 */
import type { Rule } from 'eslint';
import * as fs from 'fs';
import * as path from 'path';
import { findClosestKeys } from '../utils/levenshtein';

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

  // 방법 1: 직접 'namespace:key.path' 리터럴 추출 (my-app 스타일)
  const directMatches = content.matchAll(/'([a-zA-Z0-9_-]+:[a-zA-Z0-9_.]+)'/g);
  for (const match of directMatches) {
    keys.add(match[1]);
  }

  // 방법 2: I18nKeys 인터페이스에서 namespace별 키 추출 후 조합
  // 패턴: `namespace: { strings: 'key1' | 'key2' | ...; ... }`
  const nsBlockRegex = /['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*\{[^}]*strings\s*:\s*((?:'[^']*'(?:\s*\|\s*)?)+)/g;
  let nsMatch;
  while ((nsMatch = nsBlockRegex.exec(content)) !== null) {
    const namespace = nsMatch[1];
    const keysStr = nsMatch[2];
    const keyMatches = keysStr.matchAll(/'([^']+)'/g);
    for (const km of keyMatches) {
      if (km[1] !== 'never') {
        keys.add(`${namespace}:${km[1]}`);
      }
    }
  }

  // 방법 2b: arrays 키도 추출
  const nsArrayRegex = /['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*\{[^}]*arrays\s*:\s*((?:'[^']*'(?:\s*\|\s*)?)+)/g;
  let arrMatch;
  while ((arrMatch = nsArrayRegex.exec(content)) !== null) {
    const namespace = arrMatch[1];
    const keysStr = arrMatch[2];
    const keyMatches = keysStr.matchAll(/'([^']+)'/g);
    for (const km of keyMatches) {
      if (km[1] !== 'never') {
        keys.add(`${namespace}:${km[1]}`);
      }
    }
  }

  keyCache.set(keysFilePath, keys);
  return keys;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    hasSuggestions: true,
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
      missingKeyDidYouMean:
        'Translation key "{{key}}" is not defined. Did you mean: {{suggestions}}?',
      suggestKey: 'Replace with "{{suggested}}".',
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
          const closest = findClosestKeys(key, keys);

          if (closest.length > 0) {
            context.report({
              node: firstArg,
              messageId: 'missingKeyDidYouMean',
              data: {
                key,
                suggestions: closest.map((c) => `"${c.key}"`).join(', '),
              },
              suggest: closest.map((c) => ({
                messageId: 'suggestKey',
                data: { suggested: c.key },
                fix(fixer) {
                  return fixer.replaceText(firstArg, `'${c.key}'`);
                },
              })),
            });
          } else {
            context.report({
              node: firstArg,
              messageId: 'missingKey',
              data: { key },
            });
          }
        }
      },
    };
  },
};

export default rule;
