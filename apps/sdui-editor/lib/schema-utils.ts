/**
 * Schema Utilities
 *
 * EditorNode 스키마 조작 유틸리티
 */

import type { EditorNode } from "@/types";
import { generateNodeId } from "./id-utils";

/**
 * 노드 ID로 노드 찾기 (DFS)
 */
export function findNodeById(
  root: EditorNode,
  id: string
): EditorNode | null {
  if (root.id === id) return root;

  if (root.children && Array.isArray(root.children)) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }

  return null;
}

/**
 * 부모 노드 찾기
 */
export function findParentNode(
  root: EditorNode,
  childId: string
): EditorNode | null {
  if (root.children && Array.isArray(root.children)) {
    for (const child of root.children) {
      if (child.id === childId) return root;
      const found = findParentNode(child, childId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * 노드 경로 찾기 (루트부터 해당 노드까지)
 */
export function findNodePath(
  root: EditorNode,
  id: string,
  path: string[] = []
): string[] | null {
  if (root.id === id) return [...path, id];

  if (root.children && Array.isArray(root.children)) {
    for (const child of root.children) {
      const found = findNodePath(child, id, [...path, root.id]);
      if (found) return found;
    }
  }

  return null;
}

/**
 * 노드 업데이트 (immutable)
 */
export function updateNode(
  root: EditorNode,
  id: string,
  updater: (node: EditorNode) => EditorNode
): EditorNode {
  if (root.id === id) {
    return updater(root);
  }

  if (root.children && Array.isArray(root.children)) {
    return {
      ...root,
      children: root.children.map((child) => updateNode(child, id, updater)),
    };
  }

  return root;
}

/**
 * 노드 props 업데이트
 */
export function updateNodeProps(
  root: EditorNode,
  id: string,
  props: Record<string, unknown>
): EditorNode {
  return updateNode(root, id, (node) => ({
    ...node,
    props: { ...node.props, ...props },
  }));
}

/**
 * 노드 children 업데이트 (텍스트)
 */
export function updateNodeChildren(
  root: EditorNode,
  id: string,
  children: string | EditorNode[]
): EditorNode {
  return updateNode(root, id, (node) => ({
    ...node,
    children,
  }));
}

/**
 * 자식 노드 추가
 */
export function addChildNode(
  root: EditorNode,
  parentId: string,
  child: EditorNode,
  index?: number
): EditorNode {
  return updateNode(root, parentId, (node) => {
    const children = Array.isArray(node.children) ? [...node.children] : [];
    if (index !== undefined && index >= 0 && index <= children.length) {
      children.splice(index, 0, child);
    } else {
      children.push(child);
    }
    return { ...node, children };
  });
}

/**
 * 노드 제거
 */
export function removeNode(root: EditorNode, id: string): EditorNode {
  // 루트 노드는 제거 불가
  if (root.id === id) return root;

  if (root.children && Array.isArray(root.children)) {
    return {
      ...root,
      children: root.children
        .filter((child) => child.id !== id)
        .map((child) => removeNode(child, id)),
    };
  }

  return root;
}

/**
 * 노드 이동
 */
export function moveNode(
  root: EditorNode,
  nodeId: string,
  newParentId: string,
  newIndex: number
): EditorNode {
  // 이동할 노드 찾기
  const nodeToMove = findNodeById(root, nodeId);
  if (!nodeToMove) return root;

  // 먼저 기존 위치에서 제거
  let newRoot = removeNode(root, nodeId);

  // 새 위치에 추가
  newRoot = addChildNode(newRoot, newParentId, nodeToMove, newIndex);

  return newRoot;
}

/**
 * 노드 복제 (새 ID 생성)
 */
export function cloneNode(node: EditorNode): EditorNode {
  const cloned: EditorNode = {
    ...node,
    id: generateNodeId(),
    props: node.props ? { ...node.props } : undefined,
  };

  if (node.children && Array.isArray(node.children)) {
    cloned.children = node.children.map(cloneNode);
  }

  return cloned;
}

/**
 * 빈 루트 노드 생성
 */
export function createEmptyRoot(): EditorNode {
  return {
    id: generateNodeId(),
    type: "Box",
    props: { className: "min-h-[200px] p-4" },
    children: [],
  };
}

/**
 * 새 노드 생성
 */
export function createNode(
  type: string,
  props?: Record<string, unknown>,
  children?: string | EditorNode[]
): EditorNode {
  return {
    id: generateNodeId(),
    type,
    props,
    children,
  };
}

/**
 * 모든 노드 ID 수집
 */
export function collectAllIds(root: EditorNode): string[] {
  const ids: string[] = [root.id];

  if (root.children && Array.isArray(root.children)) {
    for (const child of root.children) {
      ids.push(...collectAllIds(child));
    }
  }

  return ids;
}

/**
 * 노드 개수 세기
 */
export function countNodes(root: EditorNode): number {
  return collectAllIds(root).length;
}
