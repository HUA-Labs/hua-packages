/**
 * SDUI (Server-Driven UI) Type Definitions
 *
 * JSON 스키마로 UI를 정의하고 렌더링하는 시스템
 */

/**
 * 기본 SDUI 노드 타입
 */
export interface SDUINode {
  /** 컴포넌트 타입 (Button, Card, HeroSection 등) */
  type: string;
  /** 컴포넌트 props */
  props?: Record<string, unknown>;
  /** 자식 노드들 */
  children?: SDUINode[] | string;
  /** 고유 키 (리스트 렌더링용) */
  key?: string;
  /** 조건부 렌더링 */
  when?: SDUICondition;
  /** 이벤트 핸들러 */
  on?: SDUIEventHandlers;
}

/**
 * 조건부 렌더링
 */
export interface SDUICondition {
  /** 데이터 경로 (예: "user.isLoggedIn") */
  path: string;
  /** 연산자 */
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "exists" | "notExists";
  /** 비교 값 */
  value?: unknown;
}

/**
 * 이벤트 핸들러
 */
export interface SDUIEventHandlers {
  click?: SDUIAction;
  submit?: SDUIAction;
  change?: SDUIAction;
}

/**
 * 액션 정의
 */
export interface SDUIAction {
  /** 액션 타입 */
  type: "navigate" | "api" | "setState" | "openModal" | "closeModal" | "custom";
  /** 액션 페이로드 */
  payload?: Record<string, unknown>;
}

/**
 * 페이지 스키마 (전체 페이지 정의)
 */
export interface SDUIPageSchema {
  /** 페이지 ID */
  id: string;
  /** 페이지 제목 */
  title?: string;
  /** 메타데이터 */
  meta?: {
    description?: string;
    keywords?: string[];
  };
  /** 초기 데이터 */
  data?: Record<string, unknown>;
  /** 루트 노드 */
  root: SDUINode;
}

/**
 * 컴포넌트 레지스트리 타입
 * Record<string, unknown>으로 처리하고 렌더링 시 타입 가드 사용
 */
export type SDUIComponentRegistry = Record<string, React.ComponentType<Record<string, unknown>>>;

/**
 * 렌더러 컨텍스트
 */
export interface SDUIContext {
  /** 페이지 데이터 */
  data: Record<string, unknown>;
  /** 데이터 업데이트 함수 */
  setData: (path: string, value: unknown) => void;
  /** 액션 핸들러 */
  handleAction: (action: SDUIAction) => void;
  /** 네비게이션 함수 */
  navigate: (path: string) => void;
}

/**
 * 렌더러 Props
 */
export interface SDUIRendererProps {
  /** 렌더링할 스키마 */
  schema: SDUINode | SDUIPageSchema;
  /** 컴포넌트 레지스트리 (기본 제공 + 커스텀) */
  components?: SDUIComponentRegistry;
  /** 초기 데이터 */
  data?: Record<string, unknown>;
  /** 액션 핸들러 (커스텀 액션용) */
  onAction?: (action: SDUIAction) => void;
  /** 네비게이션 핸들러 */
  onNavigate?: (path: string) => void;
}
