# i18n 패키지 문서화 전략 의사결정 (2025-12-02)

## 📋 문서 분류

### 외부 공개 문서 (영어)
- `packages/hua-i18n-core/README.md` ✅
- `packages/hua-i18n-core-zustand/README.md` ⚠️ (현재 한글 → 영어로 변경 필요)
- `packages/hua-i18n-loaders/README.md` ⚠️ (현재 한글 → 영어로 변경 필요)
- `docs/COMPARISON_I18N_LIBRARIES.md` ✅

### 내부 리뷰 문서 (한글)
- `docs/FEEDBACK_2025-12-02_I18N_PACKAGE_REVIEW.md` ⚠️ (현재 영어 → 한글로 복원 필요)
- `docs/IMPROVEMENTS_I18N_PACKAGE_CODE_REVIEW.md` ⚠️ (현재 영어 → 한글로 복원 필요)

## ✅ 결정 사항

### 1. "Why" 섹션 톤
- **결정**: 적당한 후킹 (너무 약파는 건 싫음)
- **방향**: 
  - 감정적 문구는 최소화
  - 문제 해결 중심의 실용적 톤
  - "Tired of..." 같은 강한 표현 대신 "Struggling with..." 정도로 완화
  - 기술적 장점을 명확하게 제시
  - 예시: "Struggling with flickering and hydration errors? @hua-labs/i18n-core provides a pragmatic solution."

### 2. 비교 문서 위치
- **결정**: 퍼블릭 레포로 이전 예정 (npm 배포용)
- **현재 상황**: 
  - 프라이빗 모노레포 → npm 배포용 퍼블릭 레포로 이전
  - GitHub Actions + Changesets + npm publish 자동화
- **방향**: 
  - 퍼블릭 레포의 `docs/` 폴더에 배치
  - README에서 상대 경로로 링크 (`./docs/COMPARISON.md`)
  - GitHub Pages는 불필요 (레포 내부 문서로 충분)

### 3. 예제 프로젝트 위치
- **결정**: 퍼블릭 레포에 `examples/` 폴더로 포함 (추천)
- **이유**: 
  - npm 패키지와 함께 관리, 버전 동기화 용이
  - 사용자가 쉽게 찾을 수 있음
  - 별도 레포 관리 부담 없음
- **구조**: 
  ```
  public-repo/
  ├── packages/
  │   ├── hua-i18n-core/
  │   ├── hua-i18n-core-zustand/
  │   └── hua-i18n-loaders/
  ├── examples/
  │   ├── next-app-router-example/
  │   └── zustand-integration-example/
  └── docs/
      └── COMPARISON.md
  ```
- **메인 모노레포**: 참고용으로만 유지 (선택적)

### 4. 데모 배포
- **결정**: CodeSandbox 우선, Vercel은 이후
- **Phase 1 (즉시)**: 
  - CodeSandbox 템플릿 생성 (무료, 즉시 사용 가능)
  - 예제 프로젝트를 CodeSandbox로 import
  - README에 "🌐 Try it on CodeSandbox" 링크 추가
- **Phase 2 (이후)**: 
  - Vercel 배포 (모노레포 구조 해결 후)
  - 또는 예제 프로젝트만 별도 배포

## 📋 실행 계획

### 즉시 (High Priority)
1. ✅ "Why" 섹션 개선 (적당한 후킹 톤)
   - "Struggling with..." 스타일로 수정
   - 기술적 장점 명확히 제시
2. ✅ 내부 리뷰 문서 한글로 복원
   - `FEEDBACK_2025-12-02_I18N_PACKAGE_REVIEW.md`
   - `IMPROVEMENTS_I18N_PACKAGE_CODE_REVIEW.md`
3. ✅ Zustand/Loaders README 영어화
   - `packages/hua-i18n-core-zustand/README.md`
   - `packages/hua-i18n-loaders/README.md`

### 퍼블릭 레포 이전 시
4. 비교 문서 경로 확인
   - `docs/COMPARISON.md`로 이동
   - README 링크 업데이트
5. 예제 프로젝트 `examples/` 폴더 구조 설계
   - `examples/next-app-router-example/`
   - `examples/zustand-integration-example/`
6. CodeSandbox 템플릿 생성
   - 예제 프로젝트를 CodeSandbox로 export
   - README에 링크 추가

### 이후
7. Vercel 데모 배포 (모노레포 구조 해결 후)
   - 또는 예제 프로젝트만 별도 배포

## 🎯 "Why" 섹션 개선 예시

### 현재
```
## 🎯 Why @hua-labs/i18n-core?

"Minimize flickering on language changes, resolve hydration issues, and integrate with state management"
```

### 개선안 (적당한 후킹)
```
## 🎯 Why @hua-labs/i18n-core?

Struggling with flickering on language changes or hydration mismatches? @hua-labs/i18n-core provides a pragmatic, production-ready solution for React i18n.

**Key advantages:**
- ✅ **Zero flickering**: Automatically shows previous language translation during switch
- ✅ **SSR-first**: Built-in hydration handling, no mismatch issues
- ✅ **State management integration**: First-class Zustand support
- ✅ **Small bundle**: ~2.8KB gzipped, zero dependencies (React only)
- ✅ **Framework agnostic**: Works with Next.js, Remix, Vite, and more
```
