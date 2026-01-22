/**
 * HUA UI Modal 관련 타입 정의
 * Modal, Drawer, BottomSheet 등 오버레이 컴포넌트에서 사용하는 표준 타입들을 정의합니다.
 */

import type { ReactNode } from "react";

/**
 * 기본 Modal Props 인터페이스
 * Modal, Drawer, BottomSheet 등 모든 오버레이 컴포넌트에서 사용
 */
export interface BaseModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 모달 제목 */
  title?: string;
  /** 모달 부제목/설명 */
  description?: string;
  /** 자식 요소 */
  children?: ReactNode;
}

/**
 * Modal 닫기 관련 Props
 */
export interface ModalCloseProps {
  /** 닫기 버튼 표시 여부 */
  closable?: boolean;
  /**
   * @deprecated use closable instead
   * 닫기 버튼 표시 여부 (deprecated)
   */
  showCloseButton?: boolean;
  /** 오버레이 클릭 시 닫기 */
  closeOnOverlayClick?: boolean;
  /** ESC 키로 닫기 */
  closeOnEscape?: boolean;
}

/**
 * Modal 레이아웃 Props
 */
export interface ModalLayoutProps {
  /** 모달 크기 */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** 중앙 정렬 여부 */
  centered?: boolean;
  /** 스크롤 동작 */
  scrollBehavior?: "inside" | "outside";
}

/**
 * 완전한 Modal Props
 */
export interface ModalProps extends BaseModalProps, ModalCloseProps, ModalLayoutProps {
  /** 헤더 표시 여부 */
  showHeader?: boolean;
  /** 푸터 표시 여부 */
  showFooter?: boolean;
  /** 커스텀 푸터 */
  footer?: ReactNode;
  /** 오버레이 배경 블러 */
  blur?: boolean;
}

/**
 * Drawer 위치 타입
 */
export type DrawerPlacement = "left" | "right" | "top" | "bottom";

/**
 * Drawer Props
 */
export interface DrawerProps extends BaseModalProps, ModalCloseProps {
  /** Drawer 위치 */
  placement?: DrawerPlacement;
  /** Drawer 크기 (너비 또는 높이) */
  size?: "sm" | "md" | "lg" | "xl" | "full" | string;
}

/**
 * BottomSheet 높이 타입
 */
export type BottomSheetHeight = "sm" | "md" | "lg" | "full" | "auto";

/**
 * BottomSheet Props
 */
export interface BottomSheetProps extends BaseModalProps, ModalCloseProps {
  /** BottomSheet 높이 */
  height?: BottomSheetHeight;
  /** 드래그 핸들 표시 */
  showHandle?: boolean;
  /** 드래그로 닫기 가능 */
  draggable?: boolean;
  /** 스냅 포인트 */
  snapPoints?: number[];
}

/**
 * ConfirmModal 액션 Props
 */
export interface ConfirmModalProps extends BaseModalProps, ModalCloseProps {
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 확인 핸들러 */
  onConfirm?: () => void;
  /** 취소 핸들러 */
  onCancel?: () => void;
  /** 확인 버튼 variant */
  confirmVariant?: "default" | "destructive" | "outline";
  /** 로딩 상태 */
  loading?: boolean;
  /** 위험 액션 여부 */
  danger?: boolean;
}

/**
 * AlertDialog Props
 */
export interface AlertDialogProps extends ConfirmModalProps {
  /** 아이콘 */
  icon?: ReactNode;
  /** 알림 타입 */
  type?: "info" | "warning" | "error" | "success";
}
