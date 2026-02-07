/**
 * Overlay Components Entrypoint
 *
 * 오버레이/팝업 관련 컴포넌트들의 엔트리 포인트입니다.
 * 모달, 팝오버, 드롭다운, 드로어, 바텀시트 등 합성 컴포넌트를 포함합니다.
 *
 * Entry point for overlay/popup components.
 * Includes composite components like Modal, Popover, Dropdown, Drawer, BottomSheet.
 *
 * @example
 * import { Popover, PopoverTrigger, PopoverContent } from '@hua-labs/ui/overlay';
 * import { Dropdown, DropdownItem } from '@hua-labs/ui/overlay';
 */

// Modal
export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';
export { ConfirmModal } from './components/ConfirmModal';

// Popover
export { Popover, PopoverTrigger, PopoverContent } from './components/Popover';

// Dropdown
export { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, DropdownMenu, DropdownGroup } from './components/Dropdown';

// Drawer
export { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from './components/Drawer';

// BottomSheet
export { BottomSheet, BottomSheetHeader, BottomSheetContent } from './components/BottomSheet';
