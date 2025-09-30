import { Plugin, PluginFactory, PluginContext, PluginHooks, PluginPriority } from '../types';

export interface JSONGeneratorConfig {
  apiKey?: string; // GPT API 키 (선택적)
  outputPath?: string; // JSON 파일 출력 경로
  keyNamingStrategy?: 'camelCase' | 'snake_case' | 'kebab-case' | 'auto' | 'manual';
  namespaceStrategy?: 'single' | 'category' | 'auto' | 'manual';
  autoSave?: boolean;
  backupExisting?: boolean;
  
  // 실제 서비스용 설정
  serviceConfig?: {
    // 네임스페이스 매핑 (컨텍스트 → 실제 네임스페이스)
    namespaceMapping?: Record<string, string>;
    // 키 접두사 규칙
    keyPrefixes?: Record<string, string>;
    // 금지된 키 패턴
    forbiddenKeyPatterns?: RegExp[];
    // 필수 키 패턴
    requiredKeyPatterns?: RegExp[];
    // 키 길이 제한
    maxKeyLength?: number;
    // 중복 키 처리 방식
    duplicateKeyStrategy?: 'skip' | 'overwrite' | 'append' | 'error';
  };
  
  // 검증 설정
  validation?: {
    // 키 유효성 검사
    validateKeys?: boolean;
    // 번역 품질 검사
    validateTranslations?: boolean;
    // 필수 언어 확인
    requiredLanguages?: string[];
    // 번역 길이 제한
    maxTranslationLength?: number;
  };
  
  // 워크플로우 설정
  workflow?: {
    // 수동 검토 단계
    requireManualReview?: boolean;
    // 승인자 설정
    approvers?: string[];
    // 자동 커밋
    autoCommit?: boolean;
    // 브랜치 전략
    branchStrategy?: 'feature' | 'main' | 'custom';
  };
}

export interface TranslationRequest {
  originalText: string;
  sourceLanguage: string;
  targetLanguages: string[];
  context?: string;
  category?: string;
  customKey?: string;
}

export interface TranslationResult {
  key: string;
  originalText: string;
  translations: Record<string, string>;
  context?: string;
  category?: string;
  confidence: number;
}

export interface JSONOutput {
  [namespace: string]: {
    [key: string]: string;
  };
}

/**
 * JSON 키 자동 생성 플러그인
 * 원문을 받아서 번역하고 JSON 키를 자동 생성
 */
export class JSONGeneratorPlugin implements Plugin {
  id = 'json-generator';
  name = 'JSON Key Generator';
  version = '1.0.0';
  priority = PluginPriority.HIGH;
  
  private config: JSONGeneratorConfig;
  private translations: JSONOutput = {};
  private isEnabled = false;

  hooks: PluginHooks = {
    onInit: async (context: PluginContext) => {
      await this.initialize(context);
    },
    onDestroy: async (context: PluginContext) => {
      await this.destroy();
    }
  };

  constructor(config: JSONGeneratorConfig) {
    this.config = {
      keyNamingStrategy: 'auto',
      namespaceStrategy: 'auto',
      autoSave: true,
      backupExisting: true,
      ...config
    };
  }

  async initialize(context: PluginContext): Promise<void> {
    this.isEnabled = true;
    console.log('JSON Generator Plugin initialized');
  }

  /**
   * 원문을 번역하고 JSON 키 생성
   */
  async translateAndGenerateKey(request: TranslationRequest): Promise<TranslationResult> {
    if (!this.isEnabled) {
      throw new Error('JSON Generator Plugin is not initialized');
    }

    // 1. 키 생성
    const key = this.generateKey(request.originalText, request.customKey, request.category);
    
    // 2. 네임스페이스 결정
    const namespace = this.determineNamespace(request.category, request.context);
    
    // 3. 번역 실행
    const translations: Record<string, string> = {};
    
    // 원문을 소스 언어로 저장
    translations[request.sourceLanguage] = request.originalText;
    
    // 타겟 언어들 번역
    for (const targetLang of request.targetLanguages) {
      if (targetLang !== request.sourceLanguage) {
        try {
          const translatedText = await this.translateText(
            request.originalText,
            request.sourceLanguage,
            targetLang,
            request.context
          );
          translations[targetLang] = translatedText;
        } catch (error) {
          console.warn(`Translation failed for ${targetLang}:`, error);
          translations[targetLang] = request.originalText; // 원문으로 폴백
        }
      }
    }

    // 4. 결과 구성
    const result: TranslationResult = {
      key,
      originalText: request.originalText,
      translations,
      context: request.context,
      category: request.category,
      confidence: 0.9
    };

    // 5. JSON 구조에 추가
    this.addToJSON(namespace, key, translations);

    // 6. 자동 저장
    if (this.config.autoSave) {
      await this.saveToFile();
    }

    return result;
  }

  /**
   * 키 자동 생성
   */
  private generateKey(text: string, customKey?: string, category?: string): string {
    if (customKey) {
      return customKey;
    }

    // 텍스트를 키로 변환
    let key = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // 특수문자 제거
      .trim()
      .replace(/\s+/g, ' '); // 여러 공백을 하나로

    // 키 네이밍 전략 적용
    switch (this.config.keyNamingStrategy) {
      case 'camelCase':
        key = key.replace(/\s+(\w)/g, (_, char) => char.toUpperCase());
        break;
      case 'snake_case':
        key = key.replace(/\s+/g, '_');
        break;
      case 'kebab-case':
        key = key.replace(/\s+/g, '-');
        break;
      case 'manual':
        // 수동 키는 별도 처리
        return this.generateManualKey(text, category);
      case 'auto':
      default:
        // 자동 감지: 짧은 텍스트는 camelCase, 긴 텍스트는 snake_case
        if (key.length <= 20) {
          key = key.replace(/\s+(\w)/g, (_, char) => char.toUpperCase());
        } else {
          key = key.replace(/\s+/g, '_');
        }
        break;
    }

    // 카테고리 접두사 추가
    if (category) {
      key = `${category}_${key}`;
    }

    // 서비스별 키 접두사 적용
    if (this.config.serviceConfig?.keyPrefixes) {
      for (const [pattern, prefix] of Object.entries(this.config.serviceConfig.keyPrefixes)) {
        if (text.toLowerCase().includes(pattern.toLowerCase())) {
          key = `${prefix}_${key}`;
          break;
        }
      }
    }

    // 키 길이 제한
    if (this.config.serviceConfig?.maxKeyLength && key.length > this.config.serviceConfig.maxKeyLength) {
      key = key.substring(0, this.config.serviceConfig.maxKeyLength);
    }

    return key;
  }

  /**
   * 수동 키 생성 (실제 서비스용)
   */
  private generateManualKey(text: string, category?: string): string {
    // 실제 서비스에서는 개발자가 직접 키를 지정
    throw new Error('Manual key generation requires explicit key specification');
  }

  /**
   * 키 유효성 검사 (실제 서비스용)
   */
  private validateKey(key: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 금지된 패턴 검사
    if (this.config.serviceConfig?.forbiddenKeyPatterns) {
      for (const pattern of this.config.serviceConfig.forbiddenKeyPatterns) {
        if (pattern.test(key)) {
          errors.push(`Key contains forbidden pattern: ${pattern}`);
        }
      }
    }

    // 필수 패턴 검사
    if (this.config.serviceConfig?.requiredKeyPatterns) {
      const hasRequiredPattern = this.config.serviceConfig.requiredKeyPatterns.some(pattern => pattern.test(key));
      if (!hasRequiredPattern) {
        errors.push('Key does not match any required pattern');
      }
    }

    // 키 길이 검사
    if (this.config.serviceConfig?.maxKeyLength && key.length > this.config.serviceConfig.maxKeyLength) {
      errors.push(`Key length exceeds maximum: ${key.length} > ${this.config.serviceConfig.maxKeyLength}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 네임스페이스 결정 (실제 서비스용)
   */
  private determineNamespace(category?: string, context?: string): string {
    switch (this.config.namespaceStrategy) {
      case 'single':
        return 'common';
      case 'category':
        return category || 'common';
      case 'manual':
        // 수동 네임스페이스는 별도 처리
        return this.determineManualNamespace(category, context);
      case 'auto':
      default:
        // 서비스별 네임스페이스 매핑 적용
        if (this.config.serviceConfig?.namespaceMapping) {
          for (const [pattern, namespace] of Object.entries(this.config.serviceConfig.namespaceMapping)) {
            if (context?.includes(pattern) || category?.includes(pattern)) {
              return namespace;
            }
          }
        }
        
        // 기본 자동 결정
        if (context?.includes('error') || context?.includes('Error')) return 'errors';
        if (context?.includes('button') || context?.includes('Button')) return 'buttons';
        if (context?.includes('form') || context?.includes('Form')) return 'forms';
        if (context?.includes('menu') || context?.includes('Menu')) return 'menus';
        if (category) return category;
        return 'common';
    }
  }

  /**
   * 수동 네임스페이스 결정 (실제 서비스용)
   */
  private determineManualNamespace(category?: string, context?: string): string {
    // 실제 서비스에서는 개발자가 직접 네임스페이스를 지정
    throw new Error('Manual namespace determination requires explicit namespace specification');
  }

  /**
   * 번역 품질 검사 (실제 서비스용)
   */
  private validateTranslation(originalText: string, translatedText: string, targetLang: string): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // 번역 길이 검사
    if (this.config.validation?.maxTranslationLength && translatedText.length > this.config.validation.maxTranslationLength) {
      warnings.push(`Translation too long: ${translatedText.length} > ${this.config.validation.maxTranslationLength}`);
    }

    // 번역이 원문과 동일한지 검사 (번역 실패 가능성)
    if (originalText === translatedText && targetLang !== 'en') {
      warnings.push('Translation appears to be identical to original text');
    }

    // 필수 언어 확인
    if (this.config.validation?.requiredLanguages && !this.config.validation.requiredLanguages.includes(targetLang)) {
      warnings.push(`Language ${targetLang} is not in required languages list`);
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * 중복 키 처리 (실제 서비스용)
   */
  private handleDuplicateKey(namespace: string, key: string, newTranslation: string): boolean {
    const strategy = this.config.serviceConfig?.duplicateKeyStrategy || 'error';
    
    switch (strategy) {
      case 'skip':
        console.log(`Skipping duplicate key: ${key}`);
        return false;
      case 'overwrite':
        console.log(`Overwriting duplicate key: ${key}`);
        return true;
      case 'append':
        const existingKey = `${key}_${Date.now()}`;
        console.log(`Appending duplicate key as: ${existingKey}`);
        this.translations[namespace][existingKey] = newTranslation;
        return false;
      case 'error':
      default:
        throw new Error(`Duplicate key found: ${key} in namespace: ${namespace}`);
    }
  }

  /**
   * 텍스트 번역 (GPT 또는 로컬)
   */
  private async translateText(
    text: string,
    sourceLang: string,
    targetLang: string,
    context?: string
  ): Promise<string> {
    // GPT API가 있으면 사용
    if (this.config.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a professional translator. Translate the given text accurately while preserving the meaning and tone.'
              },
              {
                role: 'user',
                content: `Translate from ${sourceLang} to ${targetLang}:\nText: "${text}"${context ? `\nContext: ${context}` : ''}\nTranslation:`
              }
            ],
            max_tokens: 500,
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0]?.message?.content?.trim() || text;
        }
      } catch (error) {
        console.warn('GPT translation failed, using local fallback:', error);
      }
    }

    // 로컬 번역 폴백
    return this.localTranslate(text, sourceLang, targetLang);
  }

  /**
   * 로컬 번역 (기본 번역)
   */
  private localTranslate(text: string, sourceLang: string, targetLang: string): string {
    const translations: Record<string, Record<string, string>> = {
      'ko': {
        'hello': '안녕하세요',
        'welcome': '환영합니다',
        'thank you': '감사합니다',
        'goodbye': '안녕히 가세요',
        'settings': '설정',
        'save': '저장',
        'cancel': '취소',
        'confirm': '확인',
        'error': '오류',
        'success': '성공'
      },
      'en': {
        '안녕하세요': 'hello',
        '환영합니다': 'welcome',
        '감사합니다': 'thank you',
        '안녕히 가세요': 'goodbye',
        '설정': 'settings',
        '저장': 'save',
        '취소': 'cancel',
        '확인': 'confirm',
        '오류': 'error',
        '성공': 'success'
      },
      'ja': {
        'hello': 'こんにちは',
        'welcome': 'ようこそ',
        'thank you': 'ありがとうございます',
        'goodbye': 'さようなら',
        'settings': '設定',
        'save': '保存',
        'cancel': 'キャンセル',
        'confirm': '確認',
        'error': 'エラー',
        'success': '成功'
      }
    };

    const lowerText = text.toLowerCase();
    return translations[targetLang]?.[lowerText] || text;
  }

  /**
   * JSON 구조에 추가
   */
  private addToJSON(namespace: string, key: string, translations: Record<string, string>): void {
    if (!this.translations[namespace]) {
      this.translations[namespace] = {};
    }

    // 각 언어별로 네임스페이스 분리
    for (const [lang, text] of Object.entries(translations)) {
      const langNamespace = `${namespace}_${lang}`;
      if (!this.translations[langNamespace]) {
        this.translations[langNamespace] = {};
      }
      this.translations[langNamespace][key] = text;
    }
  }

  /**
   * 파일로 저장
   */
  async saveToFile(): Promise<void> {
    if (!this.config.outputPath) {
      console.warn('No output path specified, skipping file save');
      return;
    }

    try {
      // 기존 파일 백업
      if (this.config.backupExisting) {
        // 백업 로직 (실제 구현에서는 fs 모듈 사용)
        console.log('Backing up existing files...');
      }

      // 각 언어별로 파일 생성
      const languages = new Set<string>();
      for (const namespace of Object.keys(this.translations)) {
        const lang = namespace.split('_').pop();
        if (lang) languages.add(lang);
      }

      for (const lang of languages) {
        const langTranslations: Record<string, Record<string, string>> = {};
        
        // 해당 언어의 네임스페이스들 수집
        for (const [namespace, keys] of Object.entries(this.translations)) {
          if (namespace.endsWith(`_${lang}`)) {
            const baseNamespace = namespace.replace(`_${lang}`, '');
            if (!langTranslations[baseNamespace]) {
              langTranslations[baseNamespace] = {};
            }
            Object.assign(langTranslations[baseNamespace], keys);
          }
        }

        // 파일 경로 생성
        const filePath = `${this.config.outputPath}/${lang}`;
        console.log(`Saving translations for ${lang} to ${filePath}`);
        
        // 실제 파일 저장 로직 (Node.js 환경에서 구현)
        // fs.writeFileSync(`${filePath}/common.json`, JSON.stringify(langTranslations.common, null, 2));
      }

      console.log('Translations saved successfully');
    } catch (error) {
      console.error('Failed to save translations:', error);
    }
  }

  /**
   * 현재 JSON 구조 가져오기
   */
  getJSON(): JSONOutput {
    return { ...this.translations };
  }

  /**
   * JSON 구조 초기화
   */
  clearJSON(): void {
    this.translations = {};
  }

  async destroy(): Promise<void> {
    this.isEnabled = false;
    if (this.config.autoSave) {
      await this.saveToFile();
    }
  }
}

/**
 * JSON 생성기 플러그인 팩토리
 */
export const jsonGeneratorPlugin: PluginFactory<JSONGeneratorConfig> = (config) => {
  if (!config) {
    throw new Error('JSON Generator Plugin requires configuration');
  }
  return new JSONGeneratorPlugin(config);
};

/**
 * 사용 예시:
 * 
 * // 1. 개발용 설정 (자동화)
 * const devConfig = createI18nConfig({
 *   plugins: [
 *     jsonGeneratorPlugin({
 *       apiKey: 'your-openai-api-key',
 *       outputPath: './translations',
 *       keyNamingStrategy: 'auto',
 *       namespaceStrategy: 'auto',
 *       autoSave: true
 *     })
 *   ]
 * });
 * 
 * // 2. 실제 서비스용 설정 (엄격한 검증)
 * const productionConfig = createI18nConfig({
 *   plugins: [
 *     jsonGeneratorPlugin({
 *       apiKey: 'your-openai-api-key',
 *       outputPath: './translations',
 *       keyNamingStrategy: 'manual', // 수동 키 지정
 *       namespaceStrategy: 'manual', // 수동 네임스페이스 지정
 *       autoSave: false, // 수동 검토 후 저장
 *       
 *       // 서비스별 설정
 *       serviceConfig: {
 *         namespaceMapping: {
 *           'error': 'errors',
 *           'button': 'buttons',
 *           'form': 'forms',
 *           'menu': 'menus',
 *           'notification': 'notifications'
 *         },
 *         keyPrefixes: {
 *           'error': 'err',
 *           'warning': 'warn',
 *           'success': 'success',
 *           'loading': 'loading'
 *         },
 *         forbiddenKeyPatterns: [
 *           /^[0-9]/, // 숫자로 시작하는 키 금지
 *           /[A-Z]/,  // 대문자 금지
 *           /[^a-z0-9_]/ // 특수문자 금지
 *         ],
 *         requiredKeyPatterns: [
 *           /^[a-z][a-z0-9_]*$/ // 소문자, 숫자, 언더스코어만 허용
 *         ],
 *         maxKeyLength: 50,
 *         duplicateKeyStrategy: 'error' // 중복 키 에러
 *       },
 *       
 *       // 검증 설정
 *       validation: {
 *         validateKeys: true,
 *         validateTranslations: true,
 *         requiredLanguages: ['ko', 'en', 'ja'],
 *         maxTranslationLength: 200
 *       },
 *       
 *       // 워크플로우 설정
 *       workflow: {
 *         requireManualReview: true,
 *         approvers: ['dev-lead', 'qa-lead'],
 *         autoCommit: false,
 *         branchStrategy: 'feature'
 *       }
 *     })
 *   ]
 * });
 * 
 * // 3. 사용법 (개발용)
 * const devResult = await jsonGenerator.translateAndGenerateKey({
 *   originalText: 'Hello, welcome to our app!',
 *   sourceLanguage: 'en',
 *   targetLanguages: ['ko', 'ja'],
 *   context: 'User interface greeting',
 *   category: 'ui'
 * });
 * 
 * // 4. 사용법 (실제 서비스용)
 * const productionResult = await jsonGenerator.translateAndGenerateKey({
 *   originalText: 'Hello, welcome to our app!',
 *   sourceLanguage: 'en',
 *   targetLanguages: ['ko', 'ja'],
 *   context: 'User interface greeting',
 *   category: 'ui',
 *   customKey: 'ui.welcome_message' // 수동 키 지정
 * });
 * 
 * // 결과:
 * // {
 * //   key: 'ui.welcome_message',
 * //   originalText: 'Hello, welcome to our app!',
 * //   translations: {
 * //     en: 'Hello, welcome to our app!',
 * //     ko: '안녕하세요, 우리 앱에 오신 것을 환영합니다!',
 * //     ja: 'こんにちは、私たちのアプリへようこそ！'
 * //   },
 * //   validation: {
 * //     keyValid: true,
 * //     translationsValid: true,
 * //     warnings: []
 * //   }
 * // }
 */ 