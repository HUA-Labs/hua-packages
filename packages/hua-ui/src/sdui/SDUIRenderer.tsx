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
  SDUIComponentRegistry,
  SDUIConstraints,
} from "./types";
import { defaultRegistry } from "./registry";
import {
  evaluateCondition,
  resolveProps,
  resolveTextBindings,
  resolveDotString,
  iterateEach,
  setByPath,
} from "./core";

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
 * Scoped data provider for each iteration
 */
function ScopedDataProvider({
  data,
  children,
}: {
  data: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const parentCtx = useSDUI();
  const scopedCtx = useMemo(
    () => ({ ...parentCtx, data }),
    [parentCtx, data]
  );
  return (
    <SDUIContextInternal.Provider value={scopedCtx}>
      {children}
    </SDUIContextInternal.Provider>
  );
}

/**
 * constraints → HTML 속성 매핑
 */
function resolveConstraints(
  constraints: SDUIConstraints
): { attrs: Record<string, unknown>; style: React.CSSProperties } {
  const attrs: Record<string, unknown> = {};
  const style: React.CSSProperties = {};

  if (constraints.role) attrs.role = constraints.role;
  if (constraints.label) attrs["aria-label"] = constraints.label;
  if (constraints.level !== undefined) attrs["aria-level"] = constraints.level;
  if (constraints.hidden !== undefined) attrs["aria-hidden"] = constraints.hidden;

  if (constraints.minTapTarget !== undefined) {
    style.minWidth = constraints.minTapTarget;
    style.minHeight = constraints.minTapTarget;
  }
  if (constraints.truncate !== undefined) {
    style.overflow = "hidden";
    style.display = "-webkit-box";
    style.WebkitLineClamp = constraints.truncate;
    style.WebkitBoxOrient = "vertical";
  }

  return { attrs, style };
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

  // each 처리: 배열 반복 렌더링
  if (node.each) {
    const iterations = iterateEach(node.each, data);
    if (iterations.length === 0) return null;

    return (
      <>
        {iterations.map(({ scopedData, key }) => (
          <ScopedDataProvider key={key} data={scopedData}>
            <NodeRendererInner node={node} registry={registry} />
          </ScopedDataProvider>
        ))}
      </>
    );
  }

  return <NodeRendererInner node={node} registry={registry} />;
}

/**
 * 내부 노드 렌더러 (each 처리 이후)
 */
function NodeRendererInner({ node, registry }: NodeRendererProps) {
  const { data, handleAction } = useSDUI();

  // 컴포넌트 찾기
  const Component = registry[node.type];
  if (!Component) {
    console.warn(`[SDUI] Unknown component type: ${node.type}`);
    return (
      <div style={{ padding: 16, border: "1px solid #ef4444", borderRadius: 4, fontSize: 14, color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)" }}>
        Unknown component: {node.type}
      </div>
    );
  }

  // Props 처리
  const resolvedProps = node.props ? resolveProps(node.props, data) : {};

  // dot 처리: 바인딩 resolve 후 props에 주입
  if (node.dot) {
    resolvedProps.dot = resolveDotString(node.dot, data);
  }

  // constraints → aria-* + style 매핑
  if (node.constraints) {
    const { attrs, style: constraintStyle } = resolveConstraints(node.constraints);
    Object.assign(resolvedProps, attrs);
    if (Object.keys(constraintStyle).length > 0) {
      resolvedProps.style = { ...(resolvedProps.style as React.CSSProperties || {}), ...constraintStyle };
    }
  }

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
      children = resolveTextBindings(node.children, data);
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
      <div style={{ padding: 16, border: "1px solid #ef4444", borderRadius: 4, backgroundColor: "rgba(239,68,68,0.1)" }}>
        <p style={{ fontWeight: 600, color: "#ef4444" }}>SDUI Parse Error</p>
        <pre style={{ fontSize: 14, marginTop: 8, color: "rgba(239,68,68,0.8)" }}>
          {(error as Error).message}
        </pre>
      </div>
    );
  }
}
