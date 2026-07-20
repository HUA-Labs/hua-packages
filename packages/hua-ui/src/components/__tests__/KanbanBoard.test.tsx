import React from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dnd = vi.hoisted(() => ({
  contextProps: null as Record<string, unknown> | null,
  sensorCalls: [] as Array<{
    name: string;
    options: Record<string, unknown> | undefined;
  }>,
  sortableCalls: [] as Array<Record<string, unknown>>,
  setNodeRef: vi.fn<(node: HTMLElement | null) => void>(),
  listenerKeyDown: vi.fn<(event: React.KeyboardEvent<HTMLElement>) => void>(
    (event) => {
      if (event.key === "Enter" || event.key === " ") event.preventDefault();
    },
  ),
  listenerPointerDown:
    vi.fn<(event: React.PointerEvent<HTMLElement>) => void>(),
}));

vi.mock("@dnd-kit/core", async () => {
  const ReactModule = await import("react");
  class KeyboardSensor {}
  class MouseSensor {}
  class PointerSensor {}
  class TouchSensor {}

  return {
    DndContext: ({ children, ...props }: React.PropsWithChildren) => {
      dnd.contextProps = props as Record<string, unknown>;
      return ReactModule.createElement(
        "div",
        { "data-testid": "dnd-context" },
        children,
      );
    },
    DragOverlay: ({ children }: React.PropsWithChildren) =>
      ReactModule.createElement(ReactModule.Fragment, null, children),
    KeyboardSensor,
    MouseSensor,
    PointerSensor,
    TouchSensor,
    closestCenter: vi.fn(),
    useSensor: (
      sensor: { name?: string },
      options?: Record<string, unknown>,
    ) => {
      const descriptor = { name: sensor.name ?? "unknown", options };
      dnd.sensorCalls.push(descriptor);
      return descriptor;
    },
    useSensors: (...sensors: unknown[]) => sensors,
  };
});

vi.mock("@dnd-kit/sortable", async () => {
  const ReactModule = await import("react");
  const arrayMove = <T,>(items: T[], from: number, to: number): T[] => {
    const result = [...items];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
  };

  return {
    SortableContext: ({ children }: React.PropsWithChildren) =>
      ReactModule.createElement(ReactModule.Fragment, null, children),
    arrayMove,
    horizontalListSortingStrategy: vi.fn(),
    verticalListSortingStrategy: vi.fn(),
    sortableKeyboardCoordinates: vi.fn(),
    useSortable: (options: Record<string, unknown>) => {
      dnd.sortableCalls.push(options);
      return {
        attributes: {
          role: "button",
          "aria-roledescription": "sortable",
          "aria-describedby": "dnd-instructions",
        },
        listeners: {
          onKeyDown: dnd.listenerKeyDown,
          onPointerDown: dnd.listenerPointerDown,
        },
        setNodeRef: dnd.setNodeRef,
        transform: null,
        transition: undefined,
        isDragging: false,
      };
    },
  };
});

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => undefined } },
}));

import { KanbanBoard } from "../dashboard/kanban/KanbanBoard";
import { KanbanCard } from "../dashboard/kanban/KanbanCard";
import { KanbanProvider } from "../dashboard/kanban/KanbanContext";
import type {
  KanbanCard as KanbanCardData,
  KanbanColumn,
} from "../dashboard/kanban/types";

type DndHandler = (event: {
  active: { id: string };
  over: { id: string } | null;
}) => void;

interface CapturedContext {
  accessibility?: {
    announcements?: {
      onDragStart?: DndHandler;
      onDragOver?: DndHandler;
      onDragEnd?: DndHandler;
      onDragCancel?: DndHandler;
    };
    screenReaderInstructions?: { draggable?: string };
  };
  onDragStart?: DndHandler;
  onDragOver?: DndHandler;
  onDragEnd?: DndHandler;
  onDragCancel?: DndHandler;
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "Todo" },
  { id: "doing", title: "Doing", limit: 2 },
];

const cards: KanbanCardData[] = [
  { id: "card-a", columnId: "todo", order: 0, title: "First card" },
  { id: "card-b", columnId: "doing", order: 0, title: "Second card" },
];

function event(activeId: string, overId: string | null) {
  return {
    active: { id: activeId },
    over: overId === null ? null : { id: overId },
  };
}

async function renderBoard(
  props: Partial<React.ComponentProps<typeof KanbanBoard>> = {},
) {
  const result = render(
    <KanbanBoard
      columns={columns}
      cards={cards}
      allowAddCard={false}
      {...props}
    />,
  );
  await waitFor(() => expect(dnd.contextProps).not.toBeNull());
  return result;
}

function context(): CapturedContext {
  if (!dnd.contextProps) throw new Error("DndContext was not rendered");
  return dnd.contextProps as CapturedContext;
}

beforeEach(() => {
  dnd.contextProps = null;
  dnd.sensorCalls.length = 0;
  dnd.sortableCalls.length = 0;
  dnd.setNodeRef.mockClear();
  dnd.listenerKeyDown.mockClear();
  dnd.listenerPointerDown.mockClear();
});

afterEach(() => {
  cleanup();
  document.getElementById("kanban-card-keyframes")?.remove();
  document.getElementById("kanban-column-keyframes")?.remove();
});

describe("KanbanBoard DnD transaction", () => {
  it("uses bounded mouse, touch, and sortable keyboard sensors", async () => {
    await renderBoard();

    const latestSensors = dnd.sensorCalls.slice(-3);
    expect(latestSensors.map(({ name }) => name)).toEqual([
      "MouseSensor",
      "TouchSensor",
      "KeyboardSensor",
    ]);
    expect(latestSensors[0]?.options).toEqual({
      activationConstraint: { distance: 8 },
    });
    expect(latestSensors[1]?.options).toEqual({
      activationConstraint: { delay: 250, tolerance: 5 },
    });
    expect(latestSensors[2]?.options).toMatchObject({
      coordinateGetter: expect.any(Function),
    });
  });

  it("keeps cross-column hover preview callback-free until one valid drop", async () => {
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    const onKanbanDragEnd = vi.fn();
    await renderBoard({ onCardsChange, onCardMove, onKanbanDragEnd });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragOver?.(event("card-a", "card-b")));

    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();

    act(() => context().onDragEnd?.(event("card-a", "card-b")));
    expect(onCardsChange).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledWith("card", "card-a");
    expect(onCardMove).toHaveBeenCalledWith({
      cardId: "card-a",
      fromColumnId: "todo",
      toColumnId: "doing",
      toIndex: 0,
    });
  });

  it("keeps one external target stable across active-self collisions and terminal drop", async () => {
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    const onKanbanDragEnd = vi.fn();
    await renderBoard({ onCardsChange, onCardMove, onKanbanDragEnd });
    const announcements = context().accessibility?.announcements;

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragOver?.(event("card-a", "card-b")));
    expect(announcements?.onDragOver?.(event("card-a", "card-b"))).toMatch(
      /Second card/,
    );

    await waitFor(() => {
      const renderedCard = screen
        .getAllByText("First card")
        .find((element) => element.closest('[role="list"]'));
      expect(renderedCard?.closest('[role="list"]')).toHaveAttribute(
        "aria-label",
        "Doing 카드 목록",
      );
    });

    act(() => context().onDragOver?.(event("card-a", "card-a")));
    expect(
      announcements?.onDragOver?.(event("card-a", "card-a")),
    ).toBeUndefined();
    act(() => context().onDragOver?.(event("card-a", "card-a")));
    act(() => context().onDragOver?.(event("card-a", "card-b")));
    expect(
      announcements?.onDragOver?.(event("card-a", "card-b")),
    ).toBeUndefined();

    await waitFor(() => {
      const renderedCard = screen
        .getAllByText("First card")
        .find((element) => element.closest('[role="list"]'));
      expect(renderedCard?.closest('[role="list"]')).toHaveAttribute(
        "aria-label",
        "Doing 카드 목록",
      );
    });
    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();

    act(() => context().onDragEnd?.(event("card-a", "card-a")));

    expect(onCardsChange).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledWith({
      cardId: "card-a",
      fromColumnId: "todo",
      toColumnId: "doing",
      toIndex: 0,
    });
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledWith("card", "card-a");
  });

  it("discards the stable external target after no-target, invalid, and WIP over states", async () => {
    const resetColumns: KanbanColumn[] = [
      ...columns,
      { id: "done", title: "Done", limit: 1 },
    ];
    const resetCards: KanbanCardData[] = [
      ...cards,
      { id: "card-c", columnId: "done", order: 0, title: "Third card" },
    ];
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    const onKanbanDragEnd = vi.fn();
    await renderBoard({
      columns: resetColumns,
      cards: resetCards,
      onCardsChange,
      onCardMove,
      onKanbanDragEnd,
    });

    for (const resetTarget of [null, "missing-card", "card-c"] as const) {
      act(() => context().onDragStart?.(event("card-a", null)));
      act(() => context().onDragOver?.(event("card-a", "card-b")));
      act(() => context().onDragOver?.(event("card-a", resetTarget)));
      act(() => context().onDragEnd?.(event("card-a", "card-a")));
    }

    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(3);

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragOver?.(event("card-a", "card-b")));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));
    expect(onCardsChange).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(4);
  });

  it("captures the controlled move payload before consumer card mutation", async () => {
    const onCardsChange = vi.fn((nextCards: KanbanCardData[]) => {
      const movedCard = nextCards.find(({ id }) => id === "card-a");
      if (!movedCard) throw new Error("committed card missing");
      movedCard.columnId = "consumer-mutated";
      movedCard.order = 999;
    });
    const onCardMove = vi.fn();
    await renderBoard({ onCardsChange, onCardMove });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));

    expect(onCardsChange).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledWith({
      cardId: "card-a",
      fromColumnId: "todo",
      toColumnId: "doing",
      toIndex: 0,
    });
    expect(cards[0]).toMatchObject({ columnId: "todo", order: 0 });
  });

  it("isolates uncontrolled committed state from the consumer callback graph", async () => {
    const dueDate = new Date("2026-07-16T00:00:00.000Z");
    const defaultCards: KanbanCardData[] = [
      {
        ...cards[0],
        tags: ["original-tag"],
        assignee: { name: "Original assignee" },
        dueDate,
        metadata: { nested: { revision: 1 } },
      },
      cards[1],
    ];
    let callbackCount = 0;
    let secondPayload: KanbanCardData[] | null = null;
    const onCardsChange = vi.fn((nextCards: KanbanCardData[]) => {
      callbackCount += 1;
      if (callbackCount === 2) {
        secondPayload = nextCards;
        return;
      }
      const movedCard = nextCards.find(({ id }) => id === "card-a");
      if (!movedCard) throw new Error("committed card missing");
      movedCard.columnId = "consumer-mutated";
      movedCard.order = 999;
      movedCard.tags?.push("consumer-tag");
      if (movedCard.assignee) movedCard.assignee.name = "Consumer assignee";
      if (movedCard.dueDate instanceof Date) {
        movedCard.dueDate.setUTCFullYear(2030);
      }
      const metadata = movedCard.metadata as {
        nested: { revision: number };
      };
      metadata.nested.revision = 999;
    });
    const onCardMove = vi.fn();
    await renderBoard({
      columns: undefined,
      cards: undefined,
      defaultColumns: columns,
      defaultCards,
      onCardsChange,
      onCardMove,
    });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));

    await waitFor(() => {
      const card = screen.getByText("First card");
      expect(card.closest('[role="list"]')).toHaveAttribute(
        "aria-label",
        "Doing 카드 목록",
      );
    });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragEnd?.(event("card-a", "todo")));

    expect(onCardsChange).toHaveBeenCalledTimes(2);
    expect(onCardMove).toHaveBeenCalledTimes(2);
    const movedCard = secondPayload?.find(({ id }) => id === "card-a");
    expect(movedCard).toMatchObject({
      columnId: "todo",
      order: 0,
      tags: ["original-tag"],
      assignee: { name: "Original assignee" },
      metadata: { nested: { revision: 1 } },
    });
    expect(movedCard?.dueDate).toBeInstanceOf(Date);
    expect((movedCard?.dueDate as Date).toISOString()).toBe(
      "2026-07-16T00:00:00.000Z",
    );
    expect(dueDate.toISOString()).toBe("2026-07-16T00:00:00.000Z");
  });

  it("clears terminal ownership when the cards callback throws", async () => {
    const onKanbanDragStart = vi.fn();
    const onKanbanDragEnd = vi.fn();
    const onCardsChange = vi.fn(() => {
      throw new Error("consumer callback failed");
    });
    await renderBoard({
      onKanbanDragStart,
      onKanbanDragEnd,
      onCardsChange,
    });

    act(() => context().onDragStart?.(event("card-a", null)));
    expect(() =>
      act(() => context().onDragEnd?.(event("card-a", "card-b"))),
    ).toThrow("consumer callback failed");
    expect(onKanbanDragStart).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragCancel?.(event("card-a", null)));
    expect(onKanbanDragStart).toHaveBeenCalledTimes(2);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(2);
  });

  it("clears hover preview on Escape without committing callbacks", async () => {
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    await renderBoard({ onCardsChange, onCardMove });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragOver?.(event("card-a", "card-b")));
    act(() => context().onDragCancel?.(event("card-a", "card-b")));

    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("clears a no-target drop and admits one fresh transaction afterward", async () => {
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    await renderBoard({ onCardsChange, onCardMove });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragEnd?.(event("card-a", null)));
    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragOver?.(event("card-a", "card-b")));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));
    expect(onCardsChange).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledTimes(1);
  });

  it("keeps a same-index card drop byte-preserving and callback-free", async () => {
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    await renderBoard({
      columns: [{ id: "todo", title: "Todo" }],
      cards: [{ id: "only-card", columnId: "todo", title: "Only card" }],
      onCardsChange,
      onCardMove,
    });

    act(() => context().onDragStart?.(event("only-card", null)));
    act(() => context().onDragEnd?.(event("only-card", "todo")));

    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("rejects a full foreign WIP target but preserves same-column reorder at its limit", async () => {
    const limitedColumns: KanbanColumn[] = [
      { id: "todo", title: "Todo" },
      { id: "doing", title: "Doing", limit: 1 },
    ];
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    const { rerender } = await renderBoard({
      columns: limitedColumns,
      onCardsChange,
      onCardMove,
    });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragOver?.(event("card-a", "card-b")));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));
    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();

    const sameColumnCards: KanbanCardData[] = [
      { id: "card-a", columnId: "doing", order: 0, title: "First" },
      { id: "card-b", columnId: "doing", order: 1, title: "Second" },
    ];
    rerender(
      <KanbanBoard
        columns={[{ id: "doing", title: "Doing", limit: 2 }]}
        cards={sameColumnCards}
        allowAddCard={false}
        onCardsChange={onCardsChange}
        onCardMove={onCardMove}
      />,
    );
    await waitFor(() => expect(context().onDragStart).toBeTypeOf("function"));
    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));

    expect(onCardsChange).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenLastCalledWith({
      cardId: "card-a",
      fromColumnId: "doing",
      toColumnId: "doing",
      toIndex: 1,
    });
  });

  it("fails closed when controlled structural authority drifts during a drag", async () => {
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    const { rerender } = await renderBoard({ onCardsChange, onCardMove });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragOver?.(event("card-a", "card-b")));
    rerender(
      <KanbanBoard
        columns={columns}
        cards={[{ ...cards[0], title: "Changed during drag" }, cards[1]]}
        allowAddCard={false}
        onCardsChange={onCardsChange}
        onCardMove={onCardMove}
      />,
    );
    await waitFor(() => expect(context().onDragEnd).toBeTypeOf("function"));
    act(() => context().onDragEnd?.(event("card-a", "card-a")));

    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("fails closed when controlled metadata bytes drift during a drag", async () => {
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    const metadataCards: KanbanCardData[] = [
      { ...cards[0], metadata: { revision: 1 } },
      cards[1],
    ];
    const { rerender } = await renderBoard({
      cards: metadataCards,
      onCardsChange,
      onCardMove,
    });

    act(() => context().onDragStart?.(event("card-a", null)));
    rerender(
      <KanbanBoard
        columns={columns}
        cards={[
          { ...metadataCards[0], metadata: { revision: 2 } },
          metadataCards[1],
        ]}
        allowAddCard={false}
        onCardsChange={onCardsChange}
        onCardMove={onCardMove}
      />,
    );
    await waitFor(() => expect(context().onDragEnd).toBeTypeOf("function"));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));

    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("canonicalizes valid metadata and rejects cyclic, non-plain, and unsupported values", async () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const inherited = Object.create({ inherited: true }) as Record<
      string,
      unknown
    >;
    inherited.value = "own";
    const accessorRead = vi.fn(() => "must not run");
    const accessor: Record<string, unknown> = {};
    Object.defineProperty(accessor, "secret", {
      enumerable: true,
      get: accessorRead,
    });
    const hidden: Record<string, unknown> = {};
    Object.defineProperty(hidden, "hidden", {
      enumerable: false,
      value: "not canonical",
    });
    const symbolKey: Record<string, unknown> = { value: "own" };
    (symbolKey as Record<PropertyKey, unknown>)[Symbol("not-canonical")] =
      "hidden authority";
    const sparse = new Array(2) as unknown[];
    sparse[1] = "only second";
    const metadataCases: Array<Record<string, unknown>> = [
      cyclic,
      inherited,
      accessor,
      hidden,
      symbolKey,
      { unsupported: () => "not canonical" },
      { unsupported: undefined },
      { unsupported: 1n },
      { unsupported: Number.POSITIVE_INFINITY },
      { values: sparse },
      { oversized: "x".repeat(8193) },
    ];

    for (const metadata of metadataCases) {
      const onKanbanDragStart = vi.fn();
      await renderBoard({
        cards: [{ ...cards[0], metadata }, cards[1]],
        onKanbanDragStart,
      });
      act(() => context().onDragStart?.(event("card-a", null)));
      expect(onKanbanDragStart).not.toHaveBeenCalled();
      cleanup();
      dnd.contextProps = null;
    }
    expect(accessorRead).not.toHaveBeenCalled();

    const onKanbanDragStart = vi.fn();
    const onKanbanDragEnd = vi.fn();
    const onCardsChange = vi.fn();
    const canonicalCards: KanbanCardData[] = [
      {
        ...cards[0],
        metadata: { second: 2, first: 1, values: [true, { nested: "kept" }] },
      },
      cards[1],
    ];
    const { rerender } = await renderBoard({
      cards: canonicalCards,
      onKanbanDragStart,
      onKanbanDragEnd,
      onCardsChange,
    });
    act(() => context().onDragStart?.(event("card-a", null)));
    rerender(
      <KanbanBoard
        columns={columns}
        cards={[
          {
            ...cards[0],
            metadata: {
              first: 1,
              second: 2,
              values: [true, { nested: "kept" }],
            },
          },
          cards[1],
        ]}
        allowAddCard={false}
        onKanbanDragStart={onKanbanDragStart}
        onKanbanDragEnd={onKanbanDragEnd}
        onCardsChange={onCardsChange}
      />,
    );
    await waitFor(() => expect(context().onDragEnd).toBeTypeOf("function"));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));
    expect(onKanbanDragStart).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);
    expect(onCardsChange).toHaveBeenCalledTimes(1);
  });

  it("treats an own enumerable undefined metadata value as absence", async () => {
    const onKanbanDragStart = vi.fn();
    const onKanbanDragEnd = vi.fn();
    const onCardsChange = vi.fn();
    const explicitUndefinedCards: KanbanCardData[] = [
      { ...cards[0], metadata: undefined },
      cards[1],
    ];
    const { rerender } = await renderBoard({
      cards: explicitUndefinedCards,
      onKanbanDragStart,
      onKanbanDragEnd,
      onCardsChange,
    });

    act(() => context().onDragStart?.(event("card-a", null)));
    rerender(
      <KanbanBoard
        columns={columns}
        cards={cards}
        allowAddCard={false}
        onKanbanDragStart={onKanbanDragStart}
        onKanbanDragEnd={onKanbanDragEnd}
        onCardsChange={onCardsChange}
      />,
    );
    await waitFor(() => expect(context().onDragEnd).toBeTypeOf("function"));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));

    expect(onKanbanDragStart).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);
    expect(onCardsChange).toHaveBeenCalledTimes(1);
    const committed = onCardsChange.mock.calls[0]?.[0] as KanbanCardData[];
    const movedCard = committed.find(({ id }) => id === "card-a");
    expect(movedCard).toBeDefined();
    expect(Object.hasOwn(movedCard ?? {}, "metadata")).toBe(false);
  });

  it("rejects unsafe top-level metadata descriptors before reading caller values", async () => {
    const accessorRead = vi.fn(() => ({ revision: 1 }));
    const accessorCard = { ...cards[0] };
    Object.defineProperty(accessorCard, "metadata", {
      enumerable: true,
      get: accessorRead,
    });

    const hiddenCard = { ...cards[0] };
    Object.defineProperty(hiddenCard, "metadata", {
      enumerable: false,
      value: { revision: 1 },
    });

    const inheritedCard = Object.assign(
      Object.create({ metadata: { revision: 1 } }) as KanbanCardData,
      cards[0],
    );
    const symbolCard = { ...cards[0] } as KanbanCardData &
      Record<PropertyKey, unknown>;
    symbolCard[Symbol("metadata-authority")] = { revision: 1 };

    for (const card of [accessorCard, hiddenCard, inheritedCard, symbolCard]) {
      const onKanbanDragStart = vi.fn();
      await renderBoard({ cards: [card, cards[1]], onKanbanDragStart });
      act(() => context().onDragStart?.(event("card-a", null)));
      expect(onKanbanDragStart).not.toHaveBeenCalled();
      cleanup();
      dnd.contextProps = null;
    }

    expect(accessorRead).not.toHaveBeenCalled();
  });

  it("bounds transparent metadata reflection and commits only a detached snapshot", async () => {
    const nested = { second: 2, first: 1 };
    const target = { nested };
    const getPrototypeOf = vi.fn(() => Reflect.getPrototypeOf(target));
    const ownKeys = vi.fn(() => Reflect.ownKeys(target));
    const getOwnPropertyDescriptor = vi.fn(
      (_currentTarget: typeof target, key: PropertyKey) =>
        Reflect.getOwnPropertyDescriptor(target, key),
    );
    const metadata = new Proxy(target, {
      getPrototypeOf,
      ownKeys,
      getOwnPropertyDescriptor,
    });
    const onKanbanDragStart = vi.fn();
    const onCardsChange = vi.fn();

    await renderBoard({
      cards: [{ ...cards[0], metadata }, cards[1]],
      onKanbanDragStart,
      onCardsChange,
    });
    expect(getPrototypeOf).not.toHaveBeenCalled();
    expect(ownKeys).not.toHaveBeenCalled();
    expect(getOwnPropertyDescriptor).not.toHaveBeenCalled();

    act(() => context().onDragStart?.(event("card-a", null)));
    expect(onKanbanDragStart).toHaveBeenCalledTimes(1);
    expect(getPrototypeOf).toHaveBeenCalledTimes(1);
    expect(ownKeys).toHaveBeenCalledTimes(1);
    expect(getOwnPropertyDescriptor).toHaveBeenCalledTimes(1);

    act(() => context().onDragEnd?.(event("card-a", "card-b")));
    expect(onCardsChange).toHaveBeenCalledTimes(1);
    expect(getPrototypeOf).toHaveBeenCalledTimes(2);
    expect(ownKeys).toHaveBeenCalledTimes(2);
    expect(getOwnPropertyDescriptor).toHaveBeenCalledTimes(2);

    const committed = onCardsChange.mock.calls[0]?.[0] as KanbanCardData[];
    const committedMetadata = committed.find(({ id }) => id === "card-a")
      ?.metadata as { nested: Record<string, number> };
    expect(committedMetadata).toEqual({ nested: { first: 1, second: 2 } });
    expect(committedMetadata).not.toBe(metadata);
    expect(committedMetadata.nested).not.toBe(nested);
  });

  it("fails closed for throwing or revoked metadata reflection", async () => {
    const throwingOwnKeys = vi.fn((): never => {
      throw new Error("SECRET_PROXY_TRAP");
    });
    const throwing = new Proxy({ revision: 1 }, { ownKeys: throwingOwnKeys });
    const revoked = Proxy.revocable({ revision: 1 }, {});
    revoked.revoke();

    for (const metadata of [throwing, revoked.proxy]) {
      const onKanbanDragStart = vi.fn();
      const onKanbanDragEnd = vi.fn();
      const onCardsChange = vi.fn();
      await renderBoard({
        cards: [{ ...cards[0], metadata }, cards[1]],
        onKanbanDragStart,
        onKanbanDragEnd,
        onCardsChange,
      });
      expect(() =>
        act(() => context().onDragStart?.(event("card-a", null))),
      ).not.toThrow();
      expect(onKanbanDragStart).not.toHaveBeenCalled();
      expect(onKanbanDragEnd).not.toHaveBeenCalled();
      expect(onCardsChange).not.toHaveBeenCalled();
      cleanup();
      dnd.contextProps = null;
    }

    expect(throwingOwnKeys).toHaveBeenCalledTimes(1);
  });

  it("cancels a time-varying transparent metadata view as controlled drift", async () => {
    const target = { revision: 1 };
    let descriptorReads = 0;
    const metadata = new Proxy(target, {
      getOwnPropertyDescriptor(currentTarget, key) {
        const descriptor = Reflect.getOwnPropertyDescriptor(currentTarget, key);
        if (key !== "revision" || !descriptor) return descriptor;
        descriptorReads += 1;
        return { ...descriptor, value: descriptorReads };
      },
    });
    const onKanbanDragStart = vi.fn();
    const onKanbanDragEnd = vi.fn();
    const onCardsChange = vi.fn();

    await renderBoard({
      cards: [{ ...cards[0], metadata }, cards[1]],
      onKanbanDragStart,
      onKanbanDragEnd,
      onCardsChange,
    });
    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));

    expect(descriptorReads).toBe(2);
    expect(onKanbanDragStart).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);
    expect(onCardsChange).not.toHaveBeenCalled();
  });

  it("fails closed when controlled column color bytes drift during a drag", async () => {
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    const coloredColumns: KanbanColumn[] = [
      { ...columns[0], color: "blue" },
      columns[1],
    ];
    const { rerender } = await renderBoard({
      columns: coloredColumns,
      onCardsChange,
      onCardMove,
    });

    act(() => context().onDragStart?.(event("card-a", null)));
    rerender(
      <KanbanBoard
        columns={[{ ...coloredColumns[0], color: "red" }, coloredColumns[1]]}
        cards={cards}
        allowAddCard={false}
        onCardsChange={onCardsChange}
        onCardMove={onCardMove}
      />,
    );
    await waitFor(() => expect(context().onDragEnd).toBeTypeOf("function"));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));

    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("publishes one terminal callback for cancellation and ignores terminal reentry", async () => {
    const onKanbanDragStart = vi.fn();
    const onKanbanDragEnd = vi.fn();
    await renderBoard({ onKanbanDragStart, onKanbanDragEnd });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragCancel?.(event("card-a", null)));
    act(() => context().onDragCancel?.(event("card-a", null)));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));

    expect(onKanbanDragStart).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledWith("card", "card-a");
  });

  it("balances an admitted drag with the latest callback when the board unmounts", async () => {
    const firstEnd = vi.fn();
    const latestEnd = vi.fn();
    const { rerender, unmount } = await renderBoard({
      onKanbanDragEnd: firstEnd,
    });

    act(() => context().onDragStart?.(event("card-a", null)));
    rerender(
      <KanbanBoard
        columns={columns}
        cards={cards}
        allowAddCard={false}
        onKanbanDragEnd={latestEnd}
      />,
    );
    await waitFor(() => expect(context().onDragEnd).toBeTypeOf("function"));
    expect(firstEnd).not.toHaveBeenCalled();
    expect(latestEnd).not.toHaveBeenCalled();

    unmount();

    expect(firstEnd).not.toHaveBeenCalled();
    expect(latestEnd).toHaveBeenCalledTimes(1);
    expect(latestEnd).toHaveBeenCalledWith("card", "card-a");
  });

  it("publishes no terminal callback for StrictMode cleanup without an active drag", async () => {
    const onKanbanDragEnd = vi.fn();
    const { unmount } = render(
      <React.StrictMode>
        <KanbanBoard
          columns={columns}
          cards={cards}
          allowAddCard={false}
          onKanbanDragEnd={onKanbanDragEnd}
        />
      </React.StrictMode>,
    );
    await waitFor(() => expect(dnd.contextProps).not.toBeNull());

    unmount();

    expect(onKanbanDragEnd).not.toHaveBeenCalled();
  });

  it("does not duplicate a DnD terminal callback when the board then unmounts", async () => {
    const onKanbanDragEnd = vi.fn();
    const { unmount } = await renderBoard({ onKanbanDragEnd });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragCancel?.(event("card-a", null)));
    unmount();

    expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledWith("card", "card-a");
  });

  it("publishes one terminal callback for no-target, no-op, WIP, and drift", async () => {
    const onKanbanDragStart = vi.fn();
    const onKanbanDragEnd = vi.fn();
    const onCardsChange = vi.fn();
    const onCardMove = vi.fn();
    const { rerender } = await renderBoard({
      onKanbanDragStart,
      onKanbanDragEnd,
      onCardsChange,
      onCardMove,
    });

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragEnd?.(event("card-a", null)));

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragEnd?.(event("card-a", "card-a")));

    rerender(
      <KanbanBoard
        columns={[columns[0], { ...columns[1], limit: 1 }]}
        cards={cards}
        allowAddCard={false}
        onKanbanDragStart={onKanbanDragStart}
        onKanbanDragEnd={onKanbanDragEnd}
        onCardsChange={onCardsChange}
        onCardMove={onCardMove}
      />,
    );
    await waitFor(() => expect(context().onDragStart).toBeTypeOf("function"));
    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));

    rerender(
      <KanbanBoard
        columns={columns}
        cards={[{ ...cards[0], title: "Changed" }, cards[1]]}
        allowAddCard={false}
        onKanbanDragStart={onKanbanDragStart}
        onKanbanDragEnd={onKanbanDragEnd}
        onCardsChange={onCardsChange}
        onCardMove={onCardMove}
      />,
    );
    await waitFor(() => expect(context().onDragStart).toBeTypeOf("function"));
    act(() => context().onDragStart?.(event("card-a", null)));
    rerender(
      <KanbanBoard
        columns={columns}
        cards={[{ ...cards[0], title: "Drifted" }, cards[1]]}
        allowAddCard={false}
        onKanbanDragStart={onKanbanDragStart}
        onKanbanDragEnd={onKanbanDragEnd}
        onCardsChange={onCardsChange}
        onCardMove={onCardMove}
      />,
    );
    await waitFor(() => expect(context().onDragEnd).toBeTypeOf("function"));
    act(() => context().onDragEnd?.(event("card-a", "card-b")));

    expect(onKanbanDragStart).toHaveBeenCalledTimes(4);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(4);
    expect(onKanbanDragEnd.mock.calls).toEqual(
      Array.from({ length: 4 }, () => ["card", "card-a"]),
    );
    expect(onCardsChange).not.toHaveBeenCalled();
    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("commits a column reorder once from its drag-start snapshot", async () => {
    const onColumnsChange = vi.fn();
    const onColumnMove = vi.fn();
    const onKanbanDragEnd = vi.fn();
    await renderBoard({
      onColumnsChange,
      onColumnMove,
      onKanbanDragEnd,
    });

    act(() => context().onDragStart?.(event("todo", null)));
    expect(onColumnsChange).not.toHaveBeenCalled();
    act(() => context().onDragEnd?.(event("todo", "doing")));

    expect(onColumnsChange).toHaveBeenCalledTimes(1);
    expect(onColumnsChange.mock.calls[0]?.[0].map(({ id }) => id)).toEqual([
      "doing",
      "todo",
    ]);
    expect(onColumnMove).toHaveBeenCalledWith({ columnId: "todo", toIndex: 1 });
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledWith("column", "todo");
  });

  it("isolates uncontrolled column state from the consumer callback graph", async () => {
    const defaultColumns: KanbanColumn[] = [
      {
        ...columns[0],
        color: "blue",
        limit: 3,
        collapsed: false,
      },
      columns[1],
    ];
    let callbackCount = 0;
    let secondPayload: KanbanColumn[] | null = null;
    const onColumnsChange = vi.fn((nextColumns: KanbanColumn[]) => {
      callbackCount += 1;
      if (callbackCount === 2) {
        secondPayload = nextColumns;
        return;
      }
      const movedColumn = nextColumns.find(({ id }) => id === "todo");
      if (!movedColumn) throw new Error("committed column missing");
      movedColumn.title = "Consumer mutated";
      movedColumn.color = "red";
      movedColumn.limit = 0;
      movedColumn.collapsed = true;
    });
    const onColumnMove = vi.fn();
    await renderBoard({
      columns: undefined,
      cards: undefined,
      defaultColumns,
      defaultCards: cards,
      onColumnsChange,
      onColumnMove,
    });

    act(() => context().onDragStart?.(event("todo", null)));
    act(() => context().onDragEnd?.(event("todo", "doing")));

    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(onColumnMove).toHaveBeenNthCalledWith(1, {
      columnId: "todo",
      toIndex: 1,
    });

    act(() => context().onDragStart?.(event("todo", null)));
    act(() => context().onDragEnd?.(event("todo", "doing")));

    expect(onColumnsChange).toHaveBeenCalledTimes(2);
    expect(onColumnMove).toHaveBeenCalledTimes(2);
    expect(secondPayload?.find(({ id }) => id === "todo")).toEqual({
      id: "todo",
      title: "Todo",
      color: "blue",
      limit: 3,
      collapsed: false,
    });
    expect(defaultColumns[0]).toEqual({
      id: "todo",
      title: "Todo",
      color: "blue",
      limit: 3,
      collapsed: false,
    });
  });

  it("clears terminal ownership when the columns callback throws", async () => {
    const onKanbanDragStart = vi.fn();
    const onKanbanDragEnd = vi.fn();
    const onColumnsChange = vi.fn(() => {
      throw new Error("consumer callback failed");
    });
    const onColumnMove = vi.fn();
    await renderBoard({
      onKanbanDragStart,
      onKanbanDragEnd,
      onColumnsChange,
      onColumnMove,
    });

    act(() => context().onDragStart?.(event("todo", null)));
    expect(() =>
      act(() => context().onDragEnd?.(event("todo", "doing"))),
    ).toThrow("consumer callback failed");
    expect(onKanbanDragStart).toHaveBeenCalledTimes(1);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);
    expect(onColumnMove).not.toHaveBeenCalled();

    act(() => context().onDragStart?.(event("todo", null)));
    act(() => context().onDragCancel?.(event("todo", null)));
    expect(onKanbanDragStart).toHaveBeenCalledTimes(2);
    expect(onKanbanDragEnd).toHaveBeenCalledTimes(2);
    expect(onKanbanDragEnd.mock.calls).toEqual([
      ["column", "todo"],
      ["column", "todo"],
    ]);
    expect(onColumnMove).not.toHaveBeenCalled();
  });

  it("publishes bounded sanitized instructions and suppresses duplicate targets", async () => {
    const maliciousCards: KanbanCardData[] = [
      {
        id: "SECRET_RAW_CARD_ID",
        columnId: "todo",
        order: 0,
        title: `  First\ncard\u0000\u0085\u2028\u2029\ud800 ${"x".repeat(300)}  `,
        metadata: { secret: "SECRET_METADATA" },
      },
      cards[1],
    ];
    await renderBoard({ cards: maliciousCards });

    const accessibility = context().accessibility;
    expect(accessibility?.screenReaderInstructions?.draggable).toMatch(
      /Space|Enter/,
    );
    expect(
      accessibility?.screenReaderInstructions?.draggable?.length,
    ).toBeLessThanOrEqual(180);

    act(() => context().onDragStart?.(event("SECRET_RAW_CARD_ID", null)));
    const start = accessibility?.announcements?.onDragStart?.(
      event("SECRET_RAW_CARD_ID", null),
    );
    const firstOver = accessibility?.announcements?.onDragOver?.(
      event("SECRET_RAW_CARD_ID", "doing"),
    );
    const duplicateOver = accessibility?.announcements?.onDragOver?.(
      event("SECRET_RAW_CARD_ID", "doing"),
    );

    for (const announcement of [start, firstOver]) {
      expect(announcement).toBeTypeOf("string");
      expect(announcement?.length).toBeLessThanOrEqual(180);
      expect(
        Array.from(announcement ?? "").every((character) => {
          const point = character.codePointAt(0) ?? 0;
          return (
            point > 0x1f &&
            (point < 0x7f || point > 0x9f) &&
            (point < 0xd800 || point > 0xdfff) &&
            point !== 0x2028 &&
            point !== 0x2029
          );
        }),
      ).toBe(true);
      expect(announcement).not.toContain("SECRET_RAW_CARD_ID");
      expect(announcement).not.toContain("SECRET_METADATA");
    }
    expect(duplicateOver).toBeUndefined();
  });

  it("keeps the 80-scalar label and 180-scalar announcement budgets distinct", async () => {
    const title = `${"x".repeat(79)}😀`;
    await renderBoard({ cards: [{ ...cards[0], title }, cards[1]] });
    const announcements = context().accessibility?.announcements;

    act(() => context().onDragStart?.(event("card-a", null)));
    const announcement = announcements?.onDragStart?.(event("card-a", null));

    expect(Array.from(announcement ?? "")).toHaveLength(91);
    expect(announcement).toBe(`Picked up ${title}.`);
    expect(
      Array.from(announcement ?? "").every((character) => {
        const point = character.codePointAt(0) ?? 0;
        return point < 0xd800 || point > 0xdfff;
      }),
    ).toBe(true);
  });

  it("announces WIP blocks, successful drops, and cancellation without identifiers", async () => {
    const limitedColumns: KanbanColumn[] = [
      { id: "todo", title: "Todo" },
      { id: "doing", title: "Doing", limit: 1 },
    ];
    await renderBoard({ columns: limitedColumns });
    const announcements = context().accessibility?.announcements;

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragOver?.(event("card-a", "card-b")));
    expect(announcements?.onDragOver?.(event("card-a", "card-b"))).toMatch(
      /blocked|WIP/i,
    );
    act(() => context().onDragEnd?.(event("card-a", "card-b")));
    expect(announcements?.onDragEnd?.(event("card-a", "card-b"))).toMatch(
      /blocked/i,
    );

    act(() => context().onDragStart?.(event("card-a", null)));
    act(() => context().onDragCancel?.(event("card-a", null)));
    const cancelled = announcements?.onDragCancel?.(event("card-a", null));
    expect(cancelled).toMatch(/cancelled/i);
    expect(cancelled).not.toContain("card-a");
  });

  it("keeps the SSR placeholder deterministic and outside the DnD runtime", () => {
    const element = (
      <KanbanBoard columns={columns} cards={cards} allowAddCard={false} />
    );
    const first = renderToStaticMarkup(element);
    expect(renderToStaticMarkup(element)).toBe(first);
    expect(first).toContain('role="region"');
    expect(first).toContain("칸반 보드");
    expect(first).not.toContain("dnd-context");
  });

  it("hydrates the deterministic placeholder without recoverable errors", async () => {
    const element = (
      <KanbanBoard columns={columns} cards={cards} allowAddCard={false} />
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    const recoverable = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await act(async () => {
        root = hydrateRoot(container, element, {
          onRecoverableError: recoverable,
        });
        await Promise.resolve();
      });

      expect(recoverable).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
      expect(
        container.querySelector('[data-testid="dnd-context"]'),
      ).not.toBeNull();
      expect(container.querySelector('[role="region"]')).not.toBeNull();
    } finally {
      await act(async () => root?.unmount());
      consoleError.mockRestore();
    }
  });
});

describe("KanbanCard interaction ownership", () => {
  function renderCard(
    props: Partial<React.ComponentProps<typeof KanbanCard>> = {},
  ) {
    const onCardClick = vi.fn();
    const result = render(
      <KanbanProvider columns={columns} cards={cards} onCardClick={onCardClick}>
        <KanbanCard card={cards[0]} index={0} {...props} />
      </KanbanProvider>,
    );
    return { ...result, onCardClick };
  }

  it("lets keyboard DnD own Space and Enter without activating card click", () => {
    const consumerKeyDown = vi.fn();
    const { onCardClick } = renderCard({ onKeyDown: consumerKeyDown });
    const card = screen.getByText("First card").closest("[data-card-id]");
    if (!card) throw new Error("card root missing");

    fireEvent.keyDown(card, { key: "Enter", code: "Enter" });
    fireEvent.keyDown(card, { key: " ", code: "Space" });

    expect(dnd.listenerKeyDown).toHaveBeenCalledTimes(2);
    expect(consumerKeyDown).toHaveBeenCalledTimes(2);
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it("preserves the next click-only activation after every keyboard drag terminal", async () => {
    const scenarios: Array<{
      name: string;
      columns?: KanbanColumn[];
      terminal: () => void;
    }> = [
      {
        name: "success",
        terminal: () => context().onDragEnd?.(event("card-a", "card-b")),
      },
      {
        name: "cancel",
        terminal: () => context().onDragCancel?.(event("card-a", null)),
      },
      {
        name: "no-target",
        terminal: () => context().onDragEnd?.(event("card-a", null)),
      },
      {
        name: "no-op",
        terminal: () => context().onDragEnd?.(event("card-a", "card-a")),
      },
      {
        name: "WIP",
        columns: [columns[0], { ...columns[1], limit: 1 }],
        terminal: () => context().onDragEnd?.(event("card-a", "card-b")),
      },
    ];

    for (const scenario of scenarios) {
      const onCardClick = vi.fn();
      const onKanbanDragEnd = vi.fn();
      await renderBoard({
        columns: scenario.columns ?? columns,
        onCardClick,
        onKanbanDragEnd,
      });
      const card = screen.getByText("First card").closest("[data-card-id]");
      if (!card) throw new Error(`${scenario.name} card root missing`);

      fireEvent.keyDown(card, { key: "Enter", code: "Enter" });
      expect(onCardClick).not.toHaveBeenCalled();
      act(() => context().onDragStart?.(event("card-a", null)));
      act(scenario.terminal);
      expect(onKanbanDragEnd).toHaveBeenCalledTimes(1);

      fireEvent.click(card);
      expect(onCardClick).toHaveBeenCalledTimes(1);
      cleanup();
      dnd.contextProps = null;
    }
  });

  it("composes non-activation dnd and consumer handlers once and preserves attributes", () => {
    const consumerKeyDown = vi.fn();
    const consumerPointerDown = vi.fn();
    renderCard({
      onKeyDown: consumerKeyDown,
      onPointerDown: consumerPointerDown,
      "data-consumer": "kept",
      "aria-describedby": "consumer-description dnd-instructions",
    });
    const card = screen.getByText("First card").closest("[data-card-id]");
    if (!card) throw new Error("card root missing");

    fireEvent.keyDown(card, { key: "ArrowDown", code: "ArrowDown" });
    fireEvent.pointerDown(card);

    expect(dnd.listenerKeyDown).toHaveBeenCalledTimes(1);
    expect(consumerKeyDown).toHaveBeenCalledTimes(1);
    expect(dnd.listenerPointerDown).toHaveBeenCalledTimes(1);
    expect(consumerPointerDown).toHaveBeenCalledTimes(1);
    expect(card).toHaveAttribute("aria-roledescription", "sortable");
    expect(card).toHaveAttribute(
      "aria-describedby",
      "dnd-instructions consumer-description",
    );
    expect(card).toHaveAttribute("data-consumer", "kept");
  });

  it("composes sortable and consumer refs with React 19 cleanup ownership", () => {
    const cleanupRef = vi.fn();
    const consumerRef = vi.fn((node: HTMLDivElement | null) =>
      node ? cleanupRef : undefined,
    );
    const { unmount } = renderCard({ ref: consumerRef });

    expect(dnd.setNodeRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    expect(consumerRef).toHaveBeenCalledTimes(1);
    unmount();
    expect(cleanupRef).toHaveBeenCalledTimes(1);
  });

  it("does not disable whole-card touch scrolling", () => {
    renderCard();
    const card = screen.getByText("First card").closest("[data-card-id]");
    if (!(card instanceof HTMLElement)) throw new Error("card root missing");
    expect(card.style.touchAction).not.toBe("none");
  });

  it("composes an ordinary consumer click before the card callback exactly once", () => {
    const consumerClick = vi.fn();
    const { onCardClick } = renderCard({ onClick: consumerClick });
    const card = screen.getByText("First card").closest("[data-card-id]");
    if (!card) throw new Error("card root missing");

    fireEvent.click(card);
    expect(consumerClick).toHaveBeenCalledTimes(1);
    expect(onCardClick).toHaveBeenCalledTimes(1);
  });

  it("cleans StrictMode and replacement refs without duplicate attachments", () => {
    const firstCleanup = vi.fn();
    const secondCleanup = vi.fn();
    const firstRef = vi.fn((node: HTMLDivElement | null) =>
      node ? firstCleanup : undefined,
    );
    const secondRef = vi.fn((node: HTMLDivElement | null) =>
      node ? secondCleanup : undefined,
    );
    const { rerender, unmount } = render(
      <React.StrictMode>
        <KanbanProvider columns={columns} cards={cards}>
          <KanbanCard ref={firstRef} card={cards[0]} index={0} />
        </KanbanProvider>
      </React.StrictMode>,
    );
    const firstAttachments = firstRef.mock.calls.filter(
      ([node]) => node,
    ).length;

    rerender(
      <React.StrictMode>
        <KanbanProvider columns={columns} cards={cards}>
          <KanbanCard ref={secondRef} card={cards[0]} index={0} />
        </KanbanProvider>
      </React.StrictMode>,
    );
    expect(firstCleanup).toHaveBeenCalledTimes(firstAttachments);
    expect(firstRef.mock.calls.filter(([node]) => node === null)).toHaveLength(
      0,
    );

    const secondAttachments = secondRef.mock.calls.filter(
      ([node]) => node,
    ).length;
    unmount();
    expect(secondCleanup).toHaveBeenCalledTimes(secondAttachments);
    expect(secondRef.mock.calls.filter(([node]) => node === null)).toHaveLength(
      0,
    );
  });
});
