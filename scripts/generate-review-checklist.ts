#!/usr/bin/env tsx
/**
 * 코드 리뷰 체크리스트 자동 생성 스크립트
 * 
 * Git 변경사항을 분석하여 코드 리뷰 체크리스트를 자동으로 생성합니다.
 * 
 * 사용법:
 *   pnpm generate:review-checklist
 *   pnpm generate:review-checklist --base=develop
 *   pnpm generate:review-checklist --output=review-checklist.md
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ReviewChecklist {
  changedFiles: FileInfo[];
  categories: {
    components: FileInfo[];
    api: FileInfo[];
    utils: FileInfo[];
    docs: FileInfo[];
    config: FileInfo[];
    tests: FileInfo[];
  };
  recommendations: CategoryRecommendations;
}

interface FileInfo {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  category: string;
}

interface CategoryRecommendations {
  components: string[];
  api: string[];
  utils: string[];
  docs: string[];
  config: string[];
  tests: string[];
  general: string[];
}

function getCurrentBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'main';
  }
}

function getChangedFiles(baseBranch: string, headBranch: string): FileInfo[] {
  try {
    // 먼저 브랜치가 존재하는지 확인
    try {
      execSync(`git rev-parse --verify ${baseBranch}`, { encoding: 'utf-8', stdio: 'ignore' });
    } catch {
      // develop 브랜치가 없으면 main 또는 master 사용
      const alternativeBranches = ['main', 'master'];
      for (const branch of alternativeBranches) {
        try {
          execSync(`git rev-parse --verify ${branch}`, { encoding: 'utf-8', stdio: 'ignore' });
          console.log(`⚠️  ${baseBranch} 브랜치를 찾을 수 없어 ${branch} 브랜치를 사용합니다.`);
          baseBranch = branch;
          break;
        } catch {
          continue;
        }
      }
    }

    // 같은 브랜치면 빈 배열 반환
    if (baseBranch === headBranch) {
      console.log('⚠️  Base 브랜치와 Head 브랜치가 같습니다. 변경사항이 없습니다.');
      return [];
    }

    const output = execSync(
      `git diff --name-status ${baseBranch}...${headBranch}`,
      { encoding: 'utf-8' }
    );

    if (!output.trim()) {
      return [];
    }

    return output.trim().split('\n').filter(Boolean).map((line: string) => {
      const [status, ...pathParts] = line.split('\t');
      const path = pathParts.join('\t');

      const statusMap: Record<string, 'added' | 'modified' | 'deleted'> = {
        'A': 'added',
        'M': 'modified',
        'D': 'deleted',
      };

      // 파일 카테고리 분류
      let category = '기타';
      if (path.includes('/components/') || path.match(/\.(tsx|jsx)$/)) {
        category = 'components';
      } else if (path.includes('/api/') || path.includes('/routes/') || path.includes('route.ts')) {
        category = 'api';
      } else if (path.includes('/lib/') || path.includes('/utils/') || path.includes('/helpers/')) {
        category = 'utils';
      } else if (path.includes('/docs/') || path.endsWith('.md')) {
        category = 'docs';
      } else if (path.includes('.config.') || path.includes('tsconfig') || path.includes('package.json')) {
        category = 'config';
      } else if (path.includes('.test.') || path.includes('.spec.') || path.includes('/tests/') || path.includes('/__tests__/')) {
        category = 'tests';
      }

      return {
        path,
        status: statusMap[status[0]] || 'modified',
        category,
      };
    });
  } catch {
    return [];
  }
}

function categorizeFiles(files: FileInfo[]): ReviewChecklist['categories'] {
  return {
    components: files.filter(f => f.category === 'components'),
    api: files.filter(f => f.category === 'api'),
    utils: files.filter(f => f.category === 'utils'),
    docs: files.filter(f => f.category === 'docs'),
    config: files.filter(f => f.category === 'config'),
    tests: files.filter(f => f.category === 'tests'),
  };
}

function generateRecommendations(categories: ReviewChecklist['categories']): CategoryRecommendations {
  const recommendations: CategoryRecommendations = {
    components: [],
    api: [],
    utils: [],
    docs: [],
    config: [],
    tests: [],
    general: [],
  };

  // 컴포넌트 관련 체크리스트
  if (categories.components.length > 0) {
    recommendations.components.push(
      '접근성(A11y) 속성 확인 (aria-label, role, tabIndex 등)',
      'JSDoc 문서화 확인',
      'TypeScript 타입 안정성 확인 (any 타입 사용 여부)',
      'React.memo 또는 useMemo/useCallback 최적화 확인',
      'Props 인터페이스 명확성 확인',
      '에러 처리 및 경계 케이스 확인',
      '다크 모드 지원 확인',
      '반응형 디자인 확인'
    );
  }

  // API 관련 체크리스트
  if (categories.api.length > 0) {
    recommendations.api.push(
      '인증/인가 로직 확인',
      '에러 처리 및 상태 코드 확인',
      '입력값 검증 확인',
      '타입 안정성 확인 (Supabase 쿼리 타입 등)',
      '보안 취약점 확인 (SQL Injection, XSS 등)',
      'Rate limiting 확인',
      '로깅 및 모니터링 확인',
      'API 문서 업데이트 확인'
    );
  }

  // 유틸리티 관련 체크리스트
  if (categories.utils.length > 0) {
    recommendations.utils.push(
      '함수 순수성 확인 (side effect 없음)',
      '에러 처리 확인',
      '타입 안정성 확인',
      '성능 최적화 확인',
      '재사용성 확인',
      '테스트 커버리지 확인'
    );
  }

  // 문서 관련 체크리스트
  if (categories.docs.length > 0) {
    recommendations.docs.push(
      '문서 링크 및 참조 확인',
      '예제 코드 정확성 확인',
      '문서 포맷팅 확인',
      '이모지 제거 확인 (프로젝트 규칙)',
      '문서 인덱스 업데이트 확인'
    );
  }

  // 설정 관련 체크리스트
  if (categories.config.length > 0) {
    recommendations.config.push(
      '다른 패키지에 영향 주는지 확인',
      '환경 변수 문서 업데이트 확인',
      '의존성 버전 호환성 확인',
      '빌드 설정 변경 영향 확인'
    );
  }

  // 테스트 관련 체크리스트
  if (categories.tests.length > 0) {
    recommendations.tests.push(
      '테스트 커버리지 확인',
      '테스트 케이스 명확성 확인',
      'Mock 데이터 정확성 확인',
      '비동기 테스트 처리 확인'
    );
  }

  // 일반 체크리스트
  recommendations.general.push(
    '코드 스타일 일관성 확인',
    '사용하지 않는 import 제거 확인',
    '주석 및 TODO 확인',
    '성능 영향 확인',
    '보안 취약점 확인',
    'Breaking Changes 확인'
  );

  return recommendations;
}

function loadPatternRecommendations(): Record<string, string[]> {
  const patternsPath = join(process.cwd(), 'docs', 'patterns');
  const recommendations: Record<string, string[]> = {};

  // 패턴 문서에서 권장 사항 로드
  const patternFiles = [
    'code-quality.md',
    'type-errors.md',
    'build-errors.md',
  ];

  patternFiles.forEach(file => {
    const filePath = join(patternsPath, file);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8');
      // 패턴 문서에서 체크리스트 추출 (간단한 파싱)
      const checklistMatches = content.match(/### 해결 방법[\s\S]*?###/g);
      if (checklistMatches) {
        // 간단한 추출 로직
        recommendations[file] = [];
      }
    }
  });

  return recommendations;
}

function generateChecklist(data: ReviewChecklist): string {
  const lines: string[] = [];

  lines.push('# 코드 리뷰 체크리스트');
  lines.push('');
  lines.push(`**생성일시**: ${new Date().toISOString()}`);
  lines.push(`**변경된 파일**: ${data.changedFiles.length}개`);
  lines.push('');

  // 변경된 파일이 없을 때
  if (data.changedFiles.length === 0) {
    lines.push('## 변경사항 없음');
    lines.push('');
    lines.push('현재 브랜치에 변경된 파일이 없습니다.');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('**참고**: 변경사항이 있는 경우에만 체크리스트가 생성됩니다.');
    return lines.join('\n');
  }

  // 일반 체크리스트
  if (data.recommendations.general.length > 0) {
    lines.push('## 일반 체크리스트');
    lines.push('');
    data.recommendations.general.forEach(item => {
      lines.push(`- [ ] ${item}`);
    });
    lines.push('');
  }

  // 컴포넌트 체크리스트
  if (data.categories.components.length > 0) {
    lines.push(`## 컴포넌트 체크리스트 (${data.categories.components.length}개 파일)`);
    lines.push('');
    lines.push('### 변경된 파일');
    data.categories.components.forEach(file => {
      const statusIcon = {
        added: '[추가]',
        modified: '[수정]',
        deleted: '[삭제]',
      }[file.status];
      lines.push(`- ${statusIcon} \`${file.path}\``);
    });
    lines.push('');
    lines.push('### 체크 항목');
    data.recommendations.components.forEach(item => {
      lines.push(`- [ ] ${item}`);
    });
    lines.push('');
  }

  // API 체크리스트
  if (data.categories.api.length > 0) {
    lines.push(`## API 체크리스트 (${data.categories.api.length}개 파일)`);
    lines.push('');
    lines.push('### 변경된 파일');
    data.categories.api.forEach(file => {
      const statusIcon = {
        added: '[추가]',
        modified: '[수정]',
        deleted: '[삭제]',
      }[file.status];
      lines.push(`- ${statusIcon} \`${file.path}\``);
    });
    lines.push('');
    lines.push('### 체크 항목');
    data.recommendations.api.forEach(item => {
      lines.push(`- [ ] ${item}`);
    });
    lines.push('');
  }

  // 유틸리티 체크리스트
  if (data.categories.utils.length > 0) {
    lines.push(`## 유틸리티 체크리스트 (${data.categories.utils.length}개 파일)`);
    lines.push('');
    lines.push('### 변경된 파일');
    data.categories.utils.forEach(file => {
      const statusIcon = {
        added: '[추가]',
        modified: '[수정]',
        deleted: '[삭제]',
      }[file.status];
      lines.push(`- ${statusIcon} \`${file.path}\``);
    });
    lines.push('');
    lines.push('### 체크 항목');
    data.recommendations.utils.forEach(item => {
      lines.push(`- [ ] ${item}`);
    });
    lines.push('');
  }

  // 문서 체크리스트
  if (data.categories.docs.length > 0) {
    lines.push(`## 문서 체크리스트 (${data.categories.docs.length}개 파일)`);
    lines.push('');
    lines.push('### 변경된 파일');
    data.categories.docs.forEach(file => {
      const statusIcon = {
        added: '[추가]',
        modified: '[수정]',
        deleted: '[삭제]',
      }[file.status];
      lines.push(`- ${statusIcon} \`${file.path}\``);
    });
    lines.push('');
    lines.push('### 체크 항목');
    data.recommendations.docs.forEach(item => {
      lines.push(`- [ ] ${item}`);
    });
    lines.push('');
  }

  // 설정 체크리스트
  if (data.categories.config.length > 0) {
    lines.push(`## 설정 체크리스트 (${data.categories.config.length}개 파일)`);
    lines.push('');
    lines.push('### 변경된 파일');
    data.categories.config.forEach(file => {
      const statusIcon = {
        added: '[추가]',
        modified: '[수정]',
        deleted: '[삭제]',
      }[file.status];
      lines.push(`- ${statusIcon} \`${file.path}\``);
    });
    lines.push('');
    lines.push('### 체크 항목');
    data.recommendations.config.forEach(item => {
      lines.push(`- [ ] ${item}`);
    });
    lines.push('');
  }

  // 테스트 체크리스트
  if (data.categories.tests.length > 0) {
    lines.push(`## 테스트 체크리스트 (${data.categories.tests.length}개 파일)`);
    lines.push('');
    lines.push('### 변경된 파일');
    data.categories.tests.forEach(file => {
      const statusIcon = {
        added: '[추가]',
        modified: '[수정]',
        deleted: '[삭제]',
      }[file.status];
      lines.push(`- ${statusIcon} \`${file.path}\``);
    });
    lines.push('');
    lines.push('### 체크 항목');
    data.recommendations.tests.forEach(item => {
      lines.push(`- [ ] ${item}`);
    });
    lines.push('');
  }

  // 관련 패턴 문서
  lines.push('## 관련 패턴 문서');
  lines.push('');
  lines.push('다음 패턴 문서를 참고하세요:');
  lines.push('');
  lines.push('- [코드 품질 패턴](../docs/patterns/code-quality.md)');
  lines.push('- [타입 오류 패턴](../docs/patterns/type-errors.md)');
  lines.push('- [빌드 오류 패턴](../docs/patterns/build-errors.md)');
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('**참고**: 이 체크리스트는 변경된 파일을 기반으로 자동 생성되었습니다.');
  lines.push('필요한 경우 수동으로 항목을 추가하거나 수정하세요.');

  return lines.join('\n');
}

function main() {
  try {
    const args = process.argv.slice(2);
    const baseBranch = args.find((arg: string) => arg.startsWith('--base='))?.split('=')[1] || 'develop';
    const headBranch = getCurrentBranch();
    const outputPath = args.find((arg: string) => arg.startsWith('--output='))?.split('=')[1];

    console.log(`\n📋 코드 리뷰 체크리스트 자동 생성 스크립트\n`);
    console.log(`Base 브랜치: ${baseBranch}`);
    console.log(`Head 브랜치: ${headBranch}\n`);

    const changedFiles = getChangedFiles(baseBranch, headBranch);
    const categories = categorizeFiles(changedFiles);
    const recommendations = generateRecommendations(categories);

    const checklist: ReviewChecklist = {
      changedFiles,
      categories,
      recommendations,
    };

    console.log(`변경된 파일: ${changedFiles.length}개`);
    console.log(`- 컴포넌트: ${categories.components.length}개`);
    console.log(`- API: ${categories.api.length}개`);
    console.log(`- 유틸리티: ${categories.utils.length}개`);
    console.log(`- 문서: ${categories.docs.length}개`);
    console.log(`- 설정: ${categories.config.length}개`);
    console.log(`- 테스트: ${categories.tests.length}개\n`);

    const checklistText = generateChecklist(checklist);

    if (outputPath) {
      writeFileSync(outputPath, checklistText, 'utf-8');
      console.log(`\n✅ 체크리스트가 ${outputPath}에 저장되었습니다.`);
      console.log(`📄 파일 크기: ${(checklistText.length / 1024).toFixed(2)} KB\n`);
    } else {
      const defaultPath = join(process.cwd(), 'review-checklist.md');
      writeFileSync(defaultPath, checklistText, 'utf-8');
      console.log(`\n✅ 체크리스트가 ${defaultPath}에 저장되었습니다.`);
      console.log(`📄 파일 크기: ${(checklistText.length / 1024).toFixed(2)} KB`);
      console.log(`📋 체크 항목 수: ${checklist.changedFiles.length}개 파일에 대한 체크리스트\n`);
      console.log('💡 이 체크리스트를 사용하여 코드 리뷰를 진행하세요.');
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message);
      console.error('스택 트레이스:', error.stack);
    }
    process.exit(1);
  }
}

// tsx로 실행 시 자동으로 main 함수 호출
main();

export { generateChecklist, getChangedFiles, categorizeFiles, generateRecommendations };

