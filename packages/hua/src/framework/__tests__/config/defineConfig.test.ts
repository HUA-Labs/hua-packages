/**
 * @hua-labs/hua-ux/framework - Config Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { defineConfig, getConfig, setConfig, resetConfig } from '../../config';

describe('defineConfig', () => {
  it('should create config with preset', () => {
    const config = defineConfig({
      preset: 'product',
    });

    expect(config).toBeDefined();
    expect(config.preset).toBe('product');
  });

  it('should create config with custom settings', () => {
    const config = defineConfig({
      i18n: {
        defaultLanguage: 'ko',
        supportedLanguages: ['ko', 'en'],
        namespaces: ['common'],
      },
    });

    expect(config.i18n).toBeDefined();
    expect(config.i18n?.defaultLanguage).toBe('ko');
    expect(config.i18n?.supportedLanguages).toEqual(['ko', 'en']);
  });

  it('should merge preset with custom settings', () => {
    const config = defineConfig({
      preset: 'product',
      motion: {
        enableAnimations: false,
      },
    });

    expect(config.preset).toBe('product');
    expect(config.motion?.enableAnimations).toBe(false);
  });
});

describe('getConfig', () => {
  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    resetConfig();
  });

  it('should return default config when no config is set', () => {
    resetConfig();
    const config = getConfig();

    expect(config).toBeDefined();
    // jsdom 환경에서는 window가 정의되어 있어 기본값(product preset)이 반환됨
    // getConfig는 항상 설정을 반환하므로 motion, i18n 등이 정의되어 있어야 함
    expect(config.motion).toBeDefined();
    expect(config.i18n).toBeDefined();
  });

  it('should return set config', () => {
    resetConfig();
    const customConfig = defineConfig({
      preset: 'marketing',
    });

    setConfig(customConfig);
    const config = getConfig();

    // setConfig 후에는 설정된 config가 반환되어야 함
    expect(config.preset).toBe('marketing');
  });
});

describe('setConfig', () => {
  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    resetConfig();
  });

  it('should set config', () => {
    resetConfig();
    const customConfig = defineConfig({
      preset: 'marketing',
    });

    setConfig(customConfig);
    const config = getConfig();

    expect(config.preset).toBe('marketing');
  });

  it('should override previous config', () => {
    resetConfig();
    const config1 = defineConfig({ preset: 'product' });
    const config2 = defineConfig({ preset: 'marketing' });

    setConfig(config1);
    expect(getConfig().preset).toBe('product');

    setConfig(config2);
    expect(getConfig().preset).toBe('marketing');
  });
});

describe('resetConfig', () => {
  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    resetConfig();
  });

  it('should reset config to default', () => {
    resetConfig();
    const customConfig = defineConfig({
      preset: 'marketing',
    });

    setConfig(customConfig);
    expect(getConfig().preset).toBe('marketing');

    resetConfig();
    const defaultConfig = getConfig();

    // 기본값으로 리셋됨 (product preset)
    expect(defaultConfig.preset).toBeDefined();
  });
});
