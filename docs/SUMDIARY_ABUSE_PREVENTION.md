# 숨다이어리 어뷰즈 방지 시스템

## 📋 개요

숨다이어리의 어뷰즈 방지 시스템은 API 비용을 보호하고, 서비스 안정성을 유지하며, 정당한 사용자만이 서비스를 이용할 수 있도록 보장합니다.

## 🎯 방지 대상

### 1. API 어뷰즈
- **과도한 API 호출**: 정상 사용 범위를 초과한 요청
- **자동화 도구 사용**: 봇, 크롤러, 스크래퍼 등
- **동일 내용 반복**: 같은 일기를 반복적으로 분석 요청

### 2. 계정 어뷰즈
- **다중 계정 생성**: 동일인 다수 계정 생성
- **가짜 정보 등록**: 허위 정보로 계정 생성
- **계정 공유**: 계정을 타인과 공유하여 사용

### 3. 시스템 어뷰즈
- **보안 취약점 악용**: 시스템 취약점을 이용한 공격
- **데이터 무단 수집**: API를 통한 대량 데이터 수집
- **서비스 장애 유발**: 의도적인 서비스 중단 시도

## 🔍 감지 방법

### 1. IP 기반 감지

#### 레이트 리미팅
```typescript
interface RateLimitConfig {
  window: string;        // 시간 윈도우 (예: '1h', '1d')
  maxRequests: number;   // 최대 요청 수
  blockDuration: string; // 차단 기간
}

const IP_RATE_LIMITS = {
  guest: {
    window: '1h',
    maxRequests: 5,
    blockDuration: '24h'
  },
  user: {
    window: '1h', 
    maxRequests: 100,
    blockDuration: '1h'
  }
};
```

#### IP 패턴 분석
```typescript
const detectSuspiciousIP = (ip: string) => {
  // VPN/프록시 IP 감지
  const vpnPatterns = [
    /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./,
    /^127\./, /^::1$/, /^fc00:/, /^fe80:/
  ];
  
  // 데이터센터 IP 감지
  const datacenterPatterns = [
    /amazonaws\.com/, /googlecloud\.com/, /azure\.com/,
    /digitalocean\.com/, /linode\.com/, /vultr\.com/
  ];
  
  return {
    isVPN: vpnPatterns.some(pattern => pattern.test(ip)),
    isDatacenter: datacenterPatterns.some(pattern => pattern.test(ip)),
    riskScore: calculateRiskScore(ip)
  };
};
```

### 2. User-Agent 기반 감지

#### 의심스러운 패턴
```typescript
const SUSPICIOUS_USER_AGENTS = [
  // 자동화 도구
  'python', 'curl', 'wget', 'postman', 'insomnia',
  'automated', 'bot', 'crawler', 'scraper', 'spider',
  
  // 개발 도구
  'apache-httpclient', 'okhttp', 'requests',
  'urllib', 'axios', 'fetch',
  
  // 테스트 도구
  'selenium', 'puppeteer', 'playwright', 'phantomjs',
  'headless', 'chrome-headless', 'firefox-headless'
];

const detectSuspiciousUA = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  
  return {
    isSuspicious: SUSPICIOUS_USER_AGENTS.some(pattern => 
      ua.includes(pattern.toLowerCase())
    ),
    confidence: calculateConfidence(ua),
    detectedPatterns: SUSPICIOUS_USER_AGENTS.filter(pattern =>
      ua.includes(pattern.toLowerCase())
    )
  };
};
```

### 3. 행동 패턴 분석

#### 요청 빈도 분석
```typescript
const analyzeRequestFrequency = (requests: RequestLog[]) => {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;
  
  // 1분 내 요청 수
  const recentRequests = requests.filter(r => 
    now - r.timestamp < oneMinute
  ).length;
  
  // 1시간 내 요청 수
  const hourlyRequests = requests.filter(r => 
    now - r.timestamp < oneHour
  ).length;
  
  return {
    rapidRequests: recentRequests > 10,      // 1분 내 10회 이상
    highFrequency: hourlyRequests > 200,     // 1시간 내 200회 이상
    burstPattern: detectBurstPattern(requests)
  };
};
```

#### 내용 패턴 분석
```typescript
const analyzeContentPatterns = (diaries: Diary[]) => {
  // 동일 내용 반복
  const identicalContent = diaries.filter((diary, index) => {
    return diaries.slice(0, index).some(prev => 
      prev.content === diary.content
    );
  }).length;
  
  // 패턴 기반 생성 (AI 생성 의심)
  const aiGeneratedPatterns = [
    /^오늘은.*입니다$/,
    /^날씨가.*좋습니다$/,
    /^오늘.*했습니다$/
  ];
  
  const aiGeneratedCount = diaries.filter(diary => 
    aiGeneratedPatterns.some(pattern => pattern.test(diary.content))
  ).length;
  
  return {
    identicalContentRatio: identicalContent / diaries.length,
    aiGeneratedRatio: aiGeneratedCount / diaries.length,
    isSuspicious: identicalContent > 3 || aiGeneratedCount > 5
  };
};
```

## 🛡️ 차단 및 대응

### 1. 자동 차단 시스템

#### 즉시 차단 조건
```typescript
const IMMEDIATE_BLOCK_CONDITIONS = {
  // 1초 내 5회 이상 요청
  rapidFire: (requests) => requests.length > 5,
  
  // 의심스러운 User-Agent
  suspiciousUA: (ua) => detectSuspiciousUA(ua).isSuspicious,
  
  // 동일 내용 10회 이상 반복
  identicalContent: (diaries) => 
    analyzeContentPatterns(diaries).identicalContentRatio > 0.8,
  
  // VPN/프록시 사용
  vpnUsage: (ip) => detectSuspiciousIP(ip).isVPN
};
```

#### 점진적 제한
```typescript
const PROGRESSIVE_RESTRICTIONS = {
  // 1단계: 경고
  warning: {
    condition: 'rate_limit_approaching',
    action: 'show_warning_message',
    duration: '5m'
  },
  
  // 2단계: 속도 제한
  throttling: {
    condition: 'rate_limit_exceeded',
    action: 'slow_down_requests',
    duration: '1h'
  },
  
  // 3단계: 임시 차단
  temporaryBlock: {
    condition: 'repeated_violations',
    action: 'block_requests',
    duration: '24h'
  },
  
  // 4단계: 영구 차단
  permanentBlock: {
    condition: 'severe_abuse',
    action: 'permanent_ban',
    duration: 'permanent'
  }
};
```

### 2. 수동 검토 시스템

#### 관리자 알림
```typescript
const ADMIN_ALERT_CONDITIONS = {
  // 의심스러운 패턴 감지
  suspiciousPattern: (data) => data.riskScore > 0.8,
  
  // 대량 요청 감지
  massRequests: (data) => data.hourlyRequests > 1000,
  
  // 새로운 공격 패턴
  newAttackPattern: (data) => data.isNewPattern,
  
  // VIP 사용자 이상 행동
  vipAnomaly: (data) => data.isVIP && data.isSuspicious
};
```

#### 수동 검토 프로세스
```typescript
const MANUAL_REVIEW_PROCESS = {
  // 1단계: 자동 수집
  collect: (userId, evidence) => {
    return {
      userId,
      evidence,
      timestamp: Date.now(),
      status: 'pending_review'
    };
  },
  
  // 2단계: 관리자 검토
  review: (caseId, decision) => {
    return {
      caseId,
      decision, // 'approve', 'reject', 'escalate'
      reviewer: getCurrentAdmin(),
      timestamp: Date.now()
    };
  },
  
  // 3단계: 조치 실행
  execute: (caseId, action) => {
    return executeAction(caseId, action);
  }
};
```

## 📊 모니터링 및 분석

### 1. 실시간 모니터링

#### 대시보드 지표
```typescript
const MONITORING_METRICS = {
  // 요청 통계
  requests: {
    total: 'total_requests_per_hour',
    blocked: 'blocked_requests_per_hour',
    suspicious: 'suspicious_requests_per_hour'
  },
  
  // 차단 통계
  blocks: {
    automatic: 'automatic_blocks_per_hour',
    manual: 'manual_blocks_per_hour',
    falsePositives: 'false_positive_rate'
  },
  
  // 사용자 통계
  users: {
    active: 'active_users_per_hour',
    blocked: 'blocked_users_per_hour',
    new: 'new_users_per_hour'
  }
};
```

#### 알림 시스템
```typescript
const ALERT_RULES = {
  // 높은 차단률
  highBlockRate: {
    condition: 'block_rate > 0.1', // 10% 이상
    severity: 'warning',
    action: 'notify_admin'
  },
  
  // 새로운 공격 패턴
  newAttackPattern: {
    condition: 'new_pattern_detected',
    severity: 'critical',
    action: 'immediate_alert'
  },
  
  // 시스템 과부하
  systemOverload: {
    condition: 'cpu_usage > 0.8', // 80% 이상
    severity: 'critical',
    action: 'scale_up'
  }
};
```

### 2. 분석 및 학습

#### 패턴 학습
```typescript
const PATTERN_LEARNING = {
  // 정상 사용 패턴 학습
  learnNormalPatterns: (userData) => {
    return {
      averageRequestsPerHour: calculateAverage(userData.requests),
      typicalContentPatterns: analyzeContent(userData.diaries),
      usageTimePatterns: analyzeTiming(userData.timestamps)
    };
  },
  
  // 이상 행동 패턴 감지
  detectAnomalies: (currentData, normalPatterns) => {
    return {
      isAnomaly: calculateAnomalyScore(currentData, normalPatterns) > 0.7,
      anomalyType: classifyAnomaly(currentData, normalPatterns),
      confidence: calculateConfidence(currentData, normalPatterns)
    };
  }
};
```

## 🔧 구현 가이드

### 1. 클라이언트 사이드

#### 요청 제한
```typescript
const useRequestLimiter = () => {
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequest, setLastRequest] = useState(0);
  
  const canMakeRequest = () => {
    const now = Date.now();
    const timeDiff = now - lastRequest;
    
    // 최소 요청 간격 (1초)
    if (timeDiff < 1000) return false;
    
    // 시간당 요청 수 제한
    if (requestCount >= 100) return false;
    
    return true;
  };
  
  const makeRequest = async (requestFn) => {
    if (!canMakeRequest()) {
      throw new Error('Rate limit exceeded');
    }
    
    setRequestCount(prev => prev + 1);
    setLastRequest(Date.now());
    
    return await requestFn();
  };
  
  return { canMakeRequest, makeRequest };
};
```

### 2. 서버 사이드

#### Redis 기반 레이트 리미팅
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const rateLimiter = async (key: string, limit: number, window: number) => {
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  if (current > limit) {
    return { allowed: false, remaining: 0 };
  }
  
  return { allowed: true, remaining: limit - current };
};
```

#### 미들웨어 구현
```typescript
const abusePreventionMiddleware = async (req, res, next) => {
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];
  const userId = req.user?.id;
  
  // IP 기반 레이트 리미팅
  const ipLimit = await rateLimiter(`ip:${ip}`, 100, 3600);
  if (!ipLimit.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // User-Agent 검사
  const uaCheck = detectSuspiciousUA(userAgent);
  if (uaCheck.isSuspicious) {
    return res.status(403).json({ error: 'Suspicious user agent' });
  }
  
  // 사용자별 레이트 리미팅
  if (userId) {
    const userLimit = await rateLimiter(`user:${userId}`, 1000, 3600);
    if (!userLimit.allowed) {
      return res.status(429).json({ error: 'User rate limit exceeded' });
    }
  }
  
  next();
};
```

## 📈 성능 최적화

### 1. 캐싱 전략
- **Redis 캐싱**: 레이트 리미트 카운터 캐싱
- **메모리 캐싱**: 자주 사용되는 패턴 데이터 캐싱
- **CDN 활용**: 정적 리소스 캐싱

### 2. 데이터베이스 최적화
- **인덱싱**: IP, User-Agent, 타임스탬프 인덱스
- **파티셔닝**: 날짜별 로그 테이블 파티셔닝
- **아카이빙**: 오래된 로그 데이터 아카이빙

### 3. 모니터링 최적화
- **샘플링**: 대량 요청 시 샘플링으로 성능 향상
- **비동기 처리**: 로그 저장을 비동기로 처리
- **배치 처리**: 주기적으로 통계 데이터 계산

## 🚨 응급 대응

### 1. DDoS 공격 대응
```typescript
const ddosResponse = {
  // 1단계: 자동 스케일링
  autoScale: () => {
    // 클라우드 자동 스케일링 트리거
    triggerAutoScaling();
  },
  
  // 2단계: CDN 활용
  enableCDN: () => {
    // 정적 리소스를 CDN으로 라우팅
    routeToCDN();
  },
  
  // 3단계: IP 차단
  blockIPs: (ips) => {
    // 의심스러운 IP 대역 차단
    blockIPRange(ips);
  }
};
```

### 2. 데이터 유출 대응
```typescript
const dataBreachResponse = {
  // 1단계: 즉시 차단
  immediateBlock: (userId) => {
    blockUser(userId);
    revokeAllSessions(userId);
  },
  
  // 2단계: 데이터 암호화
  encryptData: (userId) => {
    reEncryptUserData(userId);
  },
  
  // 3단계: 사용자 통보
  notifyUser: (userId) => {
    sendSecurityAlert(userId);
  }
};
```

---

## 📝 변경 이력

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-01-30 | 초기 어뷰즈 방지 시스템 설계 | 리듬이 |

---

*이 문서는 숨다이어리의 어뷰즈 방지 시스템에 대한 기술적 가이드입니다. 보안상의 이유로 일부 세부 구현은 공개하지 않습니다.*
