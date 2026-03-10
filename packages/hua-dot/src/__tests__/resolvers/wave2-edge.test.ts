import { describe, it, expect, beforeEach } from 'vitest';
import { dot, dotExplain } from '../../index';
import { dot as dotNative } from '../../native';
import { adaptNative, _resetNativeWarnings } from '../../adapters/native';
import { getCapability } from '../../capabilities';

// ---------------------------------------------------------------------------
// Edge cases & negative tests for Wave 2 tokens
// ---------------------------------------------------------------------------

describe('Wave 2: negative / unknown token handling', () => {
  it('returns empty for unknown object-fit values', () => {
    expect(dot('object-invalid')).toEqual({});
  });

  it('returns empty for unknown basis values', () => {
    expect(dot('basis-unknown')).toEqual({});
  });

  it('returns empty for unknown decoration values', () => {
    expect(dot('decoration-invalid')).toEqual({});
  });

  it('returns empty for unknown underline-offset values', () => {
    expect(dot('underline-offset-invalid')).toEqual({});
  });

  it('returns empty for unknown indent values', () => {
    expect(dot('indent-unknown')).toEqual({});
  });

  it('returns empty for unknown scroll spacing values', () => {
    expect(dot('scroll-m-unknown')).toEqual({});
  });

  it('returns empty for unknown list values', () => {
    expect(dot('list-invalid')).toEqual({});
  });

  it('returns empty for unknown table values', () => {
    expect(dot('table-invalid')).toEqual({});
  });

  it('returns empty for unknown place values', () => {
    expect(dot('place-content-invalid')).toEqual({});
  });
});

describe('Wave 2: boundary / zero values', () => {
  it('handles basis-0', () => {
    expect(dot('basis-0')).toEqual({ flexBasis: '0px' });
  });

  it('handles scroll-m-0', () => {
    expect(dot('scroll-m-0')).toEqual({
      scrollMarginTop: '0px',
      scrollMarginRight: '0px',
      scrollMarginBottom: '0px',
      scrollMarginLeft: '0px',
    });
  });

  it('handles decoration-0 (zero thickness)', () => {
    expect(dot('decoration-0')).toEqual({ textDecorationThickness: '0px' });
  });

  it('handles indent-0', () => {
    expect(dot('indent-0')).toEqual({ textIndent: '0px' });
  });

  it('handles underline-offset-0', () => {
    expect(dot('underline-offset-0')).toEqual({ textUnderlineOffset: '0px' });
  });
});

describe('Wave 2: token combinations', () => {
  it('combines object-fit with sizing', () => {
    expect(dot('object-cover w-full h-full')).toEqual({
      objectFit: 'cover',
      width: '100%',
      height: '100%',
    });
  });

  it('combines basis with flex', () => {
    expect(dot('basis-1/2 flex-1')).toEqual({
      flexBasis: '50%',
      flex: '1 1 0%',
    });
  });

  it('combines decoration style with thickness', () => {
    expect(dot('decoration-wavy decoration-2')).toEqual({
      textDecorationStyle: 'wavy',
      textDecorationThickness: '2px',
    });
  });

  it('combines float with width', () => {
    expect(dot('float-left w-1/2')).toEqual({
      float: 'left',
      width: '50%',
    });
  });

  it('combines scroll margin and padding', () => {
    expect(dot('scroll-mt-4 scroll-pb-2')).toEqual({
      scrollMarginTop: '16px',
      scrollPaddingBottom: '8px',
    });
  });

  it('combines table properties', () => {
    expect(dot('table-fixed border-collapse')).toEqual({
      tableLayout: 'fixed',
      borderCollapse: 'collapse',
    });
  });

  it('combines list style type and position', () => {
    expect(dot('list-disc list-inside')).toEqual({
      listStyleType: 'disc',
      listStylePosition: 'inside',
    });
  });

  it('combines multiple touch/interaction', () => {
    expect(dot('touch-none will-change-transform')).toEqual({
      touchAction: 'none',
      willChange: 'transform',
    });
  });
});

describe('Wave 2: native adapter drops web-only properties', () => {
  beforeEach(() => {
    _resetNativeWarnings();
  });

  it('drops float/clear/isolation', () => {
    const result = adaptNative({
      float: 'left',
      clear: 'both',
      isolation: 'isolate',
      backgroundColor: '#fff',
    });
    expect(result).toEqual({ backgroundColor: '#fff' });
    expect(result).not.toHaveProperty('float');
    expect(result).not.toHaveProperty('clear');
    expect(result).not.toHaveProperty('isolation');
  });

  it('drops table/list properties', () => {
    const result = adaptNative({
      tableLayout: 'fixed',
      borderCollapse: 'collapse',
      captionSide: 'top',
      listStyleType: 'disc',
      listStylePosition: 'inside',
      color: 'black',
    });
    expect(result).toEqual({ color: 'black' });
  });

  it('drops scroll-related properties', () => {
    const result = adaptNative({
      scrollBehavior: 'smooth',
      scrollMarginTop: '16px',
      scrollPaddingBottom: '8px',
      padding: '16px',
    });
    expect(result).toEqual({ padding: 16 });
  });

  it('drops willChange and touchAction', () => {
    const result = adaptNative({
      willChange: 'transform',
      touchAction: 'none',
      opacity: '0.5',
    });
    expect(result).toEqual({ opacity: 0.5 });
  });

  it('drops textIndent and textDecorationThickness', () => {
    const result = adaptNative({
      textIndent: '16px',
      textDecorationThickness: '2px',
      textUnderlineOffset: '4px',
      color: 'red',
    });
    expect(result).toEqual({ color: 'red' });
  });

  it('drops place-* properties', () => {
    const result = adaptNative({
      placeContent: 'center',
      placeItems: 'stretch',
      placeSelf: 'auto',
      flexDirection: 'row',
    });
    expect(result).toEqual({ flexDirection: 'row' });
  });

  it('drops objectPosition but not objectFit', () => {
    const result = adaptNative({
      objectFit: 'cover',
      objectPosition: 'center',
    });
    expect(result).toEqual({ resizeMode: 'cover' });
    expect(result).not.toHaveProperty('objectFit');
    expect(result).not.toHaveProperty('objectPosition');
  });

  it('drops wordBreak and overflowWrap', () => {
    const result = adaptNative({
      wordBreak: 'break-all',
      overflowWrap: 'break-word',
      fontSize: '16px',
    });
    expect(result).toEqual({ fontSize: 16 });
  });
});

describe('Wave 2: native objectFit → resizeMode mapping', () => {
  it('maps contain → contain', () => {
    expect(adaptNative({ objectFit: 'contain' })).toEqual({ resizeMode: 'contain' });
  });

  it('maps cover → cover', () => {
    expect(adaptNative({ objectFit: 'cover' })).toEqual({ resizeMode: 'cover' });
  });

  it('maps fill → stretch', () => {
    expect(adaptNative({ objectFit: 'fill' })).toEqual({ resizeMode: 'stretch' });
  });

  it('maps none → center', () => {
    expect(adaptNative({ objectFit: 'none' })).toEqual({ resizeMode: 'center' });
  });

  it('maps scale-down → contain', () => {
    expect(adaptNative({ objectFit: 'scale-down' })).toEqual({ resizeMode: 'contain' });
  });

  it('ignores unknown objectFit values', () => {
    expect(adaptNative({ objectFit: 'invalid' })).toEqual({});
  });
});

describe('Wave 2: native flexBasis numeric conversion', () => {
  it('converts px flexBasis to number', () => {
    expect(adaptNative({ flexBasis: '16px' })).toEqual({ flexBasis: 16 });
  });

  it('preserves percentage flexBasis as string', () => {
    expect(adaptNative({ flexBasis: '50%' })).toEqual({ flexBasis: '50%' });
  });

  it('preserves auto flexBasis', () => {
    expect(adaptNative({ flexBasis: 'auto' })).toEqual({ flexBasis: 'auto' });
  });
});

describe('Wave 2: native passthrough for new RN-supported props', () => {
  it('passes through backfaceVisibility', () => {
    expect(adaptNative({ backfaceVisibility: 'hidden' })).toEqual({
      backfaceVisibility: 'hidden',
    });
  });

  it('passes through textAlignVertical', () => {
    expect(adaptNative({ textAlignVertical: 'center' })).toEqual({
      textAlignVertical: 'center',
    });
  });

  it('passes through textDecorationStyle (RN supports it)', () => {
    expect(adaptNative({ textDecorationStyle: 'dashed' })).toEqual({
      textDecorationStyle: 'dashed',
    });
  });
});

describe('Wave 2: native target integration (dot → adaptNative)', () => {
  it('object-cover resolves and maps to resizeMode on native', () => {
    const result = dotNative('object-cover');
    expect(result).toEqual({ resizeMode: 'cover' });
  });

  it('float-left is dropped on native target', () => {
    const result = dotNative('float-left');
    expect(result).toEqual({});
  });

  it('basis-4 converts to numeric on native', () => {
    const result = dotNative('basis-4');
    expect(result).toEqual({ flexBasis: 16 });
  });

  it('decoration-dashed passes through on native', () => {
    const result = dotNative('decoration-dashed');
    expect(result).toEqual({ textDecorationStyle: 'dashed' });
  });

  it('will-change-transform is dropped on native', () => {
    const result = dotNative('will-change-transform');
    expect(result).toEqual({});
  });

  it('scroll-m-4 is dropped on native', () => {
    const result = dotNative('scroll-m-4');
    expect(result).toEqual({});
  });

  it('table-fixed is dropped on native', () => {
    const result = dotNative('table-fixed');
    expect(result).toEqual({});
  });

  it('break-all is dropped on native (wordBreak unsupported)', () => {
    const result = dotNative('break-all');
    expect(result).toEqual({});
  });
});

describe('Wave 2: capabilities integration', () => {
  it('reports objectFit capability', () => {
    expect(getCapability('objectFit', 'web')).toBe('native');
    expect(getCapability('objectFit', 'native')).toBe('approximate');
    expect(getCapability('objectFit', 'flutter')).toBe('recipe-only');
  });

  it('reports float as unsupported on native', () => {
    expect(getCapability('float', 'web')).toBe('native');
    expect(getCapability('float', 'native')).toBe('unsupported');
  });

  it('reports scroll as unsupported on native', () => {
    expect(getCapability('scrollBehavior', 'native')).toBe('unsupported');
  });

  it('reports fine-grained capability for decoration/indent/place on native', () => {
    // textDecorationStyle IS supported on RN (PASSTHROUGH)
    expect(getCapability('textDecorationStyle', 'native')).toBe('native');
    // textDecorationThickness / textUnderlineOffset are NOT supported on RN
    expect(getCapability('textDecorationThickness', 'native')).toBe('unsupported');
    expect(getCapability('textUnderlineOffset', 'native')).toBe('unsupported');
    // textIndent not supported on RN
    expect(getCapability('textIndent', 'native')).toBe('unsupported');
    // place-* not supported on RN
    expect(getCapability('placeContent', 'native')).toBe('unsupported');
    expect(getCapability('placeItems', 'native')).toBe('unsupported');
    // isolation not supported on RN
    expect(getCapability('isolation', 'native')).toBe('unsupported');
  });

  it('reports fine-grained capability on flutter', () => {
    // textDecorationStyle NOT handled by flutter adapter
    expect(getCapability('textDecorationStyle', 'flutter')).toBe('unsupported');
    // place-* not handled by flutter adapter
    expect(getCapability('placeContent', 'flutter')).toBe('unsupported');
  });

  it('reports wordBreak as unsupported on native (no approximation implemented)', () => {
    expect(getCapability('wordBreak', 'native')).toBe('unsupported');
    expect(getCapability('overflowWrap', 'native')).toBe('unsupported');
  });

  it('reports display as approximate on native (only flex/none)', () => {
    expect(getCapability('display', 'native')).toBe('approximate');
  });

  it('reports visibility as unsupported on native', () => {
    expect(getCapability('visibility', 'native')).toBe('unsupported');
  });

  it('reports pointerEvents as native on native (supported in RN)', () => {
    expect(getCapability('pointerEvents', 'native')).toBe('native');
  });

  it('reports flexShrink as unsupported on flutter', () => {
    expect(getCapability('flexShrink', 'flutter')).toBe('unsupported');
  });

  it('reports alignSelf as unsupported on flutter', () => {
    expect(getCapability('alignSelf', 'flutter')).toBe('unsupported');
  });

  it('reports display as approximate on flutter (only flex/inline-flex)', () => {
    expect(getCapability('display', 'flutter')).toBe('approximate');
  });

  it('reports visibility as native on flutter (recipe.visible)', () => {
    expect(getCapability('visibility', 'flutter')).toBe('native');
  });
});

describe('Wave 2: dotExplain reports dropped props correctly', () => {
  it('reports isolation as dropped on native', () => {
    const result = dotExplain('isolate', { target: 'native' });
    expect(result.styles).toEqual({});
    expect(result.report._dropped).toContain('isolation');
  });

  it('reports placeContent as dropped on native', () => {
    const result = dotExplain('place-content-center', { target: 'native' });
    expect(result.styles).toEqual({});
    expect(result.report._dropped).toContain('placeContent');
  });

  it('reports textIndent as dropped on native', () => {
    const result = dotExplain('indent-4', { target: 'native' });
    expect(result.styles).toEqual({});
    expect(result.report._dropped).toContain('textIndent');
  });

  it('reports textDecorationThickness as dropped on native', () => {
    const result = dotExplain('decoration-2', { target: 'native' });
    expect(result.styles).toEqual({});
    expect(result.report._dropped).toContain('textDecorationThickness');
  });

  it('reports wordBreak as dropped on native, not approximated', () => {
    const result = dotExplain('break-all', { target: 'native' });
    expect(result.styles).toEqual({});
    expect(result.report._dropped).toContain('wordBreak');
    expect(result.report._approximated ?? []).not.toContain('wordBreak');
  });

  it('reports placeContent as dropped on flutter', () => {
    const result = dotExplain('place-content-center', { target: 'flutter' });
    expect(result.report._dropped).toContain('placeContent');
  });

  it('reports textDecorationStyle as dropped on flutter', () => {
    const result = dotExplain('decoration-dashed', { target: 'flutter' });
    expect(result.report._dropped).toContain('textDecorationStyle');
  });

  it('reports display:block as approximated on native (only flex/none work)', () => {
    const result = dotExplain('block', { target: 'native' });
    expect(result.styles).toEqual({});
    expect(result.report._approximated).toContain('display');
  });

  it('reports visibility as dropped on native', () => {
    const result = dotExplain('invisible', { target: 'native' });
    expect(result.styles).toEqual({});
    expect(result.report._dropped).toContain('visibility');
  });

  it('does NOT report pointerEvents as dropped on native (supported)', () => {
    const result = dotExplain('pointer-events-none', { target: 'native' });
    expect(result.styles).toEqual({ pointerEvents: 'none' });
    expect(result.report._dropped ?? []).not.toContain('pointerEvents');
  });

  it('reports flexShrink as dropped on flutter', () => {
    const result = dotExplain('shrink-0', { target: 'flutter' });
    expect(result.report._dropped).toContain('flexShrink');
  });

  it('reports alignSelf as dropped on flutter', () => {
    const result = dotExplain('self-center', { target: 'flutter' });
    expect(result.report._dropped).toContain('alignSelf');
  });

  it('does NOT report display:none as approximated on native (value-level override)', () => {
    const result = dotExplain('hidden', { target: 'native' });
    expect(result.styles).toEqual({ display: 'none' });
    expect(result.report._approximated ?? []).not.toContain('display');
  });

  it('does NOT report display:flex as approximated on native (value-level override)', () => {
    const result = dotExplain('flex', { target: 'native' });
    expect(result.styles).toEqual({ display: 'flex' });
    expect(result.report._approximated ?? []).not.toContain('display');
  });

  it('does NOT report display:flex as approximated on flutter (value-level override)', () => {
    const result = dotExplain('flex', { target: 'flutter' });
    expect(result.report._approximated ?? []).not.toContain('display');
  });

  it('does NOT report visibility as dropped on flutter (supported via recipe.visible)', () => {
    const result = dotExplain('invisible', { target: 'flutter' });
    expect(result.report._dropped ?? []).not.toContain('visibility');
  });

  it('reports display:inline-block as approximated on flutter', () => {
    const result = dotExplain('inline-block', { target: 'flutter' });
    expect(result.styles).toEqual({});
    expect(result.report._approximated).toContain('display');
  });

  it('handles !important in value-level override (strips suffix before lookup)', () => {
    const result = dotExplain('!flex', { target: 'native' });
    expect(result.report._approximated ?? []).not.toContain('display');
  });

  it('!flex produces correct styles on native (adapter strips !important)', () => {
    const result = dotExplain('!flex', { target: 'native' });
    expect(result.styles).toEqual({ display: 'flex' });
  });

  it('!hidden produces correct styles on native (adapter strips !important)', () => {
    const result = dotExplain('!hidden', { target: 'native' });
    expect(result.styles).toEqual({ display: 'none' });
  });
});
