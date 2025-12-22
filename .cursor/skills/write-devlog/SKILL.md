---
name: Write Devlog
description: HUA Platform의 데브로그를 매일 작성하는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# 데브로그 작성 스킬

이 스킬은 HUA Platform의 데브로그를 매일 작성하는 방법을 안내합니다.

## 데브로그 작성 원칙

### 1. 매일 작성
- **규칙**: 중요한 개발 작업이 있을 때마다 작성
- **날짜별**: `DEVLOG_YYYY-MM-DD_제목.md` 형식
- **자동 생성**: `pnpm generate:devlog` 스크립트 활용

### 2. 구체적 기록
- 에러와 해결 방법을 상세히 기록
- 학습 내용과 인사이트 기록
- 변경된 파일 목록 포함

### 3. 진행률 표시
- 완료된 작업과 남은 작업을 명확히 구분
- 체크리스트 형식 사용

## 데브로그 생성

### 자동 생성 (권장)

```bash
# 오늘 날짜로 생성
pnpm generate:devlog

# 특정 날짜로 생성
pnpm generate:devlog --date=2025-12-21

# 특정 브랜치로 생성
pnpm generate:devlog --branch=feature/new-feature

# 파일로 저장
pnpm generate:devlog --output=devlog.md
```

**기능:**
- Git 커밋 로그 자동 분석
- 변경된 파일 목록 자동 추출
- 작업 카테고리 자동 분류
- 템플릿 자동 채우기

### 수동 생성

1. 템플릿 복사: `docs/templates/DEVLOG_TEMPLATE.md`
2. 파일 생성: `docs/devlogs/DEVLOG_YYYY-MM-DD_제목.md`
3. 내용 작성
4. README 업데이트: `docs/devlogs/README.md`에 링크 추가

## 데브로그 구조

### 필수 섹션

1. **날짜**: 작업 날짜
2. **목표**: 당일 목표 (체크리스트)
3. **작업 내용**: 완료된 작업, 진행 중인 작업, 블로커/이슈
4. **테스트 결과**: 빌드, 타입 체크, 린트 결과
5. **학습/인사이트**: 새로 알게 된 점

### 선택 섹션

- 성과 지표
- 다음 단계
- 참고 링크

## 작성 가이드

### 완료된 작업

```markdown
#### 1. [작업 제목]

**상태**: 완료  
**작업 시간**: 2025-12-21 (오후)

**작업 내용**:
- 작업 상세 설명 1
- 작업 상세 설명 2

**변경된 파일**:
- `apps/my-app/app/components/Example.tsx`
- `apps/my-app/app/api/example/route.ts`

**기술적 개선사항**:
- 개선 사항 1
- 개선 사항 2
```

### 블로커/이슈

```markdown
### 블로커/이슈

- [빌드 오류] - 상태: 해결됨 - 해결 방안: Next.js 버전 업데이트
- [타입 에러] - 상태: 진행중 - 해결 방안: 타입 정의 추가 필요
```

### 학습/인사이트

```markdown
## 학습/인사이트

### 새로 알게 된 점
- Next.js App Router의 동적 라우트 처리 방법
- Prisma 타입 확장 패턴

### 개선 아이디어
- API 에러 처리 표준화
- 컴포넌트 재사용성 개선
```

## 태그 시스템

### 기술 태그
- `#monorepo` - 모노레포 관련
- `#i18n` - 국제화 관련
- `#sdk` - SDK 개발 관련
- `#nextjs` - Next.js 관련
- `#typescript` - TypeScript 관련
- `#tailwind` - Tailwind CSS 관련

### 상태 태그
- `#build-issues` - 빌드 문제
- `#bug-fix` - 버그 수정
- `#feature` - 새 기능 개발
- `#refactor` - 리팩토링
- `#optimization` - 최적화

## 파일명 규칙

### 형식
```
DEVLOG_YYYY-MM-DD_제목.md
```

### 예시
- `DEVLOG_2025-12-21_GRAPHITE_HOBBY_PLAN_INTRODUCTION.md`
- `DEVLOG_2025-12-15_BUILD_ERROR_FIX_AND_VERCEL_OPTIMIZATION.md`
- `DEVLOG_2025-12-11_ABUSE_DETECTION_IMPROVEMENT_AND_UUID_V7_PLAN.md`

## README 업데이트

데브로그 작성 후 `docs/devlogs/README.md`에 링크 추가:

```markdown
### 2025년 12월
- [2025-12-21 - 제목](./DEVLOG_2025-12-21_제목.md) - 간단한 설명
```

## 체크리스트

데브로그 작성 시 다음을 확인하세요:

- [ ] 파일명이 올바른 형식인가? (`DEVLOG_YYYY-MM-DD_제목.md`)
- [ ] 날짜가 정확한가?
- [ ] 완료된 작업이 상세히 기록되었는가?
- [ ] 변경된 파일 목록이 포함되었는가?
- [ ] 블로커/이슈가 기록되었는가?
- [ ] 학습/인사이트가 기록되었는가?
- [ ] README.md에 링크가 추가되었는가?
- [ ] 적절한 태그가 추가되었는가?

## 참고

- 데브로그 템플릿: `docs/templates/DEVLOG_TEMPLATE.md`
- 데브로그 생성 스크립트: `scripts/generate-devlog.ts`
- 데브로그 README: `docs/devlogs/README.md`
- 예시: `docs/devlogs/DEVLOG_2025-12-21_GRAPHITE_HOBBY_PLAN_INTRODUCTION.md`
