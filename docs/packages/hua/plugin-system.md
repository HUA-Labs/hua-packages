# hua Plugin System

## Overview

The plugin system for hua enables modular extension of the framework through a standardized interface. The plugin infrastructure (interface, registry, defineConfig integration) is fully implemented. Concrete plugin packages are planned for future releases.

> **Status**: Plugin infrastructure is production-ready. The examples below show how to create and use plugins. Official plugin packages listed are **planned**.

## Plugin Types

### 1. Feature Plugins

Plugins that add advanced functionality.

**Planned**:
- Advanced motion (parallax, 3D transforms)
- CDN translation loader, translation management
- Analytics tool integration

### 2. Preset Plugins

Plugins that add new presets beyond the built-in `product` and `marketing`.

**Planned**:
- E-commerce, dashboard, blog presets

### 3. Branding Plugins

Brand themes for white-labeling.

## Plugin Interface

### Base Structure

```typescript
// packages/hua/src/plugins/types.ts
import type { ZodSchema } from 'zod';
import type { HuaConfig } from '../types';

export interface HuaPlugin {
  /**
   * Plugin name
   */
  name: string;

  /**
   * Plugin version
   */
  version: string;

  /**
   * Plugin initialization
   */
  init(config: HuaConfig): void;

  /**
   * Component extensions
   */
  components?: Record<string, React.ComponentType<any>>;

  /**
   * Hook extensions
   */
  hooks?: Record<string, Function>;

  /**
   * Config schema extension
   */
  configSchema?: ZodSchema;
}
```

### Plugin Registry

```typescript
// packages/hua/src/framework/plugins/registry.ts
class PluginRegistry {
  private plugins: Map<string, HuaPlugin> = new Map();

  register(plugin: HuaPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  get(name: string): HuaPlugin | undefined {
    return this.plugins.get(name);
  }

  getAll(): HuaPlugin[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginRegistry = new PluginRegistry();
```

### Plugin Usage in Config

```typescript
// hua.config.ts
import { defineConfig } from '@hua-labs/hua/framework';
import { myPlugin } from './plugins/my-plugin';

export default defineConfig({
  preset: 'product',

  // Register plugins
  plugins: [
    myPlugin,
  ],
});
```

## Plugin Examples

### Basic Plugin Structure

```typescript
// packages/my-plugin/src/index.ts
import type { HuaPlugin } from '@hua-labs/hua/framework';

export const myPlugin: HuaPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  description: 'My awesome plugin',

  init(config) {
    // Plugin initialization logic
    console.log('My plugin initialized!', config);
  },

  components: {
    MyComponent: MyComponent,
  },

  hooks: {
    useMyHook: useMyHook,
  },
};
```

### Registration in Config File

```typescript
// hua.config.ts
import { defineConfig } from '@hua-labs/hua/framework';
import { myPlugin } from './plugins/my-plugin';

export default defineConfig({
  preset: 'product',
  plugins: [myPlugin],
});
```

### Runtime Registration

```typescript
// app/layout.tsx
import { registerPlugin } from '@hua-labs/hua/framework';
import { myPlugin } from './plugins/my-plugin';

registerPlugin(myPlugin);
```

### Using Plugin Components

```typescript
// app/page.tsx
import { getPlugin } from '@hua-labs/hua/framework';

export default function Page() {
  const motionPro = getPlugin('motion-pro');
  const ParallaxScroll = motionPro?.components?.ParallaxScroll;

  if (!ParallaxScroll) {
    return <div>Motion Pro plugin not available</div>;
  }

  return <ParallaxScroll>Content</ParallaxScroll>;
}
```

### Feature Plugin Example

```typescript
// analytics-plugin.ts
import type { HuaPlugin } from '@hua-labs/hua/framework';

export const analyticsPlugin: HuaPlugin = {
  name: 'analytics',
  version: '1.0.0',
  description: 'Page view and event tracking',

  init(config) {
    // Initialize analytics based on config
  },

  hooks: {
    useTrackEvent: () => { /* ... */ },
  },
};
```

## Plugin Initialization Order

Plugins are initialized in the following order:

1. **Plugin Registration** (`defineConfig` or `registerPlugin`)
   - Plugin registered in the registry

2. **After Config Validation**
   - After `defineConfig` completes configuration
   - All plugin `init()` functions called in parallel

3. **Initialization Complete**
   - Each plugin initialized only once (deduplication)
   - Initialized plugins stored in `initialized` Set

**Example**:
```typescript
// hua.config.ts
export default defineConfig({
  preset: 'product',
  plugins: [myPlugin, analyticsPlugin],
  // Registration -> Config validation -> Plugin initialization (automatic)
});
```

## Plugin Types & Exports

The plugin system is exported from `@hua-labs/hua/framework`:

```typescript
import {
  pluginRegistry,      // Plugin registry instance
  registerPlugin,     // Plugin registration function
  getPlugin,          // Get a plugin
  getAllPlugins       // Get all plugins
} from '@hua-labs/hua/framework';

import type { HuaPlugin } from '@hua-labs/hua/framework';
```

## Implementation Files

The actual plugin system implementation can be found at:

- `packages/hua/src/framework/plugins/types.ts` - Plugin interface
- `packages/hua/src/framework/plugins/registry.ts` - Plugin registry
- `packages/hua/src/framework/plugins/index.ts` - Exports
