'use client'

import React, { useState, ComponentType } from 'react'
import { Card, CardContent } from '../Card'
import { Input } from '../Input'
import { Tabs, TabsList, TabsTrigger } from '../Tabs'
import * as LineIcons from '../icons'
import * as BoldIcons from '../icons-bold'

// Iconsax icon names (331 icons)
export const ICONSAX_ICON_NAMES = [
  '3Dcube', 'Add', 'AddCircle', 'AddSquare', 'Apple', 'Archive', 'ArrangeCircle', 'ArrangeCircle2',
  'ArrangeSquare', 'ArrangeSquare2', 'Arrow2', 'Arrow3', 'ArrowBottom', 'ArrowCircleDown',
  'ArrowCircleLeft', 'ArrowCircleRight', 'ArrowDown', 'ArrowDown1', 'ArrowDown2', 'ArrowLeft',
  'ArrowLeft1', 'ArrowLeft2', 'ArrowLeft3', 'ArrowRight', 'ArrowRight1', 'ArrowRight2', 'ArrowRight3',
  'ArrowSquareDown', 'ArrowSquareLeft', 'ArrowSquareRight', 'ArrowSquareUp', 'ArrowSwapHorizontal',
  'ArrowUp', 'ArrowUp1', 'ArrowUp2', 'ArrowUp3', 'AttachCircle', 'AttachSquare', 'Autobrightness',
  'BackSquare', 'Backward', 'Backward10Seconds', 'Backward15Seconds', 'Backward5Seconds',
  'BatteryDisable', 'BatteryFull', 'Bluetooth', 'BluetoothCircle', 'Book', 'Box', 'Box2',
  'Briefcase', 'Broom', 'Cake', 'Calculator', 'Camera', 'CameraSlash', 'CardAdd', 'CardRemove',
  'Cards', 'CardSlash', 'CardTick', 'Cd', 'Check', 'Chrome', 'CloseCircle', 'CloseSquare',
  'Cloud', 'CloudAdd', 'CloudChange', 'CloudDrizzle', 'CloudLightning', 'CloudNotif', 'CloudRemove',
  'CloudSnow', 'CloudSunny', 'Code', 'Code1', 'Coin', 'Computing', 'Convert', 'Crown', 'Crown1',
  'Danger', 'DirectDown', 'DirectLeft', 'DirectRight', 'DirectUp', 'Dislike', 'DollarSquare',
  'Drop', 'EmojiHappy', 'EmojiNormal', 'EmojiSad', 'EmptyWallet', 'Eraser', 'Export', 'Export1',
  'Export2', 'Export3', 'Eye', 'EyeSlash', 'Facebook', 'Figma', 'Filter', 'FilterAdd', 'FilterEdit',
  'FilterRemove', 'FilterSearch', 'FilterTick', 'FingerCricle', 'Firstline', 'Flag', 'Flag2',
  'Flash', 'FlashCircle', 'FlashSlash', 'Folder', 'Folder2', 'FolderAdd', 'FolderCloud',
  'FolderCross', 'FolderFavorite', 'FolderMinus', 'FolderOpen', 'Forbidden2', 'Forward',
  'Forward10Seconds', 'Forward15Seconds', 'Forward5Seconds', 'ForwardSquare', 'Frame', 'Frame1',
  'Gallery', 'GalleryAdd', 'GalleryRemove', 'GallerySlash', 'Global', 'Heart', 'Hierarchy',
  'Hierarchy2', 'Home2', 'HomeWifi', 'Html3', 'Html5', 'Image', 'Import', 'Import1', 'Import2',
  'InfoCircle', 'Information', 'Instagram', 'JavaScript', 'LanguageCircle', 'LanguageSquare',
  'Like', 'LikeDislike', 'LikeTag', 'Link', 'Link1', 'Link2', 'Link21', 'LinkCircle', 'LinkSquare',
  'LocationCross', 'LocationMinus', 'LocationSlash', 'LocationTick', 'Lock', 'LockSlash',
  'Login', 'Login1', 'Logout', 'Logout1', 'Map', 'Math', 'Maximize', 'Menu', 'MessageProgramming',
  'Microphone', 'Microphone2', 'MicrophoneSlash', 'MicrophoneSlash1', 'Milk', 'Minus', 'MinusCirlce',
  'MinusSquare', 'Monitor', 'Moon', 'MoreCircle', 'MoreSquare', 'Mouse', 'MouseCircle', 'MouseSquare',
  'Next', 'Paperclip', 'Paperclip2', 'PasswordCheck', 'Pause', 'PauseCircle', 'People', 'Pet',
  'Pharagraphspacing', 'Play', 'PlayCircle', 'Previous', 'Printer', 'PrinterSlash', 'Profile',
  'Profile2User', 'ProfileAdd', 'ProfileCircle', 'ProfileDelete', 'ProfileRemove', 'ProfileTick',
  'ProgrammingArrow', 'QuoteDown', 'QuoteDownCircle', 'QuoteDownSquare', 'QuoteUp', 'QuoteUpCircle',
  'QuoteUpSquare', 'Ranking', 'ReceiptDiscount', 'ReceiptDisscount', 'ReceiptItem', 'ReceiptMinus',
  'Received', 'ReceiveSquare', 'ReceiveSquare2', 'Record', 'RecordCircle', 'Redo', 'Refresh',
  'Refresh2', 'RefreshCircle', 'RefreshLeftSquare', 'RefreshRightSquare', 'RefreshSquare2',
  'Repeat', 'RepeatCircle', 'RepeateMusic', 'RepeateOne', 'RotateLeft', 'RotateRight', 'SafeHome',
  'Scan', 'SearchNormal', 'SearchZoomIn', 'SearchZoomOut', 'Send', 'Send2', 'SendSqaure2',
  'SendSquare', 'Shield', 'ShieldCross', 'ShieldSecurity', 'ShieldSlash', 'ShieldTick', 'Shuffle',
  'Slack', 'Slash', 'Smallcaps', 'SmartHome', 'Sort', 'Sound', 'Spotify', 'Star', 'Sticker',
  'Stop', 'StopCircle', 'Story', 'Sun', 'TagCross', 'TagUser', 'Teacher', 'Text', 'TextalignCenter',
  'TextalignJustifycenter', 'TextalignJustifyleft', 'TextalignJustifyright', 'TextalignLeft',
  'TextalignRight', 'TextBlock', 'TextBold', 'TextItalic', 'TextUnderline', 'TickCircle', 'Ticket',
  'TicketDiscount', 'TickSquare', 'Translate', 'Trash', 'Triangle', 'Truck', 'TrushSquare',
  'Undo', 'Unlimited', 'Unlock', 'User', 'UserAdd', 'UserCirlceAdd', 'UserEdit', 'UserMinus',
  'UserOctagon', 'UserRemove', 'UserSearch', 'UserSquare', 'UserTag', 'UserTick', 'Verify',
  'Video', 'VideoCircle', 'VideoPlay', 'VideoSlash', 'VideoSquare', 'VoiceSquare', 'VolumeCross',
  'VolumeHigh', 'VolumeLow', 'VolumeLow1', 'VolumeMute', 'VolumeSlash', 'VolumeUp', 'Warning2',
  'Whatsapp', 'Wifi', 'WifiSquare', 'Windows', 'Youtube'
] as const

export type IconsaxIconName = typeof ICONSAX_ICON_NAMES[number]
export type IconsaxVariant = 'line' | 'bold'

export interface IconsaxGalleryProps {
  /** Default variant to show */
  defaultVariant?: IconsaxVariant
  /** Callback when icon is clicked */
  onIconClick?: (name: string, variant: IconsaxVariant) => void
  /** Custom copy format function */
  formatCopyText?: (name: string, variant: IconsaxVariant) => string
  /** Show variant toggle tabs */
  showVariantToggle?: boolean
  /** Show search input */
  showSearch?: boolean
  /** Show icon count */
  showCount?: boolean
  /** Custom class name */
  className?: string
  /** Grid columns (default responsive) */
  columns?: number
}

interface IconCellProps {
  name: string
  index: number
  variant: IconsaxVariant
  isCopied: boolean
  onClick: () => void
}

function IconCell({ name, index, variant, isCopied, onClick }: IconCellProps) {
  const IconComponent = variant === 'bold'
    ? (BoldIcons as unknown as Record<string, ComponentType<{ className?: string }>>)[name]
    : (LineIcons as unknown as Record<string, ComponentType<{ className?: string }>>)[name]

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors group cursor-pointer border border-transparent hover:border-border"
      title={`#${index + 1} ${name} - Click to copy`}
    >
      <div className="text-[10px] text-muted-foreground mb-1 font-mono">
        #{index + 1}
      </div>
      <div className="mb-2 text-foreground relative w-8 h-8 flex items-center justify-center">
        {isCopied ? (
          <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : IconComponent ? (
          <IconComponent className="w-8 h-8" />
        ) : (
          <span className="text-xs text-muted-foreground">?</span>
        )}
      </div>
      <div className="text-[10px] text-center text-muted-foreground group-hover:text-foreground truncate w-full">
        {isCopied ? 'Copied!' : name}
      </div>
    </button>
  )
}

/**
 * IconsaxGallery - Interactive gallery for browsing Iconsax icons
 *
 * Displays all 331 Iconsax icons with search, variant toggle, and click-to-copy functionality.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <IconsaxGallery />
 *
 * // With custom copy format
 * <IconsaxGallery
 *   formatCopyText={(name) => `import { ${name} } from "@hua-labs/ui/icons"`}
 * />
 *
 * // With click handler
 * <IconsaxGallery
 *   onIconClick={(name, variant) => console.log(name, variant)}
 * />
 * ```
 */
export function IconsaxGallery({
  defaultVariant = 'line',
  onIconClick,
  formatCopyText = (name) => `<Icon name="${name}" />`,
  showVariantToggle = true,
  showSearch = true,
  showCount = true,
  className,
  columns,
}: IconsaxGalleryProps) {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [variant, setVariant] = useState<IconsaxVariant>(defaultVariant)

  const filteredIcons = ICONSAX_ICON_NAMES.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const handleIconClick = async (name: string) => {
    const code = formatCopyText(name, variant)

    try {
      await navigator.clipboard.writeText(code)
      setCopied(name)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }

    onIconClick?.(name, variant)
  }

  const gridClass = columns
    ? `grid gap-4`
    : 'grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4'

  const gridStyle = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined

  return (
    <div className={className}>
      {/* Search & Variant Toggle */}
      {(showSearch || showVariantToggle) && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          {showSearch && (
            <div>
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              {showCount && (
                <p className="text-sm text-muted-foreground mt-2">
                  {filteredIcons.length} / {ICONSAX_ICON_NAMES.length} icons
                </p>
              )}
            </div>
          )}
          {showVariantToggle && (
            <Tabs value={variant} onValueChange={(v) => setVariant(v as IconsaxVariant)}>
              <TabsList>
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="bold">Bold</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      )}

      {/* Gallery Grid */}
      <Card>
        <CardContent className="p-6">
          <div className={gridClass} style={gridStyle}>
            {filteredIcons.map((name) => {
              const originalIndex = ICONSAX_ICON_NAMES.indexOf(name)
              return (
                <IconCell
                  key={`${name}-${variant}`}
                  name={name}
                  index={originalIndex}
                  variant={variant}
                  isCopied={copied === name}
                  onClick={() => handleIconClick(name)}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default IconsaxGallery
