/**
 * 테스트 컴포넌트 - 고급 기능 통합 테스트
 * 실제 데이터로 모든 기능을 테스트할 수 있는 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { 
  PerformanceMonitor, 
  AutoOptimizer, 
  I18nDashboard,
  createI18nConfig,
  I18nProvider,
  analyticsPlugin,
  cachePlugin,
  I18nPluginManager
} from '../index';
import { 
  generateTestMetrics, 
  generateTestAlerts, 
  generateTestSuggestions,
  allTranslations,
  getTestDataStats
} from './test-data';

export interface TestComponentProps {
  showDashboard?: boolean;
  autoStart?: boolean;
  testInterval?: number;
}

export const AdvancedFeaturesTest: React.FC<TestComponentProps> = ({
  showDashboard = true,
  autoStart = true,
  testInterval = 3000
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);

  // 성능 모니터 생성
  const monitor = new PerformanceMonitor();
  
  // 자동 최적화기 생성
  const optimizer = new AutoOptimizer(monitor, {
    enabled: true,
    autoApply: false,
    maxConcurrentOptimizations: 2,
    optimizationInterval: 10000
  });

  // 플러그인 매니저 생성
  const pluginManager = new I18nPluginManager();

  // i18n 설정
  const config = createI18nConfig({
    defaultLanguage: 'ko',
    fallbackLanguage: 'en',
    supportedLanguages: [
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' }
    ],
    namespaces: ['common', 'auth', 'dashboard', 'settings'],
    loadTranslations: async (language: string, namespace: string) => {
      // 테스트 데이터에서 번역 로드
      return allTranslations[language as keyof typeof allTranslations]?.[namespace as keyof typeof allTranslations.ko] || {};
    },
    plugins: [
      analyticsPlugin({ 
        trackMissingKeys: true,
        trackPerformance: true,
        trackUsage: true,
        console: true
      }),
      cachePlugin({ 
        maxSize: 100,
        ttl: 300000,
        strategy: 'lru',
        persist: false
      })
    ]
  });

  // 테스트 시작
  const startTest = () => {
    setIsRunning(true);
    
    // 모니터링 시작
    monitor.startMonitoring(testInterval);
    
    // 자동 최적화 시작
    optimizer.start();
    
    // 플러그인 등록
    pluginManager.register(analyticsPlugin({ trackPerformance: true }));
    pluginManager.register(cachePlugin({ maxSize: 50 }));
    
    console.log('🚀 Advanced features test started');
  };

  // 테스트 중지
  const stopTest = () => {
    setIsRunning(false);
    
    // 모니터링 중지
    monitor.stopMonitoring();
    
    // 자동 최적화 중지
    optimizer.stop();
    
    console.log('⏹️ Advanced features test stopped');
  };

  // 테스트 결과 수집
  const collectTestResults = () => {
    const metrics = monitor.getMetrics();
    const alerts = monitor.getAlerts();
    const suggestions = monitor.getSuggestions();
    const optimizationStats = optimizer.getStats();
    const pluginStatus = pluginManager.getStatus();
    const testDataStats = getTestDataStats();

    const results = {
      timestamp: new Date().toISOString(),
      testDataStats,
      metrics,
      alerts: alerts.length,
      suggestions: suggestions.length,
      optimizationStats,
      pluginStatus,
      performance: {
        translationTime: metrics.translationTime.average,
        cacheHitRate: metrics.cachePerformance.hitRate,
        memoryUsage: metrics.memoryUsage.current,
        keyUsage: metrics.keyUsage.usedKeys
      }
    };

    setTestResults(results);
    setCurrentMetrics(metrics);
    
    return results;
  };

  // 자동 테스트 시작
  useEffect(() => {
    if (autoStart) {
      startTest();
    }

    return () => {
      stopTest();
    };
  }, [autoStart]);

  // 주기적 결과 수집
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      collectTestResults();
    }, testInterval);

    return () => clearInterval(interval);
  }, [isRunning, testInterval]);

  // 테스트 데이터 통계
  const testStats = getTestDataStats();

  return (
    <div className="advanced-features-test">
      <div className="test-header">
        <h2>🧪 Advanced Features Test</h2>
        <div className="test-controls">
          <button 
            onClick={isRunning ? stopTest : startTest}
            className={`test-btn ${isRunning ? 'stop' : 'start'}`}
          >
            {isRunning ? '⏹️ Stop Test' : '▶️ Start Test'}
          </button>
          <button 
            onClick={collectTestResults}
            className="test-btn collect"
          >
            📊 Collect Results
          </button>
        </div>
      </div>

      <div className="test-info">
        <div className="info-card">
          <h3>📋 Test Data</h3>
          <ul>
            <li>Total Keys: {testStats.totalKeys}</li>
            <li>Languages: {testStats.languages}</li>
            <li>Namespaces: {testStats.namespaces}</li>
            <li>Keys per Namespace: {Object.values(testStats.keysPerNamespace).join(', ')}</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>⚙️ Test Configuration</h3>
          <ul>
            <li>Test Interval: {testInterval}ms</li>
            <li>Auto Start: {autoStart ? 'Yes' : 'No'}</li>
            <li>Show Dashboard: {showDashboard ? 'Yes' : 'No'}</li>
            <li>Status: {isRunning ? 'Running' : 'Stopped'}</li>
          </ul>
        </div>
      </div>

      {currentMetrics && (
        <div className="current-metrics">
          <h3>📈 Current Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Translation Time:</span>
              <span className="metric-value">{currentMetrics.translationTime.average.toFixed(1)}ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Cache Hit Rate:</span>
              <span className="metric-value">{(currentMetrics.cachePerformance.hitRate * 100).toFixed(1)}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Memory Usage:</span>
              <span className="metric-value">{(currentMetrics.memoryUsage.current / 1024 / 1024).toFixed(1)}MB</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Used Keys:</span>
              <span className="metric-value">{currentMetrics.keyUsage.usedKeys}/{currentMetrics.keyUsage.totalKeys}</span>
            </div>
          </div>
        </div>
      )}

      {Object.keys(testResults).length > 0 && (
        <div className="test-results">
          <h3>📊 Test Results</h3>
          <div className="results-grid">
            <div className="result-card">
              <h4>Performance</h4>
              <ul>
                <li>Translation Time: {testResults.performance?.translationTime?.toFixed(1)}ms</li>
                <li>Cache Hit Rate: {(testResults.performance?.cacheHitRate * 100).toFixed(1)}%</li>
                <li>Memory Usage: {(testResults.performance?.memoryUsage / 1024 / 1024).toFixed(1)}MB</li>
                <li>Used Keys: {testResults.performance?.keyUsage}</li>
              </ul>
            </div>

            <div className="result-card">
              <h4>Optimization</h4>
              <ul>
                <li>Total Optimizations: {testResults.optimizationStats?.totalOptimizations}</li>
                <li>Successful: {testResults.optimizationStats?.successfulOptimizations}</li>
                <li>Failed: {testResults.optimizationStats?.failedOptimizations}</li>
                <li>Average Duration: {testResults.optimizationStats?.averageDuration?.toFixed(1)}ms</li>
              </ul>
            </div>

            <div className="result-card">
              <h4>Plugins</h4>
              <ul>
                <li>Total Plugins: {testResults.pluginStatus?.totalPlugins}</li>
                <li>Active Hooks: {Object.keys(testResults.pluginStatus?.activeHooks || {}).length}</li>
                <li>Alerts: {testResults.alerts}</li>
                <li>Suggestions: {testResults.suggestions}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 실시간 대시보드 */}
      {showDashboard && (
        <div className="dashboard-container">
          <h3>📊 Real-time Dashboard</h3>
          <I18nDashboard
            monitor={monitor}
            optimizer={optimizer}
            theme="light"
            showAlerts={true}
            showOptimizations={true}
            refreshInterval={testInterval}
            className="test-dashboard"
          />
        </div>
      )}

      {/* 테스트 번역 예제 */}
      <div className="translation-examples">
        <h3>🌐 Translation Examples</h3>
        <I18nProvider config={config}>
          <TranslationTestComponent />
        </I18nProvider>
      </div>

              <style>{`
          .advanced-features-test {
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .test-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0e0e0;
        }

        .test-controls {
          display: flex;
          gap: 10px;
        }

        .test-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .test-btn.start {
          background: #28a745;
          color: white;
        }

        .test-btn.stop {
          background: #dc3545;
          color: white;
        }

        .test-btn.collect {
          background: #007bff;
          color: white;
        }

        .test-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .info-card h3 {
          margin-top: 0;
          color: #333;
        }

        .info-card ul {
          list-style: none;
          padding: 0;
        }

        .info-card li {
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }

        .current-metrics {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .metric-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .metric-label {
          font-weight: 500;
          color: #666;
        }

        .metric-value {
          font-weight: bold;
          color: #007bff;
        }

        .test-results {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 15px;
        }

        .result-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .result-card h4 {
          margin-top: 0;
          color: #333;
        }

        .result-card ul {
          list-style: none;
          padding: 0;
        }

        .result-card li {
          padding: 3px 0;
          font-size: 0.9em;
        }

        .dashboard-container {
          margin-bottom: 30px;
        }

        .test-dashboard {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
        }

        .translation-examples {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

// 번역 테스트 컴포넌트
const TranslationTestComponent: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState('ko');
  const [currentNamespace, setCurrentNamespace] = useState('common');

  const languages = ['ko', 'en', 'ja'];
  const namespaces = ['common', 'auth', 'dashboard', 'settings'];

  const sampleKeys = {
    common: ['welcome', 'greeting', 'hello', 'thank_you', 'loading'],
    auth: ['login', 'logout', 'register', 'password', 'profile'],
    dashboard: ['overview', 'analytics', 'reports', 'statistics', 'charts'],
    settings: ['general', 'appearance', 'language', 'notifications', 'theme']
  };

  return (
    <div className="translation-test">
      <div className="test-controls">
        <div className="control-group">
          <label>Language:</label>
          <select 
            value={currentLanguage} 
            onChange={(e) => setCurrentLanguage(e.target.value)}
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang === 'ko' ? '한국어' : lang === 'en' ? 'English' : '日本語'}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Namespace:</label>
          <select 
            value={currentNamespace} 
            onChange={(e) => setCurrentNamespace(e.target.value)}
          >
            {namespaces.map(ns => (
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="translation-examples">
        <h4>Translation Examples ({currentLanguage}/{currentNamespace})</h4>
        <div className="examples-grid">
          {sampleKeys[currentNamespace as keyof typeof sampleKeys]?.map(key => (
            <div key={key} className="example-item">
              <span className="key">{key}:</span>
              <span className="translation">
                {(allTranslations[currentLanguage as keyof typeof allTranslations] as any)?.[currentNamespace]?.[key] || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>

              <style>{`
          .translation-test {
          padding: 20px;
        }

        .test-controls {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .control-group label {
          font-weight: 500;
          color: #666;
        }

        .control-group select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .translation-examples h4 {
          margin-bottom: 15px;
          color: #333;
        }

        .examples-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .example-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }

        .key {
          font-weight: 500;
          color: #666;
        }

        .translation {
          font-weight: bold;
          color: #007bff;
        }
      `}</style>
    </div>
  );
}; 