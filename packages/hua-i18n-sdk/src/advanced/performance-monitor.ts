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
        min: Infinity,
        max: 0,
        p95: 0,
        p99: 0
      },
      cachePerformance: {
        hitRate: 0,
        missRate: 0,
        evictionRate: 0,
        size: 0,
        maxSize: 0
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
   * 모니터링 시작
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.collectMetrics();
      this.analyzePerformance();
      this.generateSuggestions();
      this.notifyObservers();
    }, intervalMs);

    console.log('Performance monitoring started');
  }

  /**
   * 모니터링 중지
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

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
    // 메모리 사용량 측정
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage.current = memory.usedJSHeapSize;
      this.metrics.memoryUsage.peak = Math.max(
        this.metrics.memoryUsage.peak,
        memory.usedJSHeapSize
      );
    }

    // 번역 시간 통계 업데이트
    this.updateTranslationTimeStats();

    // 캐시 성능 업데이트
    this.updateCachePerformance();

    // 키 사용량 분석
    this.analyzeKeyUsage();
  }

  /**
   * 번역 시간 통계 업데이트
   */
  private updateTranslationTimeStats(): void {
    // 실제 구현에서는 번역 시간 데이터를 수집
    const times = this.getTranslationTimes();
    
    if (times.length === 0) return;

    const sorted = times.sort((a, b) => a - b);
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    this.metrics.translationTime = {
      average: avg,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * 캐시 성능 업데이트
   */
  private updateCachePerformance(): void {
    // 실제 구현에서는 캐시 플러그인에서 데이터를 가져옴
    const cacheStats = this.getCacheStats();
    
    this.metrics.cachePerformance = {
      hitRate: cacheStats.hitRate || 0,
      missRate: 1 - (cacheStats.hitRate || 0),
      evictionRate: cacheStats.evictionRate || 0,
      size: cacheStats.size || 0,
      maxSize: cacheStats.maxSize || 0
    };
  }

  /**
   * 키 사용량 분석
   */
  private analyzeKeyUsage(): void {
    // 실제 구현에서는 번역 키 사용량을 분석
    const keyStats = this.getKeyUsageStats();
    
    this.metrics.keyUsage = {
      totalKeys: keyStats.total || 0,
      usedKeys: keyStats.used || 0,
      unusedKeys: keyStats.unused || 0,
      duplicateKeys: keyStats.duplicates || 0,
      missingKeys: keyStats.missing || 0
    };
  }

  /**
   * 성능 분석
   */
  private analyzePerformance(): void {
    this.checkAlerts();
    this.updateTrends();
  }

  /**
   * 알림 확인
   */
  private checkAlerts(): void {
    // 번역 시간 알림
    if (this.metrics.translationTime.average > 100) {
      this.addAlert({
        type: 'warning',
        severity: 'medium',
        message: 'Translation time is above threshold',
        metric: 'translationTime.average',
        value: this.metrics.translationTime.average,
        threshold: 100
      });
    }

    // 캐시 히트율 알림
    if (this.metrics.cachePerformance.hitRate < 0.7) {
      this.addAlert({
        type: 'warning',
        severity: 'high',
        message: 'Cache hit rate is below optimal level',
        metric: 'cachePerformance.hitRate',
        value: this.metrics.cachePerformance.hitRate,
        threshold: 0.7
      });
    }

    // 메모리 사용량 알림
    if (this.metrics.memoryUsage.current > 50 * 1024 * 1024) { // 50MB
      this.addAlert({
        type: 'error',
        severity: 'high',
        message: 'Memory usage is high',
        metric: 'memoryUsage.current',
        value: this.metrics.memoryUsage.current,
        threshold: 50 * 1024 * 1024
      });
    }
  }

  /**
   * 트렌드 업데이트
   */
  private updateTrends(): void {
    // 메모리 사용량 트렌드 계산
    const current = this.metrics.memoryUsage.current;
    const previous = this.metrics.memoryUsage.average;
    
    if (current > previous * 1.1) {
      this.metrics.memoryUsage.trend = 'increasing';
    } else if (current < previous * 0.9) {
      this.metrics.memoryUsage.trend = 'decreasing';
    } else {
      this.metrics.memoryUsage.trend = 'stable';
    }
    
    this.metrics.memoryUsage.average = (current + previous) / 2;
  }

  /**
   * 최적화 제안 생성
   */
  private generateSuggestions(): void {
    this.suggestions = [];

    // 캐시 최적화 제안
    if (this.metrics.cachePerformance.hitRate < 0.8) {
      this.suggestions.push({
        id: 'cache-optimization',
        type: 'cache',
        title: 'Increase Cache Size',
        description: 'Cache hit rate is low. Consider increasing cache size.',
        impact: 'high',
        effort: 'low',
        estimatedImprovement: 20,
        implementation: 'Increase maxSize in cache plugin configuration',
        priority: 1
      });
    }

    // 번들 최적화 제안
    if (this.metrics.keyUsage.unusedKeys > this.metrics.keyUsage.usedKeys * 0.3) {
      this.suggestions.push({
        id: 'bundle-optimization',
        type: 'bundle',
        title: 'Remove Unused Translation Keys',
        description: 'Many translation keys are unused. Consider removing them.',
        impact: 'medium',
        effort: 'medium',
        estimatedImprovement: 15,
        implementation: 'Use tree-shaking or manual cleanup of unused keys',
        priority: 2
      });
    }

    // 로딩 최적화 제안
    if (this.metrics.translationTime.average > 50) {
      this.suggestions.push({
        id: 'loading-optimization',
        type: 'loading',
        title: 'Optimize Translation Loading',
        description: 'Translation loading is slow. Consider lazy loading.',
        impact: 'high',
        effort: 'high',
        estimatedImprovement: 30,
        implementation: 'Implement lazy loading for non-critical translations',
        priority: 1
      });
    }
  }

  /**
   * 알림 추가
   */
  private addAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const newAlert: PerformanceAlert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(newAlert);
  }

  /**
   * 옵저버 등록
   */
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback);
    
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * 옵저버 알림
   */
  private notifyObservers(): void {
    this.observers.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error('Error in performance observer:', error);
      }
    });
  }

  /**
   * 메트릭 조회
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
   * 제안 조회
   */
  getSuggestions(): OptimizationSuggestion[] {
    return [...this.suggestions].sort((a, b) => a.priority - b.priority);
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
   * 메트릭 리셋
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.alerts = [];
    this.suggestions = [];
  }

  // 실제 구현을 위한 헬퍼 메서드들
  private getTranslationTimes(): number[] {
    // 실제 구현에서는 번역 시간 데이터를 반환
    return [];
  }

  private getCacheStats(): any {
    // 실제 구현에서는 캐시 플러그인에서 통계를 가져옴
    return {};
  }

  private getKeyUsageStats(): any {
    // 실제 구현에서는 키 사용량 통계를 반환
    return {};
  }
} 