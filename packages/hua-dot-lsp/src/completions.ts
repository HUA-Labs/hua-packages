/**
 * Completion token list for dot utility classes.
 * Inlined from dot's token maps so we don't depend on unexported subpaths.
 */

export interface CompletionEntry {
  label: string;
  detail: string;
  documentation?: string;
}

// ---------------------------------------------------------------------------
// Token data (inlined from @hua-labs/dot token sources)
// ---------------------------------------------------------------------------

const SPACING: Record<string, string> = {
  "0": "0px",
  px: "1px",
  "0.5": "2px",
  "1": "4px",
  "1.5": "6px",
  "2": "8px",
  "2.5": "10px",
  "3": "12px",
  "3.5": "14px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "7": "28px",
  "8": "32px",
  "9": "36px",
  "10": "40px",
  "11": "44px",
  "12": "48px",
  "14": "56px",
  "16": "64px",
  "20": "80px",
  "24": "96px",
  "28": "112px",
  "32": "128px",
  "36": "144px",
  "40": "160px",
  "44": "176px",
  "48": "192px",
  "52": "208px",
  "56": "224px",
  "60": "240px",
  "64": "256px",
  "72": "288px",
  "80": "320px",
  "96": "384px",
  auto: "auto",
};

const COLORS: Record<string, Record<string, string>> = {
  steel: {
    "50": "#e8f1f6",
    "100": "#d8e2e8",
    "200": "#b7c6ce",
    "300": "#96abb6",
    "400": "#77909d",
    "500": "#5d7582",
    "600": "#455c67",
    "700": "#2f434c",
    "800": "#1a2b34",
    "900": "#07161d",
    "950": "#010c13",
  },
  slate: {
    "50": "#eaf1f3",
    "100": "#dae2e5",
    "200": "#bac6ca",
    "300": "#9aaab0",
    "400": "#7c9096",
    "500": "#62757b",
    "600": "#4a5b61",
    "700": "#334247",
    "800": "#1e2b30",
    "900": "#0a161a",
    "950": "#030c0f",
  },
  gray: {
    "50": "#edeff2",
    "100": "#dee1e4",
    "200": "#c1c4c8",
    "300": "#a3a7ae",
    "400": "#888c93",
    "500": "#6d7178",
    "600": "#54585e",
    "700": "#3c4045",
    "800": "#26292d",
    "900": "#121418",
    "950": "#080a0e",
  },
  zinc: {
    "50": "#edf0f1",
    "100": "#dee1e3",
    "200": "#c0c4c7",
    "300": "#a3a8ac",
    "400": "#878d91",
    "500": "#6c7276",
    "600": "#53595d",
    "700": "#3c4044",
    "800": "#25292c",
    "900": "#111417",
    "950": "#080b0d",
  },
  neutral: {
    "50": "#f0efef",
    "100": "#e1e0e0",
    "200": "#c4c3c3",
    "300": "#a8a6a7",
    "400": "#8d8b8b",
    "500": "#737071",
    "600": "#595758",
    "700": "#413f3f",
    "800": "#2a2829",
    "900": "#151314",
    "950": "#0b0a0a",
  },
  stone: {
    "50": "#f3eeec",
    "100": "#e5dfdd",
    "200": "#c9c2bf",
    "300": "#afa5a1",
    "400": "#948985",
    "500": "#796e6b",
    "600": "#5f5552",
    "700": "#463d3b",
    "800": "#2e2725",
    "900": "#181210",
    "950": "#0e0907",
  },
  red: {
    "50": "#ffeae6",
    "100": "#ffd5cd",
    "200": "#ffaa9b",
    "300": "#fa7c6a",
    "400": "#ea4e3e",
    "500": "#ca2c22",
    "600": "#9f211a",
    "700": "#701f19",
    "800": "#471612",
    "900": "#270907",
    "950": "#190302",
  },
  orange: {
    "50": "#ffede0",
    "100": "#ffdcc2",
    "200": "#ffb986",
    "300": "#f9934d",
    "400": "#e86e23",
    "500": "#cb5209",
    "600": "#9f4007",
    "700": "#6f3007",
    "800": "#452007",
    "900": "#251104",
    "950": "#180902",
  },
  amber: {
    "50": "#fff2d9",
    "100": "#ffe5b3",
    "200": "#ffc96a",
    "300": "#f4a929",
    "400": "#d98a07",
    "500": "#b36c00",
    "600": "#8c5400",
    "700": "#633c00",
    "800": "#3e2700",
    "900": "#211500",
    "950": "#140d00",
  },
  yellow: {
    "50": "#fffbd4",
    "100": "#fff6aa",
    "200": "#ffea57",
    "300": "#f5d71b",
    "400": "#d9bc00",
    "500": "#b29800",
    "600": "#8c7700",
    "700": "#635500",
    "800": "#3d3500",
    "900": "#201c00",
    "950": "#131100",
  },
  lime: {
    "50": "#f0fbd0",
    "100": "#e1f7a3",
    "200": "#c1ee4f",
    "300": "#9cd81a",
    "400": "#79bc00",
    "500": "#5e9800",
    "600": "#477700",
    "700": "#335600",
    "800": "#1f3600",
    "900": "#0e1d00",
    "950": "#081200",
  },
  green: {
    "50": "#e4fce8",
    "100": "#c9f9d4",
    "200": "#93f2ab",
    "300": "#56e380",
    "400": "#1fcb5a",
    "500": "#0daa41",
    "600": "#0a8532",
    "700": "#0b6027",
    "800": "#0a3e1b",
    "900": "#07230e",
    "950": "#041608",
  },
  emerald: {
    "50": "#e3fbee",
    "100": "#c7f7de",
    "200": "#8aefbf",
    "300": "#44e29e",
    "400": "#0ecb7e",
    "500": "#01a564",
    "600": "#00814e",
    "700": "#085d39",
    "800": "#0d3c28",
    "900": "#092217",
    "950": "#05160e",
  },
  teal: {
    "50": "#dcfbf4",
    "100": "#baf7eb",
    "200": "#74efd7",
    "300": "#1eddbf",
    "400": "#00c3a5",
    "500": "#009f87",
    "600": "#007c6a",
    "700": "#09594c",
    "800": "#0d3933",
    "900": "#0c211e",
    "950": "#071514",
  },
  cyan: {
    "50": "#d9faff",
    "100": "#b3f4ff",
    "200": "#67e9ff",
    "300": "#0dd7f9",
    "400": "#00bee0",
    "500": "#009ab7",
    "600": "#007890",
    "700": "#0a5768",
    "800": "#103846",
    "900": "#0e2129",
    "950": "#09151b",
  },
  sky: {
    "50": "#dff4ff",
    "100": "#c0e9ff",
    "200": "#82d3ff",
    "300": "#3cbcff",
    "400": "#00a2f7",
    "500": "#0082d0",
    "600": "#0065a5",
    "700": "#0a4977",
    "800": "#0f2f4f",
    "900": "#0d1d31",
    "950": "#09121f",
  },
  blue: {
    "50": "#e1efff",
    "100": "#c4dfff",
    "200": "#88beff",
    "300": "#489aff",
    "400": "#0d76ff",
    "500": "#0057e5",
    "600": "#0044b5",
    "700": "#0b3282",
    "800": "#122057",
    "900": "#0f1336",
    "950": "#0b0c22",
  },
  indigo: {
    "50": "#ecebff",
    "100": "#dbd9ff",
    "200": "#b7b3ff",
    "300": "#9089ff",
    "400": "#6a5eff",
    "500": "#4b36ff",
    "600": "#3b28d6",
    "700": "#2c1e9a",
    "800": "#1d1564",
    "900": "#0e0b39",
    "950": "#090724",
  },
  violet: {
    "50": "#f2eaff",
    "100": "#e5d6ff",
    "200": "#cbadff",
    "300": "#b182ff",
    "400": "#9657ff",
    "500": "#7c2fff",
    "600": "#6223d1",
    "700": "#461a97",
    "800": "#2e1262",
    "900": "#1a0b39",
    "950": "#110724",
  },
  purple: {
    "50": "#f7e5ff",
    "100": "#efcbff",
    "200": "#df97ff",
    "300": "#ce61ff",
    "400": "#bb2eff",
    "500": "#a300ff",
    "600": "#8000cb",
    "700": "#5c0093",
    "800": "#3c0062",
    "900": "#23003b",
    "950": "#160026",
  },
  fuchsia: {
    "50": "#ffe5fb",
    "100": "#ffcaf6",
    "200": "#ff96ed",
    "300": "#ff5fe1",
    "400": "#f82ed1",
    "500": "#d900b3",
    "600": "#ab008d",
    "700": "#7c0066",
    "800": "#510042",
    "900": "#310027",
    "950": "#200019",
  },
  pink: {
    "50": "#ffe5f3",
    "100": "#ffcae7",
    "200": "#ff96cf",
    "300": "#ff60b3",
    "400": "#f72c94",
    "500": "#d70076",
    "600": "#aa005c",
    "700": "#7b0043",
    "800": "#4f002c",
    "900": "#2f0019",
    "950": "#1e0010",
  },
  rose: {
    "50": "#ffe9ec",
    "100": "#ffd4d9",
    "200": "#fca9b6",
    "300": "#f47b94",
    "400": "#e34f75",
    "500": "#c32f5c",
    "600": "#992348",
    "700": "#6d1f35",
    "800": "#451622",
    "900": "#250810",
    "950": "#180307",
  },
  primary: {
    "50": "#ecebff",
    "100": "#dbd9ff",
    "200": "#b7b3ff",
    "300": "#9089ff",
    "400": "#6a5eff",
    "500": "#4b36ff",
    "600": "#3b28d6",
    "700": "#2c1e9a",
    "800": "#1d1564",
    "900": "#0e0b39",
    "950": "#090724",
  },
  secondary: {
    "50": "#eaf1f3",
    "100": "#dae2e5",
    "200": "#bac6ca",
    "300": "#9aaab0",
    "400": "#7c9096",
    "500": "#62757b",
    "600": "#4a5b61",
    "700": "#334247",
    "800": "#1e2b30",
    "900": "#0a161a",
    "950": "#030c0f",
  },
  success: {
    "50": "#e4fce8",
    "100": "#c9f9d4",
    "200": "#93f2ab",
    "300": "#56e380",
    "400": "#1fcb5a",
    "500": "#0daa41",
    "600": "#0a8532",
    "700": "#0b6027",
    "800": "#0a3e1b",
    "900": "#07230e",
    "950": "#041608",
  },
};

const SPECIAL_COLORS: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  current: "currentColor",
};

const SEMANTIC_COLORS: Record<string, string> = {
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
  card: "var(--color-card)",
  "card-foreground": "var(--color-card-foreground)",
  popover: "var(--color-popover)",
  "popover-foreground": "var(--color-popover-foreground)",
  primary: "var(--color-primary)",
  "primary-foreground": "var(--color-primary-foreground)",
  secondary: "var(--color-secondary)",
  "secondary-foreground": "var(--color-secondary-foreground)",
  muted: "var(--color-muted)",
  "muted-foreground": "var(--color-muted-foreground)",
  accent: "var(--color-accent)",
  "accent-foreground": "var(--color-accent-foreground)",
  destructive: "var(--color-destructive)",
  border: "var(--color-border)",
  input: "var(--color-input)",
  ring: "var(--color-ring)",
};

// ---------------------------------------------------------------------------
// Builder functions
// ---------------------------------------------------------------------------

function spacingEntries(): CompletionEntry[] {
  const SPACING_PROP_MAP: Record<string, readonly string[]> = {
    p: ["padding"],
    px: ["paddingLeft", "paddingRight"],
    py: ["paddingTop", "paddingBottom"],
    pt: ["paddingTop"],
    pr: ["paddingRight"],
    pb: ["paddingBottom"],
    pl: ["paddingLeft"],
    m: ["margin"],
    mx: ["marginLeft", "marginRight"],
    my: ["marginTop", "marginBottom"],
    mt: ["marginTop"],
    mr: ["marginRight"],
    mb: ["marginBottom"],
    ml: ["marginLeft"],
    gap: ["gap"],
    "gap-x": ["columnGap"],
    "gap-y": ["rowGap"],
    "space-x": ["columnGap"],
    "space-y": ["rowGap"],
  };
  const entries: CompletionEntry[] = [];
  for (const [prefix, props] of Object.entries(SPACING_PROP_MAP)) {
    for (const [val, cssVal] of Object.entries(SPACING)) {
      entries.push({
        label: `${prefix}-${val}`,
        detail: props.map((p) => `${p}: ${cssVal}`).join("; "),
      });
    }
  }
  return entries;
}

function colorEntries(): CompletionEntry[] {
  const COLOR_PROP_MAP: Record<string, string> = {
    bg: "backgroundColor",
    text: "color",
    border: "borderColor",
    outline: "outlineColor",
  };
  const entries: CompletionEntry[] = [];
  for (const [prefix, cssProp] of Object.entries(COLOR_PROP_MAP)) {
    for (const [name, hex] of Object.entries(SPECIAL_COLORS)) {
      entries.push({
        label: `${prefix}-${name}`,
        detail: `${cssProp}: ${hex}`,
        documentation: hex,
      });
    }
    for (const [name, cssVar] of Object.entries(SEMANTIC_COLORS)) {
      entries.push({
        label: `${prefix}-${name}`,
        detail: `${cssProp}: ${cssVar}`,
      });
    }
    for (const [colorName, shades] of Object.entries(COLORS)) {
      for (const [shade, hex] of Object.entries(shades)) {
        entries.push({
          label: `${prefix}-${colorName}-${shade}`,
          detail: `${cssProp}: ${hex}`,
          documentation: hex,
        });
      }
    }
  }
  // ring colors
  for (const [name, hex] of Object.entries(SPECIAL_COLORS)) {
    entries.push({
      label: `ring-${name}`,
      detail: `boxShadow ring: ${hex}`,
      documentation: hex,
    });
  }
  for (const [colorName, shades] of Object.entries(COLORS)) {
    for (const [shade, hex] of Object.entries(shades)) {
      entries.push({
        label: `ring-${colorName}-${shade}`,
        detail: `boxShadow ring: ${hex}`,
        documentation: hex,
      });
    }
  }
  return entries;
}

function sizingEntries(): CompletionEntry[] {
  const SIZE_PROP_MAP: Record<string, string> = {
    w: "width",
    h: "height",
    "min-w": "minWidth",
    "min-h": "minHeight",
    "max-w": "maxWidth",
    "max-h": "maxHeight",
  };
  const SIZE_KEYWORDS: Record<string, string> = {
    auto: "auto",
    full: "100%",
    screen: "100vh",
    svh: "100svh",
    dvh: "100dvh",
    min: "min-content",
    max: "max-content",
    fit: "fit-content",
    "1/2": "50%",
    "1/3": "33.333%",
    "2/3": "66.667%",
    "1/4": "25%",
    "3/4": "75%",
  };
  const MAX_W_EXTRA: Record<string, string> = {
    none: "none",
    xs: "320px",
    sm: "384px",
    md: "448px",
    lg: "512px",
    xl: "576px",
    "2xl": "672px",
    "3xl": "768px",
    "4xl": "896px",
    "5xl": "1024px",
    "6xl": "1152px",
    "7xl": "1280px",
    prose: "65ch",
    "screen-sm": "640px",
    "screen-md": "768px",
    "screen-lg": "1024px",
    "screen-xl": "1280px",
    "screen-2xl": "1536px",
  };
  const entries: CompletionEntry[] = [];
  for (const [prefix, cssProp] of Object.entries(SIZE_PROP_MAP)) {
    for (const [val, cssVal] of Object.entries(SPACING)) {
      entries.push({
        label: `${prefix}-${val}`,
        detail: `${cssProp}: ${cssVal}`,
      });
    }
    for (const [val, cssVal] of Object.entries(SIZE_KEYWORDS)) {
      entries.push({
        label: `${prefix}-${val}`,
        detail: `${cssProp}: ${cssVal}`,
      });
    }
    if (prefix === "max-w") {
      for (const [val, cssVal] of Object.entries(MAX_W_EXTRA)) {
        entries.push({
          label: `${prefix}-${val}`,
          detail: `${cssProp}: ${cssVal}`,
        });
      }
    }
  }
  return entries;
}

function typographyEntries(): CompletionEntry[] {
  const FONT_SIZES: Record<string, string> = {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
    "4xl": "36px",
    "5xl": "48px",
    "6xl": "60px",
    "7xl": "72px",
    "8xl": "96px",
    "9xl": "128px",
  };
  const FONT_WEIGHTS: Record<string, string> = {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  };
  const LINE_HEIGHTS: Record<string, string> = {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "7": "28px",
    "8": "32px",
    "9": "36px",
    "10": "40px",
  };
  const LETTER_SPACINGS: Record<string, string> = {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0em",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  };
  const entries: CompletionEntry[] = [];
  for (const [k, v] of Object.entries(FONT_SIZES))
    entries.push({ label: `text-${k}`, detail: `fontSize: ${v}` });
  for (const [k, v] of Object.entries(FONT_WEIGHTS))
    entries.push({ label: `font-${k}`, detail: `fontWeight: ${v}` });
  entries.push({
    label: "font-sans",
    detail: "fontFamily: ui-sans-serif, system-ui, sans-serif...",
  });
  entries.push({
    label: "font-serif",
    detail: "fontFamily: ui-serif, Georgia, serif...",
  });
  entries.push({
    label: "font-mono",
    detail: "fontFamily: ui-monospace, Menlo, monospace...",
  });
  for (const [k, v] of Object.entries(LINE_HEIGHTS))
    entries.push({ label: `leading-${k}`, detail: `lineHeight: ${v}` });
  for (const [k, v] of Object.entries(LETTER_SPACINGS))
    entries.push({ label: `tracking-${k}`, detail: `letterSpacing: ${v}` });
  entries.push({ label: "text-left", detail: "textAlign: left" });
  entries.push({ label: "text-center", detail: "textAlign: center" });
  entries.push({ label: "text-right", detail: "textAlign: right" });
  entries.push({ label: "text-justify", detail: "textAlign: justify" });
  entries.push({ label: "underline", detail: "textDecoration: underline" });
  entries.push({
    label: "line-through",
    detail: "textDecoration: line-through",
  });
  entries.push({ label: "no-underline", detail: "textDecoration: none" });
  entries.push({ label: "uppercase", detail: "textTransform: uppercase" });
  entries.push({ label: "lowercase", detail: "textTransform: lowercase" });
  entries.push({ label: "capitalize", detail: "textTransform: capitalize" });
  entries.push({ label: "normal-case", detail: "textTransform: none" });
  entries.push({ label: "italic", detail: "fontStyle: italic" });
  entries.push({ label: "not-italic", detail: "fontStyle: normal" });
  entries.push({
    label: "truncate",
    detail: "overflow: hidden; textOverflow: ellipsis; whiteSpace: nowrap",
  });
  entries.push({ label: "text-ellipsis", detail: "textOverflow: ellipsis" });
  entries.push({ label: "text-clip", detail: "textOverflow: clip" });
  entries.push({ label: "whitespace-normal", detail: "whiteSpace: normal" });
  entries.push({ label: "whitespace-nowrap", detail: "whiteSpace: nowrap" });
  entries.push({ label: "whitespace-pre", detail: "whiteSpace: pre" });
  entries.push({
    label: "whitespace-pre-wrap",
    detail: "whiteSpace: pre-wrap",
  });
  entries.push({
    label: "whitespace-pre-line",
    detail: "whiteSpace: pre-line",
  });
  entries.push({
    label: "break-normal",
    detail: "overflowWrap: normal; wordBreak: normal",
  });
  entries.push({ label: "break-words", detail: "overflowWrap: break-word" });
  entries.push({ label: "break-all", detail: "wordBreak: break-all" });
  entries.push({ label: "break-keep", detail: "wordBreak: keep-all" });
  return entries;
}

function layoutEntries(): CompletionEntry[] {
  const DISPLAY: Record<string, string> = {
    block: "block",
    "inline-block": "inline-block",
    inline: "inline",
    flex: "flex",
    "inline-flex": "inline-flex",
    grid: "grid",
    "inline-grid": "inline-grid",
    hidden: "none",
    table: "table",
    "table-row": "table-row",
    "table-cell": "table-cell",
  };
  const POSITION: Record<string, string> = {
    static: "static",
    relative: "relative",
    absolute: "absolute",
    fixed: "fixed",
    sticky: "sticky",
  };
  const INSET_PROP_MAP: Record<string, readonly string[]> = {
    top: ["top"],
    right: ["right"],
    bottom: ["bottom"],
    left: ["left"],
    inset: ["top", "right", "bottom", "left"],
    "inset-x": ["left", "right"],
    "inset-y": ["top", "bottom"],
  };
  const INSET_KEYWORDS: Record<string, string> = {
    auto: "auto",
    full: "100%",
    "1/2": "50%",
    "1/3": "33.333%",
    "2/3": "66.667%",
    "1/4": "25%",
    "3/4": "75%",
  };
  const entries: CompletionEntry[] = [];
  for (const [k, v] of Object.entries(DISPLAY))
    entries.push({ label: k, detail: `display: ${v}` });
  for (const [k, v] of Object.entries(POSITION))
    entries.push({ label: k, detail: `position: ${v}` });
  for (const [prefix, props] of Object.entries(INSET_PROP_MAP)) {
    for (const [val, cssVal] of Object.entries(SPACING)) {
      entries.push({
        label: `${prefix}-${val}`,
        detail: props.map((p) => `${p}: ${cssVal}`).join("; "),
      });
    }
    for (const [val, cssVal] of Object.entries(INSET_KEYWORDS)) {
      entries.push({
        label: `${prefix}-${val}`,
        detail: props.map((p) => `${p}: ${cssVal}`).join("; "),
      });
    }
  }
  for (const z of [0, 10, 20, 30, 40, 50])
    entries.push({ label: `z-${z}`, detail: `zIndex: ${z}` });
  entries.push({ label: "z-auto", detail: "zIndex: auto" });
  for (const op of [
    0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100,
  ]) {
    entries.push({ label: `opacity-${op}`, detail: `opacity: ${op / 100}` });
  }
  entries.push({ label: "visible", detail: "visibility: visible" });
  entries.push({ label: "invisible", detail: "visibility: hidden" });
  entries.push({ label: "collapse", detail: "visibility: collapse" });
  for (const v of ["auto", "hidden", "clip", "visible", "scroll"]) {
    entries.push({ label: `overflow-${v}`, detail: `overflow: ${v}` });
    entries.push({ label: `overflow-x-${v}`, detail: `overflowX: ${v}` });
    entries.push({ label: `overflow-y-${v}`, detail: `overflowY: ${v}` });
  }
  entries.push({ label: "aspect-auto", detail: "aspectRatio: auto" });
  entries.push({ label: "aspect-square", detail: "aspectRatio: 1 / 1" });
  entries.push({ label: "aspect-video", detail: "aspectRatio: 16 / 9" });
  entries.push({ label: "float-left", detail: "float: left" });
  entries.push({ label: "float-right", detail: "float: right" });
  entries.push({ label: "float-none", detail: "float: none" });
  entries.push({ label: "clear-left", detail: "clear: left" });
  entries.push({ label: "clear-right", detail: "clear: right" });
  entries.push({ label: "clear-both", detail: "clear: both" });
  entries.push({ label: "clear-none", detail: "clear: none" });
  entries.push({ label: "isolate", detail: "isolation: isolate" });
  entries.push({ label: "isolation-auto", detail: "isolation: auto" });
  entries.push({ label: "box-border", detail: "boxSizing: border-box" });
  entries.push({ label: "box-content", detail: "boxSizing: content-box" });
  return entries;
}

function flexboxEntries(): CompletionEntry[] {
  const entries: CompletionEntry[] = [];
  const FLEX_DIRECTION = {
    "flex-row": "row",
    "flex-row-reverse": "row-reverse",
    "flex-col": "column",
    "flex-col-reverse": "column-reverse",
  };
  const FLEX_WRAP = {
    "flex-wrap": "wrap",
    "flex-wrap-reverse": "wrap-reverse",
    "flex-nowrap": "nowrap",
  };
  const ALIGN_ITEMS = {
    "items-start": "flex-start",
    "items-end": "flex-end",
    "items-center": "center",
    "items-baseline": "baseline",
    "items-stretch": "stretch",
  };
  const ALIGN_SELF = {
    "self-auto": "auto",
    "self-start": "flex-start",
    "self-end": "flex-end",
    "self-center": "center",
    "self-stretch": "stretch",
  };
  const JUSTIFY_CONTENT = {
    "justify-start": "flex-start",
    "justify-end": "flex-end",
    "justify-center": "center",
    "justify-between": "space-between",
    "justify-around": "space-around",
    "justify-evenly": "space-evenly",
  };
  const ALIGN_CONTENT = {
    "content-start": "flex-start",
    "content-end": "flex-end",
    "content-center": "center",
    "content-between": "space-between",
    "content-around": "space-around",
    "content-evenly": "space-evenly",
    "content-stretch": "stretch",
  };
  const FLEX_VALUES = {
    "flex-1": "1 1 0%",
    "flex-auto": "1 1 auto",
    "flex-initial": "0 1 auto",
    "flex-none": "none",
  };
  const PLACE_CONTENT = {
    "place-content-start": "start",
    "place-content-end": "end",
    "place-content-center": "center",
    "place-content-between": "space-between",
    "place-content-around": "space-around",
    "place-content-evenly": "space-evenly",
    "place-content-stretch": "stretch",
  };
  const PLACE_ITEMS = {
    "place-items-start": "start",
    "place-items-end": "end",
    "place-items-center": "center",
    "place-items-baseline": "baseline",
    "place-items-stretch": "stretch",
  };
  const PLACE_SELF = {
    "place-self-auto": "auto",
    "place-self-start": "start",
    "place-self-end": "end",
    "place-self-center": "center",
    "place-self-stretch": "stretch",
  };

  for (const [k, v] of Object.entries(FLEX_DIRECTION))
    entries.push({ label: k, detail: `flexDirection: ${v}` });
  for (const [k, v] of Object.entries(FLEX_WRAP))
    entries.push({ label: k, detail: `flexWrap: ${v}` });
  for (const [k, v] of Object.entries(ALIGN_ITEMS))
    entries.push({ label: k, detail: `alignItems: ${v}` });
  for (const [k, v] of Object.entries(ALIGN_SELF))
    entries.push({ label: k, detail: `alignSelf: ${v}` });
  for (const [k, v] of Object.entries(JUSTIFY_CONTENT))
    entries.push({ label: k, detail: `justifyContent: ${v}` });
  for (const [k, v] of Object.entries(ALIGN_CONTENT))
    entries.push({ label: k, detail: `alignContent: ${v}` });
  for (const [k, v] of Object.entries(FLEX_VALUES))
    entries.push({ label: k, detail: `flex: ${v}` });
  for (const [k, v] of Object.entries(PLACE_CONTENT))
    entries.push({ label: k, detail: `placeContent: ${v}` });
  for (const [k, v] of Object.entries(PLACE_ITEMS))
    entries.push({ label: k, detail: `placeItems: ${v}` });
  for (const [k, v] of Object.entries(PLACE_SELF))
    entries.push({ label: k, detail: `placeSelf: ${v}` });
  entries.push({ label: "grow", detail: "flexGrow: 1" });
  entries.push({ label: "grow-0", detail: "flexGrow: 0" });
  entries.push({ label: "shrink", detail: "flexShrink: 1" });
  entries.push({ label: "shrink-0", detail: "flexShrink: 0" });
  for (const [val, cssVal] of Object.entries(SPACING)) {
    entries.push({ label: `basis-${val}`, detail: `flexBasis: ${cssVal}` });
  }
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    entries.push({ label: `order-${n}`, detail: `order: ${n}` });
  }
  entries.push({ label: "order-first", detail: "order: -9999" });
  entries.push({ label: "order-last", detail: "order: 9999" });
  entries.push({ label: "order-none", detail: "order: 0" });
  return entries;
}

function gridEntries(): CompletionEntry[] {
  const entries: CompletionEntry[] = [];
  for (let i = 1; i <= 12; i++) {
    entries.push({
      label: `grid-cols-${i}`,
      detail: `gridTemplateColumns: repeat(${i}, minmax(0, 1fr))`,
    });
    entries.push({
      label: `grid-rows-${i}`,
      detail: `gridTemplateRows: repeat(${i}, minmax(0, 1fr))`,
    });
    entries.push({
      label: `col-span-${i}`,
      detail: `gridColumn: span ${i} / span ${i}`,
    });
    entries.push({
      label: `row-span-${i}`,
      detail: `gridRow: span ${i} / span ${i}`,
    });
  }
  entries.push({
    label: "grid-cols-none",
    detail: "gridTemplateColumns: none",
  });
  entries.push({ label: "grid-rows-none", detail: "gridTemplateRows: none" });
  entries.push({ label: "col-auto", detail: "gridColumn: auto" });
  entries.push({ label: "col-span-full", detail: "gridColumn: 1 / -1" });
  entries.push({ label: "row-auto", detail: "gridRow: auto" });
  entries.push({ label: "row-span-full", detail: "gridRow: 1 / -1" });
  for (const flow of ["row", "col", "dense", "row-dense", "col-dense"]) {
    entries.push({
      label: `grid-flow-${flow}`,
      detail: `gridAutoFlow: ${flow.replace("-", " ")}`,
    });
  }
  entries.push({ label: "auto-cols-auto", detail: "gridAutoColumns: auto" });
  entries.push({
    label: "auto-cols-min",
    detail: "gridAutoColumns: min-content",
  });
  entries.push({
    label: "auto-cols-max",
    detail: "gridAutoColumns: max-content",
  });
  entries.push({
    label: "auto-cols-fr",
    detail: "gridAutoColumns: minmax(0, 1fr)",
  });
  entries.push({ label: "auto-rows-auto", detail: "gridAutoRows: auto" });
  entries.push({ label: "auto-rows-min", detail: "gridAutoRows: min-content" });
  entries.push({ label: "auto-rows-max", detail: "gridAutoRows: max-content" });
  entries.push({
    label: "auto-rows-fr",
    detail: "gridAutoRows: minmax(0, 1fr)",
  });
  return entries;
}

function borderEntries(): CompletionEntry[] {
  const BORDER_WIDTH_PROP_MAP: Record<string, readonly string[]> = {
    border: ["borderWidth"],
    "border-t": ["borderTopWidth"],
    "border-r": ["borderRightWidth"],
    "border-b": ["borderBottomWidth"],
    "border-l": ["borderLeftWidth"],
    "border-x": ["borderLeftWidth", "borderRightWidth"],
    "border-y": ["borderTopWidth", "borderBottomWidth"],
  };
  const BORDER_WIDTHS: Record<string, string> = {
    "": "1px",
    "0": "0px",
    "2": "2px",
    "4": "4px",
    "8": "8px",
  };
  const BORDER_RADIUS_PROP_MAP: Record<string, readonly string[]> = {
    rounded: ["borderRadius"],
    "rounded-t": ["borderTopLeftRadius", "borderTopRightRadius"],
    "rounded-r": ["borderTopRightRadius", "borderBottomRightRadius"],
    "rounded-b": ["borderBottomLeftRadius", "borderBottomRightRadius"],
    "rounded-l": ["borderTopLeftRadius", "borderBottomLeftRadius"],
    "rounded-tl": ["borderTopLeftRadius"],
    "rounded-tr": ["borderTopRightRadius"],
    "rounded-bl": ["borderBottomLeftRadius"],
    "rounded-br": ["borderBottomRightRadius"],
  };
  const BORDER_RADIUS: Record<string, string> = {
    none: "0px",
    sm: "2px",
    "": "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    "2xl": "16px",
    "3xl": "24px",
    full: "9999px",
  };
  const BORDER_STYLES = {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
    double: "double",
    none: "none",
  };
  const entries: CompletionEntry[] = [];
  for (const [prefix, props] of Object.entries(BORDER_WIDTH_PROP_MAP)) {
    for (const [key, val] of Object.entries(BORDER_WIDTHS)) {
      const label = key === "" ? prefix : `${prefix}-${key}`;
      entries.push({
        label,
        detail: props.map((p) => `${p}: ${val}`).join("; "),
      });
    }
  }
  for (const [prefix, props] of Object.entries(BORDER_RADIUS_PROP_MAP)) {
    for (const [key, val] of Object.entries(BORDER_RADIUS)) {
      const label = key === "" ? prefix : `${prefix}-${key}`;
      entries.push({
        label,
        detail: props.map((p) => `${p}: ${val}`).join("; "),
      });
    }
  }
  for (const [k, v] of Object.entries(BORDER_STYLES)) {
    entries.push({ label: `border-${k}`, detail: `borderStyle: ${v}` });
  }
  entries.push({ label: "outline", detail: "outline: 1px solid" });
  entries.push({
    label: "outline-none",
    detail: "outline: 2px solid transparent; outlineOffset: 2px",
  });
  entries.push({ label: "outline-dashed", detail: "outlineStyle: dashed" });
  entries.push({ label: "outline-dotted", detail: "outlineStyle: dotted" });
  entries.push({ label: "outline-double", detail: "outlineStyle: double" });
  for (const w of [0, 1, 2, 4, 8]) {
    entries.push({ label: `outline-${w}`, detail: `outlineWidth: ${w}px` });
    entries.push({
      label: `outline-offset-${w}`,
      detail: `outlineOffset: ${w}px`,
    });
  }
  entries.push({
    label: "ring",
    detail: "boxShadow: 0 0 0 3px var(--ring-color)",
  });
  for (const w of [0, 1, 2, 4, 8]) {
    entries.push({
      label: `ring-${w}`,
      detail: `boxShadow: 0 0 0 ${w}px var(--ring-color)`,
    });
  }
  entries.push({
    label: "ring-inset",
    detail: "boxShadow: inset 0 0 0 3px var(--ring-color)",
  });
  for (const [val] of Object.entries(SPACING)) {
    entries.push({
      label: `divide-x-${val}`,
      detail: "border-left/right divide spacing",
    });
    entries.push({
      label: `divide-y-${val}`,
      detail: "border-top/bottom divide spacing",
    });
  }
  return entries;
}

function shadowEntries(): CompletionEntry[] {
  const SHADOWS: Record<string, string> = {
    "shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "shadow-md":
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "shadow-lg":
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "shadow-xl":
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "shadow-2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "shadow-inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    "shadow-none": "none",
  };
  return Object.entries(SHADOWS).map(([label, v]) => ({
    label,
    detail: `boxShadow: ${v}`,
  }));
}

function backgroundEntries(): CompletionEntry[] {
  const entries: CompletionEntry[] = [];
  entries.push({ label: "bg-auto", detail: "backgroundSize: auto" });
  entries.push({ label: "bg-cover", detail: "backgroundSize: cover" });
  entries.push({ label: "bg-contain", detail: "backgroundSize: contain" });
  for (const pos of [
    "bottom",
    "center",
    "left",
    "left-bottom",
    "left-top",
    "right",
    "right-bottom",
    "right-top",
    "top",
  ]) {
    entries.push({
      label: `bg-${pos}`,
      detail: `backgroundPosition: ${pos.replace("-", " ")}`,
    });
  }
  entries.push({ label: "bg-repeat", detail: "backgroundRepeat: repeat" });
  entries.push({
    label: "bg-no-repeat",
    detail: "backgroundRepeat: no-repeat",
  });
  entries.push({ label: "bg-repeat-x", detail: "backgroundRepeat: repeat-x" });
  entries.push({ label: "bg-repeat-y", detail: "backgroundRepeat: repeat-y" });
  const GRADIENT_DIRS: Record<string, string> = {
    t: "to top",
    tr: "to top right",
    r: "to right",
    br: "to bottom right",
    b: "to bottom",
    bl: "to bottom left",
    l: "to left",
    tl: "to top left",
  };
  for (const [k, dir] of Object.entries(GRADIENT_DIRS)) {
    entries.push({
      label: `bg-gradient-to-${k}`,
      detail: `backgroundImage: linear-gradient(${dir}, ...)`,
    });
  }
  for (const [colorName, shades] of Object.entries(COLORS)) {
    for (const [shade, hex] of Object.entries(shades)) {
      entries.push({
        label: `from-${colorName}-${shade}`,
        detail: `gradient from: ${hex}`,
        documentation: hex,
      });
      entries.push({
        label: `via-${colorName}-${shade}`,
        detail: `gradient via: ${hex}`,
        documentation: hex,
      });
      entries.push({
        label: `to-${colorName}-${shade}`,
        detail: `gradient to: ${hex}`,
        documentation: hex,
      });
    }
  }
  for (const [name, hex] of Object.entries(SPECIAL_COLORS)) {
    entries.push({
      label: `from-${name}`,
      detail: `gradient from: ${hex}`,
      documentation: hex,
    });
    entries.push({
      label: `via-${name}`,
      detail: `gradient via: ${hex}`,
      documentation: hex,
    });
    entries.push({
      label: `to-${name}`,
      detail: `gradient to: ${hex}`,
      documentation: hex,
    });
  }
  return entries;
}

function transitionEntries(): CompletionEntry[] {
  const entries: CompletionEntry[] = [];
  entries.push({
    label: "transition",
    detail: "transition: color, background-color, border-color ... 150ms",
  });
  entries.push({ label: "transition-all", detail: "transition: all 150ms" });
  entries.push({
    label: "transition-colors",
    detail: "transition: color, background-color 150ms",
  });
  entries.push({
    label: "transition-opacity",
    detail: "transition: opacity 150ms",
  });
  entries.push({
    label: "transition-shadow",
    detail: "transition: box-shadow 150ms",
  });
  entries.push({
    label: "transition-transform",
    detail: "transition: transform 150ms",
  });
  entries.push({ label: "transition-none", detail: "transition: none" });
  for (const d of [0, 75, 100, 150, 200, 300, 500, 700, 1000]) {
    entries.push({
      label: `duration-${d}`,
      detail: `transitionDuration: ${d}ms`,
    });
    entries.push({ label: `delay-${d}`, detail: `transitionDelay: ${d}ms` });
  }
  entries.push({
    label: "ease-linear",
    detail: "transitionTimingFunction: linear",
  });
  entries.push({
    label: "ease-in",
    detail: "transitionTimingFunction: cubic-bezier(0.4, 0, 1, 1)",
  });
  entries.push({
    label: "ease-out",
    detail: "transitionTimingFunction: cubic-bezier(0, 0, 0.2, 1)",
  });
  entries.push({
    label: "ease-in-out",
    detail: "transitionTimingFunction: cubic-bezier(0.4, 0, 0.2, 1)",
  });
  return entries;
}

function transformEntries(): CompletionEntry[] {
  const entries: CompletionEntry[] = [];
  for (const v of [0, 50, 75, 90, 95, 100, 105, 110, 125, 150]) {
    entries.push({
      label: `scale-${v}`,
      detail: `transform: scale(${v / 100})`,
    });
  }
  for (const deg of [0, 1, 2, 3, 6, 12, 45, 90, 180]) {
    entries.push({
      label: `rotate-${deg}`,
      detail: `transform: rotate(${deg}deg)`,
    });
    if (deg !== 0)
      entries.push({
        label: `-rotate-${deg}`,
        detail: `transform: rotate(-${deg}deg)`,
      });
  }
  for (const [val, cssVal] of Object.entries(SPACING)) {
    entries.push({
      label: `translate-x-${val}`,
      detail: `transform: translateX(${cssVal})`,
    });
    entries.push({
      label: `translate-y-${val}`,
      detail: `transform: translateY(${cssVal})`,
    });
    entries.push({
      label: `-translate-x-${val}`,
      detail: `transform: translateX(-${cssVal})`,
    });
    entries.push({
      label: `-translate-y-${val}`,
      detail: `transform: translateY(-${cssVal})`,
    });
  }
  return entries;
}

function filterEntries(): CompletionEntry[] {
  const entries: CompletionEntry[] = [];
  const BLUR: Record<string, string> = {
    none: "0",
    sm: "4px",
    "": "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "40px",
    "3xl": "64px",
  };
  for (const [k, v] of Object.entries(BLUR)) {
    const label = k === "" ? "blur" : `blur-${k}`;
    entries.push({ label, detail: `filter: blur(${v})` });
    const bdLabel = k === "" ? "backdrop-blur" : `backdrop-blur-${k}`;
    entries.push({ label: bdLabel, detail: `backdropFilter: blur(${v})` });
  }
  for (const v of [0, 50, 75, 90, 95, 100, 105, 110, 125, 150, 200]) {
    entries.push({
      label: `brightness-${v}`,
      detail: `filter: brightness(${v / 100})`,
    });
    entries.push({
      label: `contrast-${v}`,
      detail: `filter: contrast(${v / 100})`,
    });
    entries.push({
      label: `saturate-${v}`,
      detail: `filter: saturate(${v / 100})`,
    });
  }
  entries.push({ label: "grayscale", detail: "filter: grayscale(100%)" });
  entries.push({ label: "grayscale-0", detail: "filter: grayscale(0)" });
  entries.push({ label: "invert", detail: "filter: invert(100%)" });
  entries.push({ label: "invert-0", detail: "filter: invert(0)" });
  entries.push({ label: "sepia", detail: "filter: sepia(100%)" });
  entries.push({ label: "sepia-0", detail: "filter: sepia(0)" });
  return entries;
}

function interactivityEntries(): CompletionEntry[] {
  const entries: CompletionEntry[] = [];
  const CURSOR = [
    "cursor-auto",
    "cursor-default",
    "cursor-pointer",
    "cursor-wait",
    "cursor-text",
    "cursor-move",
    "cursor-not-allowed",
    "cursor-none",
    "cursor-grab",
    "cursor-grabbing",
    "cursor-crosshair",
    "cursor-help",
    "cursor-progress",
  ];
  for (const c of CURSOR)
    entries.push({ label: c, detail: `cursor: ${c.replace("cursor-", "")}` });
  entries.push({ label: "select-none", detail: "userSelect: none" });
  entries.push({ label: "select-text", detail: "userSelect: text" });
  entries.push({ label: "select-all", detail: "userSelect: all" });
  entries.push({ label: "select-auto", detail: "userSelect: auto" });
  entries.push({ label: "pointer-events-none", detail: "pointerEvents: none" });
  entries.push({ label: "pointer-events-auto", detail: "pointerEvents: auto" });
  entries.push({ label: "resize-none", detail: "resize: none" });
  entries.push({ label: "resize", detail: "resize: both" });
  entries.push({ label: "resize-y", detail: "resize: vertical" });
  entries.push({ label: "resize-x", detail: "resize: horizontal" });
  entries.push({ label: "appearance-none", detail: "appearance: none" });
  entries.push({ label: "appearance-auto", detail: "appearance: auto" });
  entries.push({ label: "touch-none", detail: "touchAction: none" });
  entries.push({ label: "touch-auto", detail: "touchAction: auto" });
  entries.push({ label: "touch-pan-x", detail: "touchAction: pan-x" });
  entries.push({ label: "touch-pan-y", detail: "touchAction: pan-y" });
  entries.push({
    label: "touch-manipulation",
    detail: "touchAction: manipulation",
  });
  entries.push({ label: "will-change-auto", detail: "willChange: auto" });
  entries.push({
    label: "will-change-scroll",
    detail: "willChange: scroll-position",
  });
  entries.push({
    label: "will-change-contents",
    detail: "willChange: contents",
  });
  entries.push({
    label: "will-change-transform",
    detail: "willChange: transform",
  });
  entries.push({
    label: "sr-only",
    detail: "position: absolute; width: 1px; height: 1px; clip: rect(0,0,0,0)",
  });
  entries.push({
    label: "not-sr-only",
    detail: "position: static; width: auto; height: auto",
  });
  entries.push({ label: "object-contain", detail: "objectFit: contain" });
  entries.push({ label: "object-cover", detail: "objectFit: cover" });
  entries.push({ label: "object-fill", detail: "objectFit: fill" });
  entries.push({ label: "object-none", detail: "objectFit: none" });
  entries.push({ label: "object-scale-down", detail: "objectFit: scale-down" });
  entries.push({ label: "list-none", detail: "listStyleType: none" });
  entries.push({ label: "list-disc", detail: "listStyleType: disc" });
  entries.push({ label: "list-decimal", detail: "listStyleType: decimal" });
  entries.push({ label: "list-inside", detail: "listStylePosition: inside" });
  entries.push({ label: "list-outside", detail: "listStylePosition: outside" });
  entries.push({ label: "table-auto", detail: "tableLayout: auto" });
  entries.push({ label: "table-fixed", detail: "tableLayout: fixed" });
  entries.push({
    label: "border-collapse",
    detail: "borderCollapse: collapse",
  });
  entries.push({
    label: "border-separate",
    detail: "borderCollapse: separate",
  });
  return entries;
}

// ---------------------------------------------------------------------------
// Variant prefixes
// ---------------------------------------------------------------------------

const VARIANTS = [
  "hover",
  "focus",
  "active",
  "focus-visible",
  "focus-within",
  "disabled",
  "dark",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let _allCompletions: CompletionEntry[] | null = null;

export function getAllCompletions(): CompletionEntry[] {
  if (_allCompletions) return _allCompletions;

  const base: CompletionEntry[] = [
    ...spacingEntries(),
    ...colorEntries(),
    ...sizingEntries(),
    ...typographyEntries(),
    ...layoutEntries(),
    ...flexboxEntries(),
    ...gridEntries(),
    ...borderEntries(),
    ...shadowEntries(),
    ...backgroundEntries(),
    ...transitionEntries(),
    ...transformEntries(),
    ...filterEntries(),
    ...interactivityEntries(),
  ];

  // Deduplicate base (same label from multiple builders)
  const seen = new Set<string>();
  const deduped: CompletionEntry[] = [];
  for (const e of base) {
    if (!seen.has(e.label)) {
      seen.add(e.label);
      deduped.push(e);
    }
  }

  // Add variant-prefixed entries
  const withVariants: CompletionEntry[] = [...deduped];
  for (const variant of VARIANTS) {
    for (const entry of deduped) {
      withVariants.push({
        label: `${variant}:${entry.label}`,
        detail: `[${variant}] ${entry.detail}`,
        documentation: entry.documentation,
      });
    }
  }

  _allCompletions = withVariants;
  return _allCompletions;
}

/** Return completions that start with the given prefix (last token in a dot string) */
export function getCompletionsForPrefix(prefix: string): CompletionEntry[] {
  if (!prefix) return getAllCompletions();
  const lower = prefix.toLowerCase();
  return getAllCompletions().filter((e) => e.label.startsWith(lower));
}

/** Return a completion entry by exact label */
export function getCompletionByLabel(
  label: string,
): CompletionEntry | undefined {
  return getAllCompletions().find((e) => e.label === label);
}
