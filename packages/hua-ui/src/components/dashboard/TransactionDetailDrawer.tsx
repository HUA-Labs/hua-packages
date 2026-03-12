"use client";

import React from "react";
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from "../Drawer";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { DashboardEmptyState } from "./EmptyState";
import type { TransactionStatus } from "./TransactionsTable";

const STATUS_STYLES: Record<
  TransactionStatus,
  { label: string; badgeStyle: React.CSSProperties }
> = {
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

export type SettlementStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

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
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
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
  dot?: string;
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
  return parsed.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getEventStyle = (
  status?: TransactionEvent["status"],
): React.CSSProperties => {
  switch (status) {
    case "success":
      return { backgroundColor: "#ecfdf5", color: "#047857" };
    case "warning":
      return { backgroundColor: "#fffbeb", color: "#b45309" };
    case "error":
      return { backgroundColor: "#fff1f2", color: "#be123c" };
    default:
      return { backgroundColor: "#f8fafc", color: "#475569" };
  }
};

const getSettlementBadgeStyle = (
  status?: SettlementStatus,
): React.CSSProperties => {
  switch (status) {
    case "completed":
      return { backgroundColor: "#ecfdf5", color: "#047857" };
    case "processing":
      return { backgroundColor: "#e0f2fe", color: "#075985" };
    case "failed":
      return { backgroundColor: "#fff1f2", color: "#be123c" };
    case "pending":
      return { backgroundColor: "#fffbeb", color: "#b45309" };
    default:
      return { backgroundColor: "#f8fafc", color: "#475569" };
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
export const TransactionDetailDrawer: React.FC<
  TransactionDetailDrawerProps
> = ({
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
  dot: dotProp,
}) => {
  const statusStyle = transaction && STATUS_STYLES[transaction.status];

  const sectionStyle: React.CSSProperties = {
    borderRadius: "1rem",
    border: "1px solid var(--color-border, #f1f5f9)",
    backgroundColor: "var(--color-card, rgba(255,255,255,0.4))",
    padding: "1rem",
  };

  return (
    <Drawer isOpen={open} onClose={onClose} dot={dotProp}>
      <DrawerHeader onClose={onClose}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#94a3b8",
            }}
          >
            <span>거래 상세</span>
            {transaction?.reference && (
              <span
                style={{
                  borderRadius: "9999px",
                  backgroundColor: "#f1f5f9",
                  padding: "0.125rem 0.5rem",
                  color: "#64748b",
                }}
              >
                {transaction.reference}
              </span>
            )}
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <p
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--color-foreground, #0f172a)",
              }}
            >
              {transaction?.id ?? "—"}
            </p>
            {statusStyle && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontWeight: 500,
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  ...statusStyle.badgeStyle,
                }}
              >
                {statusStyle.label}
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
            {transaction?.merchant ?? "가맹점 정보 없음"} ·{" "}
            {transaction?.method ?? "결제수단 미지정"}
          </p>
        </div>
      </DrawerHeader>

      <DrawerContent
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                style={{
                  height: "5rem",
                  borderRadius: "1rem",
                  border: "1px solid var(--color-border, #f1f5f9)",
                  animation: "pulse 2s infinite",
                  backgroundColor: "var(--color-muted, rgba(248,250,252,0.6))",
                }}
              />
            ))}
          </div>
        ) : (
          <>
            <section
              style={{
                ...sectionStyle,
                display: "grid",
                gap: "1rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
              aria-label="거래 요약 정보"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                  }}
                >
                  거래 금액
                </p>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: "var(--color-foreground, #0f172a)",
                  }}
                >
                  {formatAmount(
                    transaction?.amount,
                    transaction?.currency ?? defaultCurrency,
                    locale,
                  )}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  생성{" "}
                  <time
                    dateTime={
                      transaction?.createdAt instanceof Date
                        ? transaction.createdAt.toISOString()
                        : typeof transaction?.createdAt === "string"
                          ? transaction.createdAt
                          : undefined
                    }
                  >
                    {formatDate(transaction?.createdAt, locale)}
                  </time>
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                  }}
                >
                  요약
                </p>
                {summary ?? (
                  <p style={{ fontSize: "0.875rem", color: "#475569" }}>
                    {transaction?.customer ?? "고객 정보 없음"} /{" "}
                    {transaction?.method ?? "결제수단 미지정"}
                  </p>
                )}
              </div>
            </section>

            {metadata.length > 0 && (
              <section
                style={sectionStyle}
                aria-label="거래 세부 정보"
                role="region"
              >
                <h3
                  style={{
                    marginBottom: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-foreground, #0f172a)",
                  }}
                >
                  세부 정보
                </h3>
                <dl
                  style={{
                    display: "grid",
                    gap: "1rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  }}
                >
                  {metadata.map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      {item.icon && (
                        <span
                          style={{
                            borderRadius: "0.5rem",
                            backgroundColor: "var(--color-muted, #f1f5f9)",
                            padding: "0.5rem",
                            color: "#64748b",
                          }}
                          aria-hidden="true"
                        >
                          <Icon name={item.icon} dot="w-4 h-4" />
                        </span>
                      )}
                      <div>
                        <dt
                          style={{
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            color: "#94a3b8",
                          }}
                        >
                          {item.label}
                        </dt>
                        <dd style={{ fontSize: "0.875rem", color: "#334155" }}>
                          {item.value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {settlement && (
              <section
                style={sectionStyle}
                aria-label="정산 정보"
                role="region"
              >
                <div
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--color-foreground, #0f172a)",
                      }}
                    >
                      정산 정보
                    </h3>
                    {settlement.note && (
                      <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {settlement.note}
                      </p>
                    )}
                  </div>
                  {settlement.status && (
                    <span
                      style={{
                        borderRadius: "9999px",
                        padding: "0.25rem 0.75rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        ...getSettlementBadgeStyle(settlement.status),
                      }}
                      aria-label={`정산 상태: ${settlement.status}`}
                    >
                      {settlement.status}
                    </span>
                  )}
                </div>
                <dl
                  style={{
                    display: "grid",
                    gap: "1rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  }}
                >
                  <div>
                    <dt
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                      }}
                    >
                      정산 금액
                    </dt>
                    <dd style={{ fontSize: "0.875rem", color: "#334155" }}>
                      {formatAmount(
                        settlement.amount,
                        settlement.currency ?? defaultCurrency,
                        locale,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                      }}
                    >
                      예정일
                    </dt>
                    <dd style={{ fontSize: "0.875rem", color: "#334155" }}>
                      {settlement.scheduledDate && (
                        <time
                          dateTime={
                            settlement.scheduledDate instanceof Date
                              ? settlement.scheduledDate.toISOString()
                              : typeof settlement.scheduledDate === "string"
                                ? settlement.scheduledDate
                                : undefined
                          }
                        >
                          {formatDate(settlement.scheduledDate, locale)}
                        </time>
                      )}
                    </dd>
                  </div>
                  {settlement.bankAccount && (
                    <div>
                      <dt
                        style={{
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          color: "#94a3b8",
                        }}
                      >
                        계좌
                      </dt>
                      <dd style={{ fontSize: "0.875rem", color: "#334155" }}>
                        {settlement.bankAccount}
                      </dd>
                    </div>
                  )}
                  {settlement.expectedPayout && (
                    <div>
                      <dt
                        style={{
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          color: "#94a3b8",
                        }}
                      >
                        예상 지급
                      </dt>
                      <dd style={{ fontSize: "0.875rem", color: "#334155" }}>
                        {settlement.expectedPayout}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {fees.length > 0 && (
              <section
                style={sectionStyle}
                aria-label="수수료 내역"
                role="region"
              >
                <h3
                  style={{
                    marginBottom: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-foreground, #0f172a)",
                  }}
                >
                  수수료
                </h3>
                <dl
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {fees.map((fee) => (
                    <div
                      key={fee.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.875rem",
                        color: "#334155",
                      }}
                    >
                      <div>
                        <dt style={{ fontWeight: 500 }}>{fee.label}</dt>
                        {fee.description && (
                          <dd style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            {fee.description}
                          </dd>
                        )}
                      </div>
                      <dd>
                        {formatAmount(
                          fee.amount,
                          fee.currency ?? defaultCurrency,
                          locale,
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section
              style={sectionStyle}
              aria-label="이벤트 로그"
              role="region"
            >
              <h3
                style={{
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-foreground, #0f172a)",
                }}
              >
                이벤트 로그
              </h3>
              {events.length === 0 ? (
                (emptyState ?? (
                  <DashboardEmptyState
                    icon="activity"
                    title="이벤트가 없습니다"
                    description="승인/정산 등 상태 변화가 발생하면 자동으로 표시됩니다."
                    size="sm"
                  />
                ))
              ) : (
                <ol
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                  role="list"
                  aria-label="이벤트 목록"
                >
                  {events.map((event) => (
                    <li
                      key={event.id}
                      role="listitem"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        borderRadius: "0.75rem",
                        border: "1px solid var(--color-border, #f1f5f9)",
                        padding: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          borderRadius: "0.5rem",
                          padding: "0.5rem",
                          ...getEventStyle(event.status),
                        }}
                        aria-hidden="true"
                      >
                        <Icon name={event.icon ?? "activity"} dot="w-4 h-4" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "var(--color-foreground, #0f172a)",
                          }}
                        >
                          <span>{event.title}</span>
                          <time
                            dateTime={
                              event.timestamp instanceof Date
                                ? event.timestamp.toISOString()
                                : typeof event.timestamp === "string"
                                  ? event.timestamp
                                  : undefined
                            }
                            style={{ fontSize: "0.75rem", color: "#94a3b8" }}
                          >
                            {formatDate(event.timestamp, locale)}
                          </time>
                        </div>
                        {event.description && (
                          <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {event.description}
                          </p>
                        )}
                        {event.actor && (
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#94a3b8",
                              marginTop: "0.25rem",
                            }}
                            aria-label={`실행자: ${event.actor}`}
                          >
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
