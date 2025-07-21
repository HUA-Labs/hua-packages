import React, { useEffect, useState } from 'react';

interface MissingKeyOverlayProps {
  enabled?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  style?: React.CSSProperties;
}

interface MissingKey {
  key: string;
  namespace?: string;
  language: string;
  timestamp: number;
  component?: string;
}

/**
 * 개발 모드에서 누락된 번역 키를 화면에 표시하는 오버레이
 * Lingui 스타일의 디버그 모드
 */
export const MissingKeyOverlay: React.FC<MissingKeyOverlayProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'top-right',
  style
}) => {
  const [missingKeys, setMissingKeys] = useState<MissingKey[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // 누락된 키 이벤트 리스너
    const handleMissingKey = (event: CustomEvent<MissingKey>) => {
      setMissingKeys(prev => [...prev, event.detail]);
      setIsVisible(true);
    };

    // 전역 이벤트 리스너 등록
    window.addEventListener('i18n:missing-key', handleMissingKey as EventListener);

    return () => {
      window.removeEventListener('i18n:missing-key', handleMissingKey as EventListener);
    };
  }, [enabled]);

  if (!enabled || !isVisible) return null;

  const positionStyles = {
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '12px',
    maxWidth: '400px',
    maxHeight: '300px',
    overflow: 'auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    border: '2px solid #ff4444',
    ...positionStyles[position],
    ...style
  };

  const keyStyle: React.CSSProperties = {
    marginBottom: '8px',
    padding: '4px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    borderLeft: '3px solid #ff8888'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)'
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const clearButtonStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    marginLeft: '8px'
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleClear = () => {
    setMissingKeys([]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div style={overlayStyle}>
      <div style={headerStyle}>
        <div>
          <strong>🚨 Missing Translation Keys</strong>
          <span style={{ fontSize: '10px', marginLeft: '8px' }}>
            ({missingKeys.length})
          </span>
        </div>
        <div>
          <button style={clearButtonStyle} onClick={handleClear}>
            Clear
          </button>
          <button style={closeButtonStyle} onClick={handleClose}>
            ×
          </button>
        </div>
      </div>
      
      <div>
        {missingKeys.slice(-10).reverse().map((key, index) => (
          <div key={`${key.key}-${key.timestamp}`} style={keyStyle}>
            <div style={{ fontWeight: 'bold', color: '#ffcccc' }}>
              {key.key}
            </div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>
              <span>Lang: {key.language}</span>
              {key.namespace && <span style={{ marginLeft: '8px' }}>NS: {key.namespace}</span>}
              <span style={{ marginLeft: '8px' }}>Time: {formatTime(key.timestamp)}</span>
            </div>
            {key.component && (
              <div style={{ fontSize: '10px', color: '#ffaaaa', marginTop: '2px' }}>
                Component: {key.component}
              </div>
            )}
          </div>
        ))}
        
        {missingKeys.length > 10 && (
          <div style={{ fontSize: '10px', textAlign: 'center', marginTop: '8px' }}>
            ... and {missingKeys.length - 10} more
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 누락된 키를 오버레이에 표시하는 유틸리티 함수
 */
export const reportMissingKey = (key: string, options: {
  namespace?: string;
  language: string;
  component?: string;
}) => {
  if (process.env.NODE_ENV === 'development') {
    const missingKey: MissingKey = {
      key,
      namespace: options.namespace,
      language: options.language,
      timestamp: Date.now(),
      component: options.component
    };

    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('i18n:missing-key', {
      detail: missingKey
    }));

    // 콘솔에도 로그
    console.warn(`Missing translation key: ${key}`, {
      namespace: options.namespace,
      language: options.language,
      component: options.component
    });
  }
};

/**
 * 누락된 키 오버레이를 자동으로 활성화하는 훅
 */
export const useMissingKeyOverlay = (enabled = true) => {
  const [showOverlay, setShowOverlay] = useState(enabled);

  useEffect(() => {
    if (enabled && process.env.NODE_ENV === 'development') {
      setShowOverlay(true);
    }
  }, [enabled]);

  return {
    showOverlay,
    setShowOverlay,
    reportMissingKey
  };
}; 