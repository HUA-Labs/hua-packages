import { describe, it, expect } from 'vitest';
import {
  SPRING_CONFIGS,
  EASING_FUNCTIONS,
  DURATIONS,
  HUA_DEFAULT_MOTION,
  COMPONENT_MOTION_DEFAULTS,
  CSS_MOTION_VARS
} from '../motion/presets';

describe('SPRING_CONFIGS', () => {
  it('should have all 5 presets', () => {
    expect(Object.keys(SPRING_CONFIGS)).toEqual([
      'subtle',
      'soft',
      'springy',
      'bouncy',
      'snappy'
    ]);
  });

  it('should have valid spring values for each preset', () => {
    Object.values(SPRING_CONFIGS).forEach(config => {
      expect(config.stiffness).toBeGreaterThan(0);
      expect(config.damping).toBeGreaterThan(0);
      expect(config.mass).toBeGreaterThan(0);
    });
  });

  it('should have stiffness, damping, and mass properties', () => {
    Object.values(SPRING_CONFIGS).forEach(config => {
      expect(config).toHaveProperty('stiffness');
      expect(config).toHaveProperty('damping');
      expect(config).toHaveProperty('mass');
    });
  });

  it('should have numeric values', () => {
    Object.values(SPRING_CONFIGS).forEach(config => {
      expect(typeof config.stiffness).toBe('number');
      expect(typeof config.damping).toBe('number');
      expect(typeof config.mass).toBe('number');
    });
  });

  it('should have specific preset configurations', () => {
    expect(SPRING_CONFIGS.subtle).toEqual({
      stiffness: 400,
      damping: 30,
      mass: 1
    });

    expect(SPRING_CONFIGS.springy).toEqual({
      stiffness: 350,
      damping: 20,
      mass: 0.8
    });
  });
});

describe('EASING_FUNCTIONS', () => {
  it('should have all 5 presets', () => {
    expect(Object.keys(EASING_FUNCTIONS)).toEqual([
      'subtle',
      'soft',
      'springy',
      'bouncy',
      'snappy'
    ]);
  });

  it('should have valid cubic-bezier strings', () => {
    Object.values(EASING_FUNCTIONS).forEach(easing => {
      expect(easing).toMatch(/^cubic-bezier\([\d.\-\s,]+\)$/);
    });
  });

  it('should be valid CSS easing functions', () => {
    Object.values(EASING_FUNCTIONS).forEach(easing => {
      expect(typeof easing).toBe('string');
      expect(easing.startsWith('cubic-bezier(')).toBe(true);
      expect(easing.endsWith(')')).toBe(true);
    });
  });

  it('should have specific easing values', () => {
    expect(EASING_FUNCTIONS.subtle).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)');
    expect(EASING_FUNCTIONS.soft).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
    expect(EASING_FUNCTIONS.springy).toBe('cubic-bezier(0.34, 1.56, 0.64, 1)');
  });
});

describe('DURATIONS', () => {
  it('should have all 5 presets', () => {
    expect(Object.keys(DURATIONS)).toEqual([
      'subtle',
      'soft',
      'springy',
      'bouncy',
      'snappy'
    ]);
  });

  it('should have positive duration values', () => {
    Object.values(DURATIONS).forEach(duration => {
      expect(duration).toBeGreaterThan(0);
      expect(typeof duration).toBe('number');
    });
  });

  it('should have reasonable duration ranges', () => {
    Object.values(DURATIONS).forEach(duration => {
      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThanOrEqual(500);
    });
  });

  it('should have specific duration values', () => {
    expect(DURATIONS.subtle).toBe(150);
    expect(DURATIONS.soft).toBe(250);
    expect(DURATIONS.springy).toBe(300);
    expect(DURATIONS.bouncy).toBe(400);
    expect(DURATIONS.snappy).toBe(180);
  });
});

describe('HUA_DEFAULT_MOTION', () => {
  it('should have all required properties', () => {
    expect(HUA_DEFAULT_MOTION).toHaveProperty('preset');
    expect(HUA_DEFAULT_MOTION).toHaveProperty('duration');
    expect(HUA_DEFAULT_MOTION).toHaveProperty('scale');
    expect(HUA_DEFAULT_MOTION).toHaveProperty('translateY');
  });

  it('should have valid preset value', () => {
    expect(['subtle', 'soft', 'springy', 'bouncy', 'snappy']).toContain(HUA_DEFAULT_MOTION.preset);
  });

  it('should have positive duration', () => {
    expect(HUA_DEFAULT_MOTION.duration).toBeGreaterThan(0);
  });

  it('should have specific default values', () => {
    expect(HUA_DEFAULT_MOTION.preset).toBe('springy');
    expect(HUA_DEFAULT_MOTION.duration).toBe(180);
    expect(HUA_DEFAULT_MOTION.scale).toBe(0.008);
    expect(HUA_DEFAULT_MOTION.translateY).toBe(-0.5);
  });
});

describe('COMPONENT_MOTION_DEFAULTS', () => {
  it('should have motion defaults for common components', () => {
    expect(COMPONENT_MOTION_DEFAULTS).toHaveProperty('button');
    expect(COMPONENT_MOTION_DEFAULTS).toHaveProperty('card');
    expect(COMPONENT_MOTION_DEFAULTS).toHaveProperty('menuItem');
    expect(COMPONENT_MOTION_DEFAULTS).toHaveProperty('modal');
    expect(COMPONENT_MOTION_DEFAULTS).toHaveProperty('dropdown');
    expect(COMPONENT_MOTION_DEFAULTS).toHaveProperty('tooltip');
    expect(COMPONENT_MOTION_DEFAULTS).toHaveProperty('checkbox');
    expect(COMPONENT_MOTION_DEFAULTS).toHaveProperty('switch');
  });

  it('should have valid preset for each component', () => {
    Object.values(COMPONENT_MOTION_DEFAULTS).forEach(config => {
      expect(['subtle', 'soft', 'springy', 'bouncy', 'snappy']).toContain(config.preset);
    });
  });

  it('should have positive duration for each component', () => {
    Object.values(COMPONENT_MOTION_DEFAULTS).forEach(config => {
      expect(config.duration).toBeGreaterThan(0);
    });
  });

  it('should have button defaults', () => {
    expect(COMPONENT_MOTION_DEFAULTS.button).toEqual({
      preset: 'springy',
      duration: 180,
      scale: 0.008,
      translateY: -0.5
    });
  });

  it('should have card defaults', () => {
    expect(COMPONENT_MOTION_DEFAULTS.card).toEqual({
      preset: 'soft',
      duration: 220,
      scale: 0.005,
      translateY: -1
    });
  });

  it('should have different presets for different components', () => {
    // Verify that different components can have different presets
    expect(COMPONENT_MOTION_DEFAULTS.button.preset).toBe('springy');
    expect(COMPONENT_MOTION_DEFAULTS.card.preset).toBe('soft');
    expect(COMPONENT_MOTION_DEFAULTS.menuItem.preset).toBe('subtle');
    expect(COMPONENT_MOTION_DEFAULTS.tooltip.preset).toBe('snappy');
  });
});

describe('CSS_MOTION_VARS', () => {
  it('should have CSS variable format keys', () => {
    Object.keys(CSS_MOTION_VARS).forEach(key => {
      expect(key.startsWith('--')).toBe(true);
    });
  });

  it('should have all required CSS variables', () => {
    expect(CSS_MOTION_VARS).toHaveProperty('--hua-motion-duration');
    expect(CSS_MOTION_VARS).toHaveProperty('--hua-motion-easing');
    expect(CSS_MOTION_VARS).toHaveProperty('--hua-motion-scale-hover');
    expect(CSS_MOTION_VARS).toHaveProperty('--hua-motion-scale-active');
    expect(CSS_MOTION_VARS).toHaveProperty('--hua-motion-translate-y');
  });

  it('should have valid CSS values', () => {
    expect(CSS_MOTION_VARS['--hua-motion-duration']).toMatch(/^\d+ms$/);
    expect(CSS_MOTION_VARS['--hua-motion-easing']).toMatch(/^cubic-bezier\(/);
    expect(CSS_MOTION_VARS['--hua-motion-scale-hover']).toMatch(/^[\d.]+$/);
    expect(CSS_MOTION_VARS['--hua-motion-scale-active']).toMatch(/^[\d.]+$/);
    expect(CSS_MOTION_VARS['--hua-motion-translate-y']).toMatch(/^-?[\d.]+px$/);
  });

  it('should have specific CSS values', () => {
    expect(CSS_MOTION_VARS['--hua-motion-duration']).toBe('180ms');
    expect(CSS_MOTION_VARS['--hua-motion-easing']).toBe(EASING_FUNCTIONS.springy);
    expect(CSS_MOTION_VARS['--hua-motion-scale-hover']).toBe('1.008');
    expect(CSS_MOTION_VARS['--hua-motion-scale-active']).toBe('0.992');
    expect(CSS_MOTION_VARS['--hua-motion-translate-y']).toBe('-0.5px');
  });
});
