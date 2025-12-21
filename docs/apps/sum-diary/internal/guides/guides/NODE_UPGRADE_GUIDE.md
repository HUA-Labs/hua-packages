# Node.js 22 업그레이드 가이드

## 현재 상황

- **요구 버전**: Node.js 22.x
- **현재 버전**: Node.js v20.11.1
- **경고**: `WARN  Unsupported engine: wanted: {"node":"22.x"}`

## 해결 방법

### 방법 1: Volta 사용 (권장 - 공식 지원)

Volta는 공식적으로 지원되는 크로스 플랫폼 JavaScript 도구 관리자입니다.

#### 1. Volta 설치
1. [Volta 공식 사이트](https://volta.sh/)에서 `volta-setup.exe` 다운로드
2. 설치 프로그램 실행
3. 터미널 재시작

#### 2. Node.js 22 설치 및 사용
```powershell
# Node.js 22 설치
volta install node@22.17.1

# 프로젝트에 고정 (package.json에 자동 추가)
volta pin node@22.17.1

# 버전 확인
node --version
```

#### 3. 자동 버전 전환
프로젝트 디렉토리에 `.nvmrc` 또는 `package.json`의 `engines` 필드가 있으면 자동으로 해당 버전을 사용합니다.

### 방법 2: fnm (Fast Node Manager) 사용

fnm은 Rust로 작성된 빠르고 간단한 Node.js 버전 관리자입니다.

#### 1. fnm 설치 (Winget 사용)
```powershell
winget install Schniz.fnm
```

또는 Chocolatey:
```powershell
choco install fnm
```

#### 2. PowerShell 프로필 설정
```powershell
# 프로필 파일에 추가
fnm env --use-on-cd | Out-String | Invoke-Expression
```

#### 3. Node.js 22 설치 및 사용
```powershell
# Node.js 22 설치
fnm install 22.17.1

# Node.js 22 사용
fnm use 22.17.1

# 기본 버전 설정
fnm default 22.17.1

# 버전 확인
node --version
```

### 방법 3: nvm-windows 사용 (서드파티)

nvm-windows는 공식 nvm이 아닌 서드파티 프로젝트입니다.

#### 1. nvm-windows 설치
1. [nvm-windows GitHub](https://github.com/coreybutler/nvm-windows/releases)에서 `nvm-setup.exe` 다운로드
2. 설치 프로그램 실행 (관리자 권한 권장)

#### 2. Node.js 22 설치 및 사용
```powershell
# Node.js 22 설치
nvm install 22.17.1

# Node.js 22 사용
nvm use 22.17.1

# 기본 버전 설정
nvm alias default 22.17.1
```

### 방법 4: 직접 설치

1. [Node.js 공식 사이트](https://nodejs.org/)에서 Node.js 22 LTS 다운로드
2. 설치 프로그램 실행
3. 터미널 재시작
4. 버전 확인: `node --version`

### 방법 5: 경고 무시 (임시 해결책)

경고는 표시되지만 실행은 계속됩니다. 프로덕션 환경에서는 권장하지 않습니다.

`.npmrc` 파일에 `engine-strict=false`가 설정되어 있어도 pnpm은 경고를 표시합니다.

## 확인

업그레이드 후:
```powershell
node --version  # v22.x.x가 표시되어야 함
pnpm install    # 경고 없이 실행되어야 함
```

## 권장 사항

1. **Volta**: 공식 지원, 크로스 플랫폼, 자동 버전 전환
2. **fnm**: 빠르고 간단, Rust 기반
3. **nvm-windows**: 서드파티이지만 널리 사용됨
4. **직접 설치**: 가장 간단하지만 버전 관리 불가

## 참고

- `.nvmrc`: `22.17.1` (Volta, fnm, nvm-windows 모두 지원)
- `.node-version`: `22.17.1` (Volta, fnm 지원)
- `package.json`: `"node": "22.x"` (Volta가 자동으로 인식)
