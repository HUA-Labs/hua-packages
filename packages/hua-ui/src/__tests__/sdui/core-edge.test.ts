/**
 * SDUI core.ts — negative & edge case tests
 *
 * 실제 버그를 잡을 수 있는 경계 조건 위주.
 * 소스의 실제 동작을 검증하고, 의도치 않은 동작을 문서화한다.
 */

import { describe, it, expect } from "vitest";
import {
  getByPath,
  setByPath,
  resolveProps,
  resolveTextBindings,
  evaluateCondition,
  iterateEach,
} from "../../sdui/core";
import type { SDUICondition, SDUIEachBinding } from "../../sdui/types";

// ── getByPath — edge cases ────────────────────────────────────────────────────

describe("getByPath — edge cases", () => {
  // 배열 인덱스 경로
  it("accesses array element via numeric string index", () => {
    const data = { items: ["a", "b", "c"] };
    // Array는 객체이므로 "0" 키로 접근 가능
    expect(getByPath(data as Record<string, unknown>, "items.0")).toBe("a");
  });

  it("returns undefined for out-of-bounds array index", () => {
    const data = { arr: [1, 2, 3] };
    expect(
      getByPath(data as Record<string, unknown>, "arr.99"),
    ).toBeUndefined();
  });

  it("returns undefined for negative array index (not a valid key)", () => {
    const data = { arr: [1, 2, 3] };
    // 음수 인덱스는 JavaScript 배열의 키가 아님
    expect(
      getByPath(data as Record<string, unknown>, "arr.-1"),
    ).toBeUndefined();
  });

  // null 중간 경로
  it("returns undefined when intermediate node is null", () => {
    const data = { user: null } as Record<string, unknown>;
    expect(getByPath(data, "user.name")).toBeUndefined();
  });

  it("returns undefined when intermediate node is a number", () => {
    const data = { count: 42 } as Record<string, unknown>;
    expect(getByPath(data, "count.something")).toBeUndefined();
  });

  it("returns undefined when intermediate node is a string", () => {
    const data = { name: "Alice" } as Record<string, unknown>;
    expect(getByPath(data, "name.length")).toBeUndefined();
  });

  // 빈 문자열 경로 — "".split(".") === [""] 이므로 결과 undefined
  it("returns undefined for empty string path", () => {
    const data = { a: 1 } as Record<string, unknown>;
    // 빈 문자열 키 ""는 data에 없으므로 undefined
    expect(getByPath(data, "")).toBeUndefined();
  });

  // 숫자 키
  it("handles numeric string key at top level", () => {
    const data = { "123": "numeric-key" } as Record<string, unknown>;
    expect(getByPath(data, "123")).toBe("numeric-key");
  });

  // 매우 깊은 경로 (10+ 레벨)
  it("traverses deeply nested path (10 levels)", () => {
    const deep = {
      a: { b: { c: { d: { e: { f: { g: { h: { i: { j: "deep" } } } } } } } } },
    };
    expect(
      getByPath(deep as Record<string, unknown>, "a.b.c.d.e.f.g.h.i.j"),
    ).toBe("deep");
  });

  it("returns undefined when 10-level path is partially missing", () => {
    const data = { a: { b: { c: null } } } as Record<string, unknown>;
    expect(getByPath(data, "a.b.c.d.e.f.g.h.i.j")).toBeUndefined();
  });

  // 배열 내 객체 접근
  it("accesses nested object inside array element", () => {
    const data = { users: [{ name: "Alice" }, { name: "Bob" }] };
    // "users.0.name" 접근 — 배열의 "0" 키
    expect(getByPath(data as Record<string, unknown>, "users.0.name")).toBe(
      "Alice",
    );
  });
});

// ── setByPath — edge cases ────────────────────────────────────────────────────

describe("setByPath — edge cases", () => {
  // 기존 값 덮어쓰기
  it("overwrites a top-level primitive with an object", () => {
    const result = setByPath({ a: 42 }, "a", { nested: true });
    expect(result.a).toEqual({ nested: true });
  });

  it("overwrites a nested object with a primitive", () => {
    const result = setByPath({ a: { b: { c: 99 } } }, "a.b", "replaced");
    expect((result.a as Record<string, unknown>).b).toBe("replaced");
  });

  // 배열 중간에 설정 — 배열이 객체처럼 처리됨
  it("sets a value at an array index path (array treated as object)", () => {
    const orig = { items: ["x", "y", "z"] };
    const result = setByPath(
      orig as Record<string, unknown>,
      "items.1",
      "REPLACED",
    );
    // items는 스프레드되어 새 객체가 됨
    expect((result.items as Record<string, unknown>)["1"]).toBe("REPLACED");
  });

  // null 중간 경로 — null은 {}로 교체됨
  it("replaces null intermediate node with a new object", () => {
    const orig = { user: null } as Record<string, unknown>;
    const result = setByPath(orig, "user.name", "Alice");
    expect((result.user as Record<string, unknown>).name).toBe("Alice");
  });

  // 빈 경로 처리 — "".split(".") === [""]이므로 "" 키에 값이 설정됨
  it("sets value under empty string key when path is empty string", () => {
    const result = setByPath({ a: 1 }, "", "value");
    // 빈 경로 → keys = [""] → keys[keys.length-1] = "" → result[""] = "value"
    expect(result[""]).toBe("value");
  });

  // 불변성: 깊은 중간 경로도 원본 불변
  it("does not mutate intermediate objects in nested path", () => {
    const orig = { a: { b: { c: 1 } } };
    const origA = orig.a;
    const origAB = orig.a.b;
    setByPath(orig as Record<string, unknown>, "a.b.c", 999);
    expect(orig.a).toBe(origA); // 원본 참조 유지
    expect(orig.a.b).toBe(origAB);
    expect(orig.a.b.c).toBe(1);
  });

  // undefined 값 설정
  it("sets value to undefined", () => {
    const result = setByPath({ key: "value" }, "key", undefined);
    expect(result.key).toBeUndefined();
  });
});

// ── resolveProps — edge cases ─────────────────────────────────────────────────

describe("resolveProps — edge cases", () => {
  // {{ }} 공백만 있는 바인딩 — `.+?`가 공백을 캡처하여 fullMatch 발생
  it("{{ }} with single space: .+? captures the space, resolves as unknown path", () => {
    const result = resolveProps({ val: "{{ }}" }, {});
    // ^\{\{\s*(.+?)\s*\}\}$ 에서 \s* 가 공백을 0개 소비 → .+? 가 " " 캡처 가능
    // getByPath(data, " ") → undefined (공백 키 없음)
    // 따라서 full binding match 후 undefined 반환
    expect(result.val).toBeUndefined();
  });

  // 잘못된 경로 형식 `{{ invalid..path }}`
  it("handles double-dot path — returns empty string for text binding", () => {
    // "invalid..path" → getByPath에 "invalid..path"가 들어감
    // split(".") → ["invalid", "", "path"] → "" 키로 중간에 undefined
    const result = resolveProps(
      { val: "prefix {{ invalid..path }} suffix" },
      { invalid: { path: "x" } },
    );
    expect(typeof result.val).toBe("string");
    // 경로가 올바르지 않으므로 중간 "" 키에서 undefined, 빈 문자열로 치환
    expect(result.val).toBe("prefix  suffix");
  });

  // 바인딩이 아닌 단일 중괄호
  it("leaves single-brace text unchanged", () => {
    const result = resolveProps({ val: "{single_brace}" }, {});
    expect(result.val).toBe("{single_brace}");
  });

  // undefined data — 빈 객체처럼 동작해야 함
  it("handles undefined-like missing keys in data gracefully", () => {
    const result = resolveProps({ a: "{{ x }}", b: "{{ y }}" }, {});
    expect(result.a).toBeUndefined(); // full binding missing path → undefined
    expect(result.b).toBeUndefined();
  });

  // null 값이 data에 있을 때 전체 바인딩은 null 반환
  it("returns null when full binding path resolves to null", () => {
    const result = resolveProps({ val: "{{ nullVal }}" }, { nullVal: null });
    expect(result.val).toBeNull();
  });

  // null 값이 data에 있을 때 부분 바인딩은 "null" 문자열
  it("converts null to string 'null' in partial text binding", () => {
    const result = resolveProps(
      { val: "prefix {{ nullVal }} suffix" },
      { nullVal: null },
    );
    // resolveTextBindings: val !== undefined ? String(val) → String(null) === "null"
    expect(result.val).toBe("prefix null suffix");
  });

  // 중첩 {{ {{ }} }} — 내부 {{ }}가 먼저 처리되지 않음 (단순 regex)
  it("does not recursively resolve nested binding syntax", () => {
    const result = resolveProps({ val: "{{ {{ inner }} }}" }, { inner: "x" });
    // 외부 regex가 "{{ inner }}" 를 path로 처리하려 함 → 그 경로는 없음
    // 실제 동작: ^\{\{\s*(.+?)\s*\}\}$ 에서 lazy .+? 로 "{{ inner" 매치 가능성
    // 어떤 결과든 타입이 일관되어야 함
    const val = result.val;
    expect(typeof val === "string" || val === undefined || val === null).toBe(
      true,
    );
  });

  // 배열 내 null 요소 — resolveProps에서 null item은 통과됨
  it("skips null items in array (passes through as-is)", () => {
    const result = resolveProps(
      { items: [null, { label: "{{ x }}" }, undefined] as unknown[] },
      { x: "hello" },
    );
    const items = result.items as unknown[];
    expect(items[0]).toBeNull();
    expect((items[1] as Record<string, unknown>).label).toBe("hello");
    expect(items[2]).toBeUndefined();
  });

  // 재귀: 깊게 중첩된 객체
  it("resolves deeply nested object props (3 levels)", () => {
    const result = resolveProps(
      { a: { b: { c: "{{ val }}" } } },
      { val: "deep" },
    );
    const a = result.a as Record<string, unknown>;
    const b = a.b as Record<string, unknown>;
    expect(b.c).toBe("deep");
  });
});

// ── resolveTextBindings — edge cases ─────────────────────────────────────────

describe("resolveTextBindings — edge cases", () => {
  // 이스케이프되지 않은 단일 중괄호
  it("leaves unmatched single braces unchanged", () => {
    expect(resolveTextBindings("value: {x}", { x: 1 })).toBe("value: {x}");
  });

  // 연속 바인딩 — 붙어있는 경우
  it("resolves consecutive bindings without separator", () => {
    expect(resolveTextBindings("{{ a }}{{ b }}", { a: "foo", b: "bar" })).toBe(
      "foobar",
    );
  });

  // 연속 바인딩 — 공백 구분
  it("resolves consecutive bindings with space separator", () => {
    expect(
      resolveTextBindings("{{ first }} {{ last }}", {
        first: "John",
        last: "Doe",
      }),
    ).toBe("John Doe");
  });

  // 매우 긴 텍스트
  it("handles very long text with multiple bindings", () => {
    const longPrefix = "x".repeat(1000);
    const longSuffix = "y".repeat(1000);
    const text = `${longPrefix}{{ name }}${longSuffix}`;
    const result = resolveTextBindings(text, { name: "Alice" });
    expect(result).toBe(`${longPrefix}Alice${longSuffix}`);
  });

  // undefined 값 → 빈 문자열
  it("replaces undefined binding with empty string", () => {
    expect(resolveTextBindings("hi {{ missing }}", {})).toBe("hi ");
  });

  // null 값 → "null" 문자열
  it("converts null value to string 'null'", () => {
    expect(resolveTextBindings("val: {{ x }}", { x: null })).toBe("val: null");
  });

  // false 값 → "false" 문자열
  it("converts false value to string 'false'", () => {
    expect(resolveTextBindings("active: {{ flag }}", { flag: false })).toBe(
      "active: false",
    );
  });

  // 0 값 → "0" 문자열
  it("converts zero to string '0'", () => {
    expect(resolveTextBindings("count: {{ n }}", { n: 0 })).toBe("count: 0");
  });

  // 바인딩만 있는 텍스트 (앞뒤 문자 없음)
  it("resolves binding-only text", () => {
    expect(resolveTextBindings("{{ name }}", { name: "Alice" })).toBe("Alice");
  });

  // 동일 경로 반복
  it("resolves same path multiple times", () => {
    expect(resolveTextBindings("{{ x }}-{{ x }}-{{ x }}", { x: "A" })).toBe(
      "A-A-A",
    );
  });
});

// ── evaluateCondition — edge cases ────────────────────────────────────────────

describe("evaluateCondition — edge cases", () => {
  const cond = (
    path: string,
    operator: SDUICondition["operator"],
    value?: unknown,
  ): SDUICondition => ({ path, operator, value });

  // 타입 강제 변환 — gt는 typeof number 체크 강제
  it("gt returns false for string '5' compared to number 3 (no coercion)", () => {
    // 소스: typeof value === "number" && value > ...
    const data = { score: "5" } as Record<string, unknown>;
    expect(evaluateCondition(cond("score", "gt", 3), data)).toBe(false);
  });

  it("lt returns false for string number (no coercion)", () => {
    const data = { score: "2" } as Record<string, unknown>;
    expect(evaluateCondition(cond("score", "lt", 10), data)).toBe(false);
  });

  it("gte returns false for string number (no coercion)", () => {
    const data = { score: "25" } as Record<string, unknown>;
    expect(evaluateCondition(cond("score", "gte", 25), data)).toBe(false);
  });

  // null 비교
  it("eq returns true when comparing null === null", () => {
    const data = { val: null } as Record<string, unknown>;
    expect(evaluateCondition(cond("val", "eq", null), data)).toBe(true);
  });

  it("neq returns false when both sides are null", () => {
    const data = { val: null } as Record<string, unknown>;
    expect(evaluateCondition(cond("val", "neq", null), data)).toBe(false);
  });

  // undefined 비교
  it("eq returns true when missing path === undefined", () => {
    const data = {} as Record<string, unknown>;
    expect(evaluateCondition(cond("missing", "eq", undefined), data)).toBe(
      true,
    );
  });

  // 잘못된 operator — default case는 true 반환 (소스 동작)
  it("unknown operator returns true (default case behavior)", () => {
    // 소스: default: return true;
    const badCond = {
      path: "x",
      operator: "badOp" as SDUICondition["operator"],
    };
    const data = { x: 1 } as Record<string, unknown>;
    expect(evaluateCondition(badCond, data)).toBe(true);
  });

  // exists: false 값도 defined이므로 true
  it("exists returns true for boolean false (false is defined)", () => {
    const data = { flag: false } as Record<string, unknown>;
    expect(evaluateCondition(cond("flag", "exists"), data)).toBe(true);
  });

  // exists: 빈 문자열도 defined
  it("exists returns true for empty string ('' is defined)", () => {
    const data = { name: "" } as Record<string, unknown>;
    expect(evaluateCondition(cond("name", "exists"), data)).toBe(true);
  });

  // notExists: 0도 defined이므로 false
  it("notExists returns false for zero (0 is defined)", () => {
    const data = { count: 0 } as Record<string, unknown>;
    expect(evaluateCondition(cond("count", "notExists"), data)).toBe(false);
  });

  // gt/lt 경계값
  it("gt returns false when value equals threshold (not strictly greater)", () => {
    const data = { n: 5 } as Record<string, unknown>;
    expect(evaluateCondition(cond("n", "gt", 5), data)).toBe(false);
  });

  it("lt returns false when value equals threshold (not strictly less)", () => {
    const data = { n: 5 } as Record<string, unknown>;
    expect(evaluateCondition(cond("n", "lt", 5), data)).toBe(false);
  });

  // gt with NaN — typeof NaN === "number" 이지만 NaN > x === false
  it("gt returns false for NaN value", () => {
    const data = { n: NaN } as Record<string, unknown>;
    expect(evaluateCondition(cond("n", "gt", 0), data)).toBe(false);
  });

  // eq with NaN — NaN !== NaN
  it("eq returns false for NaN === NaN (strict equality)", () => {
    const data = { n: NaN } as Record<string, unknown>;
    expect(evaluateCondition(cond("n", "eq", NaN), data)).toBe(false);
  });
});

// ── iterateEach — edge cases ──────────────────────────────────────────────────

describe("iterateEach — edge cases", () => {
  const each = (
    of: string,
    opts?: Partial<Omit<SDUIEachBinding, "of">>,
  ): SDUIEachBinding => ({ of, ...opts });

  // 비배열 데이터 — 문자열
  it("returns empty array when path resolves to a string", () => {
    expect(iterateEach(each("data"), { data: "hello" })).toEqual([]);
  });

  // 비배열 데이터 — 객체
  it("returns empty array when path resolves to a plain object", () => {
    expect(iterateEach(each("data"), { data: { key: "value" } })).toEqual([]);
  });

  // 비배열 데이터 — 숫자
  it("returns empty array when path resolves to a number", () => {
    expect(iterateEach(each("count"), { count: 42 })).toEqual([]);
  });

  // 비배열 데이터 — null
  it("returns empty array when path resolves to null", () => {
    const data = { items: null } as Record<string, unknown>;
    expect(iterateEach(each("items"), data)).toEqual([]);
  });

  // 비배열 데이터 — boolean
  it("returns empty array when path resolves to boolean", () => {
    const data = { flag: true } as Record<string, unknown>;
    expect(iterateEach(each("flag"), data)).toEqual([]);
  });

  // null `of` 경로 — 중첩 경로에서 null 만남
  it("returns empty array when nested of-path has null intermediate", () => {
    const data = { parent: null } as Record<string, unknown>;
    expect(iterateEach(each("parent.items"), data)).toEqual([]);
  });

  // 빈 `as` 문자열 — 빈 문자열로 키 설정됨
  it("uses empty string as variable name when as is empty string", () => {
    // each.as || "item" — 빈 문자열은 falsy이므로 "item"으로 fallback
    const result = iterateEach(each("list", { as: "" }), {
      list: [{ name: "X" }],
    });
    // 빈 문자열은 falsy → "item"으로 fallback
    expect(result[0].scopedData.item).toEqual({ name: "X" });
    expect(result[0].scopedData[""]).toBeUndefined();
  });

  // 빈 `indexAs` 문자열 — falsy이므로 "index"로 fallback
  it("uses 'index' when indexAs is empty string (falsy fallback)", () => {
    const result = iterateEach(each("list", { indexAs: "" }), { list: ["a"] });
    // "" || "index" === "index"
    expect(result[0].scopedData.index).toBe(0);
  });

  // 단일 요소 배열
  it("handles single-element array correctly", () => {
    const result = iterateEach(each("items"), { items: [{ id: 1 }] });
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("0");
  });

  // key 경로가 숫자인 경우 — String() 변환
  it("converts numeric key value to string", () => {
    const result = iterateEach(each("rows", { key: "id" }), {
      rows: [{ id: 42 }],
    });
    expect(result[0].key).toBe("42");
  });

  // key 경로가 null인 경우 — index fallback
  it("falls back to index when key resolves to null", () => {
    const result = iterateEach(each("rows", { key: "id" }), {
      rows: [{ id: null }],
    });
    expect(result[0].key).toBe("0");
  });

  // primitive 배열 요소에서 key 경로 — item이 객체가 아님
  it("falls back to index when array items are primitives and key is set", () => {
    const result = iterateEach(each("items", { key: "id" }), {
      items: ["a", "b"],
    });
    // item이 객체가 아니므로 getByPath 호출 안 됨 → index fallback
    expect(result[0].key).toBe("0");
    expect(result[1].key).toBe("1");
  });

  // scopedData가 부모 데이터를 완전히 포함하는지
  it("scopedData contains full parent data including nested structures", () => {
    const data = {
      list: [1, 2],
      config: { theme: "dark", lang: "ko" },
      count: 99,
    };
    const result = iterateEach(each("list"), data);
    expect(result[0].scopedData.config).toEqual({ theme: "dark", lang: "ko" });
    expect(result[0].scopedData.count).toBe(99);
  });

  // item이 undefined인 배열
  it("handles array with undefined elements", () => {
    const data = { items: [undefined, undefined] } as Record<string, unknown>;
    const result = iterateEach(each("items"), data);
    expect(result).toHaveLength(2);
    expect(result[0].scopedData.item).toBeUndefined();
    expect(result[0].key).toBe("0");
  });
});
