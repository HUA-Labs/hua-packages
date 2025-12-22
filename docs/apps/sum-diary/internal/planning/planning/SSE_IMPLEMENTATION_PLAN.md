# SSE 구현 계획

## 1. OpenAI vs Gemini 스트리밍 API 차이점

### OpenAI API 스트리밍
```typescript
// OpenAI는 stream: true 옵션으로 스트리밍 지원
const stream = await openai.chat.completions.create({
  model: 'gpt-5-mini',
  messages: [...],
  stream: true,  // 스트리밍 활성화
});

// Node.js ReadableStream으로 반환
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    // SSE로 전송
  }
}
```

### Gemini API 스트리밍
```typescript
// Gemini는 generateContentStream 사용
const result = await model.generateContentStream(prompt);

// AsyncIterable로 반환
for await (const chunk of result.stream) {
  const text = chunk.text();
  // SSE로 전송
}
```

**주요 차이점:**
- OpenAI: `stream: true` 옵션, `delta.content`로 증분 데이터
- Gemini: `generateContentStream()` 메서드, `chunk.text()`로 전체 텍스트

## 2. Next.js SSE API Route 구조

### API Route: `/api/diary/analyze/stream/route.ts`
```typescript
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const diaryId = request.nextUrl.searchParams.get('diaryId');
  
  // SSE 헤더 설정
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        // 분석 시작
        send(JSON.stringify({ type: 'start', diaryId }));
        
        // OpenAI 스트리밍 호출
        const openaiStream = await openai.chat.completions.create({
          model: 'gpt-5-mini',
          messages: [...],
          stream: true,
        });

        let buffer = '';
        for await (const chunk of openaiStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          buffer += content;
          
          // 섹션별로 파싱하여 전송
          if (buffer.includes('SUMMARY_END')) {
            send(JSON.stringify({ type: 'summary', data: extractSummary(buffer) }));
            buffer = '';
          }
          // ... 다른 섹션들
        }
        
        send(JSON.stringify({ type: 'complete' }));
      } catch (error) {
        send(JSON.stringify({ type: 'error', data: { message: error.message } }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## 3. 클라이언트 SSE 수신

### 분석 결과 페이지 수정
```typescript
useEffect(() => {
  const eventSource = new EventSource(`/api/diary/analyze/stream?diaryId=${diaryId}`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'start':
        setLoading(true);
        break;
      case 'summary':
        setSummary(data.data);
        break;
      case 'emotion_flow':
        setEmotionFlow(data.data);
        break;
      case 'question':
        setQuestion(data.data);
        break;
      case 'interpretation':
        setInterpretation(data.data);
        break;
      case 'complete':
        setLoading(false);
        eventSource.close();
        break;
      case 'error':
        setError(data.data.message);
        eventSource.close();
        break;
    }
  };
  
  return () => eventSource.close();
}, [diaryId]);
```

## 4. 구현 단계

1. **API Route 생성**: `/api/diary/analyze/stream/route.ts`
2. **OpenAI 스트리밍 통합**: `analyzeDiary` 함수를 스트리밍 버전으로 변경
3. **분석 결과 페이지 수정**: EventSource로 실시간 수신
4. **원문 섹션 이동**: 맨 밑으로 이동, 폴딩 가능하게
5. **타이핑 효과**: 각 섹션 표시 시 애니메이션

## 5. 주의사항

- **에러 처리**: 네트워크 오류, 타임아웃 처리
- **재연결 로직**: 연결 끊김 시 자동 재연결
- **메모리 관리**: 스트림 종료 시 EventSource 정리
- **보안**: diaryId 검증, 사용자 권한 확인

