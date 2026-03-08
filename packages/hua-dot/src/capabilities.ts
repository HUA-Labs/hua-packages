import type { CapabilityLevel, DotTarget } from './types';

/**
 * Capability matrix: utility family → target → support level.
 *
 * This is the single source of truth for what each target supports.
 * Used by explain() and native adapter for dropped/approximated reporting.
 */
export const CAPABILITY_MATRIX: Record<string, Record<DotTarget, CapabilityLevel>> = {
  // Core — universal support
  spacing:       { web: 'native', native: 'native' },
  color:         { web: 'native', native: 'native' },
  typography:    { web: 'native', native: 'native' },
  layout:        { web: 'native', native: 'native' },
  sizing:        { web: 'native', native: 'native' },
  border:        { web: 'native', native: 'native' },
  borderRadius:  { web: 'native', native: 'native' },
  flexbox:       { web: 'native', native: 'native' },
  opacity:       { web: 'native', native: 'native' },
  zIndex:        { web: 'native', native: 'native' },
  positioning:   { web: 'native', native: 'native' },

  // Native with approximation on RN
  shadow:        { web: 'native', native: 'approximate' },
  transform:     { web: 'native', native: 'native' },

  // Web-native, partial or unsupported on RN
  transition:    { web: 'native', native: 'unsupported' },
  animation:     { web: 'native', native: 'unsupported' },
  filter:        { web: 'native', native: 'unsupported' },
  backdropFilter:{ web: 'native', native: 'unsupported' },
  mixBlendMode:  { web: 'native', native: 'unsupported' },
  grid:          { web: 'native', native: 'unsupported' },
  ring:          { web: 'native', native: 'approximate' },
  lineClamp:     { web: 'native', native: 'native' },
  interactivity: { web: 'native', native: 'unsupported' },
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
  fontStyle: 'typography', wordBreak: 'typography', overflowWrap: 'typography',
  whiteSpace: 'typography', textOverflow: 'typography',

  // layout
  display: 'layout', overflow: 'layout', overflowX: 'layout', overflowY: 'layout',

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

  // flexbox
  flexDirection: 'flexbox', flexWrap: 'flexbox', alignItems: 'flexbox',
  alignSelf: 'flexbox', justifyContent: 'flexbox', flexGrow: 'flexbox',
  flexShrink: 'flexbox', flex: 'flexbox', order: 'flexbox',

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

  // interactivity
  cursor: 'interactivity', userSelect: 'interactivity',
  resize: 'interactivity', pointerEvents: 'interactivity',
  touchAction: 'interactivity',

  // aspect ratio
  aspectRatio: 'layout',

  // visibility
  visibility: 'layout',

  // line-clamp (vendor-prefixed web output)
  WebkitLineClamp: 'lineClamp',
  WebkitBoxOrient: 'lineClamp',
};

/**
 * Get capability level for a CSS property on a target platform.
 */
export function getCapability(property: string, target: DotTarget): CapabilityLevel {
  const family = PROPERTY_TO_FAMILY[property];
  if (!family) return 'unsupported';
  return CAPABILITY_MATRIX[family]?.[target] ?? 'unsupported';
}
