# @hua-labs/ui Detailed Guide

Complete technical reference for the modern React UI component library.
모던 React UI 컴포넌트 라이브러리에 대한 완전한 기술 레퍼런스입니다.

---

## English

### Table of Contents

- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Entry Points](#entry-points)
- [Core Components](#core-components)
- [Style System](#style-system)
- [Icon System](#icon-system)
- [Theme System](#theme-system)
- [Hooks](#hooks)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

---

## Architecture

### Design Philosophy

`@hua-labs/ui` is built on four core principles:

1. **Atomic-First** - Root export contains only atomic components; composite components are organized into subpath exports for optimal tree-shaking
2. **Zero-Config Design System** - Works out of the box with Tailwind CSS v4, optional theme customization
3. **Accessibility First** - Full ARIA support, keyboard navigation, WCAG 2.1 AA compliant
4. **Developer Experience** - TypeScript-first with full type safety and IntelliSense support

### Package Structure

```
@hua-labs/ui
├── Core (atomic)       → Button, Input, Card, Badge, Alert, Avatar...
├── /form               → Form, Select, DatePicker, Autocomplete, Upload...
├── /overlay            → Modal, Popover, Dropdown, Drawer, BottomSheet...
├── /data               → Table, CodeBlock...
├── /interactive        → Accordion, Tabs, Menu, Command...
├── /navigation         → Navigation, Breadcrumb, Pagination...
├── /feedback           → Toast, LoadingSpinner...
├── /advanced           → Dashboard, Motion, Emotion components...
├── /sdui               → Server-Driven UI components
├── /iconsax            → Iconsax icon set
├── /icons              → Custom icon components
└── /styles/*           → CSS files
```

### Component Categories

| Category | Entry Point | Purpose |
|----------|-------------|---------|
| Atomic UI | `@hua-labs/ui` | Buttons, inputs, cards, badges, avatars |
| Layout | `@hua-labs/ui` | Container, Grid, Stack, Card, Panel |
| Form | `@hua-labs/ui/form` | Complete form components |
| Overlay | `@hua-labs/ui/overlay` | Modals, popovers, dropdowns, drawers |
| Data | `@hua-labs/ui/data` | Tables, code blocks |
| Interactive | `@hua-labs/ui/interactive` | Accordions, tabs, menus |
| Navigation | `@hua-labs/ui/navigation` | Navigation, breadcrumbs, pagination |
| Feedback | `@hua-labs/ui/feedback` | Toast notifications, spinners |
| Advanced | `@hua-labs/ui/advanced` | Complex domain components |

---

## Installation & Setup

### Basic Installation

```bash
pnpm add @hua-labs/ui
# or
npm install @hua-labs/ui
```

### Peer Dependencies

Required:
```json
{
  "react": ">=19.0.0",
  "react-dom": ">=19.0.0"
}
```

Optional (for drag-and-drop components):
```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

### Tailwind CSS Setup

HUA UI requires Tailwind CSS v4. Configure your project:

```css
/* globals.css */
@import "tailwindcss";
@import "@hua-labs/ui/styles/recommended-theme.css";
```

**Minimal setup (no theme):**
```css
@import "tailwindcss";
@import "@hua-labs/ui/styles/base.css";
```

### TypeScript Configuration

No additional setup required. The library includes comprehensive type definitions.

---

## Entry Points

### Core Export (`@hua-labs/ui`)

**Basic UI:**
- `Button` - Multi-variant button with loading states
- `Action` - Lightweight button alternative
- `Input` - Text input with validation
- `NumberInput` - Numeric input with step controls
- `Link` - Styled anchor element
- `Icon` - Universal icon component
- `Avatar` - User avatar with fallback
- `Badge` - Status/label indicator

**Layout:**
- `Container` - Responsive container
- `Grid` - CSS grid wrapper
- `Stack` - Flexbox stack (vertical/horizontal)
- `Card` - Card with compound components (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- `Panel` - Content panel
- `Divider` - Visual separator
- `ActionToolbar` - Action button toolbar

**Feedback:**
- `Alert` - Alert with variants (Success, Warning, Error, Info)
- `Toast` - Toast notification system (ToastProvider, useToast)
- `LoadingSpinner` - Loading indicator
- `Tooltip` - Tooltip with light/dark variants

**Form Elements:**
- `Label` - Form label
- `Switch` - Toggle switch
- `Toggle` - Toggle button

**Data Display:**
- `Progress` - Progress bar with variants
- `Skeleton` - Loading skeletons (Text, Circle, Rectangle, Card, Avatar, Image, UserProfile, List, Table)

**Theme & Scroll:**
- `ThemeProvider` - Theme context provider
- `ThemeToggle` - Theme switcher
- `ScrollArea` - Custom scrollbar
- `ScrollToTop` - Scroll to top button

### Form Export (`@hua-labs/ui/form`)

```tsx
import { Form, FormControl, Select, DatePicker, Upload, Autocomplete } from '@hua-labs/ui/form';
```

Components:
- `Form` - Form wrapper with validation
- `FormControl` - Form field wrapper
- `Select` - Dropdown select
- `Checkbox` - Checkbox input
- `Radio` - Radio input
- `Textarea` - Multiline text input
- `Slider` - Range slider
- `DatePicker` - Date picker
- `Upload` - File upload
- `Autocomplete` - Autocomplete input
- `ColorPicker` - Color picker

### Overlay Export (`@hua-labs/ui/overlay`)

```tsx
import { Modal, Drawer, Popover, Dropdown, BottomSheet } from '@hua-labs/ui/overlay';
```

Components:
- `Modal` - Modal dialog
- `Drawer` - Side drawer
- `Popover` - Popover overlay
- `Dropdown` - Dropdown menu
- `BottomSheet` - Bottom sheet (mobile-first)
- `ConfirmModal` - Confirmation dialog

### Data Export (`@hua-labs/ui/data`)

```tsx
import { Table, CodeBlock } from '@hua-labs/ui/data';
```

Components:
- `Table` - Data table
- `CodeBlock` - Syntax-highlighted code block

### Interactive Export (`@hua-labs/ui/interactive`)

```tsx
import { Accordion, Tabs, Menu, Command } from '@hua-labs/ui/interactive';
```

Components:
- `Accordion` - Collapsible accordion
- `Tabs` - Tab navigation
- `Menu` - Menu component
- `ContextMenu` - Context menu
- `Command` - Command palette

### Navigation Export (`@hua-labs/ui/navigation`)

```tsx
import { Navigation, Breadcrumb, Pagination } from '@hua-labs/ui/navigation';
```

Components:
- `Navigation` - Navigation component
- `Breadcrumb` - Breadcrumb trail
- `Pagination` - Page pagination
- `PageNavigation` - Page-level navigation
- `PageTransition` - Page transition animations

### Advanced Export (`@hua-labs/ui/advanced`)

```tsx
import { Dashboard } from '@hua-labs/ui/advanced/dashboard';
import { MotionCard } from '@hua-labs/ui/advanced/motion';
import { EmotionSelector } from '@hua-labs/ui/advanced/emotion';
```

Domain-specific advanced components.

---

## Core Components

### Button

Multi-variant button with loading states, icons, and advanced styling.

```tsx
import { Button } from '@hua-labs/ui';

<Button variant="default" size="md">Click Me</Button>
<Button variant="destructive" loading>Deleting...</Button>
<Button variant="gradient" gradient="purple">Gradient</Button>
<Button href="/about" variant="link">Learn More</Button>
<Button icon={<Icon name="plus" />} iconPosition="left">Add</Button>
<Button hover="springy" shadow="lg" rounded="full">Springy</Button>
```

**Props:**
- `variant` - "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "neon" | "glass"
- `size` - "sm" | "md" | "lg" | "xl" | "icon"
- `loading` - Show loading spinner
- `icon` - Icon element
- `iconPosition` - "left" | "right"
- `gradient` - "blue" | "purple" | "green" | "orange" | "pink" | "custom"
- `customGradient` - Custom Tailwind gradient classes
- `rounded` - "sm" | "md" | "lg" | "full"
- `shadow` - "none" | "sm" | "md" | "lg" | "xl"
- `hover` - "springy" | "scale" | "glow" | "slide" | "none"
- `fullWidth` - Expand to full width
- `asChild` - Render as child element (Slot pattern)

### Card

Compound component for content cards.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@hua-labs/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    Main content area
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Features:**
- Compound component pattern for flexible composition
- Supports all base HTML div attributes
- Dark mode ready
- Customizable via className

### Icon

Universal icon component supporting multiple icon sets (Phosphor, Lucide, Iconsax).

```tsx
import { Icon, IconProvider } from '@hua-labs/ui';

// Global configuration
<IconProvider set="phosphor" size={24} weight="regular">
  <App />
</IconProvider>

// Usage
<Icon name="heart" />
<Icon name="user" size={32} variant="primary" />
<Icon name="loader" spin />
<Icon name="check" variant="success" />
<Icon name="star" pulse animated />
```

**Props:**
- `name` - Icon name (auto-normalized across providers)
- `size` - Icon size (number or string)
- `variant` - "default" | "primary" | "secondary" | "success" | "warning" | "error" | "muted" | "inherit"
- `provider` - Override icon provider ("phosphor" | "lucide" | "iconsax")
- `weight` - Phosphor weight ("thin" | "light" | "regular" | "bold" | "fill" | "duotone")
- `animated` - Smooth animation effect
- `pulse` - Pulse animation
- `spin` - Rotation animation
- `bounce` - Bounce animation

**Icon Sets:**
- **Phosphor** (default) - 6 weights, 1200+ icons
- **Lucide** - Minimalist, 1000+ icons
- **Iconsax** - 4 variants (line/bold/bulk/broken), 1000+ icons (requires `@hua-labs/ui/iconsax` import)

**Icon Aliases:**
```tsx
// Normalized across providers
<Icon name="trash" />     // → phosphor: Trash, lucide: Trash2, iconsax: trash
<Icon name="settings" />  // → phosphor: Gear, lucide: Settings, iconsax: setting
<Icon name="user" />      // → phosphor: User, lucide: User, iconsax: profile
```

### Modal

Accessible modal dialog with overlay and keyboard handling.

```tsx
import { Modal } from '@hua-labs/ui';

const [open, setOpen] = useState(false);

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Modal Title"
  description="Modal description"
>
  <p>Modal content</p>
  <Button onClick={() => setOpen(false)}>Close</Button>
</Modal>
```

**Props:**
- `open` - Controlled open state
- `onClose` - Close handler
- `title` - Modal title
- `description` - Modal description (optional)
- `children` - Modal content
- `size` - "sm" | "md" | "lg" | "xl" | "full"
- `closeOnOverlayClick` - Close on overlay click (default: true)
- `showCloseButton` - Show close button (default: true)

**Accessibility:**
- Traps focus within modal
- Closes on Escape key
- ARIA attributes for screen readers
- Restores focus on close

### Input

Text input with validation states and custom styling.

```tsx
import { Input, Label } from '@hua-labs/ui';

<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    error="Invalid email"
  />
</div>
```

**Props:**
- All standard input attributes
- `error` - Error message (shows red border)
- `success` - Success state (shows green border)
- `icon` - Left icon element
- `iconRight` - Right icon element

### Alert

Alert component with semantic variants.

```tsx
import { Alert, AlertSuccess, AlertWarning, AlertError, AlertInfo } from '@hua-labs/ui';

<AlertSuccess>Operation successful</AlertSuccess>
<AlertWarning>Warning message</AlertWarning>
<AlertError>Error occurred</AlertError>
<AlertInfo>Information message</AlertInfo>

// Generic
<Alert variant="success">Custom alert</Alert>
```

**Props:**
- `variant` - "success" | "warning" | "error" | "info"
- `title` - Alert title (optional)
- `children` - Alert content
- `icon` - Custom icon (optional)

### Toast

Toast notification system with context provider.

```tsx
import { ToastProvider, useToast } from '@hua-labs/ui';
import '@hua-labs/ui/styles/toast.css';

// Wrap your app
<ToastProvider>
  <App />
</ToastProvider>

// In component
function Component() {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "Success",
      description: "Operation completed",
      variant: "success",
      duration: 3000
    });
  };

  return <Button onClick={showToast}>Show Toast</Button>;
}
```

**Toast Options:**
- `title` - Toast title
- `description` - Toast description
- `variant` - "default" | "success" | "warning" | "error" | "info"
- `duration` - Duration in ms (default: 3000)
- `action` - Action button config

**Safe Hook:**
```tsx
// Use in components that might not have ToastProvider
const toast = useToastSafe();
```

### Badge

Status indicator badge.

```tsx
import { Badge } from '@hua-labs/ui';

<Badge>Default</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="outline">Outline</Badge>
```

**Props:**
- `variant` - "default" | "success" | "warning" | "error" | "outline" | "secondary"
- `size` - "sm" | "md" | "lg"
- `children` - Badge content

### Progress

Progress bar with compound variants.

```tsx
import { Progress, ProgressSuccess, ProgressWarning, ProgressError, ProgressInfo, ProgressGroup } from '@hua-labs/ui';

<Progress value={60} max={100} />
<ProgressSuccess value={100} />
<ProgressWarning value={50} />

// Group multiple progress bars
<ProgressGroup>
  <ProgressSuccess value={30} />
  <ProgressWarning value={40} />
  <ProgressError value={20} />
</ProgressGroup>
```

**Props:**
- `value` - Current value
- `max` - Maximum value (default: 100)
- `variant` - "default" | "success" | "warning" | "error" | "info"
- `showLabel` - Show percentage label

### Skeleton

Loading skeleton components.

```tsx
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonCard, SkeletonAvatar, SkeletonUserProfile, SkeletonList, SkeletonTable } from '@hua-labs/ui';

<SkeletonText lines={3} />
<SkeletonCircle size={64} />
<SkeletonCard />
<SkeletonAvatar />
<SkeletonUserProfile />
<SkeletonList items={5} />
<SkeletonTable rows={5} columns={4} />
```

**Variants:**
- `Skeleton` - Base skeleton
- `SkeletonText` - Text lines skeleton
- `SkeletonCircle` - Circle skeleton
- `SkeletonRectangle` - Rectangle skeleton
- `SkeletonRounded` - Rounded rectangle skeleton
- `SkeletonCard` - Card skeleton
- `SkeletonAvatar` - Avatar skeleton
- `SkeletonImage` - Image skeleton
- `SkeletonUserProfile` - User profile skeleton
- `SkeletonList` - List skeleton
- `SkeletonTable` - Table skeleton

### ThemeProvider

Theme context provider for dark/light mode.

```tsx
import { ThemeProvider, ThemeToggle, useTheme } from '@hua-labs/ui';

<ThemeProvider defaultTheme="system" storageKey="ui-theme">
  <App />
</ThemeProvider>

// Theme toggle button
<ThemeToggle />

// Custom theme control
function CustomThemeControl() {
  const { theme, setTheme } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
```

**Props:**
- `defaultTheme` - "light" | "dark" | "system" (default: "system")
- `storageKey` - localStorage key (default: "ui-theme")
- `children` - App content

---

## Style System

### Utility Functions

```tsx
import { merge, mergeIf, mergeMap, cn } from '@hua-labs/ui';

// Smart class merging (clsx + tailwind-merge)
merge("px-2 py-1", "px-4") // → "py-1 px-4"

// Conditional merging
mergeIf(isActive, "bg-blue-500", "bg-gray-200")

// Object-based merging
mergeMap({
  "bg-blue-500": isPrimary,
  "bg-gray-500": !isPrimary,
  "text-white": true,
  "opacity-50": isDisabled
})

// Alias for merge (backward compatibility)
cn("text-lg", "font-bold")
```

### Style Creators

```tsx
import {
  createColorStyles,
  createVariantStyles,
  createSizeStyles,
  createRoundedStyles,
  createShadowStyles,
  createHoverStyles
} from '@hua-labs/ui';

// Color styles
const colorStyles = createColorStyles({
  primary: "bg-blue-500 text-white",
  secondary: "bg-gray-200 text-gray-800"
});

// Variant styles with CVA
const buttonVariants = createVariantStyles({
  base: "inline-flex items-center justify-center",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      destructive: "bg-destructive text-destructive-foreground"
    },
    size: {
      sm: "text-sm px-3 py-1.5",
      md: "text-base px-4 py-2"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
});
```

### CSS Variables

HUA UI uses CSS variables for theming:

```css
/* Light mode */
:root {
  --background: 210 20% 98%;
  --foreground: 210 10% 10%;
  --primary: 166 78% 30%;
  --primary-foreground: 0 0% 100%;
  --secondary: 210 15% 94%;
  --secondary-foreground: 210 10% 20%;
  --muted: 210 15% 94%;
  --muted-foreground: 210 10% 40%;
  --accent: 226 100% 97%;
  --accent-foreground: 234 89% 74%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 210 15% 88%;
  --input: 210 15% 88%;
  --ring: 166 78% 30%;
  --card: 0 0% 100%;
  --card-foreground: 210 10% 10%;
}

/* Dark mode */
[data-theme="dark"] {
  --background: 210 10% 8%;
  --foreground: 210 10% 98%;
  /* ... other dark mode colors */
}
```

### Tailwind Utilities

```tsx
// Background colors
className="bg-background text-foreground"
className="bg-primary text-primary-foreground"
className="bg-card text-card-foreground"

// Borders
className="border border-border"
className="ring-2 ring-ring"

// Dark mode
className="bg-white dark:bg-slate-900"
className="text-gray-900 dark:text-gray-100"
```

### Micro Motion

Built-in micro-interactions:

```tsx
import { useMicroMotion, getMicroMotionClasses } from '@hua-labs/ui';

// Hook-based
function Component() {
  const motion = useMicroMotion('button-press');
  return <button {...motion.props}>Click me</button>;
}

// Class-based
const classes = getMicroMotionClasses('hover-lift');
<div className={classes}>Hover me</div>

// Available presets:
// 'button-press', 'hover-lift', 'card-hover', 'fade-in', 'slide-up'
```

---

## Icon System

### Icon Providers

HUA UI supports three icon providers:

**1. Phosphor Icons (Default)**
```tsx
import { Icon, IconProvider } from '@hua-labs/ui';

<IconProvider set="phosphor" weight="regular">
  <Icon name="heart" />
</IconProvider>
```

Weights: `thin`, `light`, `regular`, `bold`, `fill`, `duotone`

**2. Lucide Icons**
```tsx
<IconProvider set="lucide">
  <Icon name="heart" />
</IconProvider>
```

Minimalist design, consistent stroke width.

**3. Iconsax Icons**
```tsx
// Must import iconsax entry first
import '@hua-labs/ui/iconsax';

<IconProvider set="iconsax" iconsaxVariant="bold">
  <Icon name="heart" />
</IconProvider>
```

Variants: `line`, `bold`, `bulk`, `broken`

### Icon Configuration

```tsx
import { IconProvider, defaultIconConfig } from '@hua-labs/ui';

<IconProvider
  set="phosphor"           // Icon provider
  size={24}                // Default size
  color="currentColor"     // Default color
  weight="regular"         // Phosphor weight
  strokeWidth={1.5}        // Lucide stroke width
  iconsaxVariant="line"    // Iconsax variant
>
  <App />
</IconProvider>
```

### Emotion & Status Icons

Pre-configured semantic icons:

```tsx
import { EmotionIcon, StatusIcon } from '@hua-labs/ui';

// Emotion icons
<EmotionIcon emotion="happy" />
<EmotionIcon emotion="sad" />
<EmotionIcon emotion="angry" />

// Status icons
<StatusIcon status="success" />
<StatusIcon status="error" />
<StatusIcon status="warning" />
<StatusIcon status="info" />
```

### Custom Icon Components

```tsx
import { HeartIcon, UserIcon, SettingsIcon } from '@hua-labs/ui/icons';
import { HeartBold, UserBold, SettingsBold } from '@hua-labs/ui/icons-bold';

<HeartIcon size={24} />
<UserBold size={32} />
```

### Icon Aliases

Common icon names are aliased across providers:

```tsx
// All resolve to correct provider-specific names
<Icon name="trash" />      // Trash, Trash2, trash
<Icon name="settings" />   // Gear, Settings, setting
<Icon name="user" />       // User, User, profile
<Icon name="search" />     // MagnifyingGlass, Search, search-normal
<Icon name="close" />      // X, X, close-circle
```

---

## Theme System

### ThemeProvider Setup

```tsx
import { ThemeProvider } from '@hua-labs/ui';

<ThemeProvider defaultTheme="system" storageKey="app-theme">
  <App />
</ThemeProvider>
```

### useTheme Hook

```tsx
import { useTheme } from '@hua-labs/ui';

function CustomThemeControl() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>System theme: {systemTheme}</p>
      <p>Resolved theme: {resolvedTheme}</p>

      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

### Theme Toggle

```tsx
import { ThemeToggle } from '@hua-labs/ui';

// Preset toggle button
<ThemeToggle />

// Custom implementation
function CustomToggle() {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <button onClick={() => setTheme(nextTheme)}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Dark Mode Classes

```tsx
// Conditional dark mode styles
className="bg-white dark:bg-slate-900"
className="text-gray-900 dark:text-gray-100"
className="border-gray-200 dark:border-gray-700"

// Using CSS variables (theme-aware)
className="bg-background text-foreground"
className="border-border"
```

---

## Hooks

### useInView

Detect when element enters viewport.

```tsx
import { useInView } from '@hua-labs/ui';

function Component() {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  return (
    <div ref={ref}>
      {inView ? 'Visible' : 'Hidden'}
    </div>
  );
}
```

### useScrollProgress

Track scroll progress as percentage.

```tsx
import { useScrollProgress } from '@hua-labs/ui';

function ScrollIndicator() {
  const { progress } = useScrollProgress();

  return (
    <div
      style={{
        width: `${progress}%`,
        height: 4,
        background: 'blue'
      }}
    />
  );
}
```

### useMouse

Track mouse position.

```tsx
import { useMouse } from '@hua-labs/ui';

function Component() {
  const { x, y, elementX, elementY, elementW, elementH } = useMouse();

  return (
    <div>
      Mouse: {x}, {y}
    </div>
  );
}
```

### useReducedMotion

Detect reduced motion preference.

```tsx
import { useReducedMotion } from '@hua-labs/ui';

function Component() {
  const reducedMotion = useReducedMotion();

  return (
    <div className={reducedMotion ? '' : 'animate-bounce'}>
      Content
    </div>
  );
}
```

### useWindowSize

Track window dimensions.

```tsx
import { useWindowSize } from '@hua-labs/ui';

function Component() {
  const { width, height, isMobile, isTablet, isDesktop } = useWindowSize();

  return (
    <div>
      Window: {width}x{height}
      {isMobile && <p>Mobile view</p>}
    </div>
  );
}
```

---

## Advanced Usage

### Compound Components

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@hua-labs/ui';

<Card>
  <CardHeader>
    <CardTitle>Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <p>User information</p>
  </CardContent>
  <CardFooter>
    <Button>Edit</Button>
  </CardFooter>
</Card>
```

### Slot Pattern (Polymorphic Components)

```tsx
import { Button } from '@hua-labs/ui';
import NextLink from 'next/link';

// Render as Next.js Link
<Button asChild>
  <NextLink href="/about">About</NextLink>
</Button>

// Render as custom element
<Button asChild>
  <a href="/external" target="_blank">External Link</a>
</Button>
```

### Custom Styling

```tsx
import { Button, merge } from '@hua-labs/ui';

// Extend component styles
<Button className={merge("custom-class", "hover:custom-hover")}>
  Custom Button
</Button>

// Override variant styles
<Button
  className="bg-gradient-to-r from-purple-500 to-pink-500"
  variant="ghost"
>
  Custom Gradient
</Button>
```

### Server Components (Next.js App Router)

```tsx
// Server Component (no 'use client')
import { Card, CardHeader, CardTitle, CardContent } from '@hua-labs/ui';

export default function ServerComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Server-rendered Card</CardTitle>
      </CardHeader>
      <CardContent>
        This renders on the server
      </CardContent>
    </Card>
  );
}

// Client Component (interactive)
'use client';

import { Button } from '@hua-labs/ui';

export default function ClientComponent() {
  return (
    <Button onClick={() => console.log('clicked')}>
      Click me
    </Button>
  );
}
```

### Form Validation

```tsx
import { Form, FormControl, Input, Button } from '@hua-labs/ui/form';

function LoginForm() {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormControl>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          error={errors.email}
        />
      </FormControl>

      <FormControl>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          error={errors.password}
        />
      </FormControl>

      <Button type="submit">Login</Button>
    </Form>
  );
}
```

---

## Troubleshooting

### "bg-primary not working"

**Issue:** Tailwind utility classes like `bg-primary` not working.

**Solution:** Import the recommended theme CSS:

```css
/* globals.css */
@import "tailwindcss";
@import "@hua-labs/ui/styles/recommended-theme.css";
```

Without the theme, use standard Tailwind colors:
```tsx
<Button className="bg-blue-500">Button</Button>
```

---

### Dark mode not working

**Issue:** Dark mode styles not applied.

**Solution:** Wrap your app with `ThemeProvider`:

```tsx
import { ThemeProvider } from '@hua-labs/ui';

<ThemeProvider>
  <App />
</ThemeProvider>
```

Ensure dark mode classes are used:
```tsx
className="bg-white dark:bg-slate-900"
```

---

### SSR hydration mismatch

**Issue:** Warning about server/client mismatch.

**Solution:** Add `'use client'` directive for interactive components:

```tsx
'use client';

import { Button } from '@hua-labs/ui';

export default function Component() {
  return <Button onClick={() => {}}>Click</Button>;
}
```

Non-interactive components (Card, Badge, etc.) can remain server components.

---

### Icon not found

**Issue:** Icon component shows "?" placeholder.

**Solution:**

1. Check icon provider setup:
```tsx
import { IconProvider } from '@hua-labs/ui';

<IconProvider set="phosphor">
  <App />
</IconProvider>
```

2. For Iconsax, import the entry point:
```tsx
import '@hua-labs/ui/iconsax';
import { IconProvider } from '@hua-labs/ui';

<IconProvider set="iconsax">
  <App />
</IconProvider>
```

3. Verify icon name is valid. Check available icons:
```tsx
import { iconNames } from '@hua-labs/ui';
console.log(iconNames);
```

---

### Type errors with refs

**Issue:** TypeScript errors with ref prop.

**Solution:** Components forward refs correctly. Ensure ref type matches element:

```tsx
const buttonRef = useRef<HTMLButtonElement>(null);
<Button ref={buttonRef}>Button</Button>

const divRef = useRef<HTMLDivElement>(null);
<Card ref={divRef}>Card</Card>
```

---

### Toast not showing

**Issue:** Toast notifications not appearing.

**Solution:**

1. Import toast CSS:
```css
@import "@hua-labs/ui/styles/toast.css";
```

2. Wrap app with ToastProvider:
```tsx
import { ToastProvider } from '@hua-labs/ui';

<ToastProvider>
  <App />
</ToastProvider>
```

3. Use the hook:
```tsx
import { useToast } from '@hua-labs/ui';

function Component() {
  const { toast } = useToast();
  toast({ title: "Success" });
}
```

---

### Bundle size issues

**Issue:** Large bundle size.

**Solution:** Use subpath imports to import only needed components:

```tsx
// Bad: Imports entire package
import { Form, Select, DatePicker } from '@hua-labs/ui';

// Good: Tree-shakeable
import { Button, Card } from '@hua-labs/ui';
import { Form, Select } from '@hua-labs/ui/form';
```

Analyze bundle:
```bash
pnpm run build:analyze
```

---

### Tailwind classes not working

**Issue:** Custom Tailwind classes not applied.

**Solution:** Ensure Tailwind config includes HUA UI paths:

```js
// tailwind.config.js
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './node_modules/@hua-labs/ui/dist/**/*.{js,mjs}',
  ],
  // ...
};
```

---

## Korean

### 목차

- [아키텍처](#아키텍처-1)
- [설치 및 설정](#설치-및-설정-1)
- [진입점](#진입점-1)
- [핵심 컴포넌트](#핵심-컴포넌트-1)
- [스타일 시스템](#스타일-시스템-1)
- [아이콘 시스템](#아이콘-시스템-1)
- [테마 시스템](#테마-시스템-1)
- [훅](#훅-1)
- [고급 사용법](#고급-사용법-1)
- [문제 해결](#문제-해결-1)

---

## 아키텍처

### 설계 철학

`@hua-labs/ui`는 네 가지 핵심 원칙을 기반으로 합니다:

1. **원자 우선** - 루트 export는 원자 컴포넌트만 포함하며, 복합 컴포넌트는 서브경로 export로 구성하여 최적의 트리쉐이킹 제공
2. **무설정 디자인 시스템** - Tailwind CSS v4와 즉시 사용 가능, 선택적 테마 커스터마이징
3. **접근성 우선** - 완전한 ARIA 지원, 키보드 내비게이션, WCAG 2.1 AA 준수
4. **개발자 경험** - 완전한 타입 안전성과 IntelliSense 지원을 제공하는 TypeScript 우선

### 패키지 구조

```
@hua-labs/ui
├── Core (원자)          → Button, Input, Card, Badge, Alert, Avatar...
├── /form               → Form, Select, DatePicker, Autocomplete, Upload...
├── /overlay            → Modal, Popover, Dropdown, Drawer, BottomSheet...
├── /data               → Table, CodeBlock...
├── /interactive        → Accordion, Tabs, Menu, Command...
├── /navigation         → Navigation, Breadcrumb, Pagination...
├── /feedback           → Toast, LoadingSpinner...
├── /advanced           → Dashboard, Motion, Emotion 컴포넌트...
├── /sdui               → Server-Driven UI 컴포넌트
├── /iconsax            → Iconsax 아이콘 세트
├── /icons              → 커스텀 아이콘 컴포넌트
└── /styles/*           → CSS 파일
```

### 컴포넌트 카테고리

| 카테고리 | 진입점 | 목적 |
|---------|--------|------|
| 원자 UI | `@hua-labs/ui` | 버튼, 인풋, 카드, 뱃지, 아바타 |
| 레이아웃 | `@hua-labs/ui` | Container, Grid, Stack, Card, Panel |
| 폼 | `@hua-labs/ui/form` | 완전한 폼 컴포넌트 |
| 오버레이 | `@hua-labs/ui/overlay` | 모달, 팝오버, 드롭다운, 드로어 |
| 데이터 | `@hua-labs/ui/data` | 테이블, 코드 블록 |
| 인터랙티브 | `@hua-labs/ui/interactive` | 아코디언, 탭, 메뉴 |
| 내비게이션 | `@hua-labs/ui/navigation` | 내비게이션, 브레드크럼, 페이지네이션 |
| 피드백 | `@hua-labs/ui/feedback` | 토스트 알림, 스피너 |
| 고급 | `@hua-labs/ui/advanced` | 복잡한 도메인 컴포넌트 |

---

## 설치 및 설정

### 기본 설치

```bash
pnpm add @hua-labs/ui
# 또는
npm install @hua-labs/ui
```

### Peer Dependencies

필수:
```json
{
  "react": ">=19.0.0",
  "react-dom": ">=19.0.0"
}
```

선택 (드래그 앤 드롭 컴포넌트용):
```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

### Tailwind CSS 설정

HUA UI는 Tailwind CSS v4가 필요합니다. 프로젝트 설정:

```css
/* globals.css */
@import "tailwindcss";
@import "@hua-labs/ui/styles/recommended-theme.css";
```

**최소 설정 (테마 없이):**
```css
@import "tailwindcss";
@import "@hua-labs/ui/styles/base.css";
```

### TypeScript 설정

추가 설정 불필요. 라이브러리에 완전한 타입 정의가 포함되어 있습니다.

---

## 진입점

### 코어 Export (`@hua-labs/ui`)

**기본 UI:**
- `Button` - 로딩 상태를 지원하는 다중 변형 버튼
- `Action` - 경량 버튼 대안
- `Input` - 유효성 검증을 지원하는 텍스트 입력
- `NumberInput` - 스텝 컨트롤이 있는 숫자 입력
- `Link` - 스타일이 적용된 앵커 요소
- `Icon` - 범용 아이콘 컴포넌트
- `Avatar` - 폴백이 있는 사용자 아바타
- `Badge` - 상태/라벨 표시기

**레이아웃:**
- `Container` - 반응형 컨테이너
- `Grid` - CSS grid 래퍼
- `Stack` - Flexbox 스택 (수직/수평)
- `Card` - 복합 컴포넌트가 있는 카드 (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- `Panel` - 콘텐츠 패널
- `Divider` - 시각적 구분선
- `ActionToolbar` - 액션 버튼 툴바

**피드백:**
- `Alert` - 변형이 있는 알림 (Success, Warning, Error, Info)
- `Toast` - 토스트 알림 시스템 (ToastProvider, useToast)
- `LoadingSpinner` - 로딩 표시기
- `Tooltip` - 라이트/다크 변형이 있는 툴팁

**폼 요소:**
- `Label` - 폼 라벨
- `Switch` - 토글 스위치
- `Toggle` - 토글 버튼

**데이터 디스플레이:**
- `Progress` - 변형이 있는 프로그레스 바
- `Skeleton` - 로딩 스켈레톤 (Text, Circle, Rectangle, Card, Avatar, Image, UserProfile, List, Table)

**테마 & 스크롤:**
- `ThemeProvider` - 테마 컨텍스트 프로바이더
- `ThemeToggle` - 테마 전환기
- `ScrollArea` - 커스텀 스크롤바
- `ScrollToTop` - 맨 위로 스크롤 버튼

### Form Export (`@hua-labs/ui/form`)

```tsx
import { Form, FormControl, Select, DatePicker, Upload, Autocomplete } from '@hua-labs/ui/form';
```

컴포넌트:
- `Form` - 유효성 검증이 있는 폼 래퍼
- `FormControl` - 폼 필드 래퍼
- `Select` - 드롭다운 선택
- `Checkbox` - 체크박스 입력
- `Radio` - 라디오 입력
- `Textarea` - 멀티라인 텍스트 입력
- `Slider` - 범위 슬라이더
- `DatePicker` - 날짜 선택기
- `Upload` - 파일 업로드
- `Autocomplete` - 자동완성 입력
- `ColorPicker` - 색상 선택기

### Overlay Export (`@hua-labs/ui/overlay`)

```tsx
import { Modal, Drawer, Popover, Dropdown, BottomSheet } from '@hua-labs/ui/overlay';
```

컴포넌트:
- `Modal` - 모달 다이얼로그
- `Drawer` - 사이드 드로어
- `Popover` - 팝오버 오버레이
- `Dropdown` - 드롭다운 메뉴
- `BottomSheet` - 바텀 시트 (모바일 우선)
- `ConfirmModal` - 확인 다이얼로그

### Data Export (`@hua-labs/ui/data`)

```tsx
import { Table, CodeBlock } from '@hua-labs/ui/data';
```

컴포넌트:
- `Table` - 데이터 테이블
- `CodeBlock` - 구문 강조 코드 블록

### Interactive Export (`@hua-labs/ui/interactive`)

```tsx
import { Accordion, Tabs, Menu, Command } from '@hua-labs/ui/interactive';
```

컴포넌트:
- `Accordion` - 접을 수 있는 아코디언
- `Tabs` - 탭 내비게이션
- `Menu` - 메뉴 컴포넌트
- `ContextMenu` - 컨텍스트 메뉴
- `Command` - 커맨드 팔레트

### Navigation Export (`@hua-labs/ui/navigation`)

```tsx
import { Navigation, Breadcrumb, Pagination } from '@hua-labs/ui/navigation';
```

컴포넌트:
- `Navigation` - 내비게이션 컴포넌트
- `Breadcrumb` - 브레드크럼 트레일
- `Pagination` - 페이지 페이지네이션
- `PageNavigation` - 페이지 레벨 내비게이션
- `PageTransition` - 페이지 전환 애니메이션

### Advanced Export (`@hua-labs/ui/advanced`)

```tsx
import { Dashboard } from '@hua-labs/ui/advanced/dashboard';
import { MotionCard } from '@hua-labs/ui/advanced/motion';
import { EmotionSelector } from '@hua-labs/ui/advanced/emotion';
```

도메인별 고급 컴포넌트.

---

## 핵심 컴포넌트

### Button

로딩 상태, 아이콘, 고급 스타일링을 지원하는 다중 변형 버튼.

```tsx
import { Button } from '@hua-labs/ui';

<Button variant="default" size="md">클릭하세요</Button>
<Button variant="destructive" loading>삭제 중...</Button>
<Button variant="gradient" gradient="purple">그라디언트</Button>
<Button href="/about" variant="link">자세히 보기</Button>
<Button icon={<Icon name="plus" />} iconPosition="left">추가</Button>
<Button hover="springy" shadow="lg" rounded="full">스프링</Button>
```

**Props:**
- `variant` - "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "neon" | "glass"
- `size` - "sm" | "md" | "lg" | "xl" | "icon"
- `loading` - 로딩 스피너 표시
- `icon` - 아이콘 요소
- `iconPosition` - "left" | "right"
- `gradient` - "blue" | "purple" | "green" | "orange" | "pink" | "custom"
- `customGradient` - 커스텀 Tailwind 그라디언트 클래스
- `rounded` - "sm" | "md" | "lg" | "full"
- `shadow` - "none" | "sm" | "md" | "lg" | "xl"
- `hover` - "springy" | "scale" | "glow" | "slide" | "none"
- `fullWidth` - 전체 너비로 확장
- `asChild` - 자식 요소로 렌더링 (Slot 패턴)

### Card

콘텐츠 카드를 위한 복합 컴포넌트.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@hua-labs/ui';

<Card>
  <CardHeader>
    <CardTitle>카드 제목</CardTitle>
    <CardDescription>카드 설명이 여기에 들어갑니다</CardDescription>
  </CardHeader>
  <CardContent>
    메인 콘텐츠 영역
  </CardContent>
  <CardFooter>
    <Button>액션</Button>
  </CardFooter>
</Card>
```

**특징:**
- 유연한 구성을 위한 복합 컴포넌트 패턴
- 모든 기본 HTML div 속성 지원
- 다크 모드 지원
- className으로 커스터마이징 가능

### Icon

여러 아이콘 세트(Phosphor, Lucide, Iconsax)를 지원하는 범용 아이콘 컴포넌트.

```tsx
import { Icon, IconProvider } from '@hua-labs/ui';

// 전역 설정
<IconProvider set="phosphor" size={24} weight="regular">
  <App />
</IconProvider>

// 사용
<Icon name="heart" />
<Icon name="user" size={32} variant="primary" />
<Icon name="loader" spin />
<Icon name="check" variant="success" />
<Icon name="star" pulse animated />
```

**Props:**
- `name` - 아이콘 이름 (프로바이더 간 자동 정규화)
- `size` - 아이콘 크기 (숫자 또는 문자열)
- `variant` - "default" | "primary" | "secondary" | "success" | "warning" | "error" | "muted" | "inherit"
- `provider` - 아이콘 프로바이더 오버라이드 ("phosphor" | "lucide" | "iconsax")
- `weight` - Phosphor 굵기 ("thin" | "light" | "regular" | "bold" | "fill" | "duotone")
- `animated` - 부드러운 애니메이션 효과
- `pulse` - 펄스 애니메이션
- `spin` - 회전 애니메이션
- `bounce` - 바운스 애니메이션

**아이콘 세트:**
- **Phosphor** (기본) - 6가지 굵기, 1200개 이상 아이콘
- **Lucide** - 미니멀리스트, 1000개 이상 아이콘
- **Iconsax** - 4가지 변형 (line/bold/bulk/broken), 1000개 이상 아이콘 (`@hua-labs/ui/iconsax` import 필요)

**아이콘 별칭:**
```tsx
// 프로바이더 간 정규화
<Icon name="trash" />     // → phosphor: Trash, lucide: Trash2, iconsax: trash
<Icon name="settings" />  // → phosphor: Gear, lucide: Settings, iconsax: setting
<Icon name="user" />      // → phosphor: User, lucide: User, iconsax: profile
```

### Modal

오버레이와 키보드 처리가 있는 접근 가능한 모달 다이얼로그.

```tsx
import { Modal } from '@hua-labs/ui';

const [open, setOpen] = useState(false);

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="모달 제목"
  description="모달 설명"
>
  <p>모달 콘텐츠</p>
  <Button onClick={() => setOpen(false)}>닫기</Button>
</Modal>
```

**Props:**
- `open` - 제어된 열림 상태
- `onClose` - 닫기 핸들러
- `title` - 모달 제목
- `description` - 모달 설명 (선택)
- `children` - 모달 콘텐츠
- `size` - "sm" | "md" | "lg" | "xl" | "full"
- `closeOnOverlayClick` - 오버레이 클릭 시 닫기 (기본값: true)
- `showCloseButton` - 닫기 버튼 표시 (기본값: true)

**접근성:**
- 모달 내에서 포커스 트랩
- Escape 키로 닫기
- 스크린 리더를 위한 ARIA 속성
- 닫을 때 포커스 복원

### Input

유효성 검증 상태와 커스텀 스타일링을 지원하는 텍스트 입력.

```tsx
import { Input, Label } from '@hua-labs/ui';

<div>
  <Label htmlFor="email">이메일</Label>
  <Input
    id="email"
    type="email"
    placeholder="이메일을 입력하세요"
    error="잘못된 이메일"
  />
</div>
```

**Props:**
- 모든 표준 입력 속성
- `error` - 에러 메시지 (빨간 테두리 표시)
- `success` - 성공 상태 (초록 테두리 표시)
- `icon` - 왼쪽 아이콘 요소
- `iconRight` - 오른쪽 아이콘 요소

### Alert

의미론적 변형이 있는 알림 컴포넌트.

```tsx
import { Alert, AlertSuccess, AlertWarning, AlertError, AlertInfo } from '@hua-labs/ui';

<AlertSuccess>작업 성공</AlertSuccess>
<AlertWarning>경고 메시지</AlertWarning>
<AlertError>에러 발생</AlertError>
<AlertInfo>정보 메시지</AlertInfo>

// 일반
<Alert variant="success">커스텀 알림</Alert>
```

**Props:**
- `variant` - "success" | "warning" | "error" | "info"
- `title` - 알림 제목 (선택)
- `children` - 알림 콘텐츠
- `icon` - 커스텀 아이콘 (선택)

### Toast

컨텍스트 프로바이더가 있는 토스트 알림 시스템.

```tsx
import { ToastProvider, useToast } from '@hua-labs/ui';
import '@hua-labs/ui/styles/toast.css';

// 앱 래핑
<ToastProvider>
  <App />
</ToastProvider>

// 컴포넌트 내에서
function Component() {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "성공",
      description: "작업 완료",
      variant: "success",
      duration: 3000
    });
  };

  return <Button onClick={showToast}>토스트 표시</Button>;
}
```

**토스트 옵션:**
- `title` - 토스트 제목
- `description` - 토스트 설명
- `variant` - "default" | "success" | "warning" | "error" | "info"
- `duration` - 지속 시간(ms) (기본값: 3000)
- `action` - 액션 버튼 설정

**안전 훅:**
```tsx
// ToastProvider가 없을 수 있는 컴포넌트에서 사용
const toast = useToastSafe();
```

### Badge

상태 표시 뱃지.

```tsx
import { Badge } from '@hua-labs/ui';

<Badge>기본</Badge>
<Badge variant="success">활성</Badge>
<Badge variant="warning">대기</Badge>
<Badge variant="error">실패</Badge>
<Badge variant="outline">아웃라인</Badge>
```

**Props:**
- `variant` - "default" | "success" | "warning" | "error" | "outline" | "secondary"
- `size` - "sm" | "md" | "lg"
- `children` - 뱃지 콘텐츠

### Progress

복합 변형이 있는 프로그레스 바.

```tsx
import { Progress, ProgressSuccess, ProgressWarning, ProgressError, ProgressInfo, ProgressGroup } from '@hua-labs/ui';

<Progress value={60} max={100} />
<ProgressSuccess value={100} />
<ProgressWarning value={50} />

// 여러 프로그레스 바 그룹화
<ProgressGroup>
  <ProgressSuccess value={30} />
  <ProgressWarning value={40} />
  <ProgressError value={20} />
</ProgressGroup>
```

**Props:**
- `value` - 현재 값
- `max` - 최대 값 (기본값: 100)
- `variant` - "default" | "success" | "warning" | "error" | "info"
- `showLabel` - 백분율 라벨 표시

### Skeleton

로딩 스켈레톤 컴포넌트.

```tsx
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonCard, SkeletonAvatar, SkeletonUserProfile, SkeletonList, SkeletonTable } from '@hua-labs/ui';

<SkeletonText lines={3} />
<SkeletonCircle size={64} />
<SkeletonCard />
<SkeletonAvatar />
<SkeletonUserProfile />
<SkeletonList items={5} />
<SkeletonTable rows={5} columns={4} />
```

**변형:**
- `Skeleton` - 기본 스켈레톤
- `SkeletonText` - 텍스트 라인 스켈레톤
- `SkeletonCircle` - 원형 스켈레톤
- `SkeletonRectangle` - 직사각형 스켈레톤
- `SkeletonRounded` - 둥근 직사각형 스켈레톤
- `SkeletonCard` - 카드 스켈레톤
- `SkeletonAvatar` - 아바타 스켈레톤
- `SkeletonImage` - 이미지 스켈레톤
- `SkeletonUserProfile` - 사용자 프로필 스켈레톤
- `SkeletonList` - 리스트 스켈레톤
- `SkeletonTable` - 테이블 스켈레톤

### ThemeProvider

다크/라이트 모드를 위한 테마 컨텍스트 프로바이더.

```tsx
import { ThemeProvider, ThemeToggle, useTheme } from '@hua-labs/ui';

<ThemeProvider defaultTheme="system" storageKey="ui-theme">
  <App />
</ThemeProvider>

// 테마 토글 버튼
<ThemeToggle />

// 커스텀 테마 컨트롤
function CustomThemeControl() {
  const { theme, setTheme } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">라이트</option>
      <option value="dark">다크</option>
      <option value="system">시스템</option>
    </select>
  );
}
```

**Props:**
- `defaultTheme` - "light" | "dark" | "system" (기본값: "system")
- `storageKey` - localStorage 키 (기본값: "ui-theme")
- `children` - 앱 콘텐츠

---

## 스타일 시스템

### 유틸리티 함수

```tsx
import { merge, mergeIf, mergeMap, cn } from '@hua-labs/ui';

// 스마트 클래스 병합 (clsx + tailwind-merge)
merge("px-2 py-1", "px-4") // → "py-1 px-4"

// 조건부 병합
mergeIf(isActive, "bg-blue-500", "bg-gray-200")

// 객체 기반 병합
mergeMap({
  "bg-blue-500": isPrimary,
  "bg-gray-500": !isPrimary,
  "text-white": true,
  "opacity-50": isDisabled
})

// merge 별칭 (하위 호환성)
cn("text-lg", "font-bold")
```

### 스타일 생성기

```tsx
import {
  createColorStyles,
  createVariantStyles,
  createSizeStyles,
  createRoundedStyles,
  createShadowStyles,
  createHoverStyles
} from '@hua-labs/ui';

// 색상 스타일
const colorStyles = createColorStyles({
  primary: "bg-blue-500 text-white",
  secondary: "bg-gray-200 text-gray-800"
});

// CVA를 사용한 변형 스타일
const buttonVariants = createVariantStyles({
  base: "inline-flex items-center justify-center",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      destructive: "bg-destructive text-destructive-foreground"
    },
    size: {
      sm: "text-sm px-3 py-1.5",
      md: "text-base px-4 py-2"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
});
```

### CSS 변수

HUA UI는 테마를 위해 CSS 변수를 사용합니다:

```css
/* 라이트 모드 */
:root {
  --background: 210 20% 98%;
  --foreground: 210 10% 10%;
  --primary: 166 78% 30%;
  --primary-foreground: 0 0% 100%;
  --secondary: 210 15% 94%;
  --secondary-foreground: 210 10% 20%;
  --muted: 210 15% 94%;
  --muted-foreground: 210 10% 40%;
  --accent: 226 100% 97%;
  --accent-foreground: 234 89% 74%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 210 15% 88%;
  --input: 210 15% 88%;
  --ring: 166 78% 30%;
  --card: 0 0% 100%;
  --card-foreground: 210 10% 10%;
}

/* 다크 모드 */
[data-theme="dark"] {
  --background: 210 10% 8%;
  --foreground: 210 10% 98%;
  /* ... 기타 다크 모드 색상 */
}
```

### Tailwind 유틸리티

```tsx
// 배경 색상
className="bg-background text-foreground"
className="bg-primary text-primary-foreground"
className="bg-card text-card-foreground"

// 테두리
className="border border-border"
className="ring-2 ring-ring"

// 다크 모드
className="bg-white dark:bg-slate-900"
className="text-gray-900 dark:text-gray-100"
```

### 마이크로 모션

내장 마이크로 인터랙션:

```tsx
import { useMicroMotion, getMicroMotionClasses } from '@hua-labs/ui';

// 훅 기반
function Component() {
  const motion = useMicroMotion('button-press');
  return <button {...motion.props}>클릭하세요</button>;
}

// 클래스 기반
const classes = getMicroMotionClasses('hover-lift');
<div className={classes}>호버하세요</div>

// 사용 가능한 프리셋:
// 'button-press', 'hover-lift', 'card-hover', 'fade-in', 'slide-up'
```

---

## 아이콘 시스템

### 아이콘 프로바이더

HUA UI는 세 가지 아이콘 프로바이더를 지원합니다:

**1. Phosphor Icons (기본)**
```tsx
import { Icon, IconProvider } from '@hua-labs/ui';

<IconProvider set="phosphor" weight="regular">
  <Icon name="heart" />
</IconProvider>
```

굵기: `thin`, `light`, `regular`, `bold`, `fill`, `duotone`

**2. Lucide Icons**
```tsx
<IconProvider set="lucide">
  <Icon name="heart" />
</IconProvider>
```

미니멀리스트 디자인, 일관된 선 굵기.

**3. Iconsax Icons**
```tsx
// 먼저 iconsax entry를 import해야 함
import '@hua-labs/ui/iconsax';

<IconProvider set="iconsax" iconsaxVariant="bold">
  <Icon name="heart" />
</IconProvider>
```

변형: `line`, `bold`, `bulk`, `broken`

### 아이콘 설정

```tsx
import { IconProvider, defaultIconConfig } from '@hua-labs/ui';

<IconProvider
  set="phosphor"           // 아이콘 프로바이더
  size={24}                // 기본 크기
  color="currentColor"     // 기본 색상
  weight="regular"         // Phosphor 굵기
  strokeWidth={1.5}        // Lucide 선 굵기
  iconsaxVariant="line"    // Iconsax 변형
>
  <App />
</IconProvider>
```

### 감정 & 상태 아이콘

사전 설정된 의미론적 아이콘:

```tsx
import { EmotionIcon, StatusIcon } from '@hua-labs/ui';

// 감정 아이콘
<EmotionIcon emotion="happy" />
<EmotionIcon emotion="sad" />
<EmotionIcon emotion="angry" />

// 상태 아이콘
<StatusIcon status="success" />
<StatusIcon status="error" />
<StatusIcon status="warning" />
<StatusIcon status="info" />
```

### 커스텀 아이콘 컴포넌트

```tsx
import { HeartIcon, UserIcon, SettingsIcon } from '@hua-labs/ui/icons';
import { HeartBold, UserBold, SettingsBold } from '@hua-labs/ui/icons-bold';

<HeartIcon size={24} />
<UserBold size={32} />
```

### 아이콘 별칭

일반적인 아이콘 이름이 프로바이더 간에 별칭으로 지정됩니다:

```tsx
// 모두 올바른 프로바이더별 이름으로 해석됨
<Icon name="trash" />      // Trash, Trash2, trash
<Icon name="settings" />   // Gear, Settings, setting
<Icon name="user" />       // User, User, profile
<Icon name="search" />     // MagnifyingGlass, Search, search-normal
<Icon name="close" />      // X, X, close-circle
```

---

## 테마 시스템

### ThemeProvider 설정

```tsx
import { ThemeProvider } from '@hua-labs/ui';

<ThemeProvider defaultTheme="system" storageKey="app-theme">
  <App />
</ThemeProvider>
```

### useTheme 훅

```tsx
import { useTheme } from '@hua-labs/ui';

function CustomThemeControl() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <p>현재 테마: {theme}</p>
      <p>시스템 테마: {systemTheme}</p>
      <p>해석된 테마: {resolvedTheme}</p>

      <button onClick={() => setTheme('light')}>라이트</button>
      <button onClick={() => setTheme('dark')}>다크</button>
      <button onClick={() => setTheme('system')}>시스템</button>
    </div>
  );
}
```

### 테마 토글

```tsx
import { ThemeToggle } from '@hua-labs/ui';

// 프리셋 토글 버튼
<ThemeToggle />

// 커스텀 구현
function CustomToggle() {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <button onClick={() => setTheme(nextTheme)}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### 다크 모드 클래스

```tsx
// 조건부 다크 모드 스타일
className="bg-white dark:bg-slate-900"
className="text-gray-900 dark:text-gray-100"
className="border-gray-200 dark:border-gray-700"

// CSS 변수 사용 (테마 인식)
className="bg-background text-foreground"
className="border-border"
```

---

## 훅

### useInView

요소가 뷰포트에 진입할 때 감지.

```tsx
import { useInView } from '@hua-labs/ui';

function Component() {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  return (
    <div ref={ref}>
      {inView ? '보임' : '숨김'}
    </div>
  );
}
```

### useScrollProgress

스크롤 진행률을 백분율로 추적.

```tsx
import { useScrollProgress } from '@hua-labs/ui';

function ScrollIndicator() {
  const { progress } = useScrollProgress();

  return (
    <div
      style={{
        width: `${progress}%`,
        height: 4,
        background: 'blue'
      }}
    />
  );
}
```

### useMouse

마우스 위치 추적.

```tsx
import { useMouse } from '@hua-labs/ui';

function Component() {
  const { x, y, elementX, elementY, elementW, elementH } = useMouse();

  return (
    <div>
      마우스: {x}, {y}
    </div>
  );
}
```

### useReducedMotion

모션 감소 선호도 감지.

```tsx
import { useReducedMotion } from '@hua-labs/ui';

function Component() {
  const reducedMotion = useReducedMotion();

  return (
    <div className={reducedMotion ? '' : 'animate-bounce'}>
      콘텐츠
    </div>
  );
}
```

### useWindowSize

윈도우 크기 추적.

```tsx
import { useWindowSize } from '@hua-labs/ui';

function Component() {
  const { width, height, isMobile, isTablet, isDesktop } = useWindowSize();

  return (
    <div>
      윈도우: {width}x{height}
      {isMobile && <p>모바일 뷰</p>}
    </div>
  );
}
```

---

## 고급 사용법

### 복합 컴포넌트

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@hua-labs/ui';

<Card>
  <CardHeader>
    <CardTitle>프로필</CardTitle>
  </CardHeader>
  <CardContent>
    <p>사용자 정보</p>
  </CardContent>
  <CardFooter>
    <Button>수정</Button>
  </CardFooter>
</Card>
```

### Slot 패턴 (다형적 컴포넌트)

```tsx
import { Button } from '@hua-labs/ui';
import NextLink from 'next/link';

// Next.js Link로 렌더링
<Button asChild>
  <NextLink href="/about">소개</NextLink>
</Button>

// 커스텀 요소로 렌더링
<Button asChild>
  <a href="/external" target="_blank">외부 링크</a>
</Button>
```

### 커스텀 스타일링

```tsx
import { Button, merge } from '@hua-labs/ui';

// 컴포넌트 스타일 확장
<Button className={merge("custom-class", "hover:custom-hover")}>
  커스텀 버튼
</Button>

// 변형 스타일 오버라이드
<Button
  className="bg-gradient-to-r from-purple-500 to-pink-500"
  variant="ghost"
>
  커스텀 그라디언트
</Button>
```

### 서버 컴포넌트 (Next.js App Router)

```tsx
// 서버 컴포넌트 ('use client' 없음)
import { Card, CardHeader, CardTitle, CardContent } from '@hua-labs/ui';

export default function ServerComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>서버 렌더링 카드</CardTitle>
      </CardHeader>
      <CardContent>
        서버에서 렌더링됩니다
      </CardContent>
    </Card>
  );
}

// 클라이언트 컴포넌트 (인터랙티브)
'use client';

import { Button } from '@hua-labs/ui';

export default function ClientComponent() {
  return (
    <Button onClick={() => console.log('클릭됨')}>
      클릭하세요
    </Button>
  );
}
```

### 폼 유효성 검증

```tsx
import { Form, FormControl, Input, Button } from '@hua-labs/ui/form';

function LoginForm() {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // 유효성 검증 로직
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormControl>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          error={errors.email}
        />
      </FormControl>

      <FormControl>
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          error={errors.password}
        />
      </FormControl>

      <Button type="submit">로그인</Button>
    </Form>
  );
}
```

---

## 문제 해결

### "bg-primary가 작동하지 않음"

**문제:** `bg-primary` 같은 Tailwind 유틸리티 클래스가 작동하지 않습니다.

**해결:** 추천 테마 CSS를 import하세요:

```css
/* globals.css */
@import "tailwindcss";
@import "@hua-labs/ui/styles/recommended-theme.css";
```

테마 없이는 표준 Tailwind 색상을 사용하세요:
```tsx
<Button className="bg-blue-500">버튼</Button>
```

---

### 다크 모드가 작동하지 않음

**문제:** 다크 모드 스타일이 적용되지 않습니다.

**해결:** 앱을 `ThemeProvider`로 래핑하세요:

```tsx
import { ThemeProvider } from '@hua-labs/ui';

<ThemeProvider>
  <App />
</ThemeProvider>
```

다크 모드 클래스가 사용되는지 확인하세요:
```tsx
className="bg-white dark:bg-slate-900"
```

---

### SSR 하이드레이션 불일치

**문제:** 서버/클라이언트 불일치 경고.

**해결:** 인터랙티브 컴포넌트에 `'use client'` 지시어를 추가하세요:

```tsx
'use client';

import { Button } from '@hua-labs/ui';

export default function Component() {
  return <Button onClick={() => {}}>클릭</Button>;
}
```

비인터랙티브 컴포넌트(Card, Badge 등)는 서버 컴포넌트로 유지할 수 있습니다.

---

### 아이콘을 찾을 수 없음

**문제:** Icon 컴포넌트가 "?" 플레이스홀더를 표시합니다.

**해결:**

1. 아이콘 프로바이더 설정 확인:
```tsx
import { IconProvider } from '@hua-labs/ui';

<IconProvider set="phosphor">
  <App />
</IconProvider>
```

2. Iconsax의 경우 진입점을 import:
```tsx
import '@hua-labs/ui/iconsax';
import { IconProvider } from '@hua-labs/ui';

<IconProvider set="iconsax">
  <App />
</IconProvider>
```

3. 아이콘 이름이 유효한지 확인. 사용 가능한 아이콘 확인:
```tsx
import { iconNames } from '@hua-labs/ui';
console.log(iconNames);
```

---

### ref 관련 타입 에러

**문제:** ref prop에서 TypeScript 에러.

**해결:** 컴포넌트가 ref를 올바르게 전달합니다. ref 타입이 요소와 일치하는지 확인하세요:

```tsx
const buttonRef = useRef<HTMLButtonElement>(null);
<Button ref={buttonRef}>버튼</Button>

const divRef = useRef<HTMLDivElement>(null);
<Card ref={divRef}>카드</Card>
```

---

### 토스트가 표시되지 않음

**문제:** 토스트 알림이 나타나지 않습니다.

**해결:**

1. 토스트 CSS를 import:
```css
@import "@hua-labs/ui/styles/toast.css";
```

2. 앱을 ToastProvider로 래핑:
```tsx
import { ToastProvider } from '@hua-labs/ui';

<ToastProvider>
  <App />
</ToastProvider>
```

3. 훅 사용:
```tsx
import { useToast } from '@hua-labs/ui';

function Component() {
  const { toast } = useToast();
  toast({ title: "성공" });
}
```

---

### 번들 크기 문제

**문제:** 번들 크기가 큽니다.

**해결:** 서브경로 import를 사용하여 필요한 컴포넌트만 import:

```tsx
// 나쁨: 전체 패키지를 import
import { Form, Select, DatePicker } from '@hua-labs/ui';

// 좋음: 트리쉐이킹 가능
import { Button, Card } from '@hua-labs/ui';
import { Form, Select } from '@hua-labs/ui/form';
```

번들 분석:
```bash
pnpm run build:analyze
```

---

### Tailwind 클래스가 작동하지 않음

**문제:** 커스텀 Tailwind 클래스가 적용되지 않습니다.

**해결:** Tailwind 설정에 HUA UI 경로가 포함되어 있는지 확인:

```js
// tailwind.config.js
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './node_modules/@hua-labs/ui/dist/**/*.{js,mjs}',
  ],
  // ...
};
```

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/CONTRIBUTING.md).

기여를 환영합니다! [기여 가이드](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/CONTRIBUTING.md)를 읽어주세요.

## License

MIT © HUA Labs
