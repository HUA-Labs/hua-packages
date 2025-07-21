/**
 * 실시간 대시보드 - 성능 모니터링 및 최적화
 * React 컴포넌트로 구현된 실시간 대시보드
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PerformanceMonitor, PerformanceMetrics, PerformanceAlert } from './performance-monitor';
import { AutoOptimizer, OptimizationResult } from './auto-optimizer';

export interface DashboardProps {
  monitor: PerformanceMonitor;
  optimizer: AutoOptimizer;
  className?: string;
  theme?: 'light' | 'dark';
  showAlerts?: boolean;
  showOptimizations?: boolean;
  refreshInterval?: number;
}

export interface DashboardState {
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
  optimizations: OptimizationResult[];
  isMonitoring: boolean;
  isOptimizing: boolean;
}

export const I18nDashboard: React.FC<DashboardProps> = ({
  monitor,
  optimizer,
  className = '',
  theme = 'light',
  showAlerts = true,
  showOptimizations = true,
  refreshInterval = 5000
}) => {
  const [state, setState] = useState<DashboardState>({
    metrics: monitor.getMetrics(),
    alerts: monitor.getAlerts(),
    optimizations: optimizer.getResults(),
    isMonitoring: false,
    isOptimizing: false
  });

  // 메트릭 업데이트
  const updateMetrics = useCallback(() => {
    setState(prev => ({
      ...prev,
      metrics: monitor.getMetrics(),
      alerts: monitor.getAlerts(),
      optimizations: optimizer.getResults()
    }));
  }, [monitor, optimizer]);

  // 모니터링 시작/중지
  const toggleMonitoring = useCallback(() => {
    if (state.isMonitoring) {
      monitor.stopMonitoring();
    } else {
      monitor.startMonitoring(refreshInterval);
    }
    setState(prev => ({ ...prev, isMonitoring: !prev.isMonitoring }));
  }, [monitor, state.isMonitoring, refreshInterval]);

  // 자동 최적화 시작/중지
  const toggleOptimization = useCallback(() => {
    if (state.isOptimizing) {
      optimizer.stop();
    } else {
      optimizer.start();
    }
    setState(prev => ({ ...prev, isOptimizing: !prev.isOptimizing }));
  }, [optimizer, state.isOptimizing]);

  // 알림 해결
  const resolveAlert = useCallback((alertId: string) => {
    monitor.resolveAlert(alertId);
    updateMetrics();
  }, [monitor, updateMetrics]);

  // 수동 최적화 실행
  const runOptimization = useCallback(async (ruleId: string) => {
    try {
      await optimizer.runManualOptimization(ruleId);
      updateMetrics();
    } catch (error) {
      console.error('Manual optimization failed:', error);
    }
  }, [optimizer, updateMetrics]);

  // 메트릭 구독
  useEffect(() => {
    const unsubscribe = monitor.subscribe(updateMetrics);
    return unsubscribe;
  }, [monitor, updateMetrics]);

  // 자동 업데이트
  useEffect(() => {
    const interval = setInterval(updateMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [updateMetrics, refreshInterval]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'increasing': return '↗️';
      case 'decreasing': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  return (
    <div className={`i18n-dashboard ${theme} ${className}`}>
      {/* 헤더 */}
      <div className="dashboard-header">
        <h2>HUA i18n SDK Dashboard</h2>
        <div className="dashboard-controls">
          <button
            onClick={toggleMonitoring}
            className={`btn ${state.isMonitoring ? 'btn-stop' : 'btn-start'}`}
          >
            {state.isMonitoring ? '⏹️ Stop Monitoring' : '▶️ Start Monitoring'}
          </button>
          <button
            onClick={toggleOptimization}
            className={`btn ${state.isOptimizing ? 'btn-stop' : 'btn-start'}`}
          >
            {state.isOptimizing ? '⏹️ Stop Optimization' : '⚡ Start Optimization'}
          </button>
        </div>
      </div>

      {/* 메트릭 카드 */}
      <div className="metrics-grid">
        {/* 번역 성능 */}
        <div className="metric-card">
          <h3>Translation Performance</h3>
          <div className="metric-value">
            <span className="value">{formatTime(state.metrics.translationTime.average)}</span>
            <span className="label">Average Time</span>
          </div>
          <div className="metric-details">
            <div>Min: {formatTime(state.metrics.translationTime.min)}</div>
            <div>Max: {formatTime(state.metrics.translationTime.max)}</div>
            <div>P95: {formatTime(state.metrics.translationTime.p95)}</div>
          </div>
        </div>

        {/* 캐시 성능 */}
        <div className="metric-card">
          <h3>Cache Performance</h3>
          <div className="metric-value">
            <span className="value">{formatPercentage(state.metrics.cachePerformance.hitRate)}</span>
            <span className="label">Hit Rate</span>
          </div>
          <div className="metric-details">
            <div>Size: {state.metrics.cachePerformance.size}/{state.metrics.cachePerformance.maxSize}</div>
            <div>Miss Rate: {formatPercentage(state.metrics.cachePerformance.missRate)}</div>
            <div>Eviction: {formatPercentage(state.metrics.cachePerformance.evictionRate)}</div>
          </div>
        </div>

        {/* 메모리 사용량 */}
        <div className="metric-card">
          <h3>Memory Usage</h3>
          <div className="metric-value">
            <span className="value">{formatBytes(state.metrics.memoryUsage.current)}</span>
            <span className="label">Current {getTrendIcon(state.metrics.memoryUsage.trend)}</span>
          </div>
          <div className="metric-details">
            <div>Peak: {formatBytes(state.metrics.memoryUsage.peak)}</div>
            <div>Average: {formatBytes(state.metrics.memoryUsage.average)}</div>
            <div>Trend: {state.metrics.memoryUsage.trend}</div>
          </div>
        </div>

        {/* 키 사용량 */}
        <div className="metric-card">
          <h3>Key Usage</h3>
          <div className="metric-value">
            <span className="value">{state.metrics.keyUsage.usedKeys}</span>
            <span className="label">Used Keys</span>
          </div>
          <div className="metric-details">
            <div>Total: {state.metrics.keyUsage.totalKeys}</div>
            <div>Unused: {state.metrics.keyUsage.unusedKeys}</div>
            <div>Missing: {state.metrics.keyUsage.missingKeys}</div>
          </div>
        </div>
      </div>

      {/* 알림 섹션 */}
      {showAlerts && (
        <div className="alerts-section">
          <h3>Performance Alerts</h3>
          <div className="alerts-list">
            {state.alerts.filter(alert => !alert.resolved).map(alert => (
              <div key={alert.id} className={`alert-item ${getSeverityColor(alert.severity)}`}>
                <div className="alert-header">
                  <span className="alert-type">{alert.type.toUpperCase()}</span>
                  <span className="alert-severity">{alert.severity}</span>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="btn-resolve"
                  >
                    ✓
                  </button>
                </div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-details">
                  {alert.metric}: {alert.value} (threshold: {alert.threshold})
                </div>
                <div className="alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {state.alerts.filter(alert => !alert.resolved).length === 0 && (
              <div className="no-alerts">No active alerts</div>
            )}
          </div>
        </div>
      )}

      {/* 최적화 섹션 */}
      {showOptimizations && (
        <div className="optimizations-section">
          <h3>Optimization Results</h3>
          <div className="optimizations-list">
            {state.optimizations.slice(-5).reverse().map(optimization => (
              <div key={optimization.id} className={`optimization-item ${optimization.success ? 'success' : 'error'}`}>
                <div className="optimization-header">
                  <span className="optimization-rule">{optimization.ruleId}</span>
                  <span className={`optimization-status ${optimization.success ? 'success' : 'error'}`}>
                    {optimization.success ? '✓' : '✗'}
                  </span>
                </div>
                <div className="optimization-details">
                  <div>Duration: {formatTime(optimization.duration)}</div>
                  {optimization.improvement && (
                    <div>Improvement: {optimization.improvement}%</div>
                  )}
                  {optimization.error && (
                    <div className="optimization-error">{optimization.error}</div>
                  )}
                </div>
                <div className="optimization-time">
                  {new Date(optimization.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {state.optimizations.length === 0 && (
              <div className="no-optimizations">No optimizations run yet</div>
            )}
          </div>
        </div>
      )}

      {/* 언어별 성능 */}
      <div className="language-performance">
        <h3>Language Performance</h3>
        <div className="language-grid">
          {Object.entries(state.metrics.languagePerformance).map(([language, perf]) => (
            <div key={language} className="language-item">
              <div className="language-name">{language}</div>
              <div className="language-stats">
                <div>Load: {formatTime(perf.loadTime)}</div>
                <div>Usage: {perf.usageCount}</div>
                <div>Errors: {formatPercentage(perf.errorRate)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 네임스페이스별 성능 */}
      <div className="namespace-performance">
        <h3>Namespace Performance</h3>
        <div className="namespace-grid">
          {Object.entries(state.metrics.namespacePerformance).map(([namespace, perf]) => (
            <div key={namespace} className="namespace-item">
              <div className="namespace-name">{namespace}</div>
              <div className="namespace-stats">
                <div>Load: {formatTime(perf.loadTime)}</div>
                <div>Usage: {perf.usageCount}</div>
                <div>Size: {perf.size} keys</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최적화 제안 */}
      <div className="suggestions-section">
        <h3>Optimization Suggestions</h3>
        <div className="suggestions-list">
          {optimizer.getStats().lastOptimization && (
            <div className="suggestion-item">
              <div className="suggestion-title">
                Last Optimization: {optimizer.getStats().lastOptimization?.ruleId}
              </div>
              <div className="suggestion-details">
                Success: {optimizer.getStats().lastOptimization?.success ? 'Yes' : 'No'}
                Duration: {formatTime(optimizer.getStats().lastOptimization?.duration || 0)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS 스타일 (실제 구현에서는 별도 CSS 파일로 분리)
const styles = `
.i18n-dashboard {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.i18n-dashboard.dark {
  background: #1a1a1a;
  color: #ffffff;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.dashboard-controls {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-start {
  background: #28a745;
  color: white;
}

.btn-stop {
  background: #dc3545;
  color: white;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.metric-value {
  text-align: center;
  margin: 15px 0;
}

.metric-value .value {
  font-size: 2em;
  font-weight: bold;
  color: #007bff;
  display: block;
}

.metric-value .label {
  font-size: 0.9em;
  color: #666;
}

.metric-details {
  font-size: 0.85em;
  color: #666;
  line-height: 1.4;
}

.alerts-section,
.optimizations-section,
.language-performance,
.namespace-performance,
.suggestions-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.alert-item,
.optimization-item {
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 6px;
  border-left: 4px solid;
}

.alert-item {
  border-left-color: #ffc107;
}

.optimization-item.success {
  border-left-color: #28a745;
}

.optimization-item.error {
  border-left-color: #dc3545;
}

.alert-header,
.optimization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.btn-resolve {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2em;
}

.language-grid,
.namespace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.language-item,
.namespace-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.no-alerts,
.no-optimizations {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
}
`;

// 스타일 주입
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
} 