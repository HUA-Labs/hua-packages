import { Plugin, PluginFactory, PluginContext, PluginHooks, PluginPriority } from '../types';

export interface GPTTranslatorConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxRetries?: number;
  timeout?: number;
  cacheResults?: boolean;
  fallbackToLocal?: boolean;
}

export interface GPTTranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  tone?: 'formal' | 'informal' | 'casual' | 'technical';
}

export interface GPTTranslationResponse {
  translatedText: string;
  confidence: number;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * GPT 번역 플러그인
 * OpenAI API를 사용하여 실시간 번역 제공
 */
export class GPTTranslatorPlugin implements Plugin {
  id = 'gpt-translator';
  name = 'GPT Translator';
  version = '1.0.0';
  priority = PluginPriority.HIGH;
  
  private config: GPTTranslatorConfig;
  private cache = new Map<string, GPTTranslationResponse>();
  private isEnabled = false;
  
  hooks: PluginHooks = {
    onInit: async (context: PluginContext) => {
      await this.initialize(context);
    },
    beforeTranslate: async (context: PluginContext) => {
      await this.onBeforeTranslate(context, context.key, context.language);
    },
    afterTranslate: async (context: PluginContext & { result: string }) => {
      await this.onAfterTranslate(context, context.key, context.language, context.result);
    },
    onDestroy: async (context: PluginContext) => {
      await this.destroy();
    }
  };

  constructor(config: GPTTranslatorConfig) {
    this.config = {
      model: 'gpt-3.5-turbo',
      baseUrl: 'https://api.openai.com/v1',
      maxRetries: 3,
      timeout: 10000,
      cacheResults: true,
      fallbackToLocal: true,
      ...config
    };
  }

  async initialize(context: PluginContext): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('GPT Translator Plugin requires an API key');
    }

    this.isEnabled = true;
    console.log('GPT Translator Plugin initialized');
  }

  async translate(request: GPTTranslationRequest): Promise<GPTTranslationResponse> {
    if (!this.isEnabled) {
      throw new Error('GPT Translator Plugin is not initialized');
    }

    const cacheKey = this.generateCacheKey(request);
    
    // 캐시된 결과가 있으면 반환
    if (this.config.cacheResults && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await this.callGPTAPI(request);
      
      // 결과 캐시
      if (this.config.cacheResults) {
        this.cache.set(cacheKey, response);
      }

      return response;
    } catch (error) {
      // 로컬 번역으로 폴백
      if (this.config.fallbackToLocal) {
        return this.fallbackToLocal(request);
      }
      throw error;
    }
  }

  private async callGPTAPI(request: GPTTranslationRequest): Promise<GPTTranslationResponse> {
    const prompt = this.buildPrompt(request);
    
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate the given text accurately while preserving the meaning and tone.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('No translation received from GPT API');
    }

    return {
      translatedText,
      confidence: 0.9, // GPT는 높은 신뢰도
      model: this.config.model!,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      }
    };
  }

  private buildPrompt(request: GPTTranslationRequest): string {
    let prompt = `Translate the following text from ${request.sourceLanguage} to ${request.targetLanguage}:\n\n`;
    prompt += `Text: "${request.text}"\n\n`;
    
    if (request.context) {
      prompt += `Context: ${request.context}\n\n`;
    }
    
    if (request.tone) {
      prompt += `Tone: ${request.tone}\n\n`;
    }
    
    prompt += 'Translation:';
    
    return prompt;
  }

  private generateCacheKey(request: GPTTranslationRequest): string {
    return `${request.sourceLanguage}:${request.targetLanguage}:${request.text}:${request.tone || 'default'}`;
  }

  private fallbackToLocal(request: GPTTranslationRequest): GPTTranslationResponse {
    // 로컬 번역 데이터로 폴백 (기본 번역)
    const fallbackTranslations: Record<string, Record<string, string>> = {
      'ko': {
        'hello': '안녕하세요',
        'welcome': '환영합니다',
        'thank you': '감사합니다',
        'goodbye': '안녕히 가세요'
      },
      'en': {
        '안녕하세요': 'hello',
        '환영합니다': 'welcome',
        '감사합니다': 'thank you',
        '안녕히 가세요': 'goodbye'
      },
      'ja': {
        'hello': 'こんにちは',
        'welcome': 'ようこそ',
        'thank you': 'ありがとうございます',
        'goodbye': 'さようなら'
      }
    };

    const fallback = fallbackTranslations[request.targetLanguage]?.[request.text.toLowerCase()] || request.text;

    return {
      translatedText: fallback,
      confidence: 0.5, // 낮은 신뢰도 (폴백)
      model: 'fallback-local',
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      }
    };
  }

  // 플러그인 생명주기 메서드들
  async onBeforeTranslate(context: PluginContext, key: string, language: string): Promise<void> {
    // 번역 전 처리
  }

  async onAfterTranslate(context: PluginContext, key: string, language: string, result: string): Promise<void> {
    // 번역 후 처리
  }

  async destroy(): Promise<void> {
    this.cache.clear();
    this.isEnabled = false;
  }

  // 통계 및 정보
  getStats() {
    return {
      cacheSize: this.cache.size,
      isEnabled: this.isEnabled,
      model: this.config.model,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * GPT 번역 플러그인 팩토리
 */
export const gptTranslatorPlugin: PluginFactory<GPTTranslatorConfig> = (config) => {
  if (!config) {
    throw new Error('GPT Translator Plugin requires configuration');
  }
  return new GPTTranslatorPlugin(config);
};

/**
 * 사용 예시:
 * 
 * const config = createI18nConfig({
 *   // ... 기타 설정
 *   plugins: [
 *     gptTranslatorPlugin({
 *       apiKey: 'your-openai-api-key',
 *       model: 'gpt-4',
 *       cacheResults: true,
 *       fallbackToLocal: true
 *     })
 *   ]
 * });
 */ 