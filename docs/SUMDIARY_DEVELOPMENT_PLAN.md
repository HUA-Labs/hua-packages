# 숨다이어리 MVP 개발 플랜

## 📋 개요

숨다이어리 MVP의 체계적인 개발 계획서입니다. 프론트엔드부터 차근차근 구현하여 사용자 경험을 우선시합니다.

## 🎯 개발 원칙

- **프론트엔드 우선**: 사용자 경험을 먼저 구현
- **API 후순위**: 프론트엔드 완성 후 백엔드 API 구현
- **점진적 개발**: 단계별로 완성도 높은 기능 구현
- **반응형 + 앱 전환**: 모바일 퍼스트, PWA 준비

## 📅 개발 일정 (총 4주)

### **Week 1: 기본 구조 및 UI**
- [ ] 프로젝트 초기 설정
- [ ] 디자인 시스템 구축
- [ ] 기본 레이아웃 구현
- [ ] 일기 작성 화면 (UI만)

### **Week 2: 핵심 기능 UI**
- [ ] 분석 결과 화면 (UI만)
- [ ] 게스트 체험 로직 (프론트엔드)
- [ ] 로그인 유도 UI
- [ ] 일기 리스트 화면 (UI만)

### **Week 3: 인증 및 상태 관리**
- [ ] 인증 시스템 (NextAuth)
- [ ] 상태 관리 (Context + Reducer)
- [ ] 로컬스토리지 기반 임시 저장
- [ ] 게스트 세션 관리

### **Week 4: API 연동 및 완성**
- [ ] Prisma 스키마 설정
- [ ] API 엔드포인트 구현
- [ ] HUA API 연동
- [ ] 최종 통합 및 테스트

## 🗂️ 폴더 구조

```
apps/my-app/
├── app/
│   ├── page.tsx                    // 홈페이지
│   ├── layout.tsx                  // 루트 레이아웃
│   ├── auth/
│   │   ├── login/page.tsx         // 로그인
│   │   └── register/page.tsx      // 회원가입
│   ├── diary/
│   │   ├── page.tsx               // 일기 리스트
│   │   ├── write/page.tsx         // 일기 작성
│   │   └── [id]/
│   │       ├── page.tsx           // 일기 상세
│   │       └── analysis/page.tsx  // 분석 결과
│   └── api/                       // API 라우트 (Week 4)
├── components/
│   ├── auth/                      // 인증 관련
│   ├── diary/                     // 일기 관련
│   ├── guest/                     // 게스트 관련
│   ├── ui/                        // 공통 UI
│   └── layout/                    // 레이아웃
├── lib/
│   ├── auth.ts                    // NextAuth 설정
│   ├── encryption.ts              // 암호화
│   ├── hua-api.ts                 // HUA API 연동
│   ├── guest-session.ts           // 게스트 세션
│   └── utils.ts                   // 공통 유틸리티
├── hooks/                         // 커스텀 훅
├── types/                         // TypeScript 타입
└── styles/                        // 글로벌 스타일
```

## 🎨 디자인 시스템

### **색상 팔레트**
```css
:root {
  /* Primary */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  /* Secondary */
  --secondary-50: #fdf4ff;
  --secondary-500: #a855f7;
  --secondary-600: #9333ea;
  
  /* Neutral */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #111827;
}
```

### **타이포그래피**
```css
/* Headings */
.text-h1 { @apply text-3xl font-bold text-gray-900; }
.text-h2 { @apply text-2xl font-semibold text-gray-800; }
.text-h3 { @apply text-xl font-medium text-gray-700; }

/* Body */
.text-body { @apply text-base text-gray-600 leading-relaxed; }
.text-small { @apply text-sm text-gray-500; }
```

### **컴포넌트 스타일**
```css
/* Buttons */
.btn-primary {
  @apply bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 
         transition-all duration-200 font-medium min-h-[44px] flex items-center justify-center;
}

.btn-secondary {
  @apply bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-xl 
         hover:bg-blue-50 transition-all duration-200 font-medium min-h-[44px];
}

/* Cards */
.card {
  @apply bg-white rounded-2xl shadow-lg overflow-hidden;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-100;
}

.card-body {
  @apply p-6;
}
```

## 🔧 기술 스택

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom
- **State Management**: React Context + useReducer
- **Authentication**: NextAuth.js
- **Icons**: Lucide React

### **Backend (Week 4)**
- **Database**: PostgreSQL + Prisma
- **API**: Next.js API Routes
- **Encryption**: Node.js crypto
- **Rate Limiting**: Redis (선택)

### **External APIs**
- **HUA API**: 감정 분석
- **Email**: Resend (비밀번호 재설정)

## 📱 반응형 디자인

### **Breakpoints**
```css
/* Mobile First */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

### **레이아웃 패턴**
```typescript
// 플렉스 기반 레이아웃
const FlexLayout = ({ children }) => (
  <div className="flex flex-col sm:flex-row gap-4">
    {children}
  </div>
);

// 그리드 레이아웃
const GridLayout = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {children}
  </div>
);
```

## 🎯 Week 1 상세 계획

### **Day 1-2: 프로젝트 설정**
- [ ] Next.js 15 프로젝트 초기화
- [ ] Tailwind CSS 설정
- [ ] 폴더 구조 생성
- [ ] 기본 레이아웃 컴포넌트

### **Day 3-4: 디자인 시스템**
- [ ] 색상 팔레트 정의
- [ ] 타이포그래피 시스템
- [ ] 공통 UI 컴포넌트
- [ ] 아이콘 시스템

### **Day 5-7: 일기 작성 화면**
- [ ] 일기 에디터 컴포넌트
- [ ] 반응형 레이아웃
- [ ] 터치 친화적 UI
- [ ] 기본 유효성 검사

## 🎯 Week 2 상세 계획

### **Day 1-2: 분석 결과 화면**
- [ ] 분석 결과 카드 컴포넌트
- [ ] 원문/분석 결과 분할 레이아웃
- [ ] 반응형 그리드
- [ ] 애니메이션 효과

### **Day 3-4: 게스트 체험 로직**
- [ ] 게스트 세션 관리
- [ ] 1회 체험 제한 로직
- [ ] 로그인 유도 UI
- [ ] 로컬스토리지 활용

### **Day 5-7: 일기 리스트 화면**
- [ ] 일기 카드 컴포넌트
- [ ] 리스트/그리드 뷰
- [ ] 날짜별 그룹핑
- [ ] 검색 및 필터링

## 🎯 Week 3 상세 계획

### **Day 1-2: 인증 시스템**
- [ ] NextAuth.js 설정
- [ ] 로그인/회원가입 폼
- [ ] 세션 관리
- [ ] 보호된 라우트

### **Day 3-4: 상태 관리**
- [ ] Context API 설정
- [ ] useReducer 패턴
- [ ] 전역 상태 관리
- [ ] 로컬 상태 동기화

### **Day 5-7: 통합 및 최적화**
- [ ] 컴포넌트 통합
- [ ] 성능 최적화
- [ ] 접근성 개선
- [ ] PWA 설정

## 🎯 Week 4 상세 계획

### **Day 1-2: 백엔드 설정**
- [ ] Prisma 스키마 설정
- [ ] 데이터베이스 마이그레이션
- [ ] API 라우트 구조
- [ ] 기본 CRUD API

### **Day 3-4: API 연동**
- [ ] HUA API 연동
- [ ] 암호화/복호화
- [ ] Rate limiting
- [ ] 에러 처리

### **Day 5-7: 최종 통합**
- [ ] 프론트엔드-백엔드 연동
- [ ] 테스트 및 디버깅
- [ ] 성능 최적화
- [ ] 배포 준비

## 🧪 테스트 전략

### **Unit Tests**
- 컴포넌트 렌더링 테스트
- 훅 로직 테스트
- 유틸리티 함수 테스트

### **Integration Tests**
- 페이지 간 네비게이션
- 폼 제출 플로우
- 인증 플로우

### **E2E Tests**
- 전체 사용자 시나리오
- 게스트 체험 플로우
- 로그인 사용자 플로우

## 📊 성공 지표

### **기술적 지표**
- [ ] 모든 페이지 반응형 지원
- [ ] 모바일에서 3초 이내 로딩
- [ ] 접근성 점수 90점 이상
- [ ] PWA 점수 90점 이상

### **사용자 경험 지표**
- [ ] 게스트 체험 완료율 80% 이상
- [ ] 로그인 전환율 20% 이상
- [ ] 일기 작성 완료율 90% 이상
- [ ] 사용자 만족도 4.5/5.0 이상

## 🚀 배포 전략

### **개발 환경**
- Vercel (프론트엔드)
- Supabase (데이터베이스)
- GitHub Actions (CI/CD)

### **프로덕션 환경**
- Vercel (호스팅)
- PostgreSQL (데이터베이스)
- Redis (캐싱, 선택)
- Cloudflare (CDN)

## 📝 변경 이력

| 버전 | 날짜 | 변경사항 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-01-30 | 초기 개발 플랜 작성 | 리듬이 |

---

*이 문서는 숨다이어리 MVP 개발의 전체적인 로드맵을 제시합니다. 개발 과정에서 지속적으로 업데이트됩니다.*
