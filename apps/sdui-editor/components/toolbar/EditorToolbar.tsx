"use client";

/**
 * Editor Toolbar
 *
 * 상단 툴바 - undo/redo, zoom, save 등
 */

import { Icon, Button } from "@hua-labs/ui";
import {
  useEditorStore,
  useViewport,
  useHistoryStore,
  useCanUndo,
  useCanRedo,
  performUndo,
  performRedo,
  useProjectStore,
  useCurrentProject,
} from "@/store";

interface EditorToolbarProps {
  onToggleSchemaViewer?: () => void;
  schemaViewerOpen?: boolean;
}

export function EditorToolbar({
  onToggleSchemaViewer,
  schemaViewerOpen,
}: EditorToolbarProps) {
  const { zoomIn, zoomOut, resetZoom } = useEditorStore();
  const viewport = useViewport();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const currentProject = useCurrentProject();
  const { saveProject, exportToJson } = useProjectStore();
  const hasUnsavedChanges = useHistoryStore((s) => s.hasUnsavedChanges());

  const handleSave = () => {
    saveProject();
  };

  const handleExport = () => {
    const json = exportToJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentProject?.name || "schema"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const zoomPercent = Math.round(viewport.zoom * 100);

  return (
    <header className="h-12 bg-card flex items-center px-4 gap-2">
      {/* 로고 */}
      <div className="flex items-center gap-2 mr-4">
        <Icon name="edit" size={20} className="text-primary" />
        <span className="font-semibold">SDUI Editor</span>
        {currentProject && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">
              {currentProject.name}
            </span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-primary" title="저장되지 않음" />
            )}
          </>
        )}
      </div>

      <div className="flex-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={performUndo}
          disabled={!canUndo}
          title="실행 취소 (Ctrl+Z)"
        >
          <Icon name="arrowLeft" size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={performRedo}
          disabled={!canRedo}
          title="다시 실행 (Ctrl+Y)"
        >
          <Icon name="arrowRight" size={16} />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={zoomOut} title="축소">
          <Icon name="search" size={16} />
        </Button>
        <button
          className="text-xs text-muted-foreground w-14 text-center hover:text-foreground"
          onClick={resetZoom}
          title="줌 리셋"
        >
          {zoomPercent}%
        </button>
        <Button variant="ghost" size="sm" onClick={zoomIn} title="확대">
          <Icon name="search" size={16} />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      {/* JSON 토글 */}
      <Button
        variant={schemaViewerOpen ? "secondary" : "ghost"}
        size="sm"
        onClick={onToggleSchemaViewer}
        title="JSON 스키마 보기"
      >
        <Icon name="fileText" size={16} />
        <span className="ml-1.5 text-xs">JSON</span>
      </Button>

      <div className="w-px h-6 bg-border mx-2" />

      {/* 저장 & 내보내기 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={!currentProject}
        title="저장 (Ctrl+S)"
      >
        <Icon name="save" size={16} />
        <span className="ml-1.5 text-xs">저장</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={handleExport} title="JSON 내보내기">
        <Icon name="download" size={16} />
        <span className="ml-1.5 text-xs">내보내기</span>
      </Button>
    </header>
  );
}

export default EditorToolbar;
