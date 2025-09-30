/**
 * 테스트 데이터 - 현실적인 성능 테스트용
 * 100개의 번역 키, 3개 언어, 4개 네임스페이스
 */

import { PerformanceMetrics, PerformanceAlert, OptimizationSuggestion } from './performance-monitor';

// 번역 키 100개 (25개씩 4개 네임스페이스)
export const testTranslationKeys = {
  common: [
    'welcome', 'greeting', 'hello', 'goodbye', 'thank_you', 'please', 'yes', 'no', 'ok', 'cancel',
    'save', 'delete', 'edit', 'add', 'remove', 'search', 'filter', 'sort', 'refresh', 'loading',
    'error', 'success', 'warning', 'info', 'help'
  ],
  auth: [
    'login', 'logout', 'register', 'signup', 'signin', 'password', 'email', 'username', 'forgot_password',
    'reset_password', 'change_password', 'profile', 'settings', 'account', 'security', 'privacy',
    'terms', 'conditions', 'agree', 'disagree', 'confirm', 'verify', 'authenticate', 'authorize', 'permission'
  ],
  dashboard: [
    'overview', 'analytics', 'reports', 'statistics', 'charts', 'graphs', 'data', 'metrics', 'performance',
    'monitoring', 'alerts', 'notifications', 'messages', 'inbox', 'outbox', 'drafts', 'sent', 'archived',
    'favorites', 'bookmarks', 'history', 'recent', 'popular', 'trending', 'featured'
  ],
  settings: [
    'general', 'appearance', 'language', 'region', 'timezone', 'currency', 'units', 'format', 'display',
    'notifications', 'sounds', 'vibration', 'accessibility', 'font_size', 'color_scheme', 'theme',
    'auto_save', 'backup', 'sync', 'export', 'import', 'reset', 'restore', 'update', 'version'
  ]
};

// 한국어 번역 데이터
export const koTranslations = {
  common: {
    welcome: '환영합니다',
    greeting: '안녕하세요',
    hello: '안녕',
    goodbye: '안녕히 가세요',
    thank_you: '감사합니다',
    please: '부탁드립니다',
    yes: '예',
    no: '아니오',
    ok: '확인',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    add: '추가',
    remove: '제거',
    search: '검색',
    filter: '필터',
    sort: '정렬',
    refresh: '새로고침',
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    warning: '경고',
    info: '정보',
    help: '도움말'
  },
  auth: {
    login: '로그인',
    logout: '로그아웃',
    register: '회원가입',
    signup: '가입하기',
    signin: '로그인',
    password: '비밀번호',
    email: '이메일',
    username: '사용자명',
    forgot_password: '비밀번호 찾기',
    reset_password: '비밀번호 재설정',
    change_password: '비밀번호 변경',
    profile: '프로필',
    settings: '설정',
    account: '계정',
    security: '보안',
    privacy: '개인정보',
    terms: '이용약관',
    conditions: '조건',
    agree: '동의',
    disagree: '거부',
    confirm: '확인',
    verify: '인증',
    authenticate: '인증',
    authorize: '권한',
    permission: '권한'
  },
  dashboard: {
    overview: '개요',
    analytics: '분석',
    reports: '보고서',
    statistics: '통계',
    charts: '차트',
    graphs: '그래프',
    data: '데이터',
    metrics: '지표',
    performance: '성능',
    monitoring: '모니터링',
    alerts: '알림',
    notifications: '알림',
    messages: '메시지',
    inbox: '받은 편지함',
    outbox: '보낸 편지함',
    drafts: '임시저장',
    sent: '보낸 메시지',
    archived: '보관됨',
    favorites: '즐겨찾기',
    bookmarks: '북마크',
    history: '기록',
    recent: '최근',
    popular: '인기',
    trending: '트렌딩',
    featured: '추천'
  },
  settings: {
    general: '일반',
    appearance: '외관',
    language: '언어',
    region: '지역',
    timezone: '시간대',
    currency: '통화',
    units: '단위',
    format: '형식',
    display: '표시',
    notifications: '알림',
    sounds: '소리',
    vibration: '진동',
    accessibility: '접근성',
    font_size: '글꼴 크기',
    color_scheme: '색상 구성',
    theme: '테마',
    auto_save: '자동 저장',
    backup: '백업',
    sync: '동기화',
    export: '내보내기',
    import: '가져오기',
    reset: '초기화',
    restore: '복원',
    update: '업데이트',
    version: '버전'
  }
};

// 영어 번역 데이터
export const enTranslations = {
  common: {
    welcome: 'Welcome',
    greeting: 'Hello',
    hello: 'Hi',
    goodbye: 'Goodbye',
    thank_you: 'Thank you',
    please: 'Please',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    help: 'Help'
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    signup: 'Sign up',
    signin: 'Sign in',
    password: 'Password',
    email: 'Email',
    username: 'Username',
    forgot_password: 'Forgot password',
    reset_password: 'Reset password',
    change_password: 'Change password',
    profile: 'Profile',
    settings: 'Settings',
    account: 'Account',
    security: 'Security',
    privacy: 'Privacy',
    terms: 'Terms',
    conditions: 'Conditions',
    agree: 'Agree',
    disagree: 'Disagree',
    confirm: 'Confirm',
    verify: 'Verify',
    authenticate: 'Authenticate',
    authorize: 'Authorize',
    permission: 'Permission'
  },
  dashboard: {
    overview: 'Overview',
    analytics: 'Analytics',
    reports: 'Reports',
    statistics: 'Statistics',
    charts: 'Charts',
    graphs: 'Graphs',
    data: 'Data',
    metrics: 'Metrics',
    performance: 'Performance',
    monitoring: 'Monitoring',
    alerts: 'Alerts',
    notifications: 'Notifications',
    messages: 'Messages',
    inbox: 'Inbox',
    outbox: 'Outbox',
    drafts: 'Drafts',
    sent: 'Sent',
    archived: 'Archived',
    favorites: 'Favorites',
    bookmarks: 'Bookmarks',
    history: 'History',
    recent: 'Recent',
    popular: 'Popular',
    trending: 'Trending',
    featured: 'Featured'
  },
  settings: {
    general: 'General',
    appearance: 'Appearance',
    language: 'Language',
    region: 'Region',
    timezone: 'Timezone',
    currency: 'Currency',
    units: 'Units',
    format: 'Format',
    display: 'Display',
    notifications: 'Notifications',
    sounds: 'Sounds',
    vibration: 'Vibration',
    accessibility: 'Accessibility',
    font_size: 'Font size',
    color_scheme: 'Color scheme',
    theme: 'Theme',
    auto_save: 'Auto save',
    backup: 'Backup',
    sync: 'Sync',
    export: 'Export',
    import: 'Import',
    reset: 'Reset',
    restore: 'Restore',
    update: 'Update',
    version: 'Version'
  }
};

// 일본어 번역 데이터
export const jaTranslations = {
  common: {
    welcome: 'ようこそ',
    greeting: 'こんにちは',
    hello: 'こんにちは',
    goodbye: 'さようなら',
    thank_you: 'ありがとうございます',
    please: 'お願いします',
    yes: 'はい',
    no: 'いいえ',
    ok: 'OK',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    add: '追加',
    remove: '削除',
    search: '検索',
    filter: 'フィルター',
    sort: '並び替え',
    refresh: '更新',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    warning: '警告',
    info: '情報',
    help: 'ヘルプ'
  },
  auth: {
    login: 'ログイン',
    logout: 'ログアウト',
    register: '登録',
    signup: 'サインアップ',
    signin: 'サインイン',
    password: 'パスワード',
    email: 'メール',
    username: 'ユーザー名',
    forgot_password: 'パスワードを忘れた',
    reset_password: 'パスワードリセット',
    change_password: 'パスワード変更',
    profile: 'プロフィール',
    settings: '設定',
    account: 'アカウント',
    security: 'セキュリティ',
    privacy: 'プライバシー',
    terms: '利用規約',
    conditions: '条件',
    agree: '同意',
    disagree: '不同意',
    confirm: '確認',
    verify: '認証',
    authenticate: '認証',
    authorize: '認可',
    permission: '権限'
  },
  dashboard: {
    overview: '概要',
    analytics: '分析',
    reports: 'レポート',
    statistics: '統計',
    charts: 'チャート',
    graphs: 'グラフ',
    data: 'データ',
    metrics: 'メトリクス',
    performance: 'パフォーマンス',
    monitoring: 'モニタリング',
    alerts: 'アラート',
    notifications: '通知',
    messages: 'メッセージ',
    inbox: '受信トレイ',
    outbox: '送信トレイ',
    drafts: '下書き',
    sent: '送信済み',
    archived: 'アーカイブ',
    favorites: 'お気に入り',
    bookmarks: 'ブックマーク',
    history: '履歴',
    recent: '最近',
    popular: '人気',
    trending: 'トレンド',
    featured: 'おすすめ'
  },
  settings: {
    general: '一般',
    appearance: '外観',
    language: '言語',
    region: '地域',
    timezone: 'タイムゾーン',
    currency: '通貨',
    units: '単位',
    format: '形式',
    display: '表示',
    notifications: '通知',
    sounds: 'サウンド',
    vibration: '振動',
    accessibility: 'アクセシビリティ',
    font_size: 'フォントサイズ',
    color_scheme: 'カラースキーム',
    theme: 'テーマ',
    auto_save: '自動保存',
    backup: 'バックアップ',
    sync: '同期',
    export: 'エクスポート',
    import: 'インポート',
    reset: 'リセット',
    restore: '復元',
    update: '更新',
    version: 'バージョン'
  }
};

// 성능 테스트용 더미 메트릭
export const generateTestMetrics = (): PerformanceMetrics => {
  const now = Date.now();
  const baseTime = 10 + Math.random() * 50; // 10-60ms
  
  return {
    translationTime: {
      average: baseTime,
      min: baseTime * 0.5,
      max: baseTime * 2,
      p95: baseTime * 1.5,
      p99: baseTime * 1.8
    },
    cachePerformance: {
      hitRate: 0.6 + Math.random() * 0.3, // 60-90%
      missRate: 0.1 + Math.random() * 0.2, // 10-30%
      evictionRate: Math.random() * 0.1, // 0-10%
      size: 50 + Math.floor(Math.random() * 150), // 50-200
      maxSize: 200
    },
    memoryUsage: {
      current: 20 * 1024 * 1024 + Math.random() * 30 * 1024 * 1024, // 20-50MB
      peak: 30 * 1024 * 1024 + Math.random() * 40 * 1024 * 1024, // 30-70MB
      average: 25 * 1024 * 1024 + Math.random() * 20 * 1024 * 1024, // 25-45MB
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    },
    keyUsage: {
      totalKeys: 100,
      usedKeys: 70 + Math.floor(Math.random() * 25), // 70-95
      unusedKeys: 5 + Math.floor(Math.random() * 20), // 5-25
      duplicateKeys: Math.floor(Math.random() * 5), // 0-5
      missingKeys: Math.floor(Math.random() * 3) // 0-3
    },
    languagePerformance: {
      ko: {
        loadTime: 15 + Math.random() * 25,
        usageCount: 100 + Math.floor(Math.random() * 200),
        errorRate: Math.random() * 0.05
      },
      en: {
        loadTime: 12 + Math.random() * 20,
        usageCount: 80 + Math.floor(Math.random() * 150),
        errorRate: Math.random() * 0.03
      },
      ja: {
        loadTime: 18 + Math.random() * 30,
        usageCount: 50 + Math.floor(Math.random() * 100),
        errorRate: Math.random() * 0.08
      }
    },
    namespacePerformance: {
      common: {
        loadTime: 10 + Math.random() * 15,
        usageCount: 200 + Math.floor(Math.random() * 300),
        size: 25
      },
      auth: {
        loadTime: 8 + Math.random() * 12,
        usageCount: 150 + Math.floor(Math.random() * 200),
        size: 25
      },
      dashboard: {
        loadTime: 12 + Math.random() * 18,
        usageCount: 100 + Math.floor(Math.random() * 150),
        size: 25
      },
      settings: {
        loadTime: 6 + Math.random() * 10,
        usageCount: 80 + Math.floor(Math.random() * 120),
        size: 25
      }
    }
  };
};

// 테스트용 알림 생성
export const generateTestAlerts = (): PerformanceAlert[] => {
  const alerts: PerformanceAlert[] = [];
  const now = Date.now();
  
  // 캐시 히트율 낮음 알림
  if (Math.random() > 0.7) {
    alerts.push({
      id: `alert-${now}-1`,
      type: 'warning',
      severity: 'medium',
      message: 'Cache hit rate is below optimal level',
      metric: 'cachePerformance.hitRate',
      value: 0.65,
      threshold: 0.7,
      timestamp: now - 30000,
      resolved: false
    });
  }
  
  // 번역 시간 높음 알림
  if (Math.random() > 0.8) {
    alerts.push({
      id: `alert-${now}-2`,
      type: 'warning',
      severity: 'high',
      message: 'Translation time is above threshold',
      metric: 'translationTime.average',
      value: 85,
      threshold: 80,
      timestamp: now - 60000,
      resolved: false
    });
  }
  
  // 메모리 사용량 높음 알림
  if (Math.random() > 0.9) {
    alerts.push({
      id: `alert-${now}-3`,
      type: 'error',
      severity: 'high',
      message: 'Memory usage is high',
      metric: 'memoryUsage.current',
      value: 55 * 1024 * 1024,
      threshold: 50 * 1024 * 1024,
      timestamp: now - 90000,
      resolved: false
    });
  }
  
  return alerts;
};

// 테스트용 최적화 제안 생성
export const generateTestSuggestions = (): OptimizationSuggestion[] => {
  return [
    {
      id: 'cache-optimization',
      type: 'cache',
      title: 'Increase Cache Size',
      description: 'Cache hit rate is low. Consider increasing cache size.',
      impact: 'high',
      effort: 'low',
      estimatedImprovement: 20,
      implementation: 'Increase maxSize in cache plugin configuration',
      priority: 1
    },
    {
      id: 'bundle-optimization',
      type: 'bundle',
      title: 'Remove Unused Translation Keys',
      description: 'Many translation keys are unused. Consider removing them.',
      impact: 'medium',
      effort: 'medium',
      estimatedImprovement: 15,
      implementation: 'Use tree-shaking or manual cleanup of unused keys',
      priority: 2
    },
    {
      id: 'loading-optimization',
      type: 'loading',
      title: 'Optimize Translation Loading',
      description: 'Translation loading is slow. Consider lazy loading.',
      impact: 'high',
      effort: 'high',
      estimatedImprovement: 30,
      implementation: 'Implement lazy loading for non-critical translations',
      priority: 1
    }
  ];
};

// 전체 번역 데이터
export const allTranslations = {
  ko: koTranslations,
  en: enTranslations,
  ja: jaTranslations
};

// 번역 키 총 개수 확인
export const getTotalKeyCount = (): number => {
  return Object.values(testTranslationKeys).reduce((total, keys) => total + keys.length, 0);
};

// 테스트 데이터 통계
export const getTestDataStats = () => {
  return {
    totalKeys: getTotalKeyCount(),
    languages: Object.keys(allTranslations).length,
    namespaces: Object.keys(testTranslationKeys).length,
    keysPerNamespace: Object.fromEntries(
      Object.entries(testTranslationKeys).map(([ns, keys]) => [ns, keys.length])
    )
  };
}; 