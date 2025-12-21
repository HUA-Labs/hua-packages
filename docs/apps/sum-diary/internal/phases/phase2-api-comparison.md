# Phase 2: API 비교 분석

## `/api/diary` POST vs `/api/diary/create` POST

### 사용 현황
- **`/api/diary` POST**: ❌ 사용되지 않음 (호출하는 곳 없음)
- **`/api/diary/create` POST**: ✅ 실제 사용 중 (`diary/write/page.tsx`)

### 기능 비교

| 기능 | `/api/diary` POST | `/api/diary/create` POST |
|------|------------------|-------------------------|
| 기본 일기 저장 | ✅ | ✅ |
| 게스트 지원 | ✅ | ✅ |
| 게스트 제한 체크 | ✅ | ✅ |
| AI 분석 | ✅ (기본) | ✅ (상세) |
| 트랜잭션 처리 | ❌ | ✅ |
| 위기 감지 | ❌ | ✅ |
| 남용 감지 | ❌ | ✅ |
| 특별 메시지 | ❌ | ✅ |
| 미래일기 체크 | ❌ | ✅ |
| 분석 결과 검증 | ❌ | ✅ |
| 탈옥 감지 | ❌ | ✅ |
| 사용자 존재 확인 | ❌ | ✅ (로그인 사용자) |
| 응답 형식 | 단순 | 상세 |

### `/api/diary` POST에만 있는 로직
**없음** - 모든 기능이 `/api/diary/create`에 포함되어 있음

### 응답 형식 차이

#### `/api/diary` POST 응답:
```json
{
  "success": true,
  "diary": {
    "id": "...",
    "title": "...",
    "created_at": "..."
  },
  "analysis": {
    "id": "...",
    "emotion_flow": [...],
    "reflection_question": "...",
    "interpretation": "..."
  }
}
```

#### `/api/diary/create` POST 응답:
```json
{
  "success": true,
  "isGuest": true/false,
  "message": "...",
  "diaryId": "...",
  "analysisId": "...",
  "analysis": {
    "title": "...",
    "emotionFlow": [...],
    "reflectionQuestion": "...",
    "interpretation": "...",
    "metadata": {...}
  }
}
```

### 결론
- `/api/diary` POST는 사용되지 않음
- 모든 기능이 `/api/diary/create`에 포함됨
- 안전하게 제거 가능

