# hua Architecture

> Last updated: 2026-01-18

## Overview

A **layered architecture** designed to satisfy both traditional developers and vibe coders.

## Architecture Layers

```
+-----------------------------------------+
|  Top: AI Context & CLI                  |
|  (Vibe coding interface)                |
|  - .cursorrules, ai-context.md          |
|  - create-hua (-> create-hua)        |
+-----------------------------------------+
                    |
+-----------------------------------------+
|  Middle: Framework & Config             |
|  (AI / Vibe coder layer)               |
|  - @hua-labs/hua/framework           |
|  - @hua-labs/hua/presets             |
|  - @hua-labs/hua/pro                 |
+-----------------------------------------+
                    |
+-----------------------------------------+
|  Bottom: Core & Types                   |
|  (Traditional developer layer)          |
|  - @hua-labs/hua/ui                  |
|  - @hua-labs/hua/motion              |
|  - @hua-labs/hua/i18n                |
|  - @hua-labs/hua/state               |
+-----------------------------------------+
```

## Subpath Exports Structure

```
@hua-labs/hua
|-- .                     -> Full integration (UI+Motion+i18n+State+Pro)
|
|-- /framework            -> Framework layer
|   |-- HuaProvider       -> Provider auto-setup
|   |-- HuaPage         -> Page wrapper (motion + i18n)
|   |-- WelcomePage       -> Start page
|   |-- defineConfig       -> Declarative config
|   |-- useMotion          -> Unified motion hook
|   |-- BrandedButton/Card
|   |-- a11y/, loading/, branding/
|   |-- plugins/
|   +-- seo/geo/
|
|-- /presets              -> Presets (product, marketing)
|
|-- /ui                   -> UI components (from @hua-labs/ui)
|-- /i18n                 -> i18n (from @hua-labs/i18n-core + zustand)
|-- /motion               -> Motion (from @hua-labs/motion-core)
|-- /state                -> State (from @hua-labs/state)
|
+-- /pro                  -> Pro features (advanced motion hooks)
```

## Layer Details

### Bottom Layer: Core (Subpath Exports)

**Target**: Traditional developers, senior developers

**Features**:
- Precise TypeScript types
- Low-level API direct control
- Granular per-feature imports

**Usage**:
```typescript
// UI components
import { Button, Card, Modal } from '@hua-labs/hua/ui';

// i18n
import { useTranslation, useLanguageChange } from '@hua-labs/hua/i18n';
import { createZustandI18n } from '@hua-labs/hua/i18n';

// Motion
import { useFadeIn, useSlideUp, useScrollReveal } from '@hua-labs/hua/motion';

// State
import { createHuaStore, createI18nStore } from '@hua-labs/hua/state';
```

**Value**:
- Import exactly what you need
- Bundle size optimization (tree-shaking)
- Each feature can be used independently

### Middle Layer: Framework & Config

**Target**: Vibe coders, junior developers, AI

**Features**:
- Declarative config (`defineConfig`)
- Auto Provider setup (`HuaProvider`)
- Preset system

**Usage**:
```typescript
// Framework components
import { HuaProvider, HuaPage, WelcomePage } from '@hua-labs/hua/framework';
import { defineConfig } from '@hua-labs/hua/framework';
import { useMotion } from '@hua-labs/hua/framework';

// Presets
import { productPreset, marketingPreset } from '@hua-labs/hua/presets';

// Config file (hua.config.ts)
export default defineConfig({
  preset: 'product',
  branding: {
    primaryColor: '#3B82F6',
  },
});
```

**Value**:
- Start immediately without complex configuration
- AI can recommend settings and generate code
- Fast prototyping

### Pro Layer

**Target**: Projects requiring advanced animations/interactions

**Features**:
- Advanced motion hooks (orchestration, auto-animations)
- Performance monitoring

**Usage**:
```typescript
import {
  useAutoSlide,
  useAutoFade,
  useOrchestration,
  useSequence,
  usePerformanceMonitor,
  useGameLoop,
} from '@hua-labs/hua/pro';
```

### Top Layer: AI Context & CLI

**Target**: Vibe coders, AI tools (Cursor, Claude, etc.)

**Features**:
- AI understands the project structure completely
- Code generation from natural language commands alone

**Provided files**:
```
project/
|-- .cursorrules          -> Cursor AI guidelines
|-- ai-context.md         -> AI context
|-- .claude/
|   |-- project-context.md
|   +-- skills/
|       +-- hua-framework/SKILL.md
```

## Import Guide

### Recommended: Framework Subpath

```typescript
// Recommended - framework subpath
import { HuaProvider, useMotion } from '@hua-labs/hua/framework';
import { Button, Card } from '@hua-labs/hua/ui';
import { useTranslation } from '@hua-labs/hua/i18n';
import { useFadeIn } from '@hua-labs/hua/motion';
import { createI18nStore } from '@hua-labs/hua/state';
```

### Allowed: Main Entry Point

```typescript
// Allowed - full integration (tree-shaking supported)
import { Button, useTranslation, useFadeIn, HuaProvider } from '@hua-labs/hua';
```

### Advanced: Direct Package Usage

```typescript
// Advanced users - individual packages directly
import { Button } from '@hua-labs/ui';
import { useTranslation } from '@hua-labs/i18n-core';
import { useFadeIn } from '@hua-labs/motion-core';
import { createHuaStore } from '@hua-labs/state';
```

## Moving Between Layers

### Vibe Coder -> Traditional Developer

As the service grows, move down the layers:

```typescript
// Vibe mode (middle layer)
import { useMotion } from '@hua-labs/hua/framework';
const motion = useMotion({ type: 'fadeIn' });

// When deep dive is needed (bottom layer)
import { useFadeIn, useSlideUp } from '@hua-labs/hua/motion';
const fadeIn = useFadeIn({ duration: 300, delay: 100 });
```

### Traditional Developer -> Vibe Coder

For simple tasks or fast prototyping:

```typescript
// Traditional mode (bottom layer)
const fadeIn = useFadeIn({ duration: 300 });
const slideUp = useSlideUp({ distance: 20 });

// When speed is needed (middle layer)
const motion = useMotion({ type: 'fadeIn' });  // one line
```

## Design Principles

### 1. Single Package, Multiple Entry Points

- One `@hua-labs/hua` package
- Subpath exports by purpose
- Bundle optimization via tree-shaking

### 2. Escape Hatch Required

All layers must be able to drop down to lower layers:
- Framework -> Core subpaths
- Config -> Direct control
- Preset -> Custom settings

### 3. Dual Documentation

- **README.md**: API reference
- **.cursorrules**: AI guidebook
- **ai-context.md**: AI context

## Package Structure

```
packages/
|-- hua              -> Framework (integrated)
|-- hua-ui              -> UI components
|-- hua-motion-core     -> Motion hooks
|-- hua-state           -> State management
|-- hua-pro             -> Pro features (private)
|-- hua-i18n-core       -> i18n core
|-- hua-i18n-core-zustand
|-- hua-i18n-formatters
|-- hua-i18n-loaders
+-- create-hua       -> CLI
```

## CLI

```bash
# Create project
npx create-hua my-app
# or
npx create-hua my-app
```
