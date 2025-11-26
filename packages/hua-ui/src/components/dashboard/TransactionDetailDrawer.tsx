"use client";

import * as React from "react";
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from "../Drawer";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { merge } from "../../lib/utils";
import { DashboardEmptyState } from "./EmptyState";
import type { TransactionStatus } from "./TransactionsTable";

const STATUS_STYLES: Record<TransactionStatus, { label: string; badge: string }> = {
  approved: { label: "승인", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200" },
  pending: { label: "대기", badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200" },
  failed: { label: "실패", badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200" },
  refunded: { label: "환불", badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200" },
  cancelled: { label: "취소", badge: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200" },
  review: { label: "검토중", badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200" },
};

export interface TransactionDetail {
  id: string;
  status: TransactionStatus;
  amount: number;
  currency?: string;
  merchant?: string;
  method?: string;
  createdAt?: string | Date;
  approvedAt?: string | Date;
  customer?: string;
  reference?: string;
}

export interface TransactionMetadataItem {
  label: string;
  value: React.ReactNode;
  icon?: IconName;
}

export type SettlementStatus = "pending" | "processing" | "completed" | "failed";

export interface SettlementInfo {
  status?: SettlementStatus;
  amount?: number;
  currency?: string;
  scheduledDate?: string | Date;
  expectedPayout?: string;
  bankAccount?: string;
  reference?: string;
  note?: string;
}

export interface FeeBreakdown {
  label: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface TransactionEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  status?: "success" | "warning" | "error" | "info";
  icon?: IconName;
  actor?: string;
}

export interface TransactionDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  transaction?: TransactionDetail;
  metadata?: TransactionMetadataItem[];
  settlement?: SettlementInfo;
  fees?: FeeBreakdown[];
  events?: TransactionEvent[];
  actions?: React.ReactNode;
  summary?: React.ReactNode;
  loading?: boolean;
  locale?: string;
  defaultCurrency?: string;
  emptyState?: React.ReactNode;
  className?: string;
}

const formatAmount = (amount?: number, currency?: string, locale = "ko-KR") => {
  if (typeof amount !== "number") return "-";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency ?? "KRW",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency ?? ""}`.trim();
  }
};

const formatDate = (date?: string | Date, locale = "ko-KR") => {
  if (!date) return "-";
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
};

const getEventColor = (status?: TransactionEvent["status"]) => {
  switch (status) {
    case "success":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100";
    case "warning":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100";
    case "error":
      return "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100";
    default:
      return "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-100";
  }
};

const getSettlementBadge = (status?: SettlementStatus) => {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100";
    case "processing":
      return "bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-100";
    case "failed":
      return "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100";
    case "pending":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100";
    default:
      return "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-100";
  }
};

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  open,
  onClose,
  transaction,
  metadata = [],
  settlement,
  fees = [],
  events = [],
  actions,
  summary,
  loading = false,
  locale = "ko-KR",
  defaultCurrency = "KRW",
  emptyState,
  className,
}) => {
  const statusStyle = transaction && STATUS_STYLES[transaction.status];

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      className={className}
    >
      <DrawerHeader onClose={onClose}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <span>거래 상세</span>
            {transaction?.reference && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{transaction.reference}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{transaction?.id ?? "—"}</p>
            {statusStyle && (
              <Badge className={merge("font-medium px-3 py-1 text-xs rounded-full", statusStyle.badge)}>
                {statusStyle.label}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {transaction?.merchant ?? "가맹점 정보 없음"} · {transaction?.method ?? "결제수단 미지정"}
          </p>
        </div>
      </DrawerHeader>

      <DrawerContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-20 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse bg-slate-50/60 dark:bg-slate-900/40" />
            ))}
          </div>
        ) : (
          <>
            <section className="grid gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase text-slate-400">거래 금액</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {formatAmount(transaction?.amount, transaction?.currency ?? defaultCurrency, locale)}
                </p>
                <p className="text-xs text-slate-400">생성 {formatDate(transaction?.createdAt, locale)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">요약</p>
                {summary ?? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {transaction?.customer ?? "고객 정보 없음"} / {transaction?.method ?? "결제수단 미지정"}
                  </p>
                )}
              </div>
            </section>

            {metadata.length > 0 && (
              <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">세부 정보</div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {metadata.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      {item.icon && (
                        <span className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-slate-800/80">
                          <Icon name={item.icon} className="h-4 w-4" />
                        </span>
                      )}
                      <div>
                        <p className="text-xs uppercase text-slate-400">{item.label}</p>
                        <div className="text-sm text-slate-700 dark:text-slate-200">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {settlement && (
              <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">정산 정보</p>
                    {settlement.note && <p className="text-xs text-slate-500">{settlement.note}</p>}
                  </div>
                  {settlement.status && (
                    <span className={merge("rounded-full px-3 py-1 text-xs font-medium", getSettlementBadge(settlement.status))}>
                      {settlement.status}
                    </span>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-slate-400">정산 금액</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {formatAmount(settlement.amount, settlement.currency ?? defaultCurrency, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400">예정일</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {formatDate(settlement.scheduledDate, locale)}
                    </p>
                  </div>
                  {settlement.bankAccount && (
                    <div>
                      <p className="text-xs uppercase text-slate-400">계좌</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{settlement.bankAccount}</p>
                    </div>
                  )}
                  {settlement.expectedPayout && (
                    <div>
                      <p className="text-xs uppercase text-slate-400">예상 지급</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{settlement.expectedPayout}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {fees.length > 0 && (
              <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">수수료</p>
                <div className="space-y-3">
                  {fees.map((fee) => (
                    <div key={fee.label} className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
                      <div>
                        <p className="font-medium">{fee.label}</p>
                        {fee.description && <p className="text-xs text-slate-400">{fee.description}</p>}
                      </div>
                      <p>{formatAmount(fee.amount, fee.currency ?? defaultCurrency, locale)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4">
              <p className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">이벤트 로그</p>
              {events.length === 0 ? (
                emptyState ?? (
                  <DashboardEmptyState
                    icon="activity"
                    title="이벤트가 없습니다"
                    description="승인/정산 등 상태 변화가 발생하면 자동으로 표시됩니다."
                    size="sm"
                  />
                )
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3"
                    >
                      <div className={merge("rounded-lg p-2", getEventColor(event.status))}>
                        <Icon name={event.icon ?? "activity"} className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-900 dark:text-white">
                          <span>{event.title}</span>
                          <span className="text-xs text-slate-400">{formatDate(event.timestamp, locale)}</span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-300">{event.description}</p>
                        )}
                        {event.actor && <p className="text-xs text-slate-400 mt-1">by {event.actor}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </DrawerContent>

      {actions && <DrawerFooter>{actions}</DrawerFooter>}
    </Drawer>
  );
};

TransactionDetailDrawer.displayName = "TransactionDetailDrawer";

