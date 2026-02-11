import { describe, it, expect } from 'vitest';
import {
  generateId,
  generateUUID,
  slugify,
  truncate,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  capitalize,
  titleCase,
} from '../string';

describe('generateId', () => {
  it('should generate ID with default prefix', () => {
    const id = generateId();
    expect(id).toMatch(/^id_\d+_[a-z0-9]+$/);
  });

  it('should generate ID with custom prefix', () => {
    const id = generateId('user');
    expect(id).toMatch(/^user_\d+_[a-z0-9]+$/);
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should include timestamp', () => {
    const id = generateId();
    const parts = id.split('_');
    expect(parts).toHaveLength(3);
    expect(Number(parts[1])).toBeGreaterThan(0);
  });
});

describe('generateUUID', () => {
  it('should generate valid UUID format', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('should generate unique UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });

  it('should have correct version (4)', () => {
    const uuid = generateUUID();
    expect(uuid.charAt(14)).toBe('4');
  });

  it('should have correct variant', () => {
    const uuid = generateUUID();
    const variant = uuid.charAt(19);
    expect(['8', '9', 'a', 'b']).toContain(variant);
  });
});

describe('slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('hello world test')).toBe('hello-world-test');
  });

  it('should remove special characters', () => {
    expect(slugify('hello!@#$%world')).toBe('helloworld');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('should trim leading/trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('should handle underscores', () => {
    expect(slugify('hello_world')).toBe('hello-world');
  });

  it('should handle mixed separators', () => {
    expect(slugify('hello_world-test space')).toBe('hello-world-test-space');
  });

  it('should handle Korean characters (removed by regex)', () => {
    const result = slugify('안녕하세요 hello world');
    expect(result).toBe('hello-world');
  });
});

describe('truncate', () => {
  it('should not truncate if string is shorter than length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('should truncate long strings', () => {
    const result = truncate('hello world', 8);
    expect(result.length).toBeLessThanOrEqual(8);
    expect(result).toContain('...');
  });

  it('should use custom suffix', () => {
    const result = truncate('hello world', 8, '…');
    expect(result).toContain('…');
  });

  it('should handle exact length match', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('should handle Korean characters', () => {
    const result = truncate('안녕하세요 반갑습니다', 10);
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result).toContain('...');
  });

  it('should respect suffix length in truncation', () => {
    const result = truncate('hello world', 10, '...');
    expect(result.length).toBeLessThanOrEqual(10);
  });
});

describe('toCamelCase', () => {
  it('should convert space-separated words', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld');
  });

  it('should handle PascalCase input', () => {
    expect(toCamelCase('HelloWorld')).toBe('helloWorld');
  });

  it('should handle multiple words', () => {
    expect(toCamelCase('hello world test case')).toBe('helloWorldTestCase');
  });

  it('should handle single word', () => {
    expect(toCamelCase('hello')).toBe('hello');
  });
});

describe('toPascalCase', () => {
  it('should convert space-separated words', () => {
    expect(toPascalCase('hello world')).toBe('HelloWorld');
  });

  it('should handle camelCase input', () => {
    expect(toPascalCase('helloWorld')).toBe('HelloWorld');
  });

  it('should handle multiple words', () => {
    expect(toPascalCase('hello world test case')).toBe('HelloWorldTestCase');
  });

  it('should handle single word', () => {
    expect(toPascalCase('hello')).toBe('Hello');
  });
});

describe('toSnakeCase', () => {
  it('should convert camelCase', () => {
    expect(toSnakeCase('helloWorld')).toBe('hello_world');
  });

  it('should convert PascalCase', () => {
    expect(toSnakeCase('HelloWorld')).toBe('hello_world');
  });

  it('should handle multiple capital letters', () => {
    expect(toSnakeCase('helloWorldTest')).toBe('hello_world_test');
  });

  it('should handle single word', () => {
    expect(toSnakeCase('hello')).toBe('hello');
  });

  it('should handle all caps word', () => {
    expect(toSnakeCase('HELLO')).toBe('h_e_l_l_o');
  });
});

describe('toKebabCase', () => {
  it('should convert camelCase', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world');
  });

  it('should convert PascalCase', () => {
    expect(toKebabCase('HelloWorld')).toBe('hello-world');
  });

  it('should handle multiple capital letters', () => {
    expect(toKebabCase('helloWorldTest')).toBe('hello-world-test');
  });

  it('should handle single word', () => {
    expect(toKebabCase('hello')).toBe('hello');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should lowercase rest of string', () => {
    expect(capitalize('hELLO')).toBe('Hello');
  });

  it('should handle single character', () => {
    expect(capitalize('h')).toBe('H');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('titleCase', () => {
  it('should capitalize each word', () => {
    expect(titleCase('hello world')).toBe('Hello World');
  });

  it('should handle multiple words', () => {
    expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox');
  });

  it('should handle mixed case input', () => {
    expect(titleCase('hELLO wORLD')).toBe('Hello World');
  });

  it('should handle single word', () => {
    expect(titleCase('hello')).toBe('Hello');
  });
});
