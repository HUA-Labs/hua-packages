/**
 * SDUI registry.tsx — negative & edge case tests
 *
 * extendRegistry / hasComponent의 경계 조건.
 * 소스의 실제 동작을 확인하고 의도치 않은 동작을 문서화한다.
 */

import { describe, it, expect } from "vitest";
import {
  defaultRegistry,
  extendRegistry,
  hasComponent,
} from "../../sdui/registry";
import React from "react";
import type { SDUIComponentRegistry } from "../../sdui/types";

// ── extendRegistry — edge cases ───────────────────────────────────────────────

describe("extendRegistry — edge cases", () => {
  // 빈 객체 전달 — defaultRegistry와 동일해야 함
  it("with empty object returns registry equivalent to defaultRegistry", () => {
    const extended = extendRegistry({});
    // 모든 default 키가 존재해야 함
    for (const key of Object.keys(defaultRegistry)) {
      expect(extended[key]).toBeDefined();
    }
  });

  // 빈 객체를 전달해도 기존 컴포넌트가 변경되지 않음
  it("with empty object preserves all defaultRegistry component references", () => {
    const extended = extendRegistry({});
    expect(extended.Button).toBe(defaultRegistry.Button);
    expect(extended.Card).toBe(defaultRegistry.Card);
    expect(extended.Text).toBe(defaultRegistry.Text);
  });

  // null 컴포넌트 값 — TypeScript 타입상 불가능하지만 런타임에서 허용
  it("allows null component value at runtime (type override)", () => {
    const extended = extendRegistry({
      NullComp: null as unknown as React.ComponentType<Record<string, unknown>>,
    });
    // 레지스트리에 null로 등록됨 — 런타임에서는 타입 가드 없이 그대로 저장
    expect(extended.NullComp).toBeNull();
  });

  // undefined 컴포넌트 값
  it("allows undefined component value at runtime (type override)", () => {
    const extended = extendRegistry({
      UndefComp: undefined as unknown as React.ComponentType<
        Record<string, unknown>
      >,
    });
    expect(extended.UndefComp).toBeUndefined();
  });

  // 대량 커스텀 컴포넌트 추가
  it("handles large number of custom components", () => {
    const customs: SDUIComponentRegistry = {};
    for (let i = 0; i < 100; i++) {
      customs[`Custom${i}`] = () => null;
    }
    const extended = extendRegistry(customs);
    // 모든 커스텀 컴포넌트가 존재해야 함
    for (let i = 0; i < 100; i++) {
      expect(extended[`Custom${i}`]).toBeDefined();
    }
    // 기본 컴포넌트도 그대로 존재
    expect(extended.Button).toBeDefined();
  });

  // 여러 번 체인해서 확장
  it("can be chained — extend an already-extended registry", () => {
    const Comp1: React.FC<Record<string, unknown>> = () => null;
    const Comp2: React.FC<Record<string, unknown>> = () => null;
    const first = extendRegistry({ Comp1 });
    // extendRegistry는 defaultRegistry를 기반으로만 확장 (체인 불가)
    // first를 다시 전달하면 defaultRegistry + first 객체가 spread됨
    const second = extendRegistry({ ...first, Comp2 });
    expect(second.Comp1).toBe(Comp1);
    expect(second.Comp2).toBe(Comp2);
  });

  // 동일 키를 두 번 extend해도 마지막이 이김
  it("last extendRegistry call wins when same key is overridden twice", () => {
    const V1: React.FC<Record<string, unknown>> = () =>
      React.createElement("div", null, "v1");
    const V2: React.FC<Record<string, unknown>> = () =>
      React.createElement("div", null, "v2");
    // 두 번 연속으로 동일 키를 확장 — 두 번째가 이김
    const first = extendRegistry({ Button: V1 });
    const second = extendRegistry({ ...first, Button: V2 });
    expect(second.Button).toBe(V2);
    // 첫 번째 extend 결과는 V1
    expect(first.Button).toBe(V1);
  });

  // extendRegistry를 여러 번 호출해도 defaultRegistry 자체는 변경 없음
  it("repeated extendRegistry calls do not accumulate state in defaultRegistry", () => {
    const A: React.FC<Record<string, unknown>> = () => null;
    const B: React.FC<Record<string, unknown>> = () => null;
    extendRegistry({ CompA: A });
    extendRegistry({ CompB: B });
    // defaultRegistry에는 CompA, CompB가 없어야 함
    expect((defaultRegistry as Record<string, unknown>).CompA).toBeUndefined();
    expect((defaultRegistry as Record<string, unknown>).CompB).toBeUndefined();
  });

  // 특수 문자 키
  it("supports special character keys", () => {
    const Comp: React.FC<Record<string, unknown>> = () => null;
    const extended = extendRegistry({ "my-component": Comp, "123Start": Comp });
    expect(extended["my-component"]).toBe(Comp);
    expect(extended["123Start"]).toBe(Comp);
  });
});

// ── hasComponent — edge cases ─────────────────────────────────────────────────

describe("hasComponent — edge cases", () => {
  // null registry — in 연산자는 null에서 에러 발생
  it("throws when registry is null (in operator on null fails)", () => {
    // 소스: return type in registry — null에 in 연산자 사용 시 TypeError
    expect(() =>
      hasComponent(null as unknown as SDUIComponentRegistry, "Button"),
    ).toThrow();
  });

  // undefined type
  it("returns false for undefined type (not in registry)", () => {
    expect(hasComponent(defaultRegistry, undefined as unknown as string)).toBe(
      false,
    );
  });

  // null type
  it("returns false for null type (not in registry)", () => {
    expect(hasComponent(defaultRegistry, null as unknown as string)).toBe(
      false,
    );
  });

  // 숫자 타입 문자열
  it("returns false for numeric string type not in registry", () => {
    expect(hasComponent(defaultRegistry, "42")).toBe(false);
  });

  // 공백 포함 type
  it("returns false for type with whitespace", () => {
    expect(hasComponent(defaultRegistry, " Button")).toBe(false);
    expect(hasComponent(defaultRegistry, "Button ")).toBe(false);
    expect(hasComponent(defaultRegistry, "But ton")).toBe(false);
  });

  // 빈 레지스트리
  it("returns false for any type in empty registry", () => {
    const emptyRegistry: SDUIComponentRegistry = {};
    expect(hasComponent(emptyRegistry, "Button")).toBe(false);
    expect(hasComponent(emptyRegistry, "")).toBe(false);
    expect(hasComponent(emptyRegistry, "anything")).toBe(false);
  });

  // defaultRegistry에서 null로 덮어쓴 경우 — in 연산자는 값에 무관하게 키 존재 여부
  it("returns true even when component value is null (key exists in registry)", () => {
    const registry = extendRegistry({
      NullComp: null as unknown as React.ComponentType<Record<string, unknown>>,
    });
    // null 값이지만 키가 존재하므로 hasComponent는 true
    expect(hasComponent(registry, "NullComp")).toBe(true);
  });

  // Object.prototype 프로퍼티 — 'toString', 'constructor' 등
  it("returns false for Object.prototype properties like toString", () => {
    const registry = extendRegistry({});
    expect(hasComponent(registry, "toString")).toBe(false);
    expect(hasComponent(registry, "constructor")).toBe(false);
    expect(hasComponent(registry, "hasOwnProperty")).toBe(false);
    expect(hasComponent(registry, "__proto__")).toBe(false);
  });

  // forwardRef 컴포넌트도 hasComponent에서 true
  it("returns true for forwardRef component in registry", () => {
    const ForwardedComp = React.forwardRef<
      HTMLDivElement,
      Record<string, unknown>
    >((props, ref) => React.createElement("div", { ...props, ref }));
    const registry = extendRegistry({
      ForwardedComp: ForwardedComp as unknown as React.ComponentType<
        Record<string, unknown>
      >,
    });
    expect(hasComponent(registry, "ForwardedComp")).toBe(true);
  });

  // 대소문자 구별 추가 확인
  it("is case-sensitive for all default component names", () => {
    expect(hasComponent(defaultRegistry, "box")).toBe(false);
    expect(hasComponent(defaultRegistry, "BOX")).toBe(false);
    expect(hasComponent(defaultRegistry, "flex")).toBe(false);
    expect(hasComponent(defaultRegistry, "TEXT")).toBe(false);
  });
});
