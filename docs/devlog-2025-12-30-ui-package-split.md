# Devlog: UI Package Core/Pro 분리 및 배포 준비

**Date**: 2025-12-30  
**Author**: HUA Labs Team  
**Category**: Infrastructure, Package Management

## 개요 / Overview

UI 패키지를 Core와 Pro로 분리하여 상업적 기능을 보호하고, 퍼블릭 레포로 Core를 이동하는 작업을 완료했습니다.

We completed splitting the UI package into Core and Pro to protect commercial features and moved Core to the public repository.

## 주요 작업 내용 / Key Work Items

### 1. UI 패키지 Core/Pro 분리 / UI Package Core/Pro Split

#### 1.1 Pro 패키지 생성
- **새 패키지**: `packages/hua-ui-pro/` 생성
- **구성 파일**:
  - `package.json`: `@hua-labs/ui-pro` 패키지 설정
  - `tsup.config.ts`: 빌드 설정 (소스맵 제거, 최소화 활성화)
  - `tsconfig.json`: TypeScript 설정
  - `.npmignore`: 소스 코드 제외, `dist`만 배포

#### 1.2 Pro 컴포넌트 이동
다음 컴포넌트들을 Core에서 Pro로 이동:
- **Dashboard 컴포넌트**: `src/components/dashboard/` 전체 폴더
  - `StatCard`, `DashboardGrid`, `ActivityFeed`, `TransactionsTable` 등
- **Emotion 분석 컴포넌트**: `EmotionAnalysis.tsx`, `EmotionMeter.tsx`, `EmotionSelector.tsx`, `EmotionButton.tsx`
- **기타 Pro 컴포넌트**: `StatsPanel.tsx`, `SectionHeader.tsx`

#### 1.3 Core UI 정리
- `packages/hua-ui/src/advanced.ts` 삭제
- `package.json`과 `tsup.config.ts`에서 `advanced` exports/entries 제거
- Core 컴포넌트만 남김 (Bookmark, ChatMessage, LanguageToggle, ScrollIndicator 등)

### 2. Import 경로 수정 / Import Path Fixes

#### 2.1 문제점
Pro 컴포넌트들이 Core UI의 상대 경로를 참조하고 있어 패키지 분리 후 모듈 해결 실패

#### 2.2 해결 방법
- **자동화 스크립트**: `packages/hua-ui-pro/scripts/fix-imports.js` 생성
- **변경 사항**:
  - `../../lib/utils` → `@hua-labs/ui`
  - `../Icon`, `../Card`, `../Skeleton` → `@hua-labs/ui`
  - `../../lib/styles/colors`, `../../lib/styles/variants` → `@hua-labs/ui`
  - `../../lib/types/common` → `@hua-labs/ui`

#### 2.3 타입 Import 수정
- `type Color`, `type IconName` 등 타입 import를 명시적으로 수정
- 모든 Pro 컴포넌트의 import 경로를 `@hua-labs/ui`로 통일

### 3. TypeScript 타입 충돌 해결 / TypeScript Type Conflicts Resolution

#### 3.1 TransitionType 충돌
**문제**: `TransitionType`이 세 곳에서 정의되어 충돌 발생
- `@hua-labs/motion-core`의 `TransitionType`
- `packages/hua-ui/src/components/advanced/AdvancedPageTransition.tsx`의 로컬 `TransitionType`
- `packages/hua-ux`에서 두 타입을 모두 사용하려고 시도

**해결**:
- `AdvancedPageTransition.tsx`의 `TransitionType`을 `AdvancedPageTransitionType`으로 변경
- `usePageTransition.ts`와 `usePageTransitionManager.ts`에서도 동일하게 변경
- `packages/hua-ux/src/index.ts`에서 `TransitionType` re-export 제거

#### 3.2 중복 Export 제거
- `packages/hua-ui/src/index.ts`에서 `useColorStyles`, `createColorStyles`, `IconProps` 등 중복 export 제거
- 타입과 유틸리티를 한 곳에서만 export하도록 정리

### 4. UX 프레임워크 통합 / UX Framework Integration

#### 4.1 Pro 패키지 의존성 추가
- `packages/hua-ux/package.json`에 `@hua-labs/ui-pro: workspace:*` 추가

#### 4.2 Pro 컴포넌트 Re-export
- `packages/hua-ux/src/framework/index.ts`에서 일반용 Pro 컴포넌트만 re-export
  - `StatCard`, `DashboardGrid` 등 일반용 컴포넌트
  - 결제/정산 전용 컴포넌트는 re-export하지 않음 (주석으로 명시)

### 5. 퍼블릭 레포 이동 / Public Repository Migration

#### 5.1 Core UI 복사
- `packages/hua-ui/` → `C:\HUA-Labs-public\packages\hua-ui/` 복사
- `robocopy` 사용하여 `node_modules`, `dist`, `.git` 제외

#### 5.2 Pro 파일 제거
퍼블릭 레포의 Core UI에서 Pro 관련 파일 제거:
- `src/components/dashboard/` 폴더 삭제
- `Emotion*.tsx` 파일 삭제
- `StatsPanel.tsx`, `SectionHeader.tsx` 삭제
- `src/advanced/` 폴더 삭제 (이미 Core에서 제거됨)

#### 5.3 package.json 정리
- `package.json`의 `exports`에서 `./components/advanced/*` 제거

#### 5.4 빌드 스크립트 수정
- 퍼블릭 레포의 빌드 스크립트를 `pnpm exec tsup && pnpm exec tsc --emitDeclarationOnly`로 변경
- Private 레포와 동일한 빌드 방식으로 통일

### 6. 빌드 검증 / Build Verification

#### 6.1 Private 레포
- ✅ `packages/hua-ui`: 빌드 성공
- ✅ `packages/hua-ui-pro`: 빌드 성공 (소스맵 제거 확인)
- ✅ `packages/hua-ux`: 빌드 성공 (Pro 의존성 포함)

#### 6.2 Public 레포
- ✅ `C:\HUA-Labs-public\packages\hua-ui`: 빌드 성공
- 의존성 설치 후 정상 빌드 확인

## 아이콘 프로바이더 개선 확인 / Icon Provider Improvements Review

### 현재 상태 / Current Status

#### IconProvider 패턴
- **Provider 패턴**: React Context API 기반
- **기본 동작**: IconProvider 없이도 사용 가능 (기본값 자동 적용)
- **지원 세트**: Lucide (기본), Phosphor, Iconsax (준비 중)

#### 주요 기능 / Key Features
1. **전역 아이콘 설정**: IconProvider로 한 번 설정하면 전체 앱에 적용
2. **다중 아이콘 세트 지원**: Lucide, Phosphor 자동 매핑
3. **Tree-shaking 지원**: 실제 사용되는 아이콘만 번들에 포함
4. **SSR 안전**: hydration mismatch 방지
5. **애니메이션 지원**: `spin`, `pulse`, `bounce` prop
6. **Variant 지원**: `primary`, `success`, `error` 등 자동 색상 적용

#### 개선 사항 확인 / Improvements Verified
- ✅ IconProvider 없이도 사용 가능 (기본값: `phosphor`, `regular`, `size: 20`)
- ✅ 타입 안전성: `IconName` 타입으로 컴파일 타임 체크
- ✅ SSR 안전: 클라이언트에서만 렌더링하여 hydration 오류 방지
- ✅ 다중 라이브러리 통합: 하나의 `<Icon>` 컴포넌트로 모든 라이브러리 사용
- ✅ 아이콘 이름 매핑: 라이브러리마다 다른 이름을 하나의 이름으로 통일
- ✅ Alias 지원: `back`, `prev`, `gear`, `spinner` 등 직관적인 이름

### 문서화 상태 / Documentation Status
- ✅ `packages/hua-ui/docs/ICON_SYSTEM.md`: 상세한 사용법 및 아키텍처 문서화 완료
- ✅ 예제 코드 및 비교 테이블 포함
- ✅ SSR 주의사항 및 권장사항 명시

## 기술적 세부사항 / Technical Details

### 빌드 설정 / Build Configuration

#### Pro 패키지 보호 / Pro Package Protection
```typescript
// tsup.config.ts
{
  sourcemap: false,  // 소스맵 제거
  minify: true,      // 코드 최소화
  treeshake: true,   // Tree-shaking
  files: ["dist"]    // dist만 배포
}
```

#### .npmignore 설정
```
src/
*.ts
*.tsx
tsconfig.json
tsup.config.ts
*.test.ts/tsx
README.md
```

### 의존성 구조 / Dependency Structure

```
@hua-labs/hua-ux
├── @hua-labs/ui (Core) - Public
└── @hua-labs/ui-pro (Pro) - Private/Built only
    └── @hua-labs/ui (Core) - Peer dependency
```

## 배포 준비 상태 / Deployment Readiness

### 완료된 작업 / Completed Tasks
- ✅ Core UI 퍼블릭 레포로 복사
- ✅ Pro 파일 제거 확인
- ✅ Core UI 빌드 성공
- ✅ Pro 패키지 빌드 성공
- ✅ UX 프레임워크 빌드 성공 (Pro 의존성 포함)
- ✅ 데브로그 작성 완료

### 배포 전 체크리스트 / Pre-Deployment Checklist

#### Pro 패키지 배포 준비
- ✅ 빌드 완료 (`dist` 폴더 존재)
- ✅ `.npmignore` 설정 확인 (소스 코드 제외)
- ✅ `package.json` 설정 확인 (`files: ["dist"]`)
- ⏳ npm 레지스트리 설정 확인 필요
- ⏳ 버전 번호 확인 필요

#### UX 프레임워크 배포 준비
- ✅ 빌드 성공
- ⏳ 의존성 `workspace:*` → npm 버전으로 변경 필요
- ⏳ 퍼블릭 레포로 복사 필요
- ⏳ 버전 번호 확인 필요

### 남은 작업 / Remaining Tasks
- [ ] Pro 패키지 npm 배포 (`npm publish` - 빌드된 `dist`만 배포)
- [ ] UX 프레임워크 의존성 업데이트 (`workspace:*` → npm 버전)
- [ ] UX 프레임워크 퍼블릭 레포로 복사
- [ ] UX 프레임워크 빌드 및 배포

## 학습한 교훈 / Lessons Learned

### 1. PowerShell 명령어 주의사항
- `&&` 연산자는 PowerShell에서 작동하지 않음 → `;` 사용
- `xcopy` 대신 `robocopy` 사용 권장 (더 안정적)

### 2. Import 경로 수정 자동화
- 수동 수정은 실수 가능성 높음
- Node.js 스크립트로 자동화하는 것이 효율적
- 정규식 기반 일괄 치환으로 일관성 유지

### 3. 타입 충돌 해결
- 동일한 이름의 타입이 여러 패키지에 있을 때 명시적 이름 변경 필요
- Re-export 시 충돌 가능성 고려

### 4. 빌드 순서 중요성
- 의존성 패키지를 먼저 빌드해야 함
- `@hua-labs/ui-pro` 빌드 → `@hua-labs/hua-ux` 빌드 순서 필수

## 다음 단계 / Next Steps

1. **Pro 패키지 배포**
   - Private npm 레지스트리 또는 빌드된 파일만 배포
   - 소스 코드 보호 확인

2. **UX 프레임워크 의존성 업데이트**
   - `workspace:*` → 실제 npm 버전으로 변경
   - 배포 전 테스트

3. **문서 업데이트**
   - Pro 컴포넌트 사용 가이드
   - 라이선스 정보 명시

4. **CI/CD 통합**
   - 자동 빌드 및 배포 파이프라인
   - 버전 관리 자동화

## 관련 파일 / Related Files

- `packages/hua-ui-pro/`: Pro 패키지 소스
- `packages/hua-ui/`: Core 패키지 소스
- `packages/hua-ux/`: UX 프레임워크
- `C:\HUA-Labs-public\packages\hua-ui/`: 퍼블릭 Core UI
- `packages/hua-ui/docs/ICON_SYSTEM.md`: 아이콘 시스템 문서

## 참고 / References

- [UI Package Strategy](./packages/hua-ui/UI_PACKAGE_STRATEGY.md)
- [Pro Code Protection](./packages/hua-ui/PRO_CODE_PROTECTION.md)
- [Icon System Documentation](./packages/hua-ui/docs/ICON_SYSTEM.md)
