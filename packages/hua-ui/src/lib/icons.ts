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

// Navigation
import { House } from '@phosphor-icons/react/dist/ssr/House'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr/ArrowLeft'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr/ArrowRight'
import { ArrowUp } from '@phosphor-icons/react/dist/ssr/ArrowUp'
import { ArrowDown } from '@phosphor-icons/react/dist/ssr/ArrowDown'
import { List } from '@phosphor-icons/react/dist/ssr/List'
import { X } from '@phosphor-icons/react/dist/ssr/X'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass'
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear'
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut'
import { CaretLeft } from '@phosphor-icons/react/dist/ssr/CaretLeft'
import { CaretRight } from '@phosphor-icons/react/dist/ssr/CaretRight'
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown'
import { CaretUp } from '@phosphor-icons/react/dist/ssr/CaretUp'

// Actions
import { Pencil } from '@phosphor-icons/react/dist/ssr/Pencil'
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash'
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus'
import { Minus } from '@phosphor-icons/react/dist/ssr/Minus'
import { Download } from '@phosphor-icons/react/dist/ssr/Download'
import { Upload } from '@phosphor-icons/react/dist/ssr/Upload'
import { ArrowClockwise } from '@phosphor-icons/react/dist/ssr/ArrowClockwise'
import { FloppyDisk } from '@phosphor-icons/react/dist/ssr/FloppyDisk'
import { Copy } from '@phosphor-icons/react/dist/ssr/Copy'

// Text Formatting (Markdown Toolbar)
import { TextB } from '@phosphor-icons/react/dist/ssr/TextB'
import { TextItalic } from '@phosphor-icons/react/dist/ssr/TextItalic'
import { TextStrikethrough } from '@phosphor-icons/react/dist/ssr/TextStrikethrough'
import { TextHOne } from '@phosphor-icons/react/dist/ssr/TextHOne'
import { Link } from '@phosphor-icons/react/dist/ssr/Link'
import { Code } from '@phosphor-icons/react/dist/ssr/Code'
import { FileCode } from '@phosphor-icons/react/dist/ssr/FileCode'
import { Quotes } from '@phosphor-icons/react/dist/ssr/Quotes'
import { ListNumbers } from '@phosphor-icons/react/dist/ssr/ListNumbers'

// Status & Feedback
import { SpinnerGap } from '@phosphor-icons/react/dist/ssr/SpinnerGap'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle'
import { XCircle } from '@phosphor-icons/react/dist/ssr/XCircle'
import { WarningCircle } from '@phosphor-icons/react/dist/ssr/WarningCircle'
import { Info } from '@phosphor-icons/react/dist/ssr/Info'
import { Check } from '@phosphor-icons/react/dist/ssr/Check'
import { Circle } from '@phosphor-icons/react/dist/ssr/Circle'
import { Question } from '@phosphor-icons/react/dist/ssr/Question'

// User & Auth
import { User } from '@phosphor-icons/react/dist/ssr/User'
import { Users } from '@phosphor-icons/react/dist/ssr/Users'
import { UserPlus } from '@phosphor-icons/react/dist/ssr/UserPlus'
import { SignIn } from '@phosphor-icons/react/dist/ssr/SignIn'
import { SignOut } from '@phosphor-icons/react/dist/ssr/SignOut'
import { Eye } from '@phosphor-icons/react/dist/ssr/Eye'
import { EyeSlash } from '@phosphor-icons/react/dist/ssr/EyeSlash'

// Data & Analytics
import { ChartBar } from '@phosphor-icons/react/dist/ssr/ChartBar'
import { TrendUp } from '@phosphor-icons/react/dist/ssr/TrendUp'
import { Pulse } from '@phosphor-icons/react/dist/ssr/Pulse'
import { Database } from '@phosphor-icons/react/dist/ssr/Database'
import { Lightning } from '@phosphor-icons/react/dist/ssr/Lightning'

// Files & Content
import { FileText } from '@phosphor-icons/react/dist/ssr/FileText'
import { File } from '@phosphor-icons/react/dist/ssr/File'
import { Folder } from '@phosphor-icons/react/dist/ssr/Folder'
import { Book } from '@phosphor-icons/react/dist/ssr/Book'
import { BookOpen } from '@phosphor-icons/react/dist/ssr/BookOpen'

// Communication
import { Envelope } from '@phosphor-icons/react/dist/ssr/Envelope'
import { ChatCircle } from '@phosphor-icons/react/dist/ssr/ChatCircle'
import { Phone } from '@phosphor-icons/react/dist/ssr/Phone'

// Media
import { Image } from '@phosphor-icons/react/dist/ssr/Image'
import { Video } from '@phosphor-icons/react/dist/ssr/Video'
import { Camera } from '@phosphor-icons/react/dist/ssr/Camera'

// Emotions
import { Smiley } from '@phosphor-icons/react/dist/ssr/Smiley'
import { SmileySad } from '@phosphor-icons/react/dist/ssr/SmileySad'
import { SmileyMeh } from '@phosphor-icons/react/dist/ssr/SmileyMeh'

// Security
import { Lock } from '@phosphor-icons/react/dist/ssr/Lock'
import { LockOpen } from '@phosphor-icons/react/dist/ssr/LockOpen'
import { Shield } from '@phosphor-icons/react/dist/ssr/Shield'
import { Wallet } from '@phosphor-icons/react/dist/ssr/Wallet'
import { Key } from '@phosphor-icons/react/dist/ssr/Key'

// Time & Date
import { Clock } from '@phosphor-icons/react/dist/ssr/Clock'
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar'
import { CalendarPlus } from '@phosphor-icons/react/dist/ssr/CalendarPlus'

// UI Elements
import { Bell } from '@phosphor-icons/react/dist/ssr/Bell'
import { Heart } from '@phosphor-icons/react/dist/ssr/Heart'
import { Star } from '@phosphor-icons/react/dist/ssr/Star'
import { Bookmark } from '@phosphor-icons/react/dist/ssr/Bookmark'
import { Share } from '@phosphor-icons/react/dist/ssr/Share'

// Theme
import { Monitor } from '@phosphor-icons/react/dist/ssr/Monitor'
import { Sun } from '@phosphor-icons/react/dist/ssr/Sun'
import { Moon } from '@phosphor-icons/react/dist/ssr/Moon'

// Additional
import { Lightbulb } from '@phosphor-icons/react/dist/ssr/Lightbulb'
import { Brain } from '@phosphor-icons/react/dist/ssr/Brain'
import { Flag } from '@phosphor-icons/react/dist/ssr/Flag'
import { Square } from '@phosphor-icons/react/dist/ssr/Square'
import { Sparkle } from '@phosphor-icons/react/dist/ssr/Sparkle'
import { Globe } from '@phosphor-icons/react/dist/ssr/Globe'
import { DeviceMobile } from '@phosphor-icons/react/dist/ssr/DeviceMobile'
import { Ticket } from '@phosphor-icons/react/dist/ssr/Ticket'
import { Clipboard } from '@phosphor-icons/react/dist/ssr/Clipboard'
import { WifiHigh } from '@phosphor-icons/react/dist/ssr/WifiHigh'
import { WifiSlash } from '@phosphor-icons/react/dist/ssr/WifiSlash'
import { Cpu } from '@phosphor-icons/react/dist/ssr/Cpu'
import { MaskHappy } from '@phosphor-icons/react/dist/ssr/MaskHappy'
import { Rocket } from '@phosphor-icons/react/dist/ssr/Rocket'

// Admin
import { Layout } from '@phosphor-icons/react/dist/ssr/Layout'
import { Megaphone } from '@phosphor-icons/react/dist/ssr/Megaphone'
import { Stack } from '@phosphor-icons/react/dist/ssr/Stack'
import { Prohibit } from '@phosphor-icons/react/dist/ssr/Prohibit'

// 핵심 아이콘 객체 (키는 기존과 동일, 값만 Phosphor로 교체)
export const icons = {
  // Navigation
  home: House,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  menu: List,
  x: X,
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
