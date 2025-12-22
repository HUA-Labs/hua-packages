# 오프라인 지원 및 PWA 기능

> 최종 업데이트: 2025-12-16

## 개요

숨다이어리는 IndexedDB와 Service Worker를 활용하여 오프라인에서도 일기를 작성하고, 네트워크 복구 시 자동으로 동기화하는 기능을 제공합니다.

## 주요 기능

### 1. 오프라인 일기 작성
- **IndexedDB 저장**: 네트워크 없이도 일기 작성 가능
- **자동 동기화**: 온라인 복구 시 백그라운드에서 자동 동기화
- **임시저장**: 5초마다 자동 저장 (온라인: DB, 오프라인: IndexedDB)
- **스냅샷**: 10초 주기 자동 스냅샷 (최대 3개 버전)

### 2. PWA (Progressive Web App)
- **설치 가능**: 홈 화면에 추가 가능
- **오프라인 캐싱**: 주요 페이지 및 정적 자산 캐싱
- **백그라운드 동기화**: Service Worker를 통한 백그라운드 동기화
- **앱 아이콘**: 다양한 크기의 아이콘 제공

## 기술 구현

### IndexedDB 스키마

```typescript
interface DiaryDB extends DBSchema {
  diaries: {
    key: string;
    value: {
      id: string;
      title: string;
      content_enc: string; // 암호화된 내용
      diary_date: string;
      actual_written_at: string;
      is_delayed_entry: boolean;
      isOffline: boolean;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-date': string; 'by-created': string };
  };
  snapshots: {
    key: string;
    value: {
      id: string;
      content_enc: string;
      diary_date: string;
      version: number;
      createdAt: string;
    };
    indexes: { 'by-date': string; 'by-version': number };
  };
  drafts: {
    key: string;
    value: {
      id: string;
      userId: string;
      content_enc: string;
      diaryDate: string;
      createdAt: string;
      updatedAt: string;
    };
    indexes: { 'by-user-updated': [string, string] };
  };
}
```

### 주요 함수

#### 오프라인 일기 저장
```typescript
saveDiaryOffline(diary: OfflineDiary): Promise<void>
```
- IndexedDB에 오프라인 일기 저장
- `isOffline: true` 플래그 설정

#### 오프라인 일기 조회
```typescript
getOfflineDiaries(): Promise<OfflineDiary[]>
```
- IndexedDB에서 오프라인 일기 목록 조회
- 최신순 정렬

#### 오프라인 일기 삭제
```typescript
deleteOfflineDiary(diaryId: string): Promise<void>
```
- 동기화 성공 후 IndexedDB에서 삭제

#### 임시저장
```typescript
saveDraft(draft: Draft): Promise<void>
getDrafts(): Promise<Draft[]>
deleteDraft(draftId: string): Promise<void>
```
- 최대 10개 제한 (초과 시 오래된 것 자동 삭제)
- 같은 날짜의 30초 이내 임시저장은 업데이트

#### 스냅샷
```typescript
saveSnapshot(snapshot: Snapshot): Promise<void>
getLatestSnapshot(diaryDate: string): Promise<Snapshot | null>
```
- 10초 주기 자동 스냅샷 (최대 3개 버전)

### Service Worker

#### 백그라운드 동기화
```javascript
self.addEventListener('sync', (event) => {
  if (event.tag === 'diary-sync') {
    event.waitUntil(syncOfflineDiaries());
  }
});
```

#### 동기화 프로세스
1. IndexedDB에서 오프라인 일기 조회
2. 각 일기를 `/api/diary/create`로 전송
3. 성공 시 IndexedDB에서 삭제
4. 완료 알림 전송

### 네트워크 상태 감지

```typescript
class NetworkStatus {
  private static instance: NetworkStatus;
  private isOnline: boolean = navigator.onLine;
  
  static getInstance(): NetworkStatus;
  getStatus(): boolean;
  addListener(callback: (isOnline: boolean) => void): void;
  removeListener(callback: (isOnline: boolean) => void): void;
}
```

- 싱글톤 패턴으로 전역 네트워크 상태 관리
- `online`/`offline` 이벤트 리스너
- 실제 네트워크 연결 확인 (HEAD 요청)

## PWA 설정

### manifest.json

```json
{
  "name": "숨다이어리",
  "short_name": "숨다이어리",
  "description": "감정 기반 AI 일기 작성 앱",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "icons": [...],
  "shortcuts": [
    {
      "name": "새 일기 작성",
      "url": "/diary/write"
    },
    {
      "name": "내 일기 보기",
      "url": "/diary"
    }
  ]
}
```

### Service Worker 등록

```typescript
// ServiceWorkerRegistration.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

## 사용자 경험

### 오프라인 모드 진입
1. 네트워크 연결 끊김 감지
2. 네트워크 상태 배지 표시
3. 오프라인 일기 작성 가능

### 온라인 복구
1. 네트워크 연결 복구 감지
2. 백그라운드 동기화 시작
3. 동기화 완료 알림 표시
   - 성공: "X개의 일기가 동기화되었습니다"
   - 실패: "일부 일기 동기화에 실패했습니다"

### 임시저장 자동 로드
- 에디터가 비어있으면 자동 로드
- 에디터에 내용이 있으면 모달 표시 (사용자 선택)

## 제한사항

### 오프라인 모드 제한
- AI 분석 불가 (네트워크 필요)
- 일기 목록 조회 불가 (서버 데이터 필요)
- 검색 기능 불가

### 동기화 제한
- 최대 50개 일기까지 동기화
- 일기 크기 제한: 10,000자
- 동기화 실패 시 재시도 (최대 3회)

## 문제 해결

### 동기화가 안 되는 경우
1. 브라우저 개발자 도구에서 Service Worker 상태 확인
2. IndexedDB에 데이터가 있는지 확인
3. 네트워크 연결 상태 확인
4. 서버 로그에서 오류 확인

### 오프라인 일기가 사라지는 경우
1. IndexedDB 용량 확인
2. 브라우저 데이터 삭제 여부 확인
3. 동기화 로그 확인

---

**최종 업데이트**: 2025-11-07

