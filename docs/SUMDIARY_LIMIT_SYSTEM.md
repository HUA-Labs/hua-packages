# 숨다이어리 제한 시스템 설계서

## 📋 개요

숨다이어리의 사용자 제한 시스템을 설계하여 API 비용을 관리하고, 어뷰즈를 방지하며, 사용자 경험을 최적화합니다.

## 🎯 목표

- **API 비용 관리**: HUA API 호출 제한으로 비용 통제
- **어뷰즈 방지**: IP/User-Agent 기반 악용 차단
- **사용자 경험**: 체험 후 자연스러운 로그인 유도
- **데이터 보호**: 개인정보 암호화 및 익명화

## 🔒 제한 시스템 구조

### 1. 사용자 유형별 제한

#### 게스트 사용자 (비로그인)
```typescript
const GUEST_LIMITS = {
  diaryWrite: 1,        // 세션당 1개 일기 작성
  emotionAnalysis: 1,   // 세션당 1회 감정 분석
  save: false,          // 저장 불가
  viewHistory: false,   // 이전 일기 조회 불가
  apiCalls: 2,          // HUA API 호출 2회 제한
  sessionDuration: '24h' // 세션 유효기간 24시간
};
```

#### 로그인 사용자
```typescript
const USER_LIMITS = {
  diaryWrite: 5,        // 일일 5개 일기 작성
  emotionAnalysis: 10,  // 일일 10회 감정 분석
  save: -1,             // 무제한 저장
  viewHistory: true,    // 이전 일기 조회 가능
  apiCalls: 50,         // 일일 HUA API 호출 50회
  sessionDuration: '30d' // 세션 유효기간 30일
};
```

### 2. 어뷰즈 방지 시스템

#### IP 기반 제한
```typescript
const IP_LIMITS = {
  guest: {
    requests: 5,        // 1시간당 5회 요청
    window: '1h',
    blockDuration: '24h' // 위반 시 24시간 차단
  },
  user: {
    requests: 100,      // 1시간당 100회 요청
    window: '1h',
    blockDuration: '1h'  // 위반 시 1시간 차단
  }
};
```

#### User-Agent 패턴 분석
```typescript
const SUSPICIOUS_PATTERNS = [
  'automated', 'bot', 'crawler', 'scraper',
  'python', 'curl', 'wget', 'postman'
];

const BEHAVIOR_ANALYSIS = {
  rapidRequests: '1초 내 3회 이상 요청 차단',
  identicalContent: '동일 내용 반복 제출 차단',
  suspiciousTiming: '비정상적 시간대 사용 패턴 감지',
  patternMatching: '자동화 도구 패턴 감지'
};
```

## 📊 데이터 수집 및 보호

### 수집하는 데이터

#### 필수 데이터 (서비스 운영)
```typescript
const ESSENTIAL_DATA = {
  ipAddress: '어뷰즈 방지 및 보안',
  userAgent: '어뷰즈 방지 및 디바이스 식별',
  sessionId: '세션 관리 및 상태 추적',
  timestamp: '요청 시간 및 패턴 분석'
};
```

#### 일기 관련 데이터 (암호화)
```typescript
const DIARY_DATA = {
  content: 'AES-256 암호화하여 저장',
  emotionAnalysis: '감정 분석 결과 (익명화)',
  metadata: '작성 시간, 길이 등 (익명화)'
};
```

#### 분석용 데이터 (완전 익명화)
```typescript
const ANALYTICS_DATA = {
  emotionTrends: '감정 트렌드 분석용',
  writingPatterns: '작성 패턴 분석용',
  usageStatistics: '사용 통계 및 개선점 도출',
  serviceMetrics: '서비스 품질 향상용'
};
```

### 데이터 보호 조치

#### 암호화
- **일기 내용**: AES-256 암호화
- **개인 식별 정보**: 해시화 또는 토큰화
- **분석 데이터**: 완전 익명화

#### 접근 제어
- **개발자**: 암호화된 데이터만 접근 가능
- **분석팀**: 익명화된 데이터만 접근 가능
- **관리자**: 감사 로그 기반 제한적 접근

## 🔄 제한 시스템 구현

### 1. 클라이언트 사이드 제한

#### 게스트 사용자 체험
```typescript
// 게스트 체험 제한
const useGuestLimits = () => {
  const [guestUsage, setGuestUsage] = useState({
    diaryWrite: 0,
    emotionAnalysis: 0,
    apiCalls: 0
  });

  const canWriteDiary = guestUsage.diaryWrite < GUEST_LIMITS.diaryWrite;
  const canAnalyzeEmotion = guestUsage.emotionAnalysis < GUEST_LIMITS.emotionAnalysis;
  const canCallAPI = guestUsage.apiCalls < GUEST_LIMITS.apiCalls;

  return {
    guestUsage,
    canWriteDiary,
    canAnalyzeEmotion,
    canCallAPI,
    incrementUsage: (type) => {
      setGuestUsage(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }));
    }
  };
};
```

#### 로그인 유도 UI
```typescript
// 제한 도달 시 로그인 유도
const LoginPrompt = ({ limitType, onLogin, onRegister }) => {
  const messages = {
    diaryWrite: '더 많은 일기를 작성하려면 로그인하세요',
    emotionAnalysis: '감정 분석을 더 받으려면 로그인하세요',
    apiCalls: 'API 호출 한도를 늘리려면 로그인하세요'
  };

  return (
    <div className="login-prompt">
      <p>{messages[limitType]}</p>
      <Button onClick={onLogin}>로그인</Button>
      <Button onClick={onRegister}>회원가입</Button>
    </div>
  );
};
```

### 2. 서버 사이드 제한

#### 레이트 리미팅
```typescript
// IP 기반 레이트 리미팅
const rateLimiter = new Map();

const checkRateLimit = (ip: string, userType: 'guest' | 'user') => {
  const now = Date.now();
  const window = IP_LIMITS[userType].window;
  const limit = IP_LIMITS[userType].requests;
  
  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, []);
  }
  
  const requests = rateLimiter.get(ip);
  const validRequests = requests.filter(time => now - time < window);
  
  if (validRequests.length >= limit) {
    return { allowed: false, reason: 'rate_limit_exceeded' };
  }
  
  validRequests.push(now);
  rateLimiter.set(ip, validRequests);
  
  return { allowed: true };
};
```

#### 어뷰즈 감지
```typescript
// 의심스러운 패턴 감지
const detectAbuse = (req: Request) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip;
  
  // User-Agent 패턴 검사
  const isSuspiciousUA = SUSPICIOUS_PATTERNS.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  );
  
  // 요청 빈도 검사
  const isRapidRequest = checkRapidRequests(ip);
  
  // 동일 내용 반복 검사
  const isIdenticalContent = checkIdenticalContent(req.body);
  
  return {
    isAbuse: isSuspiciousUA || isRapidRequest || isIdenticalContent,
    reasons: {
      suspiciousUA: isSuspiciousUA,
      rapidRequest: isRapidRequest,
      identicalContent: isIdenticalContent
    }
  };
};
```

## 📋 개인정보 처리방침

### 수집하는 정보
- **일기 내용**: AES-256 암호화하여 안전하게 저장
- **감정 분석 데이터**: 익명화하여 AI 모델 개선에 활용
- **사용 패턴**: 완전 익명화하여 서비스 최적화에 활용
- **기술적 정보**: IP 주소, User-Agent 등 보안 및 어뷰즈 방지용

### 활용 목적
- **서비스 제공**: 일기 작성, 감정 분석, 데이터 저장
- **서비스 개선**: 사용자 경험 향상, AI 모델 학습
- **보안**: 어뷰즈 방지, 부정 사용 차단
- **통계 분석**: 익명화된 데이터 기반 서비스 인사이트 도출

### 보안 조치
- **암호화**: 모든 개인정보는 AES-256으로 암호화
- **익명화**: 분석용 데이터는 개인 식별 불가능하도록 처리
- **접근 제어**: 역할 기반 접근 권한 관리
- **정기 감사**: 분기별 보안 감사 및 취약점 점검

### 사용자 권리
- **데이터 조회**: 본인의 데이터 조회 및 다운로드 가능
- **데이터 수정**: 부정확한 정보 수정 요청 가능
- **데이터 삭제**: 계정 삭제 시 모든 데이터 완전 삭제
- **동의 철회**: 데이터 활용 동의 철회 가능

## 🚀 구현 로드맵

### Phase 1: 기본 제한 시스템 (1주)
- [ ] 게스트 사용자 1회 체험 제한
- [ ] 로그인 유도 UI 구현
- [ ] 기본 메타데이터 수집

### Phase 2: 어뷰즈 방지 (2주)
- [ ] IP 기반 레이트 리미팅
- [ ] User-Agent 패턴 분석
- [ ] 의심스러운 행동 감지

### Phase 3: 데이터 보호 (2주)
- [ ] 일기 내용 암호화 저장
- [ ] 분석 데이터 익명화
- [ ] 개인정보 처리방침 구현

### Phase 4: 모니터링 및 최적화 (1주)
- [ ] 사용 패턴 모니터링
- [ ] 제한 정책 최적화
- [ ] 사용자 피드백 반영

## 📊 성공 지표

### 기술적 지표
- **API 비용 절감**: 월 API 호출 비용 30% 이상 절감
- **어뷰즈 차단률**: 의심스러운 요청 95% 이상 차단
- **시스템 안정성**: 99.9% 이상 가용성 유지

### 사용자 경험 지표
- **체험 전환율**: 게스트 사용자 중 20% 이상 로그인 전환
- **사용자 만족도**: 서비스 만족도 4.5/5.0 이상
- **재방문율**: 로그인 사용자 70% 이상 재방문

## 🔧 기술 스택

### 프론트엔드
- **상태 관리**: React Context + useReducer
- **로컬 저장소**: localStorage + sessionStorage
- **암호화**: crypto-js (AES-256)

### 백엔드
- **레이트 리미팅**: Redis + sliding window
- **데이터베이스**: PostgreSQL (암호화된 데이터)
- **모니터링**: Prometheus + Grafana

### 보안
- **암호화**: Node.js crypto 모듈
- **해싱**: bcrypt (비밀번호)
- **토큰**: JWT (세션 관리)

---

## 📝 변경 이력

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-01-30 | 초기 설계서 작성 | 리듬이 |

---

*이 문서는 숨다이어리 제한 시스템의 설계 및 구현 가이드입니다. 구현 과정에서 지속적으로 업데이트됩니다.*
