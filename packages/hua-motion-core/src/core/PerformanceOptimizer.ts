/**
 * HUA Motion Core - 성능 최적화 시스템
 * 
 * GPU 가속, 레이어 관리, 메모리 최적화를 위한 유틸리티들
 * 브라우저별 최적화 전략 포함
 */

export interface PerformanceMetrics {
  fps: number
  memoryUsage?: number
  gpuTime?: number
  cpuTime?: number
  layerCount: number
  activeMotions: number
}

export interface OptimizationConfig {
  enableGPUAcceleration: boolean
  enableLayerSeparation: boolean
  enableMemoryOptimization: boolean
  targetFPS: number
  maxLayerCount: number
  memoryThreshold: number
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private config: OptimizationConfig
  private performanceObserver: PerformanceObserver | null = null
  private metrics: PerformanceMetrics
  private layerRegistry = new Set<HTMLElement>()
  private isMonitoring = false

  constructor() {
    this.config = {
      enableGPUAcceleration: true,
      enableLayerSeparation: true,
      enableMemoryOptimization: true,
      targetFPS: 60,
      maxLayerCount: 100,
      memoryThreshold: 50 * 1024 * 1024 // 50MB
    }

    this.metrics = {
      fps: 0,
      layerCount: 0,
      activeMotions: 0
    }

    this.initializePerformanceMonitoring()
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  /**
   * 성능 모니터링 초기화
   */
  private initializePerformanceMonitoring(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          this.updatePerformanceMetrics(entries)
        })
        
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] })
      } catch (error) {
        console.warn('Performance monitoring not supported:', error)
      }
    }
  }

  /**
   * 성능 메트릭 업데이트
   */
  private updatePerformanceMetrics(entries: PerformanceEntry[]): void {
    entries.forEach(entry => {
      if (entry.entryType === 'measure') {
        // FPS 계산
        this.calculateFPS()
      }
    })
  }

  /**
   * FPS 계산
   */
  private calculateFPS(): void {
    const now = performance.now()
    const deltaTime = now - (this.lastFrameTime || now)
    this.lastFrameTime = now
    
    if (deltaTime > 0) {
      this.metrics.fps = Math.round(1000 / deltaTime)
    }
  }

  /**
   * GPU 가속 활성화
   */
  enableGPUAcceleration(element: HTMLElement): void {
    if (!this.config.enableGPUAcceleration) return

    try {
      // will-change 속성으로 GPU 가속 힌트 제공
      element.style.willChange = 'transform, opacity'
      
      // transform3d로 강제 GPU 가속
      element.style.transform = 'translateZ(0)'
      
      // 하드웨어 가속을 위한 추가 속성들
      element.style.backfaceVisibility = 'hidden'
      element.style.transformStyle = 'preserve-3d'
      
      // 레이어 등록
      this.registerLayer(element)
      
    } catch (error) {
      console.warn('GPU acceleration failed:', error)
    }
  }

  /**
   * 레이어 분리 및 최적화
   */
  createOptimizedLayer(element: HTMLElement): void {
    if (!this.config.enableLayerSeparation) return

    try {
      // 새로운 레이어 생성
      element.style.transform = 'translateZ(0)'
      element.style.backfaceVisibility = 'hidden'
      element.style.perspective = '1000px'
      
      // 레이어 등록
      this.registerLayer(element)
      
      // 레이어 수 제한 체크
      this.checkLayerLimit()
      
    } catch (error) {
      console.warn('Layer optimization failed:', error)
    }
  }

  /**
   * 레이어 등록
   */
  private registerLayer(element: HTMLElement): void {
    if (this.layerRegistry.has(element)) return
    
    this.layerRegistry.add(element)
    this.metrics.layerCount = this.layerRegistry.size
    
    // 메모리 사용량 체크
    this.checkMemoryUsage()
  }

  /**
   * 레이어 제거
   */
  removeLayer(element: HTMLElement): void {
    if (this.layerRegistry.has(element)) {
      this.layerRegistry.delete(element)
      this.metrics.layerCount = this.layerRegistry.size
      
      // GPU 가속 비활성화
      element.style.willChange = 'auto'
      element.style.transform = ''
      element.style.backfaceVisibility = ''
      element.style.transformStyle = ''
      element.style.perspective = ''
    }
  }

  /**
   * 레이어 수 제한 체크
   */
  private checkLayerLimit(): void {
    if (this.metrics.layerCount > this.config.maxLayerCount) {
      console.warn(`Layer count (${this.metrics.layerCount}) exceeds limit (${this.config.maxLayerCount})`)
      
      // 오래된 레이어들 정리
      this.cleanupOldLayers()
    }
  }

  /**
   * 오래된 레이어 정리
   */
  private cleanupOldLayers(): void {
    const layersToRemove = Array.from(this.layerRegistry).slice(0, 10)
    layersToRemove.forEach(layer => {
      this.removeLayer(layer)
    })
  }

  /**
   * 메모리 사용량 체크
   */
  private checkMemoryUsage(): void {
    if (!this.config.enableMemoryOptimization) return

    // Memory API 지원 여부 체크
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize
      
      if (memory.usedJSHeapSize > this.config.memoryThreshold) {
        console.warn('Memory usage high, cleaning up...')
        this.cleanupMemory()
      }
    }
  }

  /**
   * 메모리 정리
   */
  private cleanupMemory(): void {
    // 가비지 컬렉션 힌트
    if ('gc' in window) {
      try {
        (window as any).gc()
      } catch (error) {
        // gc() 호출 실패 시 무시
      }
    }
    
    // 불필요한 레이어 정리
    this.cleanupOldLayers()
  }

  /**
   * 성능 최적화 설정 업데이트
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 설정 변경에 따른 즉시 적용
    if (!this.config.enableGPUAcceleration) {
      this.disableAllGPUAcceleration()
    }
    
    if (!this.config.enableLayerSeparation) {
      this.disableAllLayers()
    }
  }

  /**
   * 모든 GPU 가속 비활성화
   */
  private disableAllGPUAcceleration(): void {
    this.layerRegistry.forEach(element => {
      element.style.willChange = 'auto'
      element.style.transform = ''
    })
  }

  /**
   * 모든 레이어 비활성화
   */
  private disableAllLayers(): void {
    this.layerRegistry.forEach(element => {
      this.removeLayer(element)
    })
  }

  /**
   * 성능 메트릭 가져오기
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 성능 모니터링 시작
   */
  startMonitoring(): void {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics()
    }, 1000) // 1초마다 업데이트
  }

  /**
   * 성능 모니터링 중지
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return
    
    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
  }

  /**
   * 메트릭 업데이트
   */
  private updateMetrics(): void {
    // 메모리 사용량 업데이트
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize
    }
    
    // 레이어 수 업데이트
    this.metrics.layerCount = this.layerRegistry.size
  }

  /**
   * 성능 리포트 생성
   */
  generateReport(): string {
    const metrics = this.getMetrics()
    
    return `
=== HUA Motion Performance Report ===
FPS: ${metrics.fps}
Active Layers: ${metrics.layerCount}
Memory Usage: ${this.formatBytes(metrics.memoryUsage || 0)}
Active Motions: ${metrics.activeMotions}
GPU Acceleration: ${this.config.enableGPUAcceleration ? 'Enabled' : 'Disabled'}
Layer Separation: ${this.config.enableLayerSeparation ? 'Enabled' : 'Disabled'}
Memory Optimization: ${this.config.enableMemoryOptimization ? 'Enabled' : 'Disabled'}
=====================================
    `.trim()
  }

  /**
   * 바이트 단위 포맷팅
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 성능 최적화 권장사항
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = []
    const metrics = this.getMetrics()
    
    if (metrics.fps < this.config.targetFPS) {
      recommendations.push('FPS가 낮습니다. GPU 가속을 활성화하거나 레이어 수를 줄이세요.')
    }
    
    if (metrics.layerCount > this.config.maxLayerCount * 0.8) {
      recommendations.push('레이어 수가 많습니다. 불필요한 레이어를 정리하세요.')
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage > this.config.memoryThreshold * 0.8) {
      recommendations.push('메모리 사용량이 높습니다. 메모리 정리를 고려하세요.')
    }
    
    return recommendations
  }

  /**
   * 정리
   */
  destroy(): void {
    this.stopMonitoring()
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
      this.performanceObserver = null
    }
    
    // 모든 레이어 정리
    this.layerRegistry.forEach(element => {
      this.removeLayer(element)
    })
    
    this.layerRegistry.clear()
  }

  private lastFrameTime?: number
  private monitoringInterval?: NodeJS.Timeout
}

// 싱글톤 인스턴스
export const performanceOptimizer = PerformanceOptimizer.getInstance()
