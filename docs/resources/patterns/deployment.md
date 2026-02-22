# 배포 패턴

**작성일**: 2025-12-06  
**목적**: 배포 시 자주 발생하는 문제와 해결 방법 정리

---

## 1. Vercel 배포 설정

### 문제 상황

Vercel 배포 시 빌드 오류 또는 환경 변수 오류

### 원인 분석

- pnpm 버전 불일치
- 환경 변수 설정 오류
- 빌드 명령어 설정 오류

### 해결 방법

#### vercel.json 설정

```json
{
  "installCommand": "corepack enable && corepack use pnpm@10.24.0 && cd ../.. && corepack pnpm install --frozen-lockfile --ignore-scripts=false",
  "buildCommand": "cd ../.. && pnpm build",
  "outputDirectory": ".next"
}
```

#### 환경 변수 설정

- Vercel 대시보드에서 Plain Text로 설정
- Secret reference 사용 시 참조 오류 발생 가능

### 예방 방법

1. **vercel.json 문서화**: 각 앱별 설정 명시
2. **환경 변수 템플릿**: `.env.example` 제공
3. **배포 전 체크리스트**: 배포 전 확인 사항 문서화

### 관련 데브로그

- [DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md](../devlogs/DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md)

---

## 2. GitHub Actions 배포

### 문제 상황

CI/CD 파이프라인에서 빌드 실패

### 원인 분석

- 네이티브 모듈 빌드 도구 부재
- Node.js 버전 불일치
- 의존성 설치 실패

### 해결 방법

#### 빌드 도구 설치

```yaml
- name: Install build tools
  run: |
    sudo apt-get update
    sudo apt-get install -y build-essential python3

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'

- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 10.24.0
```

### 예방 방법

1. **워크플로우 템플릿**: 공통 워크플로우 템플릿 사용
2. **로컬 테스트**: CI/CD와 동일한 환경에서 테스트
3. **의존성 고정**: lockfile 사용

### 관련 데브로그

- [DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md](../devlogs/DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md)

---

## 3. 모노레포 배포

### 문제 상황

모노레포에서 특정 앱만 배포할 때 경로 문제

### 원인 분석

- 루트 디렉토리와 앱 디렉토리 경로 혼동
- 의존성 설치 경로 오류

### 해결 방법

#### 루트에서 설치 후 앱 빌드

```json
{
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm --filter my-app build"
}
```

#### Vercel 프로젝트 설정

- Root Directory: `apps/my-app`
- Build Command: `cd ../.. && pnpm build`
- Install Command: `cd ../.. && pnpm install`

### 예방 방법

1. **배포 가이드 문서화**: 각 앱별 배포 방법 명시
2. **자동화 스크립트**: 배포 스크립트 작성
3. **환경별 설정**: 개발/스테이징/프로덕션 설정 분리

### 관련 데브로그

- [DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md](../devlogs/DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

