# @hua-labs/motion-core Detailed Guide

`@hua-labs/motion-core` provides React motion hooks, a small motion engine,
easing and spring utilities, motion profiles, and a dedicated React Native
entry point. This guide documents the package's current public entry points and
the contracts that applications must own.

## Installation

```bash
pnpm add @hua-labs/motion-core
```

The package requires React 19. `react-dom` and `react-native` are optional,
target-specific peers. Web hooks import from the package root. React Native
hooks import from the explicit `/native` entry point and require a compatible
`react-native` peer in the consuming application.

```ts
import { useFadeIn } from "@hua-labs/motion-core";
import { useFadeIn as useNativeFadeIn } from "@hua-labs/motion-core/native";

void useFadeIn;
void useNativeFadeIn;
```

Do not mix the root and `/native` hooks in one renderer. They return styles for
different runtime targets: CSS properties on the web and `Animated`-compatible
styles on React Native.

## Web entrance hooks

The web entrance hooks return a `ref`, a `style` object, lifecycle state, and
imperative `start`, `stop`, and `reset` controls. Attach both `ref` and `style`
to the same supported HTML element.

```tsx
"use client";

import { useFadeIn } from "@hua-labs/motion-core";

export function Hero() {
  const fade = useFadeIn<HTMLDivElement>({
    autoStart: true,
    initialOpacity: 0,
    targetOpacity: 1,
    duration: 500,
    delay: 100,
    threshold: 0.2,
    triggerOnce: true,
    easing: "ease-out",
  });

  return (
    <div ref={fade.ref} style={fade.style}>
      Motion that follows the current hook contract
    </div>
  );
}
```

### Common options

The entrance hooks share these base options:

| Option                                       | Meaning                                                              |
| -------------------------------------------- | -------------------------------------------------------------------- |
| `autoStart`                                  | Observe or start the motion automatically when supported by the hook |
| `duration`                                   | Transition duration in milliseconds                                  |
| `delay`                                      | Delay before the visible state is committed                          |
| `threshold`                                  | `IntersectionObserver` threshold for web entrance hooks              |
| `triggerOnce`                                | Disconnect the shared observer after the first intersection          |
| `easing`                                     | CSS easing string used by the web entrance style                     |
| `onStart`, `onComplete`, `onStop`, `onReset` | Lifecycle callbacks                                                  |

Defaults can come from the active motion profile. Treat the returned style as
the hook's render contract instead of copying profile defaults into application
code.

### Fade

`useFadeIn` uses `initialOpacity` and `targetOpacity`.

```tsx
import { useFadeIn } from "@hua-labs/motion-core";

export function FadingNotice() {
  const motion = useFadeIn<HTMLParagraphElement>({
    initialOpacity: 0.15,
    targetOpacity: 0.9,
    autoStart: false,
  });

  return (
    <p ref={motion.ref} style={motion.style} onClick={motion.start}>
      Click to start
    </p>
  );
}
```

### Slide

`useSlideUp` accepts `direction` and `distance`. The directional helpers
`useSlideDown`, `useSlideLeft`, and `useSlideRight` are also exported.

```tsx
import { useSlideUp } from "@hua-labs/motion-core";

export function SlidingPanel() {
  const motion = useSlideUp<HTMLDivElement>({
    direction: "left",
    distance: 32,
    duration: 420,
  });

  return (
    <section ref={motion.ref} style={motion.style}>
      Panel
    </section>
  );
}
```

### Scale and bounce

`useScaleIn` uses `initialScale` and `targetScale`. `useBounceIn` uses
`intensity` for the overshoot amount.

```tsx
import { useBounceIn, useScaleIn } from "@hua-labs/motion-core";

export function Emphasis() {
  const scale = useScaleIn<HTMLDivElement>({
    initialScale: 0.88,
    targetScale: 1,
    autoStart: true,
  });
  const bounce = useBounceIn<HTMLSpanElement>({
    intensity: 0.16,
    autoStart: true,
  });

  return (
    <div ref={scale.ref} style={scale.style}>
      <span ref={bounce.ref} style={bounce.style}>
        Ready
      </span>
    </div>
  );
}
```

## Manual lifecycle control

Set `autoStart: false` when the application should own the start event. The
entrance hooks expose `start`, `stop`, and `reset`. Their `pause` and `resume`
members are currently no-ops because these hooks render CSS transitions rather
than a resumable JavaScript timeline.

```tsx
import { useFadeIn } from "@hua-labs/motion-core";

export function ManualFade() {
  const motion = useFadeIn<HTMLDivElement>({ autoStart: false });

  return (
    <div>
      <div ref={motion.ref} style={motion.style}>
        Controlled content
      </div>
      <button type="button" onClick={motion.start}>
        Start
      </button>
      <button type="button" onClick={motion.stop}>
        Stop
      </button>
      <button type="button" onClick={motion.reset}>
        Reset
      </button>
    </div>
  );
}
```

## Motion profiles

`MotionProfileProvider` supplies defaults to profile-aware hooks. Use the
`neutral` or `hua` built-in profile, or pass a complete `MotionProfile` object.
`overrides` deep-merges selected values over the chosen profile.

```tsx
import { MotionProfileProvider, useFadeIn } from "@hua-labs/motion-core";

function ProfiledCard() {
  const motion = useFadeIn<HTMLDivElement>();
  return (
    <article ref={motion.ref} style={motion.style}>
      Card
    </article>
  );
}

export function ProfiledApp() {
  return (
    <MotionProfileProvider
      profile="neutral"
      overrides={{ base: { duration: 240 } }}
    >
      <ProfiledCard />
    </MotionProfileProvider>
  );
}
```

The provider is optional. Outside a provider, hooks use the built-in neutral
profile.

## Reduced motion

`useReducedMotion()` returns a boolean and follows changes to the browser's
`prefers-reduced-motion` media query after mount. The deprecated
`useReducedMotionObject()` exists only for the older object-shaped return.

```tsx
import { useFadeIn, useReducedMotion } from "@hua-labs/motion-core";

export function AccessibleEntrance() {
  const reduce = useReducedMotion();
  const motion = useFadeIn<HTMLDivElement>({
    duration: reduce ? 0 : 400,
    initialOpacity: reduce ? 1 : 0,
  });

  return (
    <div ref={motion.ref} style={motion.style}>
      Content
    </div>
  );
}
```

Reduced-motion detection does not certify a whole interface. The application
still owns decisions about which motion to remove, shorten, or replace.

## React Native entry point

React Native hooks use `Animated` values and do not return a DOM `ref`. Render
their style on an `Animated` component. The available native hooks are exported
only from `@hua-labs/motion-core/native`.

```tsx
import { Animated, Text } from "react-native";
import { useFadeIn } from "@hua-labs/motion-core/native";

export function NativeWelcome() {
  const motion = useFadeIn({
    autoStart: true,
    initialOpacity: 0,
    targetOpacity: 1,
    duration: 400,
    useNativeDriver: true,
  });

  return (
    <Animated.View style={motion.style}>
      <Text>Welcome</Text>
    </Animated.View>
  );
}
```

The `/native` surface also exports slide, scale, bounce, spring, pulse, and
stagger hooks. Web and React Native implementations share some option names,
but their style objects and lifecycle mechanics are target-specific. Browser
tests are not evidence of physical React Native behavior.

## Server rendering and hydration boundary

The web hooks are React hooks and must be called from a client component in
frameworks that distinguish server and client components. Initial styles can
be present in server-rendered markup, but observation, media-query updates,
timers, and animation lifecycle begin in the browser. Test the exact rendered
route for hydration stability; package types and unit tests alone do not prove
application-level hydration behavior.

## Troubleshooting

### Nothing starts automatically

- Confirm that `ref` and `style` are attached to the same element.
- Confirm that `autoStart` is not `false`.
- Web entrance hooks use `IntersectionObserver`; verify that the target crosses
  the configured `threshold`.
- For deterministic tests, use `autoStart: false` and call `start()` explicitly,
  or provide an `IntersectionObserver` test double.

### The option compiles but has no visible effect

- Use `initialOpacity`/`targetOpacity` for fade and
  `initialScale`/`targetScale` for scale.
- Use `direction`/`distance` for slide and `intensity` for bounce.
- Do not use the older `autoPlay`, `from`, or `to` names for these entrance
  hooks.
- `pause()` and `resume()` do not pause CSS transitions in the entrance hooks.

### Native imports or styles fail

- Import from `@hua-labs/motion-core/native`, not the web root.
- Install a compatible `react-native` peer.
- Apply the returned style to an `Animated` component.
- Keep web CSS style objects and React Native animated style objects separate.

## Verification boundary

The package's focused tests, type declarations, and packed entry-point checks
cover source and distribution contracts. They do not by themselves prove
browser frame rate, physical-device animation quality, screen-reader speech,
or React Native behavior on every device. Verify those properties in the
actual application and target runtime.
