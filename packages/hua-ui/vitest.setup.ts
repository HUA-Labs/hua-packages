import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import { dot } from '@hua-labs/dot';
import { dotCSS } from '@hua-labs/dot/class';

type Declaration = {
  property: string;
  value: string;
};

const normalizeValue = (value: string) =>
  value
    .trim()
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const kebabCase = (value: string) =>
  value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

const parseDeclarations = (css: string): Declaration[] =>
  [...css.matchAll(/\{([^{}]+)\}/g)].flatMap((match) =>
    match[1]
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const separator = declaration.indexOf(':');
        return separator === -1
          ? null
          : {
              property: declaration.slice(0, separator).trim().toLowerCase(),
              value: normalizeValue(declaration.slice(separator + 1)),
            };
      })
      .filter((declaration): declaration is Declaration => declaration !== null),
  );

const getInlineDeclarations = (element: Element): Declaration[] => {
  if (!(element instanceof HTMLElement)) return [];

  return Array.from(element.style).map((property) => ({
    property,
    value: normalizeValue(element.style.getPropertyValue(property)),
  }));
};

const getClassRuleDeclarations = (element: Element): Declaration[] => {
  const classNames = Array.from(element.classList);
  if (classNames.length === 0) return [];

  const cssText = Array.from(element.ownerDocument.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n');

  return classNames.flatMap((className) => {
    const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rulePattern = new RegExp(`\\.${escapedClassName}\\s*\\{([^{}]+)\\}`, 'g');
    return [...cssText.matchAll(rulePattern)].flatMap((match) =>
      parseDeclarations(`{${match[1]}}`),
    );
  });
};

const getExpectedDeclarations = (token: string): Declaration[] => {
  const inlineStyle = dot(token) as Record<string, string | number>;
  const inlineDeclarations = Object.entries(inlineStyle).map(([property, value]) => ({
    property: kebabCase(property),
    value: normalizeValue(String(value)),
  }));

  return [...inlineDeclarations, ...parseDeclarations(dotCSS(token).css)];
};

const hasDeclaration = (actual: Declaration[], expected: Declaration) =>
  actual.some(
    (declaration) =>
      declaration.property === expected.property &&
      declaration.value === expected.value,
  );

expect.extend({
  toHaveDotStyle(received: Element, ...tokens: string[]) {
    const actual = [
      ...getInlineDeclarations(received),
      ...getClassRuleDeclarations(received),
    ];

    const missing = tokens.filter((token) => {
      if (received.classList.contains(token)) return false;

      const expected = getExpectedDeclarations(token);
      return (
        expected.length === 0 ||
        expected.some((declaration) => !hasDeclaration(actual, declaration))
      );
    });

    return {
      pass: missing.length === 0,
      message: () =>
        `expected element ${this.isNot ? 'not ' : ''}to expose dot style tokens: ${tokens.join(', ')}${
          missing.length ? `; missing: ${missing.join(', ')}` : ''
        }`,
    };
  },
});

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveDotStyle(...tokens: string[]): T;
  }

  interface AsymmetricMatchersContaining {
    toHaveDotStyle(...tokens: string[]): unknown;
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as typeof IntersectionObserver;
