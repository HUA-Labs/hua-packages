# @hua-labs/ui 🎨

**shadcn/ui보다 더 직관적이고 스마트한 React 컴포넌트 라이브러리**

Beautiful, accessible, and customizable components for React applications with intuitive APIs and smart defaults.

## ✨ 주요 기능

### 🎯 **직관적인 API**
- **복잡한 variant 대신 간단한 prop**: `appearance`, `scale`, `style`
- **스마트 기본값**: 자동으로 적절한 스타일 적용
- **완벽한 TypeScript 지원**: 풍부한 타입 정의

### 🧩 **컴포넌트 라이브러리**
- **기본 컴포넌트**: Button, Input, Card, Tabs, Badge, Avatar
- **스마트 컴포넌트**: Action, Panel, Navigation
- **고급 컴포넌트**: EmotionAnalysis, ChatMessage, ConfirmModal
- **유틸리티 컴포넌트**: ThemeProvider, HydrationProvider, ClientOnly

### 🛠️ **스마트 유틸리티**
- **merge**: 중복 클래스 자동 해결
- **mergeIf**: 조건부 클래스 적용
- **mergeMap**: 객체 기반 조건부 클래스

### 🌙 **다크모드 지원**
- 자동 테마 감지
- 수동 테마 전환
- 일관된 디자인 시스템

### ♿ **접근성 고려**
- ARIA 속성 지원
- 키보드 네비게이션
- 스크린 리더 호환

### 📱 **반응형 디자인**
- 모든 디바이스에서 완벽한 경험
- 모바일 우선 설계

### 🔄 **하위 호환성**
- 기존 Button, Card, Tabs 컴포넌트 유지
- 새로운 Action, Panel, Navigation 컴포넌트 추가
- 점진적 마이그레이션 지원

## 🚀 시작하기

### 설치

```bash
npm install @hua-labs/ui
# or
yarn add @hua-labs/ui
# or
pnpm add @hua-labs/ui
```

### 기본 사용법

```tsx
import { Button, Input, Card, ThemeProvider } from '@hua-labs/ui';

function App() {
  return (
    <ThemeProvider>
      <div>
        <Button>기본 버튼</Button>
        <Input placeholder="입력하세요" />
        <Card>카드 내용</Card>
      </div>
    </ThemeProvider>
  );
}
```

### 스마트 컴포넌트 사용

```tsx
import { Action, Panel, Navigation } from '@hua-labs/ui';

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
  );
}
```

## 📚 컴포넌트 가이드

### 기본 컴포넌트

#### Button
```tsx
import { Button } from '@hua-labs/ui';

<Button>기본 버튼</Button>
<Button variant="outline">아웃라인</Button>
<Button variant="ghost">고스트</Button>
<Button size="lg">큰 버튼</Button>
<Button loading>로딩 중</Button>
```

#### Input
```tsx
import { Input } from '@hua-labs/ui';

<Input placeholder="입력하세요" />
<Input type="password" />
<Input disabled />
```

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@hua-labs/ui';

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
import { Action } from '@hua-labs/ui';

<Action appearance="primary" scale="large">
  스마트 액션
</Action>
<Action appearance="glass" loading>
  글래스 로딩
</Action>
```

#### Panel (고급 카드)
```tsx
import { Panel } from '@hua-labs/ui';

<Panel style="elevated" padding="large">
  고급 패널
</Panel>
<Panel style="outline" padding="none">
  아웃라인 패널
</Panel>
```

#### Navigation (고급 탭)
```tsx
import { Navigation, NavigationList, NavigationItem, NavigationContent } from '@hua-labs/ui';

<Navigation defaultValue="tab1">
  <NavigationList>
    <NavigationItem value="tab1">탭 1</NavigationItem>
    <NavigationItem value="tab2">탭 2</NavigationItem>
  </NavigationList>
  <NavigationContent value="tab1">탭 1 내용</NavigationContent>
  <NavigationContent value="tab2">탭 2 내용</NavigationContent>
</Navigation>
```

### 유틸리티 컴포넌트

#### ThemeProvider
```tsx
import { ThemeProvider } from '@hua-labs/ui';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

#### HydrationProvider
```tsx
import { HydrationProvider } from '@hua-labs/ui';

function App() {
  return (
    <HydrationProvider>
      <YourApp />
    </HydrationProvider>
  );
}
```

## 🛠️ 스마트 유틸리티

### merge
```tsx
import { merge } from '@hua-labs/ui';

// 중복 클래스 자동 해결
const className = merge("px-2 py-1", "px-4") // "py-1 px-4"
const className2 = merge("text-red-500", "text-blue-500") // "text-blue-500"
```

### mergeIf
```tsx
import { mergeIf } from '@hua-labs/ui';

// 조건부 클래스 적용
const className = mergeIf(isActive, "bg-blue-500", "bg-gray-200")
const className2 = mergeIf(isLoading, "opacity-50 cursor-not-allowed")
```

### mergeMap
```tsx
import { mergeMap } from '@hua-labs/ui';

// 객체 기반 조건부 클래스
const className = mergeMap({
  "bg-blue-500": isPrimary,
  "bg-gray-500": !isPrimary,
  "text-white": true,
  "opacity-50": isDisabled
})
```

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

## 🎨 테마 커스터마이징

### CSS 변수 사용

```css
:root {
  --hua-primary: #3b82f6;
  --hua-secondary: #64748b;
  --hua-accent: #f59e0b;
  --hua-background: #ffffff;
  --hua-foreground: #0f172a;
}

[data-theme="dark"] {
  --hua-background: #0f172a;
  --hua-foreground: #f8fafc;
}
```

## 🔧 개발

### 빌드

```bash
pnpm build
```

### 개발 모드

```bash
pnpm dev
```

### 타입 체크

```bash
pnpm type-check
```

## 📄 라이선스

MIT License - 자유롭게 사용하세요!

## 🤝 기여하기

1. **Fork** 프로젝트
2. **Feature branch** 생성 (`git checkout -b feature/amazing-feature`)
3. **Commit** 변경사항 (`git commit -m 'Add amazing feature'`)
4. **Push** 브랜치 (`git push origin feature/amazing-feature`)
5. **Pull Request** 생성

## 🔗 관련 링크

- [HUA Labs 공식 사이트](https://hua-labs.com)
- [UI 컴포넌트 갤러리](https://ui.hua-labs.com)
- [GitHub 저장소](https://github.com/HUA-Labs/HUA-Labs-public)

---

**HUA Labs**에서 제작되었습니다. 🚀

---

# @hua-labs/ui 🎨

**HUA Labs' Modern React UI Component Library**

Beautiful, accessible, and customizable components for React applications.

## ✨ Key Features

### 🎯 **15 Core Components**
- **Basic UI**: Accordion, BottomSheet, Drawer, ConfirmModal, ScrollArea, Icon, Breadcrumb
- **Theme**: ThemeProvider, ThemeToggle
- **Scroll**: ScrollToTop, ScrollIndicator, ScrollProgress
- **Transition**: PageTransition
- **Emotion**: ChatMessage, EmotionAnalysis, EmotionSelector

### 🌙 **Dark Mode Support**
- Automatic theme detection
- Manual theme switching
- Consistent design system

### ♿ **Accessibility**
- ARIA attributes support
- Keyboard navigation
- Screen reader compatibility

### 📱 **Responsive Design**
- Perfect experience on all devices
- Mobile-first design

## 🚀 Getting Started

### Installation

```bash
npm install @hua-labs/ui
# or
yarn add @hua-labs/ui
# or
pnpm add @hua-labs/ui
```

### Basic Usage

```tsx
import { Accordion, ThemeProvider } from '@hua-labs/ui';

function App() {
  return (
    <ThemeProvider>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Accordion Title</AccordionTrigger>
          <AccordionContent>
            Accordion content here.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ThemeProvider>
  );
}
```

## 📚 Component Guide

### Accordion

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@hua-labs/ui';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>First Item</AccordionTrigger>
    <AccordionContent>First item content</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Second Item</AccordionTrigger>
    <AccordionContent>Second item content</AccordionContent>
  </AccordionItem>
</Accordion>
```

### ThemeProvider & ThemeToggle

```tsx
import { ThemeProvider, ThemeToggle } from '@hua-labs/ui';

function App() {
  return (
    <ThemeProvider>
      <div>
        <ThemeToggle />
        {/* Other components */}
      </div>
    </ThemeProvider>
  );
}
```

### BottomSheet

```tsx
import { BottomSheet } from '@hua-labs/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)}
    >
      <div className="p-6">
        <h2>Bottom Sheet Title</h2>
        <p>Bottom sheet content here.</p>
      </div>
    </BottomSheet>
  );
}
```

## 🎨 Theme Customization

### Using CSS Variables

```css
:root {
  --hua-primary: #3b82f6;
  --hua-secondary: #64748b;
  --hua-accent: #f59e0b;
  --hua-background: #ffffff;
  --hua-foreground: #0f172a;
}

[data-theme="dark"] {
  --hua-background: #0f172a;
  --hua-foreground: #f8fafc;
}
```

## 🔧 Development

### Build

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Type Check

```bash
pnpm type-check
```

## 📄 License

MIT License - Feel free to use!

## 🤝 Contributing

1. **Fork** the project
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** branch (`git push origin feature/amazing-feature`)
5. **Create** Pull Request

## 🔗 Links

- [HUA Labs Official Site](https://hua-labs.com)
- [UI Component Gallery](https://ui.hua-labs.com)
- [GitHub Repository](https://github.com/HUA-Labs/HUA-Labs-public)

---

**Made with ❤️ by HUA Labs** 🚀 