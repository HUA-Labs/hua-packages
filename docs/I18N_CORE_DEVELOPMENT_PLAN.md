# @hua-labs/i18n-core 개발 플랜

## 📋 목차

1. [개요](#개요)
2. [현재 상태 분석](#현재-상태-분석)
3. [개발 원칙](#개발-원칙)
4. [단계별 개발 계획](#단계별-개발-계획)
5. [구체적 작업 항목](#구체적-작업-항목)
6. [우선순위 및 일정](#우선순위-및-일정)

---

## 개요

이 개발 플랜은 `@hua-labs/i18n-core` 패키지를 정교화하기 위한 계획입니다.

### 핵심 원칙

1. **코어는 핵심 기능만**: 번역 엔진, React 훅, Provider 등 핵심 기능만 포함
2. **로더는 별도 제공**: 기본 로더는 포함하되, 프로덕션용 로더는 별도 유틸리티로 제공
3. **현재 구현 기준**: 기존 구현을 그대로 문서화하고 개선

---

## 현재 상태 분석

### ✅ 완료된 항목 (코어)

1. **핵심 기능 구현**
   - ✅ 번역 엔진 (Translator 클래스)
   - ✅ React 훅 (useTranslation, useI18n, useLanguageChange)
   - ✅ Provider 컴포넌트 (createCoreI18n)
   - ✅ SSR 지원 (ssrTranslate, serverTranslate)
   - ✅ 기본 로더 (api, static)
   - ✅ 커스텀 로더 지원

2. **성능 최적화 기능** ✅
   - ✅ 전역 캐싱 (I18nResourceManager)
   - ✅ 중복 요청 방지
   - ✅ 프리로딩 (LazyLoader)
   - ✅ 지연 로딩
   - ✅ 캐시 통계 및 관리

3. **실제 적용 사례**
   - ✅ PaysByPays 프로젝트 적용 완료
   - ✅ 프로덕션 환경 검증 완료

4. **문서화**
   - ✅ 기본 README 작성
   - ✅ API 레퍼런스 작성 (진행 중)
   - ✅ 로더 가이드 작성 (진행 중)

### ⚠️ 개선 필요 항목

1. **문서화**
   - ⚠️ API 레퍼런스 완성 (성능 최적화 기능 추가 필요)
   - ⚠️ 성능 최적화 가이드 작성
   - ⚠️ 예제 코드 추가

2. **성능 최적화 기능 문서화**
   - ⚠️ I18nResourceManager 사용법
   - ⚠️ LazyLoader 사용법
   - ⚠️ 프리로딩 전략 가이드

3. **타입 안전성** (선택적)
   - ⚠️ 번역 키 타입 체크
   - ⚠️ 자동완성 지원

4. **개발자 경험** (선택적)
   - ⚠️ 에러 메시지 개선
   - ⚠️ 디버깅 도구 강화

---

## 개발 원칙

### 코어는 핵심 기능만

- 번역 엔진 (Translator)
- React 훅 (useTranslation, useI18n)
- Provider 컴포넌트
- SSR 지원 함수
- 기본 로더 (간단한 구현만)

### 로더는 별도 제공

- 코어에는 기본 로더만 포함 (api, static)
- 프로덕션용 로더는 별도 유틸리티로 제공
- 캐싱, 프리로딩 등 고급 기능은 로더 유틸리티에 포함

### 현재 구현 기준

- 기존 구현을 그대로 문서화
- 하위 호환성 유지
- 점진적 개선

## 개발 목표

### 1. 문서화 완성 (필수)
- 완전한 API 레퍼런스
- 로더 가이드
- 실제 사용 사례

### 2. 로더 유틸리티 제공 (필수)
- 프로덕션용 로더 패키지
- 캐싱, 프리로딩 등 고급 기능
- PaysByPays 스타일 로더

### 3. 타입 안전성 (선택적)
- 번역 키 자동완성
- 타입 체크 지원

### 4. 개발자 경험 (선택적)
- 에러 메시지 개선
- 디버깅 도구 강화

---

## 단계별 개발 계획

### Phase 1: 문서화 완성 (1주) ✅

#### 목표
코어의 현재 구현을 기준으로 완전한 문서화

#### 작업 항목

**1.1 API 레퍼런스 작성** ✅
- [x] `createCoreI18n` 함수 문서화
- [x] `useTranslation` 훅 문서화
- [x] `useI18n` 훅 문서화
- [x] `Translator` 클래스 문서화
- [x] 타입 정의 문서화
- [x] 유틸리티 함수 문서화
- [x] 성능 최적화 기능 문서화 (I18nResourceManager, LazyLoader)

**1.2 로더 가이드 작성** ✅
- [x] 기본 로더 설명
- [x] 커스텀 로더 구현 가이드
- [x] 로더 유틸리티 예제
- [x] PaysByPays 스타일 로더

**1.3 사용 가이드 작성** ✅
- [x] 빠른 시작 가이드 (`I18N_CORE_QUICK_START.md`)
- [x] 기본 사용법 (빠른 시작 가이드에 포함)
- [x] 고급 사용법 (API 레퍼런스에 포함)
- [x] 성능 최적화 가이드 (`I18N_CORE_PERFORMANCE_GUIDE.md`)
- [x] 문서 인덱스 (`I18N_CORE_INDEX.md`)

**예상 산출물**:
- ✅ `docs/I18N_CORE_API_REFERENCE.md` (완료)
- ✅ `docs/I18N_CORE_LOADERS.md` (완료)
- ✅ `docs/I18N_CORE_QUICK_START.md` (완료)
- ✅ `docs/I18N_CORE_PERFORMANCE_GUIDE.md` (완료)
- ✅ `docs/I18N_CORE_INDEX.md` (완료)
- ✅ `README.md` 업데이트 (완료)

---

### Phase 2: 성능 최적화 기능 강화 (1주) ✅

#### 목표
코어에 이미 포함된 성능 최적화 기능을 더욱 강화하고 문서화

#### 작업 항목

**2.1 성능 최적화 기능 개선** ✅
- [x] I18nResourceManager 개선 (LRU/FIFO 캐시 전략, TTL 지원)
- [x] LazyLoader 개선 (우선순위 기반 프리로딩, 사용 패턴 분석)
- [x] 캐시 크기 제한 기능 강화 (LRU/FIFO 전략 지원)
- [x] 메모리 최적화 기능 개선 (만료된 캐시 자동 정리)
- [x] Translator에 전역 캐시 통합 (I18nResourceManager 연동)
- [x] 프리로딩 기능 통합 (performanceOptions 설정 지원)

**2.2 성능 최적화 가이드 작성** ✅
- [x] 캐싱 전략 가이드 (`I18N_CORE_PERFORMANCE_GUIDE.md`)
- [x] 프리로딩 전략 가이드 (`I18N_CORE_PERFORMANCE_GUIDE.md`)
- [x] 성능 벤치마크 (문서에 포함)
- [x] 베스트 프랙티스 (문서에 포함)
- [x] API export 추가 (index.ts에 성능 최적화 기능 export)

**예상 산출물**:
- 개선된 성능 최적화 기능
- 성능 최적화 가이드 문서
- 벤치마크 결과

---

### Phase 3: 타입 안전성 (선택적, 1주)

#### 목표
TypeScript를 활용한 번역 키 타입 체크 및 자동완성 지원

#### 작업 항목

**3.1 번역 키 타입 생성 유틸리티**
- [ ] 번역 파일에서 타입 자동 생성 스크립트
- [ ] 네임스페이스별 타입 추론
- [ ] 중첩 키 타입 지원

**3.2 타입 안전한 번역 함수**
- [ ] 제네릭 타입 지원
- [ ] 타입 체크 함수
- [ ] 자동완성 지원

**예상 산출물**:
- `src/types/translation-keys.ts`
- `scripts/generate-types.ts`
- 타입 안전성 예제

**참고**: 코어는 현재 구현 그대로 유지, 타입 안전성은 선택적 기능

---

### Phase 4: 개발자 경험 개선 (선택적, 1주)

#### 목표
더 나은 개발자 경험 제공

#### 작업 항목

**4.1 에러 메시지 개선**
- [ ] 사용자 친화적 에러 메시지
- [ ] 에러 복구 제안
- [ ] 에러 로깅 개선

**4.2 디버깅 도구 강화**
- [ ] MissingKeyOverlay 개선
- [ ] 번역 키 검색 기능
- [ ] 번역 상태 모니터링

**예상 산출물**:
- 개선된 디버깅 도구
- 개발자 가이드

**참고**: 코어는 현재 구현 그대로 유지, 개선은 선택적

---

### Phase 5: 테스트 및 안정화 (1주)

#### 목표
안정성 확보 및 버그 수정

#### 작업 항목

**5.1 통합 테스트 작성**
- [ ] Provider 테스트
- [ ] 훅 테스트
- [ ] Translator 클래스 테스트
- [ ] API Route 테스트

**5.2 E2E 테스트**
- [ ] 언어 전환 테스트
- [ ] 번역 로딩 테스트
- [ ] 에러 처리 테스트
- [ ] 성능 테스트

**5.3 버그 수정 및 안정화**
- [ ] 버그 수정
- [ ] 성능 개선
- [ ] 문서 업데이트
- [ ] 릴리스 노트 작성

**예상 산출물**:
- 테스트 커버리지 리포트
- 버그 수정 목록
- 릴리스 노트

---

## 구체적 작업 항목

### 1. 문서화 작업

#### 1.1 API 레퍼런스 (`docs/API_REFERENCE.md`)

```markdown
# API 레퍼런스

## createCoreI18n

### 시그니처
```typescript
function createCoreI18n(options?: I18nOptions): I18nProvider
```

### 옵션
- `defaultLanguage`: 기본 언어 (기본값: 'ko')
- `fallbackLanguage`: 폴백 언어 (기본값: 'en')
- `namespaces`: 네임스페이스 배열
- `translationLoader`: 로더 타입 ('api' | 'static' | 'custom')
- `translationApiPath`: API 경로 (기본값: '/api/translations')
- `debug`: 디버그 모드 (기본값: false)

### 예제
```typescript
const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'dashboard'],
  translationLoader: 'api',
  debug: true
});
```
```

#### 1.2 사용 가이드 (`docs/GUIDE.md`)

- 빠른 시작
- 기본 사용법
- 고급 패턴
- 마이그레이션 가이드
- 트러블슈팅

#### 1.3 예제 코드 (`docs/EXAMPLES.md`)

- Next.js 기본 예제
- React 기본 예제
- 고급 패턴 예제
- 통합 예제

### 2. 타입 안전성 작업

#### 2.1 타입 생성 스크립트

**파일**: `scripts/generate-types.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';

// 번역 파일 읽기
const translations = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../translations/ko/common.json'), 'utf-8')
);

// 타입 생성
function generateTypes(obj: any, prefix: string = ''): string {
  // 타입 생성 로직
}

// 타입 파일 생성
fs.writeFileSync(
  path.join(__dirname, '../src/types/translation-keys.ts'),
  generateTypes(translations)
);
```

#### 2.2 타입 안전한 번역 함수

**파일**: `src/hooks/useTypedTranslation.ts`

```typescript
import { useTranslation } from './useTranslation';
import type { TranslationKeys } from '../types/translation-keys';

export function useTypedTranslation() {
  const { t, tWithParams } = useTranslation();
  
  return {
    t: <K extends TranslationKeys>(key: K): string => t(key),
    tWithParams: <K extends TranslationKeys>(
      key: K,
      params?: Record<string, string | number>
    ): string => tWithParams(key, params),
  };
}
```

### 3. 성능 최적화 작업

#### 3.1 LRU 캐시 구현

**파일**: `src/core/cache.ts`

```typescript
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    const value = this.cache.get(key)!;
    // 최근 사용 항목을 맨 뒤로 이동
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
}
```

#### 3.2 우선순위 기반 프리로딩

**파일**: `src/core/preloader.ts`

```typescript
interface PreloadPriority {
  namespace: string;
  priority: 'high' | 'medium' | 'low';
}

export async function preloadWithPriority(
  language: string,
  priorities: PreloadPriority[]
): Promise<void> {
  // 우선순위별로 정렬
  const sorted = priorities.sort((a, b) => {
    const priorityMap = { high: 3, medium: 2, low: 1 };
    return priorityMap[b.priority] - priorityMap[a.priority];
  });
  
  // 우선순위대로 로드
  for (const { namespace } of sorted) {
    await loadTranslation(language, namespace);
  }
}
```

### 4. 개발자 경험 개선 작업

#### 4.1 개선된 에러 메시지

**파일**: `src/core/error-handler.ts`

```typescript
export function createUserFriendlyError(
  error: TranslationError
): UserFriendlyError {
  const messages = {
    MISSING_KEY: {
      message: `번역 키를 찾을 수 없습니다: ${error.key}`,
      suggestion: `번역 파일에 '${error.key}' 키가 있는지 확인해주세요.`,
      action: '번역 파일 업데이트'
    },
    LOAD_FAILED: {
      message: `번역 파일을 불러오는데 실패했습니다: ${error.namespace}`,
      suggestion: '네트워크 연결과 파일 경로를 확인해주세요.',
      action: '재시도'
    },
    // ...
  };
  
  return messages[error.code] || {
    message: '알 수 없는 오류가 발생했습니다.',
    suggestion: '개발자 도구를 확인해주세요.',
    action: '문의하기'
  };
}
```

#### 4.2 개선된 디버깅 도구

**파일**: `src/components/MissingKeyOverlay.tsx`

```typescript
export function MissingKeyOverlay() {
  const missingKeys = useMissingKeys();
  const [search, setSearch] = useState('');
  
  const filtered = missingKeys.filter(key =>
    key.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="missing-keys-overlay">
      <input
        type="text"
        placeholder="번역 키 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {filtered.map(key => (
          <li key={key}>
            {key}
            <button onClick={() => copyToClipboard(key)}>복사</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 우선순위 및 일정

### 우선순위 1: 문서화 (1주) ✅

**상태**: 진행 중 (80% 완료)

**작업 내용**:
- ✅ API 레퍼런스 작성
- ✅ 로더 가이드 작성
- ⚠️ 사용 가이드 작성 (진행 중)
- ⚠️ README 업데이트 (진행 중)

**산출물**:
- ✅ `docs/API_REFERENCE.md`
- ✅ `docs/I18N_CORE_LOADERS.md`
- ⚠️ `docs/GUIDE.md` (진행 중)
- ⚠️ `README.md` 업데이트 (진행 중)

### 우선순위 2: 성능 최적화 강화 (1주)

**시작일**: 문서화 완료 후
**완료일**: 2주 후

**작업 내용**:
- I18nResourceManager 개선 (LRU 캐시 등)
- LazyLoader 개선 (우선순위 기반 프리로딩)
- 성능 최적화 가이드 작성

**산출물**:
- 개선된 성능 최적화 기능
- 성능 최적화 가이드 문서

### 우선순위 3: 타입 안전성 (선택적, 1주)

**시작일**: 로더 유틸리티 완료 후
**완료일**: 3주 후

**작업 내용**:
- 타입 생성 스크립트
- 타입 안전한 번역 함수

**산출물**:
- `scripts/generate-types.ts`
- 타입 안전성 예제

### 우선순위 4: 개발자 경험 (선택적, 1주)

**시작일**: 타입 안전성 완료 후
**완료일**: 4주 후

**작업 내용**:
- 에러 메시지 개선
- 디버깅 도구 강화

**산출물**:
- 개선된 디버깅 도구
- 개발자 가이드

---

## 마일스톤

### Milestone 1: 문서화 완성 (1주) ✅
- ✅ 완전한 API 레퍼런스
- ✅ 로더 가이드
- ⚠️ 사용 가이드 (진행 중)

### Milestone 2: 성능 최적화 강화 (2주)
- ⚠️ I18nResourceManager 개선
- ⚠️ LazyLoader 개선
- ⚠️ 성능 최적화 가이드

### Milestone 3: 타입 안전성 (선택적, 3주)
- ⚠️ 타입 생성 스크립트
- ⚠️ 타입 안전한 번역 함수

### Milestone 4: 개발자 경험 (선택적, 4주)
- ⚠️ 개선된 에러 메시지
- ⚠️ 강화된 디버깅 도구

---

## 리스크 관리

### 리스크 1: 타입 생성 복잡도
**위험도**: 중간
**대응**: 단계적 구현, 간단한 버전부터 시작

### 리스크 2: 성능 개선 효과 미미
**위험도**: 낮음
**대응**: 벤치마크를 통한 효과 측정, 필요시 롤백

### 리스크 3: 하위 호환성 문제
**위험도**: 낮음
**대응**: 기존 API 유지, 새로운 기능은 선택적 사용

---

## 성공 지표

### 문서화
- [ ] API 레퍼런스 완성도 100%
- [ ] 사용 가이드 완성도 100%
- [ ] 예제 코드 10개 이상

### 타입 안전성
- [ ] 타입 체크 에러 0개
- [ ] 자동완성 지원 100%
- [ ] 타입 생성 스크립트 정확도 100%

### 성능
- [ ] 번역 로딩 시간 50% 개선
- [ ] 캐시 히트율 80% 이상
- [ ] 번들 크기 20% 감소

### 개발자 경험
- [ ] 에러 메시지 명확도 개선
- [ ] 디버깅 시간 50% 단축
- [ ] 개발자 만족도 4.5/5.0 이상

---

## 결론

이 개발 플랜은 `@hua-labs/i18n-core` 패키지를 정교화하기 위한 계획입니다.

### 핵심 원칙

1. **코어는 핵심 기능만**: 현재 구현 그대로 유지, 문서화 중심
2. **로더는 별도 제공**: 프로덕션용 로더는 별도 패키지로 제공
3. **점진적 개선**: 하위 호환성 유지하며 선택적 기능 추가

### 필수 작업

- ✅ 문서화 (진행 중)
- ⚠️ 성능 최적화 기능 강화 및 문서화

### 선택적 작업

- 타입 안전성
- 개발자 경험 개선

**예상 기간**: 2-4주 (필수 작업만)
**예상 인력**: 1명
**우선순위**: 문서화 → 성능 최적화 강화 → (선택적) 타입 안전성 → (선택적) 개발자 경험

---

**작성일**: 2025년 11월
**버전**: 2.0.0
**상태**: 코어 중심 계획 수립 완료 ✅

