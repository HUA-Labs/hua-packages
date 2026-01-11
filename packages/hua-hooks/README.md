# @hua-labs/hooks

Common React hooks collection for the hua-ux ecosystem.
hua-ux 생태계를 위한 공통 React 훅 모음입니다.

[![npm version](https://img.shields.io/npm/v/@hua-labs/hooks.svg)](https://www.npmjs.com/package/@hua-labs/hooks)
[![license](https://img.shields.io/npm/l/@hua-labs/hooks.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

---

[English](#english) | [한국어](#korean)

## English

### Overview

A collection of commonly used React hooks optimized for the hua-ux ecosystem. Provides loading state management, auto-scroll functionality, and performance monitoring.

### Installation

```bash
npm install @hua-labs/hooks
# or
pnpm add @hua-labs/hooks
```

### Available Hooks

#### `useLoading`

Manages loading state with optional delay and wrapper function.

```tsx
import { useLoading } from '@hua-labs/hooks';

function MyComponent() {
  const { isLoading, loadingMessage, withLoading } = useLoading({ delay: 200 });

  const handleFetch = async () => {
    await withLoading(async () => {
      const data = await fetchData();
      return data;
    }, 'Loading data...');
  };

  return (
    <div>
      {isLoading && <Spinner message={loadingMessage} />}
      <button onClick={handleFetch}>Fetch</button>
    </div>
  );
}
```

**Options:**
- `initialLoading?: boolean` - Initial loading state (default: `false`)
- `delay?: number` - Delay before showing loading (default: `0`)

**Returns:**
- `isLoading: boolean` - Current loading state
- `loadingMessage: string` - Current loading message
- `startLoading(message?: string)` - Start loading
- `stopLoading()` - Stop loading
- `withLoading<T>(asyncFn, message?)` - Wrap async function with loading state

---

#### `useAutoScroll`

Manages auto-scroll behavior for chat-like interfaces.

```tsx
import { useAutoScroll } from '@hua-labs/hooks';

function ChatContainer({ messages }) {
  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll(
    [messages],
    { threshold: 10, smooth: true }
  );

  return (
    <div ref={containerRef} style={{ overflow: 'auto', height: 400 }}>
      {messages.map((msg, i) => <Message key={i} {...msg} />)}
      {!isAtBottom && (
        <button onClick={scrollToBottom}>Scroll to bottom</button>
      )}
    </div>
  );
}
```

**Options:**
- `threshold?: number` - Distance from bottom to consider "at bottom" (default: `10`)
- `smooth?: boolean` - Use smooth scrolling (default: `true`)

**Returns:**
- `containerRef: RefObject<HTMLDivElement>` - Ref to attach to scroll container
- `isAtBottom: boolean` - Whether scroll is at bottom
- `setIsAtBottom(value)` - Manually set bottom state
- `scrollToBottom()` - Scroll to bottom

---

#### `usePerformanceMonitor`

Monitors runtime performance metrics (FPS, memory).

```tsx
import { usePerformanceMonitor } from '@hua-labs/hooks';

function DebugOverlay() {
  const { fps, frameTime, memory, isStable } = usePerformanceMonitor({
    interval: 1000,
    targetFps: 60
  });

  return (
    <div className="debug-overlay">
      <span>FPS: {fps}</span>
      <span>Frame: {frameTime}ms</span>
      <span>Memory: {memory}MB</span>
      <span>{isStable ? 'Stable' : 'Unstable'}</span>
    </div>
  );
}
```

**Options:**
- `interval?: number` - Update interval in ms (default: `1000`)
- `targetFps?: number` - Target FPS for stability check (default: `60`)

**Returns:**
- `fps: number` - Current FPS
- `frameTime: number` - Frame time in ms
- `memory: number` - Memory usage in MB
- `isStable: boolean` - Whether performance is stable (> 90% of target FPS)

---

### Requirements

- React >= 18.0.0

---

## Korean

### 개요

hua-ux 생태계를 위한 공통 React 훅 모음입니다. 로딩 상태 관리, 자동 스크롤, 성능 모니터링 기능을 제공합니다.

### 설치

```bash
npm install @hua-labs/hooks
# 또는
pnpm add @hua-labs/hooks
```

### 사용 가능한 훅

#### `useLoading`

선택적 딜레이와 래퍼 함수를 사용하여 로딩 상태를 관리합니다.

```tsx
import { useLoading } from '@hua-labs/hooks';

function MyComponent() {
  const { isLoading, loadingMessage, withLoading } = useLoading({ delay: 200 });

  const handleFetch = async () => {
    await withLoading(async () => {
      const data = await fetchData();
      return data;
    }, '데이터 로딩 중...');
  };

  return (
    <div>
      {isLoading && <Spinner message={loadingMessage} />}
      <button onClick={handleFetch}>불러오기</button>
    </div>
  );
}
```

**옵션:**
- `initialLoading?: boolean` - 초기 로딩 상태 (기본값: `false`)
- `delay?: number` - 로딩 표시 전 지연 시간 (기본값: `0`)

**반환값:**
- `isLoading: boolean` - 현재 로딩 상태
- `loadingMessage: string` - 현재 로딩 메시지
- `startLoading(message?: string)` - 로딩 시작
- `stopLoading()` - 로딩 중지
- `withLoading<T>(asyncFn, message?)` - 비동기 함수를 로딩 상태로 감싸기

---

#### `useAutoScroll`

채팅과 같은 인터페이스를 위한 자동 스크롤 동작을 관리합니다.

```tsx
import { useAutoScroll } from '@hua-labs/hooks';

function ChatContainer({ messages }) {
  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll(
    [messages],
    { threshold: 10, smooth: true }
  );

  return (
    <div ref={containerRef} style={{ overflow: 'auto', height: 400 }}>
      {messages.map((msg, i) => <Message key={i} {...msg} />)}
      {!isAtBottom && (
        <button onClick={scrollToBottom}>맨 아래로</button>
      )}
    </div>
  );
}
```

**옵션:**
- `threshold?: number` - "맨 아래"로 간주할 하단으로부터의 거리 (기본값: `10`)
- `smooth?: boolean` - 부드러운 스크롤 사용 (기본값: `true`)

**반환값:**
- `containerRef: RefObject<HTMLDivElement>` - 스크롤 컨테이너에 연결할 ref
- `isAtBottom: boolean` - 스크롤이 맨 아래에 있는지 여부
- `setIsAtBottom(value)` - 수동으로 하단 상태 설정
- `scrollToBottom()` - 맨 아래로 스크롤

---

#### `usePerformanceMonitor`

런타임 성능 메트릭(FPS, 메모리)을 모니터링합니다.

```tsx
import { usePerformanceMonitor } from '@hua-labs/hooks';

function DebugOverlay() {
  const { fps, frameTime, memory, isStable } = usePerformanceMonitor({
    interval: 1000,
    targetFps: 60
  });

  return (
    <div className="debug-overlay">
      <span>FPS: {fps}</span>
      <span>프레임: {frameTime}ms</span>
      <span>메모리: {memory}MB</span>
      <span>{isStable ? '안정' : '불안정'}</span>
    </div>
  );
}
```

**옵션:**
- `interval?: number` - 업데이트 간격 (ms) (기본값: `1000`)
- `targetFps?: number` - 안정성 확인을 위한 목표 FPS (기본값: `60`)

**반환값:**
- `fps: number` - 현재 FPS
- `frameTime: number` - 프레임 시간 (ms)
- `memory: number` - 메모리 사용량 (MB)
- `isStable: boolean` - 성능이 안정적인지 여부 (목표 FPS의 90% 이상)

---

### 요구사항

- React >= 18.0.0

---

## License

MIT License

## Repository

https://github.com/HUA-Labs/HUA-Labs-public
