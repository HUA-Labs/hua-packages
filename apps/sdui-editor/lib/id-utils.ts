/**
 * ID Utilities
 *
 * nanoid 기반 고유 ID 생성
 */

import { nanoid } from "nanoid";

/**
 * 노드 ID 생성
 * 8자리 nanoid (충분히 유니크하면서 짧음)
 */
export function generateNodeId(): string {
  return nanoid(8);
}

/**
 * 프로젝트 ID 생성
 * 12자리 nanoid
 */
export function generateProjectId(): string {
  return nanoid(12);
}

/**
 * ID 유효성 검사
 */
export function isValidId(id: string): boolean {
  // nanoid는 URL-safe 문자만 사용: A-Za-z0-9_-
  return /^[A-Za-z0-9_-]+$/.test(id) && id.length >= 6;
}

/**
 * 노드 ID prefix로 타입 힌트 추가 (디버깅용)
 */
export function generatePrefixedId(prefix: string): string {
  return `${prefix}_${nanoid(6)}`;
}
