import { describe, it, expect, vi, beforeEach } from 'vitest'
import { observeElement, _getObserverPool, _resetObserverPool } from '../../utils/sharedIntersectionObserver'
import { MockIntersectionObserver, intersectionObserverInstances } from '../setup'

describe('sharedIntersectionObserver', () => {
  beforeEach(() => {
    _resetObserverPool()
    intersectionObserverInstances.length = 0
  })

  it('같은 옵션 → observer 1개 공유', () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')
    const cb1 = vi.fn()
    const cb2 = vi.fn()

    observeElement(el1, cb1, { threshold: 0.1 })
    observeElement(el2, cb2, { threshold: 0.1 })

    const pool = _getObserverPool()
    expect(pool.size).toBe(1)

    // IntersectionObserver가 1개만 생성되었는지 확인
    const instances = intersectionObserverInstances.filter(
      (inst) => inst.thresholds[0] === 0.1
    )
    expect(instances).toHaveLength(1)

    // 두 element 모두 관찰 중
    const observer = instances[0] as MockIntersectionObserver
    const observed = observer.getObservedElements()
    expect(observed.has(el1)).toBe(true)
    expect(observed.has(el2)).toBe(true)
  })

  it('다른 옵션 → 별도 observer', () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')

    observeElement(el1, vi.fn(), { threshold: 0 })
    observeElement(el2, vi.fn(), { threshold: 0.5 })

    const pool = _getObserverPool()
    expect(pool.size).toBe(2)
  })

  it('다른 rootMargin → 별도 observer', () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')

    observeElement(el1, vi.fn(), { threshold: 0, rootMargin: '0px' })
    observeElement(el2, vi.fn(), { threshold: 0, rootMargin: '100px' })

    const pool = _getObserverPool()
    expect(pool.size).toBe(2)
  })

  it('unsubscribe → element unobserve + 빈 pool cleanup', () => {
    const el = document.createElement('div')
    const unsub = observeElement(el, vi.fn(), { threshold: 0.1 })

    expect(_getObserverPool().size).toBe(1)

    unsub()

    // pool에서 제거됨
    expect(_getObserverPool().size).toBe(0)
  })

  it('unsubscribe → 다른 element 남아있으면 observer 유지', () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')

    const unsub1 = observeElement(el1, vi.fn(), { threshold: 0.1 })
    observeElement(el2, vi.fn(), { threshold: 0.1 })

    unsub1()

    // el2가 아직 있으므로 pool 유지
    expect(_getObserverPool().size).toBe(1)

    const observer = intersectionObserverInstances[intersectionObserverInstances.length - 1] as MockIntersectionObserver
    const observed = observer.getObservedElements()
    expect(observed.has(el1)).toBe(false)
    expect(observed.has(el2)).toBe(true)
  })

  it('once=true → 첫 intersection 후 자동 정리', () => {
    const el = document.createElement('div')
    const cb = vi.fn()

    observeElement(el, cb, { threshold: 0 }, true)

    const observer = intersectionObserverInstances[intersectionObserverInstances.length - 1] as MockIntersectionObserver

    // 첫 intersection
    observer.triggerIntersect([{ isIntersecting: true, target: el }])
    expect(cb).toHaveBeenCalledTimes(1)

    // 자동 정리 → pool 비어야 함
    expect(_getObserverPool().size).toBe(0)
  })

  it('once=true → isIntersecting=false에서는 정리 안 함', () => {
    const el = document.createElement('div')
    const cb = vi.fn()

    observeElement(el, cb, { threshold: 0 }, true)

    const observer = intersectionObserverInstances[intersectionObserverInstances.length - 1] as MockIntersectionObserver

    // not intersecting
    observer.triggerIntersect([{ isIntersecting: false, target: el }])
    expect(cb).toHaveBeenCalledTimes(1)

    // 아직 pool에 남아있어야 함
    expect(_getObserverPool().size).toBe(1)
  })

  it('element별 callback 격리', () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')
    const cb1 = vi.fn()
    const cb2 = vi.fn()

    observeElement(el1, cb1, { threshold: 0 })
    observeElement(el2, cb2, { threshold: 0 })

    const observer = intersectionObserverInstances[intersectionObserverInstances.length - 1] as MockIntersectionObserver

    // el1만 intersect
    observer.triggerIntersect([{ isIntersecting: true, target: el1 }])

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).not.toHaveBeenCalled()
  })

  it('같은 element에 여러 callback 등록 가능', () => {
    const el = document.createElement('div')
    const cb1 = vi.fn()
    const cb2 = vi.fn()

    observeElement(el, cb1, { threshold: 0 })
    observeElement(el, cb2, { threshold: 0 })

    const observer = intersectionObserverInstances[intersectionObserverInstances.length - 1] as MockIntersectionObserver

    observer.triggerIntersect([{ isIntersecting: true, target: el }])

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(1)
  })

  it('같은 element의 callback 하나만 unsubscribe해도 나머지 유지', () => {
    const el = document.createElement('div')
    const cb1 = vi.fn()
    const cb2 = vi.fn()

    const unsub1 = observeElement(el, cb1, { threshold: 0 })
    observeElement(el, cb2, { threshold: 0 })

    unsub1()

    const observer = intersectionObserverInstances[intersectionObserverInstances.length - 1] as MockIntersectionObserver

    observer.triggerIntersect([{ isIntersecting: true, target: el }])

    expect(cb1).not.toHaveBeenCalled()
    expect(cb2).toHaveBeenCalledTimes(1)
  })

  it('중복 unsubscribe 호출은 무시', () => {
    const el = document.createElement('div')
    const unsub = observeElement(el, vi.fn(), { threshold: 0 })

    unsub()
    // 두 번째 호출은 에러 없이 무시
    expect(() => unsub()).not.toThrow()
  })

  it('기본 옵션 (threshold=0, rootMargin=0px)', () => {
    const el = document.createElement('div')
    observeElement(el, vi.fn())

    const pool = _getObserverPool()
    expect(pool.has('0|0px')).toBe(true)
  })

  it('_resetObserverPool은 모든 observer를 정리', () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')

    observeElement(el1, vi.fn(), { threshold: 0 })
    observeElement(el2, vi.fn(), { threshold: 0.5 })

    expect(_getObserverPool().size).toBe(2)

    _resetObserverPool()

    expect(_getObserverPool().size).toBe(0)
  })

  it('callback 내에서 unsubscribe해도 안전', () => {
    const el = document.createElement('div')
    let unsub: (() => void) | undefined

    const cb = vi.fn(() => {
      unsub?.()
    })

    unsub = observeElement(el, cb, { threshold: 0 })

    const observer = intersectionObserverInstances[intersectionObserverInstances.length - 1] as MockIntersectionObserver

    // callback 내에서 unsubscribe — 에러 없어야 함
    expect(() => {
      observer.triggerIntersect([{ isIntersecting: true, target: el }])
    }).not.toThrow()

    expect(cb).toHaveBeenCalledTimes(1)
  })
})
