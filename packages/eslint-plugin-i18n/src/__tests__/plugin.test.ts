/**
 * Tests for plugin structure and exports
 */
import { describe, expect, it } from 'vitest';
import plugin from '../index';

describe('eslint-plugin-i18n', () => {
  it('should export plugin with all rules', () => {
    expect(plugin).toBeDefined();
    expect(plugin.rules).toBeDefined();
    expect(Object.keys(plugin.rules)).toHaveLength(4);
  });

  it('should export no-missing-key rule', () => {
    expect(plugin.rules['no-missing-key']).toBeDefined();
    expect(plugin.rules['no-missing-key'].meta).toBeDefined();
    expect(plugin.rules['no-missing-key'].meta.type).toBe('problem');
    expect(plugin.rules['no-missing-key'].create).toBeTypeOf('function');
  });

  it('should export no-dynamic-key rule', () => {
    expect(plugin.rules['no-dynamic-key']).toBeDefined();
    expect(plugin.rules['no-dynamic-key'].meta).toBeDefined();
    expect(plugin.rules['no-dynamic-key'].meta.type).toBe('suggestion');
    expect(plugin.rules['no-dynamic-key'].create).toBeTypeOf('function');
  });

  it('should export no-raw-text rule', () => {
    expect(plugin.rules['no-raw-text']).toBeDefined();
    expect(plugin.rules['no-raw-text'].meta).toBeDefined();
    expect(plugin.rules['no-raw-text'].meta.type).toBe('suggestion');
    expect(plugin.rules['no-raw-text'].create).toBeTypeOf('function');
  });

  it('should export no-unused-key rule', () => {
    expect(plugin.rules['no-unused-key']).toBeDefined();
    expect(plugin.rules['no-unused-key'].meta).toBeDefined();
    expect(plugin.rules['no-unused-key'].meta.type).toBe('suggestion');
    expect(plugin.rules['no-unused-key'].create).toBeTypeOf('function');
  });

  it('should export recommended config', () => {
    expect(plugin.configs).toBeDefined();
    expect(plugin.configs.recommended).toBeDefined();
    expect(plugin.configs.recommended.plugins).toContain('@hua-labs/i18n');
  });

  it('should have correct recommended config rules', () => {
    const recommended = plugin.configs.recommended;
    expect(recommended.rules['@hua-labs/i18n/no-missing-key']).toBe('error');
    expect(recommended.rules['@hua-labs/i18n/no-raw-text']).toBe('warn');
    expect(recommended.rules['@hua-labs/i18n/no-dynamic-key']).toBe('warn');
    expect(recommended.rules['@hua-labs/i18n/no-unused-key']).toBe('off');
  });

  it('should have proper rule meta schemas', () => {
    // no-dynamic-key schema
    const dynamicKeySchema = plugin.rules['no-dynamic-key'].meta.schema;
    expect(dynamicKeySchema).toBeDefined();
    expect(Array.isArray(dynamicKeySchema)).toBe(true);
    expect(dynamicKeySchema[0].properties).toHaveProperty('functionNames');
    expect(dynamicKeySchema[0].properties).toHaveProperty('allowPatterns');

    // no-raw-text schema
    const rawTextSchema = plugin.rules['no-raw-text'].meta.schema;
    expect(rawTextSchema).toBeDefined();
    expect(Array.isArray(rawTextSchema)).toBe(true);
    expect(rawTextSchema[0].properties).toHaveProperty('allowedTerms');
    expect(rawTextSchema[0].properties).toHaveProperty('checkAttributes');

    // no-missing-key schema
    const missingKeySchema = plugin.rules['no-missing-key'].meta.schema;
    expect(missingKeySchema).toBeDefined();
    expect(Array.isArray(missingKeySchema)).toBe(true);
    expect(missingKeySchema[0].properties).toHaveProperty('keysFile');
  });
});
