/**
 * Editor Store
 *
 * Zustand 기반 에디터 상태 관리
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { EditorNode, Selection, HoverState, DragState, ViewportState } from "@/types";
import {
  createEmptyRoot,
  updateNodeProps,
  updateNodeChildren,
  addChildNode,
  removeNode,
  moveNode,
  cloneNode,
  findNodeById,
} from "@/lib/schema-utils";

/**
 * 에디터 상태
 */
interface EditorState {
  // 스키마
  schema: EditorNode;

  // 선택 상태
  selection: Selection;

  // 호버 상태
  hover: HoverState;

  // 드래그 상태
  drag: DragState;

  // 뷰포트 상태
  viewport: ViewportState;

  // UI 상태
  showSchemaViewer: boolean;
  showComponentTree: boolean;
}

/**
 * 에디터 액션
 */
interface EditorActions {
  // 스키마 액션
  setSchema: (schema: EditorNode) => void;
  resetSchema: () => void;

  // 노드 조작
  updateProps: (nodeId: string, props: Record<string, unknown>) => void;
  updateChildren: (nodeId: string, children: string | EditorNode[]) => void;
  addNode: (parentId: string, node: EditorNode, index?: number) => void;
  deleteNode: (nodeId: string) => void;
  moveNodeTo: (nodeId: string, newParentId: string, newIndex: number) => void;
  duplicateNode: (nodeId: string) => void;

  // 선택 액션
  select: (nodeId: string | null) => void;
  clearSelection: () => void;

  // 호버 액션
  setHover: (nodeId: string | null, dropPosition?: "before" | "after" | "inside") => void;
  clearHover: () => void;

  // 드래그 액션
  startDrag: (source: "palette" | "canvas", data: { nodeId?: string; componentType?: string }) => void;
  endDrag: () => void;

  // 뷰포트 액션
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  pan: (x: number, y: number) => void;

  // UI 액션
  toggleSchemaViewer: () => void;
  toggleComponentTree: () => void;

  // 유틸
  getSelectedNode: () => EditorNode | null;
}

/**
 * 초기 상태
 */
const initialState: EditorState = {
  schema: createEmptyRoot(),
  selection: { nodeId: null },
  hover: { nodeId: null },
  drag: { nodeId: null, componentType: null, source: null },
  viewport: { zoom: 1, panX: 0, panY: 0 },
  showSchemaViewer: false,
  showComponentTree: true,
};

/**
 * 줌 레벨 제한
 */
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

/**
 * 에디터 스토어
 */
export const useEditorStore = create<EditorState & EditorActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // 스키마 액션
    setSchema: (schema) => set({ schema }),

    resetSchema: () =>
      set({
        schema: createEmptyRoot(),
        selection: { nodeId: null },
      }),

    // 노드 조작
    updateProps: (nodeId, props) =>
      set((state) => ({
        schema: updateNodeProps(state.schema, nodeId, props),
      })),

    updateChildren: (nodeId, children) =>
      set((state) => ({
        schema: updateNodeChildren(state.schema, nodeId, children),
      })),

    addNode: (parentId, node, index) =>
      set((state) => ({
        schema: addChildNode(state.schema, parentId, node, index),
      })),

    deleteNode: (nodeId) =>
      set((state) => {
        // 삭제하려는 노드가 선택되어 있으면 선택 해제
        const newSelection =
          state.selection.nodeId === nodeId
            ? { nodeId: null }
            : state.selection;

        return {
          schema: removeNode(state.schema, nodeId),
          selection: newSelection,
        };
      }),

    moveNodeTo: (nodeId, newParentId, newIndex) =>
      set((state) => ({
        schema: moveNode(state.schema, nodeId, newParentId, newIndex),
      })),

    duplicateNode: (nodeId) =>
      set((state) => {
        const node = findNodeById(state.schema, nodeId);
        if (!node) return state;

        // 부모 찾기
        const findParent = (root: EditorNode, childId: string): EditorNode | null => {
          if (root.children && Array.isArray(root.children)) {
            for (const child of root.children) {
              if (child.id === childId) return root;
              const found = findParent(child, childId);
              if (found) return found;
            }
          }
          return null;
        };

        const parent = findParent(state.schema, nodeId);
        if (!parent) return state;

        // 현재 인덱스 찾기
        const currentIndex = Array.isArray(parent.children)
          ? parent.children.findIndex((c) => c.id === nodeId)
          : -1;

        // 복제본 생성 및 삽입
        const cloned = cloneNode(node);
        return {
          schema: addChildNode(state.schema, parent.id, cloned, currentIndex + 1),
          selection: { nodeId: cloned.id },
        };
      }),

    // 선택 액션
    select: (nodeId) => set({ selection: { nodeId } }),

    clearSelection: () => set({ selection: { nodeId: null } }),

    // 호버 액션
    setHover: (nodeId, dropPosition) =>
      set({ hover: { nodeId, dropPosition } }),

    clearHover: () => set({ hover: { nodeId: null } }),

    // 드래그 액션
    startDrag: (source, data) =>
      set({
        drag: {
          source,
          nodeId: data.nodeId || null,
          componentType: data.componentType || null,
        },
      }),

    endDrag: () =>
      set({
        drag: { nodeId: null, componentType: null, source: null },
        hover: { nodeId: null },
      }),

    // 뷰포트 액션
    setZoom: (zoom) =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)),
        },
      })),

    zoomIn: () =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: Math.min(MAX_ZOOM, state.viewport.zoom + ZOOM_STEP),
        },
      })),

    zoomOut: () =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: Math.max(MIN_ZOOM, state.viewport.zoom - ZOOM_STEP),
        },
      })),

    resetZoom: () =>
      set((state) => ({
        viewport: { ...state.viewport, zoom: 1, panX: 0, panY: 0 },
      })),

    pan: (x, y) =>
      set((state) => ({
        viewport: { ...state.viewport, panX: x, panY: y },
      })),

    // UI 액션
    toggleSchemaViewer: () =>
      set((state) => ({ showSchemaViewer: !state.showSchemaViewer })),

    toggleComponentTree: () =>
      set((state) => ({ showComponentTree: !state.showComponentTree })),

    // 유틸
    getSelectedNode: () => {
      const { schema, selection } = get();
      if (!selection.nodeId) return null;
      return findNodeById(schema, selection.nodeId);
    },
  }))
);

/**
 * 선택된 노드만 구독하는 셀렉터
 */
export const useSelectedNode = () =>
  useEditorStore((state) => {
    if (!state.selection.nodeId) return null;
    return findNodeById(state.schema, state.selection.nodeId);
  });

/**
 * 스키마만 구독
 */
export const useSchema = () => useEditorStore((state) => state.schema);

/**
 * 선택 상태만 구독
 */
export const useSelection = () => useEditorStore((state) => state.selection);

/**
 * 뷰포트 상태만 구독
 */
export const useViewport = () => useEditorStore((state) => state.viewport);
