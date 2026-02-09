# hua AI Tools & Vibe Coding

## Overview

This document covers the strategy for supporting various AI tools for vibe coding and the layered architecture that enables both traditional developers and vibe coders to use hua effectively.

## Supported AI Tools

### 1. Cursor

**File**: `.cursorrules`

**Purpose**: Rules for Cursor IDE to follow when generating code.

**Contents**:
- Project structure description
- Code generation patterns
- Key rules

**Auto-generated**: `create-hua` generates this automatically.

### 2. Claude (Including Claude in Cursor)

**File**: `.claude/project-context.md`

**Purpose**: Context for Claude to understand the project structure.

**Contents**:
- Project overview
- Architecture layers
- Key patterns
- Config file descriptions

**Auto-generated**: `create-hua` generates this automatically.

### 3. Universal AI Context

**File**: `ai-context.md`

**Purpose**: Universal context usable by any AI tool.

**Contents**:
- Project structure
- Key patterns
- Config file understanding
- Precautions for AI code generation

**Auto-generated**: `create-hua` generates this automatically.

## Bilingual JSDoc Strategy

### Principle

**Support both languages**: Satisfy both Korean and English users.

**Format**:
```typescript
/**
 * Korean description / English description
 *
 * Detailed description (Korean) / Detailed description (English)
 *
 * @param param - Korean description / English description
 */
```

### Example

```typescript
/**
 * Define framework configuration
 *
 * Provides full IntelliSense support for configuration options.
 *
 * @param config - Configuration object
 * @param config.preset - Preset to use
 *   - 'product': Product pages (professional, efficient)
 *   - 'marketing': Marketing pages (dramatic, eye-catching)
 */
```

## Usage Examples

### Cursor Users

1. Create project: `pnpm create hua my-app`
2. `.cursorrules` auto-generated
3. Cursor automatically understands project structure
4. "Create a main page" -> AI generates complete code

### Claude Users

1. Create project: `pnpm create hua my-app`
2. `.claude/project-context.md` auto-generated
3. Claude automatically understands project structure
4. "Create a main page" -> AI generates complete code

### Universal AI Tools

1. Create project: `pnpm create hua my-app`
2. `ai-context.md` auto-generated
3. AI tool reads this file and understands project structure

---

## Vibe Coding Strategy

### Target Users

#### 1. Traditional Developers
- **Want**: Reliable foundation, precise types, low-level control
- **Usage**: Core layer direct usage, individual package independent usage
- **Value**: Clean foundational code -> framework trust

#### 2. Vibe Coders
- **Want**: Fast results, natural communication with AI
- **Usage**: Config file + AI commands, Preset system
- **Value**: No need to know Next.js internals; just configure and talk to AI

### Layered Architecture for Both

#### Bottom Layer: Core & Types (Traditional Developer Layer)

**Characteristic**: "I can control everything"

**Provides**:
- Precise TypeScript types
- Low-level APIs
- Individual package independent usage (`@hua-labs/state`, `@hua-labs/motion`, etc.)

```typescript
// Traditional developer: direct control
import { createHuaStore } from '@hua-labs/state';
import { useFadeIn } from '@hua-labs/motion-core';

const store = createHuaStore(...);
const motion = useFadeIn({ duration: 300 });
```

#### Middle Layer: Framework & Config (AI/Vibe Coder Layer)

**Characteristic**: "Just tell it and it handles everything"

**Provides**:
- `defineConfig` (declarative configuration)
- `HuaUxLayout` (auto Provider setup)
- Preset system (one word resolves most things)

```typescript
// Vibe coder: solved with config alone
export default defineConfig({
  preset: 'product',  // Done!
});
```

#### Top Layer: AI Context & CLI (Vibe Coding Dedicated)

**Characteristic**: "AI reads my mind"

**Provides**:
- `.cursorrules` (AI-specific guide)
- `ai-context.md` (project structure description)
- `create-hua` scaffolding (AI-friendly structure)

### Vibe Coding-Friendly Design

#### 1. Noun-Centric Declarative Config

**Traditional**:
```typescript
revalidate: 3600,
staleTime: 60000,
```

**Vibe coding friendly**:
```typescript
freshness: 'high',
performance: 'fast-and-light',
```

AI grasps context more accurately with adjectives/nouns expressing 'intent' rather than technical numbers.

#### 2. Many Decisions in One File

`HuaUxPage` combines SEO, Motion, and i18n Key all as props:

```tsx
<HuaUxPage
  title="Main Page"
  description="Welcome"
  i18nKey="home"
  motion="fadeIn"
>
  {/* AI generates a complete page from just one file */}
</HuaUxPage>
```

#### 3. Strong Type System (Guides AI Autocomplete)

Precise types let Cursor suggest: "The values you can use here are 'product' or 'marketing'."

#### 4. Bilingual JSDoc Comments

AI can recommend settings with explanations in both Korean and English:

```typescript
/**
 * Preset selection
 *
 * - 'product': For product pages (professional, efficient)
 * - 'marketing': For marketing pages (dramatic, eye-catching)
 */
preset?: 'product' | 'marketing';
```

### Complementary Relationship

1. **Traditional Developer -> Vibe Coder**
   - Solid code from traditional developers improves AI-generated code quality
   - Vibe coder productivity showcases help framework adoption

2. **Vibe Coder -> Traditional Developer**
   - As the service grows, traditional developer expertise is needed -> just move down the layers

### Career Mobility Support

- **Experienced developers**: Switch to 'vibe coding' mode for simple tasks or off days
- **Vibe coders**: When deep dive is needed as the service grows -> just move down layers without switching frameworks

### Practical Implementation

#### 1. Strict Internals, Flexible Surface

- **Internal logic**: TypeScript clean enough to impress senior developers
- **External config**: Easy for vibe coders to understand in natural language

#### 2. Dual Documentation

- **README.md**: API reference for traditional developers
- **.cursorrules**: Guidebook for AI vibe coding assistance
- **ai-context.md**: AI-specific project structure description

#### 3. Preset System Extension

- **Developer mode**: Technical detailed settings available
- **Vibe mode**: Business intent-centric settings

## Implementation Status

### Completed
- `.cursorrules` template generation
- `.claude/project-context.md` template generation
- `ai-context.md` template generation
- Bilingual JSDoc started (defineConfig)

### In Progress
- All config items with bilingual JSDoc
- Component props with bilingual JSDoc
- Hooks with bilingual JSDoc
