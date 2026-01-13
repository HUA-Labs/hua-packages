"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useMouse 훅의 옵션 / useMouse hook options
 * @property {"page" | "element" | "viewport"} [type="page"] - 좌표 타입 / Coordinate type
 * @property {boolean} [touch=false] - 터치 이벤트 포함 / Include touch events
 * @property {number} [throttle=0] - 쓰로틀 간격 (ms) / Throttle interval
 */
export interface UseMouseOptions {
  type?: "page" | "element" | "viewport";
  touch?: boolean;
  throttle?: number;
}

/**
 * useMouse 훅의 반환값 / useMouse hook return value
 */
export interface UseMouseReturn<T extends HTMLElement = HTMLElement> {
  ref: React.RefObject<T | null>;
  x: number;
  y: number;
  elementX: number;
  elementY: number;
  elementPositionX: number;
  elementPositionY: number;
  isInside: boolean;
  isMoving: boolean;
}

/**
 * useMouse 훅 / useMouse hook
 *
 * 마우스 위치를 추적하는 훅입니다.
 * 커서 효과, 마우스 따라다니는 요소 등에 사용합니다.
 *
 * Hook that tracks mouse position.
 * Used for cursor effects, mouse-following elements, etc.
 *
 * @example
 * // 전역 마우스 위치 / Global mouse position
 * const { x, y } = useMouse();
 *
 * return (
 *   <div style={{ transform: `translate(${x}px, ${y}px)` }} className="cursor" />
 * );
 *
 * @example
 * // 요소 내 상대 위치 / Relative position in element
 * const { ref, elementX, elementY, isInside } = useMouse({ type: "element" });
 *
 * return (
 *   <div ref={ref} className="relative">
 *     {isInside && (
 *       <div style={{ left: elementX, top: elementY }} className="spotlight" />
 *     )}
 *   </div>
 * );
 */
export function useMouse<T extends HTMLElement = HTMLElement>(
  options: UseMouseOptions = {}
): UseMouseReturn<T> {
  const { type = "page", touch = false, throttle = 0 } = options;

  const ref = useRef<T>(null);
  const [state, setState] = useState({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
    elementPositionX: 0,
    elementPositionY: 0,
    isInside: false,
    isMoving: false,
  });

  const lastUpdate = useRef(0);
  const moveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const now = Date.now();
      if (throttle > 0 && now - lastUpdate.current < throttle) return;
      lastUpdate.current = now;

      let x = clientX;
      let y = clientY;
      let elementX = 0;
      let elementY = 0;
      let elementPositionX = 0;
      let elementPositionY = 0;
      let isInside = false;

      // Calculate page coordinates
      if (type === "page") {
        x = clientX + window.scrollX;
        y = clientY + window.scrollY;
      }

      // Calculate element-relative coordinates
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        elementX = clientX - rect.left;
        elementY = clientY - rect.top;
        elementPositionX = elementX / rect.width; // 0-1 normalized
        elementPositionY = elementY / rect.height; // 0-1 normalized
        isInside =
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom;
      }

      setState({
        x,
        y,
        elementX,
        elementY,
        elementPositionX,
        elementPositionY,
        isInside,
        isMoving: true,
      });

      if (moveTimeout.current) clearTimeout(moveTimeout.current);
      moveTimeout.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isMoving: false }));
      }, 150);
    },
    [type, throttle]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    if (touch) {
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (touch) {
        window.removeEventListener("touchmove", handleTouchMove);
      }
      if (moveTimeout.current) clearTimeout(moveTimeout.current);
    };
  }, [handleMove, touch]);

  return {
    ref,
    ...state,
  };
}

export default useMouse;
