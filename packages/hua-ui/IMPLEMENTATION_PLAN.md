# UI 패키지 분리 구현 계획

## 워크플로우

### 전체 흐름

```
1. 패키지 분리 (Core/Pro)
   ↓
2. 정리 및 검증
   ↓
3. 퍼블릭 레포로 Core 이동
   ↓
4. Core 새로 배포
   ↓
5. Pro 빌드 → UX 프레임워크에 포함 (의존성으로)
```

---

## Phase 1: 패키지 분리 (Private Repo)

### 1.1 ComponentLayout 중복 제거

**파일:** `packages/hua-ui/src/advanced.ts`

```ts
// 제거할 것
// export { ComponentLayout } from './components/ComponentLayout';
```

**확인:**
- `src/index.ts`에 `ComponentLayout`이 있는지 확인
- `src/advanced.ts`에서 제거

---

### 1.2 Pro 패키지 생성

**새 디렉토리:** `packages/hua-ui-pro/`

**구조:**
```
packages/hua-ui-pro/
├── src/
│   ├── index.ts              # Pro 컴포넌트 export
│   ├── components/           # Pro 컴포넌트들
│   └── advanced/            # 기존 advanced 컴포넌트
├── dist/                     # 빌드된 파일 (npm 배포용)
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── .npmignore
```

**package.json:**
```json
{
  "name": "@hua-labs/ui-pro",
  "version": "0.1.0",
  "private": false,
  "files": ["dist"],
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "dependencies": {
    "@hua-labs/ui": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

**tsup.config.ts:**
```ts
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: false,  // ✅ 소스맵 제거 (Pro 보호)
    minify: true,      // ✅ 코드 최소화
    treeshake: true,
    splitting: true,
    outDir: 'dist',
    external: ['react', 'react-dom', '@hua-labs/ui'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  }
]);
```

**.npmignore:**
```
src/
*.ts
*.tsx
!dist/**/*.d.ts
tsconfig.json
tsup.config.ts
```

---

### 1.3 Core에서 Advanced 제거

**파일:** `packages/hua-ui/src/advanced.ts`

**작업:**
- `src/advanced.ts` 파일 삭제 또는 비우기
- `package.json`에서 `advanced` export 제거
- `tsup.config.ts`에서 `advanced` entry 제거

**확인:**
- `src/index.ts`는 Core 컴포넌트만 export
- Advanced 컴포넌트는 모두 Pro 패키지로 이동

---

### 1.4 Pro 컴포넌트 이동

**이동할 컴포넌트:**
- `packages/hua-ui/src/advanced/` → `packages/hua-ui-pro/src/components/`
- `packages/hua-ui/src/advanced.ts` → `packages/hua-ui-pro/src/index.ts`

**Pro 컴포넌트 분류:**

#### 일반용 Pro (프레임워크에 포함)
- `StatCard`
- `QuickActionCard`
- `DashboardGrid`
- `ActivityFeed`
- `ProfileCard`
- `MembershipBadge`
- `MiniBarChart`
- `SummaryCard`
- `NotificationCard`
- `MetricCard`
- `ProgressCard`
- `DashboardEmptyState`

#### 결제/정산 전용 Pro (Pro 전용)
- `TransactionsTable`
- `TransactionDetailDrawer`
- `SettlementTimeline`
- `RoutingBreakdownCard`
- `MerchantList`
- `DashboardToolbar` (결제용)
- `DashboardSidebar` (결제용)
- `TrendChart` (결제 데이터용)
- `BarChart` (결제 데이터용)

#### 감정 분석 Pro
- `EmotionAnalysis`
- `EmotionButton`
- `EmotionMeter`
- `EmotionSelector`

---

## Phase 2: UX 프레임워크 통합

### 2.1 의존성 추가

**파일:** `packages/hua-ux/package.json`

```json
{
  "dependencies": {
    "@hua-labs/ui": "workspace:*",
    "@hua-labs/ui-pro": "workspace:*"  // ✅ 추가
  }
}
```

---

### 2.2 Pro 컴포넌트 Re-export

**파일:** `packages/hua-ux/src/framework/index.ts`

```ts
// Core UI (기존)
export * from '@hua-labs/ui';

// Pro UI (일반용만 re-export)
export {
  StatCard,
  QuickActionCard,
  DashboardGrid,
  ActivityFeed,
  ProfileCard,
  MembershipBadge,
  MiniBarChart,
  SummaryCard,
  NotificationCard,
  MetricCard,
  ProgressCard,
  DashboardEmptyState,
} from '@hua-labs/ui-pro';

// 결제/정산 전용 Pro는 re-export 안 함
// 사용자는 직접 @hua-labs/ui-pro에서 import
```

---

## Phase 3: 퍼블릭 레포 이동

### 3.1 Core UI 이동

**작업:**
1. `packages/hua-ui/` (Core만) → `C:\HUA-Labs-public\packages\hua-ui/`
2. Advanced 관련 파일 제거 확인
3. `package.json` 정리 (advanced export 제거)
4. `tsup.config.ts` 정리 (advanced entry 제거)

**확인:**
- `src/advanced.ts` 제거됨
- `src/advanced/` 디렉토리 제거됨
- `package.json` exports에 advanced 없음

---

### 3.2 Core UI 배포

**작업:**
1. 빌드: `pnpm build` (Core만)
2. npm 배포: `npm publish` (public)
3. 버전 확인

---

## Phase 4: Pro 패키지 배포

### 4.1 Pro 빌드

**작업:**
```bash
cd packages/hua-ui-pro
pnpm build
```

**확인:**
- `dist/` 폴더에 빌드된 파일만 있음
- 소스맵 없음 (`sourcemap: false`)
- 코드 최소화됨 (`minify: true`)

---

### 4.2 Pro 배포 (선택사항)

**옵션 1: Public npm (빌드된 파일만)**
- 소스 코드는 private repo에만
- 빌드된 `dist`만 npm에 배포
- `files: ["dist"]` 설정으로 소스 제외

**옵션 2: Private npm Package**
- npm 유료 플랜 필요
- 인증된 사용자만 설치 가능

**옵션 3: Private Registry**
- GitHub Packages
- AWS CodeArtifact
- 등등

---

## Phase 5: UX 프레임워크 업데이트

### 5.1 의존성 업데이트

**파일:** `packages/hua-ux/package.json`

```json
{
  "dependencies": {
    "@hua-labs/ui": "^0.1.0",        // ✅ Core (public npm)
    "@hua-labs/ui-pro": "^0.1.0"     // ✅ Pro (private 또는 public)
  }
}
```

---

### 5.2 빌드 및 배포

**작업:**
1. `pnpm build`
2. `npm publish` (public)

**확인:**
- UX 프레임워크가 Pro 컴포넌트를 re-export
- 사용자는 `@hua-labs/hua-ux`에서 일반용 Pro 사용 가능
- 결제/정산 전용 Pro는 `@hua-labs/ui-pro`에서 직접 import

---

## 체크리스트

### Phase 1: 패키지 분리
- [ ] `ComponentLayout` 중복 제거
- [ ] `packages/hua-ui-pro/` 패키지 생성
- [ ] Pro 컴포넌트 이동
- [ ] Core에서 Advanced 제거
- [ ] Pro 패키지 빌드 테스트

### Phase 2: UX 프레임워크 통합
- [ ] `@hua-labs/ui-pro` 의존성 추가
- [ ] 일반용 Pro re-export
- [ ] 빌드 테스트

### Phase 3: 퍼블릭 레포 이동
- [ ] Core UI 퍼블릭 레포로 이동
- [ ] Advanced 관련 파일 제거 확인
- [ ] Core UI 배포

### Phase 4: Pro 패키지 배포
- [ ] Pro 빌드 (소스맵 제거, 최소화)
- [ ] Pro 배포 (선택한 방식)

### Phase 5: UX 프레임워크 업데이트
- [ ] 의존성 업데이트
- [ ] 빌드 및 배포

---

## 주의사항

### Pro 코드 보호
- ✅ 소스 코드는 private repo에만
- ✅ 빌드된 `dist`만 npm 배포
- ✅ `sourcemap: false`
- ✅ `minify: true`
- ✅ `files: ["dist"]` 설정

### 의존성 관리
- Pro는 Core에 의존 (`@hua-labs/ui`)
- UX 프레임워크는 Core + Pro에 의존
- 사용자는 필요한 것만 설치

### 트리쉐이킹
- 각 패키지가 독립적으로 트리쉐이킹 가능
- 사용하지 않는 컴포넌트는 번들에서 제외

---

## 다음 단계

1. **즉시 시작:** Phase 1 (패키지 분리)
2. **검증:** 각 Phase마다 빌드 및 테스트
3. **배포:** Core → Pro → UX 프레임워크 순서
