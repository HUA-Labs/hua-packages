/**
 * Static Phosphor projection of the semantic icon catalog.
 *
 * Every canonical icon ID resolves through an explicit SSR-safe component
 * import. The catalog owns semantic IDs; this module owns executable imports.
 */

import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { ICON_CATALOG, type IconCatalogId } from "./icon-catalog";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { SquaresFour } from "@phosphor-icons/react/dist/ssr/SquaresFour";
import { Folder } from "@phosphor-icons/react/dist/ssr/Folder";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { Columns } from "@phosphor-icons/react/dist/ssr/Columns";
import { Users } from "@phosphor-icons/react/dist/ssr/Users";
import { Gear } from "@phosphor-icons/react/dist/ssr/Gear";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRight } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretUp } from "@phosphor-icons/react/dist/ssr/CaretUp";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArrowUp } from "@phosphor-icons/react/dist/ssr/ArrowUp";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr/ArrowDown";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { Pencil } from "@phosphor-icons/react/dist/ssr/Pencil";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";
import { Upload } from "@phosphor-icons/react/dist/ssr/Upload";
import { Download } from "@phosphor-icons/react/dist/ssr/Download";
import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { Share } from "@phosphor-icons/react/dist/ssr/Share";
import { Copy } from "@phosphor-icons/react/dist/ssr/Copy";
import { FloppyDisk } from "@phosphor-icons/react/dist/ssr/FloppyDisk";
import { Spinner } from "@phosphor-icons/react/dist/ssr/Spinner";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { XCircle } from "@phosphor-icons/react/dist/ssr/XCircle";
import { Info } from "@phosphor-icons/react/dist/ssr/Info";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { Bell } from "@phosphor-icons/react/dist/ssr/Bell";
import { Heart } from "@phosphor-icons/react/dist/ssr/Heart";
import { Star } from "@phosphor-icons/react/dist/ssr/Star";
import { Bookmark } from "@phosphor-icons/react/dist/ssr/Bookmark";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { UserPlus } from "@phosphor-icons/react/dist/ssr/UserPlus";
import { SignIn } from "@phosphor-icons/react/dist/ssr/SignIn";
import { SignOut } from "@phosphor-icons/react/dist/ssr/SignOut";
import { GoogleChromeLogo } from "@phosphor-icons/react/dist/ssr/GoogleChromeLogo";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr/GithubLogo";
import { ChatCircle } from "@phosphor-icons/react/dist/ssr/ChatCircle";
import { Chat } from "@phosphor-icons/react/dist/ssr/Chat";
import { Tray } from "@phosphor-icons/react/dist/ssr/Tray";
import { Calendar } from "@phosphor-icons/react/dist/ssr/Calendar";
import { CalendarPlus } from "@phosphor-icons/react/dist/ssr/CalendarPlus";
import { CheckSquare } from "@phosphor-icons/react/dist/ssr/CheckSquare";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { Book } from "@phosphor-icons/react/dist/ssr/Book";
import { BookOpen } from "@phosphor-icons/react/dist/ssr/BookOpen";
import { Monitor } from "@phosphor-icons/react/dist/ssr/Monitor";
import { Sun } from "@phosphor-icons/react/dist/ssr/Sun";
import { Moon } from "@phosphor-icons/react/dist/ssr/Moon";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { Lightbulb } from "@phosphor-icons/react/dist/ssr/Lightbulb";
import { Brain } from "@phosphor-icons/react/dist/ssr/Brain";
import { Lightning } from "@phosphor-icons/react/dist/ssr/Lightning";
import { Globe } from "@phosphor-icons/react/dist/ssr/Globe";
import { DeviceMobile } from "@phosphor-icons/react/dist/ssr/DeviceMobile";
import { ChartBar } from "@phosphor-icons/react/dist/ssr/ChartBar";
import { TrendUp } from "@phosphor-icons/react/dist/ssr/TrendUp";
import { TrendDown } from "@phosphor-icons/react/dist/ssr/TrendDown";
import { Pulse } from "@phosphor-icons/react/dist/ssr/Pulse";
import { Database } from "@phosphor-icons/react/dist/ssr/Database";
import { CurrencyDollar } from "@phosphor-icons/react/dist/ssr/CurrencyDollar";
import { Stack } from "@phosphor-icons/react/dist/ssr/Stack";
import { Prohibit } from "@phosphor-icons/react/dist/ssr/Prohibit";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { LockOpen } from "@phosphor-icons/react/dist/ssr/LockOpen";
import { Shield } from "@phosphor-icons/react/dist/ssr/Shield";
import { Key } from "@phosphor-icons/react/dist/ssr/Key";
import { Play } from "@phosphor-icons/react/dist/ssr/Play";
import { Pause } from "@phosphor-icons/react/dist/ssr/Pause";
import { Image } from "@phosphor-icons/react/dist/ssr/Image";
import { Video } from "@phosphor-icons/react/dist/ssr/Video";
import { Camera } from "@phosphor-icons/react/dist/ssr/Camera";
import { FileText } from "@phosphor-icons/react/dist/ssr/FileText";
import { File } from "@phosphor-icons/react/dist/ssr/File";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr/ArrowSquareOut";
import { Link } from "@phosphor-icons/react/dist/ssr/Link";
import { DotsThreeOutline } from "@phosphor-icons/react/dist/ssr/DotsThreeOutline";
import { DotsThreeVertical } from "@phosphor-icons/react/dist/ssr/DotsThreeVertical";
import { Minus } from "@phosphor-icons/react/dist/ssr/Minus";
import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { Smiley } from "@phosphor-icons/react/dist/ssr/Smiley";
import { SmileySad } from "@phosphor-icons/react/dist/ssr/SmileySad";
import { SmileyMeh } from "@phosphor-icons/react/dist/ssr/SmileyMeh";
import { Envelope } from "@phosphor-icons/react/dist/ssr/Envelope";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { Flag } from "@phosphor-icons/react/dist/ssr/Flag";
import { Rocket } from "@phosphor-icons/react/dist/ssr/Rocket";
import { Ticket } from "@phosphor-icons/react/dist/ssr/Ticket";
import { Clipboard } from "@phosphor-icons/react/dist/ssr/Clipboard";
import { WifiHigh } from "@phosphor-icons/react/dist/ssr/WifiHigh";
import { WifiSlash } from "@phosphor-icons/react/dist/ssr/WifiSlash";
import { Cpu } from "@phosphor-icons/react/dist/ssr/Cpu";
import { MaskHappy } from "@phosphor-icons/react/dist/ssr/MaskHappy";
import { TextB } from "@phosphor-icons/react/dist/ssr/TextB";
import { TextItalic } from "@phosphor-icons/react/dist/ssr/TextItalic";
import { TextStrikethrough } from "@phosphor-icons/react/dist/ssr/TextStrikethrough";
import { TextHOne } from "@phosphor-icons/react/dist/ssr/TextHOne";
import { Code } from "@phosphor-icons/react/dist/ssr/Code";
import { FileCode } from "@phosphor-icons/react/dist/ssr/FileCode";
import { Quotes } from "@phosphor-icons/react/dist/ssr/Quotes";
import { ListNumbers } from "@phosphor-icons/react/dist/ssr/ListNumbers";
import { Circle } from "@phosphor-icons/react/dist/ssr/Circle";
import { Question } from "@phosphor-icons/react/dist/ssr/Question";
import { Wallet } from "@phosphor-icons/react/dist/ssr/Wallet";
import { Square } from "@phosphor-icons/react/dist/ssr/Square";
import { Layout } from "@phosphor-icons/react/dist/ssr/Layout";
import { Megaphone } from "@phosphor-icons/react/dist/ssr/Megaphone";
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
import { TextAlignLeft } from "@phosphor-icons/react/dist/ssr/TextAlignLeft";
import { TextUnderline } from "@phosphor-icons/react/dist/ssr/TextUnderline";

const PHOSPHOR_COMPONENTS = Object.freeze({
  House,
  SquaresFour,
  Folder,
  WarningCircle,
  Columns,
  Users,
  Gear,
  List,
  X,
  CaretLeft,
  CaretRight,
  CaretDown,
  CaretUp,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Pencil,
  Trash,
  Upload,
  Download,
  Check,
  MagnifyingGlass,
  Share,
  Copy,
  FloppyDisk,
  Spinner,
  CheckCircle,
  XCircle,
  Info,
  ArrowClockwise,
  Bell,
  Heart,
  Star,
  Bookmark,
  User,
  UserPlus,
  SignIn,
  SignOut,
  GoogleChromeLogo,
  GithubLogo,
  ChatCircle,
  Chat,
  Tray,
  Calendar,
  CalendarPlus,
  CheckSquare,
  Clock,
  Book,
  BookOpen,
  Monitor,
  Sun,
  Moon,
  Sparkle,
  Lightbulb,
  Brain,
  Lightning,
  Globe,
  DeviceMobile,
  ChartBar,
  TrendUp,
  TrendDown,
  Pulse,
  Database,
  CurrencyDollar,
  Stack,
  Prohibit,
  Lock,
  LockOpen,
  Shield,
  Key,
  Play,
  Pause,
  Image,
  Video,
  Camera,
  FileText,
  File,
  ArrowSquareOut,
  Link,
  DotsThreeOutline,
  DotsThreeVertical,
  Minus,
  Eye,
  EyeSlash,
  Smiley,
  SmileySad,
  SmileyMeh,
  Envelope,
  Phone,
  Flag,
  Rocket,
  Ticket,
  Clipboard,
  WifiHigh,
  WifiSlash,
  Cpu,
  MaskHappy,
  TextB,
  TextItalic,
  TextStrikethrough,
  TextHOne,
  Code,
  FileCode,
  Quotes,
  ListNumbers,
  Circle,
  Question,
  Wallet,
  Square,
  Layout,
  Megaphone,
  MapPin,
  TextAlignLeft,
  TextUnderline,
});

export type IconName = IconCatalogId;
export type PhosphorIconComponent = ComponentType<PhosphorIconProps>;

const iconLookup = Object.create(null) as Record<
  IconName,
  PhosphorIconComponent
>;
for (const record of ICON_CATALOG) {
  const component =
    PHOSPHOR_COMPONENTS[
      record.providers.phosphor.component as keyof typeof PHOSPHOR_COMPONENTS
    ];
  if (!component) {
    throw new Error(
      `Missing static Phosphor component ${record.providers.phosphor.component} for ${record.id}`,
    );
  }
  iconLookup[record.id as IconName] = component;
}

export const icons = Object.freeze(iconLookup) as Readonly<
  Record<IconName, PhosphorIconComponent>
>;

export const emotionIcons = {
  happy: "smile",
  sad: "frown",
  neutral: "meh",
  excited: "smile",
  angry: "frown",
  love: "heart",
  like: "heart",
  dislike: "frown",
} as const satisfies Readonly<Record<string, IconName>>;

export const statusIcons = {
  loading: "loader",
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  locked: "lock",
  unlocked: "unlock",
  visible: "eye",
  hidden: "eyeOff",
} as const satisfies Readonly<Record<string, IconName>>;

export const iconCategories = {
  navigation: [
    "home",
    "arrowLeft",
    "arrowRight",
    "arrowUp",
    "arrowDown",
    "menu",
    "close",
    "search",
    "settings",
    "externalLink",
    "chevronLeft",
    "chevronRight",
    "chevronDown",
    "chevronUp",
  ],
  actions: [
    "edit",
    "delete",
    "add",
    "remove",
    "download",
    "upload",
    "refresh",
    "save",
    "copy",
  ],
  status: [
    "loader",
    "success",
    "error",
    "alertCircle",
    "warning",
    "info",
    "check",
    "circle",
    "helpCircle",
  ],
  user: ["user", "users", "userPlus", "logIn", "logOut", "eye", "eyeOff"],
  data: [
    "chart",
    "barChart",
    "trendingUp",
    "trendingDown",
    "activity",
    "database",
    "zap",
  ],
  files: ["fileText", "file", "folder", "book", "bookOpen"],
  communication: ["mail", "message", "messageSquare", "phone"],
  media: ["image", "video", "camera", "play", "pause"],
  emotions: ["smile", "frown", "meh"],
  security: ["lock", "unlock", "shield", "key"],
  time: ["clock", "calendar", "calendarPlus"],
  ui: ["bell", "heart", "star", "bookmark", "share"],
  theme: ["monitor", "sun", "moon"],
} as const satisfies Readonly<Record<string, readonly IconName[]>>;
