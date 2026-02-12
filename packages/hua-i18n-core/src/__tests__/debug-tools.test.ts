import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDebugTools, enableDebugTools, disableDebugTools, DebugTools } from '../core/debug-tools';

describe('debug-tools', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalWindow = global.window;

  beforeEach(() => {
    // Mock window object
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      __HUA_I18N_DEBUG__: undefined,
    } as any;

    // Mock document object
    global.document = {
      body: {
        appendChild: vi.fn(),
      },
      createElement: vi.fn((tag: string) => {
        const element: any = {
          tagName: tag,
          style: {},
          innerHTML: '',
          textContent: '',
          id: '',
          appendChild: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          setAttribute: vi.fn(),
          getAttribute: vi.fn(),
          querySelectorAll: vi.fn().mockReturnValue([]),
          querySelector: vi.fn(),
          remove: vi.fn(),
          getBoundingClientRect: vi.fn().mockReturnValue({
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
          }),
        };
        return element;
      }),
      getElementById: vi.fn(),
      querySelectorAll: vi.fn().mockReturnValue([]),
    } as any;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  describe('createDebugTools', () => {
    it('should return null in production', () => {
      process.env.NODE_ENV = 'production';
      const tools = createDebugTools();
      expect(tools).toBeNull();
    });

    it('should return DebugTools object in development', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();
      expect(tools).not.toBeNull();
      expect(tools).toHaveProperty('highlightMissingKeys');
      expect(tools).toHaveProperty('showTranslationKeys');
      expect(tools).toHaveProperty('performanceMetrics');
      expect(tools).toHaveProperty('devTools');
      expect(tools).toHaveProperty('validateTranslations');
    });

    it('should return DebugTools object in test environment', () => {
      process.env.NODE_ENV = 'test';
      const tools = createDebugTools();
      expect(tools).not.toBeNull();
    });

    it('should have performanceMetrics with initial values', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();
      expect(tools?.performanceMetrics).toEqual({
        translationCount: 0,
        cacheHits: 0,
        cacheMisses: 0,
        loadTimes: [],
      });
    });

    it('should have devTools with correct properties', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();
      expect(tools?.devTools).toHaveProperty('open');
      expect(tools?.devTools).toHaveProperty('close');
      expect(tools?.devTools).toHaveProperty('isOpen');
      expect(tools?.devTools.isOpen).toBe(false);
    });
  });

  describe('highlightMissingKeys', () => {
    it('should highlight elements with missing translations', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();

      const mockElement = {
        getAttribute: vi.fn((attr: string) => (attr === 'data-i18n-key' ? 'test.key' : null)),
        textContent: 'test.key',
        style: {},
        title: '',
      };

      const container = {
        querySelectorAll: vi.fn().mockReturnValue([mockElement]),
      } as any;

      tools?.highlightMissingKeys(container);

      expect(container.querySelectorAll).toHaveBeenCalledWith('[data-i18n-key]');
      expect(mockElement.style.backgroundColor).toBe('#ffeb3b');
      expect(mockElement.style.border).toBe('2px solid #f57c00');
      expect(mockElement.title).toBe('Missing translation: test.key');
    });

    it('should not highlight elements with translated text', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();

      const mockElement = {
        getAttribute: vi.fn((attr: string) => (attr === 'data-i18n-key' ? 'test.key' : null)),
        textContent: 'Translated Text',
        style: {},
        title: '',
      };

      const container = {
        querySelectorAll: vi.fn().mockReturnValue([mockElement]),
      } as any;

      tools?.highlightMissingKeys(container);

      expect(mockElement.style.backgroundColor).toBeUndefined();
      expect(mockElement.style.border).toBeUndefined();
    });
  });

  describe('showTranslationKeys', () => {
    it('should attach mouseenter and mouseleave event listeners', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();

      const mockElement = {
        getAttribute: vi.fn((attr: string) => (attr === 'data-i18n-key' ? 'test.key' : null)),
        addEventListener: vi.fn(),
        getBoundingClientRect: vi.fn().mockReturnValue({
          left: 100,
          top: 50,
          bottom: 70,
          right: 200,
        }),
      };

      const container = {
        querySelectorAll: vi.fn().mockReturnValue([mockElement]),
      } as any;

      tools?.showTranslationKeys(container);

      expect(mockElement.addEventListener).toHaveBeenCalledWith('mouseenter', expect.any(Function));
      expect(mockElement.addEventListener).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    });
  });

  describe('validateTranslations', () => {
    it('should identify missing keys (null/undefined values)', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();

      const translations = {
        key1: 'value1',
        key2: null,
        key3: undefined,
      };

      const result = tools?.validateTranslations(translations);
      expect(result?.missingKeys).toContain('key2');
      expect(result?.missingKeys).toContain('key3');
    });

    it('should identify invalid keys (empty strings)', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();

      const translations = {
        '': 'value',
        ' ': 'value',
      };

      const result = tools?.validateTranslations(translations);
      expect(result?.invalidKeys.length).toBeGreaterThan(0);
    });

    it('should validate nested translations', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();

      const translations = {
        level1: {
          level2: {
            key1: 'value1',
            key2: null,
          },
        },
      };

      const result = tools?.validateTranslations(translations);
      expect(result?.missingKeys).toContain('level1.level2.key2');
    });

    it('should return empty arrays for valid translations', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();

      const translations = {
        key1: 'value1',
        key2: 'value2',
        nested: {
          key3: 'value3',
        },
      };

      const result = tools?.validateTranslations(translations);
      expect(result?.missingKeys).toHaveLength(0);
      expect(result?.duplicateKeys).toHaveLength(0);
    });

    it('should handle arrays in translations (ignore them)', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();

      const translations = {
        items: ['item1', 'item2', 'item3'],
        key: 'value',
      };

      const result = tools?.validateTranslations(translations);
      expect(result?.invalidKeys).not.toContain('items');
    });
  });

  describe('devTools', () => {
    it('should open devTools panel', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();

      const mockButton = {
        addEventListener: vi.fn(),
      };

      const mockPanel = {
        id: '',
        style: {},
        appendChild: vi.fn(),
        querySelector: vi.fn().mockReturnValue(mockButton),
      };

      (document.createElement as any).mockReturnValue(mockPanel);

      tools?.devTools.open();

      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should close devTools panel', () => {
      process.env.NODE_ENV = 'development';
      const tools = createDebugTools();

      const mockPanel = {
        remove: vi.fn(),
      };

      (document.getElementById as any).mockReturnValue(mockPanel);

      tools?.devTools.close();

      expect(document.getElementById).toHaveBeenCalledWith('hua-i18n-devtools');
      expect(mockPanel.remove).toHaveBeenCalled();
    });
  });

  describe('enableDebugTools', () => {
    it('should warn in production', () => {
      process.env.NODE_ENV = 'production';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      enableDebugTools();

      expect(warnSpy).toHaveBeenCalledWith('Debug tools are not available in production');
      warnSpy.mockRestore();
    });

    it('should set global __HUA_I18N_DEBUG__ in development', () => {
      process.env.NODE_ENV = 'development';
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      enableDebugTools();

      expect((window as any).__HUA_I18N_DEBUG__).toBeDefined();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('HUA i18n debug tools enabled')
      );
      logSpy.mockRestore();
    });

    it('should open devTools panel automatically', () => {
      process.env.NODE_ENV = 'development';
      vi.spyOn(console, 'log').mockImplementation(() => {});

      enableDebugTools();

      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });

  describe('disableDebugTools', () => {
    it('should remove global __HUA_I18N_DEBUG__', () => {
      process.env.NODE_ENV = 'development';
      vi.spyOn(console, 'log').mockImplementation(() => {});

      enableDebugTools();
      expect((window as any).__HUA_I18N_DEBUG__).toBeDefined();

      disableDebugTools();
      expect((window as any).__HUA_I18N_DEBUG__).toBeUndefined();
    });

    it('should close devTools panel', () => {
      process.env.NODE_ENV = 'development';
      vi.spyOn(console, 'log').mockImplementation(() => {});

      const mockPanel = {
        remove: vi.fn(),
      };
      (document.getElementById as any).mockReturnValue(mockPanel);

      enableDebugTools();
      disableDebugTools();

      expect(document.getElementById).toHaveBeenCalledWith('hua-i18n-devtools');
    });

    it('should handle case when debug tools not enabled', () => {
      process.env.NODE_ENV = 'development';

      expect(() => disableDebugTools()).not.toThrow();
    });
  });
});
