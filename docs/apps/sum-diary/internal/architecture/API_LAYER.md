# API 레이어 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **Next.js API Routes**를 사용하여 서버리스 API 엔드포인트를 구현합니다. 이 문서는 실제 구현 코드를 기반으로 API 레이어의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- RESTful API 설계
- 통합 에러 처리
- 미들웨어 체인
- 인증 및 권한 검증
- Rate Limiting 및 Quota 체크

---

## 1. API 구조

### 1.1 API 라우트 구조

```
app/api/
├── auth/
│   ├── [...nextauth]/route.ts      # NextAuth 핸들러
│   └── register/route.ts            # 회원가입
├── diary/
│   ├── route.ts                     # 일기 목록 조회
│   ├── create/route.ts              # 일기 생성
│   ├── [id]/route.ts                # 일기 조회/삭제
│   ├── analyze/stream/route.ts       # SSE 스트리밍 분석
│   ├── draft/route.ts               # 임시저장 관리
│   └── [id]/share-image/route.ts    # 일기 공유 이미지
├── search/route.ts                  # 검색
├── user/
│   ├── profile/route.ts             # 프로필 조회/수정
│   ├── settings/route.ts            # 사용자 설정
│   └── migrate-guest-diaries/route.ts # 게스트 일기 마이그레이션
├── admin/
│   ├── users/route.ts               # 사용자 관리
│   ├── diaries/route.ts             # 일기 관리
│   ├── crisis-alerts/route.ts       # 위기 알림 관리
│   └── abuse-alerts/route.ts        # 악용 알림 관리
└── ...
```

### 1.2 HTTP 메서드

**주요 메서드:**
- `GET`: 조회
- `POST`: 생성
- `PUT`: 수정
- `DELETE`: 삭제

---

## 2. 공통 미들웨어 패턴

### 2.1 인증 미들웨어

**구현:**
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**게스트 모드 지원:**
```typescript
let userId = session?.user?.id;
let isGuest = false;

if (!userId) {
  // 게스트 사용자 생성/조회
  const guestUser = await getOrCreateGuestUser(request, 'diary_write');
  userId = guestUser.id;
  isGuest = true;
}
```

### 2.2 User-Agent 검증

**구현:**
```typescript
const userAgent = request.headers.get('user-agent') || '';
const { isSuspiciousUserAgent } = await import('@/app/lib/guest-limiter');

if (userAgent && isSuspiciousUserAgent(userAgent)) {
  return NextResponse.json(
    { error: '의심스러운 요청이 감지되었습니다.' },
    { status: 403 }
  );
}
```

### 2.3 입력 검증 및 Sanitization

**구현:**
```typescript
// 내용 검증
if (!content || typeof content !== 'string') {
  return NextResponse.json(
    { error: '일기 내용이 필요합니다.' },
    { status: 400 }
  );
}

// XSS 방지
content = sanitizeInput(content);

// 길이 제한
if (content.length > 10000) {
  return NextResponse.json(
    { error: '일기 내용은 10,000자를 초과할 수 없습니다.' },
    { status: 400 }
  );
}
```

### 2.4 제한 체크 미들웨어

**구현:**
```typescript
// 통합 제한 체크
await checkAllLimits(userId, ip, userAgent);
```

**체크 항목:**
- Rate Limit
- 동시 실행 제한
- Quota (일일/월간)

---

## 3. 주요 API 엔드포인트

### 3.1 일기 관련 API

#### POST /api/diary/create

**기능:** 일기 생성

**프로세스:**
1. 세션 확인 (게스트 모드 지원)
2. User-Agent 검증
3. 게스트 제한 체크 (게스트인 경우)
4. 입력 검증 및 Sanitization
5. 통합 제한 체크 (로그인 사용자)
6. 일기 내용 암호화
7. 트랜잭션으로 저장
8. AnalysisResult PENDING 생성
9. 임시저장 삭제 (비동기)

**요청:**
```typescript
{
  title?: string;
  content: string;
  diaryDate?: string;
}
```

**응답:**
```typescript
{
  success: boolean;
  isGuest: boolean;
  message: string;
  diaryId: string;
}
```

#### GET /api/diary

**기능:** 일기 목록 조회

**프로세스:**
1. 세션 확인
2. 게스트 일기 포함 조회
3. 삭제되지 않은 일기만 필터링
4. 임시저장 제외
5. 분석 결과 복호화
6. 정렬 (최신순)

**응답:**
```typescript
{
  diaries: Array<{
    id: string;
    title: string;
    content: string;
    content_preview: string;
    diaryDate: string;
    analysisResult: {
      emotionFlow: string[];
      interpretation: string;
      reflection_question: string;
    } | null;
  }>;
}
```

#### GET /api/diary/[id]

**기능:** 일기 상세 조회

**프로세스:**
1. 세션 확인
2. 일기 조회 (사용자 확인)
3. 내용 복호화
4. 분석 결과 복호화
5. 반환

#### DELETE /api/diary/[id]

**기능:** 일기 삭제

**프로세스:**
1. 세션 확인
2. 일기 소유권 확인
3. 소프트 삭제 (deleted_at 설정)
4. deleted_by 설정

#### GET /api/diary/analyze/stream?diaryId=xxx

**기능:** SSE 스트리밍 분석

**프로세스:**
1. 일기 조회 및 복호화
2. AI 분석 시작
3. 스트리밍 응답 전송
4. 섹션별 파싱 및 전송
5. 분석 결과 저장
6. Quota 증가
7. 비용 집계

**응답 형식:**
```
data: {"type": "section", "section": "summary", "content": "..."}

data: {"type": "section", "section": "emotion_flow", "content": "..."}

data: {"type": "complete", "diaryId": "..."}
```

### 3.2 검색 API

#### GET /api/search?q=검색어&sortBy=newest

**기능:** 일기 검색

**프로세스:**
1. 세션 확인
2. 검색어 검증
3. 일기 조회 (제목, 내용)
4. 복호화 후 검색어 필터링
5. 분석 결과에서도 검색
6. 정렬 (최신순, 오래된순, 제목순)

**검색 범위:**
- 일기 제목
- 일기 내용
- 감정 분석 결과

### 3.3 임시저장 API

#### POST /api/diary/draft

**기능:** 임시저장 저장

**프로세스:**
1. 세션 확인
2. 입력 검증
3. 같은 날짜의 기존 임시저장 확인
4. 업데이트 또는 생성
5. 암호화 저장

#### GET /api/diary/draft?date=YYYY-MM-DD

**기능:** 특정 날짜의 임시저장 조회

#### GET /api/diary/draft/list

**기능:** 임시저장 목록 조회

#### DELETE /api/diary/draft?id=xxx

**기능:** 임시저장 삭제

### 3.4 사용자 API

#### GET /api/user/profile

**기능:** 프로필 조회

#### PUT /api/user/profile

**기능:** 프로필 수정

#### GET /api/user/settings

**기능:** 사용자 설정 조회

#### PUT /api/user/settings

**기능:** 사용자 설정 수정

#### POST /api/user/migrate-guest-diaries

**기능:** 게스트 일기 마이그레이션

### 3.5 관리자 API

#### GET /api/admin/users

**기능:** 사용자 목록 조회

**권한:** 관리자만

#### GET /api/admin/diaries

**기능:** 일기 목록 조회 (관리자)

**권한:** 관리자만

#### GET /api/admin/crisis-alerts

**기능:** 위기 알림 목록 조회

**권한:** 관리자만

#### GET /api/admin/abuse-alerts

**기능:** 악용 알림 목록 조회

**권한:** 관리자만

---

## 4. 에러 처리

### 4.1 에러 타입

**구현 위치:** `app/lib/api-error.ts`

**에러 클래스:**
- `ApiError`: 일반 API 에러
- `AuthRequiredError`: 인증 필요
- `QuotaExceededError`: 할당량 초과
- `RateLimitExceededError`: Rate Limit 초과
- `ConcurrentLimitExceededError`: 동시 실행 제한 초과

### 4.2 에러 처리 패턴

**구현:**
```typescript
try {
  // API 로직
} catch (error) {
  if (error instanceof AuthRequiredError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof QuotaExceededError) {
    return NextResponse.json(
      {
        error: error.message,
        quota: {
          remaining: error.quota.remaining,
          resetAt: error.quota.resetAt.toISOString(),
        },
      },
      { status: 403 }
    );
  }
  // ...
  
  return NextResponse.json(
    {
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    },
    { status: 500 }
  );
}
```

### 4.3 HTTP 상태 코드

**사용되는 상태 코드:**
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 필요
- `403`: 권한 없음 / 제한 초과
- `404`: 리소스 없음
- `409`: 충돌 (중복)
- `429`: Rate Limit 초과
- `500`: 서버 오류

---

## 5. SSE 스트리밍

### 5.1 스트리밍 분석 API

**구현 위치:** `app/api/diary/analyze/stream/route.ts`

**특징:**
- Server-Sent Events (SSE)
- 실시간 분석 결과 전송
- 섹션별 순차 전송

**프로세스:**
1. ReadableStream 생성
2. OpenAI 스트리밍 API 호출
3. 스트림 데이터 파싱
4. 섹션별로 클라이언트에 전송
5. 완료 시 최종 결과 저장

**전송 형식:**
```typescript
// 섹션 전송
data: {"type": "section", "section": "summary", "content": "..."}

// 완료
data: {"type": "complete", "diaryId": "..."}
```

### 5.2 스트림 관리

**Controller 상태 확인:**
- `controller.desiredSize` 확인
- 이미 닫혔으면 전송 중단
- 에러 처리 및 안전한 종료

---

## 6. 트랜잭션 처리

### 6.1 트랜잭션 사용

**일기 생성 시:**
```typescript
const savedDiary = await prisma.$transaction(async (tx) => {
  const diary = await tx.diaryEntry.create({...});
  await tx.analysisResult.create({...});
  return diary;
});
```

**트랜잭션 옵션:**
- `timeout: 30000` (30초)
- `maxWait: 10000` (10초)

---

## 7. 데이터 암호화/복호화

### 7.1 저장 시 암호화

**일기 내용:**
```typescript
const encryptedContent = encryptDiary(content);
```

**분석 결과:**
```typescript
const encryptedTitle = encryptAnalysisResult(title);
const encryptedSummary = encryptAnalysisResult(summary);
// ...
```

### 7.2 조회 시 복호화

**일기 내용:**
```typescript
const decryptedContent = decryptDiary(Buffer.from(diary.content_enc));
```

**분석 결과:**
```typescript
const decryptedInterpretation = decryptAnalysisResult(
  Buffer.from(analysisResult.interpretation_enc)
);
```

### 7.3 하위 호환성

**구현:**
- GCM 방식 먼저 시도
- 실패 시 CBC 방식 시도
- 기존 데이터 호환성 유지

---

## 8. 구현 상세

### 8.1 주요 API 엔드포인트

**일기:**
- `POST /api/diary/create`: 일기 생성
- `GET /api/diary`: 일기 목록
- `GET /api/diary/[id]`: 일기 상세
- `DELETE /api/diary/[id]`: 일기 삭제
- `GET /api/diary/analyze/stream`: SSE 스트리밍 분석

**임시저장:**
- `POST /api/diary/draft`: 임시저장 저장
- `GET /api/diary/draft`: 임시저장 조회
- `GET /api/diary/draft/list`: 임시저장 목록
- `DELETE /api/diary/draft`: 임시저장 삭제

**검색:**
- `GET /api/search`: 일기 검색

**사용자:**
- `GET /api/user/profile`: 프로필 조회
- `PUT /api/user/profile`: 프로필 수정
- `GET /api/user/settings`: 설정 조회
- `PUT /api/user/settings`: 설정 수정

**관리자:**
- `GET /api/admin/users`: 사용자 목록
- `GET /api/admin/diaries`: 일기 목록
- `GET /api/admin/crisis-alerts`: 위기 알림 목록
- `GET /api/admin/abuse-alerts`: 악용 알림 목록

### 8.2 공통 패턴

**인증:**
- `getServerSession(authOptions)`
- 게스트 모드 지원

**에러 처리:**
- 통합 try-catch
- 에러 타입별 분기
- 사용자 친화적 메시지

**입력 검증:**
- 타입 검증
- 길이 제한
- Sanitization

---

## 9. 성능 고려사항

### 9.1 비동기 처리

**전략:**
- 임시저장 삭제는 비동기
- 위기 감지는 비동기
- 악용 감지는 비동기

### 9.2 쿼리 최적화

**전략:**
- 필요한 필드만 선택
- 인덱스 활용
- 관계 데이터 선택적 포함

### 9.3 병렬 처리

**전략:**
- 독립적인 작업은 병렬 실행
- `Promise.all()` 활용

---

## 10. 보안 고려사항

### 10.1 인증 및 권한

**전략:**
- 모든 API에서 세션 확인
- 관리자 API는 추가 권한 확인
- 게스트 모드 제한

### 10.2 입력 검증

**전략:**
- 타입 검증
- 길이 제한
- XSS 방지 (Sanitization)

### 10.3 Rate Limiting

**전략:**
- 사용자별 제한
- IP별 제한
- User-Agent 검증

---

## 11. 참고 자료

### 관련 코드 파일
- `app/api/`: 모든 API 라우트
- `app/lib/api-error.ts`: 에러 처리

### 관련 문서
- [인증 및 권한 관리](./AUTH_AND_AUTHORIZATION.md)
- [할당량 및 비용 관리](./QUOTA_AND_BILLING_SYSTEM.md)
- [악용 탐지 시스템](./ABUSE_DETECTION_SYSTEM.md)

---

## 12. 향후 개선 계획

### 12.1 계획된 개선사항

1. **API 버전 관리**
   - `/api/v1/` 경로 추가
   - 하위 호환성 유지

2. **GraphQL 지원**
   - 선택적 GraphQL 엔드포인트
   - REST와 병행

3. **API 문서화**
   - OpenAPI/Swagger 스펙
   - 자동 문서 생성

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
