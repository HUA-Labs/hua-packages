/**
 * SDUI Core — platform-agnostic logic
 *
 * SDUIRenderer에서 추출한 순수 함수 + v2 유틸리티
 */

import type { SDUICondition, SDUIEachBinding } from "./types";

/**
 * 데이터 경로로 값 가져오기
 * 예: "user.profile.name" → data.user.profile.name
 */
export function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * 데이터 경로로 값 설정하기 (immutable)
 */
export function setByPath(
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
export function evaluateCondition(
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
export function resolveProps(
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
        resolved[key] = resolveTextBindings(value, data);
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
 * 텍스트 내 {{ path }} 바인딩을 데이터로 치환
 */
export function resolveTextBindings(
  text: string,
  data: Record<string, unknown>
): string {
  return text.replace(/\{\{\s*(.+?)\s*\}\}/g, (_, path) => {
    const val = getByPath(data, path);
    return val !== undefined ? String(val) : "";
  });
}

/**
 * dot 문자열 내 {{ path }} 바인딩 resolve
 * 예: "bg-{{ emotion.color }}" + {emotion: {color: "cyan-500"}} → "bg-cyan-500"
 */
export function resolveDotString(
  dot: string,
  data: Record<string, unknown>
): string {
  return resolveTextBindings(dot, data);
}

/**
 * each 반복 결과 항목
 */
export interface EachIterationItem {
  /** Scoped data (부모 data + item/index 주입) */
  scopedData: Record<string, unknown>;
  /** Stable React key (each.key path → item value, fallback: index) */
  key: string;
}

/**
 * each 바인딩을 처리하여 scoped data + key 배열 반환
 *
 * 각 항목은 부모 data를 복사 + item/index 변수 주입
 * each.key가 있으면 item에서 해당 경로의 값을 React key로 사용
 */
export function iterateEach(
  each: SDUIEachBinding,
  data: Record<string, unknown>
): EachIterationItem[] {
  const items = getByPath(data, each.of);
  if (!Array.isArray(items)) {
    return [];
  }

  const itemKey = each.as || "item";
  const indexKey = each.indexAs || "index";

  return items.map((item, index) => {
    const scopedData = {
      ...data,
      [itemKey]: item,
      [indexKey]: index,
    };

    // Resolve stable key from item
    let key = String(index);
    if (each.key && item && typeof item === "object") {
      const keyVal = getByPath(item as Record<string, unknown>, each.key);
      if (keyVal !== undefined && keyVal !== null) {
        key = String(keyVal);
      }
    }

    return { scopedData, key };
  });
}
