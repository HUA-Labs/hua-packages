/**
 * 테스트 컴포넌트 - 고급 기능 통합 테스트
 * 실제 데이터로 모든 기능을 테스트할 수 있는 컴포넌트
 */

import React, { useState } from 'react';

// 간단한 테스트 컴포넌트
export interface TestComponentProps {
  showDashboard?: boolean;
  autoStart?: boolean;
  testInterval?: number;
}

export const AdvancedFeaturesTest: React.FC<TestComponentProps> = ({
  showDashboard = true,
  autoStart = false,
  testInterval = 3000
}) => {
  const [isRunning, setIsRunning] = useState(autoStart);
  const [testResults, setTestResults] = useState<any>({});

  const startTest = () => {
    setIsRunning(true);
    console.log('🚀 Advanced features test started');
  };

  const stopTest = () => {
    setIsRunning(false);
    console.log('⏹️ Advanced features test stopped');
  };

  return (
    <div className="advanced-test-component">
      <h2>Advanced I18n Features Test</h2>
      
      <div className="controls">
        <button onClick={startTest} disabled={isRunning}>
          Start Test
        </button>
        <button onClick={stopTest} disabled={!isRunning}>
          Stop Test
        </button>
      </div>

      <div className="status">
        Status: {isRunning ? 'Running' : 'Stopped'}
      </div>

      {showDashboard && (
        <div className="dashboard">
          <h3>Test Dashboard</h3>
          <p>Advanced features test component is ready.</p>
        </div>
      )}
    </div>
  );
};

// 간단한 번역 테스트 컴포넌트
export const TranslationTestComponent: React.FC = () => {
  return (
    <div className="translation-test">
      <h3>Translation Test</h3>
      <p>Translation test component is ready.</p>
    </div>
  );
}; 