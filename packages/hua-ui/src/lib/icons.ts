/**
 * Core Icons (Phosphor Icons)
 *
 * 핵심 아이콘만 포함하여 번들 크기를 최적화합니다.
 * 나머지 아이콘은 동적 fallback으로 처리됩니다.
 *
 * 포함 기준:
 * 1. my-app에서 실제 사용 중인 아이콘
 * 2. UI 컴포넌트에서 자주 사용되는 아이콘
 * 3. 각 카테고리의 대표 아이콘
 *
 * 새로운 아이콘이 필요하면 동적 fallback이 자동으로 처리합니다.
 */

import {
  // Navigation
  House,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  List as ListIcon,
  X,
  MagnifyingGlass,
  Gear,
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
  CaretDown,
  CaretUp,

  // Actions
  Pencil,
  Trash,
  Plus,
  Minus,
  Download,
  Upload,
  ArrowClockwise,
  FloppyDisk,
  Copy,

  // Text Formatting (Markdown Toolbar)
  TextB,
  TextItalic,
  TextStrikethrough,
  TextHOne,
  Link,
  Code,
  FileCode,
  Quotes,
  List,
  ListNumbers,

  // Status & Feedback
  SpinnerGap,
  CheckCircle,
  XCircle,
  WarningCircle,
  Info,
  Check,
  Circle,
  Question,

  // User & Auth
  User,
  Users,
  UserPlus,
  SignIn,
  SignOut,
  Eye,
  EyeSlash,

  // Data & Analytics
  ChartBar,
  TrendUp,
  Pulse,
  Database,
  Lightning,

  // Files & Content
  FileText,
  File,
  Folder,
  Book,
  BookOpen,

  // Communication
  Envelope,
  ChatCircle,
  Phone,

  // Media
  Image,
  Video,
  Camera,

  // Emotions
  Smiley,
  SmileySad,
  SmileyMeh,

  // Security
  Lock,
  LockOpen,
  Shield,
  Wallet,
  Key,

  // Time & Date
  Clock,
  Calendar,
  CalendarPlus,

  // UI Elements
  Bell,
  Heart,
  Star,
  Bookmark,
  Share,

  // Theme
  Monitor,
  Sun,
  Moon,

  // Additional
  Lightbulb,
  Brain,
  Flag,
  Square,
  Sparkle,
  Globe,
  DeviceMobile,
  Ticket,
  Clipboard,
  WifiHigh,
  WifiSlash,
  Cpu,
  MaskHappy,
  Rocket,

  // Admin
  Layout,
  Megaphone,
  Stack,
  Prohibit,
} from '@phosphor-icons/react/dist/ssr'

// 핵심 아이콘 객체 (키는 기존과 동일, 값만 Phosphor로 교체)
export const icons = {
  // Navigation
  home: House,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  menu: ListIcon,
  close: X,
  search: MagnifyingGlass,
  settings: Gear,
  externalLink: ArrowSquareOut,
  chevronLeft: CaretLeft,
  chevronRight: CaretRight,
  chevronDown: CaretDown,
  chevronUp: CaretUp,

  // Actions
  edit: Pencil,
  delete: Trash,
  add: Plus,
  remove: Minus,
  download: Download,
  upload: Upload,
  refresh: ArrowClockwise,
  save: FloppyDisk,
  copy: Copy,

  // Status & Feedback
  loader: SpinnerGap,
  success: CheckCircle,
  error: XCircle,
  alertCircle: WarningCircle,
  warning: WarningCircle,
  info: Info,
  check: Check,
  circle: Circle,
  helpCircle: Question,

  // User & Auth
  user: User,
  users: Users,
  userPlus: UserPlus,
  logIn: SignIn,
  logOut: SignOut,
  eye: Eye,
  eyeOff: EyeSlash,

  // Data & Analytics
  chart: ChartBar,
  barChart: ChartBar,
  trendingUp: TrendUp,
  activity: Pulse,
  database: Database,
  zap: Lightning,

  // Files & Content
  fileText: FileText,
  file: File,
  folder: Folder,
  book: Book,
  bookOpen: BookOpen,

  // Communication
  mail: Envelope,
  message: ChatCircle,
  phone: Phone,

  // Media
  image: Image,
  video: Video,
  camera: Camera,

  // Emotions
  smile: Smiley,
  frown: SmileySad,
  meh: SmileyMeh,

  // Security
  lock: Lock,
  unlock: LockOpen,
  shield: Shield,
  wallet: Wallet,
  key: Key,

  // Time & Date
  clock: Clock,
  calendar: Calendar,
  calendarPlus: CalendarPlus,

  // UI Elements
  bell: Bell,
  heart: Heart,
  star: Star,
  bookmark: Bookmark,
  share: Share,

  // Theme
  monitor: Monitor,
  sun: Sun,
  moon: Moon,

  // Additional
  lightbulb: Lightbulb,
  brain: Brain,
  flag: Flag,
  square: Square,
  sparkle: Sparkle,
  sparkles: Sparkle,
  globe: Globe,
  smartphone: DeviceMobile,
  deviceMobile: DeviceMobile,
  floppyDisk: FloppyDisk,

  // Connectivity
  ticket: Ticket,
  clipboard: Clipboard,
  wifi: WifiHigh,
  wifiOff: WifiSlash,
  cpu: Cpu,
  mask: MaskHappy,
  rocket: Rocket,

  // Admin
  layout: Layout,
  megaphone: Megaphone,
  layers: Stack,
  ban: Prohibit,

  // Text Formatting (Markdown Toolbar)
  bold: TextB,
  italic: TextItalic,
  strikethrough: TextStrikethrough,
  heading: TextHOne,
  link: Link,
  code: Code,
  fileCode: FileCode,
  quote: Quotes,
  list: List,
  listOrdered: ListNumbers,
  minus: Minus,
} as const

// 아이콘 이름 타입
export type IconName = keyof typeof icons

// 감정별 아이콘 매핑
export const emotionIcons = {
  happy: 'smile',
  sad: 'frown',
  neutral: 'meh',
  excited: 'smile',
  angry: 'frown',
  love: 'heart',
  like: 'heart',
  dislike: 'frown',
} as const

// 상태별 아이콘 매핑
export const statusIcons = {
  loading: 'loader',
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  locked: 'lock',
  unlocked: 'unlock',
  visible: 'eye',
  hidden: 'eyeOff',
} as const

// 아이콘 카테고리별 그룹화 (참고용)
export const iconCategories = {
  navigation: ['home', 'arrowLeft', 'arrowRight', 'arrowUp', 'arrowDown', 'menu', 'close', 'search', 'settings', 'externalLink', 'chevronLeft', 'chevronRight', 'chevronDown', 'chevronUp'],
  actions: ['edit', 'delete', 'add', 'remove', 'download', 'upload', 'refresh', 'save', 'copy'],
  status: ['loader', 'success', 'error', 'alertCircle', 'warning', 'info', 'check', 'circle'],
  user: ['user', 'users', 'userPlus', 'logIn', 'logOut', 'eye', 'eyeOff'],
  data: ['chart', 'barChart', 'trendingUp', 'activity', 'database', 'zap'],
  files: ['fileText', 'file', 'folder', 'book'],
  communication: ['mail', 'message', 'phone'],
  media: ['image', 'video', 'camera'],
  emotions: ['smile', 'frown', 'meh'],
  security: ['lock', 'unlock', 'shield'],
  time: ['clock', 'calendar'],
  ui: ['bell', 'heart', 'star', 'bookmark', 'share'],
  theme: ['monitor', 'sun', 'moon'],
} as const
