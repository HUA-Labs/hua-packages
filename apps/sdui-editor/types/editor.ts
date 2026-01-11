/**
 * SDUI Editor - Type Definitions
 *
 * 에디터 전용 타입 정의
 */

import type { SDUINode, SDUIAction, SDUICondition } from "@hua-labs/ui/sdui";

/**
 * 에디터 노드 - SDUINode에 에디터 전용 필드 추가
 */
export interface EditorNode extends Omit<SDUINode, "children"> {
  /** 고유 ID (nanoid) */
  id: string;
  /** 자식 노드들 (에디터용) */
  children?: EditorNode[] | string;
  /** 접힘 상태 (트리뷰용) */
  collapsed?: boolean;
  /** 잠금 상태 (편집 불가) */
  locked?: boolean;
}

/**
 * 노드 선택 상태
 */
export interface Selection {
  /** 선택된 노드 ID */
  nodeId: string | null;
  /** 다중 선택 (미래 확장용) */
  nodeIds?: string[];
}

/**
 * 호버 상태
 */
export interface HoverState {
  /** 호버 중인 노드 ID */
  nodeId: string | null;
  /** 드롭 타겟 위치 */
  dropPosition?: "before" | "after" | "inside";
}

/**
 * 드래그 상태
 */
export interface DragState {
  /** 드래그 중인 노드 ID (캔버스 내 이동) */
  nodeId: string | null;
  /** 팔레트에서 드래그 중인 컴포넌트 타입 */
  componentType: string | null;
  /** 드래그 소스 */
  source: "palette" | "canvas" | null;
}

/**
 * 캔버스 뷰포트 상태
 */
export interface ViewportState {
  /** 줌 레벨 (0.25 ~ 2.0) */
  zoom: number;
  /** 패닝 오프셋 X */
  panX: number;
  /** 패닝 오프셋 Y */
  panY: number;
}

/**
 * 프로젝트 정보
 */
export interface Project {
  /** 프로젝트 ID */
  id: string;
  /** 프로젝트 이름 */
  name: string;
  /** 루트 노드 */
  root: EditorNode;
  /** 생성 시간 */
  createdAt: number;
  /** 수정 시간 */
  updatedAt: number;
  /** 썸네일 (base64 또는 URL) */
  thumbnail?: string;
}

/**
 * 히스토리 항목
 */
export interface HistoryEntry {
  /** 스키마 스냅샷 */
  schema: EditorNode;
  /** 타임스탬프 */
  timestamp: number;
  /** 액션 설명 */
  description?: string;
}

/**
 * 컴포넌트 카테고리
 */
export type ComponentCategory =
  | "layout"
  | "typography"
  | "form"
  | "display"
  | "feedback"
  | "advanced";

/**
 * 속성 타입
 */
export type PropType =
  | "string"
  | "number"
  | "boolean"
  | "select"
  | "color"
  | "spacing"
  | "size"
  | "variant"
  | "icon"
  | "children"
  | "action"
  | "condition";

/**
 * 속성 스키마
 */
export interface PropSchema {
  /** 속성 이름 */
  name: string;
  /** 표시 이름 (한국어) */
  displayName: string;
  /** 속성 타입 */
  type: PropType;
  /** 기본값 */
  defaultValue?: unknown;
  /** select 타입일 때 옵션들 */
  options?: Array<{ label: string; value: string }>;
  /** 설명 */
  description?: string;
  /** 필수 여부 */
  required?: boolean;
  /** 그룹 (속성 패널 섹션) */
  group?: string;
}

/**
 * 컴포넌트 메타데이터
 */
export interface ComponentMetadata {
  /** 컴포넌트 타입 (레지스트리 키) */
  type: string;
  /** 표시 이름 (한국어) */
  displayName: string;
  /** 카테고리 */
  category: ComponentCategory;
  /** 아이콘 이름 */
  icon: string;
  /** 기본 props */
  defaultProps?: Record<string, unknown>;
  /** 속성 스키마 */
  propSchema: PropSchema[];
  /** 자식 허용 여부 */
  allowsChildren: boolean;
  /** 자식 타입 */
  childrenType?: "text" | "nodes" | "both";
  /** 설명 */
  description?: string;
  /** Pro 전용 여부 */
  isPro?: boolean;
}

/**
 * 에디터 설정
 */
export interface EditorSettings {
  /** 그리드 표시 */
  showGrid: boolean;
  /** 그리드 크기 */
  gridSize: number;
  /** 스냅 투 그리드 */
  snapToGrid: boolean;
  /** 아웃라인 표시 */
  showOutlines: boolean;
  /** 자동 저장 */
  autoSave: boolean;
  /** 자동 저장 간격 (ms) */
  autoSaveInterval: number;
}

/**
 * 클립보드 아이템
 */
export interface ClipboardItem {
  /** 노드 데이터 */
  node: EditorNode;
  /** 복사 시간 */
  timestamp: number;
}

/**
 * EditorNode를 SDUINode로 변환 (내보내기용)
 */
export function editorNodeToSDUI(node: EditorNode): SDUINode {
  const { id, collapsed, locked, children, ...rest } = node;

  const sduiNode: SDUINode = {
    ...rest,
    key: id,
  };

  if (children) {
    if (typeof children === "string") {
      sduiNode.children = children;
    } else {
      sduiNode.children = children.map(editorNodeToSDUI);
    }
  }

  return sduiNode;
}

/**
 * SDUINode를 EditorNode로 변환 (가져오기용)
 */
export function sduiToEditorNode(
  node: SDUINode,
  generateId: () => string
): EditorNode {
  const { key, children, ...rest } = node;

  const editorNode: EditorNode = {
    ...rest,
    id: key || generateId(),
  };

  if (children) {
    if (typeof children === "string") {
      editorNode.children = children;
    } else {
      editorNode.children = children.map((child) =>
        sduiToEditorNode(child, generateId)
      );
    }
  }

  return editorNode;
}

/**
 * Re-export SDUI types
 */
export type { SDUINode, SDUIAction, SDUICondition };
