import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig, clearDotCache } from '../../index';
import { toIR } from '../../codegen/to-ir';
import type { StyleObject } from '../../types';
import type { DotIR } from '../../codegen/ir';

describe('toIR()', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  function resolve(input: string): DotIR {
    const style = dot(input) as StyleObject;
    return toIR('test', input, style);
  }

  // ─── Spacing ───

  it('converts uniform padding', () => {
    const ir = resolve('p-4');
    expect(ir.padding).toEqual({ top: 16, right: 16, bottom: 16, left: 16 });
  });

  it('converts directional padding', () => {
    const ir = resolve('px-4 py-2');
    expect(ir.padding).toEqual({ top: 8, right: 16, bottom: 8, left: 16 });
  });

  it('converts margin', () => {
    const ir = resolve('m-8');
    expect(ir.margin).toEqual({ top: 32, right: 32, bottom: 32, left: 32 });
  });

  it('converts directional margin', () => {
    const ir = resolve('mt-4 mb-2');
    expect(ir.margin).toEqual({ top: 16, bottom: 8 });
  });

  // ─── Colors ───

  it('converts background color', () => {
    const ir = resolve('bg-primary-500');
    expect(ir.colors?.background).toBe('#2b6cd6');
  });

  it('converts text color', () => {
    const ir = resolve('text-white');
    expect(ir.colors?.text).toBe('#ffffff');
  });

  it('converts border color', () => {
    const ir = resolve('border-gray-300');
    expect(ir.colors?.border).toBe('#a3a7ae');
  });

  // ─── Typography ───

  it('converts font size', () => {
    const ir = resolve('text-sm');
    expect(ir.typography?.fontSize).toBe(14);
  });

  it('converts font weight', () => {
    const ir = resolve('font-bold');
    expect(ir.typography?.fontWeight).toBe('700');
  });

  it('converts text alignment', () => {
    const ir = resolve('text-center');
    expect(ir.typography?.textAlign).toBe('center');
  });

  it('converts line height', () => {
    const ir = resolve('leading-tight');
    expect(ir.typography?.lineHeight).toBe(1.25);
  });

  // ─── Border ───

  it('converts border width', () => {
    const ir = resolve('border');
    expect(ir.border?.side?.width).toBe(1);
  });

  it('converts border radius', () => {
    const ir = resolve('rounded-lg');
    expect(ir.border?.radius).toEqual({
      topLeft: 8,
      topRight: 8,
      bottomLeft: 8,
      bottomRight: 8,
    });
  });

  it('converts directional border radius', () => {
    const ir = resolve('rounded-t-lg');
    expect(ir.border?.radius?.topLeft).toBe(8);
    expect(ir.border?.radius?.topRight).toBe(8);
    expect(ir.border?.radius?.bottomLeft).toBeUndefined();
  });

  // ─── Shadow ───

  it('converts box shadow', () => {
    const ir = resolve('shadow-md');
    expect(ir.shadows).toBeDefined();
    expect(ir.shadows!.length).toBeGreaterThan(0);
    expect(ir.shadows![0]).toHaveProperty('offsetX');
    expect(ir.shadows![0]).toHaveProperty('offsetY');
    expect(ir.shadows![0]).toHaveProperty('blur');
    expect(ir.shadows![0]).toHaveProperty('color');
  });

  // ─── Layout ───

  it('converts flex layout', () => {
    const ir = resolve('flex items-center justify-between');
    expect(ir.layout?.display).toBe('flex');
    expect(ir.layout?.alignItems).toBe('center');
    expect(ir.layout?.justifyContent).toBe('space-between');
  });

  it('converts flex direction', () => {
    const ir = resolve('flex flex-col');
    expect(ir.layout?.display).toBe('flex');
    expect(ir.layout?.direction).toBe('column');
  });

  it('converts gap', () => {
    const ir = resolve('flex gap-4');
    expect(ir.layout?.gap).toBe(16);
  });

  // ─── Flex child ───

  it('converts flex-1', () => {
    const ir = resolve('flex-1');
    expect(ir.flexChild?.flex).toBe(1);
  });

  // ─── Sizing ───

  it('converts width and height', () => {
    const ir = resolve('w-64 h-32');
    expect(ir.sizing?.width).toBe(256);
    expect(ir.sizing?.height).toBe(128);
  });

  it('converts w-full to expandWidth', () => {
    const ir = resolve('w-full');
    expect(ir.sizing?.expandWidth).toBe(true);
  });

  it('converts min/max sizing', () => {
    const ir = resolve('min-w-0 max-w-lg');
    expect(ir.sizing?.minWidth).toBe(0);
    expect(ir.sizing?.maxWidth).toBeDefined();
  });

  // ─── Positioning ───

  it('converts absolute positioning', () => {
    const ir = resolve('absolute top-0 left-0');
    expect(ir.positioning?.type).toBe('absolute');
    expect(ir.positioning?.top).toBe(0);
    expect(ir.positioning?.left).toBe(0);
  });

  // ─── Transform ───

  it('converts rotation', () => {
    const ir = resolve('rotate-45');
    expect(ir.transform?.rotate).toBe(45);
  });

  it('converts scale', () => {
    const ir = resolve('scale-150');
    expect(ir.transform?.scaleX).toBe(1.5);
    expect(ir.transform?.scaleY).toBe(1.5);
  });

  // ─── Scalar properties ───

  it('converts opacity', () => {
    const ir = resolve('opacity-50');
    expect(ir.opacity).toBe(0.5);
  });

  it('converts z-index', () => {
    const ir = resolve('z-10');
    expect(ir.zIndex).toBe(10);
  });

  // ─── Composite styles (snapshot) ───

  it('converts a complex card style', () => {
    const ir = resolve('p-4 bg-white rounded-lg shadow-md flex flex-col gap-2');
    expect(ir).toMatchSnapshot();
  });

  it('converts a complex heading style', () => {
    const ir = resolve('text-2xl font-bold text-gray-900 leading-tight tracking-tight');
    expect(ir).toMatchSnapshot();
  });

  it('converts a complex button style', () => {
    const ir = resolve('px-6 py-3 bg-primary-500 text-white rounded-full font-semibold shadow-lg');
    expect(ir).toMatchSnapshot();
  });

  // ─── Aspect ratio edge cases ───

  it('handles aspect-ratio division by zero gracefully', () => {
    // Manually construct a style with aspectRatio: '1/0'
    const ir = toIR('test', 'aspect-[1/0]', { aspectRatio: '1/0' } as StyleObject);
    // Should not produce Infinity
    expect(ir.aspectRatio).toBeUndefined();
  });

  it('handles aspect-ratio with valid fraction', () => {
    const ir = toIR('test', 'aspect-video', { aspectRatio: '16/9' } as StyleObject);
    expect(ir.aspectRatio).toBeCloseTo(16 / 9);
  });

  // ─── Metadata ───

  it('preserves name and input', () => {
    const style = dot('p-4 flex') as StyleObject;
    const ir = toIR('myStyle', 'p-4 flex', style);
    expect(ir.name).toBe('myStyle');
    expect(ir.input).toBe('p-4 flex');
  });
});
