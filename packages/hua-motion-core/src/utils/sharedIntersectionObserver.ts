/**
 * Shared IntersectionObserver Pool
 *
 * threshold|rootMargin 조합별로 하나의 IntersectionObserver를 공유합니다.
 * N개 훅 = K개 observer (K = 고유 옵션 조합 수, 보통 1~3).
 *
 * sharedScroll.ts와 동일한 singleton pool 패턴.
 *
 * @example
 * ```ts
 * useEffect(() => {
 *   if (!ref.current) return
 *   return observeElement(
 *     ref.current,
 *     (entry) => { if (entry.isIntersecting) start() },
 *     { threshold: 0.1 },
 *     true // once
 *   )
 * }, [])
 * ```
 */

type EntryCallback = (entry: IntersectionObserverEntry) => void

interface Subscription {
  callback: EntryCallback
  once: boolean
}

interface ObserverGroup {
  observer: IntersectionObserver
  /** element → 해당 element의 구독 목록 */
  elements: Map<Element, Subscription[]>
}

/** threshold|rootMargin 문자열 → ObserverGroup */
const pool = new Map<string, ObserverGroup>()

function makeKey(threshold: number | number[], rootMargin: string): string {
  const th = Array.isArray(threshold) ? threshold.join(',') : String(threshold)
  return `${th}|${rootMargin}`
}

function handleIntersections(group: ObserverGroup, entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    const subs = group.elements.get(entry.target)
    if (!subs) continue

    // snapshot — callback 내에서 unsubscribe 할 수 있으므로 복사
    const snapshot = [...subs]
    for (const sub of snapshot) {
      sub.callback(entry)

      // once 모드: 첫 intersecting 시 자동 정리
      if (sub.once && entry.isIntersecting) {
        removeSub(group, entry.target, sub)
      }
    }
  }
}

function removeSub(group: ObserverGroup, element: Element, sub: Subscription) {
  const subs = group.elements.get(element)
  if (!subs) return

  const idx = subs.indexOf(sub)
  if (idx >= 0) subs.splice(idx, 1)

  // element의 마지막 구독이 사라지면 unobserve
  if (subs.length === 0) {
    group.elements.delete(element)
    group.observer.unobserve(element)

    // observer에 관찰 중인 element가 없으면 disconnect + pool에서 제거
    if (group.elements.size === 0) {
      group.observer.disconnect()
      for (const [key, g] of pool) {
        if (g === group) {
          pool.delete(key)
          break
        }
      }
    }
  }
}

/**
 * element를 공유 IntersectionObserver에 등록.
 * 반환 함수를 호출하면 구독 해제.
 *
 * @param element - 관찰할 DOM element
 * @param callback - intersection 변화 시 호출되는 콜백 (해당 element의 entry만 전달)
 * @param options - threshold, rootMargin
 * @param once - true이면 첫 intersection 후 자동 unsubscribe
 * @returns unsubscribe 함수
 */
export function observeElement(
  element: Element,
  callback: EntryCallback,
  options?: { threshold?: number | number[]; rootMargin?: string },
  once?: boolean
): () => void {
  // SSR guard
  if (typeof IntersectionObserver === 'undefined') {
    return () => {}
  }

  const threshold = options?.threshold ?? 0
  const rootMargin = options?.rootMargin ?? '0px'
  const key = makeKey(threshold, rootMargin)

  let group = pool.get(key)
  if (!group) {
    const observer = new IntersectionObserver(
      (entries) => handleIntersections(group!, entries),
      { threshold, rootMargin }
    )
    group = { observer, elements: new Map() }
    pool.set(key, group)
  }

  const sub: Subscription = { callback, once: once ?? false }

  const subs = group.elements.get(element)
  if (subs) {
    subs.push(sub)
  } else {
    group.elements.set(element, [sub])
    group.observer.observe(element)
  }

  let unsubscribed = false
  return () => {
    if (unsubscribed) return
    unsubscribed = true
    removeSub(group!, element, sub)
  }
}

// ─── Test Helpers ───

/** 테스트용: observer pool 초기화 */
export function _resetObserverPool(): void {
  for (const group of pool.values()) {
    group.observer.disconnect()
  }
  pool.clear()
}

/** 테스트용: 현재 pool 상태 반환 */
export function _getObserverPool(): Map<string, ObserverGroup> {
  return pool
}
