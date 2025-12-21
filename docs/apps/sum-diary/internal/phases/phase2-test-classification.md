# Phase 2: 테스트 파일 분류

## 📋 테스트 파일 분류 기준

### ✅ 자주 쓰거나 할 것 같은 테스트 (scripts/tests 유지)
1. **test-hua-ai-analysis.ts**
   - 현재 사용 중인 `hua-ai-service.ts` 테스트
   - 프로덕션 서비스 검증용
   - ✅ 유지

2. **test-provider-retrieval.ts**
   - AI 프로바이더 설정 조회 테스트
   - 설정 변경 시 자주 사용
   - ✅ 유지

3. **test-emotion-flow-count.ts**
   - 감정 플로우 개수 테스트
   - 분석 로직 검증용
   - ✅ 유지

4. **test-crisis-detection.ts**
   - 위기 감지 시스템 테스트
   - 중요한 기능 검증
   - ✅ 유지

5. **test-crisis-escalation.ts**
   - 위기 에스컬레이션 테스트
   - 중요한 기능 검증
   - ✅ 유지

### 🗄️ 레거시/다시 안 쓸 것 같은 테스트 (_reference로 이동)
1. **test-emotion-analysis.ts**
   - 레거시 `emotion-engine.ts` 사용
   - `hua-ai-service.ts`로 대체됨
   - ❌ _reference로 이동

2. **src/lib/emotion/emotion-engine.ts**
   - 레거시 감정 분석 엔진
   - `hua-ai-service.ts`로 대체됨
   - ❌ _reference로 이동

## 📝 작업 계획

1. `src/lib/emotion/emotion-engine.ts` → `app/_reference/emotion-engine.ts`
2. `scripts/tests/test-emotion-analysis.ts` → `app/_reference/test-emotion-analysis.ts`
3. `package.json`에서 `test:emotion-analysis` 스크립트 제거
4. `package.json`의 `test:all`에서 `test:emotion-analysis` 제거
5. `src/` 폴더 제거 (비어있음)

