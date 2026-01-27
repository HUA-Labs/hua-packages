# HUA Framework 개선안 (2026-01)

> **작성일**: 2026-01-15
> **기반**: Claude 자체 분석 + Gemini 리뷰 피드백
> **목적**: 프레임워크 아키텍처 개선 및 비즈니스 모델 최적화

---

## 📊 현황 요약

### 강점 (유지할 것)
- ✅ UI / Motion / SDUI 분리 → 트리쉐이킹, 사용자 선택권 확보
- ✅ IntersectionObserver 기반 모션 훅 → 성능 우수
- ✅ Emotion UX 컴포넌트 → 차별화 포인트 (Killer Feature)
- ✅ 다국어(i18n) 시스템 → 글로벌 진출 준비 완료

### 문제점 (개선 필요)
- ❌ i18n 패키지 과도한 파편화 (8개+)
- ❌ hua-ux 통합 패키지 번들 사이즈 위험
- ❌ sideEffects 설정 미확인
- ❌ 유료/무료 경계 불명확
- ❌ 테스트 커버리지 부족

---

## 🎯 개선안

### 1. i18n 패키지 통합 [우선순위: 높음]

**현재 상태:**
```
@hua-labs/i18n-core
@hua-labs/i18n-core-zustand
@hua-labs/i18n-loaders
@hua-labs/i18n-date
@hua-labs/i18n-number
@hua-labs/i18n-currency
@hua-labs/i18n-plugins
@hua-labs/i18n-debug
@hua-labs/i18n-ai
@hua-labs/i18n-sdk
```

**문제:**
- 기능 하나 추가할 때 패키지 3~4개 수정 필요
- 버전 동기화 지옥
- 유지보수 피로도 급증

**해결책:**
```
@hua-labs/i18n (통합)
├── core/          # 기본 번역 함수
├── state/         # zustand 상태 관리
├── loaders/       # JSON, YAML 로더
├── formatters/    # date, number, currency
├── plugins/       # 플러그인 시스템
└── debug/         # 개발 도구

@hua-labs/i18n-ai (별도 유지 - 유료화 대상)
@hua-labs/i18n-sdk (별도 유지 - 외부 통합용)
```

**기대 효과:**
- 패키지 수 10개 → 3개
- 버전 관리 단순화
- 무료 기능으로 Lock-in 효과 극대화

---

### 2. hua-ux "Gateway Drug" 전략 [우선순위: 높음]

**현재 위험:**
```tsx
// 사용자가 Button만 쓰고 싶은데
import { Button } from '@hua-labs/hua-ux';
// SDUI, Chart, 유료 컴포넌트까지 번들에 포함될 위험
```

**해결책 A: Entry Point 분리**
```tsx
// 메인 (가벼운 것만)
import { Button, Card, useTranslation } from '@hua-labs/hua-ux';

// Advanced (필요할 때만)
import { Carousel, Marquee } from '@hua-labs/hua-ux/advanced';

// SDUI (완전 분리)
import { SDUIRenderer } from '@hua-labs/hua-ux/sdui';

// Premium (유료)
import { EmotionMeter } from '@hua-labs/hua-ux/premium';
```

**해결책 B: sideEffects 설정 확인**
```json
// packages/hua-ux/package.json
{
  "sideEffects": false,
  // 또는 CSS만 side effect로 지정
  "sideEffects": ["**/*.css"]
}
```

**해결책 C: Dev/Prod 동작 구분 (유료 기능)**
```tsx
// Premium 컴포넌트 내부
if (process.env.NODE_ENV === 'production' && !hasValidLicense()) {
  return <WatermarkedVersion {...props} />;
}
return <FullVersion {...props} />;
```

---

### 3. 번들 사이즈 최적화 [우선순위: 높음]

**필요한 작업:**

1. **번들 분석 도구 추가**
   ```bash
   pnpm add -D @next/bundle-analyzer
   ```

2. **각 패키지별 사이즈 측정**
   - ui: 목표 < 50KB (gzipped)
   - motion-core: 목표 < 10KB
   - i18n: 목표 < 15KB

3. **Dynamic Import 적용**
   ```tsx
   // 무거운 컴포넌트는 lazy load
   const Chart = dynamic(() => import('./Chart'), { ssr: false });
   ```

4. **아이콘 최적화**
   - Phosphor Icons: 사용하는 것만 import
   - 커스텀 아이콘 SVG 스프라이트 고려

---

### 4. 테스트 커버리지 확대 [우선순위: 중간]

**현재:** 거의 없음
**목표:** 핵심 컴포넌트 80%+

**우선순위:**
1. Motion 훅 (useFadeIn, useSlideUp 등) - 버그 발생 시 UX 직접 영향
2. i18n 코어 함수 - 다국어 출시 전 필수
3. UI 컴포넌트 (Form 관련) - 사용자 인터랙션 핵심

**테스트 설정:**
```bash
# vitest 이미 있음, 설정만 강화
pnpm add -D @testing-library/react @testing-library/user-event
```

---

### 5. PropsTable 자동화 [우선순위: 낮음]

**현재:** 수동으로 props 배열 관리
```tsx
const glowCardProps = [
  { name: 'glowColor', type: 'string', ... },
  // 수동 입력...
];
```

**문제:**
- 타입 변경 시 문서 동기화 누락 위험
- 유지보수 번거로움

**해결책 옵션:**

A. **TypeDoc + 커스텀 파서** (추천)
   - 빌드 시 .d.ts에서 자동 추출
   - 기존 JSDoc 활용

B. **react-docgen-typescript**
   - Storybook에서 사용하는 방식
   - Props 자동 파싱

C. **현재 방식 유지 + 린터**
   - 타입 변경 시 경고 스크립트
   - 가장 빠르게 적용 가능

**내 의견:** 지금 규모(106개 컴포넌트)에서는 C로 시작하고, 나중에 A로 전환하는 게 현실적. 자동화에 시간 쓰기보다 컴포넌트 품질에 집중하는 게 나음.

---

### 6. Emotion UX 강화 [우선순위: 중간]

**Gemini 피드백:** "EmotionButton을 프레임워크의 '얼굴'로 밀어야 한다"

**동의함. 구체적 액션:**

1. **랜딩 페이지 개편**
   - Hero 섹션에 EmotionButton 인터랙티브 데모
   - "Try clicking with different emotions" 체험 유도

2. **레시피 문서 추가**
   ```
   /docs/recipes/emotional-feedback.mdx
   /docs/recipes/mood-adaptive-ui.mdx
   /docs/recipes/user-sentiment-tracking.mdx
   ```

3. **실제 사용 케이스**
   - 고객 피드백 폼 + EmotionSelector
   - 제품 리뷰 + EmotionMeter
   - 학습 앱 + 이해도 체크

---

### 7. 접근성(A11y) 개선 [우선순위: 중간]

**Gemini 피드백:** "useReducedMotion을 모든 모션 훅에 내장"

**동의함. 구현:**

```tsx
// 모든 motion 훅 내부에 자동 적용
export function useFadeIn(options) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return { style: { opacity: 1 }, ref };  // 즉시 표시
  }

  // 기존 애니메이션 로직
}
```

**추가 고려:**
- ARIA 라벨 개선
- 키보드 네비게이션 테스트
- 색상 대비 검증

---

### 8. 문서 페이지 i18n 마이그레이션 [우선순위: 높음]

**현재 상태: 세 가지 패턴 혼재**

| 패턴 | 예시 | 상태 |
|------|------|------|
| `t()` 함수 | `t("docs:common.liveDemo")` | ✅ 권장 |
| `isKo` 삼항 | `isKo ? "한글" : "English"` | ⚠️ 레거시 |
| 이중언어 props | `descriptionKo="한글"` | ⚠️ 컴포넌트용 |

**문제:**
- 일관성 없는 코드베이스
- 번역 키 중앙 관리 불가
- 새 언어 추가 시 모든 파일 수정 필요

**해결책:**

1. **모든 페이지를 `t()` 함수로 통일**
   ```tsx
   // Before (레거시)
   isKo ? "스타터 플랜" : "Starter Plan"

   // After (권장)
   t("docs:components.glowCard.starterPlan")
   ```

2. **ComponentDoc 컴포넌트 리팩토링**
   ```tsx
   // Before
   <BackLink label="Back" labelKo="돌아가기" />

   // After
   <BackLink label={t("docs:common.backToComponents")} />
   ```

**마이그레이션 대상 페이지:**

컴포넌트 문서 (약 35개):
- [ ] glow-card - `isKo` 삼항 다수 사용
- [ ] spotlight-card - 확인 필요
- [ ] tilt-card - 확인 필요
- [ ] parallax - 확인 필요
- [ ] carousel - 확인 필요
- [ ] marquee - 확인 필요
- [ ] video-background - 확인 필요
- ... (전체 확인 필요)

훅 문서 (약 12개):
- [ ] use-motion - 확인 필요
- [ ] use-fade-in - 확인 필요
- [ ] use-gesture - 확인 필요
- ... (전체 확인 필요)

**번역 파일 확장 필요:**
```json
// en/docs.json에 추가 필요한 키들
{
  "components": {
    "glowCard": {
      "starterPlan": "Starter Plan",
      "proPlan": "Pro Plan",
      "forPersonal": "Perfect for personal projects",
      "forTeams": "For teams and businesses"
    }
  }
}
```

**내 의견:**
이건 지루하지만 중요한 작업임. 한 번에 다 하려고 하지 말고:
1. 새로 만드는 페이지는 `t()` 패턴 필수
2. 기존 페이지는 수정할 때 같이 마이그레이션
3. 주요 컴포넌트(Button, Card 등)는 우선 처리

---

## 📅 실행 로드맵

### Phase 1: 기반 정비 (즉시)
- [ ] sideEffects 설정 확인 및 적용
- [ ] hua-ux entry point 분리 (/advanced, /sdui, /premium)
- [ ] 번들 분석 도구 추가

### Phase 2: 구조 개선 (단기)
- [ ] i18n 패키지 통합 (10개 → 3개)
- [ ] Motion 훅에 useReducedMotion 내장
- [ ] 핵심 훅 테스트 작성

### Phase 3: 차별화 강화 (중기)
- [ ] Emotion UX 레시피 문서
- [ ] 랜딩 페이지 개편
- [ ] PropsTable 자동화 검토

### Phase 4: 확장 (장기)
- [ ] RSC(React Server Components) 지원
- [ ] 유료 기능 라이센스 시스템
- [ ] Vue/Svelte 포팅 검토

---

## 💭 내 의견 (Claude)

Gemini 피드백에 대부분 동의하지만, 몇 가지 추가 의견:

### 1. i18n 통합은 **반드시** 해야 함
현재 구조는 마이크로서비스 수준인데, 아직 그럴 단계가 아님.
"나중에 쪼개기"는 쉬워도 "나중에 합치기"는 어려움.
**지금 빠르게 움직이는 게 중요.**

### 2. hua-ux 통합 패키지 전략은 **좋음**
"Gateway Drug" 비유가 정확함.
다만 sideEffects 설정과 entry point 분리가 안 되어 있으면 **독**이 됨.
이건 즉시 확인 필요.

### 3. Emotion UX가 진짜 차별점
솔직히 UI 라이브러리는 넘쳐남 (shadcn, Radix, Chakra...).
근데 "감정 인식 UI"는 거의 없음.
**이걸 더 전면에 내세워야 함.**

### 4. 테스트보다 문서가 먼저
테스트 커버리지 올리는 건 좋지만, 지금 단계에서는
"사용법 문서 + 예제"가 더 중요함.
사람들이 써봐야 피드백이 오고, 그 피드백으로 테스트 우선순위를 정할 수 있음.

### 5. PropsTable 자동화는 나중에
106개 컴포넌트 중 실제 문서화 필요한 건 30~40개.
수동 관리해도 충분함. 자동화에 시간 쓰지 말고 **Emotion 레시피 문서** 먼저.

---

## ✅ 즉시 실행 체크리스트

```bash
# 1. sideEffects 확인
cat packages/hua-ux/package.json | grep sideEffects

# 2. 번들 사이즈 측정
pnpm add -D webpack-bundle-analyzer
# next.config.js에 analyzer 추가

# 3. entry point 구조 확인
ls packages/hua-ux/src/
```

---

*이 문서는 지속적으로 업데이트됩니다.*
