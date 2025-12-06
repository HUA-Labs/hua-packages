#!/usr/bin/env tsx
/**
 * AI 컨텍스트 자동 생성 스크립트
 * 
 * Git 변경사항을 분석하여 AI 에이전트에게 전달할 컨텍스트를 자동으로 생성합니다.
 * 
 * 사용법:
 *   pnpm generate:ai-context
 *   pnpm generate:ai-context --base=develop
 *   pnpm generate:ai-context --output=context.md
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface ChangeContext {
  summary: string;
  changedFiles: FileChange[];
  commits: CommitInfo[];
  affectedPackages: string[];
  changeTypes: {
    components: boolean;
    api: boolean;
    docs: boolean;
    config: boolean;
    tests: boolean;
  };
  recommendations: string[];
}

interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  lines?: {
    added: number;
    removed: number;
  };
}

interface CommitInfo {
  hash: string;
  message: string;
  type: string;
  scope?: string;
  description: string;
}

function getCurrentBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'main';
  }
}

function getChangedFiles(baseBranch: string, headBranch: string): FileChange[] {
  try {
    const output = execSync(
      `git diff --name-status ${baseBranch}...${headBranch}`,
      { encoding: 'utf-8' }
    );

    return output.trim().split('\n').filter(Boolean).map(line => {
      const [status, ...pathParts] = line.split('\t');
      const path = pathParts.join('\t');
      
      const statusMap: Record<string, 'added' | 'modified' | 'deleted'> = {
        'A': 'added',
        'M': 'modified',
        'D': 'deleted',
      };

      // 파일별 변경 라인 수 계산
      let lines;
      try {
        const diffOutput = execSync(
          `git diff --numstat ${baseBranch}...${headBranch} -- "${path}"`,
          { encoding: 'utf-8' }
        ).trim();
        
        if (diffOutput) {
          const [added, removed] = diffOutput.split('\t').slice(0, 2).map(Number);
          if (!isNaN(added) && !isNaN(removed)) {
            lines = { added, removed };
          }
        }
      } catch {
        // 무시
      }

      return {
        path,
        status: statusMap[status[0]] || 'modified',
        lines,
      };
    });
  } catch {
    return [];
  }
}

function getCommits(baseBranch: string, headBranch: string): CommitInfo[] {
  try {
    const output = execSync(
      `git log --pretty=format:"%H|%s" ${baseBranch}..${headBranch}`,
      { encoding: 'utf-8' }
    );

    return output.trim().split('\n').filter(Boolean).map(line => {
      const [hash, message] = line.split('|');
      const match = message.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);

      if (match) {
        const [, type, scope, description] = match;
        return { hash, message, type, scope, description };
      }

      return { hash, message, type: 'chore', description: message };
    });
  } catch {
    return [];
  }
}

function analyzeChangeTypes(files: FileChange[]): ChangeContext['changeTypes'] {
  return {
    components: files.some(f => 
      f.path.includes('/components/') || 
      f.path.endsWith('.tsx') || 
      f.path.endsWith('.jsx')
    ),
    api: files.some(f => 
      f.path.includes('/api/') || 
      f.path.includes('/routes/') ||
      f.path.includes('route.ts')
    ),
    docs: files.some(f => 
      f.path.includes('/docs/') || 
      f.path.endsWith('.md')
    ),
    config: files.some(f => 
      f.path.includes('.config.') || 
      f.path.includes('tsconfig') ||
      f.path.includes('package.json') ||
      f.path.includes('.env')
    ),
    tests: files.some(f => 
      f.path.includes('.test.') || 
      f.path.includes('.spec.') ||
      f.path.includes('/tests/') ||
      f.path.includes('/__tests__/')
    ),
  };
}

function getAffectedPackages(files: FileChange[]): string[] {
  const packages = new Set<string>();

  files.forEach(file => {
    // apps/ 패키지 감지
    const appMatch = file.path.match(/^apps\/([^/]+)\//);
    if (appMatch) {
      packages.add(`apps/${appMatch[1]}`);
    }

    // packages/ 패키지 감지
    const pkgMatch = file.path.match(/^packages\/([^/]+)\//);
    if (pkgMatch) {
      packages.add(`packages/${pkgMatch[1]}`);
    }
  });

  return Array.from(packages).sort();
}

function generateRecommendations(
  changeTypes: ChangeContext['changeTypes'],
  files: FileChange[],
  commits: CommitInfo[]
): string[] {
  const recommendations: string[] = [];

  // 컴포넌트 변경 시
  if (changeTypes.components) {
    recommendations.push('변경된 컴포넌트의 접근성(A11y) 속성 확인 필요');
    recommendations.push('변경된 컴포넌트의 JSDoc 문서 업데이트 확인 필요');
    recommendations.push('변경된 컴포넌트의 타입 안정성 확인 필요');
  }

  // API 변경 시
  if (changeTypes.api) {
    recommendations.push('API 엔드포인트의 타입 정의 확인 필요');
    recommendations.push('API 엔드포인트의 에러 처리 확인 필요');
    recommendations.push('API 엔드포인트의 인증/인가 확인 필요');
  }

  // 문서 변경 시
  if (changeTypes.docs) {
    recommendations.push('문서의 링크 및 참조 확인 필요');
  }

  // 설정 변경 시
  if (changeTypes.config) {
    recommendations.push('설정 변경이 다른 패키지에 영향을 주는지 확인 필요');
    recommendations.push('환경 변수 문서 업데이트 확인 필요');
  }

  // 테스트 변경 시
  if (changeTypes.tests) {
    recommendations.push('테스트 커버리지 확인 필요');
  }

  // Breaking Changes 감지
  const hasBreakingChanges = commits.some(c => 
    c.message.includes('BREAKING') || 
    c.message.includes('breaking')
  );

  if (hasBreakingChanges) {
    recommendations.push('⚠️ Breaking Changes가 감지되었습니다. 마이그레이션 가이드 작성 필요');
  }

  // 대량 파일 변경 감지
  if (files.length > 50) {
    recommendations.push('⚠️ 대량 파일 변경이 감지되었습니다. 리뷰 시 주의 필요');
  }

  return recommendations;
}

function generateContext(data: ChangeContext): string {
  const lines: string[] = [];

  lines.push('# AI 에이전트 컨텍스트');
  lines.push('');
  lines.push(`**생성일시**: ${new Date().toISOString()}`);
  lines.push(`**Base 브랜치**: ${data.summary.split(' ')[0]}`);
  lines.push('');

  // 요약
  lines.push('## 변경사항 요약');
  lines.push('');
  lines.push(data.summary);
  lines.push('');

  // 영향받는 패키지
  if (data.affectedPackages.length > 0) {
    lines.push('## 영향받는 패키지');
    lines.push('');
    data.affectedPackages.forEach(pkg => {
      lines.push(`- \`${pkg}\``);
    });
    lines.push('');
  }

  // 변경 유형
  lines.push('## 변경 유형');
  lines.push('');
  const changeTypeLabels: Record<keyof ChangeContext['changeTypes'], string> = {
    components: '컴포넌트',
    api: 'API',
    docs: '문서',
    config: '설정',
    tests: '테스트',
  };

  Object.entries(data.changeTypes).forEach(([key, value]) => {
    if (value) {
      lines.push(`- [x] ${changeTypeLabels[key as keyof typeof changeTypeLabels]}`);
    }
  });
  lines.push('');

  // 주요 커밋
  if (data.commits.length > 0) {
    lines.push('## 주요 커밋');
    lines.push('');
    data.commits.slice(0, 10).forEach(commit => {
      const scope = commit.scope ? `(${commit.scope})` : '';
      lines.push(`- **${commit.type}${scope}**: ${commit.description}`);
    });
    lines.push('');
  }

  // 변경된 파일 (요약)
  if (data.changedFiles.length > 0) {
    lines.push('## 변경된 파일 요약');
    lines.push('');
    lines.push(`총 ${data.changedFiles.length}개 파일 변경`);
    lines.push('');

    // 카테고리별 분류
    const byCategory: Record<string, FileChange[]> = {
      '컴포넌트': [],
      'API': [],
      '유틸리티': [],
      '문서': [],
      '설정': [],
      '기타': [],
    };

    data.changedFiles.forEach(file => {
      if (file.path.includes('/components/')) {
        byCategory['컴포넌트'].push(file);
      } else if (file.path.includes('/api/') || file.path.includes('/routes/')) {
        byCategory['API'].push(file);
      } else if (file.path.includes('/lib/') || file.path.includes('/utils/')) {
        byCategory['유틸리티'].push(file);
      } else if (file.path.includes('/docs/') || file.path.endsWith('.md')) {
        byCategory['문서'].push(file);
      } else if (file.path.includes('.config.') || file.path.includes('package.json')) {
        byCategory['설정'].push(file);
      } else {
        byCategory['기타'].push(file);
      }
    });

    Object.entries(byCategory).forEach(([category, files]) => {
      if (files.length > 0) {
        lines.push(`### ${category} (${files.length}개)`);
        files.slice(0, 10).forEach(file => {
          const statusIcon = {
            added: '+',
            modified: '~',
            deleted: '-',
          }[file.status];
          lines.push(`- ${statusIcon} \`${file.path}\``);
        });
        if (files.length > 10) {
          lines.push(`  - ... 외 ${files.length - 10}개 파일`);
        }
        lines.push('');
      }
    });
  }

  // 권장 사항
  if (data.recommendations.length > 0) {
    lines.push('## 권장 사항');
    lines.push('');
    data.recommendations.forEach(rec => {
      lines.push(`- ${rec}`);
    });
    lines.push('');
  }

  // 상세 파일 목록 (참고용)
  if (data.changedFiles.length > 0 && data.changedFiles.length <= 50) {
    lines.push('## 변경된 파일 상세 목록');
    lines.push('');
    data.changedFiles.forEach(file => {
      const statusIcon = {
        added: '[추가]',
        modified: '[수정]',
        deleted: '[삭제]',
      }[file.status];
      
      let fileInfo = `${statusIcon} \`${file.path}\``;
      if (file.lines) {
        fileInfo += ` (+${file.lines.added}/-${file.lines.removed})`;
      }
      lines.push(fileInfo);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('**참고**: 이 컨텍스트는 AI 에이전트에게 전달하기 위해 자동 생성되었습니다.');
  lines.push('변경사항을 검토하고 필요한 경우 수동으로 보완하세요.');

  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const baseBranch = args.find(arg => arg.startsWith('--base='))?.split('=')[1] || 'develop';
  const headBranch = getCurrentBranch();
  const outputPath = args.find(arg => arg.startsWith('--output='))?.split('=')[1];

  console.log(`\n🤖 AI 컨텍스트 자동 생성 스크립트\n`);
  console.log(`Base 브랜치: ${baseBranch}`);
  console.log(`Head 브랜치: ${headBranch}\n`);

  const changedFiles = getChangedFiles(baseBranch, headBranch);
  const commits = getCommits(baseBranch, headBranch);
  const changeTypes = analyzeChangeTypes(changedFiles);
  const affectedPackages = getAffectedPackages(changedFiles);
  const recommendations = generateRecommendations(changeTypes, changedFiles, commits);

  const summary = `${baseBranch}에서 ${headBranch}로의 변경사항: ${changedFiles.length}개 파일, ${commits.length}개 커밋`;

  const context: ChangeContext = {
    summary,
    changedFiles,
    commits,
    affectedPackages,
    changeTypes,
    recommendations,
  };

  console.log(`변경된 파일: ${changedFiles.length}개`);
  console.log(`커밋 수: ${commits.length}개`);
  console.log(`영향받는 패키지: ${affectedPackages.length}개\n`);

  const contextText = generateContext(context);

  if (outputPath) {
    writeFileSync(outputPath, contextText, 'utf-8');
    console.log(`✅ AI 컨텍스트가 ${outputPath}에 저장되었습니다.\n`);
  } else {
    const defaultPath = join(process.cwd(), 'ai-context.md');
    writeFileSync(defaultPath, contextText, 'utf-8');
    console.log(`✅ AI 컨텍스트가 ${defaultPath}에 저장되었습니다.\n`);
    console.log('💡 이 파일을 AI 에이전트에게 전달하여 컨텍스트로 사용하세요.');
  }
}

// tsx로 실행 시 자동으로 main 함수 호출
main();

export { generateContext, getChangedFiles, getCommits, analyzeChangeTypes };

