# 성능 최적화 패턴

**작성일**: 2025-12-24  
**목적**: 성능 최적화 관련 반복되는 패턴과 해결 방법 정리

---

## 목차

1. [Client-Side Search 패턴 (Fuse.js)](#client-side-search-패턴-fusejs)
2. [Next.js 16 Caching 패턴 (unstable_cache)](#nextjs-16-caching-패턴-unstable_cache)
3. [Guest ID Soft Migration 패턴](#guest-id-soft-migration-패턴)
4. [Duplicate DB Query 최적화 패턴](#duplicate-db-query-최적화-패턴)

---

## Client-Side Search 패턴 (Fuse.js)

### 문제 상황

서버 사이드 검색은 복호화 작업으로 인해 부하가 크고, 비용이 발생

### 해결 방법

#### Fuse.js를 활용한 클라이언트 사이드 검색

```typescript
// ✅ Client-Side Search
import Fuse from 'fuse.js';
import { offlineStorage } from './offline-storage';

export async function searchDiariesClient(
  query: string,
  options: SearchOptions = {}
): Promise<SearchableDiary[]> {
  const diaries = await offlineStorage.getAllDiaries();
  
  const fuse = new Fuse(diaries, {
    keys: ['title', 'content'],
    threshold: 0.3,
  });
  
  const results = fuse.search(query.trim());
  return results.map(result => result.item);
}
```

### 핵심 포인트

1. **서버 부하 제로**: IndexedDB에서 직접 검색
2. **속도 향상**: 0.01초 이내 검색
3. **오프라인 지원**: 네트워크 없이도 검색 가능

### 관련 데브로그

- [DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md](../devlogs/DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md)

---

## Next.js 16 Caching 패턴 (unstable_cache)

### 문제 상황

Map 객체 기반 캐싱은 서버리스 환경에서 무한정 커질 수 있고, 재시작 시 증발

### 해결 방법

#### Next.js 16 unstable_cache 사용

```typescript
// ✅ Next.js 16 Caching
import { unstable_cache } from 'next/cache';

export const getCachedData = unstable_cache(
  async (key: string) => {
    // 데이터 조회 로직
    return await fetchData(key);
  },
  ['cache-key'],
  {
    revalidate: 3600, // 1시간
    tags: ['data'],
  }
);
```

### 핵심 포인트

1. **서버리스 친화적**: Vercel 환경에서 안정적
2. **태그 기반 무효화**: `revalidateTag`로 선택적 무효화
3. **메모리 안전**: 무한정 증가 방지

### 관련 데브로그

- [DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md](../devlogs/DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md)

---

## Guest ID Soft Migration 패턴

### 문제 상황

IP 기반 게스트 ID는 공용 와이파이에서 데이터 유출 위험

### 해결 방법

#### UUIDv7 기반 Soft Migration

```typescript
// ✅ Soft Migration 패턴
export function getGuestUserId(request: NextRequest): string {
  // 1순위: X-Guest-ID 헤더에서 UUID 가져오기
  const guestIdHeader = request.headers.get('X-Guest-ID');
  if (guestIdHeader && isValidUUID(guestIdHeader)) {
    const ipBasedId = generateGuestId(ip);
    
    if (ipBasedId !== guestIdHeader) {
      // IP 기반 데이터가 있으면 UUID로 마이그레이션
      migrateGuestDataIfExists(ipBasedId, guestIdHeader);
    }
    return guestIdHeader;
  }
  
  // 2순위: IP 기반 ID (Fallback)
  const ip = getClientIP(request);
  return generateGuestId(ip);
}
```

### 핵심 포인트

1. **Dual Check**: 기존 데이터 유지하면서 신규 로직 적용
2. **자동 마이그레이션**: IP 기반 데이터 발견 시 자동 전환
3. **하위 호환성**: 기존 데이터 손실 없음

### 관련 데브로그

- [DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md](../devlogs/DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md)

---

## Duplicate DB Query 최적화 패턴

### 문제 상황

같은 데이터를 여러 번 조회하는 중복 쿼리 발생

### 해결 방법

#### 데이터 캐싱 및 재사용

```typescript
// ✅ 중복 쿼리 제거
const user = await prisma.user.findUnique({ where: { id: userId } });

// 여러 곳에서 사용
const diary = await prisma.diaryEntry.findMany({
  where: { user_id: user.id },
});
const analysis = await prisma.analysisResult.findMany({
  where: { user_id: user.id },
});
```

### 핵심 포인트

1. **쿼리 통합**: 한 번의 쿼리로 필요한 데이터 조회
2. **캐싱 활용**: 자주 조회되는 데이터는 캐싱
3. **Include 활용**: Prisma의 `include`로 관계 데이터 한 번에 조회

### 관련 데브로그

- [DEVLOG_2025-12-23_AUTH_AUTHORIZATION_OPTIMIZATION.md](../devlogs/DEVLOG_2025-12-23_AUTH_AUTHORIZATION_OPTIMIZATION.md)

---

## usePerformanceMonitor 훅 패턴

### 문제 상황

애니메이션이나 복잡한 UI에서 성능 저하 감지가 어려움

### 해결 방법

#### FPS/메모리/렌더타임 실시간 측정

```typescript
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    renderTime: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        setMetrics(prev => ({ ...prev, memory: usedMB }));
      }
    };

    requestAnimationFrame(measureFPS);
    const interval = setInterval(measureMemory, 1000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
};
```

### 핵심 포인트

1. **FPS 목표**: 60fps (모바일 30fps)
2. **메모리 경고**: 100MB 초과 시 경고
3. **렌더타임**: 16ms 초과 시 프레임 드롭

### 관련 데브로그

- [DEVLOG_2025-08-03_PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md](../archive/devlogs/2025-08/DEVLOG_2025-08-03_PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md)

---

## Virtualization (가상 스크롤) 패턴

### 문제 상황

수백~수천 개 아이템 리스트 렌더링 시 성능 저하

### 해결 방법

#### 가시 영역만 렌더링

```typescript
const VirtualizedList = ({ items, itemHeight = 200 }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const containerHeight = containerRef.current.clientHeight;

        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(
          start + Math.ceil(containerHeight / itemHeight) + 1,
          items.length
        );

        setVisibleRange({ start, end });
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [itemHeight, items.length]);

  return (
    <div ref={containerRef} style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ height: `${items.length * itemHeight}px`, position: 'relative' }}>
        {items.slice(visibleRange.start, visibleRange.end).map((item, index) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: `${(visibleRange.start + index) * itemHeight}px`,
              height: `${itemHeight}px`,
              width: '100%',
            }}
          >
            <ItemComponent {...item} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 핵심 포인트

1. **DOM 노드 최소화**: 화면에 보이는 것만 렌더링
2. **스크롤 위치 계산**: `scrollTop / itemHeight`로 시작 인덱스 계산
3. **버퍼 추가**: +1 아이템으로 스크롤 시 깜빡임 방지

### 관련 데브로그

- [DEVLOG_2025-08-03_PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md](../archive/devlogs/2025-08/DEVLOG_2025-08-03_PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md)

---

## Lazy Rendering (지연 렌더링) 패턴

### 문제 상황

페이지 로드 시 모든 컴포넌트를 한 번에 렌더링하면 초기 로딩 느림

### 해결 방법

#### IntersectionObserver 기반 지연 렌더링

```typescript
const LazyComponent = ({ children, threshold = 0.1, fallback }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // 한 번 보이면 관찰 중단
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
};

// 사용 예시
<LazyComponent fallback={<Skeleton />}>
  <HeavyComponent />
</LazyComponent>
```

### 핵심 포인트

1. **threshold**: 0.1 = 10% 보이면 로드
2. **disconnect**: 로드 후 관찰 중단으로 메모리 절약
3. **fallback**: 스켈레톤 UI로 레이아웃 시프트 방지

### 관련 데브로그

- [DEVLOG_2025-08-03_PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md](../archive/devlogs/2025-08/DEVLOG_2025-08-03_PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md)

---

## Animation Priority (애니메이션 우선순위) 패턴

### 문제 상황

여러 애니메이션이 동시에 실행되면 프레임 드롭 발생

### 해결 방법

#### 우선순위 기반 애니메이션 스케줄링

```typescript
type AnimationPriority = 'critical' | 'high' | 'medium' | 'low';

const useAnimationScheduler = () => {
  const queue = useRef<Map<string, () => void>>(new Map());

  const scheduleAnimation = (
    id: string,
    animation: () => void,
    priority: AnimationPriority
  ) => {
    queue.current.set(id, animation);

    switch (priority) {
      case 'critical': // 즉시 실행 (버튼 클릭 피드백)
        animation();
        break;
      case 'high': // 다음 프레임 (호버 효과)
        requestAnimationFrame(animation);
        break;
      case 'medium': // 유휴 시간 (스크롤 애니메이션)
        requestIdleCallback(animation);
        break;
      case 'low': // 지연 실행 (배경 파티클)
        setTimeout(animation, 100);
        break;
    }
  };

  return { scheduleAnimation };
};

// 사용 예시
const { scheduleAnimation } = useAnimationScheduler();

// 버튼 클릭 - 즉시 피드백
scheduleAnimation('button-click', () => animateButton(), 'critical');

// 파티클 효과 - 낮은 우선순위
scheduleAnimation('particles', () => updateParticles(), 'low');
```

### 핵심 포인트

1. **critical**: 사용자 인터랙션 즉시 반응
2. **requestIdleCallback**: 브라우저 유휴 시간 활용
3. **우선순위 분리**: 중요한 애니메이션은 항상 60fps 유지

### 관련 데브로그

- [DEVLOG_2025-08-03_PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md](../archive/devlogs/2025-08/DEVLOG_2025-08-03_PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md)

---

**작성자**: Auto (AI Assistant)
**최종 업데이트**: 2026-02-06

