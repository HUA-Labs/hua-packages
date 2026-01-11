"use client";

/**
 * SDUI Renderer
 *
 * JSON 스키마를 받아서 실제 React 컴포넌트로 렌더링
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import type {
  SDUINode,
  SDUIPageSchema,
  SDUIRendererProps,
  SDUIContext,
  SDUIAction,
  SDUICondition,
  SDUIComponentRegistry,
} from "./types";
import { defaultRegistry } from "./registry";

// SDUI Context
const SDUIContextInternal = createContext<SDUIContext | null>(null);

/**
 * SDUI Context Hook
 */
export function useSDUI(): SDUIContext {
  const context = useContext(SDUIContextInternal);
  if (!context) {
    throw new Error("useSDUI must be used within SDUIRenderer");
  }
  return context;
}

/**
 * 데이터 경로로 값 가져오기
 * 예: "user.profile.name" → data.user.profile.name
 */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * 데이터 경로로 값 설정하기
 */
function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const keys = path.split(".");
  const result = { ...obj };
  let current: Record<string, unknown> = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] as Record<string, unknown> || {}) };
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * 조건 평가
 */
function evaluateCondition(
  condition: SDUICondition,
  data: Record<string, unknown>
): boolean {
  const value = getByPath(data, condition.path);

  switch (condition.operator) {
    case "eq":
      return value === condition.value;
    case "neq":
      return value !== condition.value;
    case "gt":
      return typeof value === "number" && value > (condition.value as number);
    case "lt":
      return typeof value === "number" && value < (condition.value as number);
    case "gte":
      return typeof value === "number" && value >= (condition.value as number);
    case "lte":
      return typeof value === "number" && value <= (condition.value as number);
    case "exists":
      return value !== undefined && value !== null;
    case "notExists":
      return value === undefined || value === null;
    default:
      return true;
  }
}

/**
 * Props에서 데이터 바인딩 처리
 * {{ path }} 형식을 실제 데이터로 치환
 */
function resolveProps(
  props: Record<string, unknown>,
  data: Record<string, unknown>
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "string") {
      // {{ path }} 패턴 처리
      const bindingMatch = value.match(/^\{\{\s*(.+?)\s*\}\}$/);
      if (bindingMatch) {
        resolved[key] = getByPath(data, bindingMatch[1]);
      } else {
        // 문자열 내 부분 바인딩: "Hello, {{ user.name }}!"
        resolved[key] = value.replace(/\{\{\s*(.+?)\s*\}\}/g, (_, path) => {
          const val = getByPath(data, path);
          return val !== undefined ? String(val) : "";
        });
      }
    } else if (Array.isArray(value)) {
      resolved[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? resolveProps(item as Record<string, unknown>, data)
          : item
      );
    } else if (typeof value === "object" && value !== null) {
      resolved[key] = resolveProps(value as Record<string, unknown>, data);
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}

/**
 * 단일 노드 렌더러
 */
interface NodeRendererProps {
  node: SDUINode;
  registry: SDUIComponentRegistry;
}

function NodeRenderer({ node, registry }: NodeRendererProps) {
  const { data, handleAction } = useSDUI();

  // 조건부 렌더링 체크
  if (node.when && !evaluateCondition(node.when, data)) {
    return null;
  }

  // 컴포넌트 찾기
  const Component = registry[node.type];
  if (!Component) {
    console.warn(`[SDUI] Unknown component type: ${node.type}`);
    return (
      <div className="p-4 border border-destructive/50 bg-destructive/10 rounded text-sm text-destructive">
        Unknown component: {node.type}
      </div>
    );
  }

  // Props 처리
  const resolvedProps = node.props ? resolveProps(node.props, data) : {};

  // 이벤트 핸들러 처리
  const eventProps: Record<string, unknown> = {};
  if (node.on) {
    if (node.on.click) {
      eventProps.onClick = () => handleAction(node.on!.click!);
    }
    if (node.on.submit) {
      eventProps.onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAction(node.on!.submit!);
      };
    }
  }

  // Children 처리
  let children: React.ReactNode = null;
  if (node.children) {
    if (typeof node.children === "string") {
      // 문자열 바인딩 처리
      children = node.children.replace(/\{\{\s*(.+?)\s*\}\}/g, (_, path) => {
        const val = getByPath(data, path);
        return val !== undefined ? String(val) : "";
      });
    } else if (Array.isArray(node.children)) {
      children = node.children.map((child, index) => (
        <NodeRenderer
          key={child.key || `child-${index}`}
          node={child}
          registry={registry}
        />
      ));
    }
  }

  // void 엘리먼트는 children을 받지 않음
  const voidElements = ['Divider', 'Input', 'Textarea', 'Checkbox', 'Switch', 'Progress', 'Skeleton', 'Image', 'ScrollProgress'];
  const isVoidElement = voidElements.includes(node.type);

  if (isVoidElement || children === null) {
    return <Component {...resolvedProps} {...eventProps} />;
  }

  return (
    <Component {...resolvedProps} {...eventProps}>
      {children}
    </Component>
  );
}

/**
 * SDUI Renderer 메인 컴포넌트
 */
export function SDUIRenderer({
  schema,
  components,
  data: initialData = {},
  onAction,
  onNavigate,
}: SDUIRendererProps) {
  // 페이지 스키마인지 노드인지 확인
  const isPageSchema = "root" in schema;
  const rootNode = isPageSchema ? (schema as SDUIPageSchema).root : (schema as SDUINode);
  const schemaData = isPageSchema ? (schema as SDUIPageSchema).data : {};

  // 데이터 상태
  const [data, setDataState] = useState<Record<string, unknown>>({
    ...schemaData,
    ...initialData,
  });

  // 레지스트리 병합
  const registry = useMemo(
    () => ({ ...defaultRegistry, ...components }),
    [components]
  );

  // 데이터 업데이트
  const setData = useCallback((path: string, value: unknown) => {
    setDataState((prev) => setByPath(prev, path, value));
  }, []);

  // 네비게이션
  const navigate = useCallback(
    (path: string) => {
      if (onNavigate) {
        onNavigate(path);
      } else if (typeof window !== "undefined") {
        window.location.href = path;
      }
    },
    [onNavigate]
  );

  // 액션 핸들러
  const handleAction = useCallback(
    (action: SDUIAction) => {
      switch (action.type) {
        case "navigate":
          navigate(action.payload?.path as string);
          break;
        case "setState":
          if (action.payload?.path && action.payload?.value !== undefined) {
            setData(action.payload.path as string, action.payload.value);
          }
          break;
        case "api":
          // API 호출은 외부에서 처리
          onAction?.(action);
          break;
        case "custom":
          onAction?.(action);
          break;
        default:
          onAction?.(action);
      }
    },
    [navigate, setData, onAction]
  );

  // Context 값
  const contextValue: SDUIContext = useMemo(
    () => ({
      data,
      setData,
      handleAction,
      navigate,
    }),
    [data, setData, handleAction, navigate]
  );

  return (
    <SDUIContextInternal.Provider value={contextValue}>
      <NodeRenderer node={rootNode} registry={registry} />
    </SDUIContextInternal.Provider>
  );
}

/**
 * JSON 문자열에서 렌더링 (편의용)
 */
export function SDUIFromJSON({
  json,
  ...props
}: Omit<SDUIRendererProps, "schema"> & { json: string }) {
  try {
    const schema = JSON.parse(json);
    return <SDUIRenderer schema={schema} {...props} />;
  } catch (error) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 rounded">
        <p className="font-semibold text-destructive">SDUI Parse Error</p>
        <pre className="text-sm mt-2 text-destructive/80">
          {(error as Error).message}
        </pre>
      </div>
    );
  }
}
