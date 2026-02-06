/**
 * Iconsax Icons Entry Point
 *
 * iconsax 아이콘은 코어 번들에서 분리되어 있습니다.
 * 이 entry를 import하면 자동으로 iconsax resolver가 등록됩니다.
 *
 * 사용법:
 * - import { IconsaxGallery } from '@hua-labs/ui/iconsax'
 * - import '@hua-labs/ui/iconsax' (resolver 등록만)
 *
 * 프레임워크(hua-ux)에서도 이 entry를 통해 iconsax를 지원할 수 있습니다.
 */

import { registerIconsaxResolver } from './lib/icon-providers'
import { getIconsaxIconSync } from './lib/iconsax-loader'

// Auto-register iconsax resolver on import
registerIconsaxResolver((name: string, variant?: string) => {
  return getIconsaxIconSync(name, (variant as 'line' | 'bold') ?? 'line')
})

// Gallery
export { IconsaxGallery, ICONSAX_ICON_NAMES } from './components/IconsaxGallery'
export type { IconsaxGalleryProps, IconsaxIconName } from './components/IconsaxGallery'

// Loader utilities
export {
  loadIconsaxIcon,
  getIconsaxIconSync,
  preloadIconsaxIcons,
  preloadCommonIconsaxIcons,
  isIconsaxIconCached,
  getCachedIconsaxIcons,
  normalizeIconsaxIconName,
  createLazyIconsaxIcon,
} from './lib/iconsax-loader'
export type { IconsaxIconComponent } from './lib/iconsax-loader'

// Re-export icon maps for direct access
export { getIconsaxIcon, ICONSAX_ICONS } from './components/icons'
export { getIconsaxBoldIcon, ICONSAX_BOLD_ICONS } from './components/icons-bold'
