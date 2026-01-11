/**
 * Project Store
 *
 * 프로젝트 저장/로드 (localStorage)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, EditorNode } from "@/types";
import { editorNodeToSDUI, sduiToEditorNode } from "@/types";
import { generateProjectId, generateNodeId } from "@/lib/id-utils";
import { createEmptyRoot } from "@/lib/schema-utils";
import { useEditorStore } from "./editor-store";
import { useHistoryStore } from "./history-store";

/**
 * 프로젝트 상태
 */
interface ProjectState {
  /** 저장된 프로젝트 목록 */
  projects: Project[];
  /** 현재 열린 프로젝트 ID */
  currentProjectId: string | null;
  /** 마지막 업데이트 시간 */
  lastUpdated: number;
}

/**
 * 프로젝트 액션
 */
interface ProjectActions {
  /** 새 프로젝트 생성 */
  createProject: (name: string) => string;
  /** 프로젝트 저장 */
  saveProject: (id?: string, name?: string) => void;
  /** 프로젝트 로드 */
  loadProject: (id: string) => void;
  /** 프로젝트 삭제 */
  deleteProject: (id: string) => void;
  /** 프로젝트 이름 변경 */
  renameProject: (id: string, name: string) => void;
  /** 프로젝트 복제 */
  duplicateProject: (id: string) => string;
  /** JSON으로 내보내기 */
  exportToJson: () => string;
  /** JSON에서 가져오기 */
  importFromJson: (json: string) => void;
  /** 현재 프로젝트 가져오기 */
  getCurrentProject: () => Project | null;
}

/**
 * 초기 상태
 */
const initialState: ProjectState = {
  projects: [],
  currentProjectId: null,
  lastUpdated: Date.now(),
};

/**
 * 프로젝트 스토어
 */
export const useProjectStore = create<ProjectState & ProjectActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 새 프로젝트 생성
      createProject: (name) => {
        const id = generateProjectId();
        const now = Date.now();

        const project: Project = {
          id,
          name,
          root: createEmptyRoot(),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          projects: [...state.projects, project],
          currentProjectId: id,
          lastUpdated: now,
        }));

        // 에디터 스토어 초기화
        useEditorStore.getState().setSchema(project.root);
        useHistoryStore.getState().clear();

        return id;
      },

      // 프로젝트 저장
      saveProject: (id, name) => {
        const state = get();
        const projectId = id || state.currentProjectId;
        if (!projectId) return;

        const currentSchema = useEditorStore.getState().schema;
        const now = Date.now();

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  root: JSON.parse(JSON.stringify(currentSchema)),
                  name: name || p.name,
                  updatedAt: now,
                }
              : p
          ),
          lastUpdated: now,
        }));

        // 저장 완료 표시
        useHistoryStore.getState().markSaved();
      },

      // 프로젝트 로드
      loadProject: (id) => {
        const state = get();
        const project = state.projects.find((p) => p.id === id);
        if (!project) return;

        set({ currentProjectId: id });

        // 에디터 스토어에 스키마 로드
        useEditorStore.getState().setSchema(
          JSON.parse(JSON.stringify(project.root))
        );

        // 히스토리 초기화
        useHistoryStore.getState().clear();
        useHistoryStore.getState().markSaved();
      },

      // 프로젝트 삭제
      deleteProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter((p) => p.id !== id);
          const newCurrentId =
            state.currentProjectId === id
              ? newProjects[0]?.id || null
              : state.currentProjectId;

          // 삭제된 프로젝트가 현재 프로젝트면 다른 거 로드
          if (state.currentProjectId === id && newCurrentId) {
            const nextProject = newProjects.find((p) => p.id === newCurrentId);
            if (nextProject) {
              useEditorStore.getState().setSchema(
                JSON.parse(JSON.stringify(nextProject.root))
              );
            }
          } else if (!newCurrentId) {
            useEditorStore.getState().resetSchema();
          }

          return {
            projects: newProjects,
            currentProjectId: newCurrentId,
            lastUpdated: Date.now(),
          };
        });
      },

      // 프로젝트 이름 변경
      renameProject: (id, name) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: Date.now() } : p
          ),
          lastUpdated: Date.now(),
        }));
      },

      // 프로젝트 복제
      duplicateProject: (id) => {
        const state = get();
        const project = state.projects.find((p) => p.id === id);
        if (!project) return "";

        const newId = generateProjectId();
        const now = Date.now();

        // 노드 ID도 새로 생성
        const cloneWithNewIds = (node: EditorNode): EditorNode => ({
          ...node,
          id: generateNodeId(),
          children: node.children
            ? typeof node.children === "string"
              ? node.children
              : node.children.map(cloneWithNewIds)
            : undefined,
        });

        const newProject: Project = {
          id: newId,
          name: `${project.name} (복사본)`,
          root: cloneWithNewIds(project.root),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          lastUpdated: now,
        }));

        return newId;
      },

      // JSON으로 내보내기
      exportToJson: () => {
        const schema = useEditorStore.getState().schema;
        const sduiSchema = editorNodeToSDUI(schema);
        return JSON.stringify(sduiSchema, null, 2);
      },

      // JSON에서 가져오기
      importFromJson: (json) => {
        try {
          const parsed = JSON.parse(json);
          const editorNode = sduiToEditorNode(parsed, generateNodeId);
          useEditorStore.getState().setSchema(editorNode);
          useHistoryStore.getState().clear();
        } catch (error) {
          console.error("JSON 파싱 오류:", error);
          throw new Error("올바른 JSON 형식이 아닙니다.");
        }
      },

      // 현재 프로젝트 가져오기
      getCurrentProject: () => {
        const state = get();
        if (!state.currentProjectId) return null;
        return state.projects.find((p) => p.id === state.currentProjectId) || null;
      },
    }),
    {
      name: "sdui-editor-projects",
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
      }),
    }
  )
);

/**
 * 셀렉터
 */
export const useProjects = () => useProjectStore((state) => state.projects);
export const useCurrentProjectId = () =>
  useProjectStore((state) => state.currentProjectId);
export const useCurrentProject = () => {
  const projects = useProjectStore((state) => state.projects);
  const currentId = useProjectStore((state) => state.currentProjectId);
  return projects.find((p) => p.id === currentId) || null;
};
