# 개선점 메모 - 2026-01-12

hua-docs 작업 중 발견한 개선이 필요한 사항들

---

## create-hua-ux CLI 개선점

### 높은 우선순위

1. **useMotion API 업데이트 필요**
   - 현재: 문자열 타입 (`'fade-in'`)
   - 실제: 객체 옵션 (`{ type: 'fadeIn', duration: 300 }`)
   - 반환값도 다름: `{ ref, isVisible }` → `motion.ref`, `motion.style`

2. **useTranslation API 분리 반영**
   - `useTranslation` + `useLanguageChange` 조합으로 변경
   - `supportedLanguages`가 `{ code, name }[]` 형태

3. **Next.js 16 async API 반영**
   - `headers()`, `cookies()` 등이 async 필수
   - 모든 example 파일 업데이트 필요

4. **globals.css 템플릿 개선**
   - 현재 너무 기본적임 (배경색, 전경색만)
   - 추천 CSS 프리셋 추가 필요:
     - 컬러 테마 시스템 (`@theme`, CSS 변수)
     - 다크 모드 지원
     - Prose 스타일 (문서용)
     - 스크롤바 스타일
     - 그라데이션 텍스트
     - 접근성 스타일 (sr-only)
     - Sugar-high 신택스 하이라이팅

### 중간 우선순위

5. **Monorepo 모드 옵션**
   - `--monorepo` 플래그: `workspace:*` 버전 사용
   - 또는 `pnpm-workspace.yaml` 감지 시 자동 적용

6. **템플릿 옵션 추가**
   - `--template default` (현재)
   - `--template docs` (문서 사이트)
   - `--template dashboard` (대시보드)

7. **Example 파일 타입 검증**
   - 빌드 시 example 파일도 타입 체크

### 낮은 우선순위

8. **GEO Example 분리**
   - 별도 템플릿 또는 `--with-geo` 플래그

9. **CSS 프리셋 선택 옵션**
   - `--theme teal` (기본, HUA Labs 스타일)
   - `--theme indigo` (문서 사이트 스타일)
   - `--theme custom`

---

## hua-ux 프레임워크 개선점

1. **useBranding hook 문서화**
   - 현재 undocumented

2. **브랜딩 색상 CSS 변수 자동 주입**
   - `config.branding.colors` → CSS 변수

---

## UI 패키지 개선점

1. **ScrollToTop 컴포넌트**
   - 문서 필요

2. **ScrollProgress 컴포넌트**
   - gradient 옵션 문서화

3. **ThemeProvider**
   - `enableTransition` 옵션 문서화

---

## 문서화 필요 항목

### hua-ux
- [ ] HuaUxLayout 전체 props
- [ ] useBranding hook
- [ ] SkipToContent 컴포넌트
- [ ] setConfig 함수
- [ ] getSSRTranslations 함수

### i18n-core
- [ ] useLanguageChange hook (새로 추가됨)
- [ ] supportedLanguages 타입

### motion-core
- [ ] useMotion (hua-ux에서 래핑된 버전)
- [ ] 반환값 구조 (ref, style)

### ui
- [ ] ScrollProgress
- [ ] ScrollToTop
- [ ] ThemeProvider

---

**업데이트**: 2026-01-12
