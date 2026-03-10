import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig } from '../../index';

describe('CSS variable opacity (color-mix fallback)', () => {
  beforeEach(() => {
    createDotConfig({
      theme: {
        colors: {
          card: 'var(--color-card)',
          'card-foreground': 'var(--color-card-foreground)',
          background: 'var(--color-background)',
          foreground: 'var(--color-foreground)',
          border: 'var(--color-border)',
          ring: 'var(--color-ring)',
          muted: 'var(--color-muted)',
        },
      },
    });
  });

  it('resolves bg-card/50 using color-mix', () => {
    const result = dot('bg-card/50');
    expect(result).toHaveProperty(
      'backgroundColor',
      'color-mix(in srgb, var(--color-card) 50%, transparent)',
    );
  });

  it('resolves text-foreground/80 using color-mix', () => {
    const result = dot('text-foreground/80');
    expect(result).toHaveProperty(
      'color',
      'color-mix(in srgb, var(--color-foreground) 80%, transparent)',
    );
  });

  it('resolves border-border/30 using color-mix', () => {
    const result = dot('border-border/30');
    expect(result).toHaveProperty(
      'borderColor',
      'color-mix(in srgb, var(--color-border) 30%, transparent)',
    );
  });

  it('resolves bg-muted/10 using color-mix', () => {
    const result = dot('bg-muted/10');
    expect(result).toHaveProperty(
      'backgroundColor',
      'color-mix(in srgb, var(--color-muted) 10%, transparent)',
    );
  });

  it('resolves bg-card/100 (fully opaque) using color-mix', () => {
    const result = dot('bg-card/100');
    expect(result).toHaveProperty(
      'backgroundColor',
      'color-mix(in srgb, var(--color-card) 100%, transparent)',
    );
  });

  it('resolves bg-card/0 (fully transparent) using color-mix', () => {
    const result = dot('bg-card/0');
    expect(result).toHaveProperty(
      'backgroundColor',
      'color-mix(in srgb, var(--color-card) 0%, transparent)',
    );
  });

  it('still resolves hex color opacity normally', () => {
    createDotConfig(); // reset to default config (hex colors)
    const result = dot('bg-red-500/50');
    expect(result.backgroundColor).toContain('rgb');
    expect(result.backgroundColor).toContain('0.5');
  });
});

describe('ring semantic color', () => {
  it('uses default ring color (semantic CSS var)', () => {
    createDotConfig();
    const result = dot('ring-2');
    expect(result.boxShadow).toContain('var(--color-ring)');
  });

  it('uses configured ring color', () => {
    createDotConfig({
      theme: {
        colors: {
          ring: 'var(--color-ring)',
        },
      },
    });
    const result = dot('ring-2');
    expect(result.boxShadow).toContain('var(--color-ring)');
  });

  it('ring color config affects bare ring too', () => {
    createDotConfig({
      theme: {
        colors: {
          ring: '#ff0000',
        },
      },
    });
    const result = dot('ring');
    expect(result.boxShadow).toContain('#ff0000');
  });

  it('explicit color override still works', () => {
    createDotConfig({
      theme: {
        colors: {
          ring: '#ff0000',
        },
      },
    });
    const result = dot('ring-blue-500');
    expect(result.boxShadow).toContain('#0079b1');
  });
});
