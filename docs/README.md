# HUA Platform Documentation

HUA Platform은 모던 웹 개발을 위한 통합 개발 플랫폼입니다.

> **문서 인덱스**: [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)에서 모든 문서를 확인할 수 있습니다.

## 📚 문서

### 핵심 문서
- [아키텍처 개요](./ARCHITECTURE_OVERVIEW.md)
- [기여 가이드](./CONTRIBUTING.md)
- [점진적 마이그레이션 전략](./GRADUAL_MIGRATION_STRATEGY.md)
- [환경 변수 관리](./ENVIRONMENT_VARIABLE_MANAGEMENT.md) - 로컬(Doppler) 및 프로덕션(Vercel) 환경 변수 관리 현황

### SDK 문서
- [애니메이션 SDK 아키텍처](./ANIMATION_SDK_ARCHITECTURE.md) - 🎨 **새로 추가!**
- [UI SDK 문서](./packages/hua-ui/README.md)
- [i18n SDK 문서](./packages/hua-i18n-sdk/README.md)

### 개발 로그
- [개발 로그](./devlogs/)

## 🚀 빠른 시작

### 애니메이션 SDK 사용하기

```typescript
import { useSmartAnimation } from '@hua-labs/animation'

export default function HomePage() {
  const heroRef = useSmartAnimation({ type: 'hero' })
  const titleRef = useSmartAnimation({ type: 'title' })
  const buttonRef = useSmartAnimation({ type: 'button' })

  return (
    <div>
      <div ref={heroRef.ref} style={heroRef.style}>
        <h1 ref={titleRef.ref} style={titleRef.style}>제목</h1>
        <button ref={buttonRef.ref} style={buttonRef.style}>버튼</button>
      </div>
    </div>
  )
}
```

자세한 내용은 [애니메이션 SDK 문서](./ANIMATION_SDK_ARCHITECTURE.md)를 참조하세요!

## 📦 패키지 구조

```
hua-platform/
├── apps/                    # 애플리케이션들
│   ├── my-api/            # API 사이트
│   ├── hua-animation-site/ # 애니메이션 데모 사이트
│   └── ...
├── packages/               # 공유 패키지들
│   ├── hua-ui/            # UI 컴포넌트
│   ├── hua-animation/     # 애니메이션 SDK
│   ├── hua-i18n-core/     # i18n 코어
│   └── ...
└── docs/                  # 문서
```

## 🛠️ 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev

# 빌드
pnpm build
```

## 📄 라이선스

MIT License 