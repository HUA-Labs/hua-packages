# Icon 시스템 개선 로드맵

## 현재 상태 요약

### ✅ 완료된 기능
- [x] Icon 컴포넌트 (기본 기능)
- [x] IconProvider (Context API)
- [x] 다중 아이콘 세트 지원 (Lucide, Phosphor)
- [x] Alias 시스템 (280+ alias)
- [x] 스니펫 자동 생성
- [x] 타입 자동 생성
- [x] 문서화 (5개 문서)
- [x] 동적 Fallback (매핑되지 않은 아이콘도 사용 가능)

## 개선 필요 항목

### 🔴 우선순위 높음 (핵심 기능)

#### 1. 번들 최적화
**현재 문제:**
- `icons.ts`에서 모든 Lucide 아이콘 (200+개)을 한 번에 import
- 사용하지 않는 아이콘도 번들에 포함
- 예상 번들 크기: ~200KB+

**개선 방안:**
- **핵심 아이콘만** `icons.ts`에 포함 (~60-80개)
- 나머지는 **동적 fallback**으로 처리 (이미 구현됨)
- 새로운 아이콘 추가 시 자동으로 동적 로딩
- 예상 절감: ~70-75% (200KB → 50-60KB)

**구현 단계:**
1. my-app에서 현재 사용되는 아이콘 추출
2. UI 컴포넌트에서 자주 사용되는 아이콘 추가
3. 각 카테고리의 대표 아이콘 포함
4. `icons.ts`를 핵심 아이콘만 포함하도록 수정
5. 동적 fallback 테스트 및 번들 크기 확인

**전략:**
- 핵심 아이콘: 즉시 로드 (번들에 포함)
- 나머지 아이콘: 첫 사용 시 동적 로드 (번들에 미포함)
- 새로운 아이콘: 자동으로 동적 로드 (코드 수정 불필요)

**참고:** 
- [ICON_BUNDLE_OPTIMIZATION.md](./ICON_BUNDLE_OPTIMIZATION.md)
- [ICON_BUNDLE_OPTIMIZATION_STRATEGY.md](./ICON_BUNDLE_OPTIMIZATION_STRATEGY.md) (변경 가능성 고려)

#### 2. 테스트 코드 작성
**현재 상태:** 테스트 코드 없음

**필요한 테스트:**
- [ ] Icon 컴포넌트 렌더링 테스트
- [ ] IconProvider Context 테스트
- [ ] Alias 해결 테스트
- [ ] 다중 프로바이더 테스트
- [ ] 애니메이션 prop 테스트
- [ ] Variant prop 테스트
- [ ] SSR 안전성 테스트

**도구:**
- Vitest (이미 설정됨)
- @testing-library/react

#### 3. Untitled Icons 구현
**현재 상태:** 준비 중 (매핑만 정의됨)

**필요한 작업:**
- [ ] Untitled Icons SVG 파일 통합 방법 결정
- [ ] SVG 로더 구현
- [ ] Icon 컴포넌트에 Untitled 지원 추가
- [ ] 문서 업데이트

### 🟡 우선순위 중간 (개선 사항)

#### 4. Storybook 스토리 작성
**목적:** 컴포넌트 시각화 및 문서화

**필요한 스토리:**
- [ ] 기본 Icon 사용법
- [ ] 다중 프로바이더 비교
- [ ] Alias 예시
- [ ] 애니메이션 예시
- [ ] Variant 예시
- [ ] IconProvider 설정 예시

#### 5. SSR 개선
**현재 상태:** 모든 아이콘을 클라이언트 전용으로 제한

**개선 방안:**
- [ ] Lucide는 SSR-safe이므로 SSR 지원 추가
- [ ] Phosphor는 동적 import 유지
- [ ] SSR/CSR 선택 옵션 제공

#### 6. 아이콘 프리로딩 옵션
**목적:** 성능 최적화

**기능:**
- [ ] 자주 사용되는 아이콘 프리로드
- [ ] IconProvider에 `preload` 옵션 추가
- [ ] Phosphor 초기화 캐싱 개선

#### 7. 테마 기반 weight 자동 분기
**목적:** 다크 모드에서 자동으로 weight 조정

**기능:**
- [ ] light 모드: `regular` 또는 `light`
- [ ] dark 모드: `bold` 또는 `regular`
- [ ] IconProvider에 `themeAware` 옵션 추가

### 🟢 우선순위 낮음 (선택 사항)

#### 8. 아이콘 컴포넌트 메모이제이션
**목적:** 불필요한 리렌더링 방지

**구현:**
- [ ] `React.memo`로 Icon 컴포넌트 래핑
- [ ] props 비교 함수 최적화

#### 9. Emotion/Status 아이콘 매핑표 문서화
**현재 상태:** 코드에는 있지만 문서에 표가 없음

**필요한 작업:**
- [ ] 감정 아이콘 매핑표 추가
- [ ] 상태 아이콘 매핑표 추가
- [ ] ICON_SYSTEM.md에 추가

#### 10. 아이콘 목록 전체 문서화
**목적:** 사용 가능한 모든 아이콘 목록 제공

**필요한 작업:**
- [ ] PROJECT_ICONS 목록 문서화
- [ ] Alias 목록 문서화
- [ ] 프로바이더별 아이콘 이름 비교표

#### 11. 아이콘 검색 기능 (선택)
**목적:** 개발자 경험 향상

**기능:**
- [ ] 아이콘 이름 검색
- [ ] 프로바이더별 필터링
- [ ] Storybook에 통합

## 구현 우선순위

### Phase 1: 핵심 최적화 (1-2주)
1. 번들 최적화 (icons.ts 정리)
2. 기본 테스트 코드 작성

### Phase 2: 기능 완성 (2-3주)
3. Untitled Icons 구현
4. Storybook 스토리 작성
5. SSR 개선

### Phase 3: 고급 기능 (선택)
6. 아이콘 프리로딩
7. 테마 기반 weight 자동 분기
8. 메모이제이션 최적화

### Phase 4: 문서화 및 DX (지속)
9. Emotion/Status 매핑표 문서화
10. 아이콘 목록 전체 문서화
11. 아이콘 검색 기능

## 참고 문서

- [Icon System Documentation](./ICON_SYSTEM.md)
- [Icon Usage Guide](./ICON_USAGE_GUIDE.md)
- [Icon Bundle Optimization](./ICON_BUNDLE_OPTIMIZATION.md)
- [Icon Optimization Plan](./ICON_OPTIMIZATION_PLAN.md)
- [Icon Autocomplete Guide](./ICON_AUTOCOMPLETE.md)

