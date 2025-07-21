/**
 * 자동 최적화 시스템 - 지능형 성능 최적화
 * 실시간 분석을 통한 자동 최적화 적용
 */

import { PerformanceMonitor, PerformanceMetrics, OptimizationSuggestion } from './performance-monitor';

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  action: () => Promise<void>;
  priority: number;
  cooldown: number; // ms
  lastExecuted?: number;
}

export interface OptimizationConfig {
  enabled: boolean;
  autoApply: boolean;
  maxConcurrentOptimizations: number;
  optimizationInterval: number;
  rules: OptimizationRule[];
}

export interface OptimizationResult {
  id: string;
  ruleId: string;
  success: boolean;
  improvement?: number;
  error?: string;
  timestamp: number;
  duration: number;
}

export class AutoOptimizer {
  private config: OptimizationConfig;
  private monitor: PerformanceMonitor;
  private results: OptimizationResult[] = [];
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  private activeOptimizations = new Set<string>();

  constructor(monitor: PerformanceMonitor, config: Partial<OptimizationConfig> = {}) {
    this.monitor = monitor;
    this.config = {
      enabled: true,
      autoApply: false,
      maxConcurrentOptimizations: 3,
      optimizationInterval: 30000, // 30초
      rules: [],
      ...config
    };

    this.initializeDefaultRules();
  }

  /**
   * 기본 최적화 규칙 초기화
   */
  private initializeDefaultRules(): void {
    this.config.rules = [
      // 캐시 크기 자동 조정
      {
        id: 'auto-cache-size',
        name: 'Auto Cache Size Adjustment',
        description: 'Automatically adjust cache size based on hit rate',
        priority: 1,
        cooldown: 60000, // 1분
        condition: (metrics) => {
          return metrics.cachePerformance.hitRate < 0.7 && 
                 metrics.cachePerformance.size >= metrics.cachePerformance.maxSize * 0.8;
        },
        action: async () => {
          await this.optimizeCacheSize();
        }
      },

      // 메모리 정리
      {
        id: 'memory-cleanup',
        name: 'Memory Cleanup',
        description: 'Clean up unused translation data from memory',
        priority: 2,
        cooldown: 120000, // 2분
        condition: (metrics) => {
          return metrics.memoryUsage.trend === 'increasing' && 
                 metrics.memoryUsage.current > 30 * 1024 * 1024; // 30MB
        },
        action: async () => {
          await this.cleanupMemory();
        }
      },

      // 번역 키 최적화
      {
        id: 'key-optimization',
        name: 'Translation Key Optimization',
        description: 'Remove unused translation keys',
        priority: 3,
        cooldown: 300000, // 5분
        condition: (metrics) => {
          return metrics.keyUsage.unusedKeys > metrics.keyUsage.usedKeys * 0.2;
        },
        action: async () => {
          await this.optimizeTranslationKeys();
        }
      },

      // 로딩 전략 최적화
      {
        id: 'loading-strategy',
        name: 'Loading Strategy Optimization',
        description: 'Optimize translation loading strategy',
        priority: 1,
        cooldown: 180000, // 3분
        condition: (metrics) => {
          return metrics.translationTime.average > 50;
        },
        action: async () => {
          await this.optimizeLoadingStrategy();
        }
      }
    ];
  }

  /**
   * 자동 최적화 시작
   */
  start(): void {
    if (this.isRunning || !this.config.enabled) return;

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.runOptimizations();
    }, this.config.optimizationInterval);

    console.log('Auto optimizer started');
  }

  /**
   * 자동 최적화 중지
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('Auto optimizer stopped');
  }

  /**
   * 최적화 실행
   */
  private async runOptimizations(): Promise<void> {
    if (this.activeOptimizations.size >= this.config.maxConcurrentOptimizations) {
      return;
    }

    const metrics = this.monitor.getMetrics();
    const applicableRules = this.getApplicableRules(metrics);

    for (const rule of applicableRules) {
      if (this.activeOptimizations.size >= this.config.maxConcurrentOptimizations) {
        break;
      }

      if (this.canExecuteRule(rule)) {
        await this.executeRule(rule);
      }
    }
  }

  /**
   * 적용 가능한 규칙 조회
   */
  private getApplicableRules(metrics: PerformanceMetrics): OptimizationRule[] {
    return this.config.rules
      .filter(rule => rule.condition(metrics))
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * 규칙 실행 가능 여부 확인
   */
  private canExecuteRule(rule: OptimizationRule): boolean {
    if (this.activeOptimizations.has(rule.id)) {
      return false;
    }

    if (rule.lastExecuted && Date.now() - rule.lastExecuted < rule.cooldown) {
      return false;
    }

    return true;
  }

  /**
   * 규칙 실행
   */
  private async executeRule(rule: OptimizationRule): Promise<void> {
    const startTime = Date.now();
    const result: OptimizationResult = {
      id: `opt-${Date.now()}-${Math.random()}`,
      ruleId: rule.id,
      success: false,
      timestamp: startTime,
      duration: 0
    };

    try {
      this.activeOptimizations.add(rule.id);
      rule.lastExecuted = startTime;

      console.log(`Executing optimization: ${rule.name}`);
      
      await rule.action();
      
      result.success = true;
      result.duration = Date.now() - startTime;
      
      console.log(`Optimization completed: ${rule.name} (${result.duration}ms)`);
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.duration = Date.now() - startTime;
      
      console.error(`Optimization failed: ${rule.name}`, error);
    } finally {
      this.activeOptimizations.delete(rule.id);
      this.results.push(result);
    }
  }

  /**
   * 캐시 크기 최적화
   */
  private async optimizeCacheSize(): Promise<void> {
    const metrics = this.monitor.getMetrics();
    const currentSize = metrics.cachePerformance.maxSize;
    const hitRate = metrics.cachePerformance.hitRate;

    // 히트율이 낮으면 캐시 크기 증가
    if (hitRate < 0.6) {
      const newSize = Math.min(currentSize * 1.5, 1000);
      await this.updateCacheSize(newSize);
    }
    // 히트율이 높고 사용량이 적으면 캐시 크기 감소
    else if (hitRate > 0.9 && metrics.cachePerformance.size < currentSize * 0.5) {
      const newSize = Math.max(currentSize * 0.8, 50);
      await this.updateCacheSize(newSize);
    }
  }

  /**
   * 메모리 정리
   */
  private async cleanupMemory(): Promise<void> {
    // 가비지 컬렉션 요청
    if (window.gc) {
      window.gc();
    }

    // 캐시 정리
    await this.clearUnusedCache();

    // 번역 데이터 정리
    await this.clearUnusedTranslations();
  }

  /**
   * 번역 키 최적화
   */
  private async optimizeTranslationKeys(): Promise<void> {
    const metrics = this.monitor.getMetrics();
    const unusedKeys = metrics.keyUsage.unusedKeys;

    if (unusedKeys > 0) {
      // 사용하지 않는 키 제거
      await this.removeUnusedKeys();
      
      // 중복 키 병합
      await this.mergeDuplicateKeys();
    }
  }

  /**
   * 로딩 전략 최적화
   */
  private async optimizeLoadingStrategy(): Promise<void> {
    const metrics = this.monitor.getMetrics();
    
    // 자주 사용되는 번역을 미리 로드
    await this.preloadFrequentTranslations();
    
    // 지연 로딩 전략 적용
    await this.applyLazyLoading();
  }

  /**
   * 캐시 크기 업데이트
   */
  private async updateCacheSize(newSize: number): Promise<void> {
    // 실제 구현에서는 캐시 플러그인에 새로운 크기를 설정
    console.log(`Updating cache size to: ${newSize}`);
    
    // 캐시 플러그인 API 호출
    // await cachePlugin.updateSize(newSize);
  }

  /**
   * 사용하지 않는 캐시 정리
   */
  private async clearUnusedCache(): Promise<void> {
    console.log('Clearing unused cache entries');
    
    // 캐시 플러그인에서 사용하지 않는 항목 제거
    // await cachePlugin.clearUnused();
  }

  /**
   * 사용하지 않는 번역 정리
   */
  private async clearUnusedTranslations(): Promise<void> {
    console.log('Clearing unused translations');
    
    // 사용하지 않는 번역 데이터 제거
    // await translationManager.clearUnused();
  }

  /**
   * 사용하지 않는 키 제거
   */
  private async removeUnusedKeys(): Promise<void> {
    console.log('Removing unused translation keys');
    
    // 사용하지 않는 번역 키 제거
    // await translationManager.removeUnusedKeys();
  }

  /**
   * 중복 키 병합
   */
  private async mergeDuplicateKeys(): Promise<void> {
    console.log('Merging duplicate translation keys');
    
    // 중복된 번역 키 병합
    // await translationManager.mergeDuplicates();
  }

  /**
   * 자주 사용되는 번역 미리 로드
   */
  private async preloadFrequentTranslations(): Promise<void> {
    console.log('Preloading frequent translations');
    
    // 자주 사용되는 번역을 미리 로드
    // await translationManager.preloadFrequent();
  }

  /**
   * 지연 로딩 전략 적용
   */
  private async applyLazyLoading(): Promise<void> {
    console.log('Applying lazy loading strategy');
    
    // 지연 로딩 전략 적용
    // await translationManager.applyLazyLoading();
  }

  /**
   * 수동 최적화 실행
   */
  async runManualOptimization(ruleId: string): Promise<OptimizationResult | null> {
    const rule = this.config.rules.find(r => r.id === ruleId);
    if (!rule) {
      throw new Error(`Optimization rule not found: ${ruleId}`);
    }

    await this.executeRule(rule);
    return this.results[this.results.length - 1] || null;
  }

  /**
   * 최적화 결과 조회
   */
  getResults(): OptimizationResult[] {
    return [...this.results];
  }

  /**
   * 최적화 규칙 추가
   */
  addRule(rule: OptimizationRule): void {
    this.config.rules.push(rule);
  }

  /**
   * 최적화 규칙 제거
   */
  removeRule(ruleId: string): void {
    const index = this.config.rules.findIndex(r => r.id === ruleId);
    if (index > -1) {
      this.config.rules.splice(index, 1);
    }
  }

  /**
   * 설정 업데이트
   */
  updateConfig(updates: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * 현재 설정 조회
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * 활성 최적화 조회
   */
  getActiveOptimizations(): string[] {
    return Array.from(this.activeOptimizations);
  }

  /**
   * 최적화 통계 조회
   */
  getStats(): {
    totalOptimizations: number;
    successfulOptimizations: number;
    failedOptimizations: number;
    averageDuration: number;
    lastOptimization?: OptimizationResult;
  } {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = total - successful;
    const averageDuration = total > 0 
      ? this.results.reduce((sum, r) => sum + r.duration, 0) / total 
      : 0;

    return {
      totalOptimizations: total,
      successfulOptimizations: successful,
      failedOptimizations: failed,
      averageDuration,
      lastOptimization: this.results[this.results.length - 1]
    };
  }
} 