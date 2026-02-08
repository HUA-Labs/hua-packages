# @hua-labs/hooks

Common React hooks for the hua-ux ecosystem.
hua-ux 생태계를 위한 공통 React 훅 모음.

[![npm version](https://img.shields.io/npm/v/@hua-labs/hooks.svg)](https://www.npmjs.com/package/@hua-labs/hooks)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/hooks.svg)](https://www.npmjs.com/package/@hua-labs/hooks)
[![license](https://img.shields.io/npm/l/@hua-labs/hooks.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

> **Alpha**: APIs may change before stable release. | **알파**: 안정 릴리스 전 API가 변경될 수 있습니다.

## Overview | 개요

A collection of commonly used React hooks optimized for the hua-ux ecosystem. Provides loading state management, auto-scroll functionality, and performance monitoring.

hua-ux 생태계에 최적화된 공통 React 훅 모음입니다. 로딩 상태 관리, 자동 스크롤, 성능 모니터링 기능을 제공합니다.

## Features

- **useLoading** — Loading state with delay, message, and async wrapper
- **useAutoScroll** — Auto-scroll for chat-like interfaces with threshold control
- **usePerformanceMonitor** — Runtime FPS, frame time, and memory tracking

## Installation | 설치

```bash
pnpm add @hua-labs/hooks
```

Peer dependency: `react >= 19.0.0`

## Quick Start | 빠른 시작

```tsx
import { useLoading, useAutoScroll } from '@hua-labs/hooks';

function ChatView({ messages }: { messages: Message[] }) {
  const { isLoading, withLoading } = useLoading({ delay: 200 });
  const { containerRef, scrollToBottom } = useAutoScroll([messages]);

  const handleSend = () => withLoading(() => sendMessage(), 'Sending...');

  return (
    <div ref={containerRef} style={{ overflow: 'auto', height: 400 }}>
      {messages.map((m) => <Message key={m.id} {...m} />)}
      {isLoading && <Spinner />}
    </div>
  );
}
```

## API Overview | API 개요

| Hook | Returns | Description |
|------|---------|-------------|
| `useLoading(opts?)` | `isLoading`, `loadingMessage`, `withLoading`, `startLoading`, `stopLoading` | Async loading state management |
| `useAutoScroll(deps, opts?)` | `containerRef`, `isAtBottom`, `scrollToBottom`, `setIsAtBottom` | Chat-style auto-scroll |
| `usePerformanceMonitor(opts?)` | `fps`, `frameTime`, `memory`, `isStable` | Runtime performance metrics |

## Documentation | 문서

- [📚 Documentation Site | 문서 사이트](https://docs.hua-labs.com)

## Related Packages | 관련 패키지

- [`@hua-labs/hua-ux`](https://www.npmjs.com/package/@hua-labs/hua-ux) — UX framework (re-exports these hooks)
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui) — UI component library

## Requirements | 요구사항

React >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
