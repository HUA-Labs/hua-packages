
/**
 * 성능 모니터링 시스템 - 고급 분석
 * 실시간 성능 추적 및 최적화 제안
 */

export interface PerformanceMetrics {
  // 번역 성능
  translationTime: {
    average: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  };
  
  // 캐시 성능
  cachePerformance: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    size: number;
    maxSize: number;
  };
  
  // 메모리 사용량
  memoryUsage: {
    current: number;
    peak: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  
  // 번역 키 사용량
  keyUsage: {
    totalKeys: number;
    usedKeys: number;
    unusedKeys: number;
    duplicateKeys: number;
    missingKeys: number;
  };
  
  // 언어별 성능
  languagePerformance: {
    [language: string]: {
      loadTime: number;
      usageCount: number;
      errorRate: number;
    };
  };
  
  // 네임스페이스별 성능
  namespacePerformance: {
    [namespace: string]: {
      loadTime: number;
      usageCount: number;
      size: number;
    };
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  resolved: boolean;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'cache' | 'bundle' | 'loading' | 'memory' | 'performance';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: number; // 퍼센트
  implementation: string;
  priority: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private suggestions: OptimizationSuggestion[] = [];
  private observers: Array<(metrics: PerformanceMetrics) => void> = [];
  private isMonitoring = false;
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  /**
   * 메트릭 초기화
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      translationTime: {
        average: 0,
        min: 0,
        max: 0,
        p95: 0,
        p99: 0
      },
      cachePerformance: {
        hitRate: 0,
        missRate: 0,
        evictionRate: 0,
        size: 0,
        maxSize: 1000
      },
      memoryUsage: {
        current: 0,
        peak: 0,
        average: 0,
        trend: 'stable'
      },
      keyUsage: {
        totalKeys: 0,
        usedKeys: 0,
        unusedKeys: 0,
        duplicateKeys: 0,
        missingKeys: 0
      },
      languagePerformance: {},
      namespacePerformance: {}
    };
  }

  /**
   * 번역 로드 시간 기록
   */
  static recordTranslationLoad(language: string, namespace: string, loadTime: number): void {
    // 전역 성능 데이터에 기록
    if (typeof window !== 'undefined') {
      const performanceData = window.__I18N_PERFORMANCE_DATA__ || {};
      const key = `${language}:${namespace}`;
      
      if (!performanceData[key]) {
        performanceData[key] = [];
      }
      
      performanceData[key].push(loadTime);
      
      // 최대 100개까지만 유지
      if (performanceData[key].length > 100) {
        performanceData[key] = performanceData[key].slice(-100);
      }
      
      window.__I18N_PERFORMANCE_DATA__ = performanceData;
    }
  }

  /**
   * 성능 알림 생성
   */
  static alert(alert: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const fullAlert: PerformanceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false
    };

    // 전역 알림 배열에 추가
    if (typeof window !== 'undefined') {
      const alerts = window.__I18N_PERFORMANCE_ALERTS__ || [];
      alerts.push(fullAlert);
      
      // 최대 50개까지만 유지
      if (alerts.length > 50) {
        alerts.splice(0, alerts.length - 50);
      }
      
      window.__I18N_PERFORMANCE_ALERTS__ = alerts;
      
      // 콘솔에 출력
      console.warn(`[PERFORMANCE ALERT] ${fullAlert.message}`);
    }
  }

  /**
   * 모니터링 시작
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      console.warn('Performance monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    console.log('Performance monitoring started');
  }

  /**
   * 모니터링 중지
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('Performance monitoring stopped');
  }

  /**
   * 메트릭 수집
   */
  private collectMetrics(): void {
    this.updateTranslationTimeStats();
    this.updateCachePerformance();
    this.analyzeKeyUsage();
    this.analyzePerformance();
    this.checkAlerts();
    this.updateTrends();
    this.generateSuggestions();
    this.notifyObservers();
  }

  /**
   * 번역 시간 통계 업데이트
   */
  private updateTranslationTimeStats(): void {
    if (typeof window === 'undefined') return;

    const performanceData = window.__I18N_PERFORMANCE_DATA__ || {};
    const allTimes: number[] = [];

    Object.values(performanceData).forEach((times: any) => {
      allTimes.push(...times);
    });

    if (allTimes.length > 0) {
      const sorted = allTimes.sort((a, b) => a - b);
      const avg = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
      const p95Index = Math.floor(allTimes.length * 0.95);
      const p99Index = Math.floor(allTimes.length * 0.99);

      this.metrics.translationTime = {
        average: avg,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p95: sorted[p95Index] || 0,
        p99: sorted[p99Index] || 0
      };
    }
  }

  /**
   * 캐시 성능 업데이트
   */
  private updateCachePerformance(): void {
    // 실제 캐시 데이터가 있다면 여기서 수집
    // 현재는 기본값 사용
    this.metrics.cachePerformance = {
      hitRate: 0.8,
      missRate: 0.2,
      evictionRate: 0.1,
      size: 0,
      maxSize: 1000
    };
  }

  /**
   * 키 사용량 분석
   */
  private analyzeKeyUsage(): void {
    // 실제 번역 키 데이터가 있다면 여기서 분석
    this.metrics.keyUsage = {
      totalKeys: 0,
      usedKeys: 0,
      unusedKeys: 0,
      duplicateKeys: 0,
      missingKeys: 0
    };
  }

  /**
   * 성능 분석
   */
  private analyzePerformance(): void {
    // 언어별, 네임스페이스별 성능 분석
    if (typeof window === 'undefined') return;

    const performanceData = window.__I18N_PERFORMANCE_DATA__ || {};
    
    Object.entries(performanceData).forEach(([key, times]: [string, any]) => {
      const [language, namespace] = key.split(':');
      const avgLoadTime = times.reduce((sum: number, time: number) => sum + time, 0) / times.length;
      
      this.metrics.languagePerformance[language] = {
        loadTime: avgLoadTime,
        usageCount: times.length,
        errorRate: 0
      };
      
      this.metrics.namespacePerformance[namespace] = {
        loadTime: avgLoadTime,
        usageCount: times.length,
        size: times.length
      };
    });
  }

  /**
   * 알림 체크
   */
  private checkAlerts(): void {
    // 번역 시간 알림
    if (this.metrics.translationTime.average > 50) {
      this.addAlert({
        type: 'warning',
        severity: 'medium',
        message: `Average translation time is ${this.metrics.translationTime.average.toFixed(2)}ms`,
        metric: 'translationTime',
        value: this.metrics.translationTime.average,
        threshold: 50
      });
    }

    // 캐시 히트율 알림
    if (this.metrics.cachePerformance.hitRate < 0.7) {
      this.addAlert({
        type: 'warning',
        severity: 'low',
        message: `Cache hit rate is ${(this.metrics.cachePerformance.hitRate * 100).toFixed(1)}%`,
        metric: 'cacheHitRate',
        value: this.metrics.cachePerformance.hitRate,
        threshold: 0.7
      });
    }
  }

  /**
   * 트렌드 업데이트
   */
  private updateTrends(): void {
    // 메모리 사용량 트렌드 분석
    const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const peakMemory = (performance as any).memory?.totalJSHeapSize || 0;
    
    this.metrics.memoryUsage = {
      current: currentMemory / 1024 / 1024, // MB
      peak: peakMemory / 1024 / 1024, // MB
      average: (currentMemory + peakMemory) / 2 / 1024 / 1024, // MB
      trend: 'stable'
    };
  }

  /**
   * 최적화 제안 생성
   */
  private generateSuggestions(): void {
    this.suggestions = [];

    // 번역 시간 최적화 제안
    if (this.metrics.translationTime.average > 30) {
      this.suggestions.push({
        id: `suggestion_${Date.now()}_1`,
        type: 'performance',
        title: 'Optimize Translation Loading',
        description: 'Consider implementing lazy loading for translations',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: 40,
        implementation: 'Use dynamic imports for translation files',
        priority: 1
      });
    }

    // 캐시 최적화 제안
    if (this.metrics.cachePerformance.hitRate < 0.8) {
      this.suggestions.push({
        id: `suggestion_${Date.now()}_2`,
        type: 'cache',
        title: 'Improve Cache Strategy',
        description: 'Increase cache size or implement better cache invalidation',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: 20,
        implementation: 'Increase cache size and implement LRU eviction',
        priority: 2
      });
    }
  }

  /**
   * 알림 추가
   */
  private addAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const fullAlert: PerformanceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(fullAlert);
  }

  /**
   * 옵저버 구독
   */
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback);
    
    // 즉시 현재 메트릭 전달
    callback(this.metrics);
    
    // 구독 해제 함수 반환
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * 옵저버들에게 알림
   */
  private notifyObservers(): void {
    this.observers.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error('Error in performance observer callback:', error);
      }
    });
  }

  /**
   * 현재 메트릭 조회
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 알림 조회
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * 최적화 제안 조회
   */
  getSuggestions(): OptimizationSuggestion[] {
    return [...this.suggestions];
  }

  /**
   * 알림 해결
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * 모든 알림 해결
   */
  resolveAllAlerts(): void {
    this.alerts.forEach(alert => {
      alert.resolved = true;
    });
  }

  /**
   * 메트릭 초기화
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.alerts = [];
    this.suggestions = [];
  }

  /**
   * 번역 시간 데이터 조회
   */
  private getTranslationTimes(): number[] {
    if (typeof window === 'undefined') return [];
    
    const performanceData = window.__I18N_PERFORMANCE_DATA__ || {};
    const allTimes: number[] = [];
    
    Object.values(performanceData).forEach((times: any) => {
      allTimes.push(...times);
    });
    
    return allTimes;
  }

  /**
   * 캐시 통계 조회
   */
  private getCacheStats(): any {
    return this.metrics.cachePerformance;
  }

  /**
   * 키 사용량 통계 조회
   */
  private getKeyUsageStats(): any {
    return this.metrics.keyUsage;
  }
}

// 전역 타입 선언
declare global {
  interface Window {
    __I18N_PERFORMANCE_DATA__?: Record<string, number[]>;
    __I18N_PERFORMANCE_ALERTS__?: PerformanceAlert[];
  }
} 