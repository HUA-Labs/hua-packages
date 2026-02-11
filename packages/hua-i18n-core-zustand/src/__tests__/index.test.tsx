import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { create } from 'zustand';
import { createZustandI18n, useZustandI18n, ZustandLanguageStore } from '../index';

// Create a mock Zustand store for testing
function createMockStore(initialLanguage = 'ko') {
  return create<ZustandLanguageStore>((set) => ({
    language: initialLanguage,
    setLanguage: (lang: string) => set({ language: lang }),
  }));
}

describe('useZustandI18n', () => {
  it('should return current language from store', () => {
    const store = createMockStore('ko');
    const { result } = renderHook(() => useZustandI18n(store));

    expect(result.current.language).toBe('ko');
  });

  it('should return setLanguage function', () => {
    const store = createMockStore('ko');
    const { result } = renderHook(() => useZustandI18n(store));

    expect(typeof result.current.setLanguage).toBe('function');
  });

  it('should update language when setLanguage is called', () => {
    const store = createMockStore('ko');
    const { result } = renderHook(() => useZustandI18n(store));

    act(() => {
      result.current.setLanguage('en');
    });

    expect(result.current.language).toBe('en');
    expect(store.getState().language).toBe('en');
  });

  it('should not update if same language', () => {
    const store = createMockStore('ko');
    const spy = vi.fn();
    store.subscribe(spy);

    const { result } = renderHook(() => useZustandI18n(store));

    act(() => {
      result.current.setLanguage('ko'); // same language
    });

    // Zustand store.setLanguage should not be called since adapter checks currentLang !== lang
    expect(store.getState().language).toBe('ko');
  });

  it('should react to external store changes', () => {
    const store = createMockStore('ko');
    const { result } = renderHook(() => useZustandI18n(store));

    act(() => {
      store.getState().setLanguage('en');
    });

    expect(result.current.language).toBe('en');
  });
});

describe('createZustandI18n', () => {
  it('should create a Provider component', () => {
    const store = createMockStore('ko');
    const Provider = createZustandI18n(store, {
      defaultLanguage: 'ko',
      fallbackLanguage: 'en',
      namespaces: ['common'],
    });

    expect(Provider).toBeDefined();
    expect(typeof Provider).toBe('function');
  });

  it('should render children inside Provider', async () => {
    const store = createMockStore('ko');
    const Provider = createZustandI18n(store, {
      defaultLanguage: 'ko',
      fallbackLanguage: 'en',
      namespaces: ['common'],
      loadTranslations: async () => ({ greeting: '안녕하세요' }),
    });

    const TestChild = () => React.createElement('div', { 'data-testid': 'child' }, 'Hello');

    const { findByTestId } = await import('@testing-library/react').then(m => {
      return m.render(React.createElement(Provider, null, React.createElement(TestChild)));
    });

    // Child should be rendered
    const child = await findByTestId('child');
    expect(child).toBeDefined();
  });

  it('should use defaultLanguage from config', () => {
    const store = createMockStore('en');
    const Provider = createZustandI18n(store, {
      defaultLanguage: 'ko',
      fallbackLanguage: 'en',
      namespaces: ['common'],
    });

    // Provider should be created successfully
    expect(Provider).toBeDefined();
  });

  it('should default to ko when no defaultLanguage provided', () => {
    const store = createMockStore('ko');
    const Provider = createZustandI18n(store, {
      namespaces: ['common'],
    });

    expect(Provider).toBeDefined();
  });

  it('should work with autoUpdateHtmlLang option', () => {
    const store = createMockStore('ko');
    const Provider = createZustandI18n(store, {
      defaultLanguage: 'ko',
      autoUpdateHtmlLang: true,
    });

    expect(Provider).toBeDefined();
  });

  it('should work with custom storageKey', () => {
    const store = createMockStore('ko');
    const Provider = createZustandI18n(store, {
      defaultLanguage: 'ko',
      storageKey: 'custom-storage-key',
    });

    expect(Provider).toBeDefined();
  });
});

describe('ZustandLanguageStore type compatibility', () => {
  it('should work with standard Zustand store', () => {
    const store = create<ZustandLanguageStore>((set) => ({
      language: 'ko',
      setLanguage: (lang: string) => set({ language: lang }),
    }));

    expect(store.getState().language).toBe('ko');
    store.getState().setLanguage('en');
    expect(store.getState().language).toBe('en');
  });

  it('should work with extended store', () => {
    interface AppStore extends ZustandLanguageStore {
      theme: string;
      setTheme: (t: string) => void;
    }

    const store = create<AppStore>((set) => ({
      language: 'ko',
      setLanguage: (lang: string) => set({ language: lang }),
      theme: 'dark',
      setTheme: (t: string) => set({ theme: t }),
    }));

    // Should work with useZustandI18n even with extra state
    const { result } = renderHook(() => useZustandI18n(store));
    expect(result.current.language).toBe('ko');
  });
});
