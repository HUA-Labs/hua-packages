import { describe, it, expect } from 'vitest';
import {
  adaptNative,
  toNumeric,
  parseTransformString,
  parseBoxShadow,
} from '../../adapters/native';

// ---------------------------------------------------------------------------
// toNumeric helper
// ---------------------------------------------------------------------------
describe('toNumeric', () => {
  it('strips px and returns number', () => {
    expect(toNumeric('16px')).toBe(16);
    expect(toNumeric('0px')).toBe(0);
    expect(toNumeric('1.5px')).toBe(1.5);
  });

  it('handles negative px', () => {
    expect(toNumeric('-16px')).toBe(-16);
    expect(toNumeric('-0.5px')).toBe(-0.5);
  });

  it('converts rem to pixels (×16)', () => {
    expect(toNumeric('1rem')).toBe(16);
    expect(toNumeric('0.875rem')).toBe(14);
    expect(toNumeric('1.5rem')).toBe(24);
  });

  it('converts em to pixels (×16)', () => {
    expect(toNumeric('1em')).toBe(16);
    expect(toNumeric('0.025em')).toBeCloseTo(0.4);
  });

  it('preserves percentage strings', () => {
    expect(toNumeric('50%')).toBe('50%');
    expect(toNumeric('100%')).toBe('100%');
  });

  it('preserves keywords', () => {
    expect(toNumeric('auto')).toBe('auto');
    expect(toNumeric('none')).toBe('none');
  });

  it('returns undefined for viewport units', () => {
    expect(toNumeric('100vh')).toBeUndefined();
    expect(toNumeric('100vw')).toBeUndefined();
    expect(toNumeric('100dvh')).toBeUndefined();
    expect(toNumeric('100dvw')).toBeUndefined();
  });

  it('passes through number values', () => {
    expect(toNumeric(16)).toBe(16);
    expect(toNumeric(0)).toBe(0);
  });

  it('parses pure number strings', () => {
    expect(toNumeric('16')).toBe(16);
    expect(toNumeric('0')).toBe(0);
    expect(toNumeric('1.25')).toBe(1.25);
  });
});

// ---------------------------------------------------------------------------
// parseTransformString
// ---------------------------------------------------------------------------
describe('parseTransformString', () => {
  it('parses single rotate', () => {
    expect(parseTransformString('rotate(45deg)')).toEqual([
      { rotate: '45deg' },
    ]);
  });

  it('parses single scale', () => {
    expect(parseTransformString('scale(1.1)')).toEqual([{ scale: 1.1 }]);
  });

  it('parses scaleX and scaleY', () => {
    expect(parseTransformString('scaleX(0.75)')).toEqual([{ scaleX: 0.75 }]);
    expect(parseTransformString('scaleY(1.25)')).toEqual([{ scaleY: 1.25 }]);
  });

  it('parses translateX with px', () => {
    expect(parseTransformString('translateX(16px)')).toEqual([
      { translateX: 16 },
    ]);
  });

  it('parses translateY with px', () => {
    expect(parseTransformString('translateY(-32px)')).toEqual([
      { translateY: -32 },
    ]);
  });

  it('parses skew (keeps string)', () => {
    expect(parseTransformString('skewX(6deg)')).toEqual([
      { skewX: '6deg' },
    ]);
    expect(parseTransformString('skewY(12deg)')).toEqual([
      { skewY: '12deg' },
    ]);
  });

  it('parses compound transform', () => {
    expect(
      parseTransformString('rotate(45deg) scale(1.1) translateX(16px)'),
    ).toEqual([
      { rotate: '45deg' },
      { scale: 1.1 },
      { translateX: 16 },
    ]);
  });

  it('handles negative rotate', () => {
    expect(parseTransformString('rotate(-45deg)')).toEqual([
      { rotate: '-45deg' },
    ]);
  });

  it('handles scale(0)', () => {
    expect(parseTransformString('scale(0)')).toEqual([{ scale: 0 }]);
  });

  it('returns empty array for empty string', () => {
    expect(parseTransformString('')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// parseBoxShadow
// ---------------------------------------------------------------------------
describe('parseBoxShadow', () => {
  it('parses shadow-sm', () => {
    const result = parseBoxShadow('0 1px 2px 0 rgb(0 0 0 / 0.05)');
    expect(result.shadowColor).toBe('#000000');
    expect(result.shadowOpacity).toBe(0.05);
    expect(result.shadowOffset).toEqual({ width: 0, height: 1 });
    expect(result.shadowRadius).toBe(1); // 2/2
    expect(result.elevation).toBeLessThanOrEqual(24);
  });

  it('parses shadow-lg (multi-layer, uses first)', () => {
    const result = parseBoxShadow(
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    );
    expect(result.shadowColor).toBe('#000000');
    expect(result.shadowOpacity).toBe(0.1);
    expect(result.shadowOffset).toEqual({ width: 0, height: 10 });
    expect(result.shadowRadius).toBe(7.5); // 15/2
  });

  it('parses shadow-2xl', () => {
    const result = parseBoxShadow('0 25px 50px -12px rgb(0 0 0 / 0.25)');
    expect(result.shadowColor).toBe('#000000');
    expect(result.shadowOpacity).toBe(0.25);
    expect(result.shadowOffset).toEqual({ width: 0, height: 25 });
  });

  it('returns empty for none', () => {
    expect(parseBoxShadow('none')).toEqual({});
  });

  it('returns empty for empty string', () => {
    expect(parseBoxShadow('')).toEqual({});
  });

  it('skips inset shadows', () => {
    expect(
      parseBoxShadow('inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'),
    ).toEqual({});
  });

  it('caps elevation at 24', () => {
    // Very large blur
    const result = parseBoxShadow('0 25px 50px -12px rgb(0 0 0 / 0.25)');
    expect(result.elevation).toBeLessThanOrEqual(24);
  });
});

// ---------------------------------------------------------------------------
// adaptNative — SKIP properties
// ---------------------------------------------------------------------------
describe('adaptNative — skip unsupported', () => {
  it('removes animation properties', () => {
    const result = adaptNative({
      animationName: 'fadeIn',
      animationDuration: '300ms',
      animationTimingFunction: 'ease-in-out',
      padding: '16px',
    });
    expect(result).not.toHaveProperty('animationName');
    expect(result).not.toHaveProperty('animationDuration');
    expect(result).not.toHaveProperty('animationTimingFunction');
    expect(result).toHaveProperty('padding', 16);
  });

  it('removes transition properties', () => {
    const result = adaptNative({
      transitionProperty: 'all',
      transitionDuration: '300ms',
      transitionTimingFunction: 'ease',
    });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('removes backdrop filter', () => {
    const result = adaptNative({ backdropFilter: 'blur(8px)' });
    expect(result).not.toHaveProperty('backdropFilter');
  });

  it('removes grid properties', () => {
    const result = adaptNative({
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'auto',
    });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('removes cursor', () => {
    const result = adaptNative({ cursor: 'pointer' });
    expect(result).not.toHaveProperty('cursor');
  });
});

// ---------------------------------------------------------------------------
// adaptNative — NUMERIC properties
// ---------------------------------------------------------------------------
describe('adaptNative — numeric (px→number)', () => {
  it('converts padding px to number', () => {
    expect(adaptNative({ padding: '16px' })).toEqual({ padding: 16 });
  });

  it('converts directional padding', () => {
    expect(
      adaptNative({
        paddingTop: '8px',
        paddingRight: '16px',
        paddingBottom: '8px',
        paddingLeft: '16px',
      }),
    ).toEqual({
      paddingTop: 8,
      paddingRight: 16,
      paddingBottom: 8,
      paddingLeft: 16,
    });
  });

  it('converts margin with negative values', () => {
    expect(adaptNative({ marginTop: '-16px' })).toEqual({ marginTop: -16 });
  });

  it('preserves percentage values', () => {
    expect(adaptNative({ width: '50%' })).toEqual({ width: '50%' });
    expect(adaptNative({ width: '100%' })).toEqual({ width: '100%' });
  });

  it('preserves auto keyword', () => {
    expect(adaptNative({ marginLeft: 'auto' })).toEqual({
      marginLeft: 'auto',
    });
  });

  it('skips viewport units', () => {
    const result = adaptNative({ height: '100vh', width: '100vw' });
    expect(result).not.toHaveProperty('height');
    expect(result).not.toHaveProperty('width');
  });

  it('converts border-radius', () => {
    expect(adaptNative({ borderRadius: '8px' })).toEqual({
      borderRadius: 8,
    });
  });

  it('converts border-width', () => {
    expect(adaptNative({ borderWidth: '1px' })).toEqual({ borderWidth: 1 });
  });

  it('converts positioning values', () => {
    expect(
      adaptNative({ top: '0px', right: '16px', bottom: '0px', left: '16px' }),
    ).toEqual({ top: 0, right: 16, bottom: 0, left: 16 });
  });

  it('converts fontSize', () => {
    expect(adaptNative({ fontSize: '14px' })).toEqual({ fontSize: 14 });
  });

  it('converts lineHeight number string', () => {
    expect(adaptNative({ lineHeight: '1.25' })).toEqual({ lineHeight: 1.25 });
  });

  it('converts letterSpacing em to px', () => {
    expect(adaptNative({ letterSpacing: '0.025em' })).toEqual({
      letterSpacing: 0.4,
    });
  });

  it('converts gap', () => {
    expect(adaptNative({ gap: '8px' })).toEqual({ gap: 8 });
    expect(adaptNative({ rowGap: '16px', columnGap: '8px' })).toEqual({
      rowGap: 16,
      columnGap: 8,
    });
  });

  it('converts sizing values', () => {
    expect(
      adaptNative({ width: '48px', height: '48px', minWidth: '24px', maxHeight: '200px' }),
    ).toEqual({ width: 48, height: 48, minWidth: 24, maxHeight: 200 });
  });

  it('converts rem values', () => {
    expect(adaptNative({ fontSize: '0.875rem' })).toEqual({ fontSize: 14 });
  });
});

// ---------------------------------------------------------------------------
// adaptNative — FLOAT properties
// ---------------------------------------------------------------------------
describe('adaptNative — float', () => {
  it('converts opacity string to number', () => {
    expect(adaptNative({ opacity: '0.5' })).toEqual({ opacity: 0.5 });
  });

  it('converts flexGrow/flexShrink', () => {
    expect(adaptNative({ flexGrow: '1', flexShrink: '0' })).toEqual({
      flexGrow: 1,
      flexShrink: 0,
    });
  });
});

// ---------------------------------------------------------------------------
// adaptNative — INTEGER properties
// ---------------------------------------------------------------------------
describe('adaptNative — integer', () => {
  it('converts zIndex string to number', () => {
    expect(adaptNative({ zIndex: '10' })).toEqual({ zIndex: 10 });
    expect(adaptNative({ zIndex: '50' })).toEqual({ zIndex: 50 });
  });
});

// ---------------------------------------------------------------------------
// adaptNative — DISPLAY filter
// ---------------------------------------------------------------------------
describe('adaptNative — display', () => {
  it('keeps flex', () => {
    expect(adaptNative({ display: 'flex' })).toEqual({ display: 'flex' });
  });

  it('keeps none', () => {
    expect(adaptNative({ display: 'none' })).toEqual({ display: 'none' });
  });

  it('drops block', () => {
    const result = adaptNative({ display: 'block' });
    expect(result).not.toHaveProperty('display');
  });

  it('drops inline', () => {
    const result = adaptNative({ display: 'inline' });
    expect(result).not.toHaveProperty('display');
  });

  it('drops grid', () => {
    const result = adaptNative({ display: 'grid' });
    expect(result).not.toHaveProperty('display');
  });
});

// ---------------------------------------------------------------------------
// adaptNative — TRANSFORM
// ---------------------------------------------------------------------------
describe('adaptNative — transform', () => {
  it('converts single rotate', () => {
    expect(adaptNative({ transform: 'rotate(45deg)' })).toEqual({
      transform: [{ rotate: '45deg' }],
    });
  });

  it('converts single scale', () => {
    expect(adaptNative({ transform: 'scale(1.1)' })).toEqual({
      transform: [{ scale: 1.1 }],
    });
  });

  it('converts compound transforms', () => {
    expect(
      adaptNative({
        transform: 'rotate(45deg) scale(1.1) translateX(16px)',
      }),
    ).toEqual({
      transform: [
        { rotate: '45deg' },
        { scale: 1.1 },
        { translateX: 16 },
      ],
    });
  });

  it('converts negative translate', () => {
    expect(adaptNative({ transform: 'translateY(-32px)' })).toEqual({
      transform: [{ translateY: -32 }],
    });
  });
});

// ---------------------------------------------------------------------------
// adaptNative — SHADOW
// ---------------------------------------------------------------------------
describe('adaptNative — box shadow', () => {
  it('converts shadow-sm to RN shadow props', () => {
    const result = adaptNative({
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    });
    expect(result.shadowColor).toBe('#000000');
    expect(result.shadowOpacity).toBe(0.05);
    expect(result.shadowOffset).toEqual({ width: 0, height: 1 });
    expect(result.shadowRadius).toBe(1);
    expect(result.elevation).toBeDefined();
    expect(result).not.toHaveProperty('boxShadow');
  });

  it('handles shadow-none', () => {
    const result = adaptNative({ boxShadow: 'none' });
    expect(result).not.toHaveProperty('boxShadow');
    expect(result).not.toHaveProperty('shadowColor');
  });

  it('handles inset shadow (skipped)', () => {
    const result = adaptNative({
      boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    });
    expect(Object.keys(result)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// adaptNative — FLEX shorthand
// ---------------------------------------------------------------------------
describe('adaptNative — flex shorthand', () => {
  it('converts flex: "1" to number', () => {
    expect(adaptNative({ flex: '1' })).toEqual({ flex: 1 });
  });

  it('converts flex: "1 1 0%" to 1', () => {
    expect(adaptNative({ flex: '1 1 0%' })).toEqual({ flex: 1 });
  });

  it('converts flex: "none" to grow 0 shrink 0', () => {
    expect(adaptNative({ flex: 'none' })).toEqual({
      flexGrow: 0,
      flexShrink: 0,
    });
  });
});

// ---------------------------------------------------------------------------
// adaptNative — PASSTHROUGH
// ---------------------------------------------------------------------------
describe('adaptNative — passthrough', () => {
  it('passes color values through', () => {
    expect(
      adaptNative({
        color: '#ffffff',
        backgroundColor: '#3b82f6',
        borderColor: '#d1d5db',
      }),
    ).toEqual({
      color: '#ffffff',
      backgroundColor: '#3b82f6',
      borderColor: '#d1d5db',
    });
  });

  it('passes flexbox properties through', () => {
    expect(
      adaptNative({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }),
    ).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    });
  });

  it('passes position through', () => {
    expect(adaptNative({ position: 'absolute' })).toEqual({
      position: 'absolute',
    });
  });

  it('passes fontWeight as string', () => {
    expect(adaptNative({ fontWeight: '700' })).toEqual({
      fontWeight: '700',
    });
  });

  it('passes textAlign through', () => {
    expect(adaptNative({ textAlign: 'center' })).toEqual({
      textAlign: 'center',
    });
  });

  it('passes borderStyle through', () => {
    expect(adaptNative({ borderStyle: 'solid' })).toEqual({
      borderStyle: 'solid',
    });
  });

  it('passes overflow through', () => {
    expect(adaptNative({ overflow: 'hidden' })).toEqual({
      overflow: 'hidden',
    });
  });
});

// ---------------------------------------------------------------------------
// adaptNative — combined real-world scenarios
// ---------------------------------------------------------------------------
describe('adaptNative — combined', () => {
  it('converts a typical card style', () => {
    const result = adaptNative({
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    });
    expect(result.padding).toBe(16);
    expect(result.borderRadius).toBe(8);
    expect(result.backgroundColor).toBe('#ffffff');
    expect(result.shadowColor).toBe('#000000');
    expect(result).not.toHaveProperty('boxShadow');
  });

  it('converts a flex container with positioning', () => {
    const result = adaptNative({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '8px',
      padding: '16px',
      position: 'relative',
    });
    expect(result).toEqual({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 16,
      position: 'relative',
    });
  });

  it('strips unsupported and converts supported in mixed input', () => {
    const result = adaptNative({
      padding: '16px',
      transitionProperty: 'all',
      transitionDuration: '300ms',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    });
    expect(result).toEqual({
      padding: 16,
      backgroundColor: '#ffffff',
    });
  });
});
