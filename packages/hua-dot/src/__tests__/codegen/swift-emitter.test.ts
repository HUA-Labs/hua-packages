import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig, clearDotCache } from '../../index';
import { toIR } from '../../codegen/to-ir';
import { SwiftEmitter } from '../../codegen/swift-emitter';
import { codegen } from '../../codegen/pipeline';
import type { StyleObject } from '../../types';
import type { DotIR } from '../../codegen/ir';

function resolve(name: string, input: string): DotIR {
  const style = dot(input) as StyleObject;
  return toIR(name, input, style);
}

describe('SwiftEmitter', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  // ─── Padding ───

  it('emits uniform padding', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('card', 'p-4'));
    expect(output).toContain('.padding(16)');
  });

  it('emits directional padding as EdgeInsets', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('card', 'pt-4 pb-2'));
    expect(output).toContain('EdgeInsets');
    expect(output).toContain('top: 16');
    expect(output).toContain('bottom: 8');
  });

  it('emits symmetric padding as horizontal/vertical', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('card', 'px-4 py-2'));
    expect(output).toContain('.padding(.horizontal, 16)');
    expect(output).toContain('.padding(.vertical, 8)');
  });

  // ─── Colors ───

  it('emits background color', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('card', 'bg-primary-500'));
    expect(output).toContain('.background(Color(hex: "#2b6cd6"))');
  });

  it('emits foreground color', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('title', 'text-white'));
    expect(output).toContain('.foregroundColor(Color(hex: "#ffffff"))');
  });

  // ─── Typography ───

  it('emits font size and weight', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('heading', 'text-2xl font-bold'));
    expect(output).toContain('.font(.system(size: 24, weight: .bold))');
  });

  it('emits font size only', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('body', 'text-sm'));
    expect(output).toContain('.font(.system(size: 14))');
  });

  it('emits text alignment', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('centered', 'text-center'));
    expect(output).toContain('.multilineTextAlignment(.center)');
  });

  it('emits letter spacing as tracking', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('spaced', 'tracking-wide'));
    expect(output).toContain('.tracking(');
  });

  it('emits italic', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('emphasis', 'italic'));
    expect(output).toContain('.italic()');
  });

  it('emits underline', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('link', 'underline'));
    expect(output).toContain('.underline()');
  });

  it('emits strikethrough', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('deleted', 'line-through'));
    expect(output).toContain('.strikethrough()');
  });

  // ─── Border & Radius ───

  it('emits border radius as clipShape', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('rounded', 'rounded-lg'));
    expect(output).toContain('.clipShape(RoundedRectangle(cornerRadius: 8))');
  });

  it('emits border with radius as overlay + clipShape', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('bordered', 'border rounded-lg'));
    expect(output).toContain('.clipShape(RoundedRectangle(cornerRadius: 8))');
    expect(output).toContain('.overlay(RoundedRectangle');
    expect(output).toContain('.stroke(');
    expect(output).toContain('lineWidth: 1');
  });

  it('emits border without radius', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('box', 'border'));
    expect(output).toContain('.overlay(Rectangle().stroke(');
  });

  // ─── Shadow ───

  it('emits shadow', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('card', 'shadow-md'));
    expect(output).toContain('.shadow(');
    expect(output).toContain('radius:');
  });

  // ─── Sizing ───

  it('emits fixed frame dimensions', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('box', 'w-64 h-32'));
    expect(output).toContain('.frame(');
    expect(output).toContain('width: 256');
    expect(output).toContain('height: 128');
  });

  it('emits maxWidth infinity for w-full', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('full', 'w-full'));
    expect(output).toContain('maxWidth: .infinity');
  });

  // ─── Opacity ───

  it('emits opacity', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('faded', 'opacity-50'));
    expect(output).toContain('.opacity(0.5)');
  });

  // ─── Transform ───

  it('emits rotation', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('rotated', 'rotate-45'));
    expect(output).toContain('.rotationEffect(.degrees(45))');
  });

  it('emits uniform scale', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('scaled', 'scale-150'));
    expect(output).toContain('.scaleEffect(1.5)');
  });

  // ─── Z-index ───

  it('emits zIndex', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('overlay', 'z-10'));
    expect(output).toContain('.zIndex(10)');
  });

  // ─── Aspect ratio ───

  it('emits aspect ratio', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('square', 'aspect-square'));
    expect(output).toContain('.aspectRatio(1, contentMode: .fit)');
  });

  // ─── Function naming ───

  it('uses dotPascalCase function names', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('cardBase', 'p-4'));
    expect(output).toContain('func dotCardBase()');
  });

  it('includes original input as doc comment', () => {
    const emitter = new SwiftEmitter();
    const output = emitter.emit(resolve('card', 'p-4 bg-white'));
    expect(output).toContain('/// dot: "p-4 bg-white"');
  });

  // ─── Finalize ───

  it('generates complete Swift file with imports', () => {
    const emitter = new SwiftEmitter();
    emitter.emit(resolve('card', 'p-4 bg-white rounded-lg'));
    const output = emitter.finalize('AppStyles');
    expect(output).toContain('import SwiftUI');
    expect(output).toContain('// AppStyles.swift');
    expect(output).toContain('extension View {');
    expect(output).toContain('extension Color {');
    expect(output).toContain('init(hex: String)');
  });

  it('collects unique colors into palette', () => {
    const emitter = new SwiftEmitter();
    emitter.emit(resolve('a', 'bg-primary-500'));
    emitter.emit(resolve('b', 'bg-primary-500 text-white'));
    const output = emitter.finalize('Styles');
    // Should have palette entries but no duplicates
    expect(output).toContain('Color Palette');
    const matches = output.match(/static let dot/g);
    // primary-500 + white = 2 unique colors
    expect(matches?.length).toBe(2);
  });

  // ─── Full pipeline snapshots ───

  it('snapshot: card + heading + button', () => {
    const defs = [
      { name: 'cardBase', input: 'p-4 bg-white rounded-lg shadow-md' },
      { name: 'heading', input: 'text-2xl font-bold text-gray-900' },
      { name: 'primaryButton', input: 'px-6 py-3 bg-primary-500 text-white rounded-full font-semibold' },
    ];
    const emitter = new SwiftEmitter();
    const result = codegen(defs, emitter, {
      target: 'swift',
      moduleName: 'AppStyles',
    });
    expect(result.content).toMatchSnapshot();
  });

  it('snapshot: layout utilities', () => {
    const defs = [
      { name: 'fullWidth', input: 'w-full' },
      { name: 'fixedBox', input: 'w-64 h-32' },
      { name: 'centered', input: 'text-center' },
      { name: 'rotatedCard', input: 'rotate-45 scale-110 opacity-80' },
    ];
    const emitter = new SwiftEmitter();
    const result = codegen(defs, emitter, {
      target: 'swift',
      moduleName: 'LayoutStyles',
    });
    expect(result.content).toMatchSnapshot();
  });
});
