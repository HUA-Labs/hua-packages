# HUA Platform 아키텍처 개요

## 🏗️ **현재 구조**

### 📁 **모노레포 구조**
```
hua-platform/
├── packages/                    # 공유 패키지들
│   ├── hua-i18n-beginner/      # 🌟 공개 예정 (npm)
│   ├── hua-i18n-core/          # 🌟 공개 예정 (npm)
│   ├── hua-i18n-sdk/           # 🌟 공개 예정 (npm)
│   ├── hua-i18n-advanced/      # 🌟 공개 예정 (npm)
│   ├── hua-animation/          # 🌐 공개 중 (npm)
│   ├── hua-ui/                 # 🌟 공개 예정 (npm)
│   ├── hua-config/             # 🔒 내부 사용용
│   ├── hua-hooks/              # 🔒 내부 사용용
│   ├── hua-utils/              # 🔒 내부 사용용
│   └── hua-types/              # 🔒 내부 사용용
├── apps/                       # 애플리케이션들
│   ├── hua-animation-site/     # 🌐 공개 예정 (Vercel)
│   ├── hua-ui-site/           # 🌐 공개 예정 (Vercel)
│   ├── hua-labs-official/      # 🌐 공개 예정 (Vercel)
│   ├── my-api/               # 🌐 공개 중 (Vercel)
│   ├── my-chat/              # 🌐 베타 공개 (Vercel)
│   ├── my-app/             # 🔒 개발중 (Vercel)
│   ├── i18n-test/             # 🧪 테스트용 (배포 안함)
│   └── hua-demo/              # 🧪 데모용 (깃헙 공개만 고려)
└── docs/                      # 문서
    └── ARCHITECTURE_OVERVIEW.md
```

## 🎯 **패키지별 상세**

### 📦 **i18n 패키지군**
| 패키지 | 상태 | 목적 | 대상 | 배포 |
|--------|------|------|------|------|
| `hua-i18n-beginner` | ✅ 완성 | 초보자용 SDK | React 초보자 | npm |
| `hua-i18n-core` | 🌟 공개 예정 | 핵심 기능 | 개발자 | npm |
| `hua-i18n-sdk` | 🌟 공개 예정 | 고급 SDK | 고급 개발자 | npm |
| `hua-i18n-advanced` | 🌟 공개 예정 | 엔터프라이즈 | 전문가 | npm |

### 🎨 **UI/Animation 패키지군**
| 패키지 | 상태 | 목적 | 대상 | 배포 |
|--------|------|------|------|------|
| `hua-animation` | 🌐 공개 중 | 애니메이션 라이브러리 | 개발자 | npm |
| `hua-ui` | 🌟 공개 예정 | UI 컴포넌트 | 개발자 | npm |
| `hua-config` | 🔒 내부 사용용 | 설정 관리 | 내부 사용 | - |
| `hua-hooks` | 🔒 내부 사용용 | 커스텀 훅 | 내부 사용 | - |
| `hua-utils` | 🔒 내부 사용용 | 유틸리티 | 내부 사용 | - |
| `hua-types` | 🔒 내부 사용용 | 타입 정의 | 내부 사용 | - |

## 🌐 **애플리케이션별 상세**

### 🏢 **비즈니스 앱**
| 앱 | 목적 | 기술스택 | 배포 | 상태 |
|----|------|----------|------|------|
| `my-api` | API 서버 | Next.js API | Vercel | 🌐 공개 중 |
| `my-chat` | 채팅 앱 | Next.js | Vercel | 🌐 베타 공개 |
| `my-app` | 다이어리 앱 | Next.js | Vercel | 🔒 개발중 |

### 🌟 **공개 사이트 (공개 예정)**
| 사이트 | 목적 | 기술스택 | 배포 | 상태 |
|--------|------|----------|------|------|
| `hua-animation-site` | 애니메이션 데모 | Next.js | Vercel | 🌐 공개 예정 |
| `hua-ui-site` | UI 컴포넌트 데모 | Next.js | Vercel | 🌐 공개 예정 |
| `hua-labs-official` | 공식 사이트 | Next.js | Vercel | 🌐 공개 예정 |

### 🧪 **테스트/데모**
| 앱 | 목적 | 상태 |
|----|------|------|
| `i18n-test` | SDK 테스트 | 🧪 테스트용 (배포 안함) |
| `hua-demo` | 데모 앱 | 🧪 데모용 (깃헙 공개만 고려) |

## 🚀 **배포 전략 옵션**

### **옵션 1: 현재 구조 유지 (추천)**
```
GitHub: hua-platform (프라이빗 모노레포)
├── 모든 코드 관리
├── Vercel 자동 배포 (웹사이트)
└── npm 수동 배포 (SDK)
```

**장점:**
- ✅ 개발 편의성 (모노레포)
- ✅ 자동 배포 (Vercel)
- ✅ 패키지 간 의존성 관리 쉬움
- ✅ 버전 동기화 용이

**단점:**
- ❌ 프라이빗 레포에 공개 코드 섞임
- ❌ 공개/프라이빗 구분 어려움

### **옵션 2: 레포 분리**
```
GitHub: hua-platform (프라이빗)
└── 비즈니스 앱들만

GitHub: hua-labs-public (공개)
├── hua-i18n-beginner
├── hua-animation-site
├── hua-ui-site
└── hua-labs-official
```

**장점:**
- ✅ 깔끔한 분리
- ✅ 공개/프라이빗 명확
- ✅ 각각 독립적 관리

**단점:**
- ❌ 개발 불편함
- ❌ 패키지 간 연결 복잡
- ❌ 버전 관리 어려움

### **옵션 3: 하이브리드**
```
GitHub: hua-platform (프라이빗)
├── 비즈니스 앱들
└── 공개 패키지들 (npm 배포)

GitHub: hua-labs-sites (공개)
└── 공개 웹사이트들
```

## 📊 **현재 개발 상태**

### ✅ **완성된 것들:**
- `hua-i18n-beginner`: 완성 + 문서 완벽
- `hua-animation`: 공개 중 (npm)
- `my-api`: 공개 중 (Vercel)
- `my-chat`: 베타 공개 (Vercel)

### 🔄 **진행 중:**
- `hua-labs-official`: 공식 사이트
- `hua-ui`: UI 컴포넌트
- `hua-animation-site`: 데모 사이트
- `hua-ui-site`: 데모 사이트
- `my-app`: 개발 중

### 🌟 **공개 예정:**
- `hua-i18n-core`: 핵심 기능
- `hua-i18n-sdk`: 고급 SDK
- `hua-i18n-advanced`: 엔터프라이즈
- `hua-ui`: UI 컴포넌트

### 📋 **할 일:**
- [ ] 배포 전략 결정
- [ ] SDK npm 배포 (i18n 시리즈)
- [ ] 공개 사이트 Vercel 배포
- [ ] 문서 정리

## 🎯 **추천 배포 순서**

### **1단계: i18n SDK 시리즈 배포**
```bash
# 1. Beginner SDK (완성됨)
cd packages/hua-i18n-beginner
npm publish --access public

# 2. Core SDK (준비되면)
cd packages/hua-i18n-core
npm publish --access public

# 3. Advanced SDK (준비되면)
cd packages/hua-i18n-sdk
npm publish --access public

# 4. Enterprise SDK (준비되면)
cd packages/hua-i18n-advanced
npm publish --access public
```

### **2단계: UI 패키지 배포**
```bash
# UI 컴포넌트 (준비되면)
cd packages/hua-ui
npm publish --access public
```

### **3단계: 공개 사이트 배포**
```bash
# Vercel에서 자동 배포 설정
# GitHub 푸시하면 자동 배포
```

### **4단계: 문서 정리**
- README 업데이트
- API 문서 작성
- 예제 코드 정리

## 🤔 **결정 사항**

### **질문 1: 레포 분리할까요?**
- **현재**: 모노레포 유지
- **대안**: 공개/프라이빗 분리

### **질문 2: 어떤 것부터 배포할까요?**
- **우선순위 1**: `hua-i18n-beginner` (SDK) - 완성됨
- **우선순위 2**: `hua-i18n-core` (SDK) - 준비 중
- **우선순위 3**: `hua-ui` (UI 컴포넌트) - 준비 중
- **우선순위 4**: `hua-animation-site` (데모) - 준비 중

### **질문 3: 배포 플랫폼은?**
- **SDK**: npm
- **웹사이트**: Vercel
- **API**: Vercel (Railway에서 변경)

## 📝 **다음 단계**

1. **팀장과 배포 전략 논의**
2. **레포 구조 결정**
3. **배포 순서 결정**
4. **실제 배포 진행**

---

**마지막 업데이트**: 2025년 07월
**작성자**: HUA Labs Team 