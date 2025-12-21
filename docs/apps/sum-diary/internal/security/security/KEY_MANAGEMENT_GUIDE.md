# 키 관리 시스템 가이드

> 최종 업데이트: 2025-12-16

## 개요

숨다이어리는 암호화 키, JWT 시크릿, API 키를 안전하게 관리하고 주기적으로 로테이션할 수 있는 시스템을 제공합니다.

## 키 타입

| 키 타입 | 용도 | 환경 변수 | 최소 길이 |
|---------|------|-----------|-----------|
| `encryption` | 데이터 암호화 | `ENCRYPTION_KEY` | 32자 |
| `jwt` | JWT 토큰 서명 | `NEXTAUTH_SECRET` | 32자 |
| `api` | 외부 API 인증 | `HUA_API_KEY` | 16자 |

## 사용 방법

### 1. 키 가져오기

```typescript
import { keyManager, getEncryptionKey, getJWTSecret, getApiKey } from '@/app/lib/key-management';

// 싱글톤 인스턴스
const manager = keyManager;

// 개별 키 가져오기
const encryptionKey = getEncryptionKey();
const jwtSecret = getJWTSecret();
const apiKey = getApiKey();
```

### 2. 키 상태 확인

```typescript
// 특정 키 상태 확인
const keyStatus = keyManager.getKeyStatus('encryption');
console.log(keyStatus);

// 모든 키 상태 확인
const allKeys = keyManager.getAllKeyStatus();
console.log(allKeys);
```

### 3. 키 강도 검증

```typescript
import { validateAllKeys } from '@/app/lib/key-management';

const validationResults = validateAllKeys();
console.log(validationResults);
// 출력: { encryption: true, jwt: true, api: false }
```

### 4. 키 로테이션

```typescript
// 새 키 생성 및 로테이션
const newKey = keyManager.rotateKey('encryption');
console.log('새 키:', newKey);

// 이전 키 확인
const keyStatus = keyManager.getKeyStatus('encryption');
console.log('이전 키 존재:', !!keyStatus?.previous);
```

## 관리자 API

### 키 상태 조회

```bash
curl -X GET http://localhost:3000/api/admin/rotate-keys \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**응답:**
```json
{
  "success": true,
  "keys": [
    {
      "type": "encryption",
      "current": "aBcD1234...",
      "hasPrevious": false,
      "createdAt": "2025-11-07T00:00:00.000Z",
      "isValid": true
    }
  ],
  "validation": {
    "encryption": true,
    "jwt": true,
    "api": true
  }
}
```

### 키 로테이션 실행

```bash
curl -X POST http://localhost:3000/api/admin/rotate-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"keyType": "encryption"}'
```

**응답:**
```json
{
  "success": true,
  "message": "encryption 키가 성공적으로 로테이션되었습니다.",
  "newKey": "xYzW5678...",
  "timestamp": "2025-11-07T00:00:00.000Z"
}
```

## 환경 변수 설정

### .env.local 파일 설정

```bash
# 암호화 키 (32자 이상)
ENCRYPTION_KEY="your-32-character-encryption-key-here!"

# JWT 시크릿 (32자 이상)
NEXTAUTH_SECRET="your-32-character-jwt-secret-here!"

# API 키 (16자 이상)
HUA_API_KEY="your-16-character-api-key-here!"
```

### 안전한 키 생성

```bash
# OpenSSL 사용
openssl rand -base64 32

# Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 키 강도 요구사항

### 1. 최소 길이

- **암호화 키**: 32자 (256비트)
- **엔트로피**: 고유 문자 비율 50% 이상
- **랜덤성**: 예측 불가능한 값

### 2. 로테이션 주기

- **권장 주기**: 90일
- **최소 주기**: 30일
- **최대 주기**: 180일

### 3. 보안 모범 사례

- **절대 공유 금지**: 키는 절대 공유하지 않음
- **환경 변수 사용**: .env.local 파일에 저장
- **버전 관리 제외**: .gitignore에 포함

## 키 로테이션 프로세스

### 1. 준비 단계

- **백업**: 현재 키 백업
- **점검**: 키 강도 검사
- **통지**: 팀원에게 로테이션 예정 통지

### 2. 실행 단계

- **새 키 생성**: 안전한 랜덤 키 생성
- **이전 키 보관**: 이전 키를 일시적으로 보관 (데이터 복호화용)
- **환경 변수 업데이트**: .env.local 파일 업데이트

### 3. 검증 단계

- **키 강도 검증**: 새 키의 강도 확인
- **기능 테스트**: 암호화/복호화 기능 테스트
- **모니터링**: 오류 로그 확인

## 문제 해결

### 키가 없는 경우

1. **환경 변수 확인**:
   ```bash
   echo $ENCRYPTION_KEY
   ```

2. **애플리케이션 재시작**:
   ```bash
   pnpm dev
   ```

3. **키 강도 검증**:
   ```typescript
   const key = process.env.ENCRYPTION_KEY;
   console.log('키 길이:', key?.length);
   console.log('키 강도:', keyManager.validateKeyStrength(key || ''));
   ```

### 키 로테이션 실패

1. **권한 확인**: 관리자 권한 확인
2. **로그 확인**: 서버 로그에서 오류 확인
3. **수동 로테이션**: 필요 시 수동으로 키 생성

```typescript
try {
  const newKey = keyManager.rotateKey('encryption');
  console.log('새 키:', newKey);
} catch (error) {
  console.error('로테이션 실패:', error);
}
```

## 모니터링

### 주기적 모니터링

```typescript
// 주기적 키 상태 확인 (1분마다)
setInterval(async () => {
  const status = keyManager.getAllKeyStatus();
  const validation = validateAllKeys();
  
  console.log('키 상태:', {
    timestamp: new Date().toISOString(),
    status,
    validation
  });
}, 60000); // 1분
```

### 로테이션 알림

```typescript
// 키 생성 후 경과 시간 확인 (90일 경과 시 경고)
const keyStatus = keyManager.getKeyStatus('encryption');
if (keyStatus) {
  const daysSinceCreation = (Date.now() - keyStatus.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation > 80) { // 90일 전 경고
    console.warn('키 로테이션이 곧 필요합니다.');
  }
}
```

## 보안 주의사항

1. **절대 공유 금지**: 키는 절대 공유하지 않음
2. **환경 변수 사용**: 코드에 하드코딩 금지
3. **정기적 로테이션**: 90일마다 키 로테이션 권장
4. **백업 보관**: 이전 키는 안전하게 백업 보관

---

**최종 업데이트**: 2025-11-07
