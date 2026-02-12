/**
 * hua-motion-core test setup
 * Global mocks for jsdom environment
 */
import { vi } from 'vitest'

// ─── IntersectionObserver Mock ───
const intersectionObserverInstances: MockIntersectionObserver[] = []

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]
  private callback: IntersectionObserverCallback
  private elements = new Set<Element>()

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    if (options?.threshold) {
      this.thresholds = Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold]
    }
    if (options?.rootMargin) {
      this.rootMargin = options.rootMargin
    }
    intersectionObserverInstances.push(this)
  }

  observe(target: Element) {
    this.elements.add(target)
  }

  unobserve(target: Element) {
    this.elements.delete(target)
  }

  disconnect() {
    this.elements.clear()
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  // Test helper: simulate intersection
  triggerIntersect(entries: Partial<IntersectionObserverEntry>[]) {
    const fullEntries = entries.map(entry => ({
      boundingClientRect: { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRectReadOnly,
      intersectionRatio: entry.isIntersecting ? 1 : 0,
      intersectionRect: { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRectReadOnly,
      isIntersecting: false,
      rootBounds: null,
      target: document.createElement('div'),
      time: Date.now(),
      ...entry
    })) as IntersectionObserverEntry[]

    this.callback(fullEntries, this)
  }

  // Test helper: simulate all observed elements intersecting
  triggerAllIntersecting() {
    const entries = Array.from(this.elements).map(target => ({
      isIntersecting: true,
      target
    }))
    if (entries.length > 0) {
      this.triggerIntersect(entries)
    }
  }

  getObservedElements() {
    return this.elements
  }
}

// ─── matchMedia Mock ───
function createMockMediaQueryList(query: string): MediaQueryList {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  const mql: MediaQueryList = {
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn((cb: any) => listeners.push(cb)),
    removeListener: vi.fn((cb: any) => {
      const idx = listeners.indexOf(cb)
      if (idx >= 0) listeners.splice(idx, 1)
    }),
    addEventListener: vi.fn((_, cb: any) => listeners.push(cb)),
    removeEventListener: vi.fn((_, cb: any) => {
      const idx = listeners.indexOf(cb)
      if (idx >= 0) listeners.splice(idx, 1)
    }),
    dispatchEvent: vi.fn((event: Event) => {
      listeners.forEach(cb => cb(event as MediaQueryListEvent))
      return true
    })
  }
  return mql
}

// ─── requestAnimationFrame / cancelAnimationFrame Mock ───
let rafId = 0
const rafCallbacks = new Map<number, FrameRequestCallback>()

function mockRequestAnimationFrame(callback: FrameRequestCallback): number {
  const id = ++rafId
  rafCallbacks.set(id, callback)
  // Auto-execute on next microtask (simulates ~16ms frame)
  Promise.resolve().then(() => {
    const cb = rafCallbacks.get(id)
    if (cb) {
      rafCallbacks.delete(id)
      cb(performance.now())
    }
  })
  return id
}

function mockCancelAnimationFrame(id: number): void {
  rafCallbacks.delete(id)
}

// ─── PerformanceObserver Mock ───
class MockPerformanceObserver {
  private callback: PerformanceObserverCallback
  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback
  }
  observe() {}
  disconnect() {}
  takeRecords(): PerformanceEntryList { return [] }
}

// ─── Element.animate Mock ───
function mockAnimate(this: Element, _keyframes: Keyframe[] | PropertyIndexedKeyframes | null, _options?: number | KeyframeAnimationOptions): Animation {
  return {
    cancel: vi.fn(),
    finish: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    reverse: vi.fn(),
    updatePlaybackRate: vi.fn(),
    commitStyles: vi.fn(),
    persist: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
    currentTime: 0,
    effect: null,
    finished: Promise.resolve(this as unknown as Animation),
    id: '',
    oncancel: null,
    onfinish: null,
    onremove: null,
    pending: false,
    playState: 'finished' as AnimationPlayState,
    playbackRate: 1,
    ready: Promise.resolve(this as unknown as Animation),
    replaceState: 'active' as AnimationReplaceState,
    startTime: 0,
    timeline: null
  } as unknown as Animation
}

// ─── Apply Mocks ───
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
vi.stubGlobal('PerformanceObserver', MockPerformanceObserver)
vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame)
vi.stubGlobal('cancelAnimationFrame', mockCancelAnimationFrame)

if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || ((query: string) => createMockMediaQueryList(query))
  if (!Element.prototype.animate) {
    Element.prototype.animate = mockAnimate
  }
}

// ─── Exports for Test Helpers ───
export {
  MockIntersectionObserver,
  intersectionObserverInstances,
  createMockMediaQueryList,
  rafCallbacks,
  mockRequestAnimationFrame,
  mockCancelAnimationFrame
}

// ─── Utility: Get latest IntersectionObserver instance ───
export function getLastObserver(): MockIntersectionObserver | undefined {
  return intersectionObserverInstances[intersectionObserverInstances.length - 1]
}

// ─── Utility: Flush all pending rAF callbacks ───
export function flushRAF() {
  const pending = Array.from(rafCallbacks.entries())
  rafCallbacks.clear()
  const now = performance.now()
  pending.forEach(([, cb]) => cb(now))
}

// ─── Cleanup between tests ───
afterEach(() => {
  intersectionObserverInstances.length = 0
  rafCallbacks.clear()
  rafId = 0
  vi.restoreAllMocks()
})
