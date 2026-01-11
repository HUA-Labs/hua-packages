/**
 * HUA UI → HUA UX Migration Script
 *
 * 이 스크립트는 @hua-labs/ui에서 @hua-labs/hua-ux로 import를 변환하고,
 * Lucide 아이콘을 Phosphor 아이콘으로 변환합니다.
 *
 * Usage: npx ts-node scripts/migrate-hua-ui-to-ux.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Lucide → Phosphor 아이콘 매핑
const ICON_MAPPING: Record<string, string> = {
  // Navigation
  'arrowLeft': 'ArrowLeft',
  'arrowRight': 'ArrowRight',
  'arrowUp': 'ArrowUp',
  'arrowDown': 'ArrowDown',
  'chevronLeft': 'CaretLeft',
  'chevronRight': 'CaretRight',
  'chevronUp': 'CaretUp',
  'chevronDown': 'CaretDown',
  'menu': 'List',
  'x': 'X',
  'close': 'X',

  // Actions
  'download': 'DownloadSimple',
  'upload': 'UploadSimple',
  'share': 'ShareNetwork',
  'copy': 'Copy',
  'trash': 'Trash',
  'edit': 'PencilSimple',
  'plus': 'Plus',
  'minus': 'Minus',
  'check': 'Check',
  'search': 'MagnifyingGlass',
  'filter': 'Funnel',
  'settings': 'Gear',
  'refresh': 'ArrowClockwise',

  // Status
  'alertCircle': 'WarningCircle',
  'alertTriangle': 'Warning',
  'info': 'Info',
  'checkCircle': 'CheckCircle',
  'xCircle': 'XCircle',
  'loader': 'CircleNotch',

  // Objects
  'heart': 'Heart',
  'star': 'Star',
  'bookmark': 'BookmarkSimple',
  'bell': 'Bell',
  'mail': 'Envelope',
  'messageSquare': 'ChatCircle',
  'messageCircle': 'ChatCircle',
  'user': 'User',
  'users': 'Users',
  'home': 'House',
  'file': 'File',
  'folder': 'Folder',
  'image': 'Image',
  'video': 'VideoCamera',
  'music': 'MusicNotes',
  'calendar': 'Calendar',
  'clock': 'Clock',
  'map': 'MapPin',
  'phone': 'Phone',
  'camera': 'Camera',
  'mic': 'Microphone',

  // UI Elements
  'eye': 'Eye',
  'eyeOff': 'EyeSlash',
  'lock': 'Lock',
  'unlock': 'LockOpen',
  'key': 'Key',
  'link': 'Link',
  'externalLink': 'ArrowSquareOut',
  'maximize': 'ArrowsOut',
  'minimize': 'ArrowsIn',

  // Misc
  'sun': 'Sun',
  'moon': 'Moon',
  'github': 'GithubLogo',
  'twitter': 'TwitterLogo',
  'linkedin': 'LinkedinLogo',
  'facebook': 'FacebookLogo',
  'instagram': 'InstagramLogo',
  'youtube': 'YoutubeLogo',
  'globe': 'Globe',
  'code': 'Code',
  'terminal': 'Terminal',
  'database': 'Database',
  'server': 'HardDrives',
  'cpu': 'Cpu',
  'wifi': 'WifiHigh',
  'bluetooth': 'Bluetooth',
  'battery': 'Battery',
  'zap': 'Lightning',
  'layers': 'Stack',
  'layout': 'Layout',
  'grid': 'GridFour',
  'list': 'List',
  'table': 'Table',
  'barChart': 'ChartBar',
  'pieChart': 'ChartPie',
  'activity': 'Activity',
  'sparkles': 'Sparkle',
  'palette': 'Palette',
  'paintbrush': 'PaintBrush',
  'scissors': 'Scissors',
  'save': 'FloppyDisk',
  'print': 'Printer',
  'send': 'PaperPlaneRight',
  'package': 'Package',
  'gift': 'Gift',
  'shoppingCart': 'ShoppingCart',
  'creditCard': 'CreditCard',
  'wallet': 'Wallet',
  'tag': 'Tag',
  'flag': 'Flag',
  'award': 'Trophy',
  'target': 'Target',
  'crosshair': 'Crosshair',
  'compass': 'Compass',
  'navigation': 'NavigationArrow',
  'move': 'ArrowsOutCardinal',
  'rotate': 'ArrowsClockwise',
  'flip': 'FlipHorizontal',
  'crop': 'Crop',
  'type': 'TextT',
  'bold': 'TextBolder',
  'italic': 'TextItalic',
  'underline': 'TextUnderline',
  'alignLeft': 'TextAlignLeft',
  'alignCenter': 'TextAlignCenter',
  'alignRight': 'TextAlignRight',
  'alignJustify': 'TextAlignJustify',
  'indent': 'TextIndent',
  'outdent': 'TextOutdent',
  'listOrdered': 'ListNumbers',
  'listUnordered': 'ListBullets',
  'quote': 'Quotes',
  'heading': 'TextH',
  'paragraph': 'Paragraph',
  'book': 'Book',
  'bookOpen': 'BookOpen',
  'notebook': 'Notebook',
  'fileText': 'FileText',
  'archive': 'Archive',
  'box': 'Cube',
  'hexagon': 'Hexagon',
  'circle': 'Circle',
  'square': 'Square',
  'triangle': 'Triangle',
  'octagon': 'Octagon',
  'diamond': 'Diamond',
  'mousePointer': 'Cursor',
  'pointer': 'Cursor',
  'hand': 'Hand',
  'thumbsUp': 'ThumbsUp',
  'thumbsDown': 'ThumbsDown',
};

// 컴포넌트 import 변환
function transformImports(content: string): string {
  let result = content;

  // @hua-labs/ui → @hua-labs/hua-ux
  result = result.replace(
    /from ['"]@hua-labs\/ui['"]/g,
    'from \'@hua-labs/hua-ux\''
  );

  // @hua-labs/ui/advanced → @hua-labs/hua-ux
  result = result.replace(
    /from ['"]@hua-labs\/ui\/advanced['"]/g,
    'from \'@hua-labs/hua-ux\''
  );

  // @hua-labs/ui/dashboard → @hua-labs/hua-ux
  result = result.replace(
    /from ['"]@hua-labs\/ui\/dashboard['"]/g,
    'from \'@hua-labs/hua-ux\''
  );

  return result;
}

// Icon 컴포넌트 사용 변환
function transformIconUsage(content: string): string {
  let result = content;

  // Icon 컴포넌트 import 제거 (나중에 Phosphor로 대체)
  // 이 패턴은 복잡하므로 일단 주석으로 표시
  result = result.replace(
    /,?\s*Icon\s*,?/g,
    (match) => {
      // Icon만 있으면 빈 문자열, 다른 것과 함께 있으면 쉼표 처리
      if (match.trim() === 'Icon') return '';
      if (match.startsWith(',')) return '';
      if (match.endsWith(',')) return '';
      return '';
    }
  );

  // React.createElement(Icon as any, { name: "xxx", ... }) → <IconName ... />
  // 이건 복잡하므로 수동 확인 필요 표시
  if (result.includes('React.createElement(Icon')) {
    result = '// TODO: Icon 사용 수동 변환 필요\n' + result;
  }

  // <Icon name="xxx" /> 패턴 변환
  result = result.replace(
    /<Icon\s+name=["'](\w+)["']\s*(className=["'][^"']*["'])?\s*\/>/g,
    (match, iconName, classNameAttr) => {
      const phosphorName = ICON_MAPPING[iconName];
      if (phosphorName) {
        const className = classNameAttr || '';
        return `<${phosphorName} ${className} />`;
      }
      return `{/* TODO: Convert Icon name="${iconName}" */}${match}`;
    }
  );

  return result;
}

// 컴포넌트 이름 변환
function transformComponentNames(content: string): string {
  let result = content;

  // Action → Button (import와 사용 모두)
  // 이미 Button이 있으면 건너뛰기
  if (!result.includes('Button') && result.includes('Action')) {
    result = result.replace(/\bAction\b/g, 'Button');
  }

  // Panel → Card (선택적, 컨텍스트에 따라)
  // Panel은 그대로 유지 (Card와 Panel 모두 지원)

  // ComponentLayout 제거 및 대체
  if (result.includes('ComponentLayout')) {
    result = '// TODO: ComponentLayout을 Card 기반 레이아웃으로 변환 필요\n' + result;
  }

  return result;
}

// Phosphor import 추가
function addPhosphorImports(content: string, usedIcons: string[]): string {
  if (usedIcons.length === 0) return content;

  const phosphorImport = `import { ${usedIcons.join(', ')} } from '@phosphor-icons/react'`;

  // 기존 phosphor import가 있으면 병합
  if (content.includes('@phosphor-icons/react')) {
    return content.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"]@phosphor-icons\/react['"]/,
      (match, existingIcons) => {
        const existing = existingIcons.split(',').map((s: string) => s.trim()).filter(Boolean);
        const all = [...new Set([...existing, ...usedIcons])];
        return `import { ${all.join(', ')} } from '@phosphor-icons/react'`;
      }
    );
  }

  // 새로 추가
  const lines = content.split('\n');
  const lastImportIndex = lines.findLastIndex(line => line.startsWith('import '));
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, phosphorImport);
    return lines.join('\n');
  }

  return phosphorImport + '\n' + content;
}

// 파일 처리
function processFile(filePath: string): void {
  console.log(`Processing: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // 1. Import 변환
  content = transformImports(content);

  // 2. Icon 사용 변환
  content = transformIconUsage(content);

  // 3. 컴포넌트 이름 변환
  content = transformComponentNames(content);

  // 변경된 경우에만 저장
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✓ Updated`);
  } else {
    console.log(`  - No changes`);
  }
}

// 디렉토리 재귀 탐색
function processDirectory(dirPath: string): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // .next, node_modules 제외
      if (entry.name !== '.next' && entry.name !== 'node_modules') {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      // layout.tsx, page.tsx, Header.tsx, Footer.tsx는 이미 처리됨
      const skipFiles = ['layout.tsx', 'Header.tsx', 'Footer.tsx'];
      if (!skipFiles.includes(entry.name)) {
        processFile(fullPath);
      }
    }
  }
}

// 메인 실행
function main(): void {
  const targetDir = path.resolve(__dirname, '../apps/hua-ui/src/app');

  console.log('🚀 HUA UI → HUA UX Migration Script');
  console.log(`📁 Target: ${targetDir}`);
  console.log('');

  if (!fs.existsSync(targetDir)) {
    console.error(`Error: Directory not found: ${targetDir}`);
    process.exit(1);
  }

  processDirectory(targetDir);

  console.log('');
  console.log('✅ Migration complete!');
  console.log('');
  console.log('⚠️  Manual steps required:');
  console.log('   1. Check files with "TODO:" comments');
  console.log('   2. Update Icon usage to Phosphor components');
  console.log('   3. Run type-check: pnpm --filter @hua-platform/ui-site type-check');
  console.log('   4. Test the application: pnpm --filter @hua-platform/ui-site dev');
}

main();
