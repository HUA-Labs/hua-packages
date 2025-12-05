"use client";

import React from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import type { IconName } from '../lib/icons';
import { merge } from '../lib/utils';

/**
 * 액션 버튼 정의
 */
export interface ActionButton {
  label: string;
  labelMobile?: string; // 모바일에서 표시할 짧은 텍스트
  icon?: IconName;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  badge?: {
    count: number;
    color?: 'blue' | 'red' | 'gray' | 'green';
  };
  className?: string;
}

/**
 * ActionToolbar Props
 */
export interface ActionToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 선택 모드 활성화 여부 */
  isSelectMode?: boolean;
  /** 전체 항목 개수 */
  totalCount?: number;
  /** 선택된 항목 개수 */
  selectedCount?: number;
  /** 일반 모드 액션 버튼들 */
  actions?: ActionButton[];
  /** 선택 모드 액션 버튼들 */
  selectModeActions?: ActionButton[];
  /** 선택 모드 토글 함수 */
  onToggleSelectMode?: () => void;
  /** 전체 선택/해제 함수 */
  onToggleSelectAll?: () => void;
  /** 선택 모드 취소 함수 */
  onCancelSelect?: () => void;
  /** 로딩 상태 */
  loading?: boolean;
}

/**
 * 범용 액션 툴바 컴포넌트
 * 
 * 알림, 로그 관리, 대시보드 등에서 재사용 가능한 액션 버튼 영역
 * 선택 모드, 일괄 액션, 반응형 레이아웃 지원
 * 
 * @example
 * ```tsx
 * <ActionToolbar
 *   isSelectMode={isSelectMode}
 *   totalCount={notifications.length}
 *   selectedCount={selectedIds.size}
 *   actions={[
 *     {
 *       label: "모두 읽음",
 *       labelMobile: "읽음",
 *       icon: "check",
 *       onClick: handleMarkAllAsRead,
 *       disabled: unreadCount === 0,
 *       badge: { count: unreadCount, color: 'blue' }
 *     }
 *   ]}
 *   selectModeActions={[
 *     {
 *       label: "선택 삭제",
 *       labelMobile: "삭제",
 *       icon: "delete",
 *       onClick: handleDeleteSelected,
 *       disabled: selectedIds.size === 0,
 *       badge: { count: selectedIds.size, color: 'red' }
 *     }
 *   ]}
 *   onToggleSelectMode={() => setIsSelectMode(true)}
 *   onToggleSelectAll={handleToggleSelectAll}
 *   onCancelSelect={() => {
 *     setIsSelectMode(false);
 *     setSelectedIds(new Set());
 *   }}
 * />
 * ```
 */
export const ActionToolbar = React.forwardRef<HTMLDivElement, ActionToolbarProps>(
  (
    {
      isSelectMode = false,
      totalCount = 0,
      selectedCount = 0,
      actions = [],
      selectModeActions = [],
      onToggleSelectMode,
      onToggleSelectAll,
      onCancelSelect,
      loading = false,
      className,
      ...props
    },
    ref
  ) => {
    const getBadgeColor = (color?: string) => {
      switch (color) {
        case 'red':
          return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
        case 'blue':
          return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
        case 'green':
          return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
        case 'gray':
        default:
          return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      }
    };

    const renderButton = (action: ActionButton, key: string) => (
      <Button
        key={key}
        variant={action.variant || 'outline'}
        size="sm"
        onClick={action.onClick}
        disabled={action.disabled || loading}
        className={merge('flex-1 sm:flex-initial', action.className)}
      >
        {action.icon && <Icon name={action.icon} className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />}
        <span className="hidden sm:inline">{action.label}</span>
        <span className="sm:hidden">{action.labelMobile || action.label}</span>
        {action.badge && action.badge.count > 0 && (
          <span className={merge('ml-1.5', getBadgeColor(action.badge.color), 'px-1.5 py-0.5 rounded-full text-xs font-semibold')}>
            {action.badge.count}
          </span>
        )}
      </Button>
    );

    return (
      <div
        ref={ref}
        className={merge(
          'mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4',
          className
        )}
        {...props}
      >
        {isSelectMode ? (
          <div className="flex flex-wrap items-center gap-2">
            {/* 전체 선택/해제 버튼 */}
            {onToggleSelectAll && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleSelectAll}
                className="flex-1 sm:flex-initial min-w-[100px]"
              >
                <Icon name={selectedCount === totalCount ? "square" : "check"} className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">{selectedCount === totalCount ? '전체 해제' : '전체 선택'}</span>
                <span className="sm:hidden">{selectedCount === totalCount ? '해제' : '전체'}</span>
              </Button>
            )}
            
            {/* 선택 모드 액션 버튼들 */}
            {selectModeActions.map((action, index) => (
              <div key={`select-action-${index}`} className={merge('flex-1 sm:flex-initial min-w-[100px]', action.className)}>
                {renderButton(action, `select-${index}`)}
              </div>
            ))}
            
            {/* 취소 버튼 */}
            {onCancelSelect && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelSelect}
                className="flex-1 sm:flex-initial min-w-[80px]"
              >
                취소
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {/* 선택 모드 진입 버튼 */}
            {onToggleSelectMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleSelectMode}
                disabled={totalCount === 0}
                className="flex-1 sm:flex-initial min-w-[80px] sm:min-w-[auto] px-2 sm:px-3"
                title={totalCount === 0 ? "항목이 없습니다" : "여러 항목 선택"}
              >
                <Icon name="check" className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline ml-1.5 sm:ml-2">선택</span>
              </Button>
            )}
            
            {/* 일반 모드 액션 버튼들 */}
            {actions.map((action, index) => (
              <div key={`action-${index}`} className={merge('flex-1 sm:flex-initial min-w-[100px]', action.className)}>
                {renderButton(action, `action-${index}`)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ActionToolbar.displayName = 'ActionToolbar';

