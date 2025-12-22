---
name: Write Tests
description: HUA Platform의 테스트 작성 가이드를 따르는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# 테스트 작성 스킬

이 스킬은 HUA Platform의 테스트 작성 가이드를 따르는 방법을 안내합니다.

## 테스트 프레임워크

- **프레임워크**: Vitest
- **테스트 라이브러리**: @testing-library/react
- **환경**: jsdom (브라우저 환경 시뮬레이션)

## 테스트 파일 위치 및 네이밍

### 파일 위치
- **컴포넌트 테스트**: `src/__tests__/components/` 또는 `src/components/__tests__/`
- **훅 테스트**: `src/__tests__/hooks/` 또는 `src/hooks/__tests__/`
- **유틸리티 테스트**: `src/__tests__/utils/` 또는 `src/utils/__tests__/`
- **API 테스트**: `src/__tests__/api/` 또는 `app/api/__tests__/`

### 파일 네이밍
- `ComponentName.test.tsx` - 컴포넌트 테스트
- `hookName.test.ts` - 훅 테스트
- `utilityName.test.ts` - 유틸리티 테스트
- `apiRoute.test.ts` - API 라우트 테스트

## 기본 테스트 구조

### 컴포넌트 테스트

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    screen.getByText('Click me').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 훅 테스트

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })
  
  it('increments count', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

### 유틸리티 테스트

```typescript
import { describe, it, expect } from 'vitest'
import { formatDate } from './dateUtils'

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-01-01')
    expect(formatDate(date)).toBe('2025-01-01')
  })
  
  it('handles invalid date', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow()
  })
})
```

## Vitest API 사용

### 기본 함수
- `describe` - 테스트 그룹
- `it` 또는 `test` - 개별 테스트
- `expect` - 어설션
- `beforeEach`, `afterEach` - 전후 처리
- `vi` - 모킹 유틸리티

### 모킹

```typescript
import { vi } from 'vitest'

// 함수 모킹
const mockFn = vi.fn()
mockFn('arg1', 'arg2')
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')

// 모듈 모킹
vi.mock('./api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'test' }))
}))

// 타이머 모킹
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
vi.useRealTimers()

// 스파이
const spy = vi.spyOn(console, 'log')
spy.mockRestore()
```

## React 컴포넌트 테스트

### 렌더링 및 쿼리

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

it('renders button', () => {
  render(<Button>Click</Button>)
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByText('Click')).toBeInTheDocument()
})

// 쿼리 메서드
screen.getByText('text') // 단일 요소
screen.getAllByText('text') // 여러 요소
screen.queryByText('text') // 없어도 에러 안 남
screen.findByText('text') // 비동기 요소
```

### 이벤트 테스트

```typescript
import { fireEvent } from '@testing-library/react'

it('handles click event', () => {
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Click</Button>)
  
  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalled()
})
```

### 비동기 테스트

```typescript
it('loads data asynchronously', async () => {
  render(<DataComponent />)
  
  // 로딩 상태 확인
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  // 데이터 로드 대기
  const data = await screen.findByText('Data loaded')
  expect(data).toBeInTheDocument()
})
```

## API 라우트 테스트

### Next.js API 라우트 테스트

```typescript
import { describe, it, expect } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'

describe('GET /api/example', () => {
  it('returns data successfully', async () => {
    const request = new NextRequest('http://localhost/api/example')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
  
  it('handles errors', async () => {
    const request = new NextRequest('http://localhost/api/example')
    const response = await GET(request)
    
    expect(response.status).toBe(500)
  })
})
```

## 테스트 설정

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## 테스트 실행

```bash
# 모든 테스트 실행
pnpm test

# 특정 파일만 실행
pnpm test Button.test.tsx

# Watch 모드
pnpm test:watch

# 커버리지
pnpm test:coverage
```

## 체크리스트

테스트 작성 시 다음을 확인하세요:

- [ ] 테스트 파일이 올바른 위치에 있는가?
- [ ] 파일명이 `*.test.ts` 또는 `*.test.tsx` 형식인가?
- [ ] Vitest API를 올바르게 사용했는가? (`vi` 사용, `jest` 사용 금지)
- [ ] React 컴포넌트 테스트에 `@testing-library/react`를 사용했는가?
- [ ] 비동기 테스트에 `await`와 `findBy*`를 사용했는가?
- [ ] 모킹이 적절히 사용되었는가?
- [ ] 테스트가 독립적으로 실행 가능한가?

## 참고

- Vitest 설정: `packages/hua-ui/vitest.config.ts`
- 테스트 예시: `packages/hua-motion-core/src/__tests__/`
- Vitest 문서: https://vitest.dev/
