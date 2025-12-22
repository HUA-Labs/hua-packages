# HUA UI 패키지 개선 계획 (2025)

> 작성일: 2025-01-XX  
> 기준 브랜치: `origin/feature/dashboard-ui-widgets`  
> 목표: 프로덕션 배포 준비 및 개발자 경험 향상

## 📋 목차

1. [현재 상태 분석](#현재-상태-분석)
2. [개선 영역별 분석](#개선-영역별-분석)
3. [우선순위별 개선 계획](#우선순위별-개선-계획)
4. [단계별 실행 계획](#단계별-실행-계획)
5. [성공 지표](#성공-지표)
6. [리스크 및 대응 방안](#리스크-및-대응-방안)

---

## 1. 현재 상태 분석

### 1.1 완료된 영역 ✅

#### 공통 인프라
- ✅ **타입 시스템**: `src/lib/types` - Color/Size/Variant 계층 구조 완성
- ✅ **스타일 시스템**: `src/lib/styles` - 색상 팔레트, variant/size/rounded/shadow 생성기 중앙화
- ✅ **유틸리티**: `merge`, `mergeIf`, `mergeMap`, `cn` 함수 완성
- ✅ **다크모드**: 자동 테마 감지 및 전환 지원

#### 컴포넌트
- ✅ **기본 컴포넌트**: Button, Input, Card, Tabs, Badge, Avatar 등 15+ 컴포넌트
- ✅ **스마트 컴포넌트**: Action, Panel, Navigation
- ✅ **대시보드 위젯**: StatCard, MetricCard, QuickActionCard, ActivityFeed 등 20+ 위젯
- ✅ **피드백 컴포넌트**: Toast, Alert, Modal, Drawer, BottomSheet 등
- ✅ **내비게이션**: Navigation, Tabs, Accordion, Breadcrumb, Pagination

#### 문서화
- ✅ **README**: 기본 사용법 및 컴포넌트 가이드
- ✅ **API 문서**: 스타일 시스템 API 문서화
- ✅ **상태 문서**: 컴포넌트 상태 요약 문서
- ✅ **대시보드 문서**: 위젯 개발 계획 및 리뷰 문서

### 1.2 개선이 필요한 영역 ⚠️

#### 테스트 인프라
- ❌ **테스트 설정 부재**: Jest 스크립트만 있고 config/spec 파일 없음
- ❌ **테스트 커버리지**: 0% (테스트 코드 전무)
- ❌ **E2E 테스트**: 미구현

#### 빌드 및 배포
- ⚠️ **빌드 전략**: `tsc` 단일 단계만 사용, ESM/CJS/타입 번들 분리 없음
- ⚠️ **CSS 번들링**: Tailwind CSS 클래스만 사용, 별도 CSS 번들 없음
- ⚠️ **PeerDependencies**: `react`가 dependencies와 peerDependencies 모두에 선언됨
- ❌ **Changeset**: 버전 관리 시스템 미도입

#### 문서화 및 데모
- ⚠️ **Storybook**: 미도입 (README 기반 문서만 존재)
- ⚠️ **상태별 예시**: Loading/Empty/Error 시나리오 문서 부족
- ⚠️ **인터랙티브 데모**: 실제 동작하는 예제 부족

#### 기능 완성도
- ⚠️ **고급 모션**: Action 컴포넌트의 haptic/ripple/sound 플래그 TODO 상태
- ⚠️ **서버 컴포넌트**: Next.js 15 App Router 완전 지원 미완성
- ⚠️ **접근성**: 일부 컴포넌트 키보드 네비게이션/ARIA 속성 부족

#### 성능 최적화
- ⚠️ **번들 크기**: 분석 및 최적화 미완료
- ⚠️ **트리 쉐이킹**: 효율성 검증 필요
- ⚠️ **메모이제이션**: 컴포넌트별 최적화 필요

---

## 2. 개선 영역별 분석

### 2.1 테스트 인프라 구축 🔴 **최우선**

#### 현재 문제점
- 테스트 코드가 전혀 없어 리팩토링 시 회귀 버그 위험
- CI/CD 파이프라인에서 자동 검증 불가
- 컴포넌트 동작 보장 불가

#### 개선 방안

**Phase 1: 기본 테스트 설정**
```bash
# Vitest 도입 (Jest 대신 - 더 빠르고 Vite 통합)
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Phase 2: 핵심 컴포넌트 테스트**
- Button, Action, Input, Card 등 기본 컴포넌트
- Toast, Modal 등 피드백 컴포넌트
- 대시보드 위젯 (StatCard, MetricCard 등)

**Phase 3: 통합 테스트**
- 컴포넌트 조합 테스트
- 테마 전환 테스트
- 접근성 테스트

#### 예상 작업량
- 설정: 1일
- 기본 컴포넌트 테스트: 3-5일
- 위젯 테스트: 2-3일
- **총 예상: 6-9일**

### 2.2 빌드 및 배포 시스템 개선 🔴 **최우선**

#### 현재 문제점
- `tsc`만 사용하여 ESM/CJS 분리 불가
- CSS 번들링 없음
- npm 배포 준비 미완료

#### 개선 방안

**tsup 도입**
```json
{
  "scripts": {
    "build": "tsup",
    "build:watch": "tsup --watch"
  },
  "devDependencies": {
    "tsup": "^8.0.0"
  }
}
```

**tsup.config.ts**
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
});
```

**PeerDependencies 정리**
```json
{
  "dependencies": {
    // react 제거
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

#### 예상 작업량
- tsup 설정: 0.5일
- 빌드 파이프라인 검증: 1일
- PeerDependencies 정리: 0.5일
- **총 예상: 2일**

### 2.3 문서화 및 데모 시스템 구축 🟡 **중요**

#### 현재 문제점
- Storybook 미도입으로 인터랙티브 예제 부족
- 상태별(Loading/Empty/Error) 문서 부족
- 컴포넌트 사용 패턴 가이드 부족

#### 개선 방안

**옵션 1: Storybook 도입 (권장)**
```bash
pnpm add -D @storybook/react @storybook/addon-essentials
npx storybook@latest init
```

**옵션 2: Ladle 도입 (경량 대안)**
```bash
pnpm add -D @ladle/react
```

**문서 구조 개선**
- 각 컴포넌트별 README에 상태별 예시 추가
- 사용 패턴 가이드 작성
- 마이그레이션 가이드 보강

#### 예상 작업량
- Storybook 설정: 1일
- 핵심 컴포넌트 스토리 작성: 3-5일
- 문서 보강: 2-3일
- **총 예상: 6-9일**

### 2.4 기능 완성도 향상 🟡 **중요**

#### 2.4.1 고급 모션 기능

**현재 상태**
- Action 컴포넌트에 haptic/ripple/sound 플래그는 있으나 구현 미완료

**개선 방안**
```typescript
// Action.tsx 개선
interface ActionProps {
  // ... 기존 props
  haptic?: boolean; // 햅틱 피드백 (모바일)
  ripple?: boolean; // 리플 효과
  sound?: string; // 사운드 효과 (선택적)
}
```

**구현 우선순위**
1. Ripple 효과 (가장 시각적)
2. Haptic 피드백 (모바일 지원)
3. Sound 효과 (선택적, 접근성 고려)

#### 2.4.2 서버 컴포넌트 지원

**현재 상태**
- 일부 컴포넌트에 "use client" 선언이 있으나 완전한 지원 미완성

**개선 방안**
- 서버 컴포넌트 호환성 검증
- 클라이언트 전용 기능 분리
- 하이드레이션 전략 개선

#### 2.4.3 접근성 개선

**현재 문제점**
- TransactionsTable: 키보드 네비게이션 부족
- 일부 컴포넌트: ARIA 속성 부족

**개선 방안**
- 모든 인터랙티브 컴포넌트에 키보드 네비게이션 추가
- ARIA 속성 완전 지원
- 스크린 리더 테스트

#### 예상 작업량
- 고급 모션: 2-3일
- 서버 컴포넌트: 3-5일
- 접근성: 2-3일
- **총 예상: 7-11일**

### 2.5 성능 최적화 🟢 **보통**

#### 번들 크기 분석
```bash
# 번들 분석 도구 도입
pnpm add -D @next/bundle-analyzer
# 또는
pnpm add -D rollup-plugin-visualizer
```

#### 최적화 전략
1. **코드 스플리팅**: 컴포넌트별 동적 import
2. **트리 쉐이킹**: 사용하지 않는 코드 제거 검증
3. **메모이제이션**: React.memo, useMemo 최적화
4. **가상화**: 대용량 리스트 컴포넌트

#### 예상 작업량
- 분석: 1일
- 최적화: 2-3일
- **총 예상: 3-4일**

---

## 3. 우선순위별 개선 계획

### 🔴 Phase 1: 프로덕션 배포 준비 (2-3주)

**목표**: npm 배포 가능한 상태로 만들기

#### 작업 항목
1. ✅ **빌드 시스템 개선** (2일)
   - [ ] tsup 도입 및 설정
   - [ ] ESM/CJS 번들 생성 검증
   - [ ] 타입 정의 파일 생성 검증

2. ✅ **의존성 정리** (0.5일)
   - [ ] PeerDependencies 정리
   - [ ] devDependencies 분리
   - [ ] package.json 검증

3. ✅ **기본 테스트 구축** (3-5일)
   - [ ] Vitest 설정
   - [ ] 핵심 컴포넌트 테스트 (Button, Input, Card)
   - [ ] CI/CD 통합

4. ✅ **Changeset 도입** (1일)
   - [ ] Changeset 설정
   - [ ] 버전 관리 워크플로우 문서화

**예상 기간**: 6.5-8.5일 (약 1.5-2주)

### 🟡 Phase 2: 개발자 경험 향상 (2-3주)

**목표**: 문서화 및 데모 시스템 구축

#### 작업 항목
1. ✅ **Storybook 도입** (1일)
   - [ ] Storybook 설정
   - [ ] 기본 스토리 템플릿 작성

2. ✅ **컴포넌트 스토리 작성** (3-5일)
   - [ ] 기본 컴포넌트 스토리
   - [ ] 대시보드 위젯 스토리
   - [ ] 상태별(Loading/Empty/Error) 예시

3. ✅ **문서 보강** (2-3일)
   - [ ] 사용 패턴 가이드
   - [ ] 마이그레이션 가이드 보강
   - [ ] API 참조 문서 완성

**예상 기간**: 6-9일 (약 1.5-2주)

### 🟢 Phase 3: 기능 완성 및 최적화 (2-3주)

**목표**: 기능 완성도 향상 및 성능 최적화

#### 작업 항목
1. ✅ **고급 모션 기능** (2-3일)
   - [ ] Ripple 효과 구현
   - [ ] Haptic 피드백 구현
   - [ ] Sound 효과 (선택적)

2. ✅ **서버 컴포넌트 지원** (3-5일)
   - [ ] 호환성 검증
   - [ ] 클라이언트 전용 기능 분리
   - [ ] 하이드레이션 전략 개선

3. ✅ **접근성 개선** (2-3일)
   - [ ] 키보드 네비게이션 추가
   - [ ] ARIA 속성 완전 지원
   - [ ] 스크린 리더 테스트

4. ✅ **성능 최적화** (3-4일)
   - [ ] 번들 크기 분석
   - [ ] 트리 쉐이킹 검증
   - [ ] 메모이제이션 최적화

**예상 기간**: 10-15일 (약 2-3주)

---

## 4. 단계별 실행 계획

### Week 1-2: Phase 1 (프로덕션 배포 준비)

**Day 1-2: 빌드 시스템**
- [ ] tsup 설치 및 기본 설정
- [ ] 빌드 스크립트 작성
- [ ] ESM/CJS 출력 검증

**Day 3: 의존성 정리**
- [ ] PeerDependencies 정리
- [ ] package.json 검증
- [ ] 빌드 테스트

**Day 4-8: 테스트 구축**
- [ ] Vitest 설정
- [ ] Button, Input, Card 테스트 작성
- [ ] Toast, Modal 테스트 작성
- [ ] CI/CD 통합

**Day 9: Changeset 도입**
- [ ] Changeset 설치 및 설정
- [ ] 버전 관리 워크플로우 문서화

### Week 3-4: Phase 2 (개발자 경험 향상)

**Day 1: Storybook 설정**
- [ ] Storybook 설치 및 설정
- [ ] 기본 스토리 템플릿 작성

**Day 2-6: 스토리 작성**
- [ ] 기본 컴포넌트 스토리 (Button, Input, Card 등)
- [ ] 대시보드 위젯 스토리
- [ ] 상태별 예시 추가

**Day 7-9: 문서 보강**
- [ ] 사용 패턴 가이드 작성
- [ ] 마이그레이션 가이드 보강
- [ ] API 참조 문서 완성

### Week 5-7: Phase 3 (기능 완성 및 최적화)

**Day 1-3: 고급 모션**
- [ ] Ripple 효과 구현
- [ ] Haptic 피드백 구현

**Day 4-8: 서버 컴포넌트**
- [ ] 호환성 검증
- [ ] 클라이언트 전용 기능 분리
- [ ] 하이드레이션 전략 개선

**Day 9-11: 접근성**
- [ ] 키보드 네비게이션 추가
- [ ] ARIA 속성 완전 지원

**Day 12-15: 성능 최적화**
- [ ] 번들 크기 분석
- [ ] 트리 쉐이킹 검증
- [ ] 메모이제이션 최적화

---

## 5. 성공 지표

### 기술적 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| 테스트 커버리지 | 0% | 80%+ | Vitest coverage |
| 번들 크기 (gzipped) | 미측정 | <50KB | Bundle analyzer |
| 타입 안전성 | 100% | 100% | TypeScript strict |
| 빌드 시간 | 미측정 | <30초 | CI/CD 로그 |

### 개발자 경험 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| 문서 완성도 | 60% | 90%+ | 문서 체크리스트 |
| 인터랙티브 예제 | 0개 | 50+개 | Storybook 스토리 |
| 마이그레이션 가이드 | 기본 | 완전 | 문서 리뷰 |

### 품질 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| 접근성 점수 | 미측정 | WCAG 2.1 AA | aXe DevTools |
| 성능 점수 | 미측정 | Lighthouse 90+ | Lighthouse CI |
| 버그 리포트 | - | <5개/월 | GitHub Issues |

---

## 6. 리스크 및 대응 방안

### 리스크 1: 시간 부족

**위험도**: 중간  
**대응 방안**:
- Phase별로 독립적으로 배포 가능하도록 설계
- 최소 기능 세트(MVP) 우선 구현
- 비핵심 기능은 Phase 4로 연기

### 리스크 2: 기존 코드 호환성

**위험도**: 낮음  
**대응 방안**:
- 하위 호환성 유지 원칙 준수
- Breaking change는 major 버전으로 배포
- 마이그레이션 가이드 제공

### 리스크 3: 성능 저하

**위험도**: 낮음  
**대응 방안**:
- 성능 벤치마크 설정
- CI/CD에서 성능 테스트 자동화
- 최적화 전후 비교 측정

### 리스크 4: 문서화 부족

**위험도**: 중간  
**대응 방안**:
- 문서화를 코드와 함께 진행
- PR 리뷰 시 문서 업데이트 확인
- 정기적인 문서 리뷰

---

## 7. 참고 문서

- [컴포넌트 상태 요약](./COMPONENT_STATUS_2025-11.md)
- [대시보드 위젯 계획](./DASHBOARD_WIDGET_PLAN.md)
- [대시보드 리뷰](./DASHBOARD_REVIEW_2025-11.md)
- [리팩토링 완료 보고서](./REFACTORING_COMPLETE.md)
- [API 스타일 시스템](./API_STYLE_SYSTEM.md)
- [개발 계획](../HUA_UI_DEVELOPMENT_PLAN.md)

---

## 8. 다음 단계

### 즉시 시작 가능한 작업
1. ✅ tsup 설정 및 빌드 시스템 개선
2. ✅ PeerDependencies 정리
3. ✅ Vitest 기본 설정

### 논의 필요 사항
1. Storybook vs Ladle 선택
2. Changeset vs Semantic Release 선택
3. 테스트 커버리지 목표 설정

### 장기 계획
1. 플러그인 시스템 도입
2. AI 기반 컴포넌트 추천
3. 실시간 협업 기능

---

**작성자**: Platform UI Guild  
**최종 업데이트**: 2025-01-XX  
**다음 리뷰**: Phase 1 완료 후

