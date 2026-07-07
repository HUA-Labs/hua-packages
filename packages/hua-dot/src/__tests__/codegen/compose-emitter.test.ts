import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig, clearDotCache } from '../../index';
import { toIR } from '../../codegen/to-ir';
import { ComposeEmitter } from '../../codegen/compose-emitter';
import { codegen } from '../../codegen/pipeline';
import type { StyleObject } from '../../types';
import type { DotIR } from '../../codegen/ir';

function resolve(name: string, input: string): DotIR {
  const style = dot(input) as StyleObject;
  return toIR(name, input, style);
}

describe('ComposeEmitter', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  // ─── Padding ───

  it('emits uniform padding', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('card', 'p-4'));
    expect(output).toContain('.padding(16.dp)');
  });

  it('emits directional padding', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('card', 'pt-4 pb-2'));
    expect(output).toContain('top = 16.dp');
    expect(output).toContain('bottom = 8.dp');
  });

  // ─── Colors ───

  it('emits background color', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('card', 'bg-primary-500'));
    expect(output).toContain('.background(Color(0xFF2b6cd6))');
  });

  // ─── Border & Radius ───

  it('emits background with rounded corners', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('card', 'bg-white rounded-lg'));
    expect(output).toContain('.background(Color(0xFFffffff), RoundedCornerShape(8.dp))');
  });

  it('emits rounded-full as CircleShape', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('circle', 'bg-white rounded-full'));
    expect(output).toContain('CircleShape');
  });

  it('emits border with shape', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('bordered', 'border rounded-lg'));
    expect(output).toContain('.border(1.dp,');
    expect(output).toContain('RoundedCornerShape(8.dp)');
  });

  it('emits clip for radius without background', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('clipped', 'rounded-lg'));
    expect(output).toContain('.clip(RoundedCornerShape(8.dp))');
  });

  // ─── Sizing ───

  it('emits fixed dimensions', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('box', 'w-64 h-32'));
    expect(output).toContain('.size(width = 256.dp, height = 128.dp)');
  });

  it('emits fillMaxWidth for w-full', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('full', 'w-full'));
    expect(output).toContain('.fillMaxWidth()');
  });

  // ─── Shadow ───

  it('emits shadow with elevation', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('card', 'shadow-md'));
    expect(output).toContain('.shadow(elevation =');
    expect(output).toContain('.dp');
  });

  // ─── Opacity ───

  it('emits alpha for opacity', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('faded', 'opacity-50'));
    expect(output).toContain('.alpha(0.5f)');
  });

  // ─── Transform ───

  it('emits rotation', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('rotated', 'rotate-45'));
    expect(output).toContain('.rotate(45f)');
  });

  it('emits uniform scale', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('scaled', 'scale-150'));
    expect(output).toContain('.scale(1.5f)');
  });

  // ─── Z-index ───

  it('emits zIndex', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('overlay', 'z-10'));
    expect(output).toContain('.zIndex(10f)');
  });

  // ─── Aspect ratio ───

  it('emits aspectRatio', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('square', 'aspect-square'));
    expect(output).toContain('.aspectRatio(1f)');
  });

  // ─── Function naming ───

  it('uses dotPascalCase function names on Modifier', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('cardBase', 'p-4'));
    expect(output).toContain('fun Modifier.dotCardBase()');
  });

  it('includes original input as KDoc comment', () => {
    const emitter = new ComposeEmitter();
    const output = emitter.emit(resolve('card', 'p-4 bg-white'));
    expect(output).toContain('/** dot: "p-4 bg-white" */');
  });

  // ─── Finalize ───

  it('generates complete Kotlin file with imports', () => {
    const emitter = new ComposeEmitter();
    emitter.emit(resolve('card', 'p-4 bg-white rounded-lg'));
    const output = emitter.finalize('DotStyles');
    expect(output).toContain('package com.hualabs.dot.generated');
    expect(output).toContain('import androidx.compose');
    expect(output).toContain('object DotStyles {');
    expect(output).toContain('object DotColors {');
  });

  it('collects unique colors into DotColors object', () => {
    const emitter = new ComposeEmitter();
    emitter.emit(resolve('a', 'bg-primary-500'));
    emitter.emit(resolve('b', 'bg-primary-500 text-white'));
    const output = emitter.finalize('Styles');
    const matches = output.match(/val dot[0-9a-f]+/g);
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
    const emitter = new ComposeEmitter();
    const result = codegen(defs, emitter, {
      target: 'compose',
      moduleName: 'AppStyles',
    });
    expect(result.content).toMatchSnapshot();
  });

  it('snapshot: layout utilities', () => {
    const defs = [
      { name: 'fullWidth', input: 'w-full' },
      { name: 'fixedBox', input: 'w-64 h-32' },
      { name: 'rotatedCard', input: 'rotate-45 scale-110 opacity-80' },
    ];
    const emitter = new ComposeEmitter();
    const result = codegen(defs, emitter, {
      target: 'compose',
      moduleName: 'LayoutStyles',
    });
    expect(result.content).toMatchSnapshot();
  });
});
