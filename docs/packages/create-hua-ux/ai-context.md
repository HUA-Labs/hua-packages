# AI Context File Selection

## 개요

`create-hua-ux` CLI는 AI 컨텍스트 파일을 선택적으로 생성할 수 있습니다.

## 작동 방식

1. **템플릿 복사**: 먼저 모든 템플릿 파일을 복사합니다 (AI 컨텍스트 파일 포함)
2. **옵션 기반 삭제**: 사용자 선택에 따라 생성하지 않을 파일을 삭제합니다

이 방식은:
- 작동은 정상적으로 합니다
- 약간 비효율적일 수 있지만 (복사 후 삭제), 안정적입니다
- 템플릿 구조가 변경되어도 자동으로 대응됩니다

## 선택 가능한 파일

### 1. `.cursorrules`
- **기본값**: 생성
- **설명**: Cursor IDE 규칙 파일
- **비활성화**: `--no-cursorrules`

### 2. `ai-context.md`
- **기본값**: 생성
- **설명**: 범용 AI 컨텍스트 파일
- **비활성화**: `--no-ai-context`

### 3. `.claude/project-context.md`
- **기본값**: 생성
- **설명**: Claude 전용 프로젝트 컨텍스트
- **비활성화**: `--no-claude-context`

### 4. `.claude/skills/`
- **기본값**: 생성 안 함
- **설명**: Claude 스킬 파일들
- **활성화**: `--claude-skills`

## 사용 예시

### 모든 AI 컨텍스트 생성 (기본값)
```bash
npx tsx src/index.ts my-project
# 또는
npx tsx src/index.ts my-project --lang both
```

### 일부만 선택
```bash
# ai-context.md만 제외
npx tsx src/index.ts my-project --no-ai-context

# Claude 관련 파일 제외
npx tsx src/index.ts my-project --no-claude-context --no-claude-skills

# .cursorrules만 생성
npx tsx src/index.ts my-project --no-ai-context --no-claude-context --no-claude-skills
```

### Claude 스킬 포함
```bash
npx tsx src/index.ts my-project --claude-skills
```

## 대화형 모드

실제 터미널에서 실행하면 체크박스로 선택할 수 있습니다:

```bash
npx tsx src/index.ts my-project
```

프롬프트:
1. AI 컨텍스트 파일 선택 (체크박스)
2. 문서 언어 선택 (한국어/영어/둘 다)

## 비대화형 모드

CI/CD나 스크립트에서는 기본값을 사용합니다:

```bash
NON_INTERACTIVE=1 npx tsx src/index.ts my-project
```

**기본값**:
- `.cursorrules`: 생성
- `ai-context.md`: 생성
- `.claude/project-context.md`: 생성
- `.claude/skills/`: 생성 안 함
- 언어: `both`

## 구현 세부사항

### 파일 생성/삭제 로직

```typescript
// 1. 템플릿 복사 (모든 파일)
await copyTemplate(projectPath);

// 2. 옵션에 따라 파일 삭제
if (!opts.cursorrules) {
  await fs.remove('.cursorrules');
}
if (!opts.aiContext) {
  await fs.remove('ai-context.md');
}
// ... 등등
```

### 장점
- 템플릿 구조 변경에 자동 대응
- 안정적인 동작
- 간단한 구현

### 개선 가능한 점
- 미래에 조건부 복사로 최적화 가능
- 현재는 복사 후 삭제 방식이지만, 성능 영향은 미미함

## 테스트 결과

모든 선택 옵션이 정상 작동합니다:
- `--no-ai-context`: ai-context.md 생성 안 함
- `--no-claude-context`: .claude/project-context.md 생성 안 함
- `--claude-skills`: .claude/skills/ 생성
- 기본값: 모든 기본 파일 생성
