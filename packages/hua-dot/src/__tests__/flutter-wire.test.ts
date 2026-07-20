import { describe, expect, expectTypeOf, it } from "vitest";
import {
  DOT_FLUTTER_RECIPE_WIRE_SCHEMA,
  DOT_FLUTTER_RECIPE_WIRE_VERSION,
  createFlutterRecipeWire,
  serializeFlutterRecipeWire,
} from "../flutter-wire";
import type { FlutterRecipeWireEnvelope } from "../flutter-wire";

describe("Flutter recipe wire contract", () => {
  it("retains recipe drops and capability metadata in a versioned envelope", () => {
    const envelope = createFlutterRecipeWire("p-4 cursor-pointer");

    expect(envelope).toEqual({
      schema: "hua.dot.flutter.recipe",
      version: 1,
      target: "flutter",
      recipe: {
        padding: { top: 16, right: 16, bottom: 16, left: 16 },
        _dropped: ["cursor"],
      },
      metadata: {
        dropped: ["cursor"],
        approximated: [],
        capabilities: { cursor: "unsupported" },
        details: {},
      },
    });
    expect(DOT_FLUTTER_RECIPE_WIRE_SCHEMA).toBe("hua.dot.flutter.recipe");
    expect(DOT_FLUTTER_RECIPE_WIRE_VERSION).toBe(1);
    expectTypeOf(envelope).toEqualTypeOf<FlutterRecipeWireEnvelope>();
  });

  it("owns a deep recipe snapshot instead of exposing the dot cache", () => {
    const first = createFlutterRecipeWire("p-4 cursor-pointer");
    const firstRecipe = first.recipe as {
      padding: { top: number };
      _dropped: string[];
    };

    firstRecipe.padding.top = 999;
    firstRecipe._dropped.length = 0;

    const second = createFlutterRecipeWire("p-4 cursor-pointer");
    const secondRecipe = second.recipe as {
      padding: { top: number };
      _dropped: string[];
    };

    expect(second.recipe).not.toBe(first.recipe);
    expect(secondRecipe.padding).not.toBe(firstRecipe.padding);
    expect(secondRecipe.padding.top).toBe(16);
    expect(secondRecipe._dropped).toEqual(["cursor"]);
    expect(second.metadata.dropped).toEqual(["cursor"]);
  });

  it("serializes canonical JSON with a stable golden byte sequence", () => {
    const envelope = createFlutterRecipeWire(
      "p-4 bg-primary-500 rounded-lg cursor-pointer",
    );

    expect(serializeFlutterRecipeWire(envelope)).toBe(
      '{"metadata":{"approximated":[],"capabilities":{"cursor":"unsupported"},"details":{},"dropped":["cursor"]},"recipe":{"_dropped":["cursor"],"decoration":{"borderRadius":{"bottomLeft":8,"bottomRight":8,"topLeft":8,"topRight":8},"color":"#2b6cd6"},"padding":{"bottom":16,"left":16,"right":16,"top":16}},"schema":"hua.dot.flutter.recipe","target":"flutter","version":1}',
    );
  });

  it("is deterministic for equivalent object insertion orders", () => {
    const expected = createFlutterRecipeWire("p-4 cursor-pointer");
    const reordered = {
      version: expected.version,
      recipe: {
        _dropped: expected.recipe._dropped,
        padding: expected.recipe.padding,
      },
      target: expected.target,
      metadata: {
        details: expected.metadata.details,
        capabilities: expected.metadata.capabilities,
        approximated: expected.metadata.approximated,
        dropped: expected.metadata.dropped,
      },
      schema: expected.schema,
    } satisfies FlutterRecipeWireEnvelope;

    expect(serializeFlutterRecipeWire(reordered)).toBe(
      serializeFlutterRecipeWire(expected),
    );
  });

  it("rejects wrong discriminators and non-JSON-safe values", () => {
    const envelope = createFlutterRecipeWire("p-4");

    expect(() =>
      serializeFlutterRecipeWire({ ...envelope, version: 2 } as never),
    ).toThrow("Invalid Flutter recipe wire envelope");
    expect(() =>
      serializeFlutterRecipeWire({
        ...envelope,
        recipe: { opacity: Number.NaN },
      } as never),
    ).toThrow("Flutter recipe wire values must be JSON-safe");

    const sparse = createFlutterRecipeWire("p-4");
    sparse.metadata.dropped = new Array(1);
    expect(() => serializeFlutterRecipeWire(sparse)).toThrow(
      "Flutter recipe wire values must be JSON-safe",
    );

    const accessor = createFlutterRecipeWire("p-4");
    accessor.recipe = structuredClone(accessor.recipe);
    Object.defineProperty(accessor.recipe, "opacity", {
      enumerable: true,
      get: () => 0.5,
    });
    expect(() => serializeFlutterRecipeWire(accessor)).toThrow(
      "Flutter recipe wire values must be JSON-safe",
    );

    const trappingProxy = new Proxy(createFlutterRecipeWire("p-4"), {
      ownKeys() {
        throw new Error("SECRET_PROXY_TRAP");
      },
    });
    expect(() => serializeFlutterRecipeWire(trappingProxy)).toThrow(
      "Flutter recipe wire values must be JSON-safe",
    );
    expect(() => serializeFlutterRecipeWire(trappingProxy)).not.toThrow(
      /SECRET_PROXY_TRAP/,
    );
  });

  it.each(["4294967295", "extra"])(
    "rejects an array own property that is not an exact index: %s",
    (key) => {
      const envelope = createFlutterRecipeWire("p-4");
      Object.defineProperty(envelope.metadata.dropped, key, {
        value: "discarded-without-validation",
        enumerable: true,
        configurable: true,
      });

      expect(() => serializeFlutterRecipeWire(envelope)).toThrow(
        "Flutter recipe wire values must be JSON-safe",
      );
    },
  );
  it("uses one own length descriptor when snapshotting an array Proxy", () => {
    const envelope = createFlutterRecipeWire("p-4 cursor-pointer");
    let lengthReads = 0;
    envelope.metadata.dropped = new Proxy(["cursor"], {
      get(target, key, receiver) {
        if (key === "length") {
          lengthReads += 1;
          return lengthReads === 1 ? 1 : 0;
        }
        return Reflect.get(target, key, receiver);
      },
    });

    expect(
      JSON.parse(serializeFlutterRecipeWire(envelope)).metadata.dropped,
    ).toEqual(["cursor"]);
    expect(lengthReads).toBe(0);
  });

  it("rejects a lying array length with noncontiguous canonical own keys", () => {
    const envelope = createFlutterRecipeWire("p-4");
    const descriptorReads: PropertyKey[] = [];
    let lengthDescriptorReads = 0;
    envelope.metadata.dropped = new Proxy(
      ["accepted-zero", "hidden-one", "accepted-two"],
      {
        ownKeys() {
          return ["0", "2", "length"];
        },
        getOwnPropertyDescriptor(target, key) {
          if (key === "length") {
            lengthDescriptorReads += 1;
            return {
              ...Reflect.getOwnPropertyDescriptor(target, key),
              value: 2,
            };
          }
          descriptorReads.push(key);
          return Reflect.getOwnPropertyDescriptor(target, key);
        },
      },
    );

    expect(() => serializeFlutterRecipeWire(envelope)).toThrow(
      "Flutter recipe wire values must be JSON-safe",
    );
    expect(lengthDescriptorReads).toBe(1);
    expect(descriptorReads).toEqual([]);
  });

  it("preserves dangerous-looking own keys as inert JSON data", () => {
    const envelope = createFlutterRecipeWire("p-4");
    const nested = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(nested, "__proto__", {
      value: { safe: true },
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(nested, "constructor", {
      value: "constructor-data",
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(nested, "prototype", {
      value: "prototype-data",
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(envelope.recipe, "nested", {
      value: nested,
      enumerable: true,
      configurable: true,
    });

    const parsed = JSON.parse(serializeFlutterRecipeWire(envelope)) as {
      recipe: { nested: Record<string, unknown> };
    };

    expect(Object.hasOwn(parsed.recipe.nested, "__proto__")).toBe(true);
    expect(parsed.recipe.nested).toEqual(
      JSON.parse(
        '{"__proto__":{"safe":true},"constructor":"constructor-data","prototype":"prototype-data"}',
      ),
    );
  });

  it("does not mutate the executable recipe while serializing", () => {
    const envelope = createFlutterRecipeWire("p-4 cursor-pointer");
    const before = structuredClone(envelope);

    serializeFlutterRecipeWire(envelope);

    expect(envelope).toEqual(before);
  });
});
