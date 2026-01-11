"use client";

/**
 * Component Palette
 *
 * 왼쪽 패널 - 드래그 가능한 컴포넌트 목록
 */

import { useState } from "react";
import { Icon, Input, cn } from "@hua-labs/ui";
import {
  componentsByCategory,
  categoryInfo,
  categoryOrder,
} from "@/lib/component-metadata";
import type { ComponentCategory, ComponentMetadata } from "@/types";

interface ComponentPaletteProps {
  onDragStart?: (componentType: string, metadata: ComponentMetadata) => void;
  onDragEnd?: () => void;
}

/**
 * 팔레트 아이템
 */
function PaletteItem({
  metadata,
  onDragStart,
  onDragEnd,
}: {
  metadata: ComponentMetadata;
  onDragStart?: (componentType: string, metadata: ComponentMetadata) => void;
  onDragEnd?: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("componentType", metadata.type);
        e.dataTransfer.effectAllowed = "copy";
        onDragStart?.(metadata.type, metadata);
      }}
      onDragEnd={() => {
        onDragEnd?.();
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2",
        "bg-card border border-border rounded-md",
        "cursor-grab active:cursor-grabbing",
        "hover:border-primary/50 hover:bg-accent/50",
        "transition-colors",
        metadata.isPro && "border-dashed"
      )}
      title={metadata.description}
    >
      <Icon
        name={metadata.icon as "folder"}
        size={18}
        className={cn(
          "text-muted-foreground",
          metadata.isPro && "text-primary"
        )}
      />
      <span className="text-xs text-center leading-tight">
        {metadata.displayName}
      </span>
      {metadata.isPro && (
        <span className="text-[10px] text-primary font-medium">PRO</span>
      )}
    </div>
  );
}

/**
 * 카테고리 섹션
 */
function CategorySection({
  category,
  components,
  collapsed,
  onToggle,
  onDragStart,
  onDragEnd,
}: {
  category: ComponentCategory;
  components: ComponentMetadata[];
  collapsed: boolean;
  onToggle: () => void;
  onDragStart?: (componentType: string, metadata: ComponentMetadata) => void;
  onDragEnd?: () => void;
}) {
  const info = categoryInfo[category];

  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-1 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        <Icon
          name={collapsed ? "chevronRight" : "chevronDown"}
          size={12}
        />
        <Icon name={info.icon as "folder"} size={14} />
        <span>{info.displayName}</span>
        <span className="ml-auto text-[10px] font-normal">
          {components.length}
        </span>
      </button>

      {!collapsed && (
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {components.map((comp) => (
            <PaletteItem
              key={comp.type}
              metadata={comp}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 컴포넌트 팔레트
 */
export function ComponentPalette({
  onDragStart,
  onDragEnd,
}: ComponentPaletteProps) {
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<
    Set<ComponentCategory>
  >(new Set());

  const toggleCategory = (category: ComponentCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // 검색 필터링
  const filteredByCategory = categoryOrder.reduce(
    (acc, category) => {
      const components = componentsByCategory[category].filter(
        (c) =>
          c.displayName.toLowerCase().includes(search.toLowerCase()) ||
          c.type.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      );
      if (components.length > 0) {
        acc[category] = components;
      }
      return acc;
    },
    {} as Record<ComponentCategory, ComponentMetadata[]>
  );

  const hasResults = Object.keys(filteredByCategory).length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-3 border-b border-border">
        <h2 className="text-sm font-medium mb-2">컴포넌트</h2>
        <div className="relative">
          <Icon
            name="search"
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* 컴포넌트 목록 */}
      <div className="flex-1 p-3 overflow-y-auto">
        {hasResults ? (
          categoryOrder.map((category) => {
            const components = filteredByCategory[category];
            if (!components) return null;

            return (
              <CategorySection
                key={category}
                category={category}
                components={components}
                collapsed={collapsedCategories.has(category)}
                onToggle={() => toggleCategory(category)}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Icon name="search" size={24} className="mb-2 opacity-30" />
            <p className="text-sm">검색 결과가 없어요</p>
          </div>
        )}
      </div>

      {/* 푸터 힌트 */}
      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          드래그해서 캔버스에 놓으세요
        </p>
      </div>
    </div>
  );
}

export default ComponentPalette;
