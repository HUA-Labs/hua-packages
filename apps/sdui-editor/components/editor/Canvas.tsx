"use client";

/**
 * Canvas
 *
 * 중앙 캔버스 영역 - 드롭존 + 라이브 프리뷰
 */

import { useCallback, type DragEvent } from "react";
import { Icon, cn } from "@hua-labs/ui";
import { SDUIRenderer } from "@hua-labs/ui/sdui";
import {
  useEditorStore,
  useSchema,
  useSelection,
  useViewport,
} from "@/store";
import { createNode } from "@/lib/schema-utils";
import { getComponentMetadata } from "@/lib/component-metadata";
import type { EditorNode } from "@/types";

interface CanvasProps {
  className?: string;
}

/**
 * 노드 오버레이 (선택/호버 표시용)
 */
function NodeOverlay({
  node,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  depth = 0,
}: {
  node: EditorNode;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  depth?: number;
}) {
  const metadata = getComponentMetadata(node.type);

  return (
    <div
      className={cn(
        "relative group",
        isSelected && "ring-2 ring-primary ring-offset-1",
        isHovered && !isSelected && "ring-1 ring-primary/50"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* 선택 레이블 */}
      {(isSelected || isHovered) && (
        <div
          className={cn(
            "absolute -top-5 left-0 px-1.5 py-0.5 text-[10px] font-medium rounded-sm z-10",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {metadata?.displayName || node.type}
        </div>
      )}
    </div>
  );
}

/**
 * 캔버스
 */
export function Canvas({ className }: CanvasProps) {
  const schema = useSchema();
  const selection = useSelection();
  const viewport = useViewport();
  const { select, addNode, setHover, clearHover } = useEditorStore();

  // 드롭 처리
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const componentType = e.dataTransfer.getData("componentType");
      if (!componentType) return;

      const metadata = getComponentMetadata(componentType);
      if (!metadata) return;

      // 새 노드 생성
      const defaultChildren = metadata.childrenType === "text"
        ? metadata.displayName
        : metadata.allowsChildren
          ? []
          : undefined;

      const newNode = createNode(
        componentType,
        metadata.defaultProps,
        defaultChildren
      );

      // 선택된 노드가 있고 자식을 허용하면 거기에 추가, 아니면 루트에 추가
      const targetId = selection.nodeId || schema.id;
      addNode(targetId, newNode);
      select(newNode.id);
    },
    [schema.id, selection.nodeId, addNode, select]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // 빈 캔버스 체크
  const isEmpty =
    !schema.children ||
    (Array.isArray(schema.children) && schema.children.length === 0);

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* 캔버스 영역 */}
      <div
        className="flex-1 editor-canvas overflow-auto p-8"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => select(null)} // 빈 곳 클릭시 선택 해제
      >
        <div
          className="min-h-full bg-card rounded-lg border border-border shadow-sm transition-transform origin-top-left"
          style={{
            transform: `scale(${viewport.zoom})`,
            width: `${100 / viewport.zoom}%`,
          }}
        >
          {isEmpty ? (
            // 빈 캔버스 상태
            <div
              className="h-96 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg m-4"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-primary", "bg-primary/5");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("border-primary", "bg-primary/5");
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove("border-primary", "bg-primary/5");
                handleDrop(e);
              }}
            >
              <Icon name="add" size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">캔버스가 비어있어요</p>
              <p className="text-sm">왼쪽에서 컴포넌트를 드래그해서 놓아주세요</p>
            </div>
          ) : (
            // 라이브 프리뷰
            <div
              className="p-4 min-h-[200px]"
              onClick={(e) => e.stopPropagation()}
            >
              <SDUIRenderer
                schema={{
                  type: schema.type,
                  props: schema.props,
                  children: schema.children as any,
                  key: schema.id,
                }}
                onAction={(action) => {
                  console.log("SDUI Action:", action);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Canvas;
