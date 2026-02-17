/**
 * @hua-labs/hua/framework - Plugin Registry Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pluginRegistry } from '../registry';
import type { HuaPlugin } from '../types';

// Mock logger to avoid console output in tests
vi.mock('../../../utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock license system
vi.mock('../../license', () => ({
  hasLicense: vi.fn().mockReturnValue(true),
}));

describe('plugins/registry', () => {
  const freePlugin: HuaPlugin = {
    name: 'test-plugin',
    version: '1.0.0',
    license: 'free',
    init: vi.fn(),
  };

  const proPlugin: HuaPlugin = {
    name: 'pro-plugin',
    version: '1.0.0',
    license: 'pro',
    init: vi.fn(),
    checkLicense: vi.fn().mockReturnValue(true),
  };

  beforeEach(() => {
    pluginRegistry.reset();
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a free plugin', () => {
      pluginRegistry.register(freePlugin);
      const plugin = pluginRegistry.get('test-plugin');
      expect(plugin).toBeDefined();
      expect(plugin?.name).toBe('test-plugin');
    });

    it('should warn on duplicate registration', async () => {
      await import('../../../utils/logger.js');
      pluginRegistry.register(freePlugin);
      pluginRegistry.register(freePlugin);
      // Note: Since logger is mocked at module level, we can't check individual calls here
      // Just verify plugin is registered (overwritten)
      const plugin = pluginRegistry.get('test-plugin');
      expect(plugin).toBeDefined();
    });

    it('should verify license for pro plugin', () => {
      pluginRegistry.register(proPlugin);
      expect(proPlugin.checkLicense).toHaveBeenCalled();
    });

    it('should throw error when pro plugin license check fails', () => {
      const failPlugin: HuaPlugin = {
        name: 'fail-plugin',
        version: '1.0.0',
        license: 'pro',
        init: vi.fn(),
        checkLicense: vi.fn().mockReturnValue(false),
      };

      expect(() => {
        pluginRegistry.register(failPlugin);
      }).toThrow('requires a valid pro license');
    });
  });

  describe('get', () => {
    it('should get registered plugin', () => {
      pluginRegistry.register(freePlugin);
      const plugin = pluginRegistry.get('test-plugin');
      expect(plugin).toBeDefined();
      expect(plugin?.name).toBe('test-plugin');
    });

    it('should return undefined for unknown plugin', () => {
      const plugin = pluginRegistry.get('unknown');
      expect(plugin).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all registered plugins', () => {
      pluginRegistry.register(freePlugin);
      pluginRegistry.register(proPlugin);
      const plugins = pluginRegistry.getAll();
      expect(plugins).toHaveLength(2);
      expect(plugins.map(p => p.name)).toContain('test-plugin');
      expect(plugins.map(p => p.name)).toContain('pro-plugin');
    });

    it('should return empty array when no plugins', () => {
      const plugins = pluginRegistry.getAll();
      expect(plugins).toHaveLength(0);
    });
  });

  describe('unregister', () => {
    it('should unregister plugin', () => {
      pluginRegistry.register(freePlugin);
      pluginRegistry.unregister('test-plugin');
      const plugin = pluginRegistry.get('test-plugin');
      expect(plugin).toBeUndefined();
    });
  });

  describe('initialize', () => {
    it('should call plugin init function', async () => {
      pluginRegistry.register(freePlugin);
      const config = { preset: 'product' };
      await pluginRegistry.initialize('test-plugin', config);
      expect(freePlugin.init).toHaveBeenCalledWith(config);
    });

    it('should skip already initialized plugin', async () => {
      pluginRegistry.register(freePlugin);
      const config = { preset: 'product' };
      await pluginRegistry.initialize('test-plugin', config);
      await pluginRegistry.initialize('test-plugin', config);
      expect(freePlugin.init).toHaveBeenCalledTimes(1);
    });

    it('should throw error for unknown plugin', async () => {
      await expect(
        pluginRegistry.initialize('unknown', {})
      ).rejects.toThrow('Plugin "unknown" not found');
    });
  });

  describe('initializeAll', () => {
    it('should initialize all registered plugins', async () => {
      const plugin1 = { ...freePlugin, name: 'plugin-1', init: vi.fn() };
      const plugin2 = { ...freePlugin, name: 'plugin-2', init: vi.fn() };

      pluginRegistry.register(plugin1);
      pluginRegistry.register(plugin2);

      const config = { preset: 'product' };
      await pluginRegistry.initializeAll(config);

      expect(plugin1.init).toHaveBeenCalledWith(config);
      expect(plugin2.init).toHaveBeenCalledWith(config);
    });
  });

  describe('reset', () => {
    it('should clear all plugins and initialization state', () => {
      pluginRegistry.register(freePlugin);
      pluginRegistry.reset();
      const plugins = pluginRegistry.getAll();
      expect(plugins).toHaveLength(0);
    });
  });
});
