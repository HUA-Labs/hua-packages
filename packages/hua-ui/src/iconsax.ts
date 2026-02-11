/**
 * Iconsax Icons Entry Point (Essential Only)
 *
 * 에센셜 아이콘(57개)만 번들에 포함됩니다.
 * PROJECT_ICONS에서 실제 사용되는 iconsax 매핑만 즉시 로드.
 *
 * 사용법:
 * - import '@hua-labs/ui/iconsax' (resolver 등록 + 에센셜 아이콘)
 * - import { getIconsaxIconSync } from '@hua-labs/ui/iconsax'
 *
 * 전체 아이콘이 필요하면:
 * - import '@hua-labs/ui/iconsax-extended'
 */

import { registerIconsaxResolver } from './lib/icon-providers'
import { getIconsaxIconSync } from './lib/iconsax-loader'

// Auto-register iconsax resolver on import
registerIconsaxResolver((name: string, variant?: string) => {
  return getIconsaxIconSync(name, (variant as 'line' | 'bold') ?? 'line')
})

// Gallery is only available in iconsax-extended (imports all icons)
// import { IconsaxGallery } from '@hua-labs/ui/iconsax-extended'

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

// Essential icon maps (for direct access)
export { ESSENTIAL_ICONSAX_ICONS, getEssentialIconsaxIcon } from './components/icons/essential'
export { ESSENTIAL_ICONSAX_BOLD_ICONS, getEssentialIconsaxBoldIcon } from './components/icons-bold/essential'
