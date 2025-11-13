"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

export interface MembershipTier {
  tier: "basic" | "pro" | "premium" | "admin";
  label: string;
}

export interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
}

const tierStyles = {
  basic: {
    badge: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    icon: "text-blue-600 dark:text-blue-400",
  },
  pro: {
    badge: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    icon: "text-purple-600 dark:text-purple-400",
  },
  premium: {
    badge: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  admin: {
    badge: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
    icon: "text-red-600 dark:text-red-400",
  },
};

const tierLabels = {
  basic: "Basic",
  pro: "Pro",
  premium: "Premium",
  admin: "Admin",
};

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
      className,
      ...props
    },
    ref
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
    const tierStyle = tierStyles[tier];
    const tierLabel = membershipLabel || tierLabels[tier];

    const variantClasses = {
      default: "bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700",
      gradient: "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20",
      minimal: "bg-transparent",
    };

    return (
      <div
        ref={ref}
        className={merge(
          "relative overflow-hidden p-6",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {/* 그라데이션 배경 장식 (gradient variant일 때) */}
        {variant === "gradient" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-10 dark:opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 opacity-5 dark:opacity-15"></div>
          </>
        )}

        <div className="relative flex items-start gap-6">
          {/* 설정 아이콘 */}
          {showSettings && (onSettingsClick || settingsHref) && (
            <div className="absolute top-0 right-0">
              {settingsHref ? (
                <a
                  href={settingsHref}
                  className="p-2 text-gray-400 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="설정"
                >
                  <Icon name="settings" className="w-6 h-6" />
                </a>
              ) : (
                <button
                  onClick={onSettingsClick}
                  className="p-2 text-gray-400 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="설정"
                >
                  <Icon name="settings" className="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {/* 아바타 */}
          {showAvatar && (
            <div className="relative flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={avatarAlt || name}
                  className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 정보 */}
          <div className="flex-1 min-w-0">
            {/* 인사말 */}
            {greeting && (
              <div className="text-lg sm:text-xl font-semibold mb-2">
                {greeting.split(" ").map((part, index) => {
                  const isEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(part);
                  return (
                    <span key={index}>
                      {isEmoji ? (
                        <span className="text-gray-900 dark:text-white">{part}</span>
                      ) : (
                        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          {part}
                        </span>
                      )}
                      {index < greeting.split(" ").length - 1 && " "}
                    </span>
                  );
                })}
              </div>
            )}

            {/* 이름과 멤버십 뱃지 */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {name}!
              </span>
              {showMembership && membershipTier && (
                <span
                  className={merge(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-lg",
                    tierStyle.badge
                  )}
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    {tier === "premium" ? (
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    ) : tier === "admin" ? (
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    )}
                  </svg>
                  {tierLabel}
                </span>
              )}
            </div>

            {/* 이메일 */}
            {email && (
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1 truncate">
                {email}
              </div>
            )}

            {/* 가입일 */}
            {memberSince && (
              <div className="text-gray-400 text-xs flex items-center gap-1">
                <Icon name="clock" className="w-3 h-3" />
                가입일 {formatDate(memberSince)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProfileCard.displayName = "ProfileCard";

