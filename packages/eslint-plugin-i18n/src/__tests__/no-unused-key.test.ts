/**
 * Tests for i18n/no-unused-key rule
 */
import { describe, expect, it } from 'vitest';
import noUnusedKey from '../rules/no-unused-key';

describe('no-unused-key rule', () => {
  it('should export a valid ESLint rule module', () => {
    expect(noUnusedKey).toBeDefined();
    expect(noUnusedKey.meta).toBeDefined();
    expect(noUnusedKey.create).toBeTypeOf('function');
  });

  it('should have correct meta.type', () => {
    expect(noUnusedKey.meta!.type).toBe('suggestion');
  });

  it('should have correct meta.docs', () => {
    expect(noUnusedKey.meta!.docs).toBeDefined();
    expect(noUnusedKey.meta!.docs!.description).toBe(
      'Warn about potentially unused translation keys (basic detection)'
    );
    expect(noUnusedKey.meta!.docs!.recommended).toBe(false);
  });

  it('should have correct schema with keysFile property', () => {
    expect(noUnusedKey.meta!.schema).toBeDefined();
    expect(Array.isArray(noUnusedKey.meta!.schema)).toBe(true);
    expect(noUnusedKey.meta!.schema).toHaveLength(1);

    const schemaObj = (noUnusedKey.meta!.schema as any)[0];
    expect(schemaObj.type).toBe('object');
    expect(schemaObj.properties).toBeDefined();
    expect(schemaObj.properties.keysFile).toBeDefined();
    expect(schemaObj.properties.keysFile.type).toBe('string');
    expect(schemaObj.properties.keysFile.description).toBe(
      'Path to the generated i18n-types file'
    );
    expect(schemaObj.additionalProperties).toBe(false);
  });

  it('should have correct messages', () => {
    expect(noUnusedKey.meta!.messages).toBeDefined();
    expect(noUnusedKey.meta!.messages!.unusedKeyHint).toBe(
      'This file defines translation keys. Run `validate:translations` to detect unused keys across the project.'
    );
  });

  it('should return empty object from create() function', () => {
    // The rule intentionally returns {} because it requires project-wide analysis
    // which is handled by the validate-translations script
    const context = {} as any;
    const result = noUnusedKey.create(context);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should create without errors with any context', () => {
    const mockContext = {
      options: [{ keysFile: 'path/to/i18n-types.ts' }],
      report: () => {},
    } as any;

    expect(() => noUnusedKey.create(mockContext)).not.toThrow();
  });
});
