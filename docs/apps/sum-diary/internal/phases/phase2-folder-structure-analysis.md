# Phase 2: 폴더 구조 분석

## 📁 `src/` vs `app/lib/` 비교

### 현재 상태

#### `src/lib/emotion/emotion-engine.ts`
- **상태**: 테스트 스크립트에서만 사용
- **사용처**: `scripts/tests/test-emotion-analysis.ts`
- **의존성**: `app/lib/hua-ai-service.ts` 사용
- **프로덕션 사용**: ❌ 없음

#### `app/lib/hua-ai-service.ts`
- **상태**: 프로덕션 코드에서 사용 중
- **사용처**: `app/api/hua-emotion-analysis/route.ts`
- **기능**: HUA AI 감정 분석 서비스

### 분석 결과

1. **`src/lib/emotion/emotion-engine.ts`**
   - 테스트 전용 코드
   - `hua-ai-service.ts`를 래핑하는 레이어
   - 프로덕션에서 직접 사용되지 않음

2. **중복 여부**
   - ❌ 중복 아님
   - `emotion-engine.ts`는 테스트용 래퍼
   - `hua-ai-service.ts`는 실제 서비스

### 제안 사항

#### 옵션 1: 테스트 파일로 이동 (권장)
- `src/lib/emotion/emotion-engine.ts` → `scripts/tests/emotion-engine.ts`
- 테스트 스크립트와 함께 관리
- `src/` 폴더 제거 가능

#### 옵션 2: 레퍼런스 폴더로 이동
- `src/lib/emotion/emotion-engine.ts` → `app/_reference/emotion-engine.ts`
- 참고용으로 보관

#### 옵션 3: 유지
- 테스트용이지만 현재 위치 유지
- `src/` 폴더 구조 유지

### 권장: 옵션 1
- 테스트 코드는 `scripts/tests/`에 모으는 게 일관성 있음
- `src/` 폴더 제거 가능
- 코드베이스 단순화

