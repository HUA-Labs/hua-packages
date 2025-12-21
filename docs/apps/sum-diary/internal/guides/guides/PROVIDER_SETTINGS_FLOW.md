# AI 프로바이더 설정 저장 흐름

## 저장 위치

프로바이더 설정은 **두 곳**에 저장됩니다:

1. **로컬 스토리지 (localStorage)** - 클라이언트 사이드
2. **데이터베이스 (PostgreSQL)** - 서버 사이드

## 저장 흐름

### 1. 설정 저장 시

#### 방법 A: ProviderSettingsModal 사용
```
사용자가 프로바이더 선택
  ↓
localStorage.setItem('ai-provider', selectedProvider)  // 1. 로컬 스토리지 저장
  ↓
POST /api/user/settings { aiProvider: selectedProvider }
  ↓
api/user/settings/route.ts (POST)
  ↓
setUserAiProvider(userId, provider)  // user-settings-server.ts
  ↓
prisma.userSettings.upsert()  // 2. DB 저장
  ↓
UserSettings 테이블 (user 스키마)
  - ai_provider: 'OPENAI' | 'GEMINI' | 'HUA_ENGINE' | 'MOCK'
```

#### 방법 B: useAISettings 훅 사용
```
사용자가 프로바이더 선택
  ↓
localStorage.setItem('ai-provider', selectedProvider)  // 1. 로컬 스토리지 저장
  ↓
setUserAiProvider(userId, provider)  // user-settings.ts (클라이언트)
  ↓
POST /api/user/settings { aiProvider: provider }
  ↓
api/user/settings/route.ts (POST)
  ↓
setUserAiProvider(userId, provider)  // user-settings-server.ts
  ↓
prisma.userSettings.upsert()  // 2. DB 저장
```

### 2. 설정 조회 시

#### 클라이언트 사이드
```
getClientAiProvider()
  ↓
localStorage.getItem('ai-provider')
  ↓
기본값: 'openai'
```

#### 서버 사이드
```
getUserAiProvider(userId)
  ↓
1. 메모리 캐시 확인 (userSettingsCache)
  ↓
2. DB 조회 (prisma.userSettings.findUnique)
  ↓
3. 기본값: 'openai'
```

## 데이터베이스 스키마

```prisma
model UserSettings {
  @@schema("user")
  id      String @id @default(uuid())
  user_id String @unique @db.Uuid
  
  // AI 프로바이더 설정
  ai_provider AnalysisProvider @default(OPENAI)
  
  // ... 기타 설정
}

enum AnalysisProvider {
  OPENAI
  GEMINI
  HUA_ENGINE
  MOCK
}
```

## 변환 로직

### 클라이언트 → DB
- `'openai'` → `'OPENAI'`
- `'gemini'` → `'GEMINI'`
- `'auto'` → `'OPENAI'` (기본값)

### DB → 클라이언트
- `'OPENAI'` → `'openai'`
- `'GEMINI'` → `'gemini'`
- `'HUA_ENGINE'` / `'MOCK'` → `'openai'` (기본값)

## 확인 방법

### 로컬 스토리지 확인
```javascript
// 브라우저 콘솔에서
localStorage.getItem('ai-provider')
```

### 데이터베이스 확인
```sql
-- PostgreSQL에서
SELECT user_id, ai_provider, updated_at 
FROM "user"."UserSettings" 
WHERE user_id = 'your-user-id';
```

### 개발 환경 로그
```
[DEBUG] 사용자 {userId}의 AI 프로바이더가 {provider}로 설정되었습니다. (DB: {dbProvider})
```

## 주의사항

1. **로컬 스토리지**: 브라우저별로 다를 수 있음 (같은 사용자라도 다른 브라우저에서는 다른 값)
2. **DB 저장**: 사용자별로 하나의 값만 저장됨 (서버 사이드에서 사용)
3. **동기화**: 로그인한 사용자의 경우 DB 값이 우선됨 (서버 사이드 분석 시)
