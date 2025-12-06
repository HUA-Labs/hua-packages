const fs = require('fs');
const path = require('path');
const glob = require('glob');

const testFiles = glob.sync('src/__tests__/**/*.test.ts', { cwd: __dirname + '/..' });

const replacements = [
  // Import 문 추가 (파일 시작 부분에)
  {
    pattern: /^(import\s+.*from\s+['"]@testing-library\/react['"];?\s*\n)/m,
    replacement: (match, p1) => {
      if (!match.includes("from 'vitest'") && !match.includes('from "vitest"')) {
        return `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'\n${p1}`;
      }
      return match;
    }
  },
  // jest.fn() → vi.fn()
  { pattern: /jest\.fn\(\)/g, replacement: 'vi.fn()' },
  // jest.useFakeTimers() → vi.useFakeTimers()
  { pattern: /jest\.useFakeTimers\(\)/g, replacement: 'vi.useFakeTimers()' },
  // jest.advanceTimersByTime() → vi.advanceTimersByTime()
  { pattern: /jest\.advanceTimersByTime\(/g, replacement: 'vi.advanceTimersByTime(' },
  // jest.runOnlyPendingTimers() → vi.runOnlyPendingTimers()
  { pattern: /jest\.runOnlyPendingTimers\(\)/g, replacement: 'vi.runOnlyPendingTimers()' },
  // jest.clearAllMocks() → vi.clearAllMocks()
  { pattern: /jest\.clearAllMocks\(\)/g, replacement: 'vi.clearAllMocks()' },
  // jest.useRealTimers() → vi.useRealTimers()
  { pattern: /jest\.useRealTimers\(\)/g, replacement: 'vi.useRealTimers()' },
  // jest.spyOn() → vi.spyOn()
  { pattern: /jest\.spyOn\(/g, replacement: 'vi.spyOn(' },
  // jest.restoreAllMocks() → vi.restoreAllMocks()
  { pattern: /jest\.restoreAllMocks\(\)/g, replacement: 'vi.restoreAllMocks()' },
  // jest.clearAllTimers() → vi.clearAllTimers()
  { pattern: /jest\.clearAllTimers\(\)/g, replacement: 'vi.clearAllTimers()' },
];

testFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 이미 vitest를 import하고 있는지 확인
  const hasVitestImport = content.includes("from 'vitest'") || content.includes('from "vitest"');
  
  // 첫 번째 import 문 뒤에 vitest import 추가
  if (!hasVitestImport && content.includes("from '@testing-library/react'")) {
    content = content.replace(
      /^(import\s+.*from\s+['"]@testing-library\/react['"];?\s*\n)/m,
      `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'\n$1`
    );
  }
  
  // 나머지 교체
  replacements.forEach(({ pattern, replacement }) => {
    if (typeof replacement === 'function') {
      content = content.replace(pattern, replacement);
    } else {
      content = content.replace(pattern, replacement);
    }
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Migrated: ${file}`);
});

console.log(`\nTotal files migrated: ${testFiles.length}`);

