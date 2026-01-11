/**
 * History Store
 *
 * Undo/Redo 히스토리 관리
 */

import { create } from "zustand";
import type { EditorNode, HistoryEntry } from "@/types";
import { useEditorStore } from "./editor-store";

/**
 * 히스토리 설정
 */
const MAX_HISTORY_SIZE = 50;

/**
 * 히스토리 상태
 */
interface HistoryState {
  /** 과거 스냅샷 (undo용) */
  past: HistoryEntry[];
  /** 미래 스냅샷 (redo용) */
  future: HistoryEntry[];
  /** 마지막 저장 시점 */
  lastSavedIndex: number;
}

/**
 * 히스토리 액션
 */
interface HistoryActions {
  /** 현재 상태를 히스토리에 푸시 */
  push: (schema: EditorNode, description?: string) => void;
  /** Undo */
  undo: () => void;
  /** Redo */
  redo: () => void;
  /** 히스토리 초기화 */
  clear: () => void;
  /** 저장 완료 표시 */
  markSaved: () => void;
  /** 변경사항 있는지 확인 */
  hasUnsavedChanges: () => boolean;
}

/**
 * 계산된 값
 */
interface HistoryComputed {
  /** Undo 가능 여부 */
  canUndo: boolean;
  /** Redo 가능 여부 */
  canRedo: boolean;
  /** 히스토리 길이 */
  historyLength: number;
}

/**
 * 초기 상태
 */
const initialState: HistoryState = {
  past: [],
  future: [],
  lastSavedIndex: -1,
};

/**
 * 히스토리 스토어
 */
export const useHistoryStore = create<HistoryState & HistoryActions & HistoryComputed>(
  (set, get) => ({
    ...initialState,

    // 계산된 값
    canUndo: false,
    canRedo: false,
    historyLength: 0,

    // 현재 상태를 히스토리에 푸시
    push: (schema, description) =>
      set((state) => {
        const entry: HistoryEntry = {
          schema: JSON.parse(JSON.stringify(schema)), // 깊은 복사
          timestamp: Date.now(),
          description,
        };

        // 새 푸시하면 future는 클리어
        const newPast = [...state.past, entry];

        // 최대 크기 제한
        if (newPast.length > MAX_HISTORY_SIZE) {
          newPast.shift();
        }

        return {
          past: newPast,
          future: [],
          canUndo: newPast.length > 0,
          canRedo: false,
          historyLength: newPast.length,
        };
      }),

    // Undo
    undo: () => {
      const state = get();
      if (state.past.length === 0) return;

      // 현재 상태를 future에 저장
      const currentSchema = useEditorStore.getState().schema;
      const currentEntry: HistoryEntry = {
        schema: JSON.parse(JSON.stringify(currentSchema)),
        timestamp: Date.now(),
      };

      // 과거에서 마지막 항목 꺼내기
      const newPast = [...state.past];
      const previousEntry = newPast.pop()!;

      // 에디터 스토어 업데이트
      useEditorStore.getState().setSchema(previousEntry.schema);

      set({
        past: newPast,
        future: [currentEntry, ...state.future],
        canUndo: newPast.length > 0,
        canRedo: true,
        historyLength: newPast.length,
      });
    },

    // Redo
    redo: () => {
      const state = get();
      if (state.future.length === 0) return;

      // 현재 상태를 past에 저장
      const currentSchema = useEditorStore.getState().schema;
      const currentEntry: HistoryEntry = {
        schema: JSON.parse(JSON.stringify(currentSchema)),
        timestamp: Date.now(),
      };

      // 미래에서 첫 번째 항목 꺼내기
      const [nextEntry, ...newFuture] = state.future;

      // 에디터 스토어 업데이트
      useEditorStore.getState().setSchema(nextEntry.schema);

      set({
        past: [...state.past, currentEntry],
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
        historyLength: state.past.length + 1,
      });
    },

    // 히스토리 초기화
    clear: () =>
      set({
        ...initialState,
        canUndo: false,
        canRedo: false,
        historyLength: 0,
      }),

    // 저장 완료 표시
    markSaved: () =>
      set((state) => ({
        lastSavedIndex: state.past.length,
      })),

    // 변경사항 있는지 확인
    hasUnsavedChanges: () => {
      const state = get();
      return state.past.length !== state.lastSavedIndex;
    },
  })
);

/**
 * 에디터 스토어와 히스토리 연동
 *
 * 에디터 스토어의 변경사항을 자동으로 히스토리에 기록
 * 사용법: 컴포넌트에서 useHistorySync() 호출
 */
let isUndoRedo = false;

export function setupHistorySync() {
  // 스키마 변경 감지
  return useEditorStore.subscribe(
    (state) => state.schema,
    (schema) => {
      // undo/redo 중에는 히스토리에 추가하지 않음
      if (isUndoRedo) {
        isUndoRedo = false;
        return;
      }
      useHistoryStore.getState().push(schema);
    }
  );
}

/**
 * Undo 실행 (플래그 설정)
 */
export function performUndo() {
  isUndoRedo = true;
  useHistoryStore.getState().undo();
}

/**
 * Redo 실행 (플래그 설정)
 */
export function performRedo() {
  isUndoRedo = true;
  useHistoryStore.getState().redo();
}

/**
 * 셀렉터
 */
export const useCanUndo = () => useHistoryStore((state) => state.canUndo);
export const useCanRedo = () => useHistoryStore((state) => state.canRedo);
export const useHistoryLength = () => useHistoryStore((state) => state.historyLength);
