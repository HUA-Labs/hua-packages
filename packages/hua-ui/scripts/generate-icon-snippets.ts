/**
 * Icon 스니펫 자동 생성 스크립트
 * 
 * PROJECT_ICONS와 icons.ts를 기반으로 VS Code 스니펫을 자동 생성합니다.
 * 
 * 사용법:
 *   pnpm tsx scripts/generate-icon-snippets.ts
 */

import * as fs from 'fs'
import * as path from 'path'

const ICONS_FILE = path.join(__dirname, '../src/lib/icons.ts')
const ICON_PROVIDERS_FILE = path.join(__dirname, '../src/lib/icon-providers.ts')
const OUTPUT_FILE = path.join(__dirname, '../.vscode/hua-ui-icons.code-snippets')

interface IconMapping {
  lucide: string
  phosphor: string
  untitled: string
}

function extractProjectIcons(content: string): Record<string, IconMapping> {
  const icons: Record<string, IconMapping> = {}
  
  // PROJECT_ICONS 객체 추출
  const projectIconsMatch = content.match(/export const PROJECT_ICONS = \{([\s\S]*?)\} as const/)
  if (!projectIconsMatch) return icons
  
  const projectIconsContent = projectIconsMatch[1]
  
  // 각 아이콘 매핑 추출
  const iconPattern = /['"]([^'"]+)['"]:\s*\{\s*lucide:\s*['"]([^'"]+)['"],\s*phosphor:\s*['"]([^'"]+)['"],\s*untitled:\s*['"]([^'"]+)['"]\s*\}/g
  let match
  
  while ((match = iconPattern.exec(projectIconsContent)) !== null) {
    const [, iconName, lucide, phosphor, untitled] = match
    icons[iconName] = { lucide, phosphor, untitled }
  }
  
  return icons
}

function extractIconsFromIconsFile(content: string): string[] {
  const iconNames: string[] = []
  
  // icons 객체 추출
  const iconsMatch = content.match(/export const icons = \{([\s\S]*?)\}/)
  if (!iconsMatch) return iconNames
  
  const iconsContent = iconsMatch[1]
  
  // 키 추출: 'keyName': 또는 keyName: 패턴
  const keyPattern = /^\s*['"]?([a-zA-Z0-9_-]+)['"]?\s*:/gm
  let match
  
  while ((match = keyPattern.exec(iconsContent)) !== null) {
    const iconName = match[1]
    if (iconName && !iconName.startsWith('//') && iconName.trim()) {
      iconNames.push(iconName)
    }
  }
  
  return [...new Set(iconNames)].sort()
}

function generateSnippets(projectIcons: Record<string, IconMapping>, iconNames: string[]): string {
  const allIconNames = [...new Set([...Object.keys(projectIcons), ...iconNames])].sort()
  const iconNameList = allIconNames.join(',')
  
  return `{
  "Icon Component - Basic": {
    "prefix": "huaicon",
    "body": [
      "<Icon name=\\"\\${1|${iconNameList}|}\\" \\${2|size,className,variant,provider,weight|}\\${3:=\\{\\$4\\}} />"
    ],
    "description": "HUA UI - Icon component"
  },
  "Icon Component - With Size": {
    "prefix": "huaiconsize",
    "body": [
      "<Icon name=\\"\\${1|${iconNameList}|}\\" size=\\{\\${2:20}\\} className=\\"\\${3}\\" />"
    ],
    "description": "HUA UI - Icon with size"
  },
  "Icon Component - With Provider": {
    "prefix": "huaiconprov",
    "body": [
      "<Icon name=\\"\\${1|${iconNameList}|}\\" provider=\\"\\${2|lucide,phosphor,untitled|}\\" \\${3|size,className,variant,weight|}\\${4:=\\{\\$5\\}} />"
    ],
    "description": "HUA UI - Icon with provider"
  },
  "Icon Component - Animated": {
    "prefix": "huaiconanime",
    "body": [
      "<Icon name=\\"\\${1|loader,refresh,heart,star|}\\" \\${2|spin,pulse,bounce,animated|}\\${3:=\\{true\\}} />"
    ],
    "description": "HUA UI - Animated Icon"
  },
  "Icon Component - Status": {
    "prefix": "huaiconstatus",
    "body": [
      "<Icon status=\\"\\${1|loading,success,error,warning,info,locked,unlocked,visible,hidden|}\\" \\${2|spin,variant|}\\${3:=\\{\\$4\\}} />"
    ],
    "description": "HUA UI - Status Icon"
  },
  "Icon Component - Emotion": {
    "prefix": "huaiconemotion",
    "body": [
      "<Icon emotion=\\"\\${1|happy,sad,neutral,excited,angry,love,like,dislike|}\\" size=\\{\\${2:20}\\} />"
    ],
    "description": "HUA UI - Emotion Icon"
  },
  "IconProvider - Setup": {
    "prefix": "huaiconprovider",
    "body": [
      "<IconProvider",
      "  set=\\"\\${1|phosphor,lucide,untitled|}\\"",
      "  weight=\\"\\${2|thin,light,regular,bold,duotone,fill|}\\"",
      "  size=\\{\\${3:20}\\}",
      "  color=\\"\\${4:currentColor}\\"",
      ">",
      "  \\${5:// Your app content}",
      "</IconProvider>"
    ],
    "description": "HUA UI - IconProvider setup"
  },
  "Icon - Provider Names Reference": {
    "prefix": "huaiconref",
    "body": [
      "// Icon Name: \\${1:iconName}",
      "// Lucide: \\${2:lucideName}",
      "// Phosphor: \\${3:phosphorName}",
      "// Untitled: \\${4:untitledName}",
      "",
      "<Icon name=\\"\\${1:iconName}\\" provider=\\"\\${5|lucide,phosphor,untitled|}\\" />"
    ],
    "description": "HUA UI - Icon with provider name reference"
  }
}`
}

function main() {
  try {
    console.log('📦 Icon 스니펫 생성 시작...')
    
    // icon-providers.ts 읽기
    const providersContent = fs.readFileSync(ICON_PROVIDERS_FILE, 'utf-8')
    const projectIcons = extractProjectIcons(providersContent)
    
    console.log(`✅ PROJECT_ICONS에서 ${Object.keys(projectIcons).length}개 아이콘 발견`)
    
    // icons.ts 읽기
    const iconsContent = fs.readFileSync(ICONS_FILE, 'utf-8')
    const iconNames = extractIconsFromIconsFile(iconsContent)
    
    console.log(`✅ icons.ts에서 ${iconNames.length}개 아이콘 발견`)
    
    // 스니펫 생성
    const snippets = generateSnippets(projectIcons, iconNames)
    
    // .vscode 디렉토리 생성
    const vscodeDir = path.dirname(OUTPUT_FILE)
    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir, { recursive: true })
    }
    
    // 파일 쓰기
    fs.writeFileSync(OUTPUT_FILE, snippets, 'utf-8')
    
    console.log(`✅ 스니펫 파일 생성 완료: ${OUTPUT_FILE}`)
    console.log(`📊 통계:`)
    console.log(`   - 총 아이콘: ${[...new Set([...Object.keys(projectIcons), ...iconNames])].length}`)
    console.log(`   - PROJECT_ICONS: ${Object.keys(projectIcons).length}`)
    console.log(`   - icons.ts: ${iconNames.length}`)
    console.log(`   - 파일 위치: ${path.relative(process.cwd(), OUTPUT_FILE)}`)
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

main()


