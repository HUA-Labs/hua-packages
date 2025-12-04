# 작업 분담 계획 (에이전트별)

## 작업 목록

### 작업 1: CodeSandbox 템플릿 생성 (Agent 1)
**목표**: CodeSandbox에서 바로 실행 가능한 i18n 데모 템플릿 생성

**작업 내용**:
1. CodeSandbox 템플릿 프로젝트 구조 생성
   - Next.js App Router 기반
   - @hua-labs/i18n-core 사용 예제
   - @hua-labs/i18n-core-zustand 통합 예제
   - 기본적인 언어 전환 기능
   - 깜빡임 없는 언어 전환 데모

2. 필수 파일 생성
   - `package.json` (의존성 설정)
   - `app/layout.tsx` (SSR 번역 로드)
   - `app/page.tsx` (메인 데모 페이지)
   - `components/LanguageSwitcher.tsx` (언어 전환 컴포넌트)
   - `lib/i18n-config.ts` (i18n 설정)
   - `public/locales/ko/common.json` (한국어 번역)
   - `public/locales/en/common.json` (영어 번역)

3. CodeSandbox 설정
   - `sandbox.config.json` 생성
   - README.md (CodeSandbox용)

**출력물**:
- `examples/codesandbox-template/` 폴더
- CodeSandbox로 import 가능한 완성된 프로젝트

**예상 시간**: 2-3시간

**체크리스트**:
- [ ] Next.js 프로젝트 구조 생성
- [ ] i18n-core 패키지 통합
- [ ] Zustand 어댑터 통합
- [ ] 언어 전환 데모 구현
- [ ] 번역 파일 추가
- [ ] CodeSandbox 설정 완료
- [ ] 로컬에서 테스트 완료

---

### 작업 2: Next.js 예제 프로젝트 생성 (Agent 2)
**목표**: 완성도 높은 Next.js 예제 프로젝트 생성 (Vercel 배포 가능)

**작업 내용**:
1. 예제 프로젝트 구조 생성
   - `examples/next-app-router-example/` 폴더
   - Next.js 15 App Router 기반
   - TypeScript 사용
   - Tailwind CSS (선택)

2. 주요 기능 구현
   - SSR 번역 로드 예제
   - 클라이언트 언어 전환 예제
   - Zustand 통합 예제
   - 여러 네임스페이스 사용 예제
   - getRawValue 사용 예제 (배열/객체)

3. 문서화
   - README.md (설치 및 사용법)
   - 주석으로 코드 설명

**출력물**:
- `examples/next-app-router-example/` 완성된 프로젝트
- Vercel 배포 가능한 상태

**예상 시간**: 4-6시간

**체크리스트**:
- [ ] Next.js 프로젝트 초기화
- [ ] i18n 설정 완료
- [ ] 여러 예제 페이지 생성
- [ ] Zustand 통합 예제
- [ ] SSR/CSR 예제
- [ ] README 작성
- [ ] 로컬 빌드 테스트 완료

---

### 작업 3: README 업데이트 및 데모 링크 추가 (Agent 3)
**목표**: 모든 i18n 패키지 README에 데모 링크 추가

**작업 내용**:
1. hua-i18n-core README 업데이트
   - CodeSandbox 링크 추가
   - Next.js 예제 링크 추가 (Vercel 배포 후)
   - "Try it" 섹션 추가

2. hua-i18n-core-zustand README 업데이트
   - 통합 예제 링크 추가

3. hua-i18n-loaders README 업데이트
   - 사용 예제 링크 추가

4. 루트 README 업데이트 (선택)
   - 예제 프로젝트 섹션 추가

**출력물**:
- 업데이트된 README 파일들

**예상 시간**: 1시간

**체크리스트**:
- [ ] hua-i18n-core README 업데이트
- [ ] hua-i18n-core-zustand README 업데이트
- [ ] hua-i18n-loaders README 업데이트
- [ ] 링크 테스트 (로컬에서 확인)

---

### 작업 4: Changeset 생성 및 배포 준비 (Agent 4)
**목표**: 첫 배포를 위한 Changeset 생성

**작업 내용**:
1. Changeset 생성
   ```bash
   pnpm changeset
   ```
   - @hua-labs/i18n-core: major (1.0.0)
   - @hua-labs/i18n-core-zustand: major (1.0.0)
   - @hua-labs/i18n-loaders: minor (0.1.0)

2. Changeset 파일 검토
   - 버전 타입 확인
   - 설명 확인

3. 배포 체크리스트 확인
   - DEPLOYMENT_CHECKLIST.md 참고

**출력물**:
- `.changeset/*.md` 파일들

**예상 시간**: 30분

**체크리스트**:
- [ ] Changeset 생성
- [ ] 버전 타입 확인
- [ ] 설명 확인
- [ ] 배포 체크리스트 확인

---

## 작업 의존성

```
작업 1 (CodeSandbox) ──┐
                        ├──> 작업 3 (README 업데이트)
작업 2 (Next.js 예제) ──┘
                        │
작업 4 (Changeset) ─────┘ (독립적)
```

## 권장 작업 순서

### 동시 진행 가능:
- 작업 1 (CodeSandbox) + 작업 2 (Next.js 예제) → 병렬 진행 가능
- 작업 4 (Changeset) → 독립적으로 진행 가능

### 순차 진행 필요:
- 작업 3 (README 업데이트) → 작업 1, 2 완료 후 진행

## 작업 분배 제안

### Agent 1: CodeSandbox 템플릿
- 빠르게 완성 가능
- 독립적으로 작업 가능
- 우선순위 높음

### Agent 2: Next.js 예제 프로젝트
- 시간이 더 필요
- 독립적으로 작업 가능
- Agent 1과 병렬 진행 가능

### Agent 3: README 업데이트
- 작업 1, 2 완료 후 진행
- 상대적으로 간단

### Agent 4: Changeset 생성
- 가장 간단
- 독립적으로 진행 가능
- 언제든지 가능

