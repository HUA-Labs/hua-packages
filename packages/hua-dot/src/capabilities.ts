import type { CapabilityLevel, DotTarget } from './types';

/**
 * Capability matrix: utility family → target → support level.
 *
 * This is the single source of truth for what each target supports.
 * Used by explain() and native adapter for dropped/approximated reporting.
 */
export const CAPABILITY_MATRIX: Record<string, Partial<Record<DotTarget, CapabilityLevel>>> = {
  // Core — universal support
  spacing:       { web: 'native', native: 'native',  flutter: 'native' },
  color:         { web: 'native', native: 'native',  flutter: 'native' },
  typography:    { web: 'native', native: 'native',  flutter: 'native' },
  layout:        { web: 'native', native: 'native',  flutter: 'native' },
  sizing:        { web: 'native', native: 'native',  flutter: 'native' },
  border:        { web: 'native', native: 'native',  flutter: 'native' },
  borderRadius:  { web: 'native', native: 'native',  flutter: 'native' },
  flexbox:       { web: 'native', native: 'native',  flutter: 'native' },
  opacity:       { web: 'native', native: 'native',  flutter: 'native' },
  zIndex:        { web: 'native', native: 'native',  flutter: 'approximate' },
  positioning:   { web: 'native', native: 'native',  flutter: 'recipe-only' },

  // Shadow/transform
  shadow:        { web: 'native', native: 'approximate', flutter: 'native' },
  transform:     { web: 'native', native: 'native',      flutter: 'native' },

  // Web-native, partial or unsupported on mobile
  transition:    { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  animation:     { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  filter:        { web: 'native', native: 'unsupported', flutter: 'plugin-backed' },
  backdropFilter:{ web: 'native', native: 'unsupported', flutter: 'plugin-backed' },
  mixBlendMode:  { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  grid:          { web: 'native', native: 'unsupported', flutter: 'recipe-only' },
  ring:          { web: 'native', native: 'approximate', flutter: 'native' },
  lineClamp:     { web: 'native', native: 'native',      flutter: 'native' },
  interactivity: { web: 'native', native: 'unsupported', flutter: 'unsupported' },

  // Wave 2: extended families
  objectFit:     { web: 'native', native: 'approximate', flutter: 'recipe-only' },
  objectPosition:{ web: 'native', native: 'unsupported', flutter: 'unsupported' },
  float:         { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  table:         { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  list:          { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  scroll:        { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  touchAction:   { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  willChange:    { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  wordBreak:     { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  isolation:     { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  gradient:      { web: 'native', native: 'unsupported', flutter: 'recipe-only' },

  // Fine-grained families for props that don't match their parent family's support
  display:              { web: 'native', native: 'approximate', flutter: 'approximate' },  // only flex/none (RN), flex/inline-flex (Flutter)
  visibility:           { web: 'native', native: 'unsupported', flutter: 'native' },  // Flutter: recipe.visible
  pointerEvents:        { web: 'native', native: 'native',      flutter: 'unsupported' },
  flexShrinkDetail:     { web: 'native', native: 'native',      flutter: 'unsupported' },
  alignSelfDetail:      { web: 'native', native: 'native',      flutter: 'unsupported' },
  textIndent:           { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  textDecorationDetail: { web: 'native', native: 'unsupported', flutter: 'unsupported' },
  textDecorationStyle:  { web: 'native', native: 'native',      flutter: 'unsupported' },
  placeAlignment:       { web: 'native', native: 'unsupported', flutter: 'unsupported' },
};

/**
 * Map a CSS property name to its utility family for capability lookup.
 */
export const PROPERTY_TO_FAMILY: Record<string, string> = {
  // spacing
  padding: 'spacing', paddingTop: 'spacing', paddingRight: 'spacing',
  paddingBottom: 'spacing', paddingLeft: 'spacing',
  margin: 'spacing', marginTop: 'spacing', marginRight: 'spacing',
  marginBottom: 'spacing', marginLeft: 'spacing',
  gap: 'spacing', rowGap: 'spacing', columnGap: 'spacing',

  // color
  backgroundColor: 'color', color: 'color', borderColor: 'color',

  // typography
  fontSize: 'typography', fontWeight: 'typography', fontFamily: 'typography',
  lineHeight: 'typography', letterSpacing: 'typography',
  textAlign: 'typography', textTransform: 'typography',
  textDecoration: 'typography', textDecorationLine: 'typography',
  fontStyle: 'typography',
  whiteSpace: 'typography', textOverflow: 'typography',

  // layout (display/visibility have their own fine-grained families)
  display: 'display', overflow: 'layout', overflowX: 'layout', overflowY: 'layout',

  // sizing
  width: 'sizing', height: 'sizing', minWidth: 'sizing', minHeight: 'sizing',
  maxWidth: 'sizing', maxHeight: 'sizing',

  // border
  borderWidth: 'border', borderTopWidth: 'border', borderRightWidth: 'border',
  borderBottomWidth: 'border', borderLeftWidth: 'border',
  borderStyle: 'border',
  borderRadius: 'borderRadius', borderTopLeftRadius: 'borderRadius',
  borderTopRightRadius: 'borderRadius', borderBottomLeftRadius: 'borderRadius',
  borderBottomRightRadius: 'borderRadius',

  // flexbox (flexShrink/alignSelf have fine-grained families for Flutter)
  flexDirection: 'flexbox', flexWrap: 'flexbox', alignItems: 'flexbox',
  alignSelf: 'alignSelfDetail', justifyContent: 'flexbox', flexGrow: 'flexbox',
  flexShrink: 'flexShrinkDetail', flex: 'flexbox', order: 'flexbox',

  // shadow/ring (after finalization)
  boxShadow: 'shadow',

  // opacity
  opacity: 'opacity',

  // zIndex
  zIndex: 'zIndex',

  // positioning
  position: 'positioning', top: 'positioning', right: 'positioning',
  bottom: 'positioning', left: 'positioning', inset: 'positioning',

  // transform
  transform: 'transform', transformOrigin: 'transform',

  // transition/animation
  transition: 'transition', transitionProperty: 'transition',
  transitionDuration: 'transition', transitionTimingFunction: 'transition',
  transitionDelay: 'transition',
  animation: 'animation',

  // filter
  filter: 'filter',
  backdropFilter: 'backdropFilter',

  // mixBlendMode
  mixBlendMode: 'mixBlendMode',

  // grid
  gridTemplateColumns: 'grid', gridTemplateRows: 'grid',
  gridColumn: 'grid', gridRow: 'grid',
  gridColumnStart: 'grid', gridColumnEnd: 'grid',
  gridRowStart: 'grid', gridRowEnd: 'grid',
  gridAutoColumns: 'grid', gridAutoRows: 'grid',

  // interactivity (pointerEvents has its own family — supported on RN)
  cursor: 'interactivity', userSelect: 'interactivity',
  resize: 'interactivity', pointerEvents: 'pointerEvents',
  touchAction: 'touchAction',
  willChange: 'willChange',

  // aspect ratio
  aspectRatio: 'layout',

  // visibility (own family — unsupported on RN)
  visibility: 'visibility',

  // line-clamp (vendor-prefixed web output)
  WebkitLineClamp: 'lineClamp',
  WebkitBoxOrient: 'lineClamp',

  // Wave 2: extended property families
  objectFit: 'objectFit', objectPosition: 'objectPosition',
  float: 'float', clear: 'float', isolation: 'isolation',
  tableLayout: 'table', borderCollapse: 'table', borderSpacing: 'table', captionSide: 'table',
  listStyleType: 'list', listStylePosition: 'list',
  scrollBehavior: 'scroll',
  scrollMarginTop: 'scroll', scrollMarginRight: 'scroll',
  scrollMarginBottom: 'scroll', scrollMarginLeft: 'scroll',
  scrollPaddingTop: 'scroll', scrollPaddingRight: 'scroll',
  scrollPaddingBottom: 'scroll', scrollPaddingLeft: 'scroll',
  textIndent: 'textIndent',
  textDecorationStyle: 'textDecorationStyle',
  textDecorationThickness: 'textDecorationDetail',
  textUnderlineOffset: 'textDecorationDetail',
  flexBasis: 'flexbox',
  placeContent: 'placeAlignment', placeItems: 'placeAlignment', placeSelf: 'placeAlignment',
  backfaceVisibility: 'transform',
  overflowWrap: 'wordBreak', wordBreak: 'wordBreak',
  backgroundImage: 'gradient',
};

/**
 * Value-level capability overrides for properties where support varies by value.
 * Checked before the property-level family lookup.
 */
const VALUE_OVERRIDES: Record<string, Record<string, Partial<Record<DotTarget, CapabilityLevel>>>> = {
  display: {
    flex:         { native: 'native', flutter: 'native' },
    none:         { native: 'native' },
    'inline-flex': { flutter: 'native' },
  },
};

/**
 * Get capability level for a CSS property on a target platform.
 * Optionally accepts a value for value-dependent capability lookup.
 */
export function getCapability(property: string, target: DotTarget, value?: string): CapabilityLevel {
  // Check value-level override first (strip !important suffix)
  if (value !== undefined) {
    const normalized = value.replace(/\s*!important\s*$/, '');
    const override = VALUE_OVERRIDES[property]?.[normalized]?.[target];
    if (override) return override;
  }

  const family = PROPERTY_TO_FAMILY[property];
  if (!family) return 'unsupported';
  return CAPABILITY_MATRIX[family]?.[target] ?? 'unsupported';
}
