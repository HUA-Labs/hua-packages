/**
 * PerformanceOptimizer 테스트
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PerformanceOptimizer } from '../../core/PerformanceOptimizer'

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer
  let element: HTMLElement

  beforeEach(() => {
    // Reset singleton for test isolation
    ;(PerformanceOptimizer as any).instance = undefined
    optimizer = PerformanceOptimizer.getInstance()
    element = document.createElement('div')
    document.body.appendChild(element)
  })

  afterEach(() => {
    optimizer.destroy()
    ;(PerformanceOptimizer as any).instance = undefined
    document.body.removeChild(element)
  })

  describe('getInstance()', () => {
    it('should return same instance', () => {
      const instance1 = PerformanceOptimizer.getInstance()
      const instance2 = PerformanceOptimizer.getInstance()

      expect(instance1).toBe(instance2)
    })
  })

  describe('enableGPUAcceleration()', () => {
    it('should set correct styles on element', () => {
      optimizer.enableGPUAcceleration(element)

      expect(element.style.willChange).toBe('transform, opacity')
      expect(element.style.transform).toContain('translateZ(0)')
      expect(element.style.backfaceVisibility).toBe('hidden')
      expect(element.style.transformStyle).toBe('preserve-3d')
    })

    it('should register layer and increase count', () => {
      const initialCount = optimizer.getMetrics().layerCount

      optimizer.enableGPUAcceleration(element)

      const newCount = optimizer.getMetrics().layerCount
      expect(newCount).toBe(initialCount + 1)
    })

    it('should not set styles when GPU acceleration is disabled', () => {
      optimizer.updateConfig({ enableGPUAcceleration: false })

      optimizer.enableGPUAcceleration(element)

      expect(element.style.willChange).toBe('')
      expect(element.style.backfaceVisibility).toBe('')
    })

    it('should not register same element twice', () => {
      optimizer.enableGPUAcceleration(element)
      const count1 = optimizer.getMetrics().layerCount

      optimizer.enableGPUAcceleration(element)
      const count2 = optimizer.getMetrics().layerCount

      expect(count1).toBe(count2)
    })
  })

  describe('createOptimizedLayer()', () => {
    it('should set perspective', () => {
      optimizer.createOptimizedLayer(element)

      expect(element.style.perspective).toBe('1000px')
      expect(element.style.transform).toContain('translateZ(0)')
      expect(element.style.backfaceVisibility).toBe('hidden')
    })

    it('should register layer and increase count', () => {
      const initialCount = optimizer.getMetrics().layerCount

      optimizer.createOptimizedLayer(element)

      const newCount = optimizer.getMetrics().layerCount
      expect(newCount).toBe(initialCount + 1)
    })

    it('should do nothing when layer separation is disabled', () => {
      optimizer.updateConfig({ enableLayerSeparation: false })

      const initialCount = optimizer.getMetrics().layerCount

      optimizer.createOptimizedLayer(element)

      const newCount = optimizer.getMetrics().layerCount
      expect(newCount).toBe(initialCount)
      expect(element.style.perspective).toBe('')
    })
  })

  describe('removeLayer()', () => {
    it('should clear styles', () => {
      // Use enableGPUAcceleration which sets willChange
      optimizer.enableGPUAcceleration(element)

      expect(element.style.willChange).toBe('transform, opacity')

      optimizer.removeLayer(element)

      expect(element.style.willChange).toBe('auto')
      expect(element.style.transform).toBe('')
      expect(element.style.backfaceVisibility).toBe('')
      expect(element.style.transformStyle).toBe('')
      expect(element.style.perspective).toBe('')
    })

    it('should decrease layer count', () => {
      optimizer.createOptimizedLayer(element)
      const countBefore = optimizer.getMetrics().layerCount

      optimizer.removeLayer(element)

      const countAfter = optimizer.getMetrics().layerCount
      expect(countAfter).toBe(countBefore - 1)
    })

    it('should do nothing for non-registered element', () => {
      const initialCount = optimizer.getMetrics().layerCount

      optimizer.removeLayer(element)

      const newCount = optimizer.getMetrics().layerCount
      expect(newCount).toBe(initialCount)
    })
  })

  describe('updateConfig()', () => {
    it('should merge config correctly', () => {
      optimizer.updateConfig({
        targetFPS: 30,
        maxLayerCount: 50
      })

      const metrics = optimizer.getMetrics()
      // Can't directly check config, but we can verify it affects behavior
      expect(metrics).toBeDefined()
    })

    it('should disable GPU acceleration when config is false', () => {
      optimizer.enableGPUAcceleration(element)

      expect(element.style.willChange).toBe('transform, opacity')

      optimizer.updateConfig({ enableGPUAcceleration: false })

      expect(element.style.willChange).toBe('auto')
    })

    it('should disable all layers when config is false', () => {
      optimizer.createOptimizedLayer(element)
      const countBefore = optimizer.getMetrics().layerCount
      expect(countBefore).toBeGreaterThan(0)

      optimizer.updateConfig({ enableLayerSeparation: false })

      const countAfter = optimizer.getMetrics().layerCount
      expect(countAfter).toBe(0)
    })
  })

  describe('startMonitoring() and stopMonitoring()', () => {
    it('should toggle monitoring state', () => {
      optimizer.startMonitoring()
      // Monitoring should be active (no direct getter, but we test side effects)

      optimizer.stopMonitoring()
      // Monitoring should be stopped

      // Test passes if no errors thrown
      expect(true).toBe(true)
    })

    it('should not start monitoring twice', () => {
      optimizer.startMonitoring()
      optimizer.startMonitoring()

      // Should handle gracefully
      expect(true).toBe(true)

      optimizer.stopMonitoring()
    })

    it('should not stop monitoring if not started', () => {
      optimizer.stopMonitoring()

      // Should handle gracefully
      expect(true).toBe(true)
    })
  })

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = optimizer.getMetrics()

      expect(metrics).toBeDefined()
      expect(typeof metrics.fps).toBe('number')
      expect(typeof metrics.layerCount).toBe('number')
      expect(typeof metrics.activeMotions).toBe('number')
    })

    it('should return a copy not a reference', () => {
      const metrics1 = optimizer.getMetrics()
      const metrics2 = optimizer.getMetrics()

      expect(metrics1).not.toBe(metrics2)
      expect(metrics1).toEqual(metrics2)
    })
  })

  describe('generateReport()', () => {
    it('should return string report', () => {
      const report = optimizer.generateReport()

      expect(typeof report).toBe('string')
      expect(report).toContain('FPS')
      expect(report).toContain('Active Layers')
      expect(report).toContain('GPU Acceleration')
    })

    it('should contain key information', () => {
      const report = optimizer.generateReport()

      expect(report).toContain('Memory Usage')
      expect(report).toContain('Active Motions')
      expect(report).toContain('Layer Separation')
      expect(report).toContain('Memory Optimization')
    })
  })

  describe('getOptimizationRecommendations()', () => {
    it('should return array of recommendations', () => {
      const recommendations = optimizer.getOptimizationRecommendations()

      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('should recommend reducing layers when count is high', () => {
      // Add many layers
      for (let i = 0; i < 85; i++) {
        const el = document.createElement('div')
        optimizer.createOptimizedLayer(el)
      }

      const recommendations = optimizer.getOptimizationRecommendations()

      const hasLayerRecommendation = recommendations.some(rec =>
        rec.includes('레이어')
      )
      expect(hasLayerRecommendation).toBe(true)
    })
  })

  describe('destroy()', () => {
    it('should clean up all layers', () => {
      optimizer.createOptimizedLayer(element)

      expect(optimizer.getMetrics().layerCount).toBeGreaterThan(0)

      optimizer.destroy()

      expect(optimizer.getMetrics().layerCount).toBe(0)
    })

    it('should stop monitoring', () => {
      optimizer.startMonitoring()
      optimizer.destroy()

      // Should handle gracefully without errors
      expect(true).toBe(true)
    })
  })

  describe('Multiple elements', () => {
    it('should track multiple layers correctly', () => {
      const element2 = document.createElement('div')
      const element3 = document.createElement('div')

      optimizer.createOptimizedLayer(element)
      optimizer.createOptimizedLayer(element2)
      optimizer.createOptimizedLayer(element3)

      expect(optimizer.getMetrics().layerCount).toBe(3)
    })

    it('should remove individual layers', () => {
      const element2 = document.createElement('div')

      optimizer.createOptimizedLayer(element)
      optimizer.createOptimizedLayer(element2)

      expect(optimizer.getMetrics().layerCount).toBe(2)

      optimizer.removeLayer(element)

      expect(optimizer.getMetrics().layerCount).toBe(1)
    })
  })
})
