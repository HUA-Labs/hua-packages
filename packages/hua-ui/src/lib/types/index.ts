/**
 * 공통 타입 re-export
 * 모든 타입을 한 곳에서 import할 수 있도록 합니다.
 */

// Common types
export type {
  Color,
  Size,
  BaseVariant,
  ExtendedVariant,
  CardVariant,
  ButtonVariant,
  BadgeVariant,
  BaseComponentProps,
  ColorProps,
  SizeProps,
  VariantProps,
  ColorVariantProps,
  LoadingProps,
  IconProps,
  Rounded,
  Shadow,
  Padding,
  StateProps,
  FormStateProps,
  LayoutProps,
  FullWidthProps,
} from "./common";

// Form types
export type {
  BaseFormProps,
  FormValidationProps,
  LabelProps,
  InputProps,
  SelectOption,
  SelectProps,
  CheckableProps,
  TextareaProps,
} from "./form";

// Modal types
export type {
  BaseModalProps,
  ModalCloseProps,
  ModalLayoutProps,
  ModalProps,
  DrawerPlacement,
  DrawerProps,
  BottomSheetHeight,
  BottomSheetProps,
  ConfirmModalProps,
  AlertDialogProps,
} from "./modal";

// Dashboard types
export type {
  TrendDirection,
  TrendInfo,
  BaseDashboardCardProps,
  StatCardProps,
  MetricCardProps,
  ProgressCardProps,
  ActivityItem,
  ActivityFeedProps,
  ChartDataPoint,
  BaseChartProps,
  BarChartProps,
  LineChartProps,
  PieChartProps,
  DashboardSidebarProps,
} from "./dashboard";

