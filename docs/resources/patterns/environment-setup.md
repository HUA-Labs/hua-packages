# 환경 설정 패턴

**작성일**: 2025-12-06  
**목적**: 환경 변수, 데이터베이스 연결 등 환경 설정 관련 패턴 정리

---

## 1. 데이터베이스 연결 설정

### 문제 상황

Railway 데이터베이스 연결 실패

```
Can't reach database server at postgres-hekj-production.up.railway.app:5432
```

### 원인 분석

Railway는 프록시 엔드포인트를 사용하며, 직접 호스트 연결이 아닌 프록시를 통해야 함

### 해결 방법

#### Railway 프록시 엔드포인트 사용

```typescript
// ❌ 이전
DATABASE_URL=postgres://user:pass@postgres-hekj-production.up.railway.app:5432/db

// ✅ 이후
DATABASE_URL=postgres://user:pass@crossover.proxy.rlwy.net:38481/db?sslmode=require
```

#### SSL 모드 명시

```typescript
// ✅ SSL 모드 포함
DATABASE_URL=postgres://user:pass@crossover.proxy.rlwy.net:38481/db?sslmode=require
```

### 예방 방법

1. **데이터베이스 연결 문서화**: 각 서비스별 연결 방법 문서화
2. **환경 변수 템플릿**: `.env.example`에 올바른 형식 명시
3. **연결 테스트 스크립트**: 배포 전 연결 테스트

### 관련 데브로그

- [DEVLOG_2025-12-03_DATABASE_CONNECTION_AND_KEYBOARD_SHORTCUTS_FIX.md](../devlogs/DEVLOG_2025-12-03_DATABASE_CONNECTION_AND_KEYBOARD_SHORTCUTS_FIX.md)

---

## 2. Vercel 환경 변수 설정

### 문제 상황

Vercel에서 환경 변수 참조 오류 발생

### 원인 분석

Vercel 환경 변수를 Secret reference로 설정하면 참조 오류 발생

### 해결 방법

#### Plain Text로 설정

Vercel 대시보드에서:
1. Environment Variables 설정
2. **Plain Text**로 설정 (Secret reference 아님)
3. 값 직접 입력

#### Doppler와 연동

```bash
# Doppler에서 Vercel로 동기화
doppler secrets download --format env --no-file > .env.local
```

### 예방 방법

- 환경 변수는 Plain Text로 설정
- Secret reference는 필요한 경우에만 사용
- 환경 변수 설정 문서화

### 관련 데브로그

- [DEVLOG_2025-12-03_DATABASE_CONNECTION_AND_KEYBOARD_SHORTCUTS_FIX.md](../devlogs/DEVLOG_2025-12-03_DATABASE_CONNECTION_AND_KEYBOARD_SHORTCUTS_FIX.md)

---

## 3. Git Author 설정

### 문제 상황

Vercel 배포 시 Git author 이메일 불일치로 인한 접근 오류

### 원인 분석

Vercel은 Git commit author 이메일과 Vercel 계정 이메일이 일치해야 자동 배포 가능

### 해결 방법

#### Git 설정 변경

```bash
# 전역 설정
git config --global user.email "echonet.ais@gmail.com"
git config --global user.name "Your Name"

# 또는 프로젝트별 설정
git config user.email "echonet.ais@gmail.com"
git config user.name "Your Name"
```

#### 기존 커밋 수정 (필요시)

```bash
# 최근 커밋만 수정
git commit --amend --author="Your Name <echonet.ais@gmail.com>"

# 여러 커밋 수정 (주의: 히스토리 변경)
git rebase -i HEAD~n
```

### 예방 방법

- 팀원들의 Git 설정 통일
- Vercel 계정 이메일과 Git author 이메일 일치 확인
- CI/CD 파이프라인에서 author 확인

### 관련 데브로그

- [DEVLOG_2025-12-03_DATABASE_CONNECTION_AND_KEYBOARD_SHORTCUTS_FIX.md](../devlogs/DEVLOG_2025-12-03_DATABASE_CONNECTION_AND_KEYBOARD_SHORTCUTS_FIX.md)

---

## 4. 환경 변수 검증

### 문제 상황

빌드 타임과 런타임에서 환경 변수 검증이 혼재되어 오류 발생

### 원인 분석

Next.js는 빌드 타임에 모듈을 로드하므로, 빌드 타임에 환경 변수가 없으면 오류 발생

### 해결 방법

#### 빌드 타임과 런타임 구분

```typescript
// ✅ 해결된 코드
function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];
  
  // 빌드 타임에는 검증하지 않음
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    // 런타임에만 검증
    if (required && !value) {
      throw new Error(`Environment variable ${name} is required`);
    }
  }
  
  return value || '';
}
```

#### Lazy Initialization

```typescript
// ✅ 해결된 코드
let client: Client | null = null;

export function getClient() {
  if (!client) {
    const url = process.env.API_URL;
    if (!url) {
      throw new Error('API_URL is required');
    }
    client = new Client(url);
  }
  return client;
}
```

### 예방 방법

- 환경 변수 사용은 lazy initialization 패턴 사용
- 빌드 타임과 런타임 구분하여 검증
- 개발 환경에서만 엄격한 검증 수행

### 관련 데브로그

- [DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md](../devlogs/DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

