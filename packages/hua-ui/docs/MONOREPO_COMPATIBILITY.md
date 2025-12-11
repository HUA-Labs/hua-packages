# 모노레포/멀티레포 호환성 가이드

**작성일**: 2025-12-06  
**버전**: 1.0.0

---

## 개요

HUA UI는 모노레포 환경에서 개발되었지만, 멀티레포 환경에서도 완전히 사용 가능합니다.

---

## 모노레포 환경

### 현재 구조

HUA UI는 다음 모노레포 구조에서 개발되었습니다:

```
hua-platform/
├── packages/
│   ├── hua-ui/          # UI 컴포넌트 라이브러리
│   └── hua-motion/      # 모션 라이브러리 (workspace 의존성)
└── apps/
    └── [다양한 앱들]
```

### Workspace 의존성

현재 `@hua-labs/motion`은 workspace 의존성으로 설정되어 있습니다:

```json
{
  "dependencies": {
    "@hua-labs/motion": "workspace:*"
  }
}
```

**사용 위치**: Advanced 컴포넌트 (`@hua-labs/ui/advanced/motion`)에서만 사용됩니다.

---

## 멀티레포 환경 호환성

### 호환성 상태

**✅ 완전 호환 가능**

이유:
1. **Core 컴포넌트**: `@hua-labs/motion`에 의존하지 않음
2. **Form, Navigation, Feedback 서브패키지**: `@hua-labs/motion`에 의존하지 않음
3. **Advanced 컴포넌트**: `@hua-labs/motion` 사용하지만, 선택적 사용

### 멀티레포에서 사용하기

#### 1. npm/pnpm/yarn으로 설치

```bash
npm install @hua-labs/ui
# or
pnpm add @hua-labs/ui
# or
yarn add @hua-labs/ui
```

#### 2. Core 컴포넌트 사용 (권장)

```tsx
// ✅ 완전히 독립적, @hua-labs/motion 불필요
import { Button, Card, Table, Modal, Drawer } from '@hua-labs/ui';
import { Input, Select, DatePicker } from '@hua-labs/ui/form';
import { PageNavigation } from '@hua-labs/ui/navigation';
import { ToastProvider, useToast } from '@hua-labs/ui/feedback';
```

#### 3. Advanced 컴포넌트 사용 (선택사항)

Advanced 컴포넌트를 사용하려면 `@hua-labs/motion`이 필요합니다:

```bash
# @hua-labs/motion이 별도 패키지로 배포되어야 함
npm install @hua-labs/motion
```

또는 Advanced 컴포넌트를 사용하지 않으면 `@hua-labs/motion`이 필요 없습니다.

---

## 의존성 분석

### Core 의존성

```json
{
  "dependencies": {
    "clsx": "^2.0.0",
    "lucide-react": "^0.263.1",
    "tailwind-merge": "^2.0.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0",
    "@phosphor-icons/react": "*"
  }
}
```

**결론**: Core는 완전히 독립적이며, 멀티레포에서 바로 사용 가능합니다.

### Advanced 의존성

```json
{
  "dependencies": {
    "@hua-labs/motion": "workspace:*"
  }
}
```

**결론**: Advanced 컴포넌트만 `@hua-labs/motion`에 의존합니다.

---

## 배포 전략

### 옵션 1: @hua-labs/motion을 별도 패키지로 배포

멀티레포 사용자가 Advanced 컴포넌트를 사용하려면:

```bash
npm install @hua-labs/ui @hua-labs/motion
```

### 옵션 2: Advanced 컴포넌트를 선택적 의존성으로

`@hua-labs/motion`을 peerDependency로 변경:

```json
{
  "peerDependencies": {
    "@hua-labs/motion": "*"
  }
}
```

이 경우 사용자가 Advanced 컴포넌트를 사용할 때만 설치하면 됩니다.

---

## 권장 사항

### 멀티레포 사용자를 위한 가이드

1. **Core 컴포넌트만 사용**: `@hua-labs/motion` 불필요
2. **Advanced 컴포넌트 사용**: `@hua-labs/motion` 별도 설치 필요
3. **번들 최적화**: 서브패키지 활용 권장

### 모노레포 사용자를 위한 가이드

1. **Workspace 의존성 활용**: `workspace:*` 사용 가능
2. **로컬 개발**: 모든 패키지가 같은 레포에 있어 개발 편리

---

## 결론

**HUA UI는 멀티레포 환경에서도 완전히 사용 가능합니다.**

- Core, Form, Navigation, Feedback: 완전 독립적
- Advanced: `@hua-labs/motion` 필요 (선택적)

대부분의 사용자는 Core 컴포넌트만 사용하므로, 멀티레포에서도 문제없이 사용할 수 있습니다.

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

