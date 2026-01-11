"use client";

/**
 * SDUI Visual Editor - 메인 페이지
 *
 * 드래그앤드롭으로 UI를 만들고 JSON 스키마로 내보내는 비주얼 에디터
 */

import { useEffect, useState } from "react";
import { EditorLayout, Canvas } from "@/components/editor";
import { EditorToolbar } from "@/components/toolbar";
import { ComponentPalette, PropertiesPanel } from "@/components/panels";
import { useEditorStore, setupHistorySync, useProjectStore } from "@/store";

/**
 * JSON 스키마 뷰어 (하단 패널)
 */
function SchemaViewer() {
  const schema = useEditorStore((s) => s.schema);
  const { exportToJson } = useProjectStore();

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
          {exportToJson()}
        </pre>
      </div>
    </div>
  );
}

export default function EditorPage() {
  const [schemaViewerOpen, setSchemaViewerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { createProject, currentProjectId, loadProject } = useProjectStore();

  // Hydration 체크
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 히스토리 동기화 설정
  useEffect(() => {
    const unsubscribe = setupHistorySync();
    return () => unsubscribe();
  }, []);

  // 프로젝트가 없으면 기본 프로젝트 생성 (hydration 이후에만)
  useEffect(() => {
    if (!isHydrated) return;

    if (!currentProjectId) {
      createProject("새 프로젝트");
    } else {
      // 기존 프로젝트 로드
      loadProject(currentProjectId);
    }
  }, [isHydrated, currentProjectId, createProject, loadProject]);

  return (
    <EditorLayout
      toolbar={
        <EditorToolbar
          onToggleSchemaViewer={() => setSchemaViewerOpen((prev) => !prev)}
          schemaViewerOpen={schemaViewerOpen}
        />
      }
      leftPanel={<ComponentPalette />}
      centerPanel={<Canvas />}
      rightPanel={<PropertiesPanel />}
      bottomPanel={<SchemaViewer />}
      bottomPanelOpen={schemaViewerOpen}
    />
  );
}
