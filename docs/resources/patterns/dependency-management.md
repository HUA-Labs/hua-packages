# 의존성 관리 패턴

**작성일**: 2025-12-06  
**목적**: 모노레포에서 의존성 관리 시 자주 발생하는 문제와 해결 방법 정리

---

## 1. 패키지 버전 불일치

### 문제 상황

모노레포 내에서 같은 패키지가 다른 버전으로 설치되어 충돌 발생

예: `zustand` 4.x와 5.x가 혼재

### 원인 분석

- 각 앱/패키지에서 독립적으로 패키지 업데이트
- workspace 의존성 관리 부족

### 해결 방법

#### 루트 package.json에서 통일

```json
{
  "pnpm": {
    "overrides": {
      "zustand": "5.0.8"
    }
  }
}
```

#### 각 패키지에서 버전 통일

```json
// apps/my-chat/package.json
{
  "dependencies": {
    "zustand": "5.0.8"
  }
}

// packages/hua-i18n-core-zustand/package.json
{
  "dependencies": {
    "zustand": "5.0.8"
  }
}
```

### 예방 방법

1. **정기적인 의존성 감사**: 분기별로 의존성 버전 통일 확인
2. **자동화 스크립트**: 의존성 버전 통일을 위한 스크립트 작성
3. **CI/CD 체크**: 버전 불일치 감지 자동화

### 관련 데브로그

- [DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md](../devlogs/DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md)

---

## 2. 사용하지 않는 패키지 제거

### 문제 상황

프로젝트에 설치되어 있지만 실제로 사용하지 않는 패키지가 많음

### 원인 분석

- 기능 제거 후 패키지 정리 누락
- 의존성 변경 후 이전 패키지 제거 누락

### 해결 방법

#### 수동 확인 및 제거

```bash
# 사용하지 않는 패키지 확인
pnpm why <package-name>

# 제거
pnpm remove <package-name>
```

#### 자동화 도구 활용 (향후)

- `depcheck`: 사용하지 않는 의존성 감지
- `npm-check`: 업데이트 및 사용하지 않는 패키지 확인

### 예방 방법

1. **정기적인 정리**: 분기별로 사용하지 않는 패키지 제거
2. **자동화 도구 도입**: unused dependency detection 도구 사용
3. **패키지 추가 시 문서화**: 왜 추가했는지 명시

### 관련 데브로그

- [DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md](../devlogs/DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md)

---

## 3. 패키지 통일 (js-yaml → yaml)

### 문제 상황

같은 기능을 하는 패키지가 여러 개 혼용됨

예: `js-yaml`과 `yaml` 패키지 혼용

### 원인 분석

- 패키지 마이그레이션 과정에서 이전 패키지 제거 누락
- 팀원 간 다른 패키지 사용

### 해결 방법

#### 통일된 패키지로 마이그레이션

```typescript
// ❌ 이전
import { load } from 'js-yaml';

// ✅ 이후
import { parse } from 'yaml';
```

#### 모든 사용처 일괄 변경

```bash
# 1. 새 패키지 설치
pnpm add yaml

# 2. 이전 패키지 제거
pnpm remove js-yaml @types/js-yaml

# 3. 코드 변경
# 모든 import 문 수정
```

### 예방 방법

1. **패키지 선택 가이드라인**: 같은 기능의 패키지 중 하나로 통일
2. **코드 리뷰**: 새로운 패키지 추가 시 기존 패키지와 중복 확인
3. **문서화**: 프로젝트에서 사용하는 패키지 목록 유지

### 관련 데브로그

- [DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md](../devlogs/DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md)

---

## 4. 네이티브 모듈 의존성 (bcryptjs → bcrypt)

### 문제 상황

JavaScript 구현체에서 네이티브 모듈로 마이그레이션 시 빌드 환경 설정 필요

### 원인 분석

네이티브 모듈은 C++ 컴파일러가 필요하며, 플랫폼별로 빌드 도구가 다름

### 해결 방법

#### 로컬 환경

`.npmrc`에 설정:

```
ignore-scripts=false
```

#### CI/CD 환경

GitHub Actions에 빌드 도구 설치:

```yaml
- name: Install build tools
  run: |
    sudo apt-get update
    sudo apt-get install -y build-essential python3
```

#### Vercel

자동으로 네이티브 모듈 빌드 지원

### 예방 방법

- 네이티브 모듈 사용 시 빌드 환경 문서화
- CI/CD 파이프라인에 빌드 도구 설치 단계 추가
- 마이그레이션 전 빌드 환경 확인

### 관련 데브로그

- [DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md](../devlogs/DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md)

---

## 5. ESLint 버전 호환성

### 문제 상황

ESLint 9.x와 @typescript-eslint 6.x 간 호환성 문제

### 원인 분석

ESLint 9.x는 Flat Config를 사용하며, 이전 버전의 @typescript-eslint와 호환되지 않음

### 해결 방법

#### @typescript-eslint 8.x로 업그레이드

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0"
  }
}
```

#### ESLint 9.x Flat Config 사용

```javascript
// eslint.config.js
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default [
  ...compat.extends('next/core-web-vitals'),
  // ...
];
```

### 예방 방법

- ESLint 업그레이드 전 호환성 확인
- @typescript-eslint 버전도 함께 업그레이드
- Flat Config 마이그레이션 가이드 참고

### 관련 데브로그

- [DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md](../devlogs/DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md)
- [DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md](../devlogs/DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

