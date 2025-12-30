const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/components');

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix relative imports to @hua-labs/ui
  const replacements = [
    // Utils
    [/from ['"]\.\.\/lib\/utils['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/\.\.\/lib\/utils['"]/g, "from '@hua-labs/ui'"],
    [/from ["']\.\.\/lib\/utils["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/\.\.\/lib\/utils["']/g, 'from "@hua-labs/ui"'],
    
    // Components
    [/from ['"]\.\.\/Icon['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/Button['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/Card['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/Badge['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/Drawer['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/Table['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/Dropdown['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/Tooltip['"]/g, "from '@hua-labs/ui'"],
    [/from ["']\.\.\/Icon["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/Button["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/Card["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/Badge["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/Drawer["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/Table["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/Dropdown["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/Tooltip["']/g, 'from "@hua-labs/ui"'],
    
    // Lib paths
    [/from ['"]\.\.\/\.\.\/lib\/icons['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/\.\.\/lib\/styles\/colors['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/\.\.\/lib\/styles\/variants['"]/g, "from '@hua-labs/ui'"],
    [/from ['"]\.\.\/\.\.\/lib\/types\/common['"]/g, "from '@hua-labs/ui'"],
    [/from ["']\.\.\/\.\.\/lib\/icons["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/\.\.\/lib\/styles\/colors["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/\.\.\/lib\/styles\/variants["']/g, 'from "@hua-labs/ui"'],
    [/from ["']\.\.\/\.\.\/lib\/types\/common["']/g, 'from "@hua-labs/ui"'],
  ];

  replacements.forEach(([pattern, replacement]) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Consolidate multiple imports from @hua-labs/ui
  const importLines = content.split('\n');
  const uiImports = [];
  const otherImports = [];
  let inImportBlock = false;

  for (let i = 0; i < importLines.length; i++) {
    const line = importLines[i];
    if (line.trim().startsWith('import') && line.includes('@hua-labs/ui')) {
      inImportBlock = true;
      // Extract imports
      const match = line.match(/import\s+(?:\{([^}]+)\}|([^}]+))\s+from\s+['"]@hua-labs\/ui['"]/);
      if (match) {
        const imports = match[1] || match[2];
        if (imports) {
          imports.split(',').forEach(imp => {
            const trimmed = imp.trim();
            if (trimmed && !uiImports.includes(trimmed)) {
              uiImports.push(trimmed);
            }
          });
        }
      }
    } else if (inImportBlock && line.trim() === '') {
      // End of import block
      if (uiImports.length > 0) {
        otherImports.push(`import { ${uiImports.join(', ')} } from '@hua-labs/ui';`);
        uiImports.length = 0;
      }
      otherImports.push(line);
      inImportBlock = false;
    } else {
      if (!line.includes('@hua-labs/ui')) {
        otherImports.push(line);
      }
    }
  }

  if (uiImports.length > 0) {
    otherImports.push(`import { ${uiImports.join(', ')} } from '@hua-labs/ui';`);
  }

  if (modified || uiImports.length > 0) {
    fs.writeFileSync(filePath, otherImports.join('\n'), 'utf8');
    return true;
  }

  return false;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixImports(filePath);
    }
  });
}

processDirectory(componentsDir);
console.log('Import fixes completed');
