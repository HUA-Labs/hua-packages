# @hua-labs/ui 🎨

**HUA Labs의 모던 React UI 컴포넌트 라이브러리**

Beautiful, accessible, and customizable components for React applications.

## ✨ 주요 기능

### 🎯 **15개의 핵심 컴포넌트**
- **기본 UI**: Accordion, BottomSheet, Drawer, ConfirmModal, ScrollArea, Icon, Breadcrumb
- **테마**: ThemeProvider, ThemeToggle
- **스크롤**: ScrollToTop, ScrollIndicator, ScrollProgress
- **전환**: PageTransition
- **감정**: ChatMessage, EmotionAnalysis, EmotionSelector

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
import { Accordion, ThemeProvider } from '@hua-labs/ui';

function App() {
  return (
    <ThemeProvider>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>아코디언 제목</AccordionTrigger>
          <AccordionContent>
            아코디언 내용입니다.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ThemeProvider>
  );
}
```

## 📚 컴포넌트 가이드

### Accordion (아코디언)

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@hua-labs/ui';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>첫 번째 항목</AccordionTrigger>
    <AccordionContent>첫 번째 항목의 내용</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>두 번째 항목</AccordionTrigger>
    <AccordionContent>두 번째 항목의 내용</AccordionContent>
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
        {/* 다른 컴포넌트들 */}
      </div>
    </ThemeProvider>
  );
}
```

### BottomSheet (바텀시트)

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
        <h2>바텀시트 제목</h2>
        <p>바텀시트 내용입니다.</p>
      </div>
    </BottomSheet>
  );
}
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