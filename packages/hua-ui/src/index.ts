// UI Components - Core
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';
export { Action } from './components/Action';
export { Input } from './components/Input';
export { Link } from './components/Link';
export { Icon, EmotionIcon, StatusIcon, LoadingIcon, SuccessIcon, ErrorIcon } from './components/Icon';
export type { IconProps } from './components/Icon';
export { Avatar, AvatarImage, AvatarFallback } from './components/Avatar';
export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';

// UI Components - Layout
export { Container } from './components/Container';
export { Grid } from './components/Grid';
export { Stack } from './components/Stack';
export { Divider } from './components/Divider';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/Card';
export { Panel } from './components/Panel';
export { ActionToolbar } from './components/ActionToolbar';
export type { ActionToolbarProps, ActionButton } from './components/ActionToolbar';
export { ComponentLayout } from './components/ComponentLayout';

// ❌ Dashboard components moved to @hua-labs/ui/advanced
// Import from '@hua-labs/ui/advanced' or '@hua-labs/ui/advanced/dashboard' instead

// UI Components - Navigation
export { Navigation, NavigationList, NavigationItem, NavigationContent } from './components/Navigation';
export { Breadcrumb, BreadcrumbItem } from './components/Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItemProps, BreadcrumbItemData } from './components/Breadcrumb';
export { Pagination, PaginationOutlined, PaginationMinimal, PaginationWithInfo } from './components/Pagination';
export { PageNavigation } from './components/PageNavigation';
export { PageTransition } from './components/PageTransition';

// UI Components - Data Display
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './components/Table';
export { Badge } from './components/Badge';
export { Progress, ProgressSuccess, ProgressWarning, ProgressError, ProgressInfo, ProgressGroup } from './components/Progress';
export { Skeleton, SkeletonText, SkeletonCircle, SkeletonRectangle, SkeletonRounded, SkeletonCard, SkeletonAvatar, SkeletonImage, SkeletonUserProfile, SkeletonList, SkeletonTable } from './components/Skeleton';

// UI Components - Feedback
export { Alert, AlertSuccess, AlertWarning, AlertError, AlertInfo } from './components/Alert';
export { ToastProvider, useToast } from './components/Toast';
export type { Toast } from './components/Toast';
export { LoadingSpinner } from './components/LoadingSpinner';
export { Tooltip, TooltipLight, TooltipDark } from './components/Tooltip';

// UI Components - Overlay
export { Popover, PopoverTrigger, PopoverContent } from './components/Popover';
export { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, DropdownMenu, DropdownGroup } from './components/Dropdown';
export { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from './components/Drawer';
export { BottomSheet } from './components/BottomSheet';
export { ConfirmModal } from './components/ConfirmModal';

// UI Components - Form
export { Form, FormField, FormGroup } from './components/Form';
export { Label } from './components/Label';
export { Checkbox } from './components/Checkbox';
export { Radio } from './components/Radio';
export { Select, SelectOption } from './components/Select';
export { Switch } from './components/Switch';
export { Slider } from './components/Slider';
export { Textarea } from './components/Textarea';
export { DatePicker } from './components/DatePicker';
export type { DatePickerProps } from './components/DatePicker';
export { Upload } from './components/Upload';
export type { UploadProps, UploadedFile } from './components/Upload';
export { Autocomplete } from './components/Autocomplete';
export type { AutocompleteProps, AutocompleteOption } from './components/Autocomplete';

// UI Components - Interactive
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/Accordion';
export { Tabs, TabsList, TabsTrigger, TabsContent, TabsPills, TabsUnderline, TabsCards } from './components/Tabs';
export { Menu, MenuItem, MenuSeparator, MenuLabel, MenuHorizontal, MenuVertical, MenuCompact } from './components/Menu';
export { ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuLabel, ContextMenuGroup } from './components/ContextMenu';
export { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator, CommandEmpty, CommandDialog } from './components/Command';

// UI Components - Specialized (Core)
export { ScrollArea } from './components/ScrollArea';
export { ScrollToTop } from './components/ScrollToTop';
export { ThemeProvider } from './components/ThemeProvider';
export { ThemeToggle } from './components/ThemeToggle';
export { useTheme } from './components/ThemeProvider';

// ❌ Advanced Specialized components moved to @hua-labs/ui/advanced
// Bookmark, ChatMessage, ComponentLayout, EmotionAnalysis, EmotionButton,
// EmotionMeter, EmotionSelector, LanguageToggle, ScrollIndicator,
// ScrollProgress, Scrollbar, FeatureCard, HeroSection, InfoCard
// Import from '@hua-labs/ui/advanced' instead

// Icons and Types
export { iconCategories, emotionIcons, statusIcons } from './lib/icons';
export type { IconName } from './lib/icons';
export { iconNames, iconProviderMapping, isValidIconName, getIconNameForProvider } from './lib/icon-names';
export type { ProjectIconName, AllIconName } from './lib/icon-names';
export { ICON_ALIASES, resolveIconAlias, getIconAliases } from './lib/icon-aliases';
export { IconProvider, useIconContext } from './components/Icon';
export type { IconProviderProps } from './components/Icon';
export type { IconSet, PhosphorWeight, IconConfig } from './components/Icon';
export { defaultIconConfig, getDefaultStrokeWidth } from './components/Icon';

// Utilities
export { merge, mergeIf, mergeMap, cn, formatRelativeTime } from './lib/utils';

// Convenience exports for common use cases (Tree-shaking friendly)
// These are just re-exports, so they don't increase bundle size if not used
export { Button as Btn } from './components/Button';
export { Action as Act } from './components/Action';
export { Input as Inp } from './components/Input';
export { Link as Lnk } from './components/Link';
export { Icon as Ic } from './components/Icon';
export { Avatar as Avt } from './components/Avatar';
export { Modal as Mdl } from './components/Modal';
export { Container as Cont } from './components/Container';
export { Card as Crd } from './components/Card';
export { Table as Tbl } from './components/Table';
export { Form as Frm } from './components/Form';
export { Alert as Alt } from './components/Alert';
export { LoadingSpinner as Loading } from './components/LoadingSpinner';

// ❌ Advanced components are no longer exported from the main entry point
// Import from '@hua-labs/ui/advanced' or specific sub-entries:
// - '@hua-labs/ui/advanced' - All advanced components
// - '@hua-labs/ui/advanced/dashboard' - Dashboard components only
// - '@hua-labs/ui/advanced/motion' - Motion components only 