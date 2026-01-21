# HUA Labs Ecosystem Plan 2026

## Executive Summary

HUA Labs는 React 기반 UI 프레임워크를 넘어 **SDUI 생태계**를 구축한다.
개발자부터 기획자까지 모든 팀원이 UI를 만들 수 있는 플랫폼.

---

## Ecosystem Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         HUA Labs Ecosystem                                  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        CONSUMER LAYER                                 │  │
│  │                                                                       │  │
│  │   [Hue Editor]          [SDUI Renderer]         [i18n Builder]       │  │
│  │   로우코드 빌더           JSON → React           다국어 캔버스         │  │
│  │   Phase 1-3 완료         Production Ready        Coming Soon          │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                       │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        FRAMEWORK LAYER                                │  │
│  │                                                                       │  │
│  │   [@hua-labs/hua-ux]                                                 │  │
│  │   통합 프레임워크 (무료)                                               │  │
│  │   - 모든 컴포넌트/훅 번들                                              │  │
│  │   - SDUI, i18n, 테마 통합                                             │  │
│  │   - dist 배포 (소스 비공개)                                            │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                       │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        PACKAGE LAYER (유료)                           │  │
│  │                                                                       │  │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │  │
│  │   │ hua-ui      │  │ motion-core │  │ pro         │  │ i18n-core  │  │  │
│  │   │ 99 컴포넌트  │  │ 30+ 훅      │  │ 18 컴포넌트  │  │ 다국어     │  │  │
│  │   │ Core UI     │  │ 애니메이션   │  │ 7 Pro 훅    │  │ 엔진       │  │  │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Business Model

### Tier 1: Community (무료)
| 제공 | 설명 |
|-----|------|
| hua-ux 프레임워크 | dist 번들, 모든 기능 사용 가능 |
| 문서 사이트 | 컴포넌트/훅 API 문서 |
| 커뮤니티 지원 | GitHub Issues, Discussions |

**목표**: 개발자 유입, 생태계 성장

### Tier 2: Pro (유료 - 개별 패키지)
| 제공 | 설명 |
|-----|------|
| 소스 코드 접근 | 커스터마이징, 포크 가능 |
| 개별 패키지 설치 | 트리쉐이킹, 번들 최적화 |
| Pro 컴포넌트/훅 | 고급 기능 |
| 이메일 지원 | 48시간 응답 |

**목표**: 중소 프로젝트, 스타트업

### Tier 3: Enterprise (유료 - 라이선스)
| 제공 | 설명 |
|-----|------|
| Hue 에디터 | 로우코드 UI 빌더 |
| i18n Builder | 다국어 캔버스 에디터 |
| SDUI 풀스택 | 백엔드 연동 가이드 |
| 온보딩 지원 | 1:1 세션 |
| SLA | 99.9% 가용성 보장 |
| 우선 지원 | 24시간 응답 |

**목표**: 기업, 대규모 프로젝트

---

## Product Roadmap

### 2026 Q1 (현재)

#### Packages
- [x] motion-core v2 - Core 훅 30개
- [x] hua-ui v2 - 컴포넌트 99개
- [ ] **pro 분리 작업** - 18 컴포넌트 + 7 훅
- [ ] 패키지 문서화 완료

#### Hue Editor
- [x] Phase 1: UI Builder - 드래그앤드롭
- [x] Phase 2: Logic Engine - 조건부 렌더링
- [x] Phase 3: Action System - 이벤트 처리
- [ ] Phase 4: Data Loading - API 연동

#### Docs
- [x] 컴포넌트 문서
- [ ] 훅 문서 (진행중)
- [ ] SDUI 가이드

### 2026 Q2

#### i18n Canvas Builder (신규)
- [ ] 비주얼 번역 에디터
- [ ] 키 자동 추출
- [ ] AI 번역 제안
- [ ] JSON/YAML 내보내기
- [ ] 컨텍스트 프리뷰 (언어별 UI 확인)

#### Hue Editor
- [ ] Phase 5: i18n Builder 통합
- [ ] 템플릿 마켓플레이스
- [ ] 협업 기능 (멀티 커서)

#### Packages
- [ ] motion-core v2.1 - 성능 개선
- [ ] pro v1.0 - 정식 출시

### 2026 Q3-Q4

#### Enterprise Features
- [ ] 팀 워크스페이스
- [ ] 버전 히스토리
- [ ] 권한 관리
- [ ] 디자인 토큰 동기화 (Figma)
- [ ] CI/CD 통합

---

## Package Architecture

### Core Packages (개별 유료)

```
@hua-labs/hua-ui
├── components/
│   ├── core/        # Button, Input, Card...
│   ├── layout/      # Grid, Stack, Container...
│   ├── form/        # Form, Checkbox, Select...
│   ├── navigation/  # Menu, Breadcrumb, Tabs...
│   ├── feedback/    # Toast, Modal, Skeleton...
│   └── utility/     # ThemeToggle, ScrollArea...
├── sdui/            # SDUIRenderer, Registry
└── index.ts         # 전체 export

@hua-labs/motion-core
├── hooks/
│   ├── useFadeIn, useSlide, useScaleIn...
│   ├── useScrollReveal, useScrollProgress...
│   ├── useHoverMotion, useGesture...
│   └── useInView, useMouse, useWindowSize...
├── types/
└── index.ts

@hua-labs/i18n-core
├── createI18n()
├── useTranslation()
├── LanguageProvider
└── 플러그인 시스템
```

### Pro Package (개별 유료)

```
@hua-labs/pro
├── motion/          # Pro 훅 (7개)
│   ├── useOrchestration
│   ├── useScrollDirection
│   ├── useKeyboardToggle
│   ├── usePerformanceMonitor
│   ├── useAutoPlay
│   ├── useAutoMotion
│   └── useLayoutMotion
├── ui/              # Pro 컴포넌트 (18개)
│   ├── charts/      # TrendChart, BarChart, MiniBarChart
│   ├── motion/      # TiltCard, SpotlightCard, GlowCard...
│   ├── dashboard/   # KanbanBoard, Timeline, DashboardGrid...
│   └── form/        # ColorPicker
└── index.ts
```

### Framework (무료 번들)

```
@hua-labs/hua-ux
├── dist/            # 프리빌드 번들
│   ├── hua-ui (전체)
│   ├── motion-core (전체)
│   ├── pro (전체)
│   └── i18n-core (전체)
├── index.ts         # 통합 re-export
└── README.md
```

---

## SDUI Integration

### Component Registry

```typescript
// packages/hua-ui/src/sdui/registry.tsx
export const defaultRegistry = {
  // Core (62개)
  Button, Card, Input, Modal, ...

  // Pro (18개) - 조건부 로드
  TiltCard, KanbanBoard, TrendChart, ...
}
```

### Hue → SDUI Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Hue Editor │ ──► │ JSON Schema │ ──► │ SDUI Render │
│  (빌더)      │     │ (저장/전송)  │     │ (런타임)     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  드래그앤드롭         DB/API 저장        React 렌더링
  속성 편집            버전 관리          조건부 표시
  조건 설정            A/B 테스트         액션 실행
```

### Schema Example

```json
{
  "type": "Card",
  "props": { "variant": "elevated" },
  "when": { "path": "user.isPro", "operator": "eq", "value": true },
  "children": [
    {
      "type": "TrendChart",
      "props": { "data": "{{analytics.weekly}}" }
    }
  ],
  "on": {
    "click": { "type": "navigate", "payload": { "to": "/dashboard" } }
  }
}
```

---

## i18n Canvas Builder (신규 기획)

### 개요

비주얼 환경에서 다국어 번역을 관리하는 도구.
Hue 에디터와 통합되어 UI와 번역을 한 곳에서.

### 핵심 기능

#### 1. 키 추출기
```
UI 컴포넌트 → 텍스트 감지 → i18n 키 자동 생성
```

#### 2. 번역 캔버스
```
┌─────────────────────────────────────────────────────┐
│  i18n Canvas                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ 한국어   │  │ English │  │ 日本語   │  [+ 언어]  │
│  └─────────┘  └─────────┘  └─────────┘            │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ hero.title                                   │   │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │ │환영합니다│ │ Welcome │ │ようこそ  │        │   │
│  │ └─────────┘ └─────────┘ └─────────┘        │   │
│  │ [AI 제안] [컨텍스트 보기] [히스토리]          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ hero.subtitle                                │   │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │ │최고의... │ │The best.│ │最高の... │        │   │
│  │ └─────────┘ └─────────┘ └─────────┘        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 3. 컨텍스트 프리뷰
```
번역 키 선택 → 실제 UI에서 어디에 쓰이는지 하이라이트
```

#### 4. AI 번역 제안
```
소스 언어 입력 → AI가 타겟 언어 초안 생성 → 수동 검토
```

#### 5. 내보내기
```
JSON / YAML / TypeScript 타입 생성
```

### 기술 스택

| 분류 | 기술 |
|-----|------|
| 프레임워크 | Next.js 16 |
| 상태 | Zustand |
| 에디터 | CodeMirror 6 (JSON 편집) |
| AI | Claude API (번역 제안) |
| 저장소 | localStorage + 클라우드 동기화 |

### Hue 통합

```
┌─────────────────────────────────────────────────┐
│                 Hue Editor                       │
├─────────────────────────────────────────────────┤
│  [UI 빌더]  [로직 엔진]  [i18n 빌더]  [미리보기] │
│                              ↑                   │
│                         새 탭 추가               │
└─────────────────────────────────────────────────┘
```

---

## Pro Component Final List (18개)

### 확정 Pro 유지

| 카테고리 | 컴포넌트 | 이유 |
|---------|---------|------|
| **Charts** | TrendChart | 차트 라이브러리 |
| | BarChart | 차트 라이브러리 |
| | MiniBarChart | 차트 라이브러리 |
| **Motion** | TiltCard | 3D 변환 복잡 |
| | SpotlightCard | 마우스 추적 복잡 |
| | GlowCard | 마우스 추적 + 그라디언트 |
| | TextReveal | 스크롤 연동 복잡 |
| | PageTransition | 라우터 연동 |
| | Carousel | 터치 제스처 + 자동재생 |
| **Dashboard** | KanbanBoard | 드래그앤드롭 복잡 |
| | Timeline | 복잡한 레이아웃 |
| | DashboardGrid | 그리드 시스템 |
| | DashboardSidebar | 상태 관리 복잡 |
| | DashboardToolbar | 액션 통합 |
| | ActivityFeed | 실시간 업데이트 |
| **Form** | ColorPicker | 테일윈드 프리셋 통합 |
| **Layout** | StatsPanel | 데이터 시각화 |
| | MembershipBadge | 애니메이션 효과 |

### Core로 이동 (13개)

| 컴포넌트 | 이유 |
|---------|------|
| StatCard | Card 변형 |
| MetricCard | Card 변형 |
| ProgressCard | Card + Progress 조합 |
| ProfileCard | Card 변형 |
| SummaryCard | Card 변형 |
| NotificationCard | Card 변형 |
| QuickActionCard | Card 변형 |
| AnimatedGradient | CSS로 충분 |
| VideoBackground | video 태그 래퍼 |
| HeroSection | 섹션 레이아웃 |
| ActionToolbar | 버튼 그룹 |
| Action | Button 확장 |
| Panel | Accordion 변형 |

### 도메인 분리 (6개 → 앱 내부 유지)

| 컴포넌트 | 도메인 |
|---------|-------|
| Emotion | my-app 전용 |
| TransactionsTable | fintech |
| TransactionDetailDrawer | fintech |
| SettlementTimeline | fintech |
| RoutingBreakdownCard | fintech |
| MerchantList | fintech |

---

## Action Items

### 이번 주
- [ ] Pro 컴포넌트 분리 작업
- [ ] Core로 이동할 컴포넌트 마이그레이션
- [ ] 레지스트리 업데이트
- [ ] 문서 뱃지 정리

### 이번 달
- [ ] pro 패키지 v1.0 릴리스
- [ ] Hue Phase 4 (Data Loading)
- [ ] 훅 문서화 완료

### 다음 분기
- [ ] i18n Canvas Builder 개발 시작
- [ ] Enterprise 기능 기획

---

## Success Metrics

| 지표 | 목표 (2026 Q2) |
|-----|---------------|
| npm 다운로드 (월) | 10,000+ |
| GitHub Stars | 500+ |
| Pro 구독자 | 50+ |
| Enterprise 고객 | 3+ |

---

## Appendix

### Related Documents
- [Pro Component Analysis](./devlogs/DEVLOG_2026-01-20_PRO_COMPONENT_ANALYSIS.md)
- [SDUI Overview](./guides/SDUI_OVERVIEW.md)
- [Hue Editor README](../apps/hue/README.md)
- [Framework Overview](./HUA_FRAMEWORK_OVERVIEW.md)

### Package Links
- [@hua-labs/hua-ux](https://www.npmjs.com/package/@hua-labs/hua-ux)
- [@hua-labs/hua-ui](https://www.npmjs.com/package/@hua-labs/hua-ui)
- [@hua-labs/motion-core](https://www.npmjs.com/package/@hua-labs/motion-core)
- [@hua-labs/pro](https://www.npmjs.com/package/@hua-labs/pro)

---

*Last Updated: 2026-01-20*
*Author: HUA Labs Team*
