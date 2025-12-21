# Graphite 설치 및 설정 가이드

## 개요

이 문서는 Graphite CLI 설치 및 GitHub 연동 방법을 안내합니다.

## 사전 요구사항

- Node.js 18+ 또는 Python 3.8+
- Git 2.20+
- GitHub 계정

## 설치 방법

### 방법 1: npm을 통한 설치 (권장)

```bash
npm install -g @graphite-io/cli
```

설치 확인:
```bash
gt --version
```

### 방법 2: Homebrew를 통한 설치 (macOS/Linux)

```bash
brew install graphite-io/graphite/graphite
```

설치 확인:
```bash
gt --version
```

### 방법 3: 직접 설치 (Windows)

Windows 환경에서는 npm 설치를 권장합니다. PowerShell에서 실행:

```powershell
npm install -g @graphite-io/cli
```

## GitHub 연동

### 1. 인증 시작

```bash
gt auth
```

이 명령어를 실행하면:
1. 브라우저가 자동으로 열립니다
2. GitHub 로그인 페이지로 이동합니다
3. Graphite 앱 권한을 승인합니다

### 2. 권한 확인

Graphite는 다음 권한이 필요합니다:
- **Repository access**: 저장소 읽기/쓰기
- **Pull requests**: PR 생성 및 관리
- **Contents**: 코드 읽기/쓰기

### 3. 연동 확인

```bash
gt repo init
```

현재 디렉토리가 Git 저장소인 경우, Graphite가 자동으로 감지합니다.

## 초기 설정

### 1. 저장소 초기화

프로젝트 루트에서 실행:

```bash
cd d:\HUA\hua-platform
gt repo init
```

### 2. 설정 확인

```bash
gt config list
```

### 3. 기본 브랜치 설정

Graphite는 기본적으로 `main` 또는 `develop` 브랜치를 사용합니다. 현재 프로젝트는 `develop` 브랜치를 사용하므로:

```bash
gt config set defaultBranch develop
```

## Windows 환경 특이사항

### PowerShell 실행 정책

PowerShell에서 스크립트 실행이 차단된 경우:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 경로 문제

Windows에서 긴 경로 문제가 발생할 수 있습니다. Git 설정 확인:

```bash
git config --global core.longpaths true
```

### 줄바꿈 문자

Windows와 Linux 간 줄바꿈 문자 차이를 방지:

```bash
git config --global core.autocrlf input
```

## 문제 해결

### 인증 실패

인증이 실패하는 경우:

1. 브라우저에서 수동으로 인증:
   ```bash
   gt auth --web
   ```

2. 토큰 확인:
   ```bash
   gt config get authToken
   ```

3. 재인증:
   ```bash
   gt auth --reset
   ```

### 저장소 인식 실패

Graphite가 저장소를 인식하지 못하는 경우:

1. Git 저장소 확인:
   ```bash
   git status
   ```

2. 수동으로 저장소 설정:
   ```bash
   gt repo init --force
   ```

### CLI 명령어 인식 안 됨

`gt` 명령어를 찾을 수 없는 경우:

1. 설치 확인:
   ```bash
   npm list -g @graphite-io/cli
   ```

2. PATH 확인:
   ```bash
   # Windows PowerShell
   $env:PATH -split ';' | Select-String "node"
   ```

3. 전역 설치 경로 확인:
   ```bash
   npm config get prefix
   ```

## 다음 단계

설치 및 설정이 완료되면:

1. **[워크플로우 가이드](./WORKFLOW_GUIDE.md)** - Stacked PRs 사용법 학습
2. **[Agent 가이드](./AGENT_GUIDE.md)** - Graphite Agent 설정

## 참고 자료

- [Graphite CLI 공식 문서](https://docs.graphite.dev/cli)
- [Graphite 인증 가이드](https://docs.graphite.dev/auth)

---

**작성일**: 2025-12-21  
**태그**: #graphite #setup #installation
