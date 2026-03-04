import { describe, it, expect } from "vitest";
import {
  getByPath,
  setByPath,
  evaluateCondition,
  resolveProps,
  resolveTextBindings,
  resolveDotString,
  iterateEach,
} from "../core";

describe("getByPath", () => {
  const data = { user: { profile: { name: "Kim" } }, count: 42 };

  it("resolves nested path", () => {
    expect(getByPath(data, "user.profile.name")).toBe("Kim");
  });

  it("resolves top-level path", () => {
    expect(getByPath(data, "count")).toBe(42);
  });

  it("returns undefined for missing path", () => {
    expect(getByPath(data, "user.missing.field")).toBeUndefined();
  });

  it("returns undefined for completely missing root", () => {
    expect(getByPath(data, "nonexistent")).toBeUndefined();
  });
});

describe("setByPath", () => {
  it("sets nested value immutably", () => {
    const original = { user: { name: "Kim" } };
    const result = setByPath(original, "user.name", "Lee");
    expect(result.user).toEqual({ name: "Lee" });
    expect(original.user.name).toBe("Kim"); // immutable
  });

  it("creates intermediate objects", () => {
    const result = setByPath({}, "a.b.c", 1);
    expect(getByPath(result, "a.b.c")).toBe(1);
  });

  it("sets top-level value", () => {
    const result = setByPath({ x: 1 }, "x", 2);
    expect(result.x).toBe(2);
  });
});

describe("evaluateCondition", () => {
  const data = { score: 7, active: true, name: "test" };

  it("eq", () => {
    expect(evaluateCondition({ path: "score", operator: "eq", value: 7 }, data)).toBe(true);
    expect(evaluateCondition({ path: "score", operator: "eq", value: 8 }, data)).toBe(false);
  });

  it("neq", () => {
    expect(evaluateCondition({ path: "score", operator: "neq", value: 5 }, data)).toBe(true);
  });

  it("gt / gte / lt / lte", () => {
    expect(evaluateCondition({ path: "score", operator: "gt", value: 5 }, data)).toBe(true);
    expect(evaluateCondition({ path: "score", operator: "gt", value: 7 }, data)).toBe(false);
    expect(evaluateCondition({ path: "score", operator: "gte", value: 7 }, data)).toBe(true);
    expect(evaluateCondition({ path: "score", operator: "lt", value: 10 }, data)).toBe(true);
    expect(evaluateCondition({ path: "score", operator: "lte", value: 7 }, data)).toBe(true);
  });

  it("exists / notExists", () => {
    expect(evaluateCondition({ path: "score", operator: "exists" }, data)).toBe(true);
    expect(evaluateCondition({ path: "missing", operator: "exists" }, data)).toBe(false);
    expect(evaluateCondition({ path: "missing", operator: "notExists" }, data)).toBe(true);
  });
});

describe("resolveProps", () => {
  const data = { user: { name: "Kim", age: 25 }, color: "blue" };

  it("resolves full binding", () => {
    const result = resolveProps({ name: "{{ user.name }}" }, data);
    expect(result.name).toBe("Kim");
  });

  it("resolves partial binding in string", () => {
    const result = resolveProps({ label: "Hello, {{ user.name }}!" }, data);
    expect(result.label).toBe("Hello, Kim!");
  });

  it("resolves nested objects", () => {
    const result = resolveProps({ nested: { val: "{{ color }}" } }, data);
    expect(result.nested).toEqual({ val: "blue" });
  });

  it("resolves arrays", () => {
    const result = resolveProps({ items: [{ v: "{{ color }}" }] }, data);
    expect(result.items).toEqual([{ v: "blue" }]);
  });

  it("passes non-string values through", () => {
    const result = resolveProps({ num: 42, bool: true }, data);
    expect(result).toEqual({ num: 42, bool: true });
  });
});

describe("resolveTextBindings", () => {
  const data = { name: "Sum", version: 2 };

  it("replaces single binding", () => {
    expect(resolveTextBindings("Hello {{ name }}", data)).toBe("Hello Sum");
  });

  it("replaces multiple bindings", () => {
    expect(resolveTextBindings("{{ name }} v{{ version }}", data)).toBe("Sum v2");
  });

  it("returns empty string for missing path", () => {
    expect(resolveTextBindings("Hi {{ missing }}", data)).toBe("Hi ");
  });

  it("returns original string if no bindings", () => {
    expect(resolveTextBindings("plain text", data)).toBe("plain text");
  });
});

describe("resolveDotString", () => {
  const data = { emotion: { color: "cyan-500" }, size: "lg" };

  it("resolves single binding in dot string", () => {
    expect(resolveDotString("bg-{{ emotion.color }}", data)).toBe("bg-cyan-500");
  });

  it("resolves multiple bindings", () => {
    expect(resolveDotString("bg-{{ emotion.color }} text-{{ size }}", data))
      .toBe("bg-cyan-500 text-lg");
  });

  it("returns empty for missing path", () => {
    expect(resolveDotString("bg-{{ missing }}/20", data)).toBe("bg-/20");
  });

  it("returns original if no bindings", () => {
    expect(resolveDotString("p-4 flex gap-2", data)).toBe("p-4 flex gap-2");
  });
});

describe("iterateEach", () => {
  const data = {
    emotions: [
      { id: "joy", value: 0.8 },
      { id: "calm", value: 0.6 },
    ],
    title: "Report",
  };

  it("returns scoped data for each item", () => {
    const result = iterateEach({ of: "emotions" }, data);
    expect(result).toHaveLength(2);
    expect(result[0].scopedData.item).toEqual({ id: "joy", value: 0.8 });
    expect(result[0].scopedData.index).toBe(0);
    expect(result[0].scopedData.title).toBe("Report"); // parent data preserved
    expect(result[1].scopedData.item).toEqual({ id: "calm", value: 0.6 });
    expect(result[1].scopedData.index).toBe(1);
  });

  it("uses custom as/indexAs names", () => {
    const result = iterateEach({ of: "emotions", as: "e", indexAs: "i" }, data);
    expect(result[0].scopedData.e).toEqual({ id: "joy", value: 0.8 });
    expect(result[0].scopedData.i).toBe(0);
    expect(result[0].scopedData.item).toBeUndefined();
  });

  it("returns empty array for missing path", () => {
    const result = iterateEach({ of: "nonexistent" }, data);
    expect(result).toEqual([]);
  });

  it("returns empty array for non-array value", () => {
    const result = iterateEach({ of: "title" }, data);
    expect(result).toEqual([]);
  });

  it("returns empty array for empty array", () => {
    const result = iterateEach({ of: "items" }, { items: [] });
    expect(result).toEqual([]);
  });

  it("uses each.key for stable React keys", () => {
    const result = iterateEach({ of: "emotions", key: "id" }, data);
    expect(result[0].key).toBe("joy");
    expect(result[1].key).toBe("calm");
  });

  it("falls back to index when each.key is missing from item", () => {
    const result = iterateEach({ of: "emotions", key: "nonexistent" }, data);
    expect(result[0].key).toBe("0");
    expect(result[1].key).toBe("1");
  });

  it("falls back to index when no key specified", () => {
    const result = iterateEach({ of: "emotions" }, data);
    expect(result[0].key).toBe("0");
    expect(result[1].key).toBe("1");
  });

  it("supports nested each (scoped data includes parent iteration)", () => {
    const nestedData = {
      categories: [
        { name: "A", items: [{ id: 1 }, { id: 2 }] },
      ],
    };
    const outer = iterateEach({ of: "categories", as: "cat" }, nestedData);
    expect(outer).toHaveLength(1);

    // Simulate inner each using outer scoped data
    const inner = iterateEach({ of: "cat.items", as: "sub" }, outer[0].scopedData);
    expect(inner).toHaveLength(2);
    expect(inner[0].scopedData.sub).toEqual({ id: 1 });
    expect(inner[0].scopedData.cat).toEqual({ name: "A", items: [{ id: 1 }, { id: 2 }] });
  });
});
