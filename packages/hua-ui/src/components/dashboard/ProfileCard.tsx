"use client";

import React, { useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { Icon } from "../Icon";

/**
 * 멤버십 등급 인터페이스
 * @typedef {Object} MembershipTier
 * @property {"basic" | "pro" | "premium" | "admin"} tier - 등급
 * @property {string} label - 등급 라벨
 */
export interface MembershipTier {
  tier: "basic" | "pro" | "premium" | "admin";
  label: string;
}

/**
 * ProfileCard 컴포넌트의 props / ProfileCard component props
 * @typedef {Object} ProfileCardProps
 * @property {string} name - 사용자 이름 / User name
 * @property {string} [email] - 이메일 / Email
 * @property {string} [avatar] - 아바타 이미지 URL / Avatar image URL
 * @property {string} [avatarAlt] - 아바타 대체 텍스트 / Avatar alt text
 * @property {string} [greeting] - 인사말 / Greeting
 * @property {Date | string} [memberSince] - 가입일 / Member since date
 * @property {MembershipTier["tier"]} [membershipTier] - 멤버십 등급 / Membership tier
 * @property {string} [membershipLabel] - 멤버십 라벨 / Membership label
 * @property {() => void} [onSettingsClick] - 설정 클릭 핸들러 / Settings click handler
 * @property {string} [settingsHref] - 설정 링크 URL / Settings link URL
 * @property {"default" | "gradient" | "minimal"} [variant="default"] - 스타일 변형 / Style variant
 * @property {boolean} [showAvatar=true] - 아바타 표시 여부 / Show avatar
 * @property {boolean} [showMembership=true] - 멤버십 표시 여부 / Show membership
 * @property {boolean} [showSettings=true] - 설정 버튼 표시 여부 / Show settings button
 * @property {string} [dot] - dot 스타일 유틸리티 문자열 / Dot style utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 */
export interface ProfileCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  name: string;
  email?: string;
  avatar?: string;
  avatarAlt?: string;
  greeting?: string;
  memberSince?: Date | string;
  membershipTier?: MembershipTier["tier"];
  membershipLabel?: string;
  onSettingsClick?: () => void;
  settingsHref?: string;
  variant?: "default" | "gradient" | "minimal";
  showAvatar?: boolean;
  showMembership?: boolean;
  showSettings?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

// ── Tier badge gradient styles (hardcoded — no CSS var equivalent) ────────────

const TIER_BADGE_STYLES: Record<MembershipTier["tier"], React.CSSProperties> = {
  basic: {
    background: "linear-gradient(to right, rgb(99,102,241), rgb(6,182,212))",
    color: "white",
  },
  pro: {
    background: "linear-gradient(to right, rgb(168,85,247), rgb(236,72,153))",
    color: "white",
  },
  premium: {
    background: "linear-gradient(to right, rgb(250,204,21), rgb(249,115,22))",
    color: "white",
  },
  admin: {
    background: "linear-gradient(to right, rgb(239,68,68), rgb(236,72,153))",
    color: "white",
  },
};

const tierLabels: Record<MembershipTier["tier"], string> = {
  basic: "Basic",
  pro: "Pro",
  premium: "Premium",
  admin: "Admin",
};

// ── Static style constants ────────────────────────────────────────────────────

const CONTAINER_BASE: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  ...resolveDot("p-6"),
};

const VARIANT_STYLES: Record<
  "default" | "gradient" | "minimal",
  React.CSSProperties
> = {
  default: {
    backgroundColor: "var(--profile-card-bg)",
    borderRadius: "1rem",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    border: "1px solid var(--profile-card-border)",
  },
  gradient: {
    background: "var(--profile-card-gradient-bg)",
    borderRadius: "1rem",
    boxShadow:
      "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
    border: "1px solid var(--profile-card-gradient-border)",
  },
  minimal: {
    background: "transparent",
  },
};

// Gradient overlay decorations (gradient variant only)
const GRADIENT_OVERLAY_1: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to bottom right, rgb(99,102,241), rgb(168,85,247), rgb(236,72,153))",
  opacity: "var(--profile-card-overlay-opacity, 0.10)",
  pointerEvents: "none",
};

const GRADIENT_OVERLAY_2: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top right, rgb(34,211,238), rgb(99,102,241), rgb(147,51,234))",
  opacity: "var(--profile-card-overlay2-opacity, 0.05)",
  pointerEvents: "none",
};

const INNER_ROW: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "flex-start",
  ...resolveDot("gap-6"),
};

const SETTINGS_ABS: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
};

const SETTINGS_BTN_BASE: React.CSSProperties = {
  ...resolveDot("p-2"),
  color: "var(--profile-card-settings-color)",
  background: "none",
  border: "none",
  cursor: "pointer",
  transition: "color 150ms ease",
  display: "inline-flex",
  alignItems: "center",
};

const AVATAR_WRAP: React.CSSProperties = {
  position: "relative",
  flexShrink: 0,
};

const AVATAR_IMG: React.CSSProperties = {
  width: "5rem",
  height: "5rem",
  borderRadius: "9999px",
  border: "4px solid var(--profile-card-avatar-border)",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  objectFit: "cover",
};

const AVATAR_FALLBACK: React.CSSProperties = {
  width: "5rem",
  height: "5rem",
  borderRadius: "9999px",
  background:
    "linear-gradient(to bottom right, rgb(99,102,241), rgb(147,51,234))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "4px solid var(--profile-card-avatar-border)",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
};

const AVATAR_INITIAL: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "white",
};

const INFO_WRAP: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const GREETING_WRAP: React.CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  ...resolveDot("mb-2"),
};

const GREETING_GRADIENT_SPAN: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  background: "linear-gradient(to right, rgb(99,102,241), rgb(168,85,247))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const GREETING_PLAIN_SPAN: React.CSSProperties = {
  color: "var(--profile-card-name-color)",
};

const NAME_ROW: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  ...resolveDot("gap-2 mb-2"),
};

const NAME_TEXT: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "var(--profile-card-name-color)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const TIER_BADGE_BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  ...resolveDot("py-1 px-3 rounded-full"),
  fontSize: "0.75rem",
  fontWeight: 600,
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
};

const TIER_ICON: React.CSSProperties = {
  ...resolveDot("w-3 h-3 mr-1"),
};

const EMAIL_STYLE: React.CSSProperties = {
  color: "var(--profile-card-email-color)",
  fontSize: "0.875rem",
  ...resolveDot("mb-1"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const SINCE_ROW: React.CSSProperties = {
  color: "var(--profile-card-since-color)",
  fontSize: "0.75rem",
  display: "flex",
  alignItems: "center",
  ...resolveDot("gap-1"),
};

/**
 * ProfileCard 컴포넌트
 *
 * 사용자 프로필 정보를 표시하는 카드 컴포넌트입니다.
 * 아바타, 이름, 이메일, 멤버십 등급 등을 표시할 수 있습니다.
 *
 * Card component that displays user profile information.
 * Can show avatar, name, email, membership tier, and more.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ProfileCard
 *   name="홍길동"
 *   email="hong@example.com"
 *   avatar="/avatar.jpg"
 *   membershipTier="premium"
 *   memberSince={new Date("2024-01-01")}
 * />
 *
 * @example
 * // 그라디언트 스타일 / Gradient style
 * <ProfileCard
 *   name="김철수"
 *   greeting="안녕하세요"
 *   variant="gradient"
 *   membershipTier="pro"
 *   onSettingsClick={() => navigate("/settings")}
 * />
 *
 * @param {ProfileCardProps} props - ProfileCard 컴포넌트의 props / ProfileCard component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ProfileCard 컴포넌트 / ProfileCard component
 */
export const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
  (
    {
      name,
      email,
      avatar,
      avatarAlt,
      greeting,
      memberSince,
      membershipTier,
      membershipLabel,
      onSettingsClick,
      settingsHref,
      variant = "default",
      showAvatar = true,
      showMembership = true,
      showSettings = true,
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    const formatDate = (date: Date | string): string => {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const tier = membershipTier || "basic";
    const tierBadgeStyle = TIER_BADGE_STYLES[tier];
    const tierLabel = membershipLabel || tierLabels[tier];

    const containerStyle = useMemo(
      () =>
        mergeStyles(
          CONTAINER_BASE,
          VARIANT_STYLES[variant],
          resolveDot(dotProp),
          style,
        ),
      [variant, dotProp, style],
    );

    return (
      <div ref={ref} style={containerStyle} {...props}>
        {/* 그라데이션 배경 장식 (gradient variant일 때) */}
        {variant === "gradient" && (
          <>
            <div style={GRADIENT_OVERLAY_1} />
            <div style={GRADIENT_OVERLAY_2} />
          </>
        )}

        <div style={INNER_ROW}>
          {/* 설정 아이콘 */}
          {showSettings && (onSettingsClick || settingsHref) && (
            <div style={SETTINGS_ABS}>
              {settingsHref ? (
                <a href={settingsHref} style={SETTINGS_BTN_BASE} title="설정">
                  <Icon name="settings" dot="w-6 h-6" />
                </a>
              ) : (
                <button
                  onClick={onSettingsClick}
                  style={SETTINGS_BTN_BASE}
                  title="설정"
                >
                  <Icon name="settings" dot="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {/* 아바타 */}
          {showAvatar && (
            <div style={AVATAR_WRAP}>
              {avatar ? (
                <img src={avatar} alt={avatarAlt || name} style={AVATAR_IMG} />
              ) : (
                <div style={AVATAR_FALLBACK}>
                  <span style={AVATAR_INITIAL}>
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 정보 */}
          <div style={INFO_WRAP}>
            {/* 인사말 */}
            {greeting && (
              <div style={GREETING_WRAP}>
                {greeting.split(" ").map((part, index) => {
                  const isEmoji =
                    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
                      part,
                    );
                  return (
                    <span key={index}>
                      {isEmoji ? (
                        <span style={GREETING_PLAIN_SPAN}>{part}</span>
                      ) : (
                        <span style={GREETING_GRADIENT_SPAN}>{part}</span>
                      )}
                      {index < greeting.split(" ").length - 1 && " "}
                    </span>
                  );
                })}
              </div>
            )}

            {/* 이름과 멤버십 뱃지 */}
            <div style={NAME_ROW}>
              <span style={NAME_TEXT}>{name}!</span>
              {showMembership && membershipTier && (
                <span style={mergeStyles(TIER_BADGE_BASE, tierBadgeStyle)}>
                  <svg
                    style={TIER_ICON}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {tier === "premium" ? (
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    ) : tier === "admin" ? (
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  {tierLabel}
                </span>
              )}
            </div>

            {/* 이메일 */}
            {email && <div style={EMAIL_STYLE}>{email}</div>}

            {/* 가입일 */}
            {memberSince && (
              <div style={SINCE_ROW}>
                <Icon name="clock" dot="w-3 h-3" />
                가입일 {formatDate(memberSince)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

ProfileCard.displayName = "ProfileCard";
