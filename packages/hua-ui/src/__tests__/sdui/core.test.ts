/**
 * SDUI core.ts — unit tests
 *
 * All functions in core.ts are pure (no React dependency).
 */

import { describe, it, expect } from "vitest";
import {
  getByPath,
  setByPath,
  resolveProps,
  resolveTextBindings,
  resolveDotString,
  evaluateCondition,
  iterateEach,
} from "../../sdui/core";
import type { SDUICondition, SDUIEachBinding } from "../../sdui/types";

// ── getByPath ────────────────────────────────────────────────────────────────

describe("getByPath", () => {
  it("returns top-level value", () => {
    expect(getByPath({ name: "Alice" }, "name")).toBe("Alice");
  });

  it("returns nested value via dot path", () => {
    expect(
      getByPath({ user: { profile: { age: 30 } } }, "user.profile.age"),
    ).toBe(30);
  });

  it("returns undefined for missing key", () => {
    expect(getByPath({ a: 1 }, "b")).toBeUndefined();
  });

  it("returns undefined for deeply missing path", () => {
    expect(getByPath({ a: { b: 1 } }, "a.c.d")).toBeUndefined();
  });

  it("returns undefined when intermediate node is not an object", () => {
    expect(getByPath({ a: 42 }, "a.b")).toBeUndefined();
  });

  it("handles boolean false as a valid value", () => {
    expect(getByPath({ active: false }, "active")).toBe(false);
  });

  it("handles null values at path", () => {
    // null is not an object, so further traversal returns undefined
    expect(getByPath({ x: null } as Record<string, unknown>, "x")).toBeNull();
  });

  it("handles numeric values correctly", () => {
    expect(getByPath({ count: 0 }, "count")).toBe(0);
  });
});

// ── setByPath ────────────────────────────────────────────────────────────────

describe("setByPath", () => {
  it("sets a top-level key", () => {
    const result = setByPath({ a: 1 }, "a", 99);
    expect(result.a).toBe(99);
  });

  it("sets a nested key", () => {
    const result = setByPath({ user: { name: "Bob" } }, "user.name", "Alice");
    expect((result.user as Record<string, unknown>).name).toBe("Alice");
  });

  it("creates intermediate objects if missing", () => {
    const result = setByPath({}, "a.b.c", "deep");
    expect(
      ((result.a as Record<string, unknown>).b as Record<string, unknown>).c,
    ).toBe("deep");
  });

  it("does not mutate the original object (immutable)", () => {
    const orig = { x: 1 };
    setByPath(orig, "x", 99);
    expect(orig.x).toBe(1);
  });

  it("does not mutate nested objects", () => {
    const orig = { user: { name: "Bob" } };
    setByPath(orig, "user.name", "Alice");
    expect(orig.user.name).toBe("Bob");
  });

  it("overwrites existing nested value", () => {
    const result = setByPath({ a: { b: { c: 1 } } }, "a.b.c", 42);
    expect(
      ((result.a as Record<string, unknown>).b as Record<string, unknown>).c,
    ).toBe(42);
  });

  it("sets value to null", () => {
    const result = setByPath({ key: "value" }, "key", null);
    expect(result.key).toBeNull();
  });
});

// ── resolveTextBindings ──────────────────────────────────────────────────────

describe("resolveTextBindings", () => {
  it("replaces a simple binding", () => {
    expect(resolveTextBindings("Hello, {{ name }}!", { name: "Alice" })).toBe(
      "Hello, Alice!",
    );
  });

  it("replaces nested path binding", () => {
    expect(
      resolveTextBindings("Hi {{ user.name }}", { user: { name: "Bob" } }),
    ).toBe("Hi Bob");
  });

  it("replaces multiple bindings in one string", () => {
    expect(
      resolveTextBindings("{{ a }} + {{ b }}", { a: "foo", b: "bar" }),
    ).toBe("foo + bar");
  });

  it("returns empty string for missing path", () => {
    expect(resolveTextBindings("{{ missing }}", {})).toBe("");
  });

  it("handles numeric values — converts to string", () => {
    expect(resolveTextBindings("Count: {{ n }}", { n: 42 })).toBe("Count: 42");
  });

  it("leaves text without bindings unchanged", () => {
    expect(resolveTextBindings("no binding here", { x: 1 })).toBe(
      "no binding here",
    );
  });

  it("handles whitespace inside {{ }}", () => {
    expect(resolveTextBindings("{{  name  }}", { name: "trim" })).toBe("trim");
  });
});

// ── resolveDotString ─────────────────────────────────────────────────────────

describe("resolveDotString", () => {
  it("resolves binding inside a dot token", () => {
    expect(resolveDotString("bg-{{ color }}", { color: "cyan-500" })).toBe(
      "bg-cyan-500",
    );
  });

  it("leaves static dot tokens unchanged", () => {
    expect(resolveDotString("flex items-center", {})).toBe("flex items-center");
  });

  it("resolves nested path", () => {
    expect(
      resolveDotString("text-{{ theme.primary }}", {
        theme: { primary: "indigo-600" },
      }),
    ).toBe("text-indigo-600");
  });

  it("returns empty string for missing binding", () => {
    expect(resolveDotString("border-{{ missing }}", {})).toBe("border-");
  });

  it("handles multiple bindings in a dot string", () => {
    expect(resolveDotString("{{ a }}-{{ b }}", { a: "foo", b: "bar" })).toBe(
      "foo-bar",
    );
  });
});

// ── resolveProps ─────────────────────────────────────────────────────────────

describe("resolveProps", () => {
  it("resolves a full binding {{ path }} to the actual value", () => {
    const result = resolveProps(
      { label: "{{ user.name }}" },
      { user: { name: "Alice" } },
    );
    expect(result.label).toBe("Alice");
  });

  it("preserves non-string values as-is", () => {
    const result = resolveProps({ count: 5, active: true }, {});
    expect(result.count).toBe(5);
    expect(result.active).toBe(true);
  });

  it("resolves partial binding within a string", () => {
    const result = resolveProps(
      { greeting: "Hello, {{ name }}!" },
      { name: "Bob" },
    );
    expect(result.greeting).toBe("Hello, Bob!");
  });

  it("resolves nested object props recursively", () => {
    const result = resolveProps(
      { style: { color: "{{ theme.color }}" } },
      { theme: { color: "red" } },
    );
    expect((result.style as Record<string, unknown>).color).toBe("red");
  });

  it("resolves bindings inside arrays", () => {
    const result = resolveProps(
      { items: [{ label: "{{ x }}" }] },
      { x: "hello" },
    );
    expect((result.items as Array<Record<string, unknown>>)[0].label).toBe(
      "hello",
    );
  });

  it("handles missing path in full binding — returns undefined", () => {
    const result = resolveProps({ val: "{{ missing }}" }, {});
    expect(result.val).toBeUndefined();
  });

  it("leaves array primitive items unchanged", () => {
    const result = resolveProps({ nums: [1, 2, 3] }, {});
    expect(result.nums).toEqual([1, 2, 3]);
  });
});

// ── evaluateCondition ────────────────────────────────────────────────────────

describe("evaluateCondition", () => {
  const data = {
    user: { name: "Alice", age: 25, active: true },
    score: 0,
    empty: null,
  };

  const cond = (
    path: string,
    operator: SDUICondition["operator"],
    value?: unknown,
  ): SDUICondition => ({ path, operator, value });

  describe("eq", () => {
    it("returns true when values are strictly equal", () => {
      expect(evaluateCondition(cond("user.name", "eq", "Alice"), data)).toBe(
        true,
      );
    });

    it("returns false when values differ", () => {
      expect(evaluateCondition(cond("user.name", "eq", "Bob"), data)).toBe(
        false,
      );
    });

    it("handles boolean equality", () => {
      expect(evaluateCondition(cond("user.active", "eq", true), data)).toBe(
        true,
      );
    });
  });

  describe("neq", () => {
    it("returns true when values differ", () => {
      expect(evaluateCondition(cond("user.name", "neq", "Bob"), data)).toBe(
        true,
      );
    });

    it("returns false when values are equal", () => {
      expect(evaluateCondition(cond("user.name", "neq", "Alice"), data)).toBe(
        false,
      );
    });
  });

  describe("gt", () => {
    it("returns true when value > threshold", () => {
      expect(evaluateCondition(cond("user.age", "gt", 20), data)).toBe(true);
    });

    it("returns false when value <= threshold", () => {
      expect(evaluateCondition(cond("user.age", "gt", 25), data)).toBe(false);
    });

    it("returns false for non-numeric value", () => {
      expect(evaluateCondition(cond("user.name", "gt", 0), data)).toBe(false);
    });
  });

  describe("lt", () => {
    it("returns true when value < threshold", () => {
      expect(evaluateCondition(cond("user.age", "lt", 30), data)).toBe(true);
    });

    it("returns false when value >= threshold", () => {
      expect(evaluateCondition(cond("user.age", "lt", 25), data)).toBe(false);
    });
  });

  describe("gte", () => {
    it("returns true when value >= threshold (equal case)", () => {
      expect(evaluateCondition(cond("user.age", "gte", 25), data)).toBe(true);
    });

    it("returns true when value > threshold", () => {
      expect(evaluateCondition(cond("user.age", "gte", 20), data)).toBe(true);
    });

    it("returns false when value < threshold", () => {
      expect(evaluateCondition(cond("user.age", "gte", 26), data)).toBe(false);
    });
  });

  describe("lte", () => {
    it("returns true when value <= threshold (equal case)", () => {
      expect(evaluateCondition(cond("user.age", "lte", 25), data)).toBe(true);
    });

    it("returns false when value > threshold", () => {
      expect(evaluateCondition(cond("user.age", "lte", 24), data)).toBe(false);
    });
  });

  describe("exists", () => {
    it("returns true for a defined non-null value", () => {
      expect(evaluateCondition(cond("user.name", "exists"), data)).toBe(true);
    });

    it("returns false for null", () => {
      expect(evaluateCondition(cond("empty", "exists"), data)).toBe(false);
    });

    it("returns false for undefined path", () => {
      expect(evaluateCondition(cond("nonexistent", "exists"), data)).toBe(
        false,
      );
    });

    it("returns true for zero (0 is a defined value)", () => {
      expect(evaluateCondition(cond("score", "exists"), data)).toBe(true);
    });
  });

  describe("notExists", () => {
    it("returns true for undefined path", () => {
      expect(evaluateCondition(cond("ghost", "notExists"), data)).toBe(true);
    });

    it("returns true for null value", () => {
      expect(evaluateCondition(cond("empty", "notExists"), data)).toBe(true);
    });

    it("returns false for a defined value", () => {
      expect(evaluateCondition(cond("user.name", "notExists"), data)).toBe(
        false,
      );
    });
  });
});

// ── iterateEach ──────────────────────────────────────────────────────────────

describe("iterateEach", () => {
  const each = (
    of: string,
    opts?: Partial<Omit<SDUIEachBinding, "of">>,
  ): SDUIEachBinding => ({ of, ...opts });

  it("returns an item per array element", () => {
    const result = iterateEach(each("items"), { items: ["a", "b", "c"] });
    expect(result).toHaveLength(3);
  });

  it("injects item under 'item' key by default", () => {
    const result = iterateEach(each("list"), { list: [{ name: "X" }] });
    expect(result[0].scopedData.item).toEqual({ name: "X" });
  });

  it("injects index under 'index' key by default", () => {
    const result = iterateEach(each("list"), { list: ["a", "b"] });
    expect(result[0].scopedData.index).toBe(0);
    expect(result[1].scopedData.index).toBe(1);
  });

  it("respects custom 'as' variable name", () => {
    const result = iterateEach(each("entries", { as: "entry" }), {
      entries: [{ id: 1 }],
    });
    expect(result[0].scopedData.entry).toEqual({ id: 1 });
    expect(result[0].scopedData.item).toBeUndefined();
  });

  it("respects custom 'indexAs' variable name", () => {
    const result = iterateEach(each("items", { indexAs: "i" }), {
      items: ["x"],
    });
    expect(result[0].scopedData.i).toBe(0);
    expect(result[0].scopedData.index).toBeUndefined();
  });

  it("uses each.key path as React key when present", () => {
    const result = iterateEach(each("rows", { key: "id" }), {
      rows: [
        { id: "abc", val: 1 },
        { id: "def", val: 2 },
      ],
    });
    expect(result[0].key).toBe("abc");
    expect(result[1].key).toBe("def");
  });

  it("falls back to index as key when each.key is missing", () => {
    const result = iterateEach(each("items"), { items: ["a", "b"] });
    expect(result[0].key).toBe("0");
    expect(result[1].key).toBe("1");
  });

  it("falls back to index when key path resolves to undefined", () => {
    const result = iterateEach(each("rows", { key: "missing" }), {
      rows: [{ id: 1 }],
    });
    expect(result[0].key).toBe("0");
  });

  it("returns empty array when path does not point to an array", () => {
    expect(iterateEach(each("notArray"), { notArray: "string" })).toEqual([]);
  });

  it("returns empty array when path is missing", () => {
    expect(iterateEach(each("items"), {})).toEqual([]);
  });

  it("preserves parent data in scopedData", () => {
    const result = iterateEach(each("list"), { list: [1], global: "shared" });
    expect(result[0].scopedData.global).toBe("shared");
  });

  it("handles empty array — returns empty result", () => {
    expect(iterateEach(each("items"), { items: [] })).toEqual([]);
  });
});
