/**
 * Component Metadata System
 *
 * SDUI 레지스트리의 각 컴포넌트에 대한 메타데이터 정의
 * - 팔레트 표시용 정보
 * - 속성 편집기용 스키마
 */

import type { ComponentMetadata, ComponentCategory, PropSchema } from "@/types";

/**
 * 공통 props 스키마
 */
const commonProps: PropSchema[] = [
  {
    name: "className",
    displayName: "CSS 클래스",
    type: "string",
    description: "추가 CSS 클래스",
    group: "스타일",
  },
];

/**
 * 레이아웃 컴포넌트
 */
const layoutComponents: ComponentMetadata[] = [
  {
    type: "Box",
    displayName: "박스",
    category: "layout",
    icon: "folder",
    description: "기본 컨테이너",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "Flex",
    displayName: "Flex",
    category: "layout",
    icon: "folder",
    description: "Flexbox 레이아웃",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [
      {
        name: "direction",
        displayName: "방향",
        type: "select",
        options: [
          { label: "가로", value: "row" },
          { label: "세로", value: "column" },
        ],
        defaultValue: "row",
        group: "레이아웃",
      },
      {
        name: "gap",
        displayName: "간격",
        type: "number",
        defaultValue: 0,
        group: "레이아웃",
      },
      ...commonProps,
    ],
    defaultProps: { direction: "row", gap: 4 },
  },
  {
    type: "Grid",
    displayName: "Grid",
    category: "layout",
    icon: "folder",
    description: "Grid 레이아웃",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [
      {
        name: "cols",
        displayName: "열 수",
        type: "number",
        defaultValue: 1,
        group: "레이아웃",
      },
      {
        name: "gap",
        displayName: "간격",
        type: "number",
        defaultValue: 4,
        group: "레이아웃",
      },
      ...commonProps,
    ],
    defaultProps: { cols: 2, gap: 4 },
  },
  {
    type: "Section",
    displayName: "섹션",
    category: "layout",
    icon: "folder",
    description: "페이지 섹션",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "Container",
    displayName: "컨테이너",
    category: "layout",
    icon: "folder",
    description: "최대 너비 컨테이너",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "Divider",
    displayName: "구분선",
    category: "layout",
    icon: "folder",
    description: "수평 구분선",
    allowsChildren: false,
    propSchema: [...commonProps],
    defaultProps: {},
  },
];

/**
 * 타이포그래피 컴포넌트
 */
const typographyComponents: ComponentMetadata[] = [
  {
    type: "Text",
    displayName: "텍스트",
    category: "typography",
    icon: "fileText",
    description: "일반 텍스트",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [
      {
        name: "variant",
        displayName: "스타일",
        type: "select",
        options: [
          { label: "본문", value: "body" },
          { label: "흐린", value: "muted" },
          { label: "리드", value: "lead" },
        ],
        defaultValue: "body",
        group: "스타일",
      },
      ...commonProps,
    ],
    defaultProps: { variant: "body" },
  },
  {
    type: "H1",
    displayName: "제목 1",
    category: "typography",
    icon: "fileText",
    description: "가장 큰 제목",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "H2",
    displayName: "제목 2",
    category: "typography",
    icon: "fileText",
    description: "두 번째 제목",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "H3",
    displayName: "제목 3",
    category: "typography",
    icon: "fileText",
    description: "세 번째 제목",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "H4",
    displayName: "제목 4",
    category: "typography",
    icon: "fileText",
    description: "네 번째 제목",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "Link",
    displayName: "링크",
    category: "typography",
    icon: "link",
    description: "하이퍼링크",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [
      {
        name: "href",
        displayName: "URL",
        type: "string",
        defaultValue: "#",
        group: "속성",
      },
      ...commonProps,
    ],
    defaultProps: { href: "#" },
  },
];

/**
 * 폼 컴포넌트
 */
const formComponents: ComponentMetadata[] = [
  {
    type: "Button",
    displayName: "버튼",
    category: "form",
    icon: "zap",
    description: "클릭 가능한 버튼",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [
      {
        name: "variant",
        displayName: "스타일",
        type: "select",
        options: [
          { label: "기본", value: "default" },
          { label: "보조", value: "secondary" },
          { label: "아웃라인", value: "outline" },
          { label: "고스트", value: "ghost" },
          { label: "링크", value: "link" },
          { label: "위험", value: "destructive" },
        ],
        defaultValue: "default",
        group: "스타일",
      },
      {
        name: "size",
        displayName: "크기",
        type: "select",
        options: [
          { label: "작게", value: "sm" },
          { label: "보통", value: "default" },
          { label: "크게", value: "lg" },
        ],
        defaultValue: "default",
        group: "스타일",
      },
      ...commonProps,
    ],
    defaultProps: { variant: "default", size: "default" },
  },
  {
    type: "Input",
    displayName: "입력",
    category: "form",
    icon: "edit",
    description: "텍스트 입력 필드",
    allowsChildren: false,
    propSchema: [
      {
        name: "placeholder",
        displayName: "플레이스홀더",
        type: "string",
        defaultValue: "입력하세요...",
        group: "속성",
      },
      {
        name: "type",
        displayName: "타입",
        type: "select",
        options: [
          { label: "텍스트", value: "text" },
          { label: "이메일", value: "email" },
          { label: "비밀번호", value: "password" },
          { label: "숫자", value: "number" },
        ],
        defaultValue: "text",
        group: "속성",
      },
      ...commonProps,
    ],
    defaultProps: { placeholder: "입력하세요...", type: "text" },
  },
  {
    type: "Textarea",
    displayName: "텍스트영역",
    category: "form",
    icon: "edit",
    description: "여러 줄 텍스트 입력",
    allowsChildren: false,
    propSchema: [
      {
        name: "placeholder",
        displayName: "플레이스홀더",
        type: "string",
        defaultValue: "입력하세요...",
        group: "속성",
      },
      ...commonProps,
    ],
    defaultProps: { placeholder: "입력하세요..." },
  },
  {
    type: "Checkbox",
    displayName: "체크박스",
    category: "form",
    icon: "check",
    description: "체크박스",
    allowsChildren: false,
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "Switch",
    displayName: "스위치",
    category: "form",
    icon: "check",
    description: "토글 스위치",
    allowsChildren: false,
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "Label",
    displayName: "레이블",
    category: "form",
    icon: "fileText",
    description: "폼 레이블",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [...commonProps],
    defaultProps: {},
  },
];

/**
 * 디스플레이 컴포넌트
 */
const displayComponents: ComponentMetadata[] = [
  {
    type: "Card",
    displayName: "카드",
    category: "display",
    icon: "folder",
    description: "카드 컨테이너",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "CardHeader",
    displayName: "카드 헤더",
    category: "display",
    icon: "folder",
    description: "카드 헤더 영역",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "CardTitle",
    displayName: "카드 제목",
    category: "display",
    icon: "fileText",
    description: "카드 제목",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "CardDescription",
    displayName: "카드 설명",
    category: "display",
    icon: "fileText",
    description: "카드 설명 텍스트",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "CardContent",
    displayName: "카드 콘텐츠",
    category: "display",
    icon: "folder",
    description: "카드 본문 영역",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "CardFooter",
    displayName: "카드 푸터",
    category: "display",
    icon: "folder",
    description: "카드 하단 영역",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "Badge",
    displayName: "뱃지",
    category: "display",
    icon: "star",
    description: "상태/태그 표시",
    allowsChildren: true,
    childrenType: "text",
    propSchema: [
      {
        name: "variant",
        displayName: "스타일",
        type: "select",
        options: [
          { label: "기본", value: "default" },
          { label: "보조", value: "secondary" },
          { label: "아웃라인", value: "outline" },
          { label: "위험", value: "destructive" },
        ],
        defaultValue: "default",
        group: "스타일",
      },
      ...commonProps,
    ],
    defaultProps: { variant: "default" },
  },
  {
    type: "Avatar",
    displayName: "아바타",
    category: "display",
    icon: "user",
    description: "사용자 프로필 이미지",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "Image",
    displayName: "이미지",
    category: "display",
    icon: "image",
    description: "이미지",
    allowsChildren: false,
    propSchema: [
      {
        name: "src",
        displayName: "이미지 URL",
        type: "string",
        defaultValue: "https://via.placeholder.com/150",
        group: "속성",
      },
      {
        name: "alt",
        displayName: "대체 텍스트",
        type: "string",
        defaultValue: "이미지",
        group: "속성",
      },
      ...commonProps,
    ],
    defaultProps: { src: "https://via.placeholder.com/150", alt: "이미지" },
  },
];

/**
 * 피드백 컴포넌트
 */
const feedbackComponents: ComponentMetadata[] = [
  {
    type: "Alert",
    displayName: "알림",
    category: "feedback",
    icon: "alertCircle",
    description: "알림 메시지",
    allowsChildren: true,
    childrenType: "nodes",
    propSchema: [...commonProps],
    defaultProps: {},
  },
  {
    type: "Progress",
    displayName: "프로그레스",
    category: "feedback",
    icon: "activity",
    description: "진행률 표시",
    allowsChildren: false,
    propSchema: [
      {
        name: "value",
        displayName: "값",
        type: "number",
        defaultValue: 50,
        group: "속성",
      },
      ...commonProps,
    ],
    defaultProps: { value: 50 },
  },
  {
    type: "Skeleton",
    displayName: "스켈레톤",
    category: "feedback",
    icon: "loader",
    description: "로딩 스켈레톤",
    allowsChildren: false,
    propSchema: [...commonProps],
    defaultProps: {},
  },
];

/**
 * 고급 컴포넌트
 */
const advancedComponents: ComponentMetadata[] = [
  {
    type: "HeroSection",
    displayName: "히어로 섹션",
    category: "advanced",
    icon: "star",
    description: "페이지 상단 히어로 영역",
    allowsChildren: false,
    isPro: true,
    propSchema: [
      {
        name: "title",
        displayName: "제목",
        type: "string",
        defaultValue: "환영합니다",
        group: "콘텐츠",
      },
      {
        name: "subtitle",
        displayName: "부제목",
        type: "string",
        defaultValue: "",
        group: "콘텐츠",
      },
      {
        name: "description",
        displayName: "설명",
        type: "string",
        defaultValue: "여기에 설명을 입력하세요",
        group: "콘텐츠",
      },
      {
        name: "size",
        displayName: "크기",
        type: "select",
        options: [
          { label: "작게", value: "sm" },
          { label: "보통", value: "md" },
          { label: "크게", value: "lg" },
          { label: "아주 크게", value: "xl" },
          { label: "전체 화면", value: "full" },
        ],
        defaultValue: "lg",
        group: "레이아웃",
      },
      {
        name: "background",
        displayName: "배경",
        type: "select",
        options: [
          { label: "없음", value: "none" },
          { label: "그라데이션", value: "gradient" },
        ],
        defaultValue: "none",
        group: "스타일",
      },
      ...commonProps,
    ],
    defaultProps: {
      title: "환영합니다",
      description: "여기에 설명을 입력하세요",
      size: "lg",
    },
  },
  {
    type: "ScrollProgress",
    displayName: "스크롤 프로그레스",
    category: "advanced",
    icon: "activity",
    description: "페이지 스크롤 진행률 표시",
    allowsChildren: false,
    isPro: true,
    propSchema: [...commonProps],
    defaultProps: {},
  },
];

/**
 * 전체 컴포넌트 메타데이터
 */
export const componentMetadata: ComponentMetadata[] = [
  ...layoutComponents,
  ...typographyComponents,
  ...formComponents,
  ...displayComponents,
  ...feedbackComponents,
  ...advancedComponents,
];

/**
 * 카테고리별 컴포넌트 그룹
 */
export const componentsByCategory: Record<ComponentCategory, ComponentMetadata[]> = {
  layout: layoutComponents,
  typography: typographyComponents,
  form: formComponents,
  display: displayComponents,
  feedback: feedbackComponents,
  advanced: advancedComponents,
};

/**
 * 카테고리 정보
 */
export const categoryInfo: Record<ComponentCategory, { displayName: string; icon: string }> = {
  layout: { displayName: "레이아웃", icon: "folder" },
  typography: { displayName: "타이포그래피", icon: "fileText" },
  form: { displayName: "폼", icon: "edit" },
  display: { displayName: "디스플레이", icon: "monitor" },
  feedback: { displayName: "피드백", icon: "bell" },
  advanced: { displayName: "고급", icon: "sparkles" },
};

/**
 * 컴포넌트 타입으로 메타데이터 찾기
 */
export function getComponentMetadata(type: string): ComponentMetadata | undefined {
  return componentMetadata.find((c) => c.type === type);
}

/**
 * 카테고리 순서
 */
export const categoryOrder: ComponentCategory[] = [
  "layout",
  "typography",
  "form",
  "display",
  "feedback",
  "advanced",
];
