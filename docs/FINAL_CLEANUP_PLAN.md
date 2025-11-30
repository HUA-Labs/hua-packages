# 최종 정리 계획 (Final Cleanup Plan)

## 📋 확인된 상태

### i18n 패키지 상태
- ✅ **`hua-i18n-core`** - 제대로 된 것 (유지)
- ⚠️ **`hua-i18n-sdk`** - deprecated, v2.0.0에서 제거 예정
- ❌ **`hua-i18n-beginner`** - 나중에 다시 해야 함
- ❌ **`hua-i18n-advanced`** - 나중에 다시 해야 함
- ❌ **`hua-i18n-ai`** - 나중에 다시 해야 함
- ❌ **`hua-i18n-debug`** - 나중에 다시 해야 함
- ❌ **`hua-i18n-plugins`** - 나중에 다시 해야 함

### 앱 상태
- ✅ **`my-api`** - 프로덕션 앱 (빌드 성공)
- ✅ **`my-chat`** - 프로덕션 앱 (빌드 성공)
- ⚠️ **`my-app`** - 프로덕션 앱 (빌드 실패, 수정 필요)
- ❌ **`i18n-test`** - 테스트 앱 (나중에 다시 해야 함)
- ❌ **`hua-motion`** - 개발 앱 (빌드 실패)
- ✅ **`hua-demo`** - API SDK 데모 (유지, 삭제 안 함)
- ❌ **`hua-labs`** - 기본 템플릿 (삭제 대상)
- ⚠️ **`hua-ui`** - UI 패키지 사이트 (Storybook과 중복 검토 필요)

## 🎯 최종 정리 계획

### Phase 1: 즉시 삭제 (10분)

#### 1.1 앱 삭제
- **`apps/hua-labs`** 삭제
  - 기본 Next.js 템플릿
  - 실제 사용 안 함
  - 필요시 `create-next-app`으로 재생성 가능

#### 1.2 의존성 정리
- `pnpm-workspace.yaml`에서 `hua-labs` 제거
- 루트 `package.json`에서 관련 스크립트 제거 (있는 경우)

### Phase 2: 필수 수정 (30분)

#### 2.1 프로덕션 앱 빌드 수정
- **`apps/my-app`** 빌드 수정
  - 타입 에러: `nickname_hash` 속성 추가
  - 빌드 성공 확인

### Phase 3: 선택적 정리 (나중에)

#### 3.1 i18n 패키지 정리 (나중에)
- `hua-i18n-beginner`, `hua-i18n-advanced`, `hua-i18n-ai`, `hua-i18n-debug`, `hua-i18n-plugins`
  - 현재 상태: 나중에 다시 해야 함
  - 액션: 일단 유지, 나중에 재작업 시 정리

#### 3.2 테스트 앱 정리 (나중에)
- **`apps/i18n-test`**
  - 현재 상태: 나중에 다시 해야 함
  - 액션: 일단 유지, 나중에 재작업 시 정리

#### 3.3 개발 앱 정리 (나중에)
- **`apps/hua-motion`**
  - 현재 상태: 빌드 실패
  - 액션: 개발 중이면 수정, 아니면 삭제 검토

#### 3.4 UI 사이트 검토 (나중에)
- **`apps/hua-ui`**
  - 현재 상태: Storybook과 중복 가능성
  - 액션: Storybook 완성 후 중복 여부 확인하여 결정

## 📝 실행 계획

### 즉시 실행 (오늘)

```bash
# 1. hua-labs 삭제
rm -rf apps/hua-labs

# 2. workspace 설정 확인
# pnpm-workspace.yaml 확인 및 수정

# 3. my-app 빌드 수정
cd apps/my-app
# nickname_hash 타입 에러 수정
pnpm build
```

### 나중에 (선택적)

1. i18n 패키지 재작업 시 정리
2. 테스트 앱 재작업 시 정리
3. 개발 앱 상태 확인 후 결정

## ✅ 유지할 항목

- **`hua-demo`** - API SDK 데모 (삭제 안 함)
- **`hua-i18n-core`** - 제대로 된 i18n 코어 (유지)
- **프로덕션 앱들** - `my-api`, `my-chat`, `my-app`

## 🗑️ 삭제 대상

- **`apps/hua-labs`** - 기본 템플릿 (즉시 삭제)

## ⏸️ 보류 대상 (나중에 결정)

- **i18n 패키지들** (beginner, advanced, ai, debug, plugins)
- **`apps/i18n-test`**
- **`apps/hua-motion`**
- **`apps/hua-ui`**

## 📊 예상 시간

- Phase 1 (삭제): **10분**
- Phase 2 (수정): **30분**
- **총 시간: ~40분**

## 🎯 최종 목표

1. ✅ 불필요한 코드 제거
2. ✅ 프로덕션 앱 정상 작동
3. ✅ 코드베이스 정리
4. ✅ 향후 작업 준비
