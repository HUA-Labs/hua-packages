# 고급 페이지 전환 컴포넌트 (Advanced Page Transitions)

이 패키지는 React 애플리케이션에서 부드럽고 세련된 페이지 전환 애니메이션을 구현하기 위한 고급 컴포넌트들을 제공합니다.

## 🚀 주요 기능

### 1. 다양한 전환 타입
- **fade**: 페이드 인/아웃
- **slide**: 좌우 슬라이드
- **slide-up/down**: 상하 슬라이드
- **slide-left/right**: 좌우 슬라이드 (방향별)
- **scale**: 크기 변화
- **flip**: 3D 플립 효과
- **morph**: 형태 변화
- **cube**: 3D 큐브 회전
- **zoom**: 줌 인/아웃

### 2. 고급 이징 함수
- **linear**: 선형
- **ease-in**: 천천히 시작
- **ease-out**: 천천히 끝남
- **ease-in-out**: 천천히 시작하고 끝남
- **bounce**: 바운스 효과
- **elastic**: 탄성 효과
- **smooth**: 부드러운 전환 (기본값)

### 3. 전환 관리 기능
- 진행률 추적
- 전환 일시정지/재개
- 전환 취소
- 전환 히스토리
- 통계 정보

## 📦 설치 및 사용

### 기본 사용법

```tsx
import { 
  AdvancedPageTransition, 
  usePageTransition,
  usePageTransitionManager 
} from '@hua-labs/ui'

// 기본 페이지 전환
function MyPage() {
  return (
    <AdvancedPageTransition type="fade" duration={500}>
      <div>페이지 내용</div>
    </AdvancedPageTransition>
  )
}
```

### 훅을 사용한 고급 제어

```tsx
import { usePageTransition } from '@hua-labs/ui'

function MyComponent() {
  const [state, controls] = usePageTransition({
    type: 'slide',
    duration: 600,
    easing: 'bounce'
  })

  const handleClick = async () => {
    await controls.start()
    // 전환 완료 후 실행할 코드
  }

  return (
    <div>
      <button onClick={handleClick}>전환 시작</button>
      <div style={{ opacity: state.isVisible ? 1 : 0 }}>
        애니메이션 요소
      </div>
    </div>
  )
}
```

### 전환 매니저를 사용한 복잡한 전환

```tsx
import { usePageTransitionManager } from '@hua-labs/ui'

function App() {
  const [state, manager] = usePageTransitionManager({
    defaultType: 'fade',
    enableHistory: true,
    enableDebug: true
  })

  const startComplexTransition = async () => {
    const id = await manager.startTransition({
      type: 'morph',
      duration: 800,
      easing: 'elastic'
    })
    
    // 전환 ID로 개별 제어 가능
    // manager.cancelTransition(id)
  }

  return (
    <div>
      <button onClick={startComplexTransition}>
        복잡한 전환 시작
      </button>
      
      {state.isTransitioning && (
        <div>전환 중... ({state.currentTransition?.type})</div>
      )}
      
      <div>
        총 전환: {state.totalTransitions}
        평균 시간: {Math.round(state.averageDuration)}ms
      </div>
    </div>
  )
}
```

## 🎨 전환 타입별 예시

### Fade 전환
```tsx
<FadePageTransition duration={400} easing="smooth">
  <div>페이드 효과</div>
</FadePageTransition>
```

### Slide 전환
```tsx
<SlidePageTransition 
  type="slide-up" 
  duration={600} 
  easing="bounce"
  direction="forward"
>
  <div>슬라이드 업 효과</div>
</SlidePageTransition>
```

### 3D 효과
```tsx
<CubePageTransition 
  duration={1000} 
  easing="elastic"
  showProgress={true}
>
  <div>3D 큐브 회전 효과</div>
</CubePageTransition>
```

## ⚙️ 고급 설정

### 커스텀 이징 함수
```tsx
const customEasing = (t: number) => {
  // 커스텀 이징 로직
  return t * t * (3 - 2 * t)
}

<AdvancedPageTransition 
  easing="custom"
  customEasing={customEasing}
>
  <div>커스텀 이징</div>
</AdvancedPageTransition>
```

### 진행률 표시
```tsx
<AdvancedPageTransition 
  showProgress={true}
  progressClassName="custom-progress"
>
  <div>진행률이 표시되는 전환</div>
</AdvancedPageTransition>
```

### 이벤트 핸들링
```tsx
<AdvancedPageTransition
  onStart={() => console.log('전환 시작')}
  onComplete={() => console.log('전환 완료')}
  onReverse={() => console.log('전환 역방향')}
>
  <div>이벤트가 처리되는 전환</div>
</AdvancedPageTransition>
```

## 🔧 성능 최적화

### 1. CSS 하드웨어 가속
- `transform`과 `opacity` 속성 사용
- `will-change` CSS 속성 자동 적용
- GPU 가속 활용

### 2. 메모리 관리
- 자동 타이머 정리
- 컴포넌트 언마운트 시 리소스 해제
- 효율적인 상태 업데이트

### 3. 트리 쉐이킹 지원
- 사용하지 않는 전환 타입은 번들에서 제외
- 필요한 기능만 import하여 번들 크기 최적화

## 🎯 사용 사례

### 1. SPA 페이지 전환
```tsx
import { useRouter } from 'next/router'
import { usePageTransition } from '@hua-labs/ui'

function App() {
  const router = useRouter()
  const [state, controls] = usePageTransition()

  const handleNavigation = async (path: string) => {
    await controls.start()
    router.push(path)
  }

  return (
    <div>
      <nav>
        <button onClick={() => handleNavigation('/home')}>홈</button>
        <button onClick={() => handleNavigation('/about')}>소개</button>
      </nav>
      
      <main>
        {state.isVisible && <PageContent />}
      </main>
    </div>
  )
}
```

### 2. 모달/드로어 전환
```tsx
import { MorphPageTransition } from '@hua-labs/ui'

function Modal({ isOpen, onClose, children }) {
  return (
    <MorphPageTransition
      type="morph"
      duration={300}
      easing="smooth"
      autoStart={isOpen}
    >
      <div className="modal">
        {children}
        <button onClick={onClose}>닫기</button>
      </div>
    </MorphPageTransition>
  )
}
```

### 3. 리스트 아이템 애니메이션
```tsx
import { usePageTransitionManager } from '@hua-labs/ui'

function List({ items }) {
  const [state, manager] = usePageTransitionManager({
    defaultType: 'slide-up',
    defaultDuration: 300
  })

  useEffect(() => {
    items.forEach((_, index) => {
      setTimeout(() => {
        manager.startTransition({
          delay: index * 100, // 스태거 효과
          duration: 300
        })
      }, index * 100)
    })
  }, [items, manager])

  return (
    <ul>
      {items.map((item, index) => (
        <li key={item.id}>
          <AdvancedPageTransition
            type="slide-up"
            delay={index * 100}
            duration={300}
          >
            {item.content}
          </AdvancedPageTransition>
        </li>
      ))}
    </ul>
  )
}
```

## 🐛 문제 해결

### 전환이 부드럽지 않은 경우
1. **CSS 전환 확인**: `transition` 속성이 올바르게 설정되었는지 확인
2. **하드웨어 가속**: `transform`과 `opacity` 속성 사용 확인
3. **성능 모니터링**: 개발자 도구의 Performance 탭에서 프레임 드롭 확인

### 전환이 실행되지 않는 경우
1. **상태 확인**: `isTransitioning` 상태 로그 확인
2. **이벤트 핸들러**: `onStart`, `onComplete` 콜백 확인
3. **타이머 정리**: 컴포넌트 언마운트 시 타이머 정리 확인

## 📚 API 레퍼런스

자세한 API 문서는 각 컴포넌트의 TypeScript 정의를 참조하세요:

- `usePageTransition`: 기본 페이지 전환 훅
- `usePageTransitionManager`: 고급 전환 관리 훅
- `AdvancedPageTransition`: 메인 전환 컴포넌트
- `FadePageTransition`, `SlidePageTransition` 등: 편의 컴포넌트들

## 🤝 기여하기

이 패키지에 기여하고 싶으시다면:

1. 이슈 등록
2. 기능 제안
3. 버그 리포트
4. 풀 리퀘스트

모든 기여를 환영합니다! 🎉
