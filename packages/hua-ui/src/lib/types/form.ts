/**
 * HUA UI Form 관련 타입 정의
 * Form 컴포넌트들에서 사용하는 표준 타입들을 정의합니다.
 */

import type { ReactNode } from "react";

/**
 * 기본 Form Props 인터페이스
 * Input, Select, Checkbox 등 모든 폼 요소에서 사용
 * @template T - 값의 타입
 */
export interface BaseFormProps<T = string> {
  /** 현재 값 (제어 컴포넌트) */
  value?: T;
  /** 초기 값 (비제어 컴포넌트) */
  defaultValue?: T;
  /** 값 변경 핸들러 */
  onChange?: (value: T) => void;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 읽기 전용 상태 */
  readOnly?: boolean;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 폼 필드 이름 */
  name?: string;
  /** 폼 필드 ID */
  id?: string;
}

/**
 * 폼 검증 상태 Props
 */
export interface FormValidationProps {
  /** 에러 상태 */
  error?: boolean;
  /** 성공 상태 */
  success?: boolean;
  /** 에러 메시지 */
  errorMessage?: string;
  /** 도움말 텍스트 */
  helperText?: string;
}

/**
 * 레이블 Props
 */
export interface LabelProps {
  /** 레이블 텍스트 */
  label?: string;
  /** 레이블 위치 */
  labelPosition?: "top" | "left" | "right";
  /** 필수 표시 여부 */
  showRequired?: boolean;
}

/**
 * Input 컴포넌트용 Props
 */
export interface InputProps extends BaseFormProps<string>, FormValidationProps, LabelProps {
  /** 입력 타입 */
  type?: "text" | "password" | "email" | "number" | "tel" | "url" | "search";
  /** 플레이스홀더 */
  placeholder?: string;
  /** 자동 완성 */
  autoComplete?: string;
  /** 자동 포커스 */
  autoFocus?: boolean;
  /** 최대 길이 */
  maxLength?: number;
  /** 최소 길이 */
  minLength?: number;
  /** 왼쪽 아이콘/요소 */
  leftElement?: ReactNode;
  /** 오른쪽 아이콘/요소 */
  rightElement?: ReactNode;
}

/**
 * Select 컴포넌트용 옵션 타입
 */
export interface SelectOption<T = string> {
  /** 옵션 값 */
  value: T;
  /** 표시 레이블 */
  label: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * Select 컴포넌트용 Props
 */
export interface SelectProps<T = string> extends BaseFormProps<T>, FormValidationProps, LabelProps {
  /** 옵션 목록 */
  options: SelectOption<T>[];
  /** 플레이스홀더 */
  placeholder?: string;
  /** 검색 가능 여부 */
  searchable?: boolean;
  /** 지우기 가능 여부 */
  clearable?: boolean;
  /** 다중 선택 여부 */
  multiple?: boolean;
}

/**
 * Checkbox/Radio 공통 Props
 */
export interface CheckableProps extends BaseFormProps<boolean> {
  /** 체크 상태 */
  checked?: boolean;
  /** 초기 체크 상태 */
  defaultChecked?: boolean;
  /** 체크 변경 핸들러 */
  onCheckedChange?: (checked: boolean) => void;
  /** 레이블 */
  label?: string;
  /** 설명 */
  description?: string;
}

/**
 * Textarea 컴포넌트용 Props
 */
export interface TextareaProps extends BaseFormProps<string>, FormValidationProps, LabelProps {
  /** 플레이스홀더 */
  placeholder?: string;
  /** 행 수 */
  rows?: number;
  /** 최대 길이 */
  maxLength?: number;
  /** 자동 크기 조절 */
  autoResize?: boolean;
  /** 리사이즈 가능 여부 */
  resize?: "none" | "vertical" | "horizontal" | "both";
}
