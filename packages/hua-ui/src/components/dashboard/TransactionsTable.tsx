"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "../Table";
import { Badge } from "../Badge";
import { SkeletonTable } from "../Skeleton";
import { DashboardEmptyState } from "./EmptyState";

export type TransactionStatus =
  | "approved"
  | "pending"
  | "failed"
  | "refunded"
  | "cancelled"
  | "review";

export type TransactionColumnKey =
  | "id"
  | "merchant"
  | "amount"
  | "status"
  | "method"
  | "date"
  | "fee"
  | "customer";

/**
 * 거래 테이블 행 인터페이스
 * @typedef {Object} TransactionRow
 * @property {string} id - 거래 ID
 * @property {string} merchant - 가맹점
 * @property {number} amount - 거래 금액
 * @property {string} [currency] - 통화
 * @property {TransactionStatus} status - 거래 상태
 * @property {string} [method] - 결제수단
 * @property {string | Date} date - 거래 일시
 * @property {string} [customer] - 고객 정보
 * @property {number} [fee] - 수수료
 * @property {string} [reference] - 참조 번호
 */
export interface TransactionRow {
  id: string;
  merchant: string;
  amount: number;
  currency?: string;
  status: TransactionStatus;
  method?: string;
  date: string | Date;
  customer?: string;
  fee?: number;
  reference?: string;
  [key: string]: unknown;
}

/**
 * 거래 테이블 컬럼 설정 인터페이스
 * @typedef {Object} TransactionColumnConfig
 * @property {TransactionColumnKey} key - 컬럼 키
 * @property {string} [label] - 컬럼 라벨
 * @property {"left" | "center" | "right"} [align] - 정렬
 * @property {string} [width] - 컬럼 너비
 * @property {(row: TransactionRow) => React.ReactNode} [render] - 커스텀 렌더러
 */
export interface TransactionColumnConfig {
  key: TransactionColumnKey;
  label?: string;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (row: TransactionRow) => React.ReactNode;
}

/**
 * TransactionsTable 컴포넌트의 props
 * @typedef {Object} TransactionsTableProps
 * @property {TransactionRow[]} rows - 거래 행 배열
 * @property {TransactionColumnConfig[]} [columns] - 컬럼 설정 배열
 * @property {boolean} [isLoading=false] - 로딩 상태
 * @property {number} [loadingRows] - 로딩 행 수
 * @property {React.ReactNode} [caption] - 테이블 캡션
 * @property {React.ReactNode} [filters] - 필터 컴포넌트
 * @property {React.ReactNode} [emptyState] - 빈 상태 컴포넌트
 * @property {(row: TransactionRow) => void} [onRowClick] - 행 클릭 핸들러
 * @property {(row: TransactionRow) => boolean} [highlightRow] - 행 강조 조건
 * @property {Partial<Record<TransactionStatus, string>>} [statusLabels] - 상태 라벨 커스터마이징
 * @property {(status: TransactionStatus, row: TransactionRow) => React.ReactNode} [statusRenderer] - 상태 커스텀 렌더러
 * @property {(row: TransactionRow) => React.ReactNode} [amountFormatter] - 금액 커스텀 포맷터
 * @property {(row: TransactionRow) => React.ReactNode} [methodFormatter] - 결제수단 커스텀 포맷터
 * @property {(row: TransactionRow) => React.ReactNode} [dateFormatter] - 날짜 커스텀 포맷터
 * @property {string} [locale="ko-KR"] - 로케일
 * @property {string} [defaultCurrency="KRW"] - 기본 통화
 * @property {string} [dot] - dot 유틸리티 스트링
 * @property {React.ReactNode} [footer] - 푸터 컴포넌트
 * @property {(row: TransactionRow) => string} [rowActionLabel] - 행 액션 라벨 생성 함수
 * @property {string} [rowActionHint] - 행 액션 힌트 텍스트
 */
export interface TransactionsTableProps {
  rows: TransactionRow[];
  columns?: TransactionColumnConfig[];
  isLoading?: boolean;
  loadingRows?: number;
  caption?: React.ReactNode;
  filters?: React.ReactNode;
  emptyState?: React.ReactNode;
  onRowClick?: (row: TransactionRow) => void;
  highlightRow?: (row: TransactionRow) => boolean;
  statusLabels?: Partial<Record<TransactionStatus, string>>;
  statusRenderer?: (status: TransactionStatus, row: TransactionRow) => React.ReactNode;
  amountFormatter?: (row: TransactionRow) => React.ReactNode;
  methodFormatter?: (row: TransactionRow) => React.ReactNode;
  dateFormatter?: (row: TransactionRow) => React.ReactNode;
  locale?: string;
  defaultCurrency?: string;
  style?: React.CSSProperties;
  dot?: string;
  footer?: React.ReactNode;
  rowActionLabel?: (row: TransactionRow) => string;
  rowActionHint?: string;
}

const STATUS_STYLES: Record<TransactionStatus, { label: string; badgeStyle: React.CSSProperties }> = {
  approved: {
    label: "승인",
    badgeStyle: { backgroundColor: "#d1fae5", color: "#065f46" },
  },
  pending: {
    label: "대기",
    badgeStyle: { backgroundColor: "#fef3c7", color: "#92400e" },
  },
  failed: {
    label: "실패",
    badgeStyle: { backgroundColor: "#ffe4e6", color: "#9f1239" },
  },
  refunded: {
    label: "환불",
    badgeStyle: { backgroundColor: "#e0f2fe", color: "#075985" },
  },
  cancelled: {
    label: "취소",
    badgeStyle: { backgroundColor: "#f1f5f9", color: "#334155" },
  },
  review: {
    label: "검토중",
    badgeStyle: { backgroundColor: "#ede9fe", color: "#5b21b6" },
  },
};

const DEFAULT_COLUMNS: TransactionColumnConfig[] = [
  { key: "id", label: "거래 ID", width: "160px" },
  { key: "merchant", label: "가맹점" },
  { key: "amount", label: "금액", align: "right", width: "140px" },
  { key: "status", label: "상태", width: "120px" },
  { key: "method", label: "결제수단", width: "120px" },
  { key: "date", label: "거래 일시", width: "180px" },
];

/**
 * TransactionsTable 컴포넌트
 *
 * 거래 목록을 테이블 형태로 표시하는 컴포넌트입니다.
 * 정렬, 필터링, 커스텀 렌더링 등을 지원합니다.
 *
 * Table component that displays transaction list.
 * Supports sorting, filtering, and custom rendering.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <TransactionsTable
 *   rows={[
 *     {
 *       id: "tx_123",
 *       merchant: "가맹점 A",
 *       amount: 100000,
 *       status: "approved",
 *       method: "카드",
 *       date: new Date()
 *     }
 *   ]}
 *   onRowClick={(row) => console.log(row)}
 * />
 *
 * @example
 * // 커스텀 컬럼과 포맷터 / Custom columns and formatters
 * <TransactionsTable
 *   rows={transactions}
 *   columns={[
 *     { key: "id", label: "ID" },
 *     { key: "amount", label: "금액", align: "right" },
 *     { key: "status", label: "상태" }
 *   ]}
 *   amountFormatter={(row) => `₩${row.amount.toLocaleString()}`}
 *   statusRenderer={(status) => <CustomBadge status={status} />}
 *   isLoading={loading}
 * />
 *
 * @param {TransactionsTableProps} props - TransactionsTable 컴포넌트의 props / TransactionsTable component props
 * @returns {JSX.Element} TransactionsTable 컴포넌트 / TransactionsTable component
 */
export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  rows,
  columns = DEFAULT_COLUMNS,
  isLoading = false,
  caption,
  filters,
  emptyState,
  onRowClick,
  highlightRow,
  statusLabels,
  statusRenderer,
  amountFormatter,
  methodFormatter,
  dateFormatter,
  locale = "ko-KR",
  defaultCurrency = "KRW",
  style,
  dot: dotProp,
  footer,
  rowActionLabel,
  rowActionHint,
}) => {
  const columnList = columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const hasRows = rows.length > 0;
  const tableId = React.useId();
  const rowActionHintId = rowActionHint ? `${tableId}-row-action-hint` : undefined;

  const getRowActionLabel = React.useCallback(
    (row: TransactionRow) => {
      if (rowActionLabel) return rowActionLabel(row);
      const baseLabel = row.id ? `거래 ${row.id}` : "거래 행";
      return `${baseLabel} 상세 보기`;
    },
    [rowActionLabel]
  );

  const renderStatus = (status: TransactionStatus, row: TransactionRow) => {
    if (statusRenderer) return statusRenderer(status, row);
    const config = STATUS_STYLES[status] || STATUS_STYLES.pending;
    const label = statusLabels?.[status] ?? config.label;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", fontWeight: 500, padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", ...config.badgeStyle }}>
        {label}
      </span>
    );
  };

  const renderAmount = (row: TransactionRow) => {
    if (amountFormatter) return amountFormatter(row);
    const currency = row.currency || defaultCurrency;
    try {
      return (
        <span style={{ fontWeight: 600, color: "var(--color-foreground, #0f172a)" }}>
          {new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
          }).format(row.amount)}
        </span>
      );
    } catch {
      return `${row.amount.toLocaleString(locale)} ${currency}`;
    }
  };

  const renderMethod = (row: TransactionRow) => {
    if (methodFormatter) return methodFormatter(row);
    return row.method ?? "-";
  };

  const renderDate = (row: TransactionRow) => {
    if (dateFormatter) return dateFormatter(row);
    const dateObj = row.date instanceof Date ? row.date : new Date(row.date);
    return dateObj.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  };

  const renderCell = (column: TransactionColumnConfig, row: TransactionRow) => {
    if (column.render) return column.render(row);

    switch (column.key) {
      case "id":
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 500, color: "var(--color-foreground, #0f172a)" }}>{row.id}</span>
            {row.reference && (
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{row.reference}</span>
            )}
          </div>
        );
      case "merchant":
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 500, color: "var(--color-foreground, #0f172a)" }}>{row.merchant}</span>
            {row.customer && (
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{row.customer}</span>
            )}
          </div>
        );
      case "amount":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            {renderAmount(row)}
            {typeof row.fee === "number" && (
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                수수료 {row.fee.toLocaleString(locale)}
              </span>
            )}
          </div>
        );
      case "status":
        return renderStatus(row.status, row);
      case "method":
        return <span style={{ color: "#475569" }}>{renderMethod(row)}</span>;
      case "date":
        return <span style={{ color: "#475569" }}>{renderDate(row)}</span>;
      case "customer":
        return row.customer ?? "-";
      case "fee":
        return typeof row.fee === "number" ? row.fee.toLocaleString(locale) : "-";
      default:
        return "-";
    }
  };

  return (
    <div style={mergeStyles(
      {
        borderRadius: "1rem",
        border: "1px solid rgba(226,232,240,0.6)",
        backgroundColor: "var(--color-card, #ffffff)",
      },
      resolveDot(dotProp),
      style
    )}>
      {filters && (
        <div style={{ borderBottom: "1px solid var(--color-border, #f1f5f9)", padding: "1rem 1.5rem" }}>{filters}</div>
      )}
      <div style={{ padding: "1rem 1.5rem" }}>
        <div style={{ borderRadius: "0.75rem", border: "1px solid var(--color-border, #f1f5f9)", overflow: "hidden" }}>
          <Table
            role="table"
            aria-label={caption ? (typeof caption === "string" ? caption : "거래 목록 테이블") : "거래 목록 테이블"}
          >
            {caption && <TableCaption>{caption}</TableCaption>}
            <TableHeader style={{ backgroundColor: 'var(--color-muted)', opacity: 0.6 }}>
              <TableRow style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted-foreground)' }}>
                {columnList.map((column) => (
                  <TableHead
                    key={column.key}
                    style={{
                      width: column.width,
                      textAlign: column.align === "right" ? "right" : column.align === "center" ? "center" : "left",
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={columnList.length}>
                    <SkeletonTable dot="py-4" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !hasRows && (
                <TableRow>
                  <TableCell colSpan={columnList.length}>
                    {emptyState || (
                      <DashboardEmptyState
                        title="거래 데이터가 없습니다"
                        description="필터를 조정하거나 날짜 범위를 변경해보세요."
                        icon="database-backup"
                        size="md"
                      />
                    )}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                rows.map((row) => {
                  const clickable = Boolean(onRowClick);
                  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
                    if (!onRowClick) return;
                    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
                      event.preventDefault();
                      onRowClick(row);
                    }
                  };
                  const rowLabel = clickable ? getRowActionLabel(row) : undefined;
                  return (
                    <TableRow
                      key={row.id}
                      tabIndex={clickable ? 0 : undefined}
                      role={clickable ? "button" : undefined}
                      onKeyDown={clickable ? handleRowKeyDown : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      aria-label={rowLabel}
                      aria-describedby={clickable && rowActionHintId ? rowActionHintId : undefined}
                      style={{
                        fontSize: '0.875rem',
                        cursor: clickable ? 'pointer' : undefined,
                        backgroundColor: highlightRow?.(row) ? 'var(--color-primary-50, rgba(99,102,241,0.06))' : undefined,
                      }}
                    >
                      {columnList.map((column) => (
                        <TableCell
                          key={column.key}
                          style={{
                            textAlign: column.align === "right" ? "right" : column.align === "center" ? "center" : "left",
                            verticalAlign: 'middle',
                          }}
                        >
                          {renderCell(column, row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          {!isLoading && hasRows && footer && (
            <div style={{ borderTop: "1px solid var(--color-border, #f1f5f9)", backgroundColor: "var(--color-muted, rgba(248,250,252,0.5))", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#475569" }}>
              {footer}
            </div>
          )}
        </div>
      </div>
      {rowActionHint && (
        <p id={rowActionHintId} style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
          {rowActionHint}
        </p>
      )}
    </div>
  );
};

TransactionsTable.displayName = "TransactionsTable";
