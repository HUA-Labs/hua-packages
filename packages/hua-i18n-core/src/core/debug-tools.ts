/**
 * 조건부 디버깅 도구 - 개발 환경에서만 로드
 * 번들 크기 최적화를 위해 조건부 로딩
 */

export interface DebugTools {
  // 번역 키 시각화
  highlightMissingKeys: (container: HTMLElement) => void;
  showTranslationKeys: (container: HTMLElement) => void;
  
  // 성능 모니터링
  performanceMetrics: {
    translationCount: number;
    cacheHits: number;
    cacheMisses: number;
    loadTimes: number[];
  };
  
  // 개발자 도구
  devTools: {
    open: () => void;
    close: () => void;
    isOpen: boolean;
  };
  
  // 번역 데이터 검증
  validateTranslations: (translations: Record<string, unknown>) => {
    missingKeys: string[];
    duplicateKeys: string[];
    invalidKeys: string[];
  };
}

/**
 * 디버깅 도구 팩토리 - 조건부 로딩
 */
export function createDebugTools(): DebugTools | null {
  // 프로덕션에서는 디버깅 도구 비활성화
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // 개발 환경에서만 로드
  return {
    highlightMissingKeys: (container: HTMLElement) => {
      const elements = container.querySelectorAll('[data-i18n-key]');
      elements.forEach((element) => {
        const key = element.getAttribute('data-i18n-key');
        const text = element.textContent;
        
        // 번역 키가 텍스트와 다른 경우 하이라이트
        if (key && text === key) {
          (element as HTMLElement).style.backgroundColor = '#ffeb3b';
          (element as HTMLElement).style.border = '2px solid #f57c00';
          (element as HTMLElement).title = `Missing translation: ${key}`;
        }
      });
    },

    showTranslationKeys: (container: HTMLElement) => {
      const elements = container.querySelectorAll('[data-i18n-key]');
      elements.forEach((element) => {
        const key = element.getAttribute('data-i18n-key');
        if (key) {
          const tooltip = document.createElement('div');
          tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
          `;
          tooltip.textContent = `Key: ${key}`;
          
          element.addEventListener('mouseenter', () => {
            const rect = element.getBoundingClientRect();
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.top = `${rect.bottom + 5}px`;
            tooltip.style.opacity = '1';
            document.body.appendChild(tooltip);
          });
          
          element.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
              if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
              }
            }, 200);
          });
        }
      });
    },

    performanceMetrics: {
      translationCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      loadTimes: [],
    },

    devTools: {
      isOpen: false,
      open: () => {
        const devTools = createDevToolsPanel();
        document.body.appendChild(devTools);
        (devTools as HTMLElement & { isOpen?: boolean }).isOpen = true;
      },
      close: () => {
        const existingPanel = document.getElementById('hua-i18n-devtools');
        if (existingPanel) {
          existingPanel.remove();
        }
        // devTools 변수는 이 스코프에서 접근할 수 없으므로 전역에서 관리
        const globalDebugTools = (window as Window & { __HUA_I18N_DEBUG__?: DebugTools }).__HUA_I18N_DEBUG__;
        if (globalDebugTools) {
          globalDebugTools.devTools.isOpen = false;
        }
      },
    },

    validateTranslations: (translations: Record<string, unknown>) => {
      const missingKeys: string[] = [];
      const duplicateKeys: string[] = [];
      const invalidKeys: string[] = [];
      const seenKeys = new Set<string>();

      const traverse = (obj: unknown, path: string = '') => {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
          return;
        }
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          // 키 유효성 검사
          if (typeof key !== 'string' || key.trim() === '') {
            invalidKeys.push(currentPath);
          }
          
          // 중복 키 검사
          if (seenKeys.has(currentPath)) {
            duplicateKeys.push(currentPath);
          } else {
            seenKeys.add(currentPath);
          }
          
          // 값 검사
          if (value === null || value === undefined) {
            missingKeys.push(currentPath);
          } else if (typeof value === 'object' && !Array.isArray(value)) {
            traverse(value, currentPath);
          }
        }
      };

      traverse(translations);
      
      return { missingKeys, duplicateKeys, invalidKeys };
    },
  };
}

/**
 * 개발자 도구 패널 생성
 */
function createDevToolsPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.id = 'hua-i18n-devtools';
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    max-height: 500px;
    background: #1e1e1e;
    color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    overflow: hidden;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    background: #2d2d2d;
    padding: 12px;
    border-bottom: 1px solid #444;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = `
    <span style="font-weight: bold;">HUA i18n Debug</span>
    <button id="close-devtools" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 16px;">×</button>
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    padding: 12px;
    max-height: 400px;
    overflow-y: auto;
  `;

  // 성능 메트릭
  const metricsSection = document.createElement('div');
  metricsSection.innerHTML = `
    <h4 style="margin: 0 0 8px 0; color: #4fc3f7;">Performance</h4>
    <div>Translations: <span id="translation-count">0</span></div>
    <div>Cache Hits: <span id="cache-hits">0</span></div>
    <div>Cache Misses: <span id="cache-misses">0</span></div>
    <div>Hit Rate: <span id="hit-rate">0%</span></div>
  `;

  // 현재 언어 정보
  const languageSection = document.createElement('div');
  languageSection.style.marginTop = '16px';
  languageSection.innerHTML = `
    <h4 style="margin: 0 0 8px 0; color: #4fc3f7;">Current Language</h4>
    <div>Language: <span id="current-language">ko</span></div>
    <div>Fallback: <span id="fallback-language">en</span></div>
  `;

  // 액션 버튼들
  const actionsSection = document.createElement('div');
  actionsSection.style.marginTop = '16px';
  actionsSection.innerHTML = `
    <h4 style="margin: 0 0 8px 0; color: #4fc3f7;">Actions</h4>
    <button id="highlight-missing" style="background: #4fc3f7; border: none; color: #000; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 8px;">Highlight Missing</button>
    <button id="show-keys" style="background: #4fc3f7; border: none; color: #000; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Show Keys</button>
  `;

  content.appendChild(metricsSection);
  content.appendChild(languageSection);
  content.appendChild(actionsSection);

  panel.appendChild(header);
  panel.appendChild(content);

  // 이벤트 리스너
  panel.querySelector('#close-devtools')?.addEventListener('click', () => {
    panel.remove();
  });

  panel.querySelector('#highlight-missing')?.addEventListener('click', () => {
    const debugTools = createDebugTools();
    if (debugTools) {
      debugTools.highlightMissingKeys(document.body);
    }
  });

  panel.querySelector('#show-keys')?.addEventListener('click', () => {
    const debugTools = createDebugTools();
    if (debugTools) {
      debugTools.showTranslationKeys(document.body);
    }
  });

  return panel;
}

/**
 * 디버깅 도구 활성화 (전역 함수)
 */
export function enableDebugTools(): void {
  if (process.env.NODE_ENV === 'production') {
    console.warn('Debug tools are not available in production');
    return;
  }

  const debugTools = createDebugTools();
  if (!debugTools) return;

  // 전역 객체에 추가
  (window as Window & { __HUA_I18N_DEBUG__?: DebugTools }).__HUA_I18N_DEBUG__ = debugTools;

  // 개발자 도구 열기
  debugTools.devTools.open();

  console.log('HUA i18n debug tools enabled. Use window.__HUA_I18N_DEBUG__ to access.');
}

/**
 * 디버깅 도구 비활성화
 */
export function disableDebugTools(): void {
  const debugTools = (window as Window & { __HUA_I18N_DEBUG__?: DebugTools }).__HUA_I18N_DEBUG__;
  if (debugTools) {
    debugTools.devTools.close();
    delete (window as Window & { __HUA_I18N_DEBUG__?: DebugTools }).__HUA_I18N_DEBUG__;
  }
} 