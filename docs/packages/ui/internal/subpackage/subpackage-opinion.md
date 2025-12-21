# 서브패키지 분리에 대한 의견

**작성일**: 2025-12-06  
**작성자**: Auto (AI Assistant)

---

## 🔍 실제 구현 확인 결과

### ChatGPT 가정 vs 실제 구현

| 컴포넌트 | ChatGPT 가정 | 실제 구현 | 차이점 |
|---------|-------------|----------|--------|
| **Drawer** | motion + portal + scroll lock | CSS transition + fixed positioning + scroll lock | ❌ motion 라이브러리 없음, Portal 없음 |
| **BottomSheet** | motion + portal + scroll lock | React state + 드래그 로직 + fixed positioning | ❌ motion 라이브러리 없음, Portal 없음 |
| **Toast** | 글로벌 상태 관리 + motion queue | Context API + CSS transition | ⚠️ motion queue 없음 |
| **Command** | 무거운 인터랙션 | useState/useEffect 기반, 가벼움 | ❌ 특별히 무겁지 않음 |
| **ContextMenu** | 무거운 인터랙션 | useState/useEffect + 포지셔닝 로직 | ❌ 특별히 무겁지 않음 |
| **ScrollToTop** | motion + listener | useScrollToggle hook + CSS | ❌ motion 없음 |

---

## 💭 제 의견

### 1. ChatGPT의 접근 방식은 좋지만, 실제 구현과 맞지 않음

**장점**:
- ✅ DX 우선 원칙 (Core 80% / Subpackages 20%) - 매우 합리적
- ✅ 사용 빈도 기반 분리 기준 - 명확함
- ✅ 번들 크기 최적화 고려 - 실용적

**문제점**:
- ❌ 실제 구현이 motion 라이브러리를 사용하지 않음
- ❌ Portal도 Modal만 사용 (Drawer/BottomSheet는 fixed positioning)
- ❌ ChatGPT가 가정한 "무거움"이 실제로는 가벼움

---

### 2. 실제 번들 크기 측정이 필요함

현재는 **가정**에 기반한 분리 기준이지만, 실제로는:
- Drawer, BottomSheet: CSS transition만 사용 → **가벼움**
- Toast: Context API + CSS → **가벼움**
- Command, ContextMenu: 기본 React hooks → **가벼움**

**제안**: 실제 번들 크기를 측정한 후 분리 결정
```bash
# 번들 크기 분석 필요
pnpm build:analyze
```

---

### 3. 분리 기준 재정의 필요

ChatGPT의 기준을 우리 프로젝트에 맞게 수정:

#### ✅ 분리 권장 (실제 기준)

1. **`@hua-labs/ui/overlay`** - ⚠️ **재검토 필요**
   - Drawer, BottomSheet: 실제로는 가벼움 (CSS transition만)
   - ConfirmModal: Modal 기반이므로 Core에 유지 가능
   - **결론**: 분리 필요성 낮음, Core에 유지 고려

2. **`@hua-labs/ui/navigation`** - ✅ **분리 권장**
   - PageNavigation, PageTransition: 대규모 앱에서만 필요
   - Sidebar Navigation: Dashboard 전용
   - **이유**: 사용 빈도가 낮고, 특정 도메인에 특화됨

3. **`@hua-labs/ui/interactive`** - ⚠️ **재검토 필요**
   - Command, ContextMenu: 실제로는 가벼움
   - **결론**: Core에 유지 고려, 또는 사용 빈도 기반으로만 분리

4. **`@hua-labs/ui/feedback`** - ✅ **분리 권장**
   - Toast: 글로벌 상태 관리 (Context API) + CSS
   - **이유**: Provider 패턴이므로 분리해도 무방, CSS 파일도 함께 관리 가능

5. **`@hua-labs/ui/scroll`** - ⚠️ **재검토 필요**
   - ScrollToTop, ScrollIndicator, ScrollProgress: 실제로는 가벼움
   - **결론**: 사용 빈도가 낮으므로 분리 고려, 하지만 필수는 아님

---

### 4. 최종 제안: 보수적 접근

#### 옵션 A: 최소 분리 (추천)

**분리하는 것**:
1. `@hua-labs/ui/navigation` - PageNavigation, PageTransition, Sidebar Navigation
2. `@hua-labs/ui/feedback` - Toast (Provider 패턴이므로)

**Core에 유지**:
- Drawer, BottomSheet, ConfirmModal (실제로 가벼움)
- Command, ContextMenu (실제로 가벼움)
- ScrollToTop, ScrollIndicator, ScrollProgress (사용 빈도 낮지만 가벼움)

**이유**:
- 실제 번들 크기가 크지 않음
- DX 우선: Core에서 대부분 해결 가능
- 과도한 분리는 오히려 복잡도만 증가

---

#### 옵션 B: ChatGPT 제안대로 (번들 크기 확인 후)

**전제 조건**:
1. 실제 번들 크기 측정
2. 각 컴포넌트의 실제 무게 확인
3. 사용 빈도 통계 수집

**분리하는 것**:
- ChatGPT 제안대로 5개 서브패키지 모두 분리
- 단, 실제 측정 결과에 따라 조정

---

## 🎯 제 최종 의견

### 추천: 옵션 A (최소 분리)

**이유**:

1. **실제 구현이 가벼움**
   - motion 라이브러리 없음
   - Portal도 제한적 사용
   - 대부분 CSS transition + React hooks

2. **DX 우선 원칙**
   - Core에서 대부분 해결 가능해야 함
   - 과도한 분리는 import 경로 복잡도만 증가

3. **실용성**
   - Form 서브패키지는 이미 잘 작동 중
   - Navigation, Feedback만 추가해도 충분

4. **유지보수성**
   - 서브패키지가 적을수록 관리 용이
   - Core 90% / Subpackages 10% 구도도 나쁘지 않음

---

### 구체적 제안

#### 1단계: 최소 분리 (지금)
- ✅ `@hua-labs/ui/navigation` - PageNavigation, PageTransition, Sidebar Navigation
- ✅ `@hua-labs/ui/feedback` - Toast (Provider 패턴)

#### 2단계: 번들 크기 측정 후 결정 (나중에)
- 번들 크기 분석 도구로 실제 무게 확인
- 사용 빈도 통계 수집
- 필요시 추가 분리

---

## 📊 비교표

| 기준 | ChatGPT 제안 | 제 제안 (옵션 A) |
|------|-------------|----------------|
| **서브패키지 수** | 5개 (Overlay, Navigation, Interactive, Feedback, Scroll) | 2개 (Navigation, Feedback) |
| **Core 비율** | 80% | 90% |
| **분리 기준** | 가정 기반 (motion + portal) | 실제 구현 기반 + 사용 빈도 |
| **DX** | 좋음 | 더 좋음 (import 경로 단순) |
| **번들 최적화** | 좋음 | 중간 (하지만 실제로는 큰 차이 없을 수 있음) |
| **유지보수** | 중간 | 더 좋음 (서브패키지 적음) |

---

## 🚀 결론

ChatGPT의 **핵심 원칙 (DX 우선, Core 80% / Subpackages 20%)**은 매우 좋지만, **실제 구현을 확인한 결과 분리 필요성이 낮아 보입니다**.

**제 추천**:
1. **최소 분리**로 시작 (Navigation, Feedback만)
2. **실제 번들 크기 측정** 후 필요시 추가 분리
3. **사용 빈도 통계** 수집하여 데이터 기반 결정

이렇게 하면 DX를 해치지 않으면서도 필요시 확장 가능한 구조를 만들 수 있습니다.

---

## 📝 다음 단계

1. ✅ 실제 번들 크기 측정 (`pnpm build:analyze`)
2. ✅ 각 컴포넌트의 실제 무게 확인
3. ✅ 사용 빈도 통계 수집 (선택사항)
4. ✅ 최소 분리로 시작 (Navigation, Feedback)
5. ✅ 필요시 점진적 확장

