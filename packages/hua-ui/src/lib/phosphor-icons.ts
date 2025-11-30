/**
 * Phosphor Icons - Optimized imports
 * Only imports icons that are actually used in the project
 */

// Lazy load Phosphor icons - only import when needed
export async function getPhosphorIcon(iconName: string) {
  try {
    const phosphor = await import('@phosphor-icons/react')
    
    // Map project icon names to Phosphor icon names
    const iconMap: Record<string, string> = {
      'SquaresFour': 'SquaresFour',
      'Folder': 'Folder',
      'WarningCircle': 'WarningCircle',
      'Columns': 'Columns',
      'Users': 'Users',
      'Gear': 'Gear',
      'List': 'List',
      'X': 'X',
      'CaretLeft': 'CaretLeft',
      'CaretRight': 'CaretRight',
      'Plus': 'Plus',
      'Pencil': 'Pencil',
      'Trash': 'Trash',
      'Upload': 'Upload',
      'Spinner': 'Spinner',
      'CheckCircle': 'CheckCircle',
      'ArrowClockwise': 'ArrowClockwise',
      'Bell': 'Bell',
      'User': 'User',
      'SignOut': 'SignOut',
      'ChromeLogo': 'ChromeLogo',
      'GithubLogo': 'GithubLogo',
      'ChatCircle': 'ChatCircle',
      'ChatSquare': 'ChatSquare',
      'Inbox': 'Inbox',
      'Star': 'Star',
      'Calendar': 'Calendar',
      'CheckSquare': 'CheckSquare',
      'Clock': 'Clock',
      'ArrowUp': 'ArrowUp',
      'ArrowDown': 'ArrowDown',
      'Minus': 'Minus',
      'Eye': 'Eye',
      'EyeSlash': 'EyeSlash',
    }
    
    const mappedName = iconMap[iconName] || iconName
    return (phosphor as any)[mappedName] || null
  } catch (error) {
    console.warn('Phosphor Icons not available')
    return null
  }
}

