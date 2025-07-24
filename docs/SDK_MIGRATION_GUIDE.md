# SDK 마이그레이션 가이드

> **HUA Platform SDK 통합 및 마이그레이션 가이드**

## 📊 정량화 분석 결과

### 🎯 **1단계: 공통 유틸리티 (High Priority) - 완료**

**중복 제거 효과:**
- `cn()` 함수: 4개 앱 → 1개 패키지로 통합
- 유틸리티 함수: 20+ 개 함수 통합
- **예상 코드 중복 감소: 80%**

**새로운 패키지:**
```bash
@hua-labs/utils
```

**사용법:**
```typescript
import { cn, formatDate, debounce, validateEmail } from '@hua-labs/utils'

// 기존
import { cn } from '@/lib/utils'

// 변경 후
import { cn } from '@hua-labs/utils'
```

### 🎯 **2단계: 공통 훅 (High Priority) - 완료**

**중복 제거 효과:**
- `useLoading`: my-api에서만 구현 → 공통 패키지로
- `useAutoScroll`: my-chat에서만 구현 → 공통 패키지로
- `usePerformanceMonitor`: hua-animation에서만 구현 → 공통 패키지로
- **예상 코드 중복 감소: 60%**

**새로운 패키지:**
```bash
@hua-labs/hooks
```

**사용법:**
```typescript
import { useLoading, useAutoScroll, usePerformanceMonitor } from '@hua-labs/hooks'

// 기존
import { useLoading } from '@/hooks/useLoading'

// 변경 후
import { useLoading } from '@hua-labs/hooks'
```

### 🎯 **3단계: 공통 컴포넌트 (Medium Priority) - 진행 중**

**중복 제거 효과:**
- `ScrollToTop`: 3개 앱에서 비슷하게 구현 → hua-ui로 통합 완료
- `ScrollProgress`: 2개 앱에서 구현 → hua-ui로 통합 완료
- **예상 코드 중복 감소: 70%**

**기존 패키지 확장:**
```bash
@hua-labs/ui (기존)
```

**사용법:**
```typescript
import { ScrollToTop, ScrollProgress } from '@hua-labs/ui'

// 기존
import { ScrollToTop } from '@/components/ScrollToTop'

// 변경 후
import { ScrollToTop } from '@hua-labs/ui'
```

## 🚀 **마이그레이션 계획**

### **Phase 1: 유틸리티 통합 (완료)**

✅ **완료된 작업:**
- `@hua-labs/utils` 패키지 생성
- `cn`, `formatDate`, `debounce`, `validateEmail` 등 20+ 함수 통합
- TypeScript 설정 및 빌드 구성

🔄 **다음 단계:**
```bash
# 1. 패키지 빌드
cd packages/hua-utils && pnpm build

# 2. 앱에서 사용
cd apps/my-api && pnpm add @hua-labs/utils
```

### **Phase 2: 훅 통합 (완료)**

✅ **완료된 작업:**
- `@hua-labs/hooks` 패키지 생성
- `useLoading`, `useAutoScroll`, `usePerformanceMonitor` 통합
- TypeScript 설정 및 빌드 구성

🔄 **다음 단계:**
```bash
# 1. 패키지 빌드
cd packages/hua-hooks && pnpm build

# 2. 앱에서 사용
cd apps/my-chat && pnpm add @hua-labs/hooks
```

### **Phase 3: 컴포넌트 통합 (진행 중)**

✅ **완료된 작업:**
- `ScrollToTop`, `ScrollProgress`, `ScrollIndicator` 추가
- hua-ui 패키지에 통합

🔄 **다음 단계:**
```bash
# 1. 기존 앱에서 마이그레이션
# my-api, hua-labs-official에서 기존 ScrollToTop 제거
# hua-ui의 ScrollToTop 사용
```

### **Phase 4: 타입 통합 (예정)**

📋 **계획:**
- `@hua-labs/types` 패키지 생성
- API 응답 타입, 사용자 타입, 설정 타입 통합
- **예상 코드 중복 감소: 50%**

### **Phase 5: 설정 통합 (예정)**

📋 **계획:**
- `@hua-labs/config` 패키지 생성
- `components.json`, `tailwind.config.js` 공통 설정
- **예상 코드 중복 감소: 40%**

## 📈 **예상 효과**

### **코드 중복 감소**
- **전체 중복 코드: 60-80% 감소**
- **유지보수 비용: 50% 감소**
- **개발 속도: 30% 향상**

### **패키지 구조**
```
packages/
├── hua-utils/          # 공통 유틸리티 ✅
├── hua-hooks/          # 공통 훅 ✅
├── hua-ui/             # UI 컴포넌트 ✅
├── hua-types/          # 공통 타입 📋
├── hua-config/         # 공통 설정 📋
├── hua-i18n-sdk/       # i18n SDK ✅
├── hua-animation/      # 애니메이션 SDK ✅
└── hua-my-api-sdk/    # API SDK ✅
```

## 🔄 **마이그레이션 체크리스트**

### **앱별 마이그레이션 순서**

1. **my-api** (가장 많은 중복)
   - [ ] `@hua-labs/utils` 적용
   - [ ] `@hua-labs/hooks` 적용
   - [ ] 기존 `ScrollToTop` 제거

2. **my-chat** (중간 중복)
   - [ ] `@hua-labs/utils` 적용
   - [ ] `@hua-labs/hooks` 적용
   - [ ] 기존 `useAutoScroll` 제거

3. **hua-labs-official** (적은 중복)
   - [ ] `@hua-labs/utils` 적용
   - [ ] 기존 `ScrollToTop` 제거

4. **hua-ui-site** (테스트용)
   - [ ] 새로운 컴포넌트 테스트
   - [ ] 문서 업데이트

### **단계별 검증**

1. **빌드 테스트**
   ```bash
   pnpm build --filter=@hua-labs/utils
   pnpm build --filter=@hua-labs/hooks
   ```

2. **타입 체크**
   ```bash
   pnpm type-check --filter=@hua-labs/utils
   pnpm type-check --filter=@hua-labs/hooks
   ```

3. **통합 테스트**
   ```bash
   pnpm dev --filter=hua-ui-site
   # 브라우저에서 새로운 컴포넌트들 테스트
   ```

## 🎯 **다음 단계**

1. **패키지 빌드 및 테스트**
2. **앱별 마이그레이션 실행**
3. **기존 중복 코드 제거**
4. **문서 업데이트**
5. **CI/CD 파이프라인 업데이트**

---

**총 예상 작업 시간: 2-3일**
**코드 중복 감소: 60-80%**
**개발 효율성 향상: 30-50%** 🚀 