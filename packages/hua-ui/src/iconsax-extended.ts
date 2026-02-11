/**
 * Iconsax Extended Icons Entry Point
 *
 * 모든 iconsax 아이콘을 즉시 로드합니다 (에센셜 + 확장).
 * 갤러리, 관리자 등 전체 아이콘이 필요한 경우 사용:
 *
 *   import '@hua-labs/ui/iconsax-extended'
 *
 * 일반 사용은 '@hua-labs/ui/iconsax' (에센셜만, ~80% 경량)
 */

import { registerIconsaxResolver } from './lib/icon-providers'
import { getIconsaxIconSync, registerExtendedIcons } from './lib/iconsax-loader'
import { getIconsaxIcon } from './components/icons'
import { getIconsaxBoldIcon } from './components/icons-bold'

// Register extended icon sets (full 331+ icons)
registerExtendedIcons(getIconsaxIcon, getIconsaxBoldIcon)

// Auto-register iconsax resolver with full icon set
registerIconsaxResolver((name: string, variant?: string) => {
  return getIconsaxIconSync(name, (variant as 'line' | 'bold') ?? 'line')
})

// Re-export everything from full icon sets
export { ICONSAX_ICONS, getIconsaxIcon } from './components/icons'
export type { IconsaxIcon } from './components/icons'
export { ICONSAX_BOLD_ICONS, getIconsaxBoldIcon } from './components/icons-bold'
export type { IconsaxBoldIcon } from './components/icons-bold'

// Gallery (needs all icons)
export { IconsaxGallery, ICONSAX_ICON_NAMES } from './components/IconsaxGallery'
export type { IconsaxGalleryProps, IconsaxIconName } from './components/IconsaxGallery'

// Loader utilities
export {
  loadIconsaxIcon,
  getIconsaxIconSync,
  preloadIconsaxIcons,
  preloadCommonIconsaxIcons,
  isIconsaxIconCached,
  createLazyIconsaxIcon,
  registerExtendedIcons,
} from './lib/iconsax-loader'
export type { IconsaxIconComponent } from './lib/iconsax-loader'
