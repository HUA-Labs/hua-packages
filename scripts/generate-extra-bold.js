/**
 * Bold 폴더에서 추가 아이콘 생성
 */

const fs = require('fs');
const path = require('path');

const BOLD_DIR = 'C:/Users/eutopos1/Desktop/vuesax/bold';
const OUTPUT_DIR = path.join(__dirname, '../packages/hua-ui/src/components/icons-bold');

// 파일명 → 컴포넌트명 매핑
const fileMapping = {
  '3dcube.svg': '3Dcube',
  'truck.svg': 'Truck',
  'profile.svg': 'Profile',
};

function svgToReactComponent(svgContent, componentName) {
  let jsx = svgContent
    .replace(/width="[^"]*"/g, '')
    .replace(/height="[^"]*"/g, '')
    .replace(/fill="#[0-9A-Fa-f]{3,6}"/g, 'fill="currentColor"')
    .replace(/stroke="#[0-9A-Fa-f]{3,6}"/g, 'stroke="currentColor"')
    .replace(/class=/g, 'className=')
    .replace(/stroke-width/g, 'strokeWidth')
    .replace(/stroke-linecap/g, 'strokeLinecap')
    .replace(/stroke-linejoin/g, 'strokeLinejoin')
    .replace(/stroke-miterlimit/g, 'strokeMiterlimit')
    .replace(/fill-rule/g, 'fillRule')
    .replace(/clip-rule/g, 'clipRule')
    .replace(/clip-path/g, 'clipPath')
    .replace(/stop-color/g, 'stopColor')
    .replace(/stop-opacity/g, 'stopOpacity')
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

// 생성
for (const [filename, componentName] of Object.entries(fileMapping)) {
  const svgPath = path.join(BOLD_DIR, filename);
  const outputPath = path.join(OUTPUT_DIR, `${componentName}.tsx`);

  if (fs.existsSync(svgPath)) {
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    const component = svgToReactComponent(svgContent, componentName);
    fs.writeFileSync(outputPath, component);
    console.log(`✓ ${componentName}`);
  } else {
    console.log(`✗ ${filename} not found`);
  }
}

console.log('\n완료!');
