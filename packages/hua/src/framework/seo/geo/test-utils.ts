/**
 * @hua-labs/hua/framework - GEO Test Utilities
 *
 * Testing utilities for GEO metadata validation and debugging
 * GEO 메타데이터 검증 및 디버깅을 위한 테스트 유틸리티
 */

import type { GEOMetadata } from './types';

/**
 * Validation result
 * 검증 결과
 */
export interface GEOValidationResult {
  /**
   * Whether the metadata is valid
   */
  valid: boolean;

  /**
   * Array of error messages
   */
  errors: string[];

  /**
   * Array of warning messages
   */
  warnings: string[];
}

/**
 * Validate GEO metadata
 * 
 * GEO 메타데이터의 유효성을 검증합니다.
 * 
 * @param metadata - GEO metadata to validate
 * @returns Validation result with errors and warnings
 * 
 * @example
 * ```tsx
 * const result = validateGEOMetadata(geoMeta);
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateGEOMetadata(metadata: GEOMetadata): GEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate meta tags
  const descMeta = metadata.meta.find(m => m.name === 'description');
  if (!descMeta) {
    errors.push('Missing description meta tag');
  } else if (descMeta.content.length === 0) {
    errors.push('Description meta tag is empty');
  } else if (descMeta.content.length > 160) {
    warnings.push(
      `Description exceeds 160 characters (${descMeta.content.length}). ` +
      'Consider keeping it under 160 for better AI parsing.'
    );
  }

  // Validate JSON-LD
  if (!metadata.jsonLd || metadata.jsonLd.length === 0) {
    errors.push('Missing JSON-LD structured data');
  } else {
    for (const ld of metadata.jsonLd) {
      if (!ld['@context'] || ld['@context'] !== 'https://schema.org') {
        errors.push('Invalid JSON-LD structure: missing or invalid @context');
      }
      if (!ld['@type']) {
        errors.push('Invalid JSON-LD structure: missing @type');
      }
    }
  }

  // Validate URLs in meta tags
  metadata.meta.forEach(meta => {
    if (meta.content.startsWith('http')) {
      try {
        new URL(meta.content);
      } catch {
        errors.push(`Invalid URL in meta tag ${meta.name}: ${meta.content}`);
      }
    }
  });

  // Validate Open Graph tags
  if (metadata.openGraph) {
    const requiredOG = ['og:title', 'og:description', 'og:type'];
    const ogProperties = metadata.openGraph.map(og => og.property);
    for (const required of requiredOG) {
      if (!ogProperties.includes(required)) {
        warnings.push(`Missing recommended Open Graph property: ${required}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Pretty print GEO metadata
 * 
 * GEO 메타데이터를 읽기 쉬운 형식으로 출력합니다.
 * 
 * @param metadata - GEO metadata to print
 * @returns Formatted JSON string
 * 
 * @example
 * ```tsx
 * console.log(prettyPrintGEOMetadata(geoMeta));
 * ```
 */
export function prettyPrintGEOMetadata(metadata: GEOMetadata): string {
  return JSON.stringify(metadata, null, 2);
}

/**
 * Compare two GEO metadata objects
 * 
 * 두 GEO 메타데이터 객체를 비교합니다.
 * 
 * @param a - First GEO metadata
 * @param b - Second GEO metadata
 * @returns Comparison result with differences
 * 
 * @example
 * ```tsx
 * const result = compareGEOMetadata(meta1, meta2);
 * if (!result.same) {
 *   console.log('Differences:', result.differences);
 * }
 * ```
 */
export function compareGEOMetadata(
  a: GEOMetadata,
  b: GEOMetadata
): { same: boolean; differences: string[] } {
  const differences: string[] = [];

  // Compare meta tags
  const aMetaMap = new Map(a.meta.map(m => [m.name, m.content]));
  const bMetaMap = new Map(b.meta.map(m => [m.name, m.content]));

  for (const [name, content] of aMetaMap) {
    if (bMetaMap.get(name) !== content) {
      differences.push(`Meta tag '${name}' differs`);
    }
  }

  for (const [name] of bMetaMap) {
    if (!aMetaMap.has(name)) {
      differences.push(`Meta tag '${name}' missing in first metadata`);
    }
  }

  // Compare JSON-LD count
  if (a.jsonLd.length !== b.jsonLd.length) {
    differences.push(
      `JSON-LD count differs: ${a.jsonLd.length} vs ${b.jsonLd.length}`
    );
  }

  // Compare version
  if (a.version !== b.version) {
    differences.push(`Version differs: ${a.version} vs ${b.version}`);
  }

  return {
    same: differences.length === 0,
    differences,
  };
}
