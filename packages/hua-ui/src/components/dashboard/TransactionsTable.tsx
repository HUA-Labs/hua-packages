"use client";

import * as React from "react";
import { merge } from "../../lib/utils";
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

export interface TransactionColumnConfig {
  key: TransactionColumnKey;
  label?: string;
  align?: "left" | "center" | "right";
  width?: string;
  render?: (row: TransactionRow) => React.ReactNode;
}

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
  className?: string;
  footer?: React.ReactNode;
}

const STATUS_STYLES: Record<TransactionStatus, { label: string; badge: string }> = {
  approved: {
    label: "승인",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  },
  pending: {
    label: "대기",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  },
  failed: {
    label: "실패",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
  },
  refunded: {
    label: "환불",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
  },
  cancelled: {
    label: "취소",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200",
  },
  review: {
    label: "검토중",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200",
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
  className,
  footer,
}) => {
  const columnList = columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const hasRows = rows.length > 0;

  const renderStatus = (status: TransactionStatus, row: TransactionRow) => {
    if (statusRenderer) return statusRenderer(status, row);
    const config = STATUS_STYLES[status] || STATUS_STYLES.pending;
    const label = statusLabels?.[status] ?? config.label;
    return (
      <Badge className={merge("font-medium px-3 py-1 rounded-full text-xs", config.badge)}>
        {label}
      </Badge>
    );
  };

  const renderAmount = (row: TransactionRow) => {
    if (amountFormatter) return amountFormatter(row);
    const currency = row.currency || defaultCurrency;
    try {
      return (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
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
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-slate-100">{row.id}</span>
            {row.reference && (
              <span className="text-xs text-slate-500 dark:text-slate-400">{row.reference}</span>
            )}
          </div>
        );
      case "merchant":
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-slate-100">{row.merchant}</span>
            {row.customer && (
              <span className="text-xs text-slate-500 dark:text-slate-400">{row.customer}</span>
            )}
          </div>
        );
      case "amount":
        return (
          <div className="flex flex-col items-end">
            {renderAmount(row)}
            {typeof row.fee === "number" && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                수수료 {row.fee.toLocaleString(locale)}
              </span>
            )}
          </div>
        );
      case "status":
        return renderStatus(row.status, row);
      case "method":
        return <span className="text-slate-700 dark:text-slate-300">{renderMethod(row)}</span>;
      case "date":
        return <span className="text-slate-700 dark:text-slate-300">{renderDate(row)}</span>;
      case "customer":
        return row.customer ?? "-";
      case "fee":
        return typeof row.fee === "number" ? row.fee.toLocaleString(locale) : "-";
      default:
        return "-";
    }
  };

  return (
    <div className={merge("rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900", className)}>
      {filters && (
        <div className="border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4">{filters}</div>
      )}
      <div className="p-4 sm:p-6">
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <Table>
            {caption && <TableCaption>{caption}</TableCaption>}
            <TableHeader className="bg-slate-50/60 dark:bg-slate-900/40">
              <TableRow className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {columnList.map((column) => (
                  <TableHead
                    key={column.key}
                    style={{ width: column.width }}
                    className={merge(
                      column.align === "right"
                        ? "text-right"
                        : column.align === "center"
                        ? "text-center"
                        : "text-left",
                      "text-xs font-semibold"
                    )}
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
                    <SkeletonTable className="py-4" />
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
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onRowClick(row);
                    }
                  };
                  return (
                    <TableRow
                      key={row.id}
                      tabIndex={clickable ? 0 : undefined}
                      role={clickable ? "button" : undefined}
                      onKeyDown={clickable ? handleRowKeyDown : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={merge(
                        "text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70",
                        clickable && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60",
                        highlightRow?.(row) && "bg-blue-50/60 dark:bg-blue-900/20"
                      )}
                    >
                      {columnList.map((column) => (
                        <TableCell
                          key={column.key}
                          className={merge(
                            column.align === "right"
                              ? "text-right"
                              : column.align === "center"
                              ? "text-center"
                              : "text-left",
                            "align-middle"
                          )}
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
            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TransactionsTable.displayName = "TransactionsTable";

