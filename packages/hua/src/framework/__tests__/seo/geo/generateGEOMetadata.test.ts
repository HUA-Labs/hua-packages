/**
 * @hua-labs/hua-ux/framework - GEO Metadata Generator Tests
 */

import { describe, it, expect } from 'vitest';
import { generateGEOMetadata, createAIContext } from '../../../seo/geo/generateGEOMetadata';
import type { GEOConfig } from '../../../seo/geo/types';

describe('generateGEOMetadata', () => {
  const baseConfig: GEOConfig = {
    name: 'Test App',
    description: 'A test application',
  };

  it('should generate basic metadata', () => {
    const result = generateGEOMetadata(baseConfig);

    expect(result).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.jsonLd).toBeDefined();
    expect(result.openGraph).toBeDefined();
    expect(result.twitter).toBeDefined();
  });

  it('should include description in meta tags', () => {
    const result = generateGEOMetadata(baseConfig);

    const descriptionMeta = result.meta.find((m) => m.name === 'description');
    expect(descriptionMeta).toBeDefined();
    expect(descriptionMeta?.content).toBe('A test application');
  });

  it('should include keywords when provided', () => {
    const config: GEOConfig = {
      ...baseConfig,
      keywords: ['react', 'nextjs', 'typescript'],
    };

    const result = generateGEOMetadata(config);

    const keywordsMeta = result.meta.find((m) => m.name === 'keywords');
    expect(keywordsMeta).toBeDefined();
    expect(keywordsMeta?.content).toBe('react, nextjs, typescript');
  });

  it('should include version when provided', () => {
    const config: GEOConfig = {
      ...baseConfig,
      version: '1.0.0',
    };

    const result = generateGEOMetadata(config);

    const versionMeta = result.meta.find((m) => m.name === 'software:version');
    expect(versionMeta).toBeDefined();
    expect(versionMeta?.content).toBe('1.0.0');
  });

  it('should include application category when provided', () => {
    const config: GEOConfig = {
      ...baseConfig,
      applicationCategory: 'UX Framework',
    };

    const result = generateGEOMetadata(config);

    const categoryMeta = result.meta.find((m) => m.name === 'software:category');
    expect(categoryMeta).toBeDefined();
    expect(categoryMeta?.content).toBe('UX Framework');
  });

  it('should handle multiple application categories', () => {
    const config: GEOConfig = {
      ...baseConfig,
      applicationCategory: ['UX Framework', 'Developer Tool'],
    };

    const result = generateGEOMetadata(config);

    const categoryMeta = result.meta.find((m) => m.name === 'software:category');
    expect(categoryMeta).toBeDefined();
    expect(categoryMeta?.content).toBe('UX Framework, Developer Tool');
  });

  it('should include programming language when provided', () => {
    const config: GEOConfig = {
      ...baseConfig,
      programmingLanguage: 'TypeScript',
    };

    const result = generateGEOMetadata(config);

    const languageMeta = result.meta.find((m) => m.name === 'software:language');
    expect(languageMeta).toBeDefined();
    expect(languageMeta?.content).toBe('TypeScript');
  });

  it('should generate Open Graph tags', () => {
    const result = generateGEOMetadata(baseConfig);

    expect(result.openGraph).toBeDefined();
    expect(result.openGraph?.length).toBeGreaterThan(0);

    const ogTitle = result.openGraph?.find((og) => og.property === 'og:title');
    expect(ogTitle).toBeDefined();
    expect(ogTitle?.content).toBe('Test App');
  });

  it('should generate Twitter Card tags', () => {
    const result = generateGEOMetadata(baseConfig);

    expect(result.twitter).toBeDefined();
    expect(result.twitter?.length).toBeGreaterThan(0);

    const twitterCard = result.twitter?.find((t) => t.name === 'twitter:card');
    expect(twitterCard).toBeDefined();
    expect(twitterCard?.content).toBe('summary_large_image');
  });

  it('should include URL in Open Graph when provided', () => {
    const config: GEOConfig = {
      ...baseConfig,
      url: 'https://example.com',
    };

    const result = generateGEOMetadata(config);

    const ogUrl = result.openGraph?.find((og) => og.property === 'og:url');
    expect(ogUrl).toBeDefined();
    expect(ogUrl?.content).toBe('https://example.com');
  });

  it('should generate JSON-LD structured data', () => {
    const result = generateGEOMetadata(baseConfig);

    expect(result.jsonLd).toBeDefined();
    expect(result.jsonLd.length).toBeGreaterThan(0);

    const jsonLd = result.jsonLd[0];
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('SoftwareApplication');
    expect(jsonLd.name).toBe('Test App');
    expect(jsonLd.description).toBe('A test application');
  });
});

describe('createAIContext', () => {
  it('should create basic context', () => {
    const config: GEOConfig = {
      name: 'Test App',
      description: 'A test application',
    };

    const context = createAIContext(config);

    expect(context).toContain('Test App');
    expect(context).toContain('A test application');
  });

  it('should include features when provided', () => {
    const config: GEOConfig = {
      name: 'Test App',
      description: 'A test application',
      features: ['i18n', 'Motion', 'Accessibility'],
    };

    const context = createAIContext(config);

    expect(context).toContain('Key features include: i18n, Motion, Accessibility');
  });

  it('should include use cases when provided', () => {
    const config: GEOConfig = {
      name: 'Test App',
      description: 'A test application',
      useCases: ['Multilingual apps', 'Accessible UX'],
    };

    const context = createAIContext(config);

    expect(context).toContain('Common use cases: Multilingual apps, Accessible UX');
  });

  it('should include programming language when provided', () => {
    const config: GEOConfig = {
      name: 'Test App',
      description: 'A test application',
      programmingLanguage: ['TypeScript', 'React'],
    };

    const context = createAIContext(config);

    expect(context).toContain('Built with: TypeScript, React');
  });

  it('should include software requirements when provided', () => {
    const config: GEOConfig = {
      name: 'Test App',
      description: 'A test application',
      softwareRequirements: ['Node.js 18+', 'React 19+'],
    };

    const context = createAIContext(config);

    expect(context).toContain('Requires: Node.js 18+, React 19+');
  });
});
