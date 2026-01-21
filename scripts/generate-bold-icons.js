/**
 * Bold 아이콘 생성 스크립트
 * 1. 매칭된 SVG를 별도 폴더로 복사
 * 2. React 컴포넌트 생성
 */

const fs = require('fs');
const path = require('path');

// 경로 설정
const BOLD_SVG_DIR = 'C:/Users/eutopos1/Desktop/vuesax/bold';
const OUTPUT_DIR = path.join(__dirname, '../packages/hua-ui/src/components/icons-bold');
const MATCHED_JSON = path.join(__dirname, 'matched-bold-icons.json');

// 출력 폴더 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 매칭 데이터 로드
const matched = JSON.parse(fs.readFileSync(MATCHED_JSON, 'utf-8'));
console.log(`매칭된 아이콘: ${matched.length}개`);

// SVG를 React 컴포넌트로 변환
function svgToReactComponent(svgContent, componentName) {
  // SVG 속성 변환
  let jsx = svgContent
    // width/height 제거 (props로 받음)
    .replace(/width="[^"]*"/g, '')
    .replace(/height="[^"]*"/g, '')
    // 하드코딩된 색상을 currentColor로 변환
    .replace(/fill="#[0-9A-Fa-f]{3,6}"/g, 'fill="currentColor"')
    .replace(/stroke="#[0-9A-Fa-f]{3,6}"/g, 'stroke="currentColor"')
    // class -> className
    .replace(/class=/g, 'className=')
    // stroke-width -> strokeWidth 등
    .replace(/stroke-width/g, 'strokeWidth')
    .replace(/stroke-linecap/g, 'strokeLinecap')
    .replace(/stroke-linejoin/g, 'strokeLinejoin')
    .replace(/stroke-miterlimit/g, 'strokeMiterlimit')
    .replace(/fill-rule/g, 'fillRule')
    .replace(/clip-rule/g, 'clipRule')
    .replace(/clip-path/g, 'clipPath')
    .replace(/stop-color/g, 'stopColor')
    .replace(/stop-opacity/g, 'stopOpacity')
    // viewBox 유지, 나머지 svg 속성은 props로
    .replace(/<svg([^>]*)>/, (match, attrs) => {
      const viewBoxMatch = attrs.match(/viewBox="([^"]*)"/);
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
      return `<svg viewBox="${viewBox}" fill="currentColor" {...props}>`;
    });

  return `import React from 'react';
import type { SVGProps } from 'react';

export const ${componentName} = (props: SVGProps<SVGSVGElement>) => (
  ${jsx.trim()}
);

export default ${componentName};
`;
}

// 컴포넌트 생성
let successCount = 0;
const errors = [];

for (const { linear, bold } of matched) {
  const svgPath = path.join(BOLD_SVG_DIR, `${bold}.svg`);
  const outputPath = path.join(OUTPUT_DIR, `${linear}.tsx`);

  try {
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    const component = svgToReactComponent(svgContent, linear);
    fs.writeFileSync(outputPath, component);
    successCount++;
  } catch (err) {
    errors.push({ linear, bold, error: err.message });
  }
}

console.log(`생성 완료: ${successCount}개`);
if (errors.length > 0) {
  console.log(`에러: ${errors.length}개`);
  errors.forEach(e => console.log(`  ${e.linear}: ${e.error}`));
}

// index.ts 생성
const indexContent = matched
  .map(({ linear }) => `export { ${linear} } from './${linear}';`)
  .join('\n');

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), indexContent + '\n');
console.log('index.ts 생성 완료');

// 매칭 안된 목록 출력
const unmatchedJson = path.join(__dirname, 'unmatched-bold-icons.json');
if (fs.existsSync(unmatchedJson)) {
  const unmatched = JSON.parse(fs.readFileSync(unmatchedJson, 'utf-8'));
  console.log('\n=== 매칭 안된 아이콘 (수동 확인 필요) ===');
  unmatched.forEach(({ linear }) => console.log(`- ${linear}`));
}
