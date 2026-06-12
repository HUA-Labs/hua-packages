# @hua-labs/hooks Detailed Guide

`@hua-labs/hooks` provides small React hooks for common interface concerns:
loading state, chat-style auto-scroll, and lightweight performance monitoring.
The hooks are framework-agnostic within React and can be used in client
components, design tools, dashboards, and product views.

## Installation

```bash
pnpm add @hua-labs/hooks
```

React 19 or newer is expected as a peer dependency.

## `useLoading`

`useLoading` tracks async work with an optional delay and user-facing message.
The delay defers when loading state is turned on, but the current hook does not
cancel a pending delay timer when work finishes early. Prefer `delay: 0` with
`withLoading` unless the surrounding UI can safely tolerate that deferred
loading behavior.

```tsx
import { useLoading } from "@hua-labs/hooks";

function SaveButton() {
  const { isLoading, loadingMessage, withLoading } = useLoading();

  return (
    <button
      disabled={isLoading}
      onClick={() => withLoading(() => saveSettings(), "Saving")}
    >
      {isLoading ? loadingMessage : "Save"}
    </button>
  );
}
```

Use `withLoading` when the hook should manage the whole async lifecycle. Use
the returned setters directly only when a larger workflow owns the loading
state. If you opt into `delay`, keep the pending-timer behavior in mind until a
future hook release cancels delayed starts on early completion.

## `useAutoScroll`

`useAutoScroll` keeps a scroll container pinned near the bottom while new items
arrive. It is suited to chat logs, event streams, and activity feeds.

```tsx
import { useAutoScroll } from "@hua-labs/hooks";

function MessageList({ messages }: { messages: Message[] }) {
  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll(
    [messages.length],
    { threshold: 80 },
  );

  return (
    <>
      <div ref={containerRef} style={{ maxHeight: 420, overflow: "auto" }}>
        {messages.map((message) => (
          <article key={message.id}>{message.text}</article>
        ))}
      </div>
      {!isAtBottom && <button onClick={scrollToBottom}>Jump to latest</button>}
    </>
  );
}
```

Pass stable dependency values, such as an item count or last item id, so the
effect runs only when the list actually changes.

## `usePerformanceMonitor`

`usePerformanceMonitor` observes frame timing and optional memory data in the
browser on an interval. It is intended for development dashboards, visual
editors, and performance-sensitive prototypes.

```tsx
import { usePerformanceMonitor } from "@hua-labs/hooks";

function PerfBadge() {
  const { fps, frameTime, memory, isStable } = usePerformanceMonitor({
    interval: 1000,
    targetFps: 60,
  });

  return (
    <span aria-label={isStable ? "Performance stable" : "Performance warning"}>
      {fps} fps / {frameTime.toFixed(1)} ms / {memory} MB
    </span>
  );
}
```

Memory data depends on browser support. When the browser does not expose memory
metrics, the hook returns a fallback estimate, so use it as a lightweight signal
rather than a precise profiler.

## Client Component Usage

These hooks use browser and React state APIs, so they belong in client-side
React components. In a Next.js App Router project, place them behind a
`'use client'` boundary.

```tsx
"use client";

import { useLoading } from "@hua-labs/hooks";
```

## Testing Tips

For `useLoading`, use fake timers when asserting delayed loading behavior. For
`useAutoScroll`, mock the element scroll measurements that your test relies on.
For `usePerformanceMonitor`, prefer asserting state transitions over exact FPS
values because frame timing varies by environment.

## Troubleshooting

If `useAutoScroll` does not move, confirm that the referenced element has a
bounded height and `overflow: auto`.

If loading state flickers, increase the delay or keep the spinner mounted while
only changing its visibility.

If performance metrics stay empty, check whether the component is running in a
browser and whether the browser exposes the optional performance memory fields.
