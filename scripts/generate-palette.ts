/**
 * OKLCH-based color palette generator for HUA design system.
 *
 * Design principles:
 *   1. Hue spacing: ~21° uniform intervals around the color wheel
 *   2. Lightness: perceptually uniform ΔL between steps (OKLCH native)
 *   3. Chroma balance: same step across colors has similar visual weight
 *   4. 21-step scale (25–950) with Tailwind-compatible 11-step subset
 *
 * Usage:
 *   pnpm tsx scripts/generate-palette.ts
 *   pnpm tsx scripts/generate-palette.ts --preview  # outputs HTML preview
 *   pnpm tsx scripts/generate-palette.ts --tokens   # outputs TypeScript
 *   pnpm tsx scripts/generate-palette.ts --css      # outputs CSS variables
 */

// ─── OKLCH ↔ sRGB conversion ───────────────────────────────────────

function oklchToOklab(L: number, C: number, h: number) {
  const hRad = (h * Math.PI) / 180;
  return { L, a: C * Math.cos(hRad), b: C * Math.sin(hRad) };
}

function oklabToLinearSrgb(L: number, a: number, b: number) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  };
}

function linearToSrgb(x: number): number {
  if (x <= 0.0031308) return 12.92 * x;
  return 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

function oklchToHex(L: number, C: number, h: number): string {
  const { L: okL, a: okA, b: okB } = oklchToOklab(L, C, h);
  const lin = oklabToLinearSrgb(okL, okA, okB);
  const r = Math.round(clamp(linearToSrgb(lin.r)) * 255);
  const g = Math.round(clamp(linearToSrgb(lin.g)) * 255);
  const b = Math.round(clamp(linearToSrgb(lin.b)) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function oklchToHsl(L: number, C: number, h: number): string {
  const hex = oklchToHex(L, C, h);
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return `hsl(0 0% ${Math.round(l * 100)}%)`;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue = 0;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;
  return `hsl(${Math.round(hue * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

/** Check if an OKLCH color is within sRGB gamut */
function isInGamut(L: number, C: number, h: number): boolean {
  const { L: okL, a: okA, b: okB } = oklchToOklab(L, C, h);
  const lin = oklabToLinearSrgb(okL, okA, okB);
  const r = linearToSrgb(lin.r);
  const g = linearToSrgb(lin.g);
  const b = linearToSrgb(lin.b);
  const eps = -0.001;
  return r >= eps && r <= 1.001 && g >= eps && g <= 1.001 && b >= eps && b <= 1.001;
}

/** Clamp chroma to sRGB gamut boundary */
function gamutClampChroma(L: number, C: number, h: number): number {
  if (isInGamut(L, C, h)) return C;
  let lo = 0, hi = C;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (isInGamut(L, mid, h)) lo = mid; else hi = mid;
  }
  return lo;
}

// ─── Palette generation ─────────────────────────────────────────────

/** Steps: 21 grades from 25 to 950 */
const STEPS = [
  25, 50, 75, 100, 150, 200, 250, 300, 350, 400, 450,
  500, 550, 600, 650, 700, 750, 800, 850, 900, 950,
] as const;

/** Tailwind-compatible subset (11 steps) */
const TAILWIND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

interface PaletteConfig {
  name: string;
  /** OKLCH hue angle (0-360) */
  hue: number;
  /** Peak chroma — will be gamut-clamped per step */
  chromaPeak: number;
  /** Chroma at lightest end (step 25) */
  chromaLight?: number;
  /** Chroma at darkest end (step 950) */
  chromaDark?: number;
  /** Hue rotation across lightness range */
  hueShift?: number;
}

interface PaletteEntry {
  step: number;
  hex: string;
  hsl: string;
  oklch: { L: number; C: number; h: number };
}

function generatePalette(config: PaletteConfig): PaletteEntry[] {
  const {
    hue,
    chromaPeak,
    chromaLight = 0.012,
    chromaDark = 0.035,
    hueShift = 0,
  } = config;

  return STEPS.map((step) => {
    // ── Lightness: uniform ΔL ──
    // Step 25 → L=0.975, Step 950 → L=0.145
    // Linear in OKLCH = perceptually uniform
    const t = (step - 25) / (950 - 25);
    const L = 0.975 - t * 0.83;

    // ── Chroma: smooth bell curve, peak at ~step 450 ──
    // Slightly front-loaded peak (t=0.46) for more vivid mid-tones
    const peakT = 0.46;
    const chromaT = Math.exp(-Math.pow((t - peakT) / 0.32, 2));
    const baseChroma = t < peakT ? chromaLight : chromaDark;
    const rawC = baseChroma + (chromaPeak - baseChroma) * chromaT;

    // Gamut clamp: ensure we stay in sRGB
    const h = hue + hueShift * (t - 0.5);
    const C = gamutClampChroma(L, rawC, h);

    const hex = oklchToHex(L, C, h);
    const hsl = oklchToHsl(L, C, h);

    return { step, hex, hsl, oklch: { L, C, h } };
  });
}

// ─── Color definitions ──────────────────────────────────────────────
//
// Hue layout: ~21° uniform spacing around 360° color wheel
// 17 chromatic colors → 360/17 ≈ 21.2°
//
//   rose:     8°    │  warm reds
//   red:     29°    │
//   orange:  50°    │
//   amber:   71°    │  warm yellows
//   yellow:  92°    │
//   lime:   113°    │  yellow-greens
//   green:  134°    │
//   emerald:155°    │  blue-greens
//   teal:   176°    │  (my-app brand)
//   cyan:   197°    │  (CMYK cyan feel)
//   sky:    218°    │
//   blue:   239°    │
//   indigo: 260°    │  (HUA primary)
//   violet: 281°    │
//   purple: 302°    │
//   fuchsia:323°    │
//   pink:   344°    │

const PALETTE_CONFIGS: PaletteConfig[] = [
  // ── Neutrals (5 families) ──
  { name: 'slate',   hue: 220, chromaPeak: 0.025, chromaLight: 0.005, chromaDark: 0.018 },
  { name: 'gray',    hue: 260, chromaPeak: 0.012, chromaLight: 0.003, chromaDark: 0.008 },
  { name: 'zinc',    hue: 240, chromaPeak: 0.010, chromaLight: 0.002, chromaDark: 0.007 },
  { name: 'neutral', hue: 0,   chromaPeak: 0.003, chromaLight: 0.001, chromaDark: 0.002 },
  { name: 'stone',   hue: 40,  chromaPeak: 0.015, chromaLight: 0.004, chromaDark: 0.010 },

  // ── Chromatic colors (17, ~21° spacing) ──
  { name: 'rose',    hue:   8, chromaPeak: 0.19, hueShift: -3 },
  { name: 'red',     hue:  29, chromaPeak: 0.20, hueShift: -4 },
  { name: 'orange',  hue:  50, chromaPeak: 0.19, hueShift: -5 },
  { name: 'amber',   hue:  71, chromaPeak: 0.17, hueShift: -5 },
  { name: 'yellow',  hue:  92, chromaPeak: 0.17, hueShift: -4 },
  { name: 'lime',    hue: 113, chromaPeak: 0.18, hueShift:  3 },
  { name: 'green',   hue: 134, chromaPeak: 0.18, hueShift:  3 },
  { name: 'emerald', hue: 155, chromaPeak: 0.16, hueShift:  3 },
  { name: 'teal',    hue: 176, chromaPeak: 0.14, hueShift:  3 },
  { name: 'cyan',    hue: 197, chromaPeak: 0.14, hueShift:  0 },
  { name: 'sky',     hue: 218, chromaPeak: 0.15, hueShift: -3 },
  { name: 'blue',    hue: 239, chromaPeak: 0.17, hueShift: -4 },
  { name: 'indigo',  hue: 260, chromaPeak: 0.18, hueShift: -5 },
  { name: 'violet',  hue: 281, chromaPeak: 0.19, hueShift: -3 },
  { name: 'purple',  hue: 302, chromaPeak: 0.18, hueShift: -3 },
  { name: 'fuchsia', hue: 323, chromaPeak: 0.19, hueShift: -3 },
  { name: 'pink',    hue: 344, chromaPeak: 0.18, hueShift: -3 },
];

// ─── Semantic mapping ───────────────────────────────────────────────

const SEMANTIC_MAP = {
  primary:     { color: 'indigo',  light: 500, dark: 400, fg: 'white' as const },
  secondary:   { color: 'slate',   light: 100, dark: 800, fg: 'auto' as const },
  accent:      { color: 'violet',  light: 500, dark: 400, fg: 'white' as const },
  destructive: { color: 'red',     light: 500, dark: 400, fg: 'white' as const },
  success:     { color: 'green',   light: 500, dark: 400, fg: 'white' as const },
  warning:     { color: 'amber',   light: 500, dark: 400, fg: 'black' as const },
  info:        { color: 'blue',    light: 500, dark: 400, fg: 'white' as const },
  error:       { color: 'red',     light: 600, dark: 500, fg: 'white' as const },
  muted:       { color: 'slate',   light: 100, dark: 800, fg: 'auto' as const },
  inactive:    { color: 'gray',    light: 400, dark: 600, fg: 'auto' as const },
};

// ─── Output generators ──────────────────────────────────────────────

function generateAllPalettes() {
  const palettes: Record<string, PaletteEntry[]> = {};
  for (const config of PALETTE_CONFIGS) {
    palettes[config.name] = generatePalette(config);
  }
  return palettes;
}

function toDotTokens(palettes: Record<string, PaletteEntry[]>): string {
  const lines: string[] = [
    '/** Auto-generated by scripts/generate-palette.ts — DO NOT EDIT */',
    '/** OKLCH-based 21-step palette, Tailwind-compatible 11-step subset */',
    '',
    'export const COLORS: Record<string, Record<string, string>> = {',
  ];
  for (const [name, entries] of Object.entries(palettes)) {
    const tw = entries.filter((e) => (TAILWIND_STEPS as readonly number[]).includes(e.step));
    lines.push(`  ${name}: {`);
    for (const entry of tw) lines.push(`    '${entry.step}': '${entry.hex}',`);
    lines.push('  },');
  }
  lines.push('};');
  lines.push('');
  lines.push('/** Full 21-step palette for fine-grained design system use */');
  lines.push('export const COLORS_FULL: Record<string, Record<string, string>> = {');
  for (const [name, entries] of Object.entries(palettes)) {
    lines.push(`  ${name}: {`);
    for (const entry of entries) lines.push(`    '${entry.step}': '${entry.hex}',`);
    lines.push('  },');
  }
  lines.push('};');
  return lines.join('\n');
}

function toCssVariables(palettes: Record<string, PaletteEntry[]>): string {
  const lines: string[] = [
    '/* Auto-generated by scripts/generate-palette.ts — DO NOT EDIT */',
    '/* OKLCH-based HUA design system palette */',
    '', ':root {', '  /* ── Palette scales ── */',
  ];
  for (const [name, entries] of Object.entries(palettes)) {
    lines.push('');
    for (const entry of entries) {
      lines.push(`  --palette-${name}-${entry.step}: ${entry.hex};`);
    }
  }
  lines.push('');
  lines.push('  /* ── Semantic colors (light) ── */');
  for (const [semantic, mapping] of Object.entries(SEMANTIC_MAP)) {
    const palette = palettes[mapping.color];
    if (!palette) continue;
    const entry = palette.find((e) => e.step === mapping.light);
    if (entry) {
      lines.push(`  --color-${semantic}: ${entry.hsl};`);
      if (mapping.fg === 'white') lines.push(`  --color-${semantic}-foreground: hsl(0 0% 100%);`);
      else if (mapping.fg === 'black') lines.push(`  --color-${semantic}-foreground: hsl(0 0% 0%);`);
      else {
        const fg = palette.find((e) => e.step === 900);
        if (fg) lines.push(`  --color-${semantic}-foreground: ${fg.hsl};`);
      }
    }
  }
  lines.push('}');
  lines.push('');
  lines.push('.dark {');
  lines.push('  /* ── Semantic colors (dark) ── */');
  for (const [semantic, mapping] of Object.entries(SEMANTIC_MAP)) {
    const palette = palettes[mapping.color];
    if (!palette) continue;
    const entry = palette.find((e) => e.step === mapping.dark);
    if (entry) lines.push(`  --color-${semantic}: ${entry.hsl};`);
  }
  lines.push('}');
  return lines.join('\n');
}

function toHtmlPreview(palettes: Record<string, PaletteEntry[]>): string {
  // Separate neutrals from chromatic
  const neutralNames = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
  const chromaticNames = Object.keys(palettes).filter(n => !neutralNames.includes(n));

  function renderRows(names: string[]) {
    return names.map(name => {
      const entries = palettes[name];
      if (!entries) return '';
      const swatches = entries.map(e =>
        `<div class="swatch" style="background:${e.hex}" title="${name}-${e.step}&#10;${e.hex}&#10;OKLCH(${e.oklch.L.toFixed(3)} ${e.oklch.C.toFixed(3)} ${e.oklch.h.toFixed(1)})">
          <span class="step">${e.step}</span>
        </div>`
      ).join('');
      return `<div class="row"><div class="name">${name}</div><div class="swatches">${swatches}</div></div>`;
    }).join('\n');
  }

  // Semantic cards
  const semanticCards = Object.entries(SEMANTIC_MAP).map(([semantic, mapping]) => {
    const palette = palettes[mapping.color];
    if (!palette) return '';
    const entry = palette.find(e => e.step === mapping.light);
    const darkEntry = palette.find(e => e.step === mapping.dark);
    const fg = mapping.fg === 'white' ? '#fff' : mapping.fg === 'black' ? '#000' : '#1e293b';
    return `<div class="semantic-card" style="background:${entry?.hex};color:${fg}">
      <div class="semantic-name">${semantic}</div>
      <div class="semantic-detail">${mapping.color}-${mapping.light} / dark: ${mapping.dark}</div>
    </div>`;
  }).join('');

  // Color wheel SVG
  const wheelRadius = 140;
  const wheelCx = 160, wheelCy = 160;
  const chromaticConfigs = PALETTE_CONFIGS.filter(c => !neutralNames.includes(c.name));
  const wheelDots = chromaticConfigs.map(c => {
    const palette = palettes[c.name];
    const s500 = palette?.find(e => e.step === 500)?.hex || '#888';
    const angle = (c.hue - 90) * Math.PI / 180; // -90 to start from top
    const x = wheelCx + wheelRadius * Math.cos(angle);
    const y = wheelCy + wheelRadius * Math.sin(angle);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="${s500}" stroke="white" stroke-width="2"/>
      <text x="${x.toFixed(1)}" y="${(y + 28).toFixed(1)}" text-anchor="middle" fill="currentColor" font-size="9" font-weight="600">${c.name}</text>
      <text x="${x.toFixed(1)}" y="${(y + 38).toFixed(1)}" text-anchor="middle" fill="#94a3b8" font-size="7">${c.hue}°</text>`;
  }).join('\n');

  // Hue gap analysis
  const hues = chromaticConfigs.map(c => c.hue).sort((a, b) => a - b);
  const gaps = hues.map((h, i) => {
    const next = i < hues.length - 1 ? hues[i + 1] : hues[0] + 360;
    return next - h;
  });
  const avgGap = (360 / hues.length).toFixed(1);
  const minGap = Math.min(...gaps);
  const maxGap = Math.max(...gaps);

  // Lightness uniformity check
  const sampleColor = palettes['indigo'];
  const lightnessSteps = sampleColor.map((e, i) => {
    if (i === 0) return null;
    const deltaL = sampleColor[i - 1].oklch.L - e.oklch.L;
    return { from: sampleColor[i - 1].step, to: e.step, deltaL };
  }).filter(Boolean);

  // Component samples
  const indigo500 = palettes['indigo']?.find(e => e.step === 500)?.hex || '#6366f1';
  const indigo400 = palettes['indigo']?.find(e => e.step === 400)?.hex || '#818cf8';
  const indigo50 = palettes['indigo']?.find(e => e.step === 50)?.hex || '#eef2ff';
  const indigo100 = palettes['indigo']?.find(e => e.step === 100)?.hex || '#e0e7ff';
  const indigo200 = palettes['indigo']?.find(e => e.step === 200)?.hex || '#c7d2fe';
  const indigo700 = palettes['indigo']?.find(e => e.step === 700)?.hex || '#4338ca';
  const indigo900 = palettes['indigo']?.find(e => e.step === 900)?.hex || '#312e81';
  const indigo850 = palettes['indigo']?.find(e => e.step === 850)?.hex || '#312e81';
  const slate50 = palettes['slate']?.find(e => e.step === 50)?.hex || '#f8fafc';
  const slate100 = palettes['slate']?.find(e => e.step === 100)?.hex || '#f1f5f9';
  const slate200 = palettes['slate']?.find(e => e.step === 200)?.hex || '#e2e8f0';
  const slate300 = palettes['slate']?.find(e => e.step === 300)?.hex || '#cbd5e1';
  const slate500 = palettes['slate']?.find(e => e.step === 500)?.hex || '#64748b';
  const slate700 = palettes['slate']?.find(e => e.step === 700)?.hex || '#334155';
  const slate800 = palettes['slate']?.find(e => e.step === 800)?.hex || '#1e293b';
  const slate900 = palettes['slate']?.find(e => e.step === 900)?.hex || '#0f172a';
  const red500 = palettes['red']?.find(e => e.step === 500)?.hex || '#ef4444';
  const green500 = palettes['green']?.find(e => e.step === 500)?.hex || '#22c55e';
  const amber500 = palettes['amber']?.find(e => e.step === 500)?.hex || '#f59e0b';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HUA Design System — Color Palette v2</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #fafafa; color: #1e293b; padding: 2rem; max-width: 1200px; margin: 0 auto; }
  body.dark { background: ${slate900}; color: #e2e8f0; }
  h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
  h2 { font-size: 1.1rem; font-weight: 600; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; }
  .dark h2 { border-color: #334155; }
  .subtitle { color: #64748b; margin-bottom: 2rem; font-size: 0.875rem; }
  .dark .subtitle { color: #94a3b8; }
  .controls { position: fixed; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; z-index: 10; }
  .btn { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-size: 0.75rem; }
  .dark .btn { background: ${slate800}; border-color: #334155; color: #e2e8f0; }

  .row { display: flex; align-items: center; margin-bottom: 3px; }
  .name { width: 70px; font-size: 0.7rem; font-weight: 600; flex-shrink: 0; }
  .swatches { display: flex; gap: 1px; flex: 1; }
  .swatch { flex: 1; aspect-ratio: 1; border-radius: 3px; display: flex; align-items: flex-end; justify-content: center; cursor: pointer; transition: transform 0.15s; position: relative; min-width: 20px; }
  .swatch:hover { transform: scale(2); z-index: 5; border-radius: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); }
  .step { font-size: 0; opacity: 0; }
  .swatch:hover .step { opacity: 1; font-size: 8px; font-weight: 700; color: rgba(0,0,0,0.5); padding-bottom: 1px; }

  .semantic-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.6rem; }
  .semantic-card { padding: 0.75rem 1rem; border-radius: 0.6rem; }
  .semantic-name { font-weight: 700; font-size: 0.8rem; text-transform: capitalize; }
  .semantic-detail { font-size: 0.65rem; opacity: 0.7; margin-top: 0.15rem; }

  .wheel-container { display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap; }
  .wheel-info { font-size: 0.75rem; line-height: 1.6; }
  .wheel-info dt { font-weight: 600; }
  .wheel-info dd { color: #64748b; margin-bottom: 0.5rem; }
  .dark .wheel-info dd { color: #94a3b8; }

  .component-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
  .comp-card { padding: 1.25rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; background: white; }
  .dark .comp-card { background: ${slate800}; border-color: #334155; }
  .comp-title { font-size: 0.7rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }

  .delta-chart { display: flex; align-items: flex-end; gap: 2px; height: 60px; }
  .delta-bar { flex: 1; background: ${indigo400}; border-radius: 2px 2px 0 0; min-width: 8px; }
  .dark .delta-bar { background: ${indigo500}; }
</style>
</head>
<body>
<div class="controls">
  <button class="btn" onclick="document.body.classList.toggle('dark')">Dark Mode</button>
</div>

<h1>HUA Design System — Color Palette</h1>
<p class="subtitle">OKLCH · 22 colors × 21 steps = 462 swatches · ~21° hue spacing · Perceptually uniform ΔL</p>

<h2>Neutrals</h2>
${renderRows(neutralNames)}

<h2>Chromatic Colors (${chromaticNames.length} hues, ~21° spacing)</h2>
${renderRows(chromaticNames)}

<h2>Color Wheel — Hue Distribution</h2>
<div class="wheel-container">
  <svg width="320" height="320" viewBox="0 0 320 320">
    <circle cx="${wheelCx}" cy="${wheelCy}" r="${wheelRadius + 20}" fill="none" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="4 4"/>
    <circle cx="${wheelCx}" cy="${wheelCy}" r="${wheelRadius}" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
    ${wheelDots}
  </svg>
  <dl class="wheel-info">
    <dt>Total hues</dt><dd>${chromaticConfigs.length}</dd>
    <dt>Target spacing</dt><dd>${avgGap}°</dd>
    <dt>Actual range</dt><dd>${minGap}°–${maxGap}°</dd>
    <dt>Gaps</dt><dd>${gaps.map((g, i) => `${chromaticConfigs.sort((a, b) => a.hue - b.hue)[i]?.name}: ${g}°`).join(', ')}</dd>
  </dl>
</div>

<h2>Semantic Colors</h2>
<div class="semantic-grid">${semanticCards}</div>

<h2>Lightness Uniformity (ΔL per step, indigo)</h2>
<div class="delta-chart">
  ${lightnessSteps.map(s => s ? `<div class="delta-bar" style="height:${(s.deltaL / 0.06) * 100}%" title="${s.from}→${s.to}: ΔL=${s.deltaL.toFixed(4)}"></div>` : '').join('')}
</div>
<p style="font-size:0.7rem;color:#94a3b8;margin-top:0.5rem;">Each bar = ΔL between adjacent steps. Uniform height = perceptually uniform spacing.</p>

<h2>Component Samples</h2>
<div class="component-grid">
  <div class="comp-card">
    <div class="comp-title">Buttons</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button style="padding:8px 18px;border-radius:8px;border:none;background:${indigo500};color:white;font-weight:600;font-size:13px;cursor:pointer">Primary</button>
      <button style="padding:8px 18px;border-radius:8px;border:2px solid ${indigo500};background:transparent;color:${indigo500};font-weight:600;font-size:13px;cursor:pointer">Outline</button>
      <button style="padding:8px 18px;border-radius:8px;border:none;background:${slate100};color:${slate700};font-weight:600;font-size:13px;cursor:pointer">Secondary</button>
      <button style="padding:8px 18px;border-radius:8px;border:none;background:${red500};color:white;font-weight:600;font-size:13px;cursor:pointer">Destructive</button>
    </div>
  </div>
  <div class="comp-card">
    <div class="comp-title">Badges</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
      <span style="padding:2px 10px;border-radius:999px;background:${indigo100};color:${indigo700};font-size:11px;font-weight:600">Default</span>
      <span style="padding:2px 10px;border-radius:999px;background:${palettes['green']?.find(e => e.step === 100)?.hex};color:${palettes['green']?.find(e => e.step === 700)?.hex};font-size:11px;font-weight:600">Success</span>
      <span style="padding:2px 10px;border-radius:999px;background:${palettes['amber']?.find(e => e.step === 100)?.hex};color:${palettes['amber']?.find(e => e.step === 700)?.hex};font-size:11px;font-weight:600">Warning</span>
      <span style="padding:2px 10px;border-radius:999px;background:${palettes['red']?.find(e => e.step === 100)?.hex};color:${palettes['red']?.find(e => e.step === 700)?.hex};font-size:11px;font-weight:600">Error</span>
      <span style="padding:2px 10px;border-radius:999px;border:1px solid ${slate300};color:${slate700};font-size:11px;font-weight:600">Outline</span>
    </div>
  </div>
  <div class="comp-card">
    <div class="comp-title">Card</div>
    <div style="padding:16px;border-radius:10px;background:${slate50};border:1px solid ${slate200}">
      <div style="font-weight:700;font-size:14px;margin-bottom:4px">Card Title</div>
      <div style="font-size:12px;color:${slate500}">Description text using slate-500 for secondary content.</div>
    </div>
  </div>
  <div class="comp-card">
    <div class="comp-title">Input</div>
    <input style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid ${slate300};font-size:13px;outline:none;background:transparent;color:inherit" placeholder="Placeholder text..." />
  </div>
  <div class="comp-card">
    <div class="comp-title">Tone-on-tone (indigo)</div>
    <div style="display:flex;gap:4px">
      ${[25, 50, 100, 200, 300, 500, 700, 900].map(s => {
        const entry = palettes['indigo']?.find(e => e.step === s);
        const fg = s >= 500 ? '#fff' : indigo900;
        return `<div style="flex:1;padding:8px 4px;border-radius:6px;background:${entry?.hex};color:${fg};font-size:9px;text-align:center;font-weight:600">${s}</div>`;
      }).join('')}
    </div>
  </div>
  <div class="comp-card">
    <div class="comp-title">Alert variants</div>
    <div style="padding:10px 14px;border-radius:8px;background:${palettes['green']?.find(e => e.step === 50)?.hex};border-left:3px solid ${green500};font-size:12px;color:${palettes['green']?.find(e => e.step === 800)?.hex};margin-bottom:6px">Success message</div>
    <div style="padding:10px 14px;border-radius:8px;background:${palettes['red']?.find(e => e.step === 50)?.hex};border-left:3px solid ${red500};font-size:12px;color:${palettes['red']?.find(e => e.step === 800)?.hex}">Error message</div>
  </div>
</div>

<script>
document.querySelectorAll('.swatch').forEach(s => {
  s.addEventListener('click', () => {
    const parts = s.getAttribute('title')?.split('\\n') || [];
    navigator.clipboard?.writeText(parts[1] || '');
  });
});
</script>
</body>
</html>`;
}

// ─── Main ───────────────────────────────────────────────────────────

const palettes = generateAllPalettes();
const isPreview = process.argv.includes('--preview');
const isTokens = process.argv.includes('--tokens');
const isCss = process.argv.includes('--css');

if (isPreview) {
  console.log(toHtmlPreview(palettes));
} else if (isTokens) {
  console.log(toDotTokens(palettes));
} else if (isCss) {
  console.log(toCssVariables(palettes));
} else {
  console.log('HUA Design System — OKLCH Palette Generator v2\n');
  console.log(`Neutrals: 5 families`);
  console.log(`Chromatic: ${PALETTE_CONFIGS.length - 5} hues (~21° spacing)`);
  console.log(`Steps per color: ${STEPS.length} (21-step scale)`);
  console.log(`Total swatches: ${PALETTE_CONFIGS.length * STEPS.length}\n`);

  // Hue distribution
  const chromatic = PALETTE_CONFIGS.filter(c => !['slate','gray','zinc','neutral','stone'].includes(c.name));
  const sorted = [...chromatic].sort((a, b) => a.hue - b.hue);
  console.log('Hue distribution:');
  for (let i = 0; i < sorted.length; i++) {
    const next = i < sorted.length - 1 ? sorted[i + 1].hue : sorted[0].hue + 360;
    const gap = next - sorted[i].hue;
    const bar = '█'.repeat(Math.round(gap));
    console.log(`  ${sorted[i].name.padEnd(8)} ${String(sorted[i].hue).padStart(3)}°  ${bar} Δ${gap}°`);
  }

  console.log('\nFlags: --preview | --tokens | --css');
}
