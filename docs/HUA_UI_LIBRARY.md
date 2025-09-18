# HUA UI Library Documentation

## 📚 목차
- [개요](#개요)
- [설치 및 설정](#설치-및-설정)
- [기본 사용법](#기본-사용법)
- [컴포넌트 가이드](#컴포넌트-가이드)
- [유틸리티](#유틸리티)
- [테마 및 스타일링](#테마-및-스타일링)
- [고급 기능](#고급-기능)
- [마이그레이션 가이드](#마이그레이션-가이드)
- [API 참조](#api-참조)
- [기여하기](#기여하기)

---

## 🎯 개요

HUA UI는 **shadcn/ui보다 더 직관적이고 스마트한 React 컴포넌트 라이브러리**입니다.

### ✨ 주요 특징
- **직관적인 API**: 복잡한 variant 조합 대신 간단한 prop 사용
- **스마트 기본값**: 자동으로 적절한 스타일 적용
- **완벽한 TypeScript 지원**: 풍부한 타입 정의
- **트리 쉐이킹**: 번들 크기 최적화
- **하위 호환성**: 기존 컴포넌트와 새로운 컴포넌트 공존

### 🆚 shadcn/ui와의 차이점

| 기능 | shadcn/ui | HUA UI |
|------|-----------|--------|
| 설치 방식 | 복사-붙여넣기 | npm 설치 |
| 번들 크기 | 전체 복사 | 트리 쉐이킹 |
| API 복잡도 | 복잡한 variant | 직관적인 prop |
| TypeScript | 기본 지원 | 고급 타입 지원 |
| 커스터마이징 | CSS 변수 | 스마트 유틸리티 |

---

## 🚀 설치 및 설정

### 기본 설치
```bash
npm install @hua-labs/ui
# 또는
pnpm add @hua-labs/ui
# 또는
yarn add @hua-labs/ui
```

### Tailwind CSS 설정
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@hua-labs/ui/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // HUA UI 테마 확장
    }
  },
  plugins: []
}
```

### TypeScript 설정
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## 🎨 기본 사용법

### 기본 컴포넌트 사용
```tsx
import { Button, Input, Card } from '@hua-labs/ui'

function App() {
  return (
    <div>
      <Button>기본 버튼</Button>
      <Input placeholder="입력하세요" />
      <Card>카드 내용</Card>
    </div>
  )
}
```

### 스마트 컴포넌트 사용
```tsx
import { Action, Panel, Navigation } from '@hua-labs/ui'

function App() {
  return (
    <div>
      <Action appearance="primary" scale="large">
        스마트 액션
      </Action>
      <Panel style="elevated" padding="large">
        고급 패널
      </Panel>
      <Navigation style="pills" scale="medium">
        <NavigationItem value="tab1">탭 1</NavigationItem>
        <NavigationItem value="tab2">탭 2</NavigationItem>
      </Navigation>
    </div>
  )
}
```

---

## 🧩 컴포넌트 가이드

### 기본 컴포넌트

#### Button
```tsx
import { Button } from '@hua-labs/ui'

// 기본 사용법
<Button>기본 버튼</Button>
<Button variant="outline">아웃라인</Button>
<Button variant="ghost">고스트</Button>
<Button size="lg">큰 버튼</Button>
<Button loading>로딩 중</Button>
```

#### Input
```tsx
import { Input } from '@hua-labs/ui'

<Input placeholder="입력하세요" />
<Input type="password" />
<Input disabled />
```

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@hua-labs/ui'

<Card>
  <CardHeader>
    <CardTitle>카드 제목</CardTitle>
  </CardHeader>
  <CardContent>
    카드 내용
  </CardContent>
</Card>
```

### 스마트 컴포넌트

#### Action (고급 버튼)
```tsx
import { Action } from '@hua-labs/ui'

<Action appearance="primary" scale="large">
  스마트 액션
</Action>
<Action appearance="glass" loading>
  글래스 로딩
</Action>
```

#### Panel (고급 카드)
```tsx
import { Panel } from '@hua-labs/ui'

<Panel style="elevated" padding="large">
  고급 패널
</Panel>
<Panel style="outline" padding="none">
  아웃라인 패널
</Panel>
```

#### Navigation (고급 탭)
```tsx
import { Navigation, NavigationList, NavigationItem, NavigationContent } from '@hua-labs/ui'

<Navigation defaultValue="tab1">
  <NavigationList>
    <NavigationItem value="tab1">탭 1</NavigationItem>
    <NavigationItem value="tab2">탭 2</NavigationItem>
  </NavigationList>
  <NavigationContent value="tab1">탭 1 내용</NavigationContent>
  <NavigationContent value="tab2">탭 2 내용</NavigationContent>
</Navigation>
```

---

## 🛠️ 유틸리티

### 스마트 클래스 병합

#### merge
```tsx
import { merge } from '@hua-labs/ui'

// 중복 클래스 자동 해결
const className = merge("px-2 py-1", "px-4") // "py-1 px-4"
const className2 = merge("text-red-500", "text-blue-500") // "text-blue-500"
```

#### mergeIf
```tsx
import { mergeIf } from '@hua-labs/ui'

// 조건부 클래스 적용
const className = mergeIf(isActive, "bg-blue-500", "bg-gray-200")
const className2 = mergeIf(isLoading, "opacity-50 cursor-not-allowed")
```

#### mergeMap
```tsx
import { mergeMap } from '@hua-labs/ui'

// 객체 기반 조건부 클래스
const className = mergeMap({
  "bg-blue-500": isPrimary,
  "bg-gray-500": !isPrimary,
  "text-white": true,
  "opacity-50": isDisabled
})
```

---

## 🎨 테마 및 스타일링

### 다크모드 지원
```tsx
import { ThemeProvider } from '@hua-labs/ui'

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  )
}
```

### 커스텀 테마
```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
}
```

---

## 🔧 고급 기능

### 하이드레이션 안전 렌더링
```tsx
import { HydrationProvider } from '@hua-labs/ui'

function App() {
  return (
    <HydrationProvider>
      <YourApp />
    </HydrationProvider>
  )
}
```

### 클라이언트 전용 컴포넌트
```tsx
import { ClientOnly } from '@hua-labs/ui'

<ClientOnly>
  <ComponentThatNeedsBrowser />
</ClientOnly>
```

### SSR 비활성화
```tsx
import { NoSSR } from '@hua-labs/ui'

<NoSSR>
  <ComponentThatBreaksSSR />
</NoSSR>
```

---

## 🔄 마이그레이션 가이드

### shadcn/ui에서 마이그레이션

#### Button 마이그레이션
```tsx
// shadcn/ui
<Button variant="outline" size="lg" className="w-full">Click</Button>

// HUA UI
<Action appearance="outline" scale="large" fullWidth>Click</Action>
```

#### Card 마이그레이션
```tsx
// shadcn/ui
<Card className="p-6 rounded-lg shadow-md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// HUA UI
<Panel style="elevated" padding="large">
  <h3>Title</h3>
  <p>Content</p>
</Panel>
```

### 기존 HUA UI에서 업그레이드

#### 기존 Button → 새로운 Action
```tsx
// 기존 (여전히 지원됨)
<Button variant="outline" size="lg">Click</Button>

// 새로운 방식
<Action appearance="outline" scale="large">Click</Action>
```

---

## 📖 API 참조

### Action Props
```typescript
interface ActionProps {
  appearance?: "primary" | "secondary" | "outline" | "ghost" | "glass"
  scale?: "small" | "medium" | "large"
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  children?: React.ReactNode
}
```

### Panel Props
```typescript
interface PanelProps {
  style?: "default" | "outline" | "elevated"
  padding?: "none" | "small" | "medium" | "large"
  children?: React.ReactNode
}
```

### Navigation Props
```typescript
interface NavigationProps {
  style?: "default" | "pills" | "underline" | "cards"
  scale?: "small" | "medium" | "large"
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
}
```

---

## 🤝 기여하기

### 개발 환경 설정
```bash
# 저장소 클론
git clone https://github.com/your-org/hua-platform.git
cd hua-platform

# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
```

### 컴포넌트 추가하기
1. `packages/hua-ui/src/components/`에 새 컴포넌트 생성
2. `packages/hua-ui/src/index.ts`에 export 추가
3. `apps/hua-ui-site/src/app/components/`에 문서 페이지 생성
4. 테스트 작성 및 문서 업데이트

### 코딩 컨벤션
- TypeScript 사용
- React.forwardRef 사용
- merge 유틸리티로 클래스 병합
- 완전한 타입 정의
- JSDoc 주석 작성

---

## 📞 지원

- **GitHub Issues**: [이슈 리포트](https://github.com/your-org/hua-platform/issues)
- **Discord**: [커뮤니티 참여](https://discord.gg/your-server)
- **Documentation**: [공식 문서](https://docs.hua-labs.com)

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

*이 문서는 HUA UI 라이브러리의 완전한 가이드를 제공합니다. 추가 질문이나 개선 제안이 있으시면 언제든지 연락해주세요!* 