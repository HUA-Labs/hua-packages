/**
 * Icon Aliases
 * 
 * 여러 이름이 같은 아이콘을 가리키도록 하는 alias 시스템
 * DX 향상을 위해 직관적인 이름들을 지원합니다.
 */

export const ICON_ALIASES: Record<string, string> = {
  // Navigation aliases
  'back': 'arrowLeft',
  'prev': 'arrowLeft',
  'previous': 'arrowLeft',
  'forward': 'arrowRight',
  'next': 'arrowRight',
  
  // Close aliases
  'close': 'x',
  'cancel': 'x',
  
  // Delete aliases
  'remove': 'delete',
  'trash': 'delete',
  
  // Add aliases
  'plus': 'add',
  'new': 'add',
  
  // Edit aliases
  'pencil': 'edit',
  'modify': 'edit',
  
  // Save aliases
  'store': 'save',
  'floppy': 'save',
  
  // Search aliases
  'magnify': 'search',
  
  // User aliases
  'person': 'user',
  'account': 'user',
  'profile': 'user',
  
  // Settings aliases
  'gear': 'settings',
  'config': 'settings',
  'preferences': 'settings',
  
  // Home aliases
  'house': 'home',
  'main': 'home',
  
  // Check aliases
  'done': 'check',
  'complete': 'check',
  'tick': 'check',
  
  // Info aliases
  'information': 'info',
  'help': 'info',
  
  // Warning aliases
  'alert': 'warning',
  'caution': 'warning',
  
  // Success aliases
  'checkmark': 'success',
  'checkCircle': 'success',
  
  // Error aliases
  'fail': 'error',
  'cross': 'error',
  'xCircle': 'error',
  
  // Loading aliases
  'spinner': 'loader',
  'loading': 'loader',
  'wait': 'loader',
  
  // Refresh aliases
  'reload': 'refresh',
  'update': 'refresh',
  'sync': 'refresh',
  
  // Eye aliases
  'show': 'eye',
  'view': 'eye',
  'hide': 'eyeOff',
  'hidden': 'eyeOff',
  
  // Lock aliases
  'secure': 'lock',
  'locked': 'lock',
  'unsecure': 'unlock',
  'unlocked': 'unlock',
  
  // Download aliases
  'get': 'download',
  'fetch': 'download',
  
  // Upload aliases
  'post': 'upload',
  
  // Share aliases
  'send': 'share',
  'export': 'share',
  
  // Copy aliases
  'duplicate': 'copy',
  'clone': 'copy',
  
  // Mail aliases
  'email': 'mail',
  'envelope': 'mail',
  
  // Message aliases
  'chat': 'message',
  'comment': 'message',
  'talk': 'message',
  
  // Calendar aliases
  'date': 'calendar',
  'schedule': 'calendar',
  
  // Clock aliases
  'time': 'clock',
  'watch': 'clock',
  
  // File aliases
  'document': 'fileText',
  'doc': 'fileText',
  'text': 'fileText',
  
  // Folder aliases
  'directory': 'folder',
  'dir': 'folder',
  
  // Image aliases
  'picture': 'image',
  'img': 'image',
  
  // Video aliases
  'movie': 'video',
  'film': 'video',
  
  // Camera aliases
  'photo': 'camera',
  'capture': 'camera',
  
  // Play aliases
  'start': 'play',
  'run': 'play',
  
  // Pause aliases
  'stop': 'pause',
  'halt': 'pause',
  
  // Heart aliases
  'like': 'heart',
  'love': 'heart',
  
  // Star aliases
  'favorite': 'star',
  
  // Bookmark aliases
  'saveBookmark': 'bookmark',
  
  // Bell aliases
  'notification': 'bell',
  'notify': 'bell',
  'alarm': 'bell',
  
  // Settings aliases
  'prefs': 'settings',
  
  // Search aliases (duplicate removed - see line 37)
  'lookup': 'search',
  
  // More aliases
  'dots': 'moreHorizontal',
  'moreMenu': 'moreHorizontal',
  'moreOptions': 'moreVertical',
  
  // External link aliases
  'external': 'externalLink',
  'outbound': 'externalLink',
  'open': 'externalLink',
  
  // Link aliases
  'url': 'link',
  'hyperlink': 'link',
  
  // Chart aliases
  'graph': 'barChart',
  'stats': 'barChart',
  'analytics': 'barChart',
  
  // Database aliases
  'db': 'database',
  'storage': 'database',
  
  // Activity aliases
  'pulse': 'activity',
  'monitor': 'activity',
  
  // Trending aliases
  'up': 'trendingUp',
  'down': 'trendingDown',
  
  // Zap aliases
  'lightning': 'zap',
  'bolt': 'zap',
  'flash': 'zap',
  
  // Shield aliases
  'security': 'shield',
  'protect': 'shield',
  
  // Key aliases
  'password': 'key',
  'secret': 'key',
  
  // Log in aliases
  'signin': 'logIn',
  'login': 'logIn',
  'enter': 'logIn',
  
  // Log out aliases
  'signout': 'logOut',
  'logout': 'logOut',
  'exit': 'logOut',
  
  // Users aliases
  'people': 'users',
  'group': 'users',
  'team': 'users',
  
  // User plus aliases
  'addUser': 'userPlus',
  'invite': 'userPlus',
  
  // Book aliases
  'read': 'book',
  'library': 'book',
  
  // Book open aliases
  'reading': 'bookOpen',
  'openBook': 'bookOpen',
  
  // Sun aliases
  'light': 'sun',
  'day': 'sun',
  
  // Moon aliases
  'dark': 'moon',
  'night': 'moon',
  
  // Monitor aliases
  'screen': 'monitor',
  'display': 'monitor',
  
  // Brain aliases
  'ai': 'brain',
  'intelligence': 'brain',
  'think': 'brain',
  
  // Lightbulb aliases
  'idea': 'lightbulb',
  'bulb': 'lightbulb',
  'inspiration': 'lightbulb',
  
  // Sparkles aliases
  'magic': 'sparkles',
  'stars': 'sparkles',
  'glitter': 'sparkles',
} as const

/**
 * Resolve icon alias to actual icon name
 * 
 * @param iconName - 아이콘 이름 또는 별칭 / Icon name or alias
 * @returns 실제 아이콘 이름 / Actual icon name
 * @throws {TypeError} iconName이 문자열이 아닌 경우
 */
export function resolveIconAlias(iconName: string): string {
  if (typeof iconName !== 'string') {
    throw new TypeError('iconName must be a string');
  }
  return ICON_ALIASES[iconName] || iconName;
}

/**
 * Get all aliases for an icon name
 * 
 * @param iconName - 아이콘 이름 / Icon name
 * @returns 해당 아이콘의 모든 별칭 배열 / Array of all aliases for the icon
 * @throws {TypeError} iconName이 문자열이 아닌 경우
 */
export function getIconAliases(iconName: string): string[] {
  if (typeof iconName !== 'string') {
    throw new TypeError('iconName must be a string');
  }
  return Object.entries(ICON_ALIASES)
    .filter(([_, target]) => target === iconName)
    .map(([alias]) => alias);
}


