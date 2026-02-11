import { describe, it, expect } from 'vitest';
import { normalizeIconName, getProviderIconName } from '../normalize-icon-name';

describe('normalizeIconName', () => {
  it('should return normalized result with wasAlias true for kebab-case that is aliased', () => {
    // 'arrow-left' exists in ICON_ALIASES as a mapping
    const result = normalizeIconName('arrow-left');
    expect(result).toEqual({
      normalized: 'arrowLeft',
      wasAlias: true,
      originalAlias: 'arrow-left'
    });
  });

  it('should return normalized result with wasAlias false for non-aliased names', () => {
    // 'someIcon' is not in ICON_ALIASES
    const result = normalizeIconName('someIcon');
    expect(result).toEqual({
      normalized: 'someIcon',
      wasAlias: false
    });
  });

  it('should return normalized result with wasAlias true for aliases', () => {
    const result = normalizeIconName('back');
    expect(result).toEqual({
      normalized: 'arrowLeft',
      wasAlias: true,
      originalAlias: 'back'
    });
  });

  it('should convert kebab-case to camelCase', () => {
    const result = normalizeIconName('heart-circle');
    expect(result.normalized).toBe('heartCircle');
    expect(result.wasAlias).toBe(false);
  });

  it('should convert PascalCase to camelCase', () => {
    const result = normalizeIconName('ArrowLeft');
    expect(result.normalized).toBe('arrowLeft');
    expect(result.wasAlias).toBe(false);
  });

  it('should keep camelCase unchanged', () => {
    const result = normalizeIconName('arrowLeft');
    expect(result.normalized).toBe('arrowLeft');
    expect(result.wasAlias).toBe(false);
  });

  it('should resolve multiple aliases correctly', () => {
    const backResult = normalizeIconName('back');
    expect(backResult.normalized).toBe('arrowLeft');
    expect(backResult.wasAlias).toBe(true);

    const prevResult = normalizeIconName('prev');
    expect(prevResult.normalized).toBe('arrowLeft');
    expect(prevResult.wasAlias).toBe(true);

    const closeResult = normalizeIconName('close');
    expect(closeResult.normalized).toBe('x');
    expect(closeResult.wasAlias).toBe(true);
  });

  it('should handle empty string', () => {
    const result = normalizeIconName('');
    expect(result).toEqual({
      normalized: '',
      wasAlias: false
    });
  });

  it('should handle non-string input gracefully', () => {
    const result = normalizeIconName(null as any);
    expect(result).toEqual({
      normalized: '',
      wasAlias: false
    });
  });

  it('should resolve aliases even for kebab-case input', () => {
    // 'arrow-left' is in ICON_ALIASES mapping to 'arrowLeft'
    const result = normalizeIconName('arrow-left');
    expect(result.normalized).toBe('arrowLeft');
    // This should be true because 'arrow-left' is an alias in ICON_ALIASES
    expect(result.wasAlias).toBe(true);
    expect(result.originalAlias).toBe('arrow-left');
  });

  it('should handle camelCase aliases', () => {
    // Test that it checks both original and camelCased version for aliases
    const result = normalizeIconName('magnify');
    expect(result.normalized).toBe('search');
    expect(result.wasAlias).toBe(true);
  });
});

describe('getProviderIconName', () => {
  it('should return PascalCase for lucide provider', () => {
    expect(getProviderIconName('arrowLeft', 'lucide')).toBe('ArrowLeft');
    expect(getProviderIconName('heart', 'lucide')).toBe('Heart');
    expect(getProviderIconName('heartCircle', 'lucide')).toBe('HeartCircle');
  });

  it('should return PascalCase for phosphor provider', () => {
    expect(getProviderIconName('arrowLeft', 'phosphor')).toBe('ArrowLeft');
    expect(getProviderIconName('heart', 'phosphor')).toBe('Heart');
    expect(getProviderIconName('heartCircle', 'phosphor')).toBe('HeartCircle');
  });

  it('should return PascalCase for iconsax provider', () => {
    expect(getProviderIconName('arrowLeft', 'iconsax')).toBe('ArrowLeft');
    expect(getProviderIconName('heart', 'iconsax')).toBe('Heart');
    expect(getProviderIconName('heartCircle', 'iconsax')).toBe('HeartCircle');
  });

  it('should handle all provider types correctly', () => {
    const iconName = 'arrowLeft';
    expect(getProviderIconName(iconName, 'lucide')).toBe('ArrowLeft');
    expect(getProviderIconName(iconName, 'phosphor')).toBe('ArrowLeft');
    expect(getProviderIconName(iconName, 'iconsax')).toBe('ArrowLeft');
  });

  it('should handle complex names', () => {
    expect(getProviderIconName('arrowUpRight', 'lucide')).toBe('ArrowUpRight');
    expect(getProviderIconName('checkCircle', 'phosphor')).toBe('CheckCircle');
  });

  it('should handle lowercase input', () => {
    expect(getProviderIconName('heart', 'lucide')).toBe('Heart');
    expect(getProviderIconName('user', 'phosphor')).toBe('User');
  });
});
