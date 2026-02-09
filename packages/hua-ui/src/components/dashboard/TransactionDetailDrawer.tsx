"use client";

import React from "react";
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

/**
 * 거래 상세 정보 인터페이스 / TransactionDetail interface
 * @typedef {Object} TransactionDetail
 * @property {string} id - 거래 ID / Transaction ID
 * @property {TransactionStatus} status - 거래 상태 / Transaction status
 * @property {number} amount - 거래 금액 / Transaction amount
 * @property {string} [currency] - 통화 / Currency
 * @property {string} [merchant] - 가맹점 / Merchant
 * @property {string} [method] - 결제수단 / Payment method
 * @property {string | Date} [createdAt] - 생성일시 / Created date
 * @property {string | Date} [approvedAt] - 승인일시 / Approved date
 * @property {string} [customer] - 고객 정보 / Customer information
 * @property {string} [reference] - 참조 번호 / Reference number
 */
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

/**
 * 거래 메타데이터 아이템 인터페이스 / TransactionMetadataItem interface
 * @typedef {Object} TransactionMetadataItem
 * @property {string} label - 라벨 / Label
 * @property {React.ReactNode} value - 값 / Value
 * @property {IconName} [icon] - 아이콘 / Icon
 */
export interface TransactionMetadataItem {
  label: string;
  value: React.ReactNode;
  icon?: IconName;
}

export type SettlementStatus = "pending" | "processing" | "completed" | "failed";

/**
 * 정산 정보 인터페이스 / SettlementInfo interface
 * @typedef {Object} SettlementInfo
 * @property {SettlementStatus} [status] - 정산 상태 / Settlement status
 * @property {number} [amount] - 정산 금액 / Settlement amount
 * @property {string} [currency] - 통화 / Currency
 * @property {string | Date} [scheduledDate] - 예정일 / Scheduled date
 * @property {string} [expectedPayout] - 예상 지급액 / Expected payout
 * @property {string} [bankAccount] - 계좌 정보 / Bank account information
 * @property {string} [reference] - 참조 번호 / Reference number
 * @property {string} [note] - 메모 / Note
 */
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

/**
 * 수수료 내역 인터페이스 / FeeBreakdown interface
 * @typedef {Object} FeeBreakdown
 * @property {string} label - 수수료 라벨 / Fee label
 * @property {number} amount - 수수료 금액 / Fee amount
 * @property {string} [currency] - 통화 / Currency
 * @property {string} [description] - 설명 / Description
 */
export interface FeeBreakdown {
  label: string;
  amount: number;
  currency?: string;
  description?: string;
}

/**
 * 거래 이벤트 인터페이스 / TransactionEvent interface
 * @typedef {Object} TransactionEvent
 * @property {string} id - 이벤트 ID / Event ID
 * @property {string} title - 이벤트 제목 / Event title
 * @property {string} [description] - 설명 / Description
 * @property {string | Date} timestamp - 타임스탬프 / Timestamp
 * @property {"success" | "warning" | "error" | "info"} [status] - 이벤트 상태 / Event status
 * @property {IconName} [icon] - 아이콘 / Icon
 * @property {string} [actor] - 실행자 / Actor
 */
export interface TransactionEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  status?: "success" | "warning" | "error" | "info";
  icon?: IconName;
  actor?: string;
}

/**
 * TransactionDetailDrawer 컴포넌트의 props / TransactionDetailDrawer component props
 * @typedef {Object} TransactionDetailDrawerProps
 * @property {boolean} open - 드로어 열림 상태 / Drawer open state
 * @property {() => void} onClose - 닫기 핸들러 / Close handler
 * @property {TransactionDetail} [transaction] - 거래 상세 정보 / Transaction detail information
 * @property {TransactionMetadataItem[]} [metadata=[]] - 메타데이터 배열 / Metadata array
 * @property {SettlementInfo} [settlement] - 정산 정보 / Settlement information
 * @property {FeeBreakdown[]} [fees=[]] - 수수료 내역 배열 / Fee breakdown array
 * @property {TransactionEvent[]} [events=[]] - 이벤트 로그 배열 / Event log array
 * @property {React.ReactNode} [actions] - 액션 컴포넌트 / Actions component
 * @property {React.ReactNode} [summary] - 요약 컴포넌트 / Summary component
 * @property {boolean} [loading=false] - 로딩 상태 / Loading state
 * @property {string} [locale="ko-KR"] - 로케일 / Locale
 * @property {string} [defaultCurrency="KRW"] - 기본 통화 / Default currency
 * @property {React.ReactNode} [emptyState] - 빈 상태 컴포넌트 / Empty state component
 * @property {string} [className] - 추가 클래스명 / Additional class name
 */
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

/**
 * TransactionDetailDrawer 컴포넌트
 * 
 * 거래 상세 정보를 표시하는 드로어 컴포넌트입니다.
 * 거래 정보, 정산 정보, 수수료 내역, 이벤트 로그 등을 포함합니다.
 * 
 * Drawer component that displays detailed transaction information.
 * Includes transaction details, settlement info, fee breakdown, and event logs.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <TransactionDetailDrawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   transaction={{
 *     id: "tx_123",
 *     status: "approved",
 *     amount: 100000,
 *     currency: "KRW",
 *     merchant: "가맹점 A"
 *   }}
 *   metadata={[
 *     { label: "거래 ID", value: "tx_123", icon: "creditCard" },
 *     { label: "고객", value: "홍길동", icon: "user" }
 *   ]}
 * />
 * 
 * @example
 * // 정산 정보 포함 / With settlement info
 * <TransactionDetailDrawer
 *   open={isOpen}
 *   onClose={handleClose}
 *   transaction={transaction}
 *   settlement={{
 *     status: "processing",
 *     amount: 95000,
 *     currency: "KRW",
 *     scheduledDate: new Date("2024-01-15")
 *   }}
 *   fees={[
 *     { label: "수수료", amount: 5000, currency: "KRW" }
 *   ]}
 *   events={eventLogs}
 * />
 * 
 * @param {TransactionDetailDrawerProps} props - TransactionDetailDrawer 컴포넌트의 props / TransactionDetailDrawer component props
 * @returns {JSX.Element} TransactionDetailDrawer 컴포넌트 / TransactionDetailDrawer component
 */
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
      isOpen={open}
      onClose={onClose}
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
            <section 
              className="grid gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4 md:grid-cols-2"
              aria-label="거래 요약 정보"
            >
              <div className="space-y-1">
                <p className="text-xs uppercase text-slate-400">거래 금액</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {formatAmount(transaction?.amount, transaction?.currency ?? defaultCurrency, locale)}
                </p>
                <p className="text-xs text-slate-400">
                  생성 <time dateTime={transaction?.createdAt instanceof Date ? transaction.createdAt.toISOString() : typeof transaction?.createdAt === 'string' ? transaction.createdAt : undefined}>
                    {formatDate(transaction?.createdAt, locale)}
                  </time>
                </p>
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
              <section 
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4"
                aria-label="거래 세부 정보"
                role="region"
              >
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">세부 정보</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {metadata.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      {item.icon && (
                        <span className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-slate-800/80" aria-hidden="true">
                          <Icon name={item.icon} className="h-4 w-4" />
                        </span>
                      )}
                      <div>
                        <dt className="text-xs uppercase text-slate-400">{item.label}</dt>
                        <dd className="text-sm text-slate-700 dark:text-slate-200">{item.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {settlement && (
              <section 
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4"
                aria-label="정산 정보"
                role="region"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">정산 정보</h3>
                    {settlement.note && <p className="text-xs text-slate-500">{settlement.note}</p>}
                  </div>
                  {settlement.status && (
                    <span 
                      className={merge("rounded-full px-3 py-1 text-xs font-medium", getSettlementBadge(settlement.status))}
                      aria-label={`정산 상태: ${settlement.status}`}
                    >
                      {settlement.status}
                    </span>
                  )}
                </div>
                <dl className="grid gap-4 md:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase text-slate-400">정산 금액</dt>
                    <dd className="text-sm text-slate-700 dark:text-slate-200">
                      {formatAmount(settlement.amount, settlement.currency ?? defaultCurrency, locale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-400">예정일</dt>
                    <dd className="text-sm text-slate-700 dark:text-slate-200">
                      {settlement.scheduledDate && (
                        <time dateTime={settlement.scheduledDate instanceof Date ? settlement.scheduledDate.toISOString() : typeof settlement.scheduledDate === 'string' ? settlement.scheduledDate : undefined}>
                          {formatDate(settlement.scheduledDate, locale)}
                        </time>
                      )}
                    </dd>
                  </div>
                  {settlement.bankAccount && (
                    <div>
                      <dt className="text-xs uppercase text-slate-400">계좌</dt>
                      <dd className="text-sm text-slate-700 dark:text-slate-200">{settlement.bankAccount}</dd>
                    </div>
                  )}
                  {settlement.expectedPayout && (
                    <div>
                      <dt className="text-xs uppercase text-slate-400">예상 지급</dt>
                      <dd className="text-sm text-slate-700 dark:text-slate-200">{settlement.expectedPayout}</dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {fees.length > 0 && (
              <section 
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4"
                aria-label="수수료 내역"
                role="region"
              >
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">수수료</h3>
                <dl className="space-y-3">
                  {fees.map((fee) => (
                    <div key={fee.label} className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
                      <div>
                        <dt className="font-medium">{fee.label}</dt>
                        {fee.description && <dd className="text-xs text-slate-400">{fee.description}</dd>}
                      </div>
                      <dd>{formatAmount(fee.amount, fee.currency ?? defaultCurrency, locale)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section 
              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-4"
              aria-label="이벤트 로그"
              role="region"
            >
              <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">이벤트 로그</h3>
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
                <ol className="space-y-3" role="list" aria-label="이벤트 목록">
                  {events.map((event) => (
                    <li
                      key={event.id}
                      role="listitem"
                      className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3"
                    >
                      <div className={merge("rounded-lg p-2", getEventColor(event.status))} aria-hidden="true">
                        <Icon name={event.icon ?? "activity"} className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-900 dark:text-white">
                          <span>{event.title}</span>
                          <time 
                            dateTime={event.timestamp instanceof Date ? event.timestamp.toISOString() : typeof event.timestamp === 'string' ? event.timestamp : undefined}
                            className="text-xs text-slate-400"
                          >
                            {formatDate(event.timestamp, locale)}
                          </time>
                        </div>
                        {event.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-300">{event.description}</p>
                        )}
                        {event.actor && (
                          <p className="text-xs text-slate-400 mt-1" aria-label={`실행자: ${event.actor}`}>
                            by {event.actor}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
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

