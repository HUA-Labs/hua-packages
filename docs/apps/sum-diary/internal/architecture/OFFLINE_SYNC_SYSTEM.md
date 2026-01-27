# 오프라인 및 동기화 시스템 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **Offline-First** 접근 방식을 통해 네트워크 없이도 일기를 작성하고 저장할 수 있도록 지원합니다. 이 문서는 실제 구현 코드를 기반으로 오프라인 및 동기화 시스템의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- Offline-First: 오프라인에서도 완전한 기능 제공
- 자동 동기화: 온라인 복구 시 자동 동기화
- 충돌 해결: 최신 데이터 우선
- PWA 지원: Service Worker 기반 백그라운드 동기화

---

## 1. 시스템 구조

### 1.1 오프라인 저장 플로우

```
일기 작성 시작
    ↓
네트워크 상태 확인
    ├─ 온라인: DB에 임시저장 (5초마다)
    └─ 오프라인: IndexedDB에 임시저장
    ↓
일기 저장 요청
    ├─ 온라인: 서버에 저장
    └─ 오프라인: IndexedDB에 저장 (isOffline: true)
    ↓
온라인 복구 시
    ├─ 오프라인 일기 자동 동기화
    ├─ 오프라인 임시저장 자동 동기화
    └─ IndexedDB에서 삭제
```

### 1.2 구현 위치

**주요 파일:**
- `app/lib/offline-storage.ts`: IndexedDB 유틸리티
- `app/diary/write/hooks/useNetworkSync.ts`: 네트워크 동기화 훅
- `app/diary/write/hooks/useAutoSave.ts`: 자동 저장 훅
- `app/diary/write/hooks/useDraftManagement.ts`: 임시저장 관리 훅
- `app/diary/write/hooks/usePostSaveCleanup.ts`: 저장 후 정리 훅

---

## 2. IndexedDB 구조

### 2.1 데이터베이스 스키마

**데이터베이스 이름:** `my-app-offline`

**버전:** 3 (drafts object store 추가)

**Object Stores:**

**diaries:**
- 일기 데이터 저장
- 키: `id`
- 인덱스: `by-date`, `by-created`

**snapshots:**
- 스냅샷 데이터 저장 (10초 주기, 최대 3개)
- 키: `id`
- 인덱스: `by-date`, `by-version`

**drafts:**
- 임시저장 데이터 저장
- 키: `id`
- 인덱스: `by-user-updated`

### 2.2 데이터 구조

**일기 (diaries):**
```typescript
{
  id: string; // "offline_{timestamp}_{random}"
  title: string;
  content_enc: string; // Base64 인코딩된 내용
  diary_date: string;
  actual_written_at: string;
  is_delayed_entry: boolean;
  isOffline: boolean; // true
  createdAt: string;
  updatedAt: string;
}
```

**스냅샷 (snapshots):**
```typescript
{
  id: string; // "snapshot_{timestamp}_{random}"
  content_enc: string; // Base64 인코딩된 내용
  diary_date: string;
  version: number;
  createdAt: string;
}
```

**임시저장 (drafts):**
```typescript
{
  id: string; // "draft_{userId}_{diaryDate}_{timestamp}"
  userId: string;
  content_enc: string; // Base64 인코딩된 내용
  diaryDate: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. 오프라인 저장

### 3.1 일기 저장

**구현:** `saveDiaryOffline(diaryData)`

**프로세스:**
1. IndexedDB 초기화
2. 고유 ID 생성 (`offline_{timestamp}_{random}`)
3. 내용 Base64 인코딩 (UTF-8 → Base64)
4. 일기 데이터 저장
5. ID 반환

**Base64 인코딩:**
- UTF-8 인코딩 후 Base64 변환
- 큰 배열 처리: 8192 바이트 청크 단위로 처리
- 스택 오버플로우 방지

**코드:**
```typescript
async saveDiaryOffline(diaryData: {
  title: string;
  content: string;
  diary_date: string;
  is_delayed_entry?: boolean;
}): Promise<string> {
  const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // UTF-8 인코딩 후 Base64
  const utf8Bytes = new TextEncoder().encode(diaryData.content);
  let binaryString = '';
  for (let i = 0; i < utf8Bytes.length; i += 8192) {
    const chunk = utf8Bytes.slice(i, i + 8192);
    binaryString += String.fromCharCode(...chunk);
  }
  const content_enc = btoa(binaryString);
  
  await this.db!.add('diaries', {
    id,
    title: diaryData.title,
    content_enc,
    diary_date: diaryData.diary_date,
    isOffline: true,
    // ... 기타 필드
  });
  
  return id;
}
```

### 3.2 일기 조회

**구현:** `getOfflineDiaries()`

**프로세스:**
1. IndexedDB에서 모든 일기 조회
2. Base64 디코딩
3. UTF-8 디코딩
4. 평문 반환

**디코딩:**
- Base64 → Binary String
- Binary String → Uint8Array
- Uint8Array → UTF-8 문자열

### 3.3 일기 삭제

**구현:** `deleteOfflineDiary(id)`

**사용 시점:**
- 동기화 성공 후
- 사용자 삭제 시

---

## 4. 임시저장 시스템

### 4.1 임시저장 저장

**구현:** `saveDraft(draftData)`

**프로세스:**
1. 고유 ID 생성 (`draft_{userId}_{diaryDate}_{timestamp}`)
2. 내용 Base64 인코딩
3. IndexedDB에 저장
4. 오래된 임시저장 정리 (10개 초과 시)

**오래된 임시저장 정리:**
- 사용자당 최대 10개 유지
- 오래된 것부터 삭제

**코드:**
```typescript
async saveDraft(draftData: {
  userId: string;
  content: string;
  diaryDate: string;
}): Promise<{ id: string; deletedCount: number }> {
  const id = `draft_${draftData.userId}_${draftData.diaryDate}_${Date.now()}`;
  
  // Base64 인코딩
  const content_enc = btoa(/* UTF-8 인코딩된 내용 */);
  
  await this.db!.put('drafts', {
    id,
    userId: draftData.userId,
    content_enc,
    diaryDate: draftData.diaryDate,
    // ... 기타 필드
  });
  
  // 오래된 draft 정리
  const deletedCount = await this.cleanupOldDrafts(draftData.userId);
  
  return { id, deletedCount };
}
```

### 4.2 임시저장 조회

**구현:** `getDrafts(userId, options?)`

**정렬:**
- `updatedAt` 내림차순 (최신순)
- 인덱스 `by-user-updated` 활용

**제한:**
- 기본 10개
- 옵션으로 limit 지정 가능

### 4.3 임시저장 삭제

**구현:**
- `deleteDraft(draftId)`: 단일 삭제
- `deleteDrafts(draftIds)`: 배치 삭제
- `deleteAllDrafts(userId)`: 전체 삭제

---

## 5. 자동 저장 시스템

### 5.1 자동 저장 훅

**구현 위치:** `app/diary/write/hooks/useAutoSave.ts`

**함수:** `useAutoSave(props)`

**프로세스:**
1. 내용 변경 감지
2. 5초 대기 (debounce)
3. 네트워크 상태 확인
4. 온라인: DB에 저장
5. 오프라인: IndexedDB에 저장

**저장 조건:**
- 내용이 실제로 변경됨
- 로그인한 사용자
- 저장 중이 아님
- 연속 에러가 너무 많지 않음

**에러 처리:**
- 최대 3회 재시도
- 30초 대기 후 재시도
- 오프라인 모드로 폴백

### 5.2 저장 상태

**상태:**
- `saved`: 저장 완료
- `saving`: 저장 중
- `unsaved`: 저장되지 않음

**표시:**
- UI에 상태 표시
- 사용자에게 피드백 제공

---

## 6. 네트워크 상태 감지

### 6.1 NetworkStatus 클래스

**구현 위치:** `app/lib/offline-storage.ts`

**특징:**
- 싱글톤 패턴
- 브라우저 이벤트 리스너
- 실제 네트워크 연결 검증

**이벤트:**
- `online`: 온라인 전환
- `offline`: 오프라인 전환

**검증:**
- `navigator.onLine` 확인
- 실제 네트워크 요청으로 검증 (HEAD 요청)
- 2초 타임아웃

### 6.2 네트워크 동기화 훅

**구현 위치:** `app/diary/write/hooks/useNetworkSync.ts`

**함수:** `useNetworkSync(props)`

**기능:**
1. 네트워크 상태 감지
2. 오프라인 일기 개수 확인
3. 온라인 복구 시 자동 동기화
4. Service Worker 메시지 리스너

**동기화 트리거:**
- 온라인 전환 시
- Service Worker 동기화 완료 시

---

## 7. 동기화 프로세스

### 7.1 오프라인 일기 동기화

**프로세스:**
1. 오프라인 일기 조회
2. 각 일기를 서버에 저장
3. 성공 시 IndexedDB에서 삭제
4. 실패 시 유지 (재시도)

**백그라운드 동기화:**
- Service Worker를 통한 백그라운드 동기화
- `triggerBackgroundSync()` 호출

### 7.2 오프라인 임시저장 동기화

**구현:** `syncOfflineDrafts()`

**프로세스:**
1. IndexedDB에서 오프라인 임시저장 조회
2. 각 임시저장을 서버에 동기화
3. 성공 시 IndexedDB에서 삭제
4. 결과 토스트 표시

**중복 실행 방지:**
- `isSyncingRef`로 중복 실행 방지
- 동기화 중이면 스킵

### 7.3 동기화 결과 처리

**성공:**
- 토스트 알림
- 일기 개수 갱신
- 임시저장 개수 갱신
- 분석 알림 (완성된 일기)

**실패:**
- 에러 토스트
- IndexedDB에 유지
- 재시도 가능

---

## 8. 스냅샷 시스템

### 8.1 스냅샷 저장

**구현:** `saveSnapshot(content, diaryDate)`

**목적:**
- 일기 작성 중 자동 백업
- 복구 가능한 버전 관리

**전략:**
- 10초 주기 저장
- 날짜별 최대 3개 버전
- 오래된 버전 자동 삭제

**코드:**
```typescript
async saveSnapshot(content: string, diaryDate: string): Promise<void> {
  // 기존 스냅샷 조회
  const existingSnapshots = await this.db!.getAllFromIndex('snapshots', 'by-date', diaryDate);
  
  // 최대 3개까지만 유지
  if (existingSnapshots.length >= 3) {
    const oldestSnapshot = existingSnapshots.sort(...)[0];
    await this.db!.delete('snapshots', oldestSnapshot.id);
  }
  
  // 새 스냅샷 저장
  await this.db!.add('snapshots', {
    id: `snapshot_${Date.now()}_${Math.random()}`,
    content_enc: btoa(/* Base64 인코딩 */),
    diary_date: diaryDate,
    version: existingSnapshots.length + 1,
    createdAt: new Date().toISOString(),
  });
}
```

### 8.2 스냅샷 조회

**구현:**
- `getLatestSnapshot(diaryDate)`: 최신 스냅샷
- `getSnapshots(diaryDate)`: 모든 스냅샷

---

## 9. localStorage 마이그레이션

### 9.1 마이그레이션 프로세스

**목적:**
- 기존 localStorage draft를 IndexedDB로 이동
- 일관된 저장소 사용

**프로세스:**
1. 초기화 시 한 번 실행
2. `draft_`로 시작하는 키 찾기
3. 각 draft를 IndexedDB로 마이그레이션
4. localStorage에서 삭제
5. 마이그레이션 완료 표시

**구현:** `migrateLocalStorageDrafts()`

**키 형식:**
- `draft_{userId}_{diaryDate}`

### 9.2 발견 시 마이그레이션

**구현:** `migrateLocalStorageDraftIfFound(userId, diaryDate)`

**목적:**
- 로드 시 발견된 draft 자동 마이그레이션
- 사용자 경험 보호

---

## 10. Service Worker 통합

### 10.1 백그라운드 동기화

**구현:** `triggerBackgroundSync()`

**프로세스:**
1. Service Worker 등록 확인
2. Background Sync API 확인
3. 동기화 태그 등록 (`diary-sync`)

**지원 브라우저:**
- Chrome, Edge (Service Worker + Background Sync 지원)

### 10.2 동기화 완료 알림

**Service Worker 메시지:**
```typescript
{
  type: 'DIARY_SYNC_COMPLETE',
  count: number,
  completedCount: number,
  draftCount: number,
  failed: number
}
```

**처리:**
- 토스트 알림 표시
- 일기 개수 갱신
- 임시저장 모달 표시 (필요 시)

---

## 11. 충돌 해결

### 11.1 충돌 해결 전략

**최신 데이터 우선:**
- 서버 데이터가 최신
- 오프라인 데이터는 덮어쓰기

**임시저장 충돌:**
- 같은 날짜의 임시저장은 업데이트
- 다른 날짜는 새로 생성

### 11.2 데이터 일관성

**전략:**
- 트랜잭션 사용
- 원자적 연산
- 실패 시 롤백

---

## 12. 구현 상세

### 12.1 주요 함수

**오프라인 저장:**
- `saveDiaryOffline(diaryData)`: 일기 오프라인 저장
- `getOfflineDiaries()`: 오프라인 일기 조회
- `deleteOfflineDiary(id)`: 오프라인 일기 삭제
- `getOfflineDiaryCount()`: 오프라인 일기 개수

**임시저장:**
- `saveDraft(draftData)`: 임시저장 저장
- `getDrafts(userId, options?)`: 임시저장 조회
- `deleteDraft(draftId)`: 임시저장 삭제
- `deleteAllDrafts(userId)`: 전체 임시저장 삭제

**스냅샷:**
- `saveSnapshot(content, diaryDate)`: 스냅샷 저장
- `getLatestSnapshot(diaryDate)`: 최신 스냅샷 조회
- `getSnapshots(diaryDate)`: 모든 스냅샷 조회

**네트워크:**
- `networkStatus.getOnlineStatus()`: 온라인 상태 확인
- `networkStatus.addListener(listener)`: 상태 변경 리스너

**동기화:**
- `syncOfflineDrafts()`: 오프라인 임시저장 동기화
- `triggerBackgroundSync()`: 백그라운드 동기화 트리거

### 12.2 커스텀 훅

**useNetworkSync:**
- 네트워크 상태 감지
- 오프라인 일기 개수 확인
- 자동 동기화

**useAutoSave:**
- 자동 임시저장 (5초마다)
- 온라인/오프라인 분기
- 에러 처리 및 재시도

**useDraftManagement:**
- 임시저장 개수 조회
- 임시저장 불러오기
- 임시저장 삭제

---

## 13. 성능 고려사항

### 13.1 Base64 인코딩 최적화

**전략:**
- 청크 단위 처리 (8192 바이트)
- 스택 오버플로우 방지
- 큰 데이터 처리 가능

### 13.2 인덱스 활용

**인덱스:**
- `by-date`: 날짜별 조회
- `by-created`: 생성일 기준 정렬
- `by-user-updated`: 사용자별 최신순

### 13.3 비동기 처리

**전략:**
- 모든 IndexedDB 작업 비동기
- 동기화는 백그라운드 처리
- 사용자 경험 보호

---

## 14. 보안 고려사항

### 14.1 데이터 암호화

**오프라인 저장:**
- Base64 인코딩만 사용 (임시 저장)
- 실제 암호화는 서버에서 수행
- 동기화 시 서버에서 암호화

### 14.2 데이터 정리

**전략:**
- 오래된 임시저장 자동 삭제
- 스냅샷 버전 제한
- 사용자 데이터 보호

---

## 15. 참고 자료

### 관련 코드 파일
- `app/lib/offline-storage.ts`: IndexedDB 유틸리티
- `app/diary/write/hooks/useNetworkSync.ts`: 네트워크 동기화
- `app/diary/write/hooks/useAutoSave.ts`: 자동 저장
- `app/diary/write/hooks/useDraftManagement.ts`: 임시저장 관리
- `app/diary/write/utils/draftUtils.ts`: 임시저장 유틸리티

### 관련 문서
- [프론트엔드 아키텍처](./FRONTEND_ARCHITECTURE.md) (작성 예정)

---

## 16. 향후 개선 계획

### 16.1 계획된 개선사항

1. **충돌 해결 고도화**
   - 사용자 선택 가능
   - 병합 기능

2. **오프라인 분석**
   - 로컬 AI 분석 (향후)
   - 오프라인 분석 결과 표시

3. **동기화 최적화**
   - 증분 동기화
   - 압축 전송

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
