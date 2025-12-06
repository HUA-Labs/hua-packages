/**
 * IconName 타입 자동 생성 스크립트
 * 
 * icons.ts 파일을 스캔하여 IconName 타입을 자동으로 생성합니다.
 * 
 * 사용법:
 *   pnpm tsx scripts/generate-icon-types.ts
 * 
 * 또는 package.json에 추가:
 *   "scripts": {
 *     "generate:icon-types": "tsx scripts/generate-icon-types.ts"
 *   }
 */

import * as fs from 'fs'
import * as path from 'path'

const ICONS_FILE = path.join(__dirname, '../src/lib/icons.ts')
const OUTPUT_FILE = path.join(__dirname, '../src/lib/icon-names.generated.ts')

interface IconDefinition {
  name: string
  line: number
}

function extractIconNames(content: string): IconDefinition[] {
  const icons: IconDefinition[] = []
  const lines = content.split('\n')
  
  // icons 객체 내부의 키 추출
  let inIconsObject = false
  let braceDepth = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // icons 객체 시작 감지
    if (line.includes('export const icons = {')) {
      inIconsObject = true
      braceDepth = 1
      continue
    }
    
    if (inIconsObject) {
      // 중괄호 깊이 추적
      braceDepth += (line.match(/{/g) || []).length
      braceDepth -= (line.match(/}/g) || []).length
      
      // icons 객체 종료
      if (braceDepth === 0) {
        break
      }
      
      // 키 추출: 'keyName': 또는 keyName: 패턴
      const keyMatch = line.match(/^\s*['"]?([a-zA-Z0-9_-]+)['"]?\s*:/)
      if (keyMatch) {
        const iconName = keyMatch[1]
        // 주석이나 빈 줄 제외
        if (!iconName.startsWith('//') && iconName.trim()) {
          icons.push({
            name: iconName,
            line: i + 1
          })
        }
      }
    }
  }
  
  return icons
}

function generateTypeFile(icons: IconDefinition[]): string {
  const iconNames = icons.map(icon => `  '${icon.name}'`).join(' |\n')
  
  return `/**
 * IconName 타입 (자동 생성)
 * 
 * 이 파일은 scripts/generate-icon-types.ts에 의해 자동 생성됩니다.
 * 수동으로 수정하지 마세요.
 * 
 * 생성일: ${new Date().toISOString()}
 * 아이콘 개수: ${icons.length}
 */

export type IconName =
${iconNames}

export const iconNames = [
${icons.map(icon => `  '${icon.name}'`).join(',\n')}
] as const

export type IconNameType = typeof iconNames[number]

// 타입 검증: IconName과 iconNames가 일치하는지 확인
type AssertIconName = IconName extends IconNameType ? true : never
type AssertIconNameType = IconNameType extends IconName ? true : never
`
}

function main() {
  try {
    console.log('📦 IconName 타입 생성 시작...')
    
    // icons.ts 파일 읽기
    const content = fs.readFileSync(ICONS_FILE, 'utf-8')
    
    // 아이콘 이름 추출
    const icons = extractIconNames(content)
    
    if (icons.length === 0) {
      console.error('❌ 아이콘을 찾을 수 없습니다.')
      process.exit(1)
    }
    
    console.log(`✅ ${icons.length}개의 아이콘 발견`)
    
    // 타입 파일 생성
    const typeContent = generateTypeFile(icons)
    
    // 파일 쓰기
    fs.writeFileSync(OUTPUT_FILE, typeContent, 'utf-8')
    
    console.log(`✅ 타입 파일 생성 완료: ${OUTPUT_FILE}`)
    console.log(`📊 통계:`)
    console.log(`   - 총 아이콘: ${icons.length}`)
    console.log(`   - 파일 위치: ${path.relative(process.cwd(), OUTPUT_FILE)}`)
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

main()

