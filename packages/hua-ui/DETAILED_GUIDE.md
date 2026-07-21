# @hua-labs/ui Detailed Guide

Usage and public-surface reference for the modern React UI component library.

## Public Package Boundary

This guide documents the current public `@hua-labs/ui` package. Its reviewed
profile tracks 37 candidate entries: 27 are shipped and 10 are explicitly
deferred. Only the following shipped roster is copyable public-package guidance:

```text
@hua-labs/ui
@hua-labs/ui/advanced
@hua-labs/ui/advanced/dashboard
@hua-labs/ui/advanced/emotion
@hua-labs/ui/advanced/motion
@hua-labs/ui/data
@hua-labs/ui/feedback
@hua-labs/ui/form
@hua-labs/ui/icons
@hua-labs/ui/icons-bold
@hua-labs/ui/iconsax
@hua-labs/ui/iconsax-extended
@hua-labs/ui/interactive
@hua-labs/ui/interactive/kanban
@hua-labs/ui/landing
@hua-labs/ui/native
@hua-labs/ui/navigation
@hua-labs/ui/overlay
@hua-labs/ui/sdui
@hua-labs/ui/styles/base.css
@hua-labs/ui/styles/codeblock.css
@hua-labs/ui/styles/landing.css
@hua-labs/ui/styles/prose.css
@hua-labs/ui/styles/recommended-theme.css
@hua-labs/ui/styles/toast.css
@hua-labs/ui/styles/utilities.css
@hua-labs/ui/theme
```

The following 10 entries remain platform-workspace-only and are not shipped by
the current public package. Do not copy them into public-package consumer code:

- `@hua-labs/ui/ax` — not shipped; platform-workspace-only.
- `@hua-labs/ui/layout` — not shipped; platform-workspace-only.
- `@hua-labs/ui/lucide` — not shipped; the Lucide registrar remains platform-workspace-only.
- `@hua-labs/ui/motion` — not shipped; platform-workspace-only.
- `@hua-labs/ui/primitives` — not shipped; platform-workspace-only.
- `@hua-labs/ui/sdui/manifest` — not shipped; platform-workspace-only.
- `@hua-labs/ui/sdui/motion-core-validation` — not shipped; platform-workspace-only.
- `@hua-labs/ui/sdui/validation` — not shipped; platform-workspace-only.
- `@hua-labs/ui/theme/foundation` — not shipped; platform-workspace-only.
- `@hua-labs/ui/utils` — not shipped; platform-workspace-only.

The current public package does not ship the `@hua-labs/ui/lucide` registrar,
so selecting the Lucide provider is not current public-package guidance. The
exact shipped/unshipped roster comes from `public-core-profile.json`; that
profile is platform source authority and is not included in the package
tarball.

---

## Table of Contents

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

1. **Layered public surface** - The compatibility root and focused subpath exports provide explicit import boundaries
2. **Runtime-first styling** - The dot style engine works without Tailwind; Tailwind-specific theme CSS is an optional integration
3. **Evidence-backed accessibility** - ARIA, keyboard, and naming contracts are documented per component without package-wide certification
4. **Developer Experience** - TypeScript-first with full type safety and IntelliSense support

### Package Structure

```
@hua-labs/ui
├── Root compatibility  → Button, Input, Card, Badge, Alert, Avatar...
├── /form               → Form, Select, DatePicker, Autocomplete, Upload...
├── /overlay            → Modal, Popover, Dropdown, Drawer, BottomSheet...
├── /data               → Table, CodeBlock...
├── /interactive        → Accordion, Tabs, Menu, Command...
├── /interactive/kanban → Optional-peer Kanban drag-and-drop components
├── /navigation         → Navigation, Breadcrumb, Pagination...
├── /feedback           → Toast, LoadingSpinner...
├── /advanced/*         → Advanced, motion, emotion, dashboard compatibility
├── /sdui               → Server-Driven UI components
├── /landing            → Landing-page components
├── /native             → React Native Box, Text, Pressable primitives
├── /theme              → Theme contract
├── /icons, /icons-bold → Raw Iconsax line and bold component barrels
├── /iconsax            → Essential project Iconsax registration
├── /iconsax-extended   → Extended Iconsax registration and gallery
└── /styles/*           → CSS files
```

### Component Categories

| Category    | Entry Point                | Purpose                                 |
| ----------- | -------------------------- | --------------------------------------- |
| Atomic UI   | `@hua-labs/ui`             | Buttons, inputs, cards, badges, avatars |
| Layout      | `@hua-labs/ui`             | Container, Grid, Stack, Card, Panel     |
| Form        | `@hua-labs/ui/form`        | Complete form components                |
| Overlay     | `@hua-labs/ui/overlay`     | Modals, popovers, dropdowns, drawers    |
| Data        | `@hua-labs/ui/data`        | Tables, code blocks                     |
| Interactive | `@hua-labs/ui/interactive` | Accordions, tabs, menus                 |
| Navigation  | `@hua-labs/ui/navigation`  | Navigation, breadcrumbs, pagination     |
| Feedback    | `@hua-labs/ui/feedback`    | Toast notifications, spinners           |
| Advanced    | `@hua-labs/ui/advanced`    | Complex domain components               |

### Runtime and Styling Support

| Surface           | Public import                                                                | Runtime                                                | Styling and CSS contract                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Web components    | `@hua-labs/ui` and focused Web subpaths                                      | React DOM; component-specific SSR or client boundaries | `dot` resolves component styles at runtime. Define semantic `--color-*` variables; import feature CSS only when its documentation requires it. |
| Native primitives | `@hua-labs/ui/native`, or the root export under the `react-native` condition | React Native                                           | Only `Box`, `Text`, `Pressable`, and native dot helpers are exported. dot resolves React Native style objects; Web CSS is not used.            |
| SDUI renderer     | `@hua-labs/ui/sdui`                                                          | Web React renderer                                     | Uses the Web component and dot contracts. Optional motion behavior requires `@hua-labs/motion-core`.                                           |
| Theme state       | `@hua-labs/ui/theme`                                                         | Web client context                                     | Toggles the root `light`/`dark` class and persists state. The consumer owns semantic CSS variable values.                                      |
| Stylesheets       | `@hua-labs/ui/styles/*`                                                      | Browser CSS pipeline                                   | Feature assets are opt-in. `base.css` and `recommended-theme.css` contain Tailwind v4 directives and are only for Tailwind consumers.          |

The Web component roster is not a claim that every component works in React
Native. Use the explicit native entry for its bounded primitive surface.

---

## Installation & Setup

### Basic Installation

```bash
pnpm add @hua-labs/ui
# or
npm install @hua-labs/ui
```

The component package uses `@hua-labs/dot` internally. Add it as a direct
dependency only when application code imports `dot`, `dotMap`, or
`dotVariants` itself:

```bash
pnpm add @hua-labs/dot
```

### Peer Dependencies

Required:

```json
{
  "react": ">=19.0.0"
}
```

Optional peers are required only by the entries or features that use them:

```json
{
  "react-dom": ">=19.0.0",
  "react-native": ">=0.73.0",
  "@hua-labs/motion-core": ">=2.4.0",
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

- Install `react-dom` for the Web root entry and portal-backed components such
  as `Modal`.
- Install `react-native` when using the React Native condition or the
  `@hua-labs/ui/native` entry.
- `@hua-labs/motion-core` enables the optional landing-page motion hooks; the
  landing components retain a non-motion fallback when it is absent.
- The three `@dnd-kit/*` packages are required by
  `@hua-labs/ui/interactive/kanban`.

### dot-first Styling Setup

HUA UI resolves its component styles with `dot` at runtime. It does not need
Tailwind, a utility-class scanner, or a CSS build step. Palette tokens such as
`bg-primary-500` resolve directly to inline values. Semantic tokens such as
`bg-primary` resolve to CSS variables, so define the `--color-*` variables used
by your theme. A complete plain-CSS example appears in [CSS Variables](#css-variables).

The `styles/recommended-theme.css` and `styles/base.css` exports are optional
Tailwind v4 integration files. They contain Tailwind directives and should be
imported only by consumers that already run a Tailwind v4 pipeline.

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
import {
  Form,
  FormControl,
  Select,
  DatePicker,
  Upload,
  Autocomplete,
} from "@hua-labs/ui/form";
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
import {
  Modal,
  Drawer,
  Popover,
  Dropdown,
  BottomSheet,
} from "@hua-labs/ui/overlay";
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
import { Table, CodeBlock } from "@hua-labs/ui/data";
```

Components:

- `Table` - Data table
- `CodeBlock` - Syntax-highlighted code block

### Interactive Export (`@hua-labs/ui/interactive`)

```tsx
import { Accordion, Tabs, Menu, Command } from "@hua-labs/ui/interactive";
```

Components:

- `Accordion` - Collapsible accordion
- `Tabs` - Tab navigation
- `Menu` - Menu component
- `ContextMenu` - Context menu
- `Command` - Command palette

### Navigation Export (`@hua-labs/ui/navigation`)

```tsx
import { Navigation, Breadcrumb, Pagination } from "@hua-labs/ui/navigation";
```

Components:

- `Navigation` - Navigation component
- `Breadcrumb` - Breadcrumb trail
- `Pagination` - Page pagination
- `PageNavigation` - Page-level navigation
- `PageTransition` - Page transition animations

### Advanced Export (`@hua-labs/ui/advanced`)

```tsx
import { StatsPanel, BarChart, DataTable } from "@hua-labs/ui/data";
import { EmptyState } from "@hua-labs/ui/feedback";
import { Sidebar } from "@hua-labs/ui/navigation";
import { Toolbar } from "@hua-labs/ui/interactive";
import { KanbanBoard } from "@hua-labs/ui/interactive/kanban";
import { GlowCard } from "@hua-labs/ui/advanced/motion";
import { EmotionSelector } from "@hua-labs/ui/advanced/emotion";
```

Domain-specific advanced components.

---

## Core Components

### Button

Multi-variant button with loading states, icons, and advanced styling.

```tsx
import { Button, Icon } from "@hua-labs/ui";

<Button variant="default" size="md">
  Click Me
</Button>;
<Button variant="destructive" loading>
  Deleting...
</Button>;
<Button variant="gradient" gradient="purple">
  Gradient
</Button>;
<Button href="/about" variant="link">
  Learn More
</Button>;
<Button icon={<Icon name="plus" />} iconPosition="left">
  Add
</Button>;
<Button hover="springy" shadow="lg" rounded="full">
  Springy
</Button>;
```

**Props:**

- `variant` - "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "neon" | "glass"
- `size` - "sm" | "md" | "lg" | "xl" | "icon"
- `loading` - Show loading spinner
- `icon` - Icon element
- `iconPosition` - "left" | "right"
- `gradient` - "blue" | "purple" | "green" | "orange" | "pink" | "custom"
- `customGradient` - Custom CSS `background-image` value, such as `linear-gradient(...)`
- `rounded` - "sm" | "md" | "lg" | "full"
- `shadow` - "none" | "sm" | "md" | "lg" | "xl"
- `hover` - "springy" | "scale" | "glow" | "slide" | "none"
- `fullWidth` - Expand to full width
- `asChild` - Render as child element (Slot pattern)

### Card

Compound component for content cards.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
} from "@hua-labs/ui";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>Main content area</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

**Features:**

- Compound component pattern for flexible composition
- Supports standard div attributes through its typed public contract
- Theme-aware through semantic CSS variables
- Customizable through `dot`, `classDot`, and `style`

### Icon

The public Icon component ships Phosphor and Iconsax registration routes. Its
provider type still names Lucide, but the current public package does not ship
the Lucide registrar, so Lucide is not a usable public-package provider today.

```tsx
import { Icon, IconProvider } from "@hua-labs/ui";

// Global configuration
<IconProvider set="phosphor" size={24} weight="regular">
  <App />
</IconProvider>;

// Usage
<Icon name="heart" />;
<Icon name="user" size={32} variant="primary" />;
<Icon name="loader" spin />;
<Icon name="check" variant="success" />;
<Icon name="star" pulse animated />;
```

**Props:**

- `name` - Icon name (auto-normalized across providers)
- `size` - Icon size (number or string)
- `variant` - "default" | "primary" | "secondary" | "success" | "warning" | "error" | "muted" | "inherit"
- `provider` - Override icon provider ("phosphor" | "lucide" | "iconsax"); `lucide` requires the workspace-only registrar and is unavailable in the current public package
- `weight` - Phosphor weight ("thin" | "light" | "regular" | "bold" | "fill" | "duotone")
- `animated` - Smooth animation effect
- `pulse` - Pulse animation
- `spin` - Rotation animation
- `bounce` - Bounce animation

**Icon catalog:**

Exact provider bindings are published in the
[HUA Docs Icon guide](https://docs.hua-labs.com/docs/components/icon). Counts
and provider support are generated from source instead of duplicated here.

**Icon Aliases:**

```tsx
import { Icon } from "@hua-labs/ui";

// Normalized across providers
<Icon name="trash" />; // → phosphor: Trash, lucide: Trash2, iconsax: trash
<Icon name="settings" />; // → phosphor: Gear, lucide: Settings, iconsax: setting
<Icon name="user" />; // → phosphor: User, lucide: User, iconsax: profile
```

### Modal

Modal dialog with overlay and keyboard handling.

```tsx
import { useState } from "react";
import { Button, Modal } from "@hua-labs/ui";

const [open, setOpen] = useState(false);

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Modal Title"
  description="Modal description"
>
  <p>Modal content</p>
  <Button onClick={() => setOpen(false)}>Close</Button>
</Modal>;
```

**Props:**

- `isOpen` - Controlled open state
- `onClose` - Close handler
- `title` - Modal title
- `description` - Modal description (optional)
- `children` - Modal content
- `size` - "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
- `closeOnOverlayClick` - Close on overlay click (default: true)
- `closable` - Show the close button (default: true)
- `showBackdrop` - Show the backdrop (default: true)

**Accessibility:**

- Closes on Escape key
- Applies `role="dialog"`, `aria-modal`, and title/description linkage
- Locks body scrolling while open
- Does not trap or restore focus; provide a `title` so the dialog has an accessible name

### Input

Text input with validation states and custom styling.

```tsx
import { Input, Label } from "@hua-labs/ui";

<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    aria-invalid="true"
    aria-describedby="email-error"
    error
  />
  <p id="email-error">Invalid email</p>
</div>;
```

**Props:**

- All standard input attributes
- `error` - Error state (shows a red border)
- `success` - Success state (shows green border)
- `leftIcon` - Left icon element

### Alert

Alert component with semantic variants.

```tsx
import {
  Alert,
  AlertSuccess,
  AlertWarning,
  AlertError,
  AlertInfo,
} from "@hua-labs/ui";

<AlertSuccess>Operation successful</AlertSuccess>;
<AlertWarning>Warning message</AlertWarning>;
<AlertError>Error occurred</AlertError>;
<AlertInfo>Information message</AlertInfo>;

// Generic
<Alert variant="success">Custom alert</Alert>;
```

**Props:**

- `variant` - "success" | "warning" | "error" | "info"
- `title` - Alert title (optional)
- `children` - Alert content
- `icon` - Custom icon (optional)

### Toast

Toast notification system with context provider.

```tsx
import { Button, ToastProvider, useToast } from "@hua-labs/ui";
import "@hua-labs/ui/styles/toast.css";

// Wrap your app
<ToastProvider>
  <App />
</ToastProvider>;

// In component
function Component() {
  const { addToast } = useToast();

  const showToast = () => {
    addToast({
      type: "success",
      title: "Success",
      message: "Operation completed",
      duration: 3000,
    });
  };

  return <Button onClick={showToast}>Show Toast</Button>;
}
```

**Toast Options:**

- `type` - "success" | "warning" | "error" | "info"
- `title` - Optional toast title
- `message` - Toast message
- `duration` - Duration in ms (default: 5000; use 0 to disable automatic dismissal)
- `action` - Action button config

**Safe Hook:**

```tsx
// Use in components that might not have ToastProvider
const { addToast } = useToastSafe();
addToast({ type: "info", message: "Saved locally" });
```

### Badge

Status indicator badge.

```tsx
import { Badge } from "@hua-labs/ui";

<Badge>Default</Badge>;
<Badge variant="secondary">Active</Badge>;
<Badge variant="destructive">Blocked</Badge>;
<Badge variant="error">Failed</Badge>;
<Badge variant="outline">Outline</Badge>;
<Badge variant="glass">Glass</Badge>;
```

**Props:**

- `variant` - "default" | "secondary" | "destructive" | "error" | "outline" | "glass"
- `rounded` - "none" | "sm" | "md" | "lg" | "xl" | "full"
- `children` - Badge content

### Progress

Progress bar with compound variants.

```tsx
import {
  Progress,
  ProgressSuccess,
  ProgressWarning,
  ProgressError,
  ProgressInfo,
  ProgressGroup,
} from "@hua-labs/ui";

<Progress value={60} max={100} />;
<ProgressSuccess value={100} />;
<ProgressWarning value={50} />;

// Group multiple progress bars
<ProgressGroup>
  <ProgressSuccess value={30} />
  <ProgressWarning value={40} />
  <ProgressError value={20} />
</ProgressGroup>;
```

**Props:**

- `value` - Current value
- `max` - Maximum value (default: 100)
- `size` - "sm" | "md" | "lg"
- `variant` - "default" | "success" | "warning" | "error" | "info" | "glass"
- `showValue` - Show the current value

### Skeleton

Loading skeleton components.

```tsx
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonUserProfile,
  SkeletonList,
  SkeletonTable,
} from "@hua-labs/ui";

<SkeletonText lines={3} />;
<SkeletonCircle size={64} />;
<SkeletonCard />;
<SkeletonAvatar />;
<SkeletonUserProfile />;
<SkeletonList items={5} />;
<SkeletonTable rows={5} columns={4} />;
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
import { ThemeProvider, ThemeToggle, useTheme } from "@hua-labs/ui";

<ThemeProvider
  defaultTheme="system"
  storageKey="ui-theme"
  enableTransition={false}
>
  <App />
</ThemeProvider>;

// Theme toggle button
<ThemeToggle />;

// Custom theme control
function CustomThemeControl() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      value={theme}
      onChange={(event) =>
        setTheme(event.target.value as "light" | "dark" | "system")
      }
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
```

**Props:**

- `defaultTheme` - "light" | "dark" | "system" (default: "light")
- `storageKey` - localStorage key (default: "hua-ui-theme")
- `enableSystem` - Listen for system theme changes (default: true)
- `enableTransition` - Add `transition-colors duration-300` class names to the root (default: true; matching CSS is consumer-owned)
- `children` - App content

---

## Style System

### dot() Function and dot Prop

```tsx
import { dot } from "@hua-labs/dot";
import { Button, Card } from "@hua-labs/ui";

// Convert tokens to CSSProperties
dot("p-4 rounded-lg bg-primary-500");
// → { padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#2b6cd6' }

// Component dot prop (use only on components whose public contract documents it)
<Button dot="px-4 py-2 text-lg">Submit</Button>;
<Card dot="p-6 rounded-xl shadow-lg">Content</Card>;
```

The public package boundary and runtime matrix above define where the Web and
React Native style contracts apply.

### dotVariants and dotMap

```tsx
import { dotVariants, dotMap } from "@hua-labs/dot";

// Variant-based styles (replaces CVA)
const buttonStyles = dotVariants({
  base: "inline-flex items-center justify-center rounded-md",
  variants: {
    variant: {
      primary: "bg-primary-500 text-white",
      outline: "border border-gray-300",
    },
    size: {
      sm: "text-sm px-3 py-1.5",
      md: "text-base px-4 py-2",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

// State-based styles (hover, focus, active)
const interactiveStyles = dotMap(
  "bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-primary-500 active:bg-gray-300",
);
// → { base, hover, focus, active }
```

### CSS Variables

HUA UI and bare semantic dot tokens use `--color-*` CSS variables. Define them
in plain CSS; no Tailwind processing is required:

```css
:root {
  --color-primary: #2b6cd6;
  --color-primary-foreground: #ffffff;
  --color-secondary: #dae2e5;
  --color-secondary-foreground: #0a161a;
  --color-destructive: #ca2c22;
  --color-destructive-foreground: #ffffff;
  --color-muted: #dae2e5;
  --color-muted-foreground: #62757b;
  --color-accent: #e7f0ff;
  --color-accent-foreground: #1e54a8;
  --color-card: #ffffff;
  --color-card-foreground: #0a161a;
  --color-popover: #ffffff;
  --color-popover-foreground: #0a161a;
  --color-background: #eaf1f3;
  --color-foreground: #0a161a;
  --color-border: #bac6ca;
  --color-input: #bac6ca;
  --color-ring: #2b6cd6;
  --color-success: #00874c;
  --color-success-foreground: #ffffff;
  --color-warning: #be7b00;
  --color-warning-foreground: #ffffff;
  --color-info: #0079b1;
  --color-info-foreground: #ffffff;
}

.dark {
  --color-primary: #4988f4;
  --color-primary-foreground: #ffffff;
  --color-secondary: #1e2b30;
  --color-secondary-foreground: #eaf1f3;
  --color-destructive: #ea4e3e;
  --color-destructive-foreground: #ffffff;
  --color-muted: #1e2b30;
  --color-muted-foreground: #7c9096;
  --color-accent: #010a1c;
  --color-accent-foreground: #d1e1ff;
  --color-card: #121418;
  --color-card-foreground: #eaf1f3;
  --color-popover: #121418;
  --color-popover-foreground: #eaf1f3;
  --color-background: #080a0e;
  --color-foreground: #eaf1f3;
  --color-border: #334247;
  --color-input: #334247;
  --color-ring: #4988f4;
  --color-success: #0fa65f;
  --color-success-foreground: #ffffff;
  --color-warning: #da9838;
  --color-warning-foreground: #0a161a;
  --color-info: #0095d9;
  --color-info-foreground: #ffffff;
}
```

`ThemeProvider` toggles `light` or `dark` on the document root and persists the
selection. It does not inject these variables. If `enableTransition` remains
enabled without Tailwind, define the matching transition classes yourself or
set `enableTransition={false}`.

### Styling with dot

```tsx
import { dot } from "@hua-labs/dot";
import { Box } from "@hua-labs/ui";

// Background and text colors
<Box dot="bg-background text-foreground" />;
<Box dot="bg-primary text-primary-foreground" />;

// Borders
<Box dot="border border-border" />;

// Box observes the root .dark class for dark: tokens
<Box dot="bg-white dark:bg-slate-900" />;
<Box dot="text-gray-900 dark:text-gray-100" />;

// Using style prop directly
<div style={dot("p-4 bg-card rounded-lg")}>Content</div>;
```

When calling `dot()` directly, pass `{ dark: true }` or the resolved application
theme to activate `dark:` tokens. Semantic CSS variables usually avoid that
branch because the `.dark` variable values change automatically.

### Micro Motion

Built-in micro-interactions:

```tsx
import { useMicroMotion } from "@hua-labs/ui";

// Hook-based
function Component() {
  const { handlers, style } = useMicroMotion({
    preset: "springy",
  });
  return (
    <button {...handlers} style={style}>
      Click me
    </button>
  );
}

// Available presets:
// 'subtle', 'soft', 'springy', 'bouncy', 'snappy'
```

The hook's inline `style` and event handlers are the dot-first path and require
no utility CSS. The hook also returns an optional `className`, and
`getMicroMotionClasses()` returns Tailwind utility tokens; those class-based
outputs inject no CSS and are only for Tailwind consumers.

---

## Icon System

The canonical catalog is generated from executable source. Its accepted exact
names, provider roles, activation routes, and evidence limits are published in
the [HUA Docs Icon guide](https://docs.hua-labs.com/docs/components/icon). This
broad guide does not duplicate that catalog.

---

## Theme System

### ThemeProvider Setup

```tsx
import { ThemeProvider } from "@hua-labs/ui";

<ThemeProvider
  defaultTheme="system"
  storageKey="app-theme"
  enableTransition={false}
>
  <App />
</ThemeProvider>;
```

The provider owns theme state and the root `light`/`dark` class. The plain CSS
variables in the Style System section own the visual theme. Set
`enableTransition={false}` when no stylesheet defines the provider's optional
transition utility class names.

### useTheme Hook

```tsx
import { useTheme } from "@hua-labs/ui";

function CustomThemeControl() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>

      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("system")}>System</button>
    </div>
  );
}
```

### Theme Toggle

```tsx
import { ThemeToggle, useTheme } from "@hua-labs/ui";

// Preset toggle button
<ThemeToggle />;

// Custom implementation
function CustomToggle() {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button onClick={() => setTheme(nextTheme)}>
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
```

### Theme-aware dot Styles

```tsx
import { Box } from "@hua-labs/ui";

// Preferred: semantic variables change under the root .dark class.
<Box dot="bg-background text-foreground border border-border">
  Theme-aware content
</Box>;

// Box also observes the root theme for explicit dark: branches.
<Box dot="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  Palette-based content
</Box>;
```

---

## Hooks

### useInView

Detect when element enters viewport.

```tsx
import { useInView } from "@hua-labs/ui";

function Component() {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return <div ref={ref}>{inView ? "Visible" : "Hidden"}</div>;
}
```

### useScrollProgress

Track scroll progress as a value from 0 to 1.

```tsx
import { useScrollProgress } from "@hua-labs/ui";

function ScrollIndicator() {
  const { progress } = useScrollProgress();

  return (
    <div
      style={{
        width: `${progress * 100}%`,
        height: 4,
        background: "blue",
      }}
    />
  );
}
```

### useMouse

Track mouse position.

```tsx
import { useMouse } from "@hua-labs/ui";

function Component() {
  const { ref, x, y, elementX, elementY, isInside } = useMouse({
    type: "element",
  });

  return (
    <div ref={ref}>
      Page: {x}, {y}; element: {elementX}, {elementY}; inside:{" "}
      {String(isInside)}
    </div>
  );
}
```

### useReducedMotion

Detect reduced motion preference.

```tsx
import { Box, useReducedMotion } from "@hua-labs/ui";

function Component() {
  const reducedMotion = useReducedMotion();

  return (
    <Box
      dot="p-4 rounded-lg bg-card"
      style={{ transition: reducedMotion ? "none" : "transform 200ms ease" }}
    >
      Content
    </Box>
  );
}
```

### useWindowSize

Track window dimensions.

```tsx
import { useWindowSize } from "@hua-labs/ui";

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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
} from "@hua-labs/ui";

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
</Card>;
```

### Slot Pattern (Polymorphic Components)

```tsx
import { Button } from "@hua-labs/ui";
import NextLink from "next/link";

// Render as Next.js Link
<Button asChild>
  <NextLink href="/about">About</NextLink>
</Button>;

// Render as custom element
<Button asChild>
  <a href="/external" target="_blank">
    External Link
  </a>
</Button>;
```

### Custom Styling

```tsx
import { Button } from "@hua-labs/ui";

// Extend supported components through the dot prop.
<Button dot="w-full mt-4">Custom Button</Button>;

// Supply a CSS background-image value for a custom gradient.
<Button
  variant="gradient"
  gradient="custom"
  customGradient="linear-gradient(to right, #8650c5, #c32f5c)"
>
  Custom Gradient
</Button>;
```

### Server Components (Next.js App Router)

```tsx
// Server Component (no 'use client')
import { Card, CardHeader, CardTitle, CardContent } from "@hua-labs/ui";

export default function ServerComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Server-rendered Card</CardTitle>
      </CardHeader>
      <CardContent>This renders on the server</CardContent>
    </Card>
  );
}

// Client Component (interactive)
("use client");

import { Button } from "@hua-labs/ui";

export default function ClientComponent() {
  return <Button onClick={() => console.log("clicked")}>Click me</Button>;
}
```

### Form Validation

```tsx
import { useState, type FormEvent } from "react";
import { Button, Label } from "@hua-labs/ui";
import { Form, FormControl, Input } from "@hua-labs/ui/form";

function LoginForm() {
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Validation logic
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormControl>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          error={Boolean(errors.email)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <p id="email-error">{errors.email}</p>}
      </FormControl>

      <FormControl>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          error={Boolean(errors.password)}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && <p id="password-error">{errors.password}</p>}
      </FormControl>

      <Button type="submit">Login</Button>
    </Form>
  );
}
```

---

## Troubleshooting

### `bg-primary` has no visible color

**Issue:** `dot("bg-primary")` resolves, but the browser has no visible color.

**Solution:** Bare semantic tokens resolve to CSS variables. Define the
variable in plain CSS and use the `dot` prop or `dot()` output:

```css
:root {
  --color-primary: #2b6cd6;
  --color-primary-foreground: #ffffff;
}
```

```tsx
import { Box } from "@hua-labs/ui";

<Box dot="bg-primary text-primary-foreground">Semantic color</Box>;
<Box dot="bg-primary-500 text-white">Built-in palette color</Box>;
```

The shaded palette token resolves to an inline color and does not require a CSS
variable. A `className="bg-primary"` string is not parsed by dot.

---

### Dark mode not working

**Issue:** Dark mode styles not applied.

**Solution:** Wrap the app with `ThemeProvider` and define matching `.dark`
semantic variables:

```tsx
import { ThemeProvider } from "@hua-labs/ui";

<ThemeProvider enableTransition={false}>
  <App />
</ThemeProvider>;
```

```css
.dark {
  --color-background: #080a0e;
  --color-foreground: #eaf1f3;
}
```

Use semantic tokens for variable-driven themes. `Box` observes the root class
when an explicit dot dark variant is needed:

```tsx
import { Box } from "@hua-labs/ui";

<Box dot="bg-background text-foreground" />;
<Box dot="bg-white dark:bg-gray-900" />;
```

---

### SSR hydration mismatch

**Issue:** Warning about server/client mismatch.

**Solution:** Add `'use client'` directive for interactive components:

```tsx
"use client";

import { Button } from "@hua-labs/ui";

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
import { IconProvider } from "@hua-labs/ui";

<IconProvider set="phosphor">
  <App />
</IconProvider>;
```

2. For Iconsax, import the entry point:

```tsx
import "@hua-labs/ui/iconsax";
import { IconProvider } from "@hua-labs/ui";

<IconProvider set="iconsax">
  <App />
</IconProvider>;
```

3. Verify icon name is valid. Check available icons:

```tsx
import { iconNames } from "@hua-labs/ui";
console.log(iconNames);
```

---

### Type errors with refs

**Issue:** TypeScript errors with ref prop.

**Solution:** Components forward refs correctly. Ensure ref type matches element:

```tsx
import { useRef } from "react";
import { Button, Card } from "@hua-labs/ui";

const buttonRef = useRef<HTMLButtonElement>(null);
<Button ref={buttonRef}>Button</Button>;

const divRef = useRef<HTMLDivElement>(null);
<Card ref={divRef}>Card</Card>;
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
import { ToastProvider } from "@hua-labs/ui";

<ToastProvider>
  <App />
</ToastProvider>;
```

3. Use the hook:

```tsx
import { useToast } from "@hua-labs/ui";

function Component() {
  const { addToast } = useToast();
  addToast({ type: "success", message: "Saved" });
}
```

---

### Bundle size issues

**Issue:** Large bundle size.

**Solution:** Use subpath imports to import only needed components:

```tsx
// Root components and form components use their declared public entries.
import { Button, Card } from "@hua-labs/ui";
import { Form, Select, DatePicker } from "@hua-labs/ui/form";
```

Analyze bundle:

```bash
pnpm run build:analyze
```

---

### Optional Tailwind classes not working

**Issue:** A consumer intentionally uses Tailwind through `className` or the
class-based micro-motion helper, but those classes are not emitted.

**Solution:** HUA UI does not compile Tailwind for the application. In a
Tailwind v4 application, register package output that contains utility strings
with `@source` in the stylesheet that imports Tailwind:

```css
/* globals.css; adjust the relative path from this stylesheet */
@import "tailwindcss";
@source "../node_modules/@hua-labs/ui/dist";
```

This is optional Tailwind interoperability, not part of the dot runtime setup.

---
