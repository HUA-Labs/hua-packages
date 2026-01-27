# 암호화 시스템 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **Privacy-First Design**을 핵심 원칙으로 하여 모든 개인정보를 암호화하여 저장합니다. 이 문서는 실제 구현 코드를 기반으로 암호화 시스템의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- 모든 개인정보는 AES-256-GCM으로 암호화
- 사용자별 독립적인 암호화 키 파생
- 키 로테이션 지원
- 데이터 무결성 검증 (변조 방지)

---

## 1. 암호화 알고리즘

### 1.1 AES-256-GCM

**선택 이유:**
- 군사급 암호화 표준
- 인증된 암호화 (Authenticated Encryption)
- 데이터 무결성 자동 검증
- 고성능

**구현 위치:** `app/lib/encryption.ts`

```typescript
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // GCM 표준 IV 길이
const AUTH_TAG_LENGTH = 16; // GCM 인증 태그 길이
const SALT_LENGTH = 64; // Salt 길이
```

### 1.2 암호화 구성 요소

**암호화된 데이터 구조:**
```
[Salt(64바이트)] + [IV(16바이트)] + [AuthTag(16바이트)] + [EncryptedData]
```

**각 구성 요소의 역할:**
- **Salt**: 키 파생용 랜덤 데이터 (매번 다른 키 생성)
- **IV (Initialization Vector)**: 암호화 초기화 벡터 (고유성 보장)
- **AuthTag**: 인증 태그 (데이터 무결성 검증)
- **EncryptedData**: 실제 암호화된 데이터

---

## 2. 키 관리 시스템

### 2.1 키 파생 (PBKDF2)

**목적**: 동일한 마스터 키에서도 매번 다른 암호화 키 생성

**구현:**
```typescript
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    password,        // 마스터 키 (ENCRYPTION_KEY)
    salt,            // 랜덤 Salt
    100000,          // 반복 횟수 (높을수록 안전하지만 느림)
    32,              // 키 길이 (256비트)
    'sha256'         // 해시 알고리즘
  );
}
```

**보안 특성:**
- Salt를 사용하여 동일한 평문도 다른 암호문 생성
- 100,000회 반복으로 브루트포스 공격 방어
- SHA-256 해시 알고리즘 사용

### 2.2 키 유효성 검사

```typescript
function validateEncryptionKey(key: string): void {
  if (!key) {
    throw new Error('ENCRYPTION_KEY 환경변수가 설정되지 않았습니다.');
  }
  
  // 32바이트 (256비트) 키가 필요
  const keyBuffer = Buffer.from(key, 'utf-8');
  if (keyBuffer.length < 32) {
    throw new Error('ENCRYPTION_KEY는 최소 32자 이상이어야 합니다.');
  }
}
```

### 2.3 키 관리 시스템

**구현 위치:** `app/lib/key-management.ts`

**기능:**
- 키 생성
- 키 강도 검사
- 키 로테이션
- 키 백업

**KeyManager 클래스:**
```typescript
export class KeyManager {
  private static instance: KeyManager;
  private keys: Map<KeyType, KeyInfo> = new Map();
  
  // 싱글톤 패턴
  public static getInstance(): KeyManager;
  
  // 키 타입: 'encryption' | 'jwt' | 'api'
  public getCurrentKey(type: KeyType): string;
  public validateKeyStrength(key: string, minLength: number): boolean;
  public rotateKey(type: KeyType): string;
}
```

---

## 3. 암호화 프로세스

### 3.1 암호화 함수

**구현:** `encryptDiary(plainText: string, encryptionKey?: string): Buffer`

**프로세스:**
1. 암호화 키 유효성 검사
2. Salt 생성 (64바이트 랜덤)
3. 키 파생 (PBKDF2)
4. IV 생성 (16바이트 랜덤)
5. Cipher 생성 (AES-256-GCM)
6. 암호화 수행
7. 인증 태그 가져오기
8. 모든 요소 결합 (Salt + IV + AuthTag + EncryptedData)

**코드 흐름:**
```typescript
export function encryptDiary(plainText: string, encryptionKey?: string): Buffer {
  // 1. 키 검증
  const key = encryptionKey || process.env.ENCRYPTION_KEY;
  validateEncryptionKey(key);

  // 2. Salt 생성
  const salt = crypto.randomBytes(SALT_LENGTH);

  // 3. 키 파생
  const derivedKey = deriveKey(key, salt);

  // 4. IV 생성
  const iv = crypto.randomBytes(IV_LENGTH);

  // 5. 암호화
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  let encrypted = cipher.update(plainText, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // 6. 인증 태그
  const authTag = cipher.getAuthTag();

  // 7. 결합
  return Buffer.concat([salt, iv, authTag, encrypted]);
}
```

### 3.2 복호화 함수

**구현:** `decryptDiary(encryptedBuffer: Buffer, encryptionKey?: string): string`

**프로세스:**
1. 버퍼에서 구성 요소 분리 (Salt, IV, AuthTag, EncryptedData)
2. 키 파생 (동일한 Salt 사용)
3. Decipher 생성
4. 인증 태그 설정
5. 복호화 수행
6. 무결성 검증 (AuthTag 자동 검증)

**코드 흐름:**
```typescript
export function decryptDiary(encryptedBuffer: Buffer, encryptionKey?: string): string {
  // 1. 구성 요소 분리
  const salt = encryptedBuffer.subarray(0, SALT_LENGTH);
  const iv = encryptedBuffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = encryptedBuffer.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = encryptedBuffer.subarray(
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );

  // 2. 키 파생
  const key = encryptionKey || process.env.ENCRYPTION_KEY;
  const derivedKey = deriveKey(key, salt);

  // 3. 복호화
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(authTag); // 무결성 검증

  // 4. 복호화 수행 (AuthTag 자동 검증)
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}
```

**보안 특징:**
- AuthTag 검증 실패 시 자동으로 예외 발생
- 데이터 변조 감지 가능
- 무결성 보장

---

## 4. 사용자별 암호화

### 4.1 사용자 암호화 유틸리티

**구현 위치:** `app/lib/user-encryption.ts`

**목적**: 사용자별로 다른 암호화 키를 사용하여 데이터 격리

**구현 방식:**
- 사용자 ID를 기반으로 키 파생
- 각 사용자의 데이터는 독립적으로 암호화
- 한 사용자의 키로 다른 사용자 데이터 복호화 불가능

---

## 5. 암호화 적용 범위

### 5.1 암호화되는 데이터

**일기 관련:**
- `DiaryEntry.content_enc`: 일기 내용
- `DiaryEntry.title`: 일기 제목

**분석 결과:**
- `AnalysisResult.title_enc`: 분석 제목
- `AnalysisResult.summary_enc`: 요약
- `AnalysisResult.emotion_flow_enc`: 감정 흐름
- `AnalysisResult.reflection_question_enc`: 자기성찰 질문
- `AnalysisResult.interpretation_enc`: 감응 해석

**사용자 정보:**
- `User.name_enc`: 이름
- `User.email_enc`: 이메일
- `User.nickname_enc`: 닉네임

### 5.2 암호화되지 않는 데이터

**메타데이터:**
- ID (UUID)
- 생성/수정 시간
- 상태 플래그
- 관계 정보 (외래키)

**해시 값:**
- `email_hash`: 이메일 해시 (검색용)
- `nickname_hash`: 닉네임 해시 (검색용)

---

## 6. 키 로테이션 전략

### 6.1 로테이션 필요성

- 보안 강화
- 키 유출 시 피해 최소화
- 규정 준수 (GDPR 등)

### 6.2 로테이션 프로세스

**구현 위치:** `app/lib/key-management.ts`

**전략:**
1. 새 키 생성
2. 기존 키를 이전 키로 보관
3. 새 데이터는 새 키로 암호화
4. 기존 데이터는 복호화 후 재암호화 (점진적)

**API 엔드포인트:**
- `POST /api/admin/rotate-keys`: 키 로테이션 실행

---

## 7. 성능 고려사항

### 7.1 암호화 오버헤드

**측정값:**
- 암호화: 약 1-2ms (1KB 데이터 기준)
- 복호화: 약 1-2ms (1KB 데이터 기준)
- 키 파생: 약 50-100ms (PBKDF2 100,000회 반복)

### 7.2 최적화 전략

**키 파생 캐싱:**
- 동일한 Salt에 대한 키 파생 결과 캐싱 (메모리)
- 서버리스 환경에서는 제한적

**병렬 처리:**
- 여러 필드 암호화 시 병렬 처리 가능
- Promise.all() 사용

---

## 8. 보안 고려사항

### 8.1 키 저장

**환경 변수:**
- `ENCRYPTION_KEY`: 마스터 암호화 키
- 절대 코드에 하드코딩하지 않음
- 환경별로 다른 키 사용

**키 강도:**
- 최소 32바이트 (256비트)
- 랜덤하게 생성된 키 사용
- 정기적인 키 강도 검사

### 8.2 데이터 무결성

**GCM 모드의 장점:**
- AuthTag로 자동 무결성 검증
- 데이터 변조 시 복호화 실패
- 추가 해시 함수 불필요

### 8.3 키 노출 시나리오

**대응 방안:**
1. 즉시 키 로테이션
2. 영향받은 데이터 재암호화
3. 보안 감사 로그 확인
4. 사용자 알림 (필요 시)

---

## 9. 구현 상세

### 9.1 주요 함수

**암호화:**
- `encryptDiary(plainText, encryptionKey?)`: 일기 내용 암호화
- `encryptUserData(data, encryptionKey?)`: 사용자 데이터 암호화

**복호화:**
- `decryptDiary(encryptedBuffer, encryptionKey?)`: 일기 내용 복호화
- `decryptUserData(encryptedBuffer, encryptionKey?)`: 사용자 데이터 복호화

**키 관리:**
- `KeyManager.getInstance()`: 키 관리자 싱글톤
- `KeyManager.rotateKey(type)`: 키 로테이션

### 9.2 에러 처리

**암호화 실패:**
- 키 누락: `Error('암호화 키가 제공되지 않았습니다.')`
- 키 강도 부족: `Error('ENCRYPTION_KEY는 최소 32자 이상이어야 합니다.')`
- 암호화 오류: `Error('일기 암호화에 실패했습니다.')`

**복호화 실패:**
- 데이터 손상: `Error('암호화된 데이터가 손상되었습니다.')`
- 무결성 검증 실패: `Error('데이터 무결성 검증 실패')`
- 키 불일치: `Error('암호화 키가 일치하지 않습니다.')`

---

## 10. 테스트 전략

### 10.1 단위 테스트

**테스트 케이스:**
- 암호화/복호화 정상 동작
- 다른 키로 복호화 시도 (실패해야 함)
- 데이터 변조 시 무결성 검증 실패
- 키 강도 검사

### 10.2 통합 테스트

**테스트 시나리오:**
- 일기 저장 시 암호화 확인
- 일기 조회 시 복호화 확인
- 키 로테이션 후 데이터 접근

---

## 11. 모니터링 및 로깅

### 11.1 암호화 이벤트 로깅

**로깅 항목:**
- 암호화 성공/실패
- 복호화 성공/실패
- 키 로테이션 이벤트
- 키 강도 검사 결과

### 11.2 보안 감사

**감사 로그:**
- 키 접근 이벤트
- 키 로테이션 이력
- 암호화 오류 빈도

---

## 12. 참고 자료

### 관련 코드 파일
- `app/lib/encryption.ts`: 핵심 암호화/복호화 함수
- `app/lib/user-encryption.ts`: 사용자별 암호화
- `app/lib/key-management.ts`: 키 관리 시스템

### 관련 문서
- [보안 개선사항](../security/SECURITY_IMPROVEMENTS.md)
- [키 관리 가이드](../security/KEY_MANAGEMENT_GUIDE.md)
- [프라이버시 제약사항](../security/PRIVACY_CONSTRAINTS_CRISIS.md)

---

## 13. 향후 개선 계획

### 13.1 계획된 개선사항

1. **키 파생 최적화**
   - Argon2 알고리즘 고려 (PBKDF2 대체)
   - 하드웨어 가속 활용

2. **암호화 성능 향상**
   - 대용량 데이터 스트리밍 암호화
   - 병렬 암호화 최적화

3. **키 관리 고도화**
   - HSM (Hardware Security Module) 통합
   - 분산 키 관리

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
