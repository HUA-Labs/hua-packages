"use client";

import React from "react";
import { clsx } from "clsx";

/**
 * Slot 컴포넌트
 *
 * Radix UI의 asChild 패턴을 구현합니다.
 * 자식 요소의 props와 ref를 병합하여 하나의 요소로 렌더링합니다.
 *
 * @example
 * // Button에서 asChild 사용
 * <Button asChild>
 *   <Link href="/home">홈으로</Link>
 * </Button>
 *
 * @see https://www.radix-ui.com/primitives/docs/utilities/slot
 */

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

/**
 * 여러 ref를 하나로 합칩니다
 */
function composeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (node) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}

/**
 * 이벤트 핸들러를 합성합니다
 * 
 * 부모(slot) 핸들러를 먼저 실행하고, 그 다음 자식 핸들러를 실행합니다.
 * defaultPrevented가 true이면 자식 핸들러는 실행하지 않습니다.
 */
function composeEventHandlers<E>(
  parentHandler?: (event: E) => void,
  childHandler?: (event: E) => void
): (event: E) => void {
  return (event) => {
    parentHandler?.(event);
    if (!(event as unknown as { defaultPrevented: boolean }).defaultPrevented) {
      childHandler?.(event);
    }
  };
}

/**
 * className을 병합합니다
 */
function mergeClassName(
  slotClassName?: string,
  childClassName?: string
): string | undefined {
  if (!slotClassName && !childClassName) return undefined;
  return clsx(slotClassName, childClassName);
}

/**
 * style을 병합합니다
 */
function mergeStyle(
  slotStyle?: React.CSSProperties,
  childStyle?: React.CSSProperties
): React.CSSProperties | undefined {
  if (!slotStyle && !childStyle) return undefined;
  return { ...slotStyle, ...childStyle };
}

/**
 * props를 병합합니다 (이벤트 핸들러, className, style 등)
 */
function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>
): Record<string, unknown> {
  const mergedProps: Record<string, unknown> = { ...slotProps };

  for (const propName in childProps) {
    const slotValue = slotProps[propName];
    const childValue = childProps[propName];

    // 이벤트 핸들러 병합 (부모(slot) → 자식 순서)
    if (/^on[A-Z]/.test(propName)) {
      if (slotValue && childValue) {
        mergedProps[propName] = composeEventHandlers(
          slotValue as (event: unknown) => void,
          childValue as (event: unknown) => void
        );
      } else {
        mergedProps[propName] = childValue || slotValue;
      }
    }
    // className 병합
    else if (propName === "className") {
      mergedProps[propName] = mergeClassName(
        slotValue as string | undefined,
        childValue as string | undefined
      );
    }
    // style 병합
    else if (propName === "style") {
      mergedProps[propName] = mergeStyle(
        slotValue as React.CSSProperties | undefined,
        childValue as React.CSSProperties | undefined
      );
    }
    // 그 외: 자식 값 우선
    else {
      mergedProps[propName] = childValue !== undefined ? childValue : slotValue;
    }
  }

  return mergedProps;
}

/**
 * 유효한 단일 React 요소인지 확인
 */
function isSlottable(child: React.ReactNode): child is React.ReactElement {
  return React.isValidElement(child);
}

/**
 * Slot 컴포넌트
 *
 * 자식 요소에 부모의 props를 주입합니다.
 * asChild 패턴을 구현할 때 사용합니다.
 */
const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    const childArray = React.Children.toArray(children);

    // 유효한 단일 자식이 있는지 확인
    if (childArray.length !== 1) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[Slot] asChild는 정확히 하나의 자식 요소가 필요합니다."
        );
      }
      return null;
    }

    const child = childArray[0];

    if (!isSlottable(child)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Slot] 자식은 유효한 React 요소여야 합니다.");
      }
      return null;
    }

    // 자식 요소의 props와 ref 추출
    const childProps = child.props as Record<string, unknown>;
    const childRef = (child as unknown as { ref?: React.Ref<HTMLElement> }).ref;

    // props와 ref 병합
    const mergedProps = mergeProps(slotProps, childProps);
    const mergedRef = composeRefs(forwardedRef, childRef);

    return React.cloneElement(child, {
      ...mergedProps,
      ref: mergedRef,
    } as React.Attributes);
  }
);

Slot.displayName = "Slot";

export { Slot, composeRefs, mergeProps };
export type { SlotProps };
