# API 문서 템플릿

## 📋 기본 정보

- **API 이름**: [API 이름]
- **버전**: [버전]
- **작성일**: [YYYY-MM-DD]
- **작성자**: [작성자]

## 🔗 엔드포인트

```
[HTTP_METHOD] /api/[endpoint]
```

## 📝 설명

[API에 대한 간단한 설명]

## 🔧 요청 (Request)

### 헤더 (Headers)
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer [token]"
}
```

### 파라미터 (Parameters)
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| param1 | string | ✅ | 파라미터 설명 |
| param2 | number | ❌ | 파라미터 설명 |

### 요청 본문 (Request Body)
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

## 📤 응답 (Response)

### 성공 응답 (200 OK)
```json
{
  "success": true,
  "data": {
    "result": "success"
  }
}
```

### 에러 응답 (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "잘못된 파라미터입니다."
  }
}
```

## 📝 예시

### cURL
```bash
curl -X POST \
  https://api.example.com/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [token]" \
  -d '{
    "field1": "value1"
  }'
```

### JavaScript
```javascript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer [token]'
  },
  body: JSON.stringify({
    field1: 'value1'
  })
});

const data = await response.json();
```

## 🔍 에러 코드

| 코드 | 설명 |
|------|------|
| INVALID_PARAMETER | 잘못된 파라미터 |
| UNAUTHORIZED | 인증 실패 |
| NOT_FOUND | 리소스를 찾을 수 없음 |

## 📚 관련 문서

- [관련 API 링크]
- [관련 문서 링크]

---

**마지막 업데이트**: [YYYY-MM-DD] 