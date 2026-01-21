/**
 * Bold 아이콘 매칭 스크립트
 * 기존 Linear 331개와 Bold SVG 972개 중 매칭되는 것 찾기
 */

const fs = require('fs');
const path = require('path');

// 경로 설정
const LINEAR_ICONS_DIR = path.join(__dirname, '../packages/hua-ui/src/components/icons');
const BOLD_SVG_DIR = 'C:/Users/eutopos1/Desktop/vuesax/bold';

// PascalCase -> kebab-case 변환
function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

// Linear 아이콘 이름 가져오기
const linearFiles = fs.readdirSync(LINEAR_ICONS_DIR)
  .filter(f => f.endsWith('.tsx') && f !== 'index.ts')
  .map(f => f.replace('.tsx', ''));

console.log(`Linear 아이콘 수: ${linearFiles.length}`);

// Bold SVG 파일 가져오기
const boldFiles = fs.readdirSync(BOLD_SVG_DIR)
  .filter(f => f.endsWith('.svg'))
  .map(f => f.replace('.svg', ''));

console.log(`Bold SVG 수: ${boldFiles.length}`);

// 매칭
const matched = [];
const notMatched = [];

for (const linear of linearFiles) {
  const kebab = toKebabCase(linear);

  // 직접 매칭
  if (boldFiles.includes(kebab)) {
    matched.push({ linear, bold: kebab });
  }
  // 숫자 처리 (예: Home2 -> home-2 또는 home2)
  else {
    const kebabWithNumber = kebab.replace(/(\d+)/g, '-$1').replace(/^-/, '').replace(/--/g, '-');
    const kebabNoHyphenNumber = kebab.replace(/-(\d+)/g, '$1');

    if (boldFiles.includes(kebabWithNumber)) {
      matched.push({ linear, bold: kebabWithNumber });
    } else if (boldFiles.includes(kebabNoHyphenNumber)) {
      matched.push({ linear, bold: kebabNoHyphenNumber });
    } else {
      notMatched.push({ linear, tried: [kebab, kebabWithNumber, kebabNoHyphenNumber] });
    }
  }
}

console.log(`\n매칭됨: ${matched.length}`);
console.log(`매칭 안됨: ${notMatched.length}`);

// 결과 저장
fs.writeFileSync(
  path.join(__dirname, 'matched-bold-icons.json'),
  JSON.stringify(matched, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, 'unmatched-bold-icons.json'),
  JSON.stringify(notMatched, null, 2)
);

console.log('\n매칭 안된 아이콘:');
notMatched.forEach(({ linear, tried }) => {
  console.log(`  ${linear} -> tried: ${tried.join(', ')}`);
});
