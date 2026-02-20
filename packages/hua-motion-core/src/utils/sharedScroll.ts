/**
 * Shared Scroll Listener — 공유 스크롤 리스너
 *
 * 모든 스크롤 훅(useScrollProgress, useElementProgress, useScrollToggle 등)이
 * 단 하나의 scroll/resize 리스너를 공유합니다.
 *
 * N개 훅 = 1개 리스너 + 1개 rAF
 *
 * @example
 * ```ts
 * useEffect(() => {
 *   const update = () => { ... };
 *   update(); // initial
 *   return subscribeScroll(update);
 * }, []);
 * ```
 */

type ScrollCallback = () => void

const subscribers = new Set<ScrollCallback>()
let listening = false
let rafId = 0

function tick() {
  subscribers.forEach((cb) => cb())
}

function onScroll() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(tick)
}

/**
 * 스크롤 리스너에 콜백 등록.
 * 반환되는 함수를 호출하면 구독 해제.
 * rAF로 배칭되어 한 프레임에 한 번만 실행.
 */
export function subscribeScroll(cb: ScrollCallback): () => void {
  subscribers.add(cb)

  if (!listening && subscribers.size > 0) {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    listening = true
  }

  return () => {
    subscribers.delete(cb)
    if (listening && subscribers.size === 0) {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(rafId)
      listening = false
    }
  }
}
