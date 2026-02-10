# @hua-labs/hooks

Common React hooks for the hua ecosystem.

[![npm version](https://img.shields.io/npm/v/@hua-labs/hooks.svg)](https://www.npmjs.com/package/@hua-labs/hooks)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/hooks.svg)](https://www.npmjs.com/package/@hua-labs/hooks)
[![license](https://img.shields.io/npm/l/@hua-labs/hooks.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Overview

A collection of commonly used React hooks optimized for the hua ecosystem. Provides loading state management, auto-scroll functionality, and performance monitoring.

## Features

- **useLoading** — Loading state with delay, message, and async wrapper
- **useAutoScroll** — Auto-scroll for chat-like interfaces with threshold control
- **usePerformanceMonitor** — Runtime FPS, frame time, and memory tracking

## Installation

```bash
pnpm add @hua-labs/hooks
```

Peer dependency: `react >= 19.0.0`

## Quick Start

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

## API Overview

| Hook | Returns | Description |
|------|---------|-------------|
| `useLoading(opts?)` | `isLoading`, `loadingMessage`, `withLoading`, `startLoading`, `stopLoading` | Async loading state management |
| `useAutoScroll(deps, opts?)` | `containerRef`, `isAtBottom`, `scrollToBottom`, `setIsAtBottom` | Chat-style auto-scroll |
| `usePerformanceMonitor(opts?)` | `fps`, `frameTime`, `memory`, `isStable` | Runtime performance metrics |

## Documentation

- [Documentation Site](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua) — UX framework (re-exports these hooks)
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui) — UI component library

## Requirements

React >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
