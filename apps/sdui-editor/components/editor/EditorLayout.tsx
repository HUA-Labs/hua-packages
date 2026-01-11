"use client";

/**
 * Editor Layout
 *
 * 3패널 리사이저블 레이아웃
 * - 왼쪽: 컴포넌트 팔레트
 * - 중앙: 캔버스
 * - 오른쪽: 속성 패널
 */

import { useState, useCallback, useRef, type ReactNode } from "react";
import { cn } from "@hua-labs/ui";

interface EditorLayoutProps {
  /** 왼쪽 패널 (컴포넌트 팔레트) */
  leftPanel: ReactNode;
  /** 중앙 패널 (캔버스) */
  centerPanel: ReactNode;
  /** 오른쪽 패널 (속성) */
  rightPanel: ReactNode;
  /** 상단 툴바 */
  toolbar?: ReactNode;
  /** 하단 패널 (JSON 뷰어) */
  bottomPanel?: ReactNode;
  /** 하단 패널 열림 상태 */
  bottomPanelOpen?: boolean;
}

/**
 * 리사이즈 핸들
 */
function ResizeHandle({
  orientation,
  onResize,
}: {
  orientation: "vertical" | "horizontal";
  onResize: (delta: number) => void;
}) {
  const isDragging = useRef(false);
  const startPos = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startPos.current = orientation === "vertical" ? e.clientX : e.clientY;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;
        const currentPos =
          orientation === "vertical" ? moveEvent.clientX : moveEvent.clientY;
        const delta = currentPos - startPos.current;
        startPos.current = currentPos;
        onResize(delta);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [orientation, onResize]
  );

  return (
    <div
      className={cn(
        "flex-shrink-0 bg-border hover:bg-primary/20 transition-colors",
        orientation === "vertical"
          ? "w-1 cursor-col-resize"
          : "h-1 cursor-row-resize"
      )}
      onMouseDown={handleMouseDown}
    />
  );
}

/**
 * 에디터 레이아웃
 */
export function EditorLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  toolbar,
  bottomPanel,
  bottomPanelOpen = false,
}: EditorLayoutProps) {
  // 패널 너비 (픽셀)
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(280);
  const [bottomHeight, setBottomHeight] = useState(200);

  // 최소/최대 크기
  const MIN_PANEL_WIDTH = 200;
  const MAX_PANEL_WIDTH = 400;
  const MIN_BOTTOM_HEIGHT = 100;
  const MAX_BOTTOM_HEIGHT = 400;

  const handleLeftResize = useCallback((delta: number) => {
    setLeftWidth((prev) =>
      Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, prev + delta))
    );
  }, []);

  const handleRightResize = useCallback((delta: number) => {
    setRightWidth((prev) =>
      Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, prev - delta))
    );
  }, []);

  const handleBottomResize = useCallback((delta: number) => {
    setBottomHeight((prev) =>
      Math.max(MIN_BOTTOM_HEIGHT, Math.min(MAX_BOTTOM_HEIGHT, prev - delta))
    );
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 툴바 */}
      {toolbar && (
        <div className="flex-shrink-0 border-b border-border">{toolbar}</div>
      )}

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 패널 */}
        <div
          className="flex-shrink-0 border-r border-border editor-panel overflow-hidden"
          style={{ width: leftWidth }}
        >
          {leftPanel}
        </div>

        {/* 왼쪽 리사이즈 핸들 */}
        <ResizeHandle orientation="vertical" onResize={handleLeftResize} />

        {/* 중앙 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 캔버스 */}
          <div className="flex-1 overflow-hidden">{centerPanel}</div>

          {/* 하단 패널 토글 영역 */}
          {bottomPanel && bottomPanelOpen && (
            <>
              <ResizeHandle
                orientation="horizontal"
                onResize={handleBottomResize}
              />
              <div
                className="flex-shrink-0 border-t border-border overflow-hidden"
                style={{ height: bottomHeight }}
              >
                {bottomPanel}
              </div>
            </>
          )}
        </div>

        {/* 오른쪽 리사이즈 핸들 */}
        <ResizeHandle orientation="vertical" onResize={handleRightResize} />

        {/* 오른쪽 패널 */}
        <div
          className="flex-shrink-0 border-l border-border editor-panel overflow-hidden"
          style={{ width: rightWidth }}
        >
          {rightPanel}
        </div>
      </div>
    </div>
  );
}

export default EditorLayout;
