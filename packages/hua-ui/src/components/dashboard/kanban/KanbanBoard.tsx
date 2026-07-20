"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragCancelEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { mergeStyles, resolveDot } from "../../../hooks/useDotMap";
import { KanbanProvider } from "./KanbanContext";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { KanbanAddColumn } from "./KanbanAddColumn";
import { Skeleton } from "../../Skeleton";
import type {
  KanbanBoardProps,
  KanbanColumn as KanbanColumnType,
  KanbanCard as KanbanCardType,
} from "./types";

const ANNOUNCEMENT_LIMIT = 180;
const ANNOUNCEMENT_LABEL_LIMIT = 80;
const AUTHORITY_METADATA_MAX_DEPTH = 12;
const AUTHORITY_METADATA_MAX_NODES = 1024;
const AUTHORITY_METADATA_MAX_ARRAY_LENGTH = 256;
const AUTHORITY_METADATA_MAX_OBJECT_KEYS = 128;
const AUTHORITY_METADATA_MAX_STRING_SCALARS = 4096;
const AUTHORITY_METADATA_MAX_BYTES = 32768;
const SCREEN_READER_INSTRUCTIONS =
  "Press Space or Enter to pick up an item. Use the arrow keys to move it, press Space or Enter to drop it, or press Escape to cancel.";

type DragType = "card" | "column";
type DragBlockReason = "drift" | "invalid-target" | "wip-limit" | null;

interface CardDropTarget {
  columnId: string;
  index: number;
  overId: string;
}

interface DragTransaction {
  type: DragType;
  activeId: string;
  sourceColumnId: string | null;
  columns: KanbanColumnType[];
  cards: KanbanCardType[];
  authority: string;
  previewCards: KanbanCardType[];
  overId: string | null;
  blockReason: DragBlockReason;
  stableExternalTarget: CardDropTarget | null;
  lastAnnouncedTarget: string | null;
}

interface AuthorityMetadataState {
  nodes: number;
  active: WeakSet<object>;
}

interface AuthorityMetadataSnapshot {
  canonical: string;
  value: unknown;
}

interface DragAuthoritySnapshot {
  authority: string;
  cards: KanbanCardType[];
}

function cloneColumns(columns: KanbanColumnType[]): KanbanColumnType[] {
  return columns.map((column) => ({ ...column }));
}

function cloneCards(cards: KanbanCardType[]): KanbanCardType[] {
  return cards.map((card) => ({
    ...card,
    tags: card.tags ? [...card.tags] : undefined,
    assignee: card.assignee ? { ...card.assignee } : undefined,
  }));
}

function snapshotAuthorityMetadataValue(
  value: unknown,
  state: AuthorityMetadataState,
  depth: number,
): AuthorityMetadataSnapshot | null {
  state.nodes += 1;
  if (
    state.nodes > AUTHORITY_METADATA_MAX_NODES ||
    depth > AUTHORITY_METADATA_MAX_DEPTH
  ) {
    return null;
  }

  if (value === null) return { canonical: "n", value: null };
  if (typeof value === "boolean") {
    return { canonical: value ? "b1" : "b0", value };
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return {
      canonical: Object.is(value, -0) ? "d-0" : `d${String(value)}`,
      value,
    };
  }
  if (typeof value === "string") {
    if (
      value.length > AUTHORITY_METADATA_MAX_STRING_SCALARS * 2 ||
      Array.from(value).length > AUTHORITY_METADATA_MAX_STRING_SCALARS
    ) {
      return null;
    }
    return { canonical: `s${JSON.stringify(value)}`, value };
  }
  if (typeof value !== "object") return null;
  if (state.active.has(value)) return null;

  try {
    state.active.add(value);
    const isArray = Array.isArray(value);
    const prototype = Object.getPrototypeOf(value);
    if (isArray) {
      if (prototype !== Array.prototype) return null;
      const ownKeys = Reflect.ownKeys(value);
      if (ownKeys.some((key) => typeof key !== "string")) return null;
      const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
      if (
        !lengthDescriptor ||
        !("value" in lengthDescriptor) ||
        !Number.isSafeInteger(lengthDescriptor.value) ||
        lengthDescriptor.value < 0 ||
        lengthDescriptor.value > AUTHORITY_METADATA_MAX_ARRAY_LENGTH
      ) {
        return null;
      }
      const length = lengthDescriptor.value as number;
      if (ownKeys.length !== length + 1 || !ownKeys.includes("length")) {
        return null;
      }

      const items: string[] = [];
      const snapshot: unknown[] = new Array(length);
      for (let index = 0; index < length; index += 1) {
        const key = String(index);
        if (!ownKeys.includes(key)) return null;
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (
          !descriptor ||
          !("value" in descriptor) ||
          descriptor.enumerable !== true
        ) {
          return null;
        }
        const item = snapshotAuthorityMetadataValue(
          descriptor.value,
          state,
          depth + 1,
        );
        if (item === null) return null;
        Object.defineProperty(snapshot, key, {
          configurable: true,
          enumerable: true,
          value: item.value,
          writable: true,
        });
        items.push(item.canonical);
      }
      return { canonical: `a[${items.join(",")}]`, value: snapshot };
    }

    if (prototype !== Object.prototype && prototype !== null) return null;
    const ownKeys = Reflect.ownKeys(value);
    if (
      ownKeys.length > AUTHORITY_METADATA_MAX_OBJECT_KEYS ||
      ownKeys.some((key) => typeof key !== "string")
    ) {
      return null;
    }
    const keys = (ownKeys as string[]).sort();
    const entries: string[] = [];
    const snapshot: Record<string, unknown> =
      prototype === null ? Object.create(null) : {};
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (
        !descriptor ||
        !("value" in descriptor) ||
        descriptor.enumerable !== true
      ) {
        return null;
      }
      const nested = snapshotAuthorityMetadataValue(
        descriptor.value,
        state,
        depth + 1,
      );
      if (nested === null) return null;
      Object.defineProperty(snapshot, key, {
        configurable: true,
        enumerable: true,
        value: nested.value,
        writable: true,
      });
      entries.push(`${JSON.stringify(key)}:${nested.canonical}`);
    }
    return { canonical: `o{${entries.join(",")}}`, value: snapshot };
  } catch {
    return null;
  } finally {
    state.active.delete(value);
  }
}

function snapshotAuthorityMetadata(
  metadata: unknown,
  state: AuthorityMetadataState,
): AuthorityMetadataSnapshot | null {
  if (
    metadata === null ||
    typeof metadata !== "object" ||
    Array.isArray(metadata)
  ) {
    return null;
  }
  return snapshotAuthorityMetadataValue(metadata, state, 0);
}

function createDragAuthority(
  columns: KanbanColumnType[],
  cards: KanbanCardType[],
): DragAuthoritySnapshot | null {
  const columnIds = new Set<string>();
  for (const column of columns) {
    if (typeof column.id !== "string" || columnIds.has(column.id)) return null;
    columnIds.add(column.id);
  }
  try {
    const cardAuthorityRows: unknown[] = [];
    const cardSnapshots: KanbanCardType[] = [];
    const cardIds = new Set<string>();
    const metadataState: AuthorityMetadataState = {
      nodes: 0,
      active: new WeakSet<object>(),
    };
    let metadataBytes = 0;
    for (const sourceCard of cards) {
      const ownKeys = Reflect.ownKeys(sourceCard);
      if (ownKeys.some((key) => typeof key !== "string")) return null;
      const metadataDescriptor = Object.getOwnPropertyDescriptor(
        sourceCard,
        "metadata",
      );
      if (!metadataDescriptor && Reflect.has(sourceCard, "metadata")) {
        return null;
      }
      if (
        metadataDescriptor &&
        (!("value" in metadataDescriptor) ||
          metadataDescriptor.enumerable !== true)
      ) {
        return null;
      }

      const hasDefinedMetadata =
        metadataDescriptor !== undefined &&
        metadataDescriptor.value !== undefined;
      const metadataSnapshot = hasDefinedMetadata
        ? snapshotAuthorityMetadata(metadataDescriptor.value, metadataState)
        : null;
      if (hasDefinedMetadata && metadataSnapshot === null) return null;
      if (metadataSnapshot !== null) {
        metadataBytes += new TextEncoder().encode(
          metadataSnapshot.canonical,
        ).byteLength;
        if (metadataBytes > AUTHORITY_METADATA_MAX_BYTES) return null;
      }

      const card: KanbanCardType = {
        ...sourceCard,
        tags: sourceCard.tags ? [...sourceCard.tags] : undefined,
        assignee: sourceCard.assignee ? { ...sourceCard.assignee } : undefined,
        dueDate:
          sourceCard.dueDate instanceof Date
            ? new Date(sourceCard.dueDate.getTime())
            : sourceCard.dueDate,
      };
      if (metadataSnapshot) {
        Object.defineProperty(card, "metadata", {
          configurable: true,
          enumerable: true,
          value: metadataSnapshot.value,
          writable: true,
        });
      } else {
        delete card.metadata;
      }

      if (
        typeof card.id !== "string" ||
        cardIds.has(card.id) ||
        !columnIds.has(card.columnId)
      ) {
        return null;
      }
      cardIds.add(card.id);
      cardSnapshots.push(card);
      cardAuthorityRows.push([
        card.id,
        card.columnId,
        card.order ?? null,
        card.title,
        card.description ?? null,
        card.priority ?? null,
        card.tags ?? null,
        card.assignee?.name ?? null,
        card.assignee?.avatar ?? null,
        card.dueDate instanceof Date
          ? Number.isNaN(card.dueDate.getTime())
            ? "invalid-date"
            : card.dueDate.toISOString()
          : (card.dueDate ?? null),
        metadataSnapshot?.canonical ?? null,
      ]);
    }
    return {
      authority: JSON.stringify({
        columns: columns.map((column) => [
          column.id,
          column.title,
          column.color ?? null,
          column.limit ?? null,
          column.collapsed ?? null,
        ]),
        cards: cardAuthorityRows,
      }),
      cards: cardSnapshots,
    };
  } catch {
    return null;
  }
}

function getSortedColumnCards(
  cards: KanbanCardType[],
  columnId: string,
): KanbanCardType[] {
  return cards
    .map((card, sourceIndex) => ({ card, sourceIndex }))
    .filter(({ card }) => card.columnId === columnId)
    .sort(
      (a, b) =>
        (a.card.order ?? 0) - (b.card.order ?? 0) ||
        a.sourceIndex - b.sourceIndex,
    )
    .map(({ card }) => card);
}

function resolveCardDropTarget(
  transaction: DragTransaction,
  overId: string,
): CardDropTarget | null {
  const overColumn = transaction.columns.find((column) => column.id === overId);
  if (overColumn) {
    const targetCards = getSortedColumnCards(
      transaction.previewCards,
      overColumn.id,
    ).filter((card) => card.id !== transaction.activeId);
    const sameColumn = transaction.sourceColumnId === overColumn.id;
    return {
      columnId: overColumn.id,
      index: sameColumn ? Math.max(targetCards.length, 0) : targetCards.length,
      overId,
    };
  }

  const overCard = transaction.previewCards.find((card) => card.id === overId);
  if (!overCard) return null;

  const sameColumn = transaction.sourceColumnId === overCard.columnId;
  const targetCards = getSortedColumnCards(
    transaction.previewCards,
    overCard.columnId,
  ).filter((card) => sameColumn || card.id !== transaction.activeId);
  const index = targetCards.findIndex((card) => card.id === overId);
  if (index === -1) return null;

  return { columnId: overCard.columnId, index, overId };
}

function sameCardDropTarget(
  left: CardDropTarget | null,
  right: CardDropTarget,
): boolean {
  return (
    left?.columnId === right.columnId &&
    left.index === right.index &&
    left.overId === right.overId
  );
}

function clearCardPreviewAuthority(transaction: DragTransaction): void {
  transaction.previewCards = transaction.cards;
  transaction.stableExternalTarget = null;
}

function isWipBlocked(
  transaction: DragTransaction,
  target: CardDropTarget,
): boolean {
  if (transaction.sourceColumnId === target.columnId) return false;
  const column = transaction.columns.find(({ id }) => id === target.columnId);
  if (!column || column.limit === undefined) return false;
  const foreignCount = transaction.previewCards.filter(
    (card) =>
      card.columnId === target.columnId && card.id !== transaction.activeId,
  ).length;
  return foreignCount >= column.limit;
}

function moveCardInSnapshot(
  transaction: DragTransaction,
  target: CardDropTarget,
): KanbanCardType[] | null {
  const activeCard = transaction.cards.find(
    (card) => card.id === transaction.activeId,
  );
  if (!activeCard || !transaction.sourceColumnId) return null;

  const sourceColumnId = transaction.sourceColumnId;
  if (sourceColumnId === target.columnId) {
    const columnCards = getSortedColumnCards(transaction.cards, sourceColumnId);
    const oldIndex = columnCards.findIndex(
      (card) => card.id === transaction.activeId,
    );
    if (oldIndex === -1) return null;
    const newIndex = Math.max(
      0,
      Math.min(target.index, columnCards.length - 1),
    );
    if (oldIndex === newIndex) return cloneCards(transaction.cards);
    const reordered = arrayMove(columnCards, oldIndex, newIndex);
    const orders = new Map(reordered.map((card, index) => [card.id, index]));
    return transaction.cards.map((card) =>
      card.columnId === sourceColumnId
        ? { ...card, order: orders.get(card.id) }
        : { ...card },
    );
  }

  const sourceCards = getSortedColumnCards(transaction.cards, sourceColumnId)
    .filter((card) => card.id !== transaction.activeId)
    .map((card) => ({ ...card }));
  const targetCards = getSortedColumnCards(transaction.cards, target.columnId)
    .filter((card) => card.id !== transaction.activeId)
    .map((card) => ({ ...card }));
  const targetIndex = Math.max(0, Math.min(target.index, targetCards.length));
  targetCards.splice(targetIndex, 0, {
    ...activeCard,
    columnId: target.columnId,
  });
  const sourceOrders = new Map(
    sourceCards.map((card, index) => [card.id, index]),
  );
  const targetOrders = new Map(
    targetCards.map((card, index) => [card.id, index]),
  );

  return transaction.cards.map((card) => {
    if (card.id === transaction.activeId) {
      return {
        ...card,
        columnId: target.columnId,
        order: targetOrders.get(card.id),
      };
    }
    if (card.columnId === sourceColumnId) {
      return { ...card, order: sourceOrders.get(card.id) };
    }
    if (card.columnId === target.columnId) {
      return { ...card, order: targetOrders.get(card.id) };
    }
    return { ...card };
  });
}

function sanitizeAnnouncementText(
  value: unknown,
  fallback: string,
  scalarLimit: number,
): string {
  if (typeof value !== "string") return fallback;
  const sanitized = Array.from(value, (character) => {
    const point = character.codePointAt(0) ?? 0;
    return point <= 0x1f ||
      (point >= 0x7f && point <= 0x9f) ||
      (point >= 0xd800 && point <= 0xdfff) ||
      point === 0x2028 ||
      point === 0x2029
      ? " "
      : character;
  })
    .join("")
    .replace(/\s+/gu, " ")
    .trim();
  return Array.from(sanitized).slice(0, scalarLimit).join("") || fallback;
}

function sanitizeAnnouncementLabel(value: unknown, fallback: string): string {
  return sanitizeAnnouncementText(value, fallback, ANNOUNCEMENT_LABEL_LIMIT);
}

function boundedAnnouncement(value: string): string {
  return sanitizeAnnouncementText(
    value,
    "Drag status unavailable.",
    ANNOUNCEMENT_LIMIT,
  );
}

/**
 * KanbanBoard 컴포넌트
 *
 * @dnd-kit을 사용한 드래그앤드롭 칸반 보드 컴포넌트입니다.
 * 컬럼 간 카드 이동, 같은 컬럼 내 순서 변경을 지원합니다.
 */
export const KanbanBoard = React.forwardRef<HTMLDivElement, KanbanBoardProps>(
  (
    {
      // Controlled props
      columns: controlledColumns,
      cards: controlledCards,
      // Uncontrolled props
      defaultColumns = [],
      defaultCards = [],
      // Callbacks
      onColumnsChange,
      onCardsChange,
      onCardMove,
      onColumnMove,
      onCardAdd,
      onCardDelete,
      onCardUpdate,
      onColumnAdd,
      onColumnDelete,
      onColumnUpdate,
      onCardClick,
      onKanbanDragStart,
      onKanbanDragEnd,
      // Style
      variant = "elevated",
      color = "blue",
      // Flags
      allowAddColumn = false,
      allowAddCard = true,
      allowColumnDrag = true,
      allowCardDrag = true,
      readOnly = false,
      // Layout
      columnMinWidth = 280,
      columnMaxWidth = 320,
      // Drag effects
      showDragOverlay = true,
      dragOverlayStyle,
      dragRotation = 3,
      dragScale = 1.05,
      // Standard props
      dot,
      style,
      ...props
    },
    ref,
  ) => {
    // SSR hydration fix: only render DndContext after mount
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Internal state for uncontrolled mode
    const [internalColumns, setInternalColumns] =
      useState<KanbanColumnType[]>(defaultColumns);
    const [internalCards, setInternalCards] =
      useState<KanbanCardType[]>(defaultCards);

    // Drag state
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<"card" | "column" | null>(
      null,
    );
    const [previewCards, setPreviewCards] = useState<KanbanCardType[] | null>(
      null,
    );
    const dragTransactionRef = useRef<DragTransaction | null>(null);
    const announcementOutcomeRef = useRef<string | null>(null);
    const onKanbanDragEndRef = useRef(onKanbanDragEnd);

    useEffect(() => {
      onKanbanDragEndRef.current = onKanbanDragEnd;
    }, [onKanbanDragEnd]);

    const takeDragTransaction = useCallback((): DragTransaction | null => {
      const transaction = dragTransactionRef.current;
      if (!transaction) return null;
      dragTransactionRef.current = null;
      return transaction;
    }, []);

    useEffect(
      () => () => {
        const transaction = takeDragTransaction();
        announcementOutcomeRef.current = null;
        if (transaction) {
          onKanbanDragEndRef.current?.(transaction.type, transaction.activeId);
        }
      },
      [takeDragTransaction],
    );

    // Determine controlled vs uncontrolled
    const isControlled = controlledColumns !== undefined;
    const columns = isControlled ? controlledColumns : internalColumns;
    const cards = useMemo(
      () => (isControlled ? (controlledCards ?? []) : internalCards),
      [controlledCards, internalCards, isControlled],
    );
    const displayedCards = previewCards ?? cards;

    // Is dragging?
    const isDragging = activeId !== null;
    const isDraggingColumn = activeType === "column";

    // Sensors
    const sensors = useSensors(
      useSensor(MouseSensor, {
        activationConstraint: { distance: 8 },
      }),
      useSensor(TouchSensor, {
        activationConstraint: { delay: 250, tolerance: 5 },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    // Handle column changes
    const handleColumnsChange = useCallback(
      (newColumns: KanbanColumnType[]) => {
        const internalColumnsSnapshot = cloneColumns(newColumns);
        const externalColumnsSnapshot = cloneColumns(newColumns);
        if (!isControlled) {
          setInternalColumns(internalColumnsSnapshot);
        }
        onColumnsChange?.(externalColumnsSnapshot);
      },
      [isControlled, onColumnsChange],
    );

    // Handle card changes
    const handleCardsChange = useCallback(
      (
        newCards: KanbanCardType[],
        externalCards: KanbanCardType[] = newCards,
      ) => {
        if (!isControlled) {
          setInternalCards(newCards);
        }
        onCardsChange?.(externalCards);
      },
      [isControlled, onCardsChange],
    );

    // Get cards for a specific column (sorted by order)
    const getColumnCards = useCallback(
      (columnId: string) => {
        return getSortedColumnCards(displayedCards, columnId);
      },
      [displayedCards],
    );

    const finishDragLifecycle = useCallback(
      (
        announcement: string,
        commit?: (transaction: DragTransaction) => void,
      ): boolean => {
        const transaction = takeDragTransaction();
        if (!transaction) return false;

        announcementOutcomeRef.current = boundedAnnouncement(announcement);
        setPreviewCards(null);
        setActiveId(null);
        setActiveType(null);

        try {
          commit?.(transaction);
        } finally {
          onKanbanDragEndRef.current?.(transaction.type, transaction.activeId);
        }
        return true;
      },
      [takeDragTransaction],
    );

    // Drag start handler
    const handleDragStart = useCallback(
      (event: DragStartEvent) => {
        if (dragTransactionRef.current) return;
        const id = event.active.id;
        if (typeof id !== "string") return;

        const columnsSnapshot = cloneColumns(columns);
        const authoritySnapshot = createDragAuthority(columnsSnapshot, cards);
        if (!authoritySnapshot) return;
        const cardsSnapshot = authoritySnapshot.cards;
        const columnMatch = columnsSnapshot.some((column) => column.id === id);
        const card = cardsSnapshot.find((candidate) => candidate.id === id);
        if (Number(columnMatch) + Number(Boolean(card)) !== 1) return;

        const type: DragType = columnMatch ? "column" : "card";

        dragTransactionRef.current = {
          type,
          activeId: id,
          sourceColumnId: card?.columnId ?? null,
          columns: columnsSnapshot,
          cards: cardsSnapshot,
          authority: authoritySnapshot.authority,
          previewCards: cardsSnapshot,
          overId: null,
          blockReason: null,
          stableExternalTarget: null,
          lastAnnouncedTarget: null,
        };
        announcementOutcomeRef.current = null;
        setPreviewCards(null);

        setActiveId(id);
        setActiveType(type);
        onKanbanDragStart?.(type, id);
      },
      [cards, columns, onKanbanDragStart],
    );

    // Drag over is preview-only. External state and callbacks commit at drop.
    const handleDragOver = useCallback(
      (event: DragOverEvent) => {
        const transaction = dragTransactionRef.current;
        const activeId = event.active.id;
        const overId = event.over?.id;
        if (
          !transaction ||
          transaction.type !== "card" ||
          typeof activeId !== "string" ||
          activeId !== transaction.activeId
        ) {
          return;
        }

        if (typeof overId !== "string") {
          transaction.blockReason = "invalid-target";
          transaction.overId = null;
          clearCardPreviewAuthority(transaction);
          setPreviewCards(null);
          return;
        }

        if (
          createDragAuthority(columns, cards)?.authority !==
          transaction.authority
        ) {
          transaction.blockReason = "drift";
          transaction.overId = overId;
          clearCardPreviewAuthority(transaction);
          setPreviewCards(null);
          return;
        }

        if (
          overId === transaction.activeId &&
          transaction.stableExternalTarget
        ) {
          transaction.blockReason = null;
          transaction.overId = overId;
          return;
        }

        const target = resolveCardDropTarget(transaction, overId);
        if (!target) {
          transaction.blockReason = "invalid-target";
          transaction.overId = overId;
          clearCardPreviewAuthority(transaction);
          setPreviewCards(null);
          return;
        }
        transaction.overId = overId;

        if (isWipBlocked(transaction, target)) {
          transaction.blockReason = "wip-limit";
          clearCardPreviewAuthority(transaction);
          setPreviewCards(null);
          return;
        }

        transaction.blockReason = null;
        if (target.columnId === transaction.sourceColumnId) {
          clearCardPreviewAuthority(transaction);
          setPreviewCards(null);
          return;
        }

        if (sameCardDropTarget(transaction.stableExternalTarget, target)) {
          return;
        }

        const nextPreview = moveCardInSnapshot(transaction, target);
        if (!nextPreview) {
          transaction.blockReason = "invalid-target";
          clearCardPreviewAuthority(transaction);
          setPreviewCards(null);
          return;
        }
        transaction.stableExternalTarget = target;
        transaction.previewCards = nextPreview;
        setPreviewCards(nextPreview);
      },
      [cards, columns],
    );

    // Drag end handler
    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const transaction = dragTransactionRef.current;
        const activeId = event.active.id;
        const overId = event.over?.id;
        if (
          !transaction ||
          typeof activeId !== "string" ||
          activeId !== transaction.activeId
        ) {
          finishDragLifecycle("Drag cancelled.");
          return;
        }
        if (
          createDragAuthority(columns, cards)?.authority !==
          transaction.authority
        ) {
          finishDragLifecycle("Drag cancelled because the board changed.");
          return;
        }
        if (typeof overId !== "string") {
          finishDragLifecycle("Drag cancelled without a drop target.");
          return;
        }

        if (transaction.type === "column") {
          const oldIndex = transaction.columns.findIndex(
            (column) => column.id === transaction.activeId,
          );
          const newIndex = transaction.columns.findIndex(
            (column) => column.id === overId,
          );
          if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
            finishDragLifecycle("Column drag cancelled.");
            return;
          }
          const newColumns = arrayMove(
            cloneColumns(transaction.columns),
            oldIndex,
            newIndex,
          );
          const columnMove = {
            columnId: transaction.activeId,
            toIndex: newIndex,
          };
          finishDragLifecycle("Column dropped.", () => {
            handleColumnsChange(newColumns);
            onColumnMove?.(columnMove);
          });
          return;
        }

        const target =
          overId === transaction.activeId &&
          transaction.stableExternalTarget !== null
            ? transaction.stableExternalTarget
            : resolveCardDropTarget(transaction, overId);
        if (!target || isWipBlocked(transaction, target)) {
          finishDragLifecycle(
            target
              ? "Move blocked by the target WIP limit."
              : "Drag cancelled.",
          );
          return;
        }
        const newCards = moveCardInSnapshot(transaction, target);
        const committedSnapshot = newCards
          ? createDragAuthority(transaction.columns, newCards)
          : null;
        if (
          !committedSnapshot ||
          committedSnapshot.authority === transaction.authority
        ) {
          finishDragLifecycle("Card drag cancelled without a move.");
          return;
        }
        const externalSnapshot = createDragAuthority(
          transaction.columns,
          committedSnapshot.cards,
        );
        if (
          !externalSnapshot ||
          externalSnapshot.authority !== committedSnapshot.authority
        ) {
          finishDragLifecycle("Card drag cancelled.");
          return;
        }
        const movedCard = committedSnapshot.cards.find(
          (card) => card.id === transaction.activeId,
        );
        const sourceColumnId = transaction.sourceColumnId;
        if (!movedCard || sourceColumnId === null) {
          finishDragLifecycle("Card drag cancelled.");
          return;
        }
        const moveEvent = {
          cardId: transaction.activeId,
          fromColumnId: sourceColumnId,
          toColumnId: movedCard.columnId,
          toIndex: movedCard.order ?? 0,
        };

        finishDragLifecycle("Card dropped.", () => {
          handleCardsChange(committedSnapshot.cards, externalSnapshot.cards);
          onCardMove?.(moveEvent);
        });
      },
      [
        cards,
        columns,
        finishDragLifecycle,
        handleColumnsChange,
        handleCardsChange,
        onCardMove,
        onColumnMove,
      ],
    );

    const handleDragCancel = useCallback(
      (_event: DragCancelEvent) => {
        finishDragLifecycle("Drag cancelled.");
      },
      [finishDragLifecycle],
    );

    const accessibility = useMemo(
      () => ({
        screenReaderInstructions: {
          draggable: SCREEN_READER_INSTRUCTIONS,
        },
        announcements: {
          onDragStart: ({ active }: Pick<DragStartEvent, "active">) => {
            const transaction = dragTransactionRef.current;
            const currentId = typeof active.id === "string" ? active.id : null;
            const card = transaction?.cards.find(({ id }) => id === currentId);
            const column = transaction?.columns.find(
              ({ id }) => id === currentId,
            );
            const label = sanitizeAnnouncementLabel(
              card?.title ?? column?.title,
              transaction?.type === "column" ? "Column" : "Card",
            );
            return boundedAnnouncement(`Picked up ${label}.`);
          },
          onDragOver: ({ over }: Pick<DragOverEvent, "over">) => {
            const transaction = dragTransactionRef.current;
            const overId = over?.id;
            if (!transaction || typeof overId !== "string") return undefined;
            if (
              overId === transaction.activeId &&
              transaction.stableExternalTarget
            ) {
              return undefined;
            }
            if (transaction.lastAnnouncedTarget === overId) return undefined;
            transaction.lastAnnouncedTarget = overId;
            if (
              transaction.blockReason === "wip-limit" &&
              transaction.overId === overId
            ) {
              return boundedAnnouncement(
                "Move blocked. The target column is at its WIP limit.",
              );
            }
            const card = transaction.previewCards.find(
              ({ id }) => id === overId,
            );
            const column = transaction.columns.find(({ id }) => id === overId);
            const label = sanitizeAnnouncementLabel(
              card?.title ?? column?.title,
              "drop target",
            );
            return boundedAnnouncement(`Moving over ${label}.`);
          },
          onDragEnd: () => {
            const outcome =
              announcementOutcomeRef.current ?? "Drag finished without a move.";
            announcementOutcomeRef.current = null;
            return boundedAnnouncement(outcome);
          },
          onDragCancel: () => {
            const outcome = announcementOutcomeRef.current ?? "Drag cancelled.";
            announcementOutcomeRef.current = null;
            return boundedAnnouncement(outcome);
          },
        },
      }),
      [],
    );

    // Active item for overlay
    const activeCard = useMemo(() => {
      if (!activeId || activeType !== "card") return null;
      return displayedCards.find((c) => c.id === activeId);
    }, [activeId, activeType, displayedCards]);

    const activeColumnData = useMemo(() => {
      if (!activeId || activeType !== "column") return null;
      return columns.find((c) => c.id === activeId);
    }, [activeId, activeType, columns]);

    // Board styles based on variant
    const boardBaseStyle = useMemo((): React.CSSProperties => {
      const base: React.CSSProperties = {
        display: "flex",
        ...resolveDot("gap-4 pb-4"),
        overflowX: "auto",
        minHeight: "400px",
      };

      switch (variant) {
        case "gradient":
          return {
            ...base,
            ...resolveDot("p-4 rounded-xl"),
            background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
          };
        case "outline":
          return {
            ...base,
            ...resolveDot("p-4 rounded-xl"),
            border: "2px dashed #d1d5db",
          };
        case "elevated":
          return {
            ...base,
            ...resolveDot("p-4 rounded-xl"),
            backgroundColor: "rgba(249,250,251,0.5)",
          };
        default:
          return base;
      }
    }, [variant]);

    // Column IDs for SortableContext
    const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

    // Drag overlay styles
    const cardOverlayStyle = useMemo(
      () => ({
        transform: `rotate(${dragRotation}deg) scale(${dragScale})`,
      }),
      [dragRotation, dragScale],
    );

    // SSR placeholder - prevents hydration mismatch from @dnd-kit's aria-describedby
    if (!isMounted) {
      return (
        <div
          ref={ref}
          role="region"
          aria-label="칸반 보드"
          style={mergeStyles(boardBaseStyle, resolveDot(dot), style)}
          {...props}
        >
          {columns.map((column) => (
            <div
              key={column.id}
              style={{
                flexShrink: 0,
                backgroundColor: "#f3f4f6",
                ...resolveDot("rounded-xl p-3"),
                minWidth: columnMinWidth,
                maxWidth: columnMaxWidth,
              }}
            >
              <Skeleton variant="text" dot="h-8 mb-3" />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  ...resolveDot("gap-2"),
                }}
              >
                {getColumnCards(column.id)
                  .slice(0, 3)
                  .map((card) => (
                    <Skeleton key={card.id} variant="rounded" dot="h-20" />
                  ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <KanbanProvider
        columns={columns}
        cards={displayedCards}
        onColumnsChange={handleColumnsChange}
        onCardsChange={handleCardsChange}
        onCardMove={onCardMove}
        onColumnMove={onColumnMove}
        onCardAdd={onCardAdd}
        onCardDelete={onCardDelete}
        onCardUpdate={onCardUpdate}
        onColumnAdd={onColumnAdd}
        onColumnDelete={onColumnDelete}
        onColumnUpdate={onColumnUpdate}
        onCardClick={onCardClick}
        variant={variant}
        color={color}
        allowCardDrag={allowCardDrag && !readOnly}
        allowColumnDrag={allowColumnDrag && !readOnly}
        allowAddCard={allowAddCard && !readOnly}
        allowAddColumn={allowAddColumn && !readOnly}
        readOnly={readOnly}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          accessibility={accessibility}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {/* Dimmed overlay when dragging column */}
          {showDragOverlay && isDragging && isDraggingColumn && (
            <div
              style={mergeStyles(
                {
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.2)",
                  zIndex: 40,
                  transition: "opacity 200ms",
                },
                dragOverlayStyle,
              )}
              aria-hidden="true"
            />
          )}

          <div
            ref={ref}
            role="region"
            aria-label="칸반 보드"
            style={mergeStyles(
              boardBaseStyle,
              isDragging ? { position: "relative", zIndex: 50 } : undefined,
              resolveDot(dot),
              style,
            )}
            {...props}
          >
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column, index) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={getColumnCards(column.id)}
                  index={index}
                  style={
                    column.collapsed
                      ? undefined
                      : {
                          minWidth: columnMinWidth,
                          maxWidth: columnMaxWidth,
                        }
                  }
                />
              ))}
            </SortableContext>

            {/* Add Column Button */}
            {allowAddColumn && !readOnly && (
              <KanbanAddColumn
                style={{
                  minWidth: columnMinWidth,
                  maxWidth: columnMaxWidth,
                }}
              />
            )}
          </div>

          {/* Drag Overlay */}
          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            {activeCard && (
              <div
                style={{
                  ...cardOverlayStyle,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                }}
              >
                <KanbanCard card={activeCard} index={0} isDragging />
              </div>
            )}
            {activeColumnData && (
              <div
                style={{
                  opacity: 0.9,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                  transform: "rotate(1deg)",
                  minWidth: columnMinWidth,
                  maxWidth: columnMaxWidth,
                }}
              >
                <KanbanColumn
                  column={activeColumnData}
                  cards={getColumnCards(activeColumnData.id)}
                  index={0}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </KanbanProvider>
    );
  },
);

KanbanBoard.displayName = "KanbanBoard";
