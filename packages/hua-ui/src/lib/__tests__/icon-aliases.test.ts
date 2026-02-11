import { describe, it, expect } from 'vitest';
import { resolveIconAlias, getIconAliases, ICON_ALIASES } from '../icon-aliases';

describe('resolveIconAlias', () => {
  it('should resolve known navigation aliases', () => {
    expect(resolveIconAlias('back')).toBe('arrowLeft');
    expect(resolveIconAlias('prev')).toBe('arrowLeft');
    expect(resolveIconAlias('previous')).toBe('arrowLeft');
    expect(resolveIconAlias('forward')).toBe('arrowRight');
    expect(resolveIconAlias('next')).toBe('arrowRight');
  });

  it('should resolve close aliases', () => {
    expect(resolveIconAlias('close')).toBe('x');
    expect(resolveIconAlias('cancel')).toBe('x');
  });

  it('should resolve search alias', () => {
    expect(resolveIconAlias('search')).toBe('search');
    expect(resolveIconAlias('magnify')).toBe('search');
  });

  it('should resolve delete aliases', () => {
    expect(resolveIconAlias('remove')).toBe('delete');
    expect(resolveIconAlias('trash')).toBe('delete');
  });

  it('should resolve add aliases', () => {
    expect(resolveIconAlias('plus')).toBe('add');
    expect(resolveIconAlias('new')).toBe('add');
  });

  it('should pass through direct icon names unchanged', () => {
    expect(resolveIconAlias('heart')).toBe('heart');
    expect(resolveIconAlias('user')).toBe('user');
    expect(resolveIconAlias('calendar')).toBe('calendar');
  });

  it('should resolve kebab-case aliases', () => {
    expect(resolveIconAlias('arrow-left')).toBe('arrowLeft');
    expect(resolveIconAlias('arrow-right')).toBe('arrowRight');
    expect(resolveIconAlias('chevron-left')).toBe('chevronLeft');
    expect(resolveIconAlias('external-link')).toBe('externalLink');
  });

  it('should resolve user aliases', () => {
    expect(resolveIconAlias('person')).toBe('user');
    expect(resolveIconAlias('account')).toBe('user');
    expect(resolveIconAlias('profile')).toBe('user');
  });

  it('should resolve settings aliases', () => {
    expect(resolveIconAlias('gear')).toBe('settings');
    expect(resolveIconAlias('config')).toBe('settings');
    expect(resolveIconAlias('preferences')).toBe('settings');
  });

  it('should resolve AI aliases', () => {
    expect(resolveIconAlias('ai')).toBe('brain');
    expect(resolveIconAlias('intelligence')).toBe('brain');
  });

  it('should throw TypeError for non-string input', () => {
    expect(() => resolveIconAlias(null as any)).toThrow(TypeError);
    expect(() => resolveIconAlias(undefined as any)).toThrow(TypeError);
    expect(() => resolveIconAlias(123 as any)).toThrow(TypeError);
  });
});

describe('getIconAliases', () => {
  it('should return array of aliases for a known icon', () => {
    const aliases = getIconAliases('arrowLeft');
    expect(aliases).toBeInstanceOf(Array);
    expect(aliases.length).toBeGreaterThan(0);
    expect(aliases).toContain('back');
    expect(aliases).toContain('prev');
    expect(aliases).toContain('previous');
    expect(aliases).toContain('arrow-left');
  });

  it('should return array of aliases for x icon', () => {
    const aliases = getIconAliases('x');
    expect(aliases).toContain('close');
    expect(aliases).toContain('cancel');
  });

  it('should return array of aliases for search icon', () => {
    const aliases = getIconAliases('search');
    expect(aliases).toContain('magnify');
    expect(aliases).toContain('lookup');
  });

  it('should return array of aliases for user icon', () => {
    const aliases = getIconAliases('user');
    expect(aliases).toContain('person');
    expect(aliases).toContain('account');
    expect(aliases).toContain('profile');
  });

  it('should return empty array for unknown icon', () => {
    expect(getIconAliases('unknownIcon123')).toEqual([]);
    expect(getIconAliases('nonExistent')).toEqual([]);
  });

  it('should return empty array for icons without aliases', () => {
    // Some icons might exist in the system but have no aliases
    const aliases = getIconAliases('someDirectIconName');
    expect(aliases).toEqual([]);
  });

  it('should throw TypeError for non-string input', () => {
    expect(() => getIconAliases(null as any)).toThrow(TypeError);
    expect(() => getIconAliases(undefined as any)).toThrow(TypeError);
    expect(() => getIconAliases(123 as any)).toThrow(TypeError);
  });
});

describe('ICON_ALIASES', () => {
  it('should be a non-empty object', () => {
    expect(ICON_ALIASES).toBeDefined();
    expect(typeof ICON_ALIASES).toBe('object');
    expect(Object.keys(ICON_ALIASES).length).toBeGreaterThan(0);
  });

  it('should contain expected navigation aliases', () => {
    expect(ICON_ALIASES['back']).toBe('arrowLeft');
    expect(ICON_ALIASES['next']).toBe('arrowRight');
  });

  it('should contain expected close aliases', () => {
    expect(ICON_ALIASES['close']).toBe('x');
    expect(ICON_ALIASES['cancel']).toBe('x');
  });

  it('should contain kebab-case to camelCase mappings', () => {
    expect(ICON_ALIASES['arrow-left']).toBe('arrowLeft');
    expect(ICON_ALIASES['chevron-left']).toBe('chevronLeft');
    expect(ICON_ALIASES['external-link']).toBe('externalLink');
  });

  it('should have all values as strings', () => {
    Object.values(ICON_ALIASES).forEach(value => {
      expect(typeof value).toBe('string');
    });
  });

  it('should have all keys as strings', () => {
    Object.keys(ICON_ALIASES).forEach(key => {
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });
  });
});
