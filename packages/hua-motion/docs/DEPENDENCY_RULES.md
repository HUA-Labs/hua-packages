# Motion 패키지 의존성 규칙

**작성일**: 2025-12-06  
**버전**: 1.0.0

---

## 📋 목차

1. [의존성 규칙 표](#의존성-규칙-표)
2. [규칙 상세 설명](#규칙-상세-설명)
3. [위반 시 문제점](#위반-시-문제점)
4. [검증 방법](#검증-방법)

---

## 의존성 규칙 표

### 명시적 의존성 규칙

| From | To | 허용 여부 | 우선순위 | 설명 |
|------|-----|---------|---------|------|
| `@hua-labs/ui` | `@hua-labs/motion-core` | ✅ **가능** | **필수** | UI 패키지의 필수 의존성 |
| `@hua-labs/ui` | `@hua-labs/motion-advanced` | ⚠️ **선택/peer** | 선택적 | 고급 기능이 필요한 경우만 |
| `@hua-labs/ui` | `@hua-labs/motion` | ❌ **권장X** | 비권장 | 통합 패키지는 사용하지 않음 |
| `@hua-labs/motion-advanced` | `@hua-labs/motion-core` | ✅ **가능** | 필수 | Advanced는 Core 의존 |
| `@hua-labs/motion` | `@hua-labs/motion-core` | ✅ **가능** | 필수 | 통합 패키지는 Core 재export |
| `@hua-labs/motion` | `@hua-labs/motion-advanced` | ✅ **가능** | 필수 | 통합 패키지는 Advanced 재export |
| `@hua-labs/motion-core` | `@hua-labs/ui` | ❌ **불가** | 금지 | 순환 의존성 방지 |
| `@hua-labs/motion-core` | `@hua-labs/motion-advanced` | ❌ **불가** | 금지 | 역방향 의존성 방지 |
| 서브패키지 간 | 서브패키지 간 | ❌ **불가** | 금지 | 서브패키지 간 직접 의존 금지 |

### 의존성 방향도

```
✅ 허용되는 의존성:
┌─────────────────┐
│  @hua-labs/ui   │
└────────┬────────┘
         │ ✅
         ↓
┌─────────────────┐
│ motion-core     │
└────────┬────────┘
         │ ✅
         ↓
┌─────────────────┐
│ motion-advanced │
└─────────────────┘
         ↑ ✅
         │
┌─────────────────┐
│  motion (통합)  │
└─────────────────┘

❌ 금지되는 의존성:
- motion-core → ui (순환 의존성)
- motion-core → motion-advanced (역방향)
- 서브패키지 간 직접 의존
```

---

## 규칙 상세 설명

### 1. UI 패키지 → motion-core (✅ 필수)

**규칙**: UI 패키지는 `@hua-labs/motion-core`를 필수 의존성으로 가질 수 있습니다.

**이유**:
- UI 패키지가 기본 모션 기능을 제공하기 위해 필요
- Core는 Zero Dependencies이므로 추가 부담 없음
- 번들 크기 최소화

**구현**:
```json
{
  "dependencies": {
    "@hua-labs/motion-core": "workspace:*"
  }
}
```

### 2. UI 패키지 → motion-advanced (⚠️ 선택/peer)

**규칙**: UI 패키지는 `@hua-labs/motion-advanced`를 peerDependency로 가질 수 있습니다.

**이유**:
- 고급 기능은 선택적으로 사용
- 번들 크기 최소화
- 사용자가 필요할 때만 설치

**구현**:
```json
{
  "peerDependencies": {
    "@hua-labs/motion-advanced": "*"
  }
}
```

### 3. UI 패키지 → motion (❌ 권장X)

**규칙**: UI 패키지는 `@hua-labs/motion` (통합 패키지)를 사용하지 않습니다.

**이유**:
- 통합 패키지는 하위 호환성을 위한 것
- UI 패키지는 Core만 필요
- 불필요한 의존성 증가

**대안**:
- `@hua-labs/motion-core` 직접 사용
- 필요 시 `@hua-labs/motion-advanced` 추가

### 4. motion-advanced → motion-core (✅ 필수)

**규칙**: `@hua-labs/motion-advanced`는 `@hua-labs/motion-core`를 의존할 수 있습니다.

**이유**:
- Advanced는 Core의 기능을 확장
- Core의 기본 기능을 활용
- 계층적 구조 유지

**구현**:
```json
{
  "dependencies": {
    "@hua-labs/motion-core": "workspace:*"
  }
}
```

### 5. motion → motion-core + motion-advanced (✅ 필수)

**규칙**: `@hua-labs/motion` (통합 패키지)는 Core와 Advanced를 모두 의존합니다.

**이유**:
- 통합 패키지는 Core + Advanced를 re-export
- 하위 호환성 제공
- 기존 코드 지원

**구현**:
```json
{
  "dependencies": {
    "@hua-labs/motion-core": "workspace:*",
    "@hua-labs/motion-advanced": "workspace:*"
  }
}
```

### 6. motion-core → ui (❌ 금지)

**규칙**: `@hua-labs/motion-core`는 `@hua-labs/ui`를 의존할 수 없습니다.

**이유**:
- 순환 의존성 방지
- Core는 Zero Dependencies 유지
- 독립성 보장

**문제점**:
- 순환 의존성으로 인한 빌드 실패
- 패키지 독립성 손실
- 번들 크기 증가

### 7. motion-core → motion-advanced (❌ 금지)

**규칙**: `@hua-labs/motion-core`는 `@hua-labs/motion-advanced`를 의존할 수 없습니다.

**이유**:
- 역방향 의존성 방지
- Core는 Advanced 없이 독립적으로 작동해야 함
- 계층 구조 유지

**문제점**:
- 역방향 의존성으로 인한 구조 파괴
- Core의 독립성 손실
- 순환 의존성 가능성

### 8. 서브패키지 간 직접 의존 (❌ 금지)

**규칙**: 서브패키지 간 직접 의존은 금지됩니다.

**이유**:
- 패키지 간 결합도 증가
- 유지보수 어려움
- 의존성 관리 복잡화

**예시**:
- `@hua-labs/ui/form` → `@hua-labs/ui/navigation` (금지)
- `@hua-labs/ui/feedback` → `@hua-labs/ui/form` (금지)

**대안**:
- 공통 기능은 Core로 이동
- 필요한 경우 상위 패키지에서 조합

---

## 위반 시 문제점

### 1. 순환 의존성

**예시**: `motion-core` → `ui` → `motion-core`

**문제점**:
- 빌드 실패
- 패키지 로딩 순서 문제
- 런타임 에러 가능성

**해결책**:
- 의존성 방향 재검토
- 공통 기능을 별도 패키지로 분리

### 2. 역방향 의존성

**예시**: `motion-core` → `motion-advanced`

**문제점**:
- 계층 구조 파괴
- Core의 독립성 손실
- 순환 의존성 가능성

**해결책**:
- 의존성 방향 수정
- 공통 기능을 Core로 이동

### 3. 불필요한 의존성

**예시**: `ui` → `motion` (통합 패키지)

**문제점**:
- 번들 크기 증가
- 불필요한 코드 포함
- 성능 저하

**해결책**:
- 필요한 패키지만 의존
- peerDependency 활용

### 4. 서브패키지 간 의존

**예시**: `ui/form` → `ui/navigation`

**문제점**:
- 패키지 간 결합도 증가
- 유지보수 어려움
- 테스트 복잡화

**해결책**:
- 공통 기능을 Core로 이동
- 상위 패키지에서 조합

---

## 검증 방법

### 1. package.json 검증

**스크립트**:
```bash
# 의존성 검증
pnpm check-deps
```

**검증 항목**:
- 금지된 의존성 확인
- 순환 의존성 확인
- 역방향 의존성 확인

### 2. 빌드 검증

**스크립트**:
```bash
# 빌드 테스트
pnpm build
```

**검증 항목**:
- 빌드 성공 여부
- 순환 의존성 에러 확인
- 타입 체크 통과

### 3. 런타임 검증

**스크립트**:
```bash
# 테스트 실행
pnpm test
```

**검증 항목**:
- 모든 테스트 통과
- 런타임 에러 없음
- 의존성 로딩 순서 확인

### 4. 번들 크기 검증

**스크립트**:
```bash
# 번들 분석
pnpm build:analyze
```

**검증 항목**:
- 번들 크기 측정
- 불필요한 코드 포함 여부
- 의존성 트리 확인

### 5. 자동화 검증

**도구**:
- `madge`: 순환 의존성 검사
- `depcheck`: 사용하지 않는 의존성 검사
- `npm-check`: 의존성 업데이트 확인

**CI/CD 통합**:
```yaml
# .github/workflows/check-deps.yml
- name: Check Dependencies
  run: |
    pnpm check-deps
    pnpm build
    pnpm test
```

---

## 예외 상황

### 1. 개발 의존성

**규칙**: 개발 의존성은 제한이 없습니다.

**예시**:
- `@hua-labs/motion-core` → `@types/react` (devDependency)
- `@hua-labs/ui` → `vitest` (devDependency)

### 2. 타입 정의

**규칙**: 타입 정의만을 위한 의존성은 허용됩니다.

**예시**:
- `@hua-labs/motion-core` → `@types/react` (types only)

### 3. 빌드 도구

**규칙**: 빌드 도구 의존성은 허용됩니다.

**예시**:
- `@hua-labs/motion-core` → `tsup` (build tool)
- `@hua-labs/ui` → `tailwind-merge` (build tool)

---

## 모범 사례

### 1. 최소 의존성 원칙

**원칙**: 필요한 최소한의 의존성만 사용합니다.

**예시**:
```json
// ✅ 좋은 예
{
  "dependencies": {
    "@hua-labs/motion-core": "workspace:*"
  }
}

// ❌ 나쁜 예
{
  "dependencies": {
    "@hua-labs/motion": "workspace:*"  // 통합 패키지 불필요
  }
}
```

### 2. peerDependency 활용

**원칙**: 선택적 기능은 peerDependency로 제공합니다.

**예시**:
```json
// ✅ 좋은 예
{
  "peerDependencies": {
    "@hua-labs/motion-advanced": "*"
  }
}
```

### 3. 명확한 의존성 방향

**원칙**: 의존성 방향이 명확하고 일관됩니다.

**예시**:
```
✅ 올바른 방향:
ui → motion-core → (없음)
motion-advanced → motion-core
motion → motion-core + motion-advanced
```

---

## 결론

이 의존성 규칙은 HUA Motion 패키지 생태계의 안정성과 유지보수성을 보장하기 위한 것입니다. 모든 개발자는 이 규칙을 준수해야 하며, 위반 시 즉시 수정해야 합니다.

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

