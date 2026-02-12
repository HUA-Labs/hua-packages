/**
 * @hua-labs/hua-ux/framework - Structured Data Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateSoftwareApplicationLD,
  generateFAQPageLD,
  generateTechArticleLD,
  generateHowToLD,
} from '../../../seo/geo/structuredData';
import type { GEOConfig } from '../../../seo/geo/types';

describe('generateSoftwareApplicationLD', () => {
  const baseConfig: GEOConfig = {
    name: 'Test App',
    description: 'A test application',
  };

  it('should generate basic SoftwareApplication JSON-LD', () => {
    const result = generateSoftwareApplicationLD(baseConfig);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('SoftwareApplication');
    expect(result.name).toBe('Test App');
    expect(result.description).toBe('A test application');
  });

  it('should include alternate names', () => {
    const config: GEOConfig = {
      ...baseConfig,
      alternateName: ['test-app', '@test/app'],
    };

    const result = generateSoftwareApplicationLD(config);

    expect(result.alternateName).toEqual(['test-app', '@test/app']);
  });

  it('should include version', () => {
    const config: GEOConfig = {
      ...baseConfig,
      version: '1.0.0',
    };

    const result = generateSoftwareApplicationLD(config);

    expect(result.softwareVersion).toBe('1.0.0');
  });

  it('should include application category', () => {
    const config: GEOConfig = {
      ...baseConfig,
      applicationCategory: 'UX Framework',
    };

    const result = generateSoftwareApplicationLD(config);

    expect(result.applicationCategory).toBe('UX Framework');
  });

  it('should handle multiple application categories', () => {
    const config: GEOConfig = {
      ...baseConfig,
      applicationCategory: ['UX Framework', 'Developer Tool'],
    };

    const result = generateSoftwareApplicationLD(config);

    expect(result.applicationCategory).toBe('UX Framework, Developer Tool');
  });

  it('should include programming language', () => {
    const config: GEOConfig = {
      ...baseConfig,
      programmingLanguage: 'TypeScript',
    };

    const result = generateSoftwareApplicationLD(config);

    expect(result.programmingLanguage).toBe('TypeScript');
  });

  it('should include URLs', () => {
    const config: GEOConfig = {
      ...baseConfig,
      url: 'https://example.com',
      documentationUrl: 'https://example.com/docs',
      codeRepository: 'https://github.com/example/app',
    };

    const result = generateSoftwareApplicationLD(config);

    expect(result.url).toBe('https://example.com');
    expect(result.softwareHelp).toBeDefined();
    expect(result.softwareHelp?.['@type']).toBe('CreativeWork');
    expect(result.codeRepository).toBe('https://github.com/example/app');
  });

  it('should include license', () => {
    const config: GEOConfig = {
      ...baseConfig,
      license: 'MIT',
    };

    const result = generateSoftwareApplicationLD(config);

    expect(result.license).toBe('MIT');
  });

  it('should include author', () => {
    const config: GEOConfig = {
      ...baseConfig,
      author: {
        name: 'Test Author',
        url: 'https://example.com/author',
      },
    };

    const result = generateSoftwareApplicationLD(config);

    expect(result.author).toBeDefined();
    expect(result.author?.['@type']).toBe('Organization');
    expect(result.author?.name).toBe('Test Author');
    expect(result.author?.url).toBe('https://example.com/author');
  });

  it('should include features', () => {
    const config: GEOConfig = {
      ...baseConfig,
      features: ['i18n', 'Motion', 'Accessibility'],
    };

    const result = generateSoftwareApplicationLD(config);

    expect(result.featureList).toBe('i18n, Motion, Accessibility');
  });

  it('should include keywords', () => {
    const config: GEOConfig = {
      ...baseConfig,
      keywords: ['react', 'nextjs'],
    };

    const result = generateSoftwareApplicationLD(config);

    expect(result.keywords).toBe('react, nextjs');
  });
});

describe('generateFAQPageLD', () => {
  it('should generate FAQPage JSON-LD', () => {
    const faqs = [
      { question: 'What is it?', answer: 'It is a test app' },
      { question: 'How to use?', answer: 'Just use it' },
    ];

    const result = generateFAQPageLD(faqs);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('FAQPage');
    expect(result.mainEntity).toBeDefined();
    expect(result.mainEntity.length).toBe(2);
  });

  it('should format FAQ items correctly', () => {
    const faqs = [
      { question: 'What is it?', answer: 'It is a test app' },
    ];

    const result = generateFAQPageLD(faqs);

    const question = result.mainEntity[0];
    expect(question['@type']).toBe('Question');
    expect(question.name).toBe('What is it?');
    expect(question.acceptedAnswer['@type']).toBe('Answer');
    expect(question.acceptedAnswer.text).toBe('It is a test app');
  });
});

describe('generateTechArticleLD', () => {
  it('should generate TechArticle JSON-LD', () => {
    const article = {
      headline: 'Test Article',
      description: 'A test article',
      datePublished: '2025-12-29',
      author: { name: 'Test Author' },
    };

    const result = generateTechArticleLD(article);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('TechArticle');
    expect(result.headline).toBe('Test Article');
    expect(result.description).toBe('A test article');
    expect(result.datePublished).toBe('2025-12-29');
  });

  it('should include optional fields', () => {
    const article = {
      headline: 'Test Article',
      dateModified: '2025-12-30',
      image: 'https://example.com/image.jpg',
    };

    const result = generateTechArticleLD(article);

    expect(result.dateModified).toBe('2025-12-30');
    expect(result.image).toBe('https://example.com/image.jpg');
  });
});

describe('generateHowToLD', () => {
  it('should generate HowTo JSON-LD', () => {
    const howTo = {
      name: 'How to test',
      description: 'A test guide',
      steps: [
        { name: 'Step 1', text: 'Do this' },
        { name: 'Step 2', text: 'Do that' },
      ],
    };

    const result = generateHowToLD(howTo);

    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('HowTo');
    expect(result.name).toBe('How to test');
    expect(result.description).toBe('A test guide');
    expect(result.step).toBeDefined();
    expect(result.step.length).toBe(2);
  });

  it('should format steps correctly', () => {
    const howTo = {
      name: 'How to test',
      steps: [
        { name: 'Step 1', text: 'Do this' },
      ],
    };

    const result = generateHowToLD(howTo);

    const step = result.step[0];
    expect(step['@type']).toBe('HowToStep');
    expect(step.position).toBe(1);
    expect(step.name).toBe('Step 1');
    expect(step.text).toBe('Do this');
  });

  it('should include totalTime when provided', () => {
    const howTo = {
      name: 'How to test',
      steps: [{ name: 'Step 1', text: 'Do this' }],
      totalTime: 'PT10M',
    };

    const result = generateHowToLD(howTo);

    expect(result.totalTime).toBe('PT10M');
  });
});
