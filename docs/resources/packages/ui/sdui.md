# Server-Driven UI (SDUI)

**작성일**: 2026-01-11
**버전**: 1.0.0

---

## 목차

1. [개요](#개요)
2. [설치 및 사용법](#설치-및-사용법)
3. [스키마 구조](#스키마-구조)
4. [컴포넌트 레지스트리](#컴포넌트-레지스트리)
5. [이벤트 및 액션](#이벤트-및-액션)
6. [예제](#예제)

---

## 개요

HUA UI의 SDUI(Server-Driven UI) 시스템은 JSON 스키마로 UI를 정의하고 렌더링하는 시스템입니다.
서버에서 UI 구조를 동적으로 전달받아 클라이언트에서 렌더링할 수 있습니다.

### 주요 특징

- **JSON 기반 스키마**: 선언적 UI 정의
- **조건부 렌더링**: `when` 조건으로 동적 표시/숨김
- **이벤트 핸들링**: `on.click`, `on.submit` 등 액션 정의
- **컴포넌트 확장**: 커스텀 컴포넌트 레지스트리 지원
- **Uncontrolled 모드**: 프리뷰에서 인터랙션 동작

---

## 설치 및 사용법

```tsx
import {
  defaultRegistry,
  extendRegistry,
  type SDUINode,
  type SDUIPageSchema
} from '@hua-labs/ui/sdui';
```

---

## 스키마 구조

### SDUINode (기본 노드)

```typescript
interface SDUINode {
  type: string;                    // 컴포넌트 타입
  props?: Record<string, unknown>; // 컴포넌트 props
  children?: SDUINode[] | string;  // 자식 노드 또는 텍스트
  key?: string;                    // 리스트 렌더링용 키
  when?: SDUICondition;            // 조건부 렌더링
  on?: SDUIEventHandlers;          // 이벤트 핸들러
}
```

### SDUIPageSchema (페이지 스키마)

```typescript
interface SDUIPageSchema {
  id: string;                      // 페이지 ID
  title?: string;                  // 페이지 제목
  meta?: {
    description?: string;
    keywords?: string[];
  };
  data?: Record<string, unknown>;  // 초기 데이터
  root: SDUINode;                  // 루트 노드
}
```

---

## 컴포넌트 레지스트리

### 기본 제공 컴포넌트

#### 레이아웃
- `Box` - 기본 div 컨테이너
- `Spacer` - 공백 요소
- `Flex` - Flexbox 레이아웃
- `Grid` - Grid 레이아웃
- `Section` - 섹션 컨테이너
- `Container` - 페이지 컨테이너
- `Divider` - 구분선
- `Header` - 네비게이션 헤더 (sticky, transparent, blur 지원)

#### 타이포그래피
- `Text` - 텍스트 (body, muted, lead 변형)
- `H1`, `H2`, `H3`, `H4` - 제목
- `Link` - 링크

#### 미디어
- `Image` - 이미지
- `Icon` - 아이콘

#### 기본 UI
- `Button` - 버튼
- `Badge` - 배지
- `Avatar`, `AvatarImage`, `AvatarFallback` - 아바타
- `Skeleton` - 스켈레톤 로딩
- `Progress` - 진행률

#### 폼
- `Input` - 입력 필드 (Uncontrolled)
- `Textarea` - 텍스트 영역 (Uncontrolled)
- `Label` - 라벨
- `Checkbox` - 체크박스 (Uncontrolled)
- `Switch` - 스위치 (Uncontrolled)

#### 카드
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

#### 피드백
- `Alert` - 알림

#### 고급 컴포넌트
- `HeroSection` - 히어로 섹션
- `ScrollProgress` - 스크롤 진행률

#### 인터랙티브
- `Accordion` - 아코디언 (items 배열 기반)
- `Tabs` - 탭 (tabs 배열 기반)

### 레지스트리 확장

```typescript
import { defaultRegistry, extendRegistry } from '@hua-labs/ui/sdui';

const customRegistry = extendRegistry({
  MyCustomComponent: ({ title, children }) => (
    <div className="custom">{title}: {children}</div>
  ),
});
```

---

## 이벤트 및 액션

### 조건부 렌더링

```json
{
  "type": "Button",
  "props": { "children": "로그인" },
  "when": {
    "path": "user.isLoggedIn",
    "operator": "eq",
    "value": false
  }
}
```

### 지원 연산자

- `eq` - 같음
- `neq` - 같지 않음
- `gt` - 큼
- `lt` - 작음
- `gte` - 크거나 같음
- `lte` - 작거나 같음
- `exists` - 존재함
- `notExists` - 존재하지 않음

### 이벤트 핸들러

```json
{
  "type": "Button",
  "props": { "children": "클릭" },
  "on": {
    "click": {
      "type": "navigate",
      "payload": { "path": "/dashboard" }
    }
  }
}
```

### 액션 타입

- `navigate` - 페이지 이동
- `api` - API 호출
- `setState` - 상태 변경
- `openModal` - 모달 열기
- `closeModal` - 모달 닫기
- `custom` - 커스텀 액션

---

## 예제

### 기본 페이지 스키마

```json
{
  "id": "landing",
  "title": "랜딩 페이지",
  "root": {
    "type": "Box",
    "props": { "className": "min-h-screen" },
    "children": [
      {
        "type": "Header",
        "props": { "sticky": true, "blur": true },
        "children": [
          {
            "type": "Flex",
            "props": { "justify": "between", "align": "center" },
            "children": [
              { "type": "H4", "children": "My App" },
              {
                "type": "Button",
                "props": { "variant": "outline" },
                "children": "로그인"
              }
            ]
          }
        ]
      },
      {
        "type": "HeroSection",
        "props": {
          "title": "환영합니다",
          "subtitle": "SDUI로 구축된 페이지입니다",
          "centered": true
        }
      }
    ]
  }
}
```

### 데이터 기반 아코디언

```json
{
  "type": "Accordion",
  "props": {
    "items": [
      { "title": "FAQ 1", "content": "답변 1입니다." },
      { "title": "FAQ 2", "content": "답변 2입니다." }
    ],
    "type": "single",
    "collapsible": true
  }
}
```

### 데이터 기반 탭

```json
{
  "type": "Tabs",
  "props": {
    "tabs": [
      { "label": "기본", "content": "기본 탭 내용" },
      { "label": "고급", "content": "고급 탭 내용" }
    ],
    "variant": "pills"
  }
}
```

---

## 참고 문서

- [아키텍처 문서](./ARCHITECTURE.md)
- [컴포넌트 가이드](./COMPONENTS.md)

---

**작성자**: Auto (AI Assistant)
**최종 업데이트**: 2026-01-11
