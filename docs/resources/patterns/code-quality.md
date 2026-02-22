# 코드 품질 패턴

**작성일**: 2025-12-06  
**목적**: 코드 품질 개선을 위한 반복되는 패턴 정리

---

## 1. 사용하지 않는 Import 제거

### 문제 상황

ESLint 경고: 사용하지 않는 import가 많음

### 원인 분석

- 기능 제거 후 import 정리 누락
- 리팩토링 과정에서 import 정리 누락

### 해결 방법

#### 수동 제거

```typescript
// ❌ 이전
import { HeroSection, Suspense } from '@/components';
import { Icon } from '@hua-labs/ui';

// ✅ 이후
// 사용하지 않는 import 제거
```

#### 자동화 (IDE)

- VS Code: "Organize Imports" 기능 사용
- ESLint 자동 수정: `eslint --fix`

### 예방 방법

1. **커밋 전 확인**: 사용하지 않는 import 제거
2. **자동화 도구**: pre-commit hook에 import 정리 추가
3. **코드 리뷰**: 사용하지 않는 import 확인

### 관련 데브로그

- [DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md](../devlogs/DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md)

---

## 2. React Hook Dependency 경고

### 문제 상황

ESLint 경고: `useEffect`, `useCallback` 등의 dependency 배열이 불완전

```typescript
// ❌ 경고 발생
useEffect(() => {
  fetchData(userId);
}, []); // userId가 dependency에 없음
```

### 원인 분석

React Hook의 dependency 배열에 사용하는 모든 값이 포함되어야 함

### 해결 방법

#### Dependency 추가

```typescript
// ✅ 해결된 코드
useEffect(() => {
  fetchData(userId);
}, [userId]); // userId 추가

// 또는
const fetchUserData = useCallback(() => {
  fetchData(userId);
}, [userId]); // userId 추가
```

#### useCallback으로 함수 메모이제이션

```typescript
// ✅ 해결된 코드
const handleClick = useCallback(() => {
  doSomething(id, name);
}, [id, name]); // 모든 dependency 추가
```

### 예방 방법

1. **ESLint 규칙 활성화**: `react-hooks/exhaustive-deps` 규칙 사용
2. **코드 리뷰**: Hook dependency 확인
3. **자동 수정**: ESLint 자동 수정 기능 활용

### 관련 데브로그

- [DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md](../devlogs/DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md)

---

## 3. 접근성 개선

### 문제 상황

접근성 속성이 누락되어 스크린 리더 지원 부족

### 원인 분석

- ARIA 속성 누락
- 시맨틱 HTML 미사용
- 키보드 네비게이션 미지원

### 해결 방법

#### ARIA 속성 추가

```typescript
// ✅ 해결된 코드
<button
  aria-label="전체 보기"
  aria-expanded={isOpen}
  onClick={handleClick}
>
  전체 보기
</button>
```

#### 시맨틱 HTML 사용

```typescript
// ✅ 해결된 코드
<nav role="navigation" aria-label="메인 네비게이션">
  <ul role="list">
    <li role="listitem">
      <a href="/" aria-current={isActive ? 'page' : undefined}>
        홈
      </a>
    </li>
  </ul>
</nav>
```

#### 키보드 접근성

```typescript
// ✅ 해결된 코드
<div
  role="button"
  tabIndex={0}
  aria-label="항목 선택"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  onClick={handleClick}
>
  항목
</div>
```

### 예방 방법

1. **접근성 체크리스트**: 컴포넌트 추가 시 접근성 확인
2. **자동화 도구**: aXe, Lighthouse 등 사용
3. **코드 리뷰**: 접근성 속성 확인

### 관련 데브로그

- [DEVLOG_2025-12-06_UI_PACKAGE_IMPROVEMENT.md](../devlogs/DEVLOG_2025-12-06_UI_PACKAGE_IMPROVEMENT.md)

---

## 4. 에러 처리 개선

### 문제 상황

에러 발생 시 사용자 친화적인 피드백 부족

### 원인 분석

- 에러 처리 로직 누락
- Fallback UI 부재
- 에러 메시지가 사용자에게 전달되지 않음

### 해결 방법

#### Fallback UI 제공

```typescript
// ✅ 해결된 코드
function Icon({ name, ...props }: IconProps) {
  try {
    const IconComponent = getIcon(name);
    return <IconComponent {...props} />;
  } catch (error) {
    console.error(`Icon "${name}" not found:`, error);
    return (
      <div
        role="img"
        aria-label={`${name} 아이콘을 찾을 수 없습니다`}
        className="icon-fallback"
      >
        ❓
      </div>
    );
  }
}
```

#### 에러 상태 관리

```typescript
// ✅ 해결된 코드
const [error, setError] = useState<Error | null>(null);

try {
  await fetchData();
} catch (err) {
  setError(err instanceof Error ? err : new Error('Unknown error'));
  console.error('Error fetching data:', err);
}

if (error) {
  return <ErrorDisplay error={error} />;
}
```

### 예방 방법

1. **에러 처리 가이드라인**: 에러 처리 패턴 문서화
2. **공통 에러 컴포넌트**: 재사용 가능한 에러 UI 컴포넌트
3. **에러 로깅**: 에러 발생 시 로깅 시스템 연동

### 관련 데브로그

- [DEVLOG_2025-12-06_UI_PACKAGE_IMPROVEMENT.md](../devlogs/DEVLOG_2025-12-06_UI_PACKAGE_IMPROVEMENT.md)
- [DEVLOG_2025-12-06_DIARY_ANALYSIS_IMPROVEMENT.md](../devlogs/DEVLOG_2025-12-06_DIARY_ANALYSIS_IMPROVEMENT.md)

---

## 5. 사용하지 않는 변수 처리

### 문제 상황

ESLint 경고: 사용하지 않는 변수나 파라미터

### 원인 분석

- 향후 사용 예정인 변수
- 이벤트 핸들러에서 사용하지 않는 파라미터

### 해결 방법

#### 언더스코어 접두사

```typescript
// ✅ 해결된 코드
function handleEvent(_event: Event) {
  // event를 사용하지 않지만 타입은 필요
}

const { unused, ...rest } = data;
```

#### 주석 처리

```typescript
// ✅ 해결된 코드
// const language = 'ko'; // 향후 사용 예정
```

#### ESLint 규칙 조정

```javascript
// eslint.config.js
{
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
}
```

### 예방 방법

1. **일관된 처리 방법**: 팀 내 규칙 통일
2. **ESLint 규칙**: 언더스코어 접두사 허용 규칙 설정
3. **코드 리뷰**: 사용하지 않는 변수 확인

### 관련 데브로그

- [DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md](../devlogs/DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

