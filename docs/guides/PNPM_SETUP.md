# pnpm 설정 가이드 (Windows)

## 문제
Volta를 통해 설치된 pnpm이 volta 명령어를 찾으려고 해서 오류가 발생합니다.

## 해결 방법

### 방법 1: 현재 세션에서 함수 정의 (즉시 사용)

PowerShell을 열 때마다 다음 명령어를 실행:

```powershell
function pnpm { & 'C:\Users\eutopos1\AppData\Roaming\npm\pnpm.cmd' $args }
```

### 방법 2: PowerShell 프로필에 영구 추가 (권장)

1. PowerShell을 **관리자 권한**으로 실행
2. 실행 정책 변경:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. 프로필 파일 확인:
   ```powershell
   Test-Path $PROFILE
   ```
4. 프로필이 없으면 생성:
   ```powershell
   if (!(Test-Path $PROFILE)) { New-Item -Path $PROFILE -ItemType File -Force }
   ```
5. 프로필에 함수 추가 (이미 완료됨):
   ```powershell
   # C:\Users\eutopos1\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
   function pnpm {
       & 'C:\Users\eutopos1\AppData\Roaming\npm\pnpm.cmd' $args
   }
   ```
6. 새 PowerShell 세션을 열면 자동으로 적용됩니다.

### 방법 3: 환경 변수 PATH 조정

Volta 경로보다 npm 경로를 먼저 오도록 PATH 순서 조정:

1. 시스템 환경 변수 편집
2. PATH에서 `C:\Users\eutopos1\AppData\Roaming\npm`을 `C:\Users\eutopos1\AppData\Local\Volta\bin`보다 위로 이동

### 방법 4: 배치 파일 생성

`pnpm.bat` 파일을 생성하여 PATH에 추가된 디렉토리에 배치:

```batch
@echo off
C:\Users\eutopos1\AppData\Roaming\npm\pnpm.cmd %*
```

## 확인

```powershell
pnpm --version
# 출력: 10.23.0 (또는 설치된 버전)
```

## 참고

- Volta는 필요 없습니다. `.nvmrc`로 Node 버전을 관리합니다.
- 프로필 파일 위치: `C:\Users\eutopos1\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`

