/**
 * Core Icons
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
  Home,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Menu,
  X,
  Search,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,

  // Actions
  Edit,
  Trash2,
  Plus,
  Minus,
  Download,
  Upload,
  RefreshCw,
  Save,
  Copy,

  // Text Formatting (Markdown Toolbar)
  Bold,
  Italic,
  Strikethrough,
  Heading,
  Link,
  Code,
  FileCode,
  Quote,
  List,
  ListOrdered,
  
  // Status & Feedback
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Check,
  Circle,
  HelpCircle,
  
  // User & Auth
  User,
  Users,
  UserPlus,
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  
  // Data & Analytics
  BarChart3,
  TrendingUp,
  Activity,
  Database,
  Zap,
  
  // Files & Content
  FileText,
  File,
  Folder,
  Book,
  BookOpen,
  
  // Communication
  Mail,
  MessageCircle,
  Phone,
  
  // Media
  Image,
  Video,
  Camera,
  
  // Emotions
  Smile,
  Frown,
  Meh,
  
  // Security
  Lock,
  Unlock,
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
  Sparkles,
  Globe,
  Smartphone,
} from 'lucide-react'

// 핵심 아이콘 객체
export const icons = {
  // Navigation
  home: Home,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  menu: Menu,
  close: X,
  search: Search,
  settings: Settings,
  externalLink: ExternalLink,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  
  // Actions
  edit: Edit,
  delete: Trash2,
  add: Plus,
  remove: Minus,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  save: Save,
  copy: Copy,
  
  // Status & Feedback
  loader: Loader2,
  success: CheckCircle,
  error: XCircle,
  alertCircle: AlertCircle,
  warning: AlertCircle, // warning은 alertCircle과 동일
  info: Info,
  check: Check,
  circle: Circle,
  helpCircle: HelpCircle,
  
  // User & Auth
  user: User,
  users: Users,
  userPlus: UserPlus,
  logIn: LogIn,
  logOut: LogOut,
  eye: Eye,
  eyeOff: EyeOff,
  
  // Data & Analytics
  chart: BarChart3,
  barChart: BarChart3,
  trendingUp: TrendingUp,
  activity: Activity,
  database: Database,
  zap: Zap,
  
  // Files & Content
  fileText: FileText,
  file: File,
  folder: Folder,
  book: Book,
  bookOpen: BookOpen,
  
  // Communication
  mail: Mail,
  message: MessageCircle,
  phone: Phone,
  
  // Media
  image: Image,
  video: Video,
  camera: Camera,
  
  // Emotions
  smile: Smile,
  frown: Frown,
  meh: Meh,
  
  // Security
  lock: Lock,
  unlock: Unlock,
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
  sparkles: Sparkles,
  globe: Globe,
  smartphone: Smartphone,
  deviceMobile: Smartphone,
  floppyDisk: Save,

  // Text Formatting (Markdown Toolbar)
  bold: Bold,
  italic: Italic,
  strikethrough: Strikethrough,
  heading: Heading,
  link: Link,
  code: Code,
  fileCode: FileCode,
  quote: Quote,
  list: List,
  listOrdered: ListOrdered,
  minus: Minus,
} as const

// 아이콘 이름 타입
export type IconName = keyof typeof icons

// 감정별 아이콘 매핑
export const emotionIcons = {
  happy: 'smile',
  sad: 'frown',
  neutral: 'meh',
  excited: 'smile', // laugh 대신 smile 사용
  angry: 'frown', // angry 대신 frown 사용
  love: 'heart',
  like: 'heart', // thumbsUp 대신 heart 사용
  dislike: 'frown', // thumbsDown 대신 frown 사용
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
