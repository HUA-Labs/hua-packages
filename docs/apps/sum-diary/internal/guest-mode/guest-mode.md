# 게스트 모드

> 최종 업데이트: 2025-12-16

## 개요

숨다이어리는 로그인 없이도 일기를 작성할 수 있는 게스트 모드를 제공합니다. 게스트로 작성한 일기는 나중에 로그인 시 자동으로 계정에 연결됩니다.

## 주요 기능

### 1. 게스트 일기 작성
- **로그인 불필요**: 회원가입/로그인 없이 일기 작성 가능
- **IP 기반 식별**: IP 주소를 기반으로 일관된 게스트 ID 생성
- **제한적 기능**: 일기 작성 및 분석만 가능 (목록 조회, 검색 등 제한)

### 2. 게스트 일기 마이그레이션
- **자동 마이그레이션**: 로그인/회원가입 시 자동으로 게스트 일기를 계정에 연결
- **트랜잭션 처리**: 일기 및 관련 데이터 원자적 마이그레이션
- **중복 방지**: 이미 마이그레이션된 일기는 제외

## 제한사항

### 일기 작성 제한
- **IP당 24시간당 3회**
- **Rate Limiting**: 분당 5회 요청
- **User-Agent 필터링**: 봇/크롤러 차단

### 기능 제한
- 일기 목록 조회 불가 (로그인 필요)
- 검색 기능 불가 (로그인 필요)
- 프로필 설정 불가
- 알림 조회 불가

## 기술 구현

### 게스트 ID 생성

```typescript
function generateGuestId(ip: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(ip + SALT);
  const hashHex = hash.digest('hex');
  
  // UUID 형식으로 변환 (8-4-4-4-12)
  return `${hashHex.slice(0, 8)}-${hashHex.slice(8, 12)}-${hashHex.slice(12, 16)}-${hashHex.slice(16, 20)}-${hashHex.slice(20, 32)}`;
}
```

- SHA-256 해시로 IP 주소를 일관된 ID로 변환
- 같은 IP에서는 항상 같은 게스트 ID 생성

### 게스트 제한 체크

```typescript
export async function checkGuestLimits(
  request: NextRequest,
  endpoint: string
): Promise<{ allowed: boolean; reason?: string }> {
  const ip = getClientIP(request);
  
  // 일기 작성 횟수 체크
  const usageCheck = await checkGuestUsageLimit(ip, 'diary_write');
  if (!usageCheck.allowed) {
    return { allowed: false, reason: usageCheck.reason };
  }
  
  // Rate Limiting 체크
  const rateCheck = await checkRateLimit(ip, endpoint);
  if (!rateCheck.allowed) {
    return { allowed: false, reason: 'RATE_LIMIT_EXCEEDED' };
  }
  
  return { allowed: true };
}
```

### 게스트 일기 마이그레이션

```typescript
export async function migrateGuestDiaries(
  guestId: string,
  userId: string
): Promise<{ migrated: number; errors: number }> {
  return await prisma.$transaction(async (tx) => {
    // 게스트 일기 조회
    const guestDiaries = await tx.diaryEntry.findMany({
      where: { user_id: guestId, is_deleted: false }
    });
    
    let migrated = 0;
    let errors = 0;
    
    for (const diary of guestDiaries) {
      try {
        // user_id 업데이트
        await tx.diaryEntry.update({
          where: { id: diary.id },
          data: { user_id: userId }
        });
        
        // 관련 데이터 업데이트 (AnalysisResult, DiaryKeywords 등)
        await updateRelatedData(tx, diary.id, userId);
        
        migrated++;
      } catch (error) {
        console.error(`일기 마이그레이션 실패: ${diary.id}`, error);
        errors++;
      }
    }
    
    return { migrated, errors };
  });
}
```

## 사용자 경험

### 게스트로 일기 작성
1. 로그인 없이 일기 작성 페이지 접근
2. 일기 작성 및 분석 수행
3. 게스트 사용량 안내 표시

### 로그인/회원가입 시
1. 대시보드 접근 시 자동으로 게스트 일기 확인
2. 게스트 일기가 있으면 마이그레이션 실행
3. 마이그레이션 완료 알림 표시
   - "X개의 일기가 연결되었습니다"

## 보안 고려사항

### IP 기반 제한
- **장점**: 간단하고 효과적
- **단점**: 공용 IP 사용 시 제한 공유

### Rate Limiting
- 분당 5회 요청 제한
- 초과 시 429 Too Many Requests 응답

### User-Agent 필터링
- 봇/크롤러 User-Agent 차단
- 의심스러운 패턴 감지

## 문제 해결

### 게스트 일기가 마이그레이션되지 않는 경우
1. IP 주소가 변경되었는지 확인
2. 게스트 일기 존재 여부 확인 (`/api/user/migrate-guest-diaries` GET)
3. 수동 마이그레이션 실행 (`/api/user/migrate-guest-diaries` POST)

### 게스트 제한에 걸린 경우
1. 24시간 대기 (일기 작성 제한)
2. 요청 빈도 줄이기 (Rate Limiting)
3. 로그인하여 제한 해제

---

**최종 업데이트**: 2025-11-07

