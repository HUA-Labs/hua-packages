# 커밋 전략 - 2025-12-07

## 작업 개요

오늘 작업한 내용을 메인 피쳐별로 커밋하여 배포합니다.

### 작업 범위
- **패키지 2개**: hua-ui, hua-motion-core (또는 관련 패키지)
- **사이트 1개**: my-app

---

## Git Flow 전략

### 브랜치 구조
```
develop (기준 브랜치)
  ├── feature/admin-diary-detail-improvement (어드민 일기 상세 개선)
  ├── feature/[package-name]-[feature-name] (패키지별 피쳐)
  └── ...
```

### 커밋 컨벤션
Conventional Commits 형식 준수:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링
- `style`: 스타일 변경 (UI/UX)
- `docs`: 문서화
- `chore`: 빌드/설정 변경

---

## 메인 피쳐별 커밋 계획

### 1. 어드민 일기 상세 페이지 개선 (my-app)

**브랜치**: `feature/admin-diary-detail-improvement`

**커밋 메시지 예시**:
```
feat(admin): 어드민 일기 상세 페이지 개선

- 1차 분석 결과 제거 (오늘의 장면, 자기성찰 질문, 감응 해석)
- 2차 분석(HUA 분석) 표시 개선
- 배경색 제거 및 다크/라이트 모드 적용
- 이모지 제거
- API 엔드포인트 수정 (/api/admin/diaries/[id])
- 컴포넌트 기반 구조로 리팩토링

변경된 파일:
- apps/my-app/app/admin/diaries/[id]/page.tsx
- apps/my-app/app/admin/diaries/[id]/components/DiaryInfoCard.tsx
```

**관련 파일**:
- `apps/my-app/app/admin/diaries/[id]/page.tsx`
- `apps/my-app/app/admin/diaries/[id]/components/DiaryInfoCard.tsx`

---

### 2. 패키지별 피쳐 (확인 필요)

**확인 필요 사항**:
- hua-ui 패키지에서 변경된 파일 확인
- hua-motion-core 패키지에서 변경된 파일 확인
- 각 패키지별로 별도 피쳐 브랜치 생성 또는 통합

**커밋 전략**:
- 패키지별로 독립적인 피쳐 브랜치 생성
- 또는 관련된 변경사항이면 하나의 브랜치로 통합

---

## 커밋 순서

### 1단계: 브랜치 생성 및 작업 확인
```bash
# 현재 브랜치 확인
git status

# 어드민 일기 상세 개선 브랜치 생성
pnpm gitflow:create feature admin-diary-detail-improvement

# 또는 수동으로
git checkout develop
git pull origin develop
git checkout -b feature/admin-diary-detail-improvement
```

### 2단계: 변경사항 커밋
```bash
# 어드민 일기 상세 페이지 개선 커밋
git add apps/my-app/app/admin/diaries/[id]/
git commit -m "feat(admin): 어드민 일기 상세 페이지 개선

- 1차 분석 결과 제거
- 2차 분석 표시 개선
- 배경색 제거 및 다크/라이트 모드 적용
- 이모지 제거
- API 엔드포인트 수정
- 컴포넌트 기반 구조로 리팩토링"
```

### 3단계: 패키지별 커밋 (확인 필요)
```bash
# hua-ui 패키지 변경사항 확인
git status packages/hua-ui/

# hua-motion-core 패키지 변경사항 확인
git status packages/hua-motion-core/

# 각 패키지별로 커밋 또는 통합 커밋
```

### 4단계: PR 생성 및 머지
```bash
# 원격 브랜치에 푸시
git push origin feature/admin-diary-detail-improvement

# GitHub에서 PR 생성
# - 타겟: develop
# - PR 템플릿 작성
# - 코드 리뷰 요청
```

---

## 코드 리뷰 체크리스트

### 필수 확인 사항
- [ ] TypeScript 타입 오류 없음
- [ ] ESLint 경고 없음
- [ ] 빌드 성공
- [ ] 다크/라이트 모드 정상 작동
- [ ] 이모지 제거 확인
- [ ] API 엔드포인트 정상 작동

### 참고 문서
- `review-checklist.md` - 자동 생성된 코드 리뷰 체크리스트
- `docs/CODE_REVIEW_CHECKLIST.md` - 코드 리뷰 가이드

---

## 배포 전 확인사항

### 1. 빌드 테스트
```bash
# my-app 앱 빌드
cd apps/my-app
pnpm run build

# hua-ui 패키지 빌드
cd packages/hua-ui
pnpm run build

# hua-motion-core 패키지 빌드 (해당되는 경우)
cd packages/hua-motion-core
pnpm run build
```

### 2. 타입 체크
```bash
# 루트에서 타입 체크
pnpm run type-check
```

### 3. 린트 체크
```bash
# 루트에서 린트 체크
pnpm run lint
```

---

## 다음 단계

1. **브랜치 생성**: `feature/admin-diary-detail-improvement`
2. **변경사항 커밋**: 메인 피쳐별로 커밋
3. **PR 생성**: develop 브랜치로 PR 생성
4. **코드 리뷰**: 체크리스트 확인 및 리뷰 진행
5. **머지 및 배포**: 승인 후 머지 및 배포

---

## 참고 문서

- [Git Flow 가이드](../apps/my-app/scripts/gitflow/README.md)
- [PR 가이드](../docs/PR_GUIDE.md)
- [브랜치 보호 규칙](../docs/GIT_BRANCH_PROTECTION.md)
- [코드 리뷰 체크리스트](../review-checklist.md)

---

**작성일**: 2025-12-07  
**작성자**: Auto (AI Assistant)

