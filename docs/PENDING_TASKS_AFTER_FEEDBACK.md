# Pending Tasks After Feedback Review

## Completed Tasks

### 1. Documentation
- [x] README 영어화 (외부 공개 문서)
- [x] 내부 리뷰 문서는 한글로 유지
- [x] "Why" 섹션 톤 조정 (Struggling with... 스타일)
- [x] 비교 문서 생성 (COMPARISON_I18N_LIBRARIES.md)
- [x] Changeset 문서 생성 (README, DEPLOYMENT_CHECKLIST)
- [x] Git 워크플로우 문서 생성

### 2. Package Configuration
- [x] package.json 개선 (description, repository, keywords)
- [x] tsconfig.json 독립성 확보
- [x] CHANGELOG.md 생성
- [x] .gitignore 추가
- [x] peerDependencies 설정
- [x] sideEffects: false 설정

### 3. Monorepo Setup
- [x] Turbo v2 업데이트
- [x] pnpm 버전 통일
- [x] type-check 스크립트 추가
- [x] CI/CD 워크플로우 추가

### 4. Code Quality
- [x] 모든 페이지 통일된 번역 스타일 적용
- [x] getRawValue 사용으로 통일
- [x] 불필요한 디버깅 코드 제거

## Pending Tasks

### 1. Playground/Demo (High Priority)
- [ ] CodeSandbox 템플릿 생성
- [ ] 또는 Next.js 예제 프로젝트 생성
- [ ] Vercel 데모 배포
- [ ] README에 Live Demo 링크 추가

### 2. Code Improvements (Medium Priority)
- [ ] tWithParams 사용으로 변경 (.replace() 대신)
- [ ] 타입 안전성 개선 (키 자동완성은 향후 고려)
- [ ] 에러 핸들링 개선

### 3. Advanced Features (Low Priority - Future)
- [ ] 복수형(pluralization) 지원
- [ ] 날짜/시간 형식화(intl) 지원
- [ ] Right-to-Left(RTL) 지원
- [ ] 메시지 fallback 체인 개선
- [ ] L2 캐시 (IndexedDB 등)
- [ ] 사용자 우선언어 기반 프리로딩 전략

### 4. Release Strategy (Before First Release)
- [ ] 예제 프로젝트 생성
- [ ] 플레이그라운드/데모 배포
- [ ] Changeset 생성 (첫 배포용)
- [ ] 버전 0.x로 초기 배포 고려

### 5. Visual/Branding (Optional)
- [ ] 로고 추가 고려
- [ ] UI 스크린샷 추가 (언어 전환 깜빡임 없음)

## Recommended Order

1. **Before First Release:**
   - 플레이그라운드/데모 생성 및 배포
   - 예제 프로젝트 생성
   - Changeset 생성

2. **After First Release:**
   - 코드 개선 (tWithParams 등)
   - 고급 기능 추가 (복수형, intl 등)

3. **Ongoing:**
   - 문서 개선
   - 예제 추가
   - 커뮤니티 피드백 반영

