"use client";

/**
 * Properties Panel
 *
 * 오른쪽 패널 - 선택된 컴포넌트의 속성 편집
 */

import { Icon, Input, Label, Button, cn } from "@hua-labs/ui";
import { useEditorStore, useSelectedNode } from "@/store";
import { getComponentMetadata } from "@/lib/component-metadata";
import type { PropSchema, EditorNode } from "@/types";

/**
 * 속성 필드 렌더러
 */
function PropertyField({
  schema,
  value,
  onChange,
}: {
  schema: PropSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `prop-${schema.name}`;

  switch (schema.type) {
    case "string":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id} className="text-xs">
            {schema.displayName}
          </Label>
          <Input
            id={id}
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={schema.defaultValue as string}
            className="h-8 text-sm"
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id} className="text-xs">
            {schema.displayName}
          </Label>
          <Input
            id={id}
            type="number"
            value={(value as number) ?? schema.defaultValue ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-8 text-sm"
          />
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-xs">
            {schema.displayName}
          </Label>
          <button
            id={id}
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => onChange(!value)}
            className={cn(
              "relative w-9 h-5 rounded-full transition-colors",
              value ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                Boolean(value) && "translate-x-4"
              )}
            />
          </button>
        </div>
      );

    case "select":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={id} className="text-xs">
            {schema.displayName}
          </Label>
          <select
            id={id}
            value={String(value ?? schema.defaultValue ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 px-2 text-sm bg-background border border-input rounded-md"
          >
            {schema.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    default:
      return (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {schema.displayName}
          </Label>
          <p className="text-xs text-muted-foreground">
            미지원 타입: {schema.type}
          </p>
        </div>
      );
  }
}

/**
 * 자식 텍스트 편집기
 */
function ChildrenEditor({
  node,
  onUpdate,
}: {
  node: EditorNode;
  onUpdate: (children: string) => void;
}) {
  if (typeof node.children !== "string") return null;

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">텍스트 내용</Label>
      <Input
        type="text"
        value={node.children}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="텍스트 입력..."
        className="h-8 text-sm"
      />
    </div>
  );
}

/**
 * 속성 패널
 */
export function PropertiesPanel() {
  const selectedNode = useSelectedNode();
  const { updateProps, updateChildren, deleteNode, duplicateNode } =
    useEditorStore();

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="text-sm font-medium">속성</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
          <Icon name="user" size={32} className="mb-2 opacity-30" />
          <p className="text-sm text-center">
            컴포넌트를 선택하면
            <br />
            속성을 편집할 수 있어요
          </p>
        </div>
      </div>
    );
  }

  const metadata = getComponentMetadata(selectedNode.type);

  const handlePropChange = (name: string, value: unknown) => {
    updateProps(selectedNode.id, { [name]: value });
  };

  const handleChildrenChange = (children: string) => {
    updateChildren(selectedNode.id, children);
  };

  // 그룹별로 props 분류
  const propsByGroup = metadata?.propSchema.reduce(
    (acc, prop) => {
      const group = prop.group || "기본";
      if (!acc[group]) acc[group] = [];
      acc[group].push(prop);
      return acc;
    },
    {} as Record<string, PropSchema[]>
  ) || {};

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">속성</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {metadata?.displayName || selectedNode.type}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => duplicateNode(selectedNode.id)}
              title="복제"
            >
              <Icon name="copy" size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteNode(selectedNode.id)}
              title="삭제"
              className="text-destructive hover:text-destructive"
            >
              <Icon name="delete" size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* 속성 목록 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* 텍스트 자식 편집 */}
        {metadata?.childrenType === "text" && (
          <div className="pb-3 border-b border-border">
            <ChildrenEditor node={selectedNode} onUpdate={handleChildrenChange} />
          </div>
        )}

        {/* 그룹별 속성 */}
        {Object.entries(propsByGroup).map(([group, props]) => (
          <div key={group} className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group}
            </h3>
            {props.map((prop) => (
              <PropertyField
                key={prop.name}
                schema={prop}
                value={selectedNode.props?.[prop.name]}
                onChange={(value) => handlePropChange(prop.name, value)}
              />
            ))}
          </div>
        ))}

        {/* 노드 정보 */}
        <div className="pt-3 border-t border-border space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            정보
          </h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>타입: {selectedNode.type}</p>
            <p>ID: {selectedNode.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertiesPanel;
