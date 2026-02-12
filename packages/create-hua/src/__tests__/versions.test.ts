/**
 * Tests for version constants
 */

import { describe, it, expect } from 'vitest';
import {
  NEXTJS_VERSION,
  REACT_VERSION,
  REACT_DOM_VERSION,
  ZUSTAND_VERSION,
  TYPESCRIPT_VERSION,
  TYPES_NODE_VERSION,
  TYPES_REACT_VERSION,
  TYPES_REACT_DOM_VERSION,
  TAILWIND_POSTCSS_VERSION,
  AUTOPREFIXER_VERSION,
  POSTCSS_VERSION,
  TAILWIND_VERSION,
  PHOSPHOR_ICONS_VERSION,
} from '../constants/versions';
import { HUA_VERSION } from '../version';

describe('Version constants', () => {
  it('should have non-empty NEXTJS_VERSION', () => {
    expect(NEXTJS_VERSION).toBeTruthy();
    expect(typeof NEXTJS_VERSION).toBe('string');
    expect(NEXTJS_VERSION.length).toBeGreaterThan(0);
  });

  it('should have non-empty REACT_VERSION', () => {
    expect(REACT_VERSION).toBeTruthy();
    expect(typeof REACT_VERSION).toBe('string');
    expect(REACT_VERSION.length).toBeGreaterThan(0);
  });

  it('should have non-empty TYPESCRIPT_VERSION', () => {
    expect(TYPESCRIPT_VERSION).toBeTruthy();
    expect(typeof TYPESCRIPT_VERSION).toBe('string');
    expect(TYPESCRIPT_VERSION.length).toBeGreaterThan(0);
  });

  it('should have non-empty HUA_VERSION', () => {
    expect(HUA_VERSION).toBeTruthy();
    expect(typeof HUA_VERSION).toBe('string');
    expect(HUA_VERSION.length).toBeGreaterThan(0);
  });

  it('should have matching REACT and REACT_DOM versions', () => {
    expect(REACT_VERSION).toBe(REACT_DOM_VERSION);
  });

  it('should have valid semver-like format for NEXTJS_VERSION', () => {
    expect(NEXTJS_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('should have valid semver-like format for REACT_VERSION', () => {
    expect(REACT_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('should have valid version format for TYPESCRIPT_VERSION', () => {
    expect(TYPESCRIPT_VERSION).toMatch(/[\^~]?\d+\.\d+\.\d+/);
  });

  it('should have valid version format for ZUSTAND_VERSION', () => {
    expect(ZUSTAND_VERSION).toMatch(/[\^~]?\d+\.\d+\.\d+/);
  });

  it('should have valid TYPES_NODE_VERSION', () => {
    expect(TYPES_NODE_VERSION).toBeTruthy();
    expect(TYPES_NODE_VERSION).toMatch(/[\^~]?\d+/);
  });
});
