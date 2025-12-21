# 코드베이스 정리 계획

## 📋 목표

기능 확장을 멈추고 코드베이스 정리 작업을 진행합니다.
- 코드 스플리팅
- 안 쓰는 파일 정리/백업
- 리팩토링

## 🔍 현재 상태 분석

### 1. Deprecated 코드

#### `app/lib/hua-api.ts` ⚠️
- **상태**: `@deprecated` 표시됨
- **대체**: `diary-analysis-service.ts` 사용 권장
- **사용처**: 
  - `app/api/diary/route.ts`
  - `app/api/diary/create/route.ts`
  - `app/api/diary/[id]/analyze-emotion/route.ts`
- **작업**: 
  - [ ] 모든 사용처를 `diary-analysis-service.ts`로 마이그레이션
  - [ ] `hua-api.ts` 제거 또는 `_reference/`로 이동

### 2. 중복/불필요한 파일

#### 일기 작성 API 중복 🔄
- **현재**: 
  - `/api/diary/route.ts` (POST) - 게스트 지원 포함
  - `/api/diary/create/route.ts` - 더 복잡한 구현
- **사용처**: 
  - `diary/write/page.tsx` → `/api/diary/create` 사용
  - `/api/diary` POST → 사용처 확인 필요
- **작업**: 
  - [ ] `/api/diary` POST 사용처 확인
  - [ ] 통합 또는 역할 분리 결정
  - [ ] 중복 로직 제거

#### 폴더 구조 중복 가능성
- **`src/lib/emotion/emotion-engine.ts`** vs **`app/lib/`** 내 감정 관련 파일들
- **작업**: 
  - [ ] `src/` 폴더 사용 여부 확인
  - [ ] 중복 제거 또는 통합

### 3. 이미 정리된 항목 ✅

#### `app/_reference/` 폴더
- 개발/테스트용 파일들이 이미 백업됨
- 참고: `app/_reference/README.md`, `CLEANUP_SUMMARY.md`

## 📝 정리 작업 계획

### Phase 1: Deprecated 코드 제거

1. **`hua-api.ts` 마이그레이션**
   ```bash
   # 1. 사용처 확인
   grep -r "HuaApiService\|from.*hua-api" app/
   
   # 2. diary-analysis-service.ts로 교체
   # 3. 테스트
   # 4. hua-api.ts 제거 또는 백업
   ```

2. **작업 항목**:
   - [ ] `app/api/diary/route.ts` 마이그레이션
   - [ ] `app/api/diary/create/route.ts` 마이그레이션
   - [ ] `app/api/diary/[id]/analyze-emotion/route.ts` 마이그레이션
   - [ ] `hua-api.ts` 제거 또는 `_reference/`로 이동
   - [ ] 테스트 및 검증

### Phase 2: 중복 코드 통합

1. **일기 작성 API 통합**
   - [ ] `/api/diary` POST 사용처 조사
   - [ ] 통합 전략 수립
   - [ ] 게스트 제한 로직 통일
   - [ ] 중복 로직 제거
   - [ ] 테스트

2. **폴더 구조 정리**
   - [ ] `src/` 폴더 사용 여부 확인
   - [ ] `src/lib/emotion/emotion-engine.ts` 위치 결정
   - [ ] 중복 파일 제거

### Phase 3: 코드 스플리팅

1. **대형 파일 분리**
   - [ ] `diary/write/page.tsx` (1932줄) - 컴포넌트 분리
   - [ ] 큰 라이브러리 파일들 확인 및 분리

2. **동적 임포트 적용**
   - [ ] 무거운 컴포넌트 동적 로딩
   - [ ] 라이브러리 lazy loading
   - [ ] 번들 크기 최적화

### Phase 4: 미사용 파일 정리

1. **미사용 API 확인**
   - [ ] `/api/reports/generate/route.ts` 사용 여부
   - [ ] `/api/diary/extract-keywords/route.ts` 사용 여부
   - [ ] 미사용 API 제거 또는 백업

2. **미사용 컴포넌트 확인**
   - [ ] 컴포넌트 import 분석
   - [ ] 미사용 컴포넌트 제거 또는 백업

3. **미사용 유틸리티 확인**
   - [ ] `app/lib/` 내 파일들 사용 여부 확인
   - [ ] 미사용 파일 제거 또는 백업

### Phase 5: 리팩토링

1. **타입 안정성 개선**
   - [ ] `any` 타입 제거
   - [ ] 타입 정의 강화
   - [ ] 인터페이스 정리

2. **코드 품질 개선**
   - [ ] 함수 분리 및 재사용성 향상
   - [ ] 매직 넘버/문자열 상수화
   - [ ] 주석 정리 및 문서화

3. **에러 핸들링 개선**
   - [ ] 일관된 에러 처리
   - [ ] 에러 타입 정의
   - [ ] 사용자 친화적 에러 메시지

## 🗂️ 백업 전략

### 백업 위치
- **참고용**: `app/_reference/`
- **완전 삭제 전**: Git 히스토리 활용

### 백업 기준
- ✅ 확실히 미사용 → 삭제
- ⚠️ 불확실 → `_reference/`로 이동
- 📝 문서화 → `docs/`에 정리

## 📊 진행 상황 추적

### 체크리스트

#### Phase 1: Deprecated 코드 제거
- [ ] `hua-api.ts` 마이그레이션 완료
- [ ] 테스트 통과
- [ ] 문서 업데이트

#### Phase 2: 중복 코드 통합
- [ ] 일기 작성 API 통합 완료
- [ ] 폴더 구조 정리 완료

#### Phase 3: 코드 스플리팅
- [ ] 대형 파일 분리 완료
- [ ] 동적 임포트 적용 완료
- [ ] 번들 크기 측정 및 개선 확인

#### Phase 4: 미사용 파일 정리
- [ ] 미사용 API 정리 완료
- [ ] 미사용 컴포넌트 정리 완료
- [ ] 미사용 유틸리티 정리 완료

#### Phase 5: 리팩토링
- [ ] 타입 안정성 개선 완료
- [ ] 코드 품질 개선 완료
- [ ] 에러 핸들링 개선 완료

## 🚀 실행 순서

1. **Phase 1 시작** - Deprecated 코드 제거 (가장 명확한 작업)
2. **Phase 4 진행** - 미사용 파일 정리 (병렬 진행 가능)
3. **Phase 2 진행** - 중복 코드 통합
4. **Phase 3 진행** - 코드 스플리팅
5. **Phase 5 진행** - 리팩토링

## 📝 참고 문서

- `app/_reference/README.md` - 레퍼런스 폴더 설명
- `app/_reference/CLEANUP_SUMMARY.md` - 이전 정리 작업 요약
- `docs/COMPONENTS_REORGANIZATION_PLAN.md` - 컴포넌트 재구성 계획

## ⚠️ 주의사항

1. **백업 필수**: 삭제 전 반드시 백업
2. **테스트 필수**: 각 단계마다 테스트 실행
3. **점진적 진행**: 한 번에 너무 많이 변경하지 않기
4. **문서화**: 변경 사항 문서화
5. **Git 커밋**: 각 Phase별로 커밋 분리

