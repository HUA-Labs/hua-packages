/**
 * Sample 폴더의 Bold SVG → 컴포넌트 생성
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_DIR = 'C:/Users/eutopos1/Desktop/sample';
const OUTPUT_DIR = path.join(__dirname, '../packages/hua-ui/src/components/icons-bold');

// 파일명 → 컴포넌트명 매핑
const fileMapping = {
  'forbidden-2.svg': 'Forbidden2',
  'import2.svg': 'Import2',
  'profile-2user.svg': 'Profile2User',
  'shield.svg': 'Shield',
  'shuffle.svg': 'Shuffle',
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
  const svgPath = path.join(SAMPLE_DIR, filename);
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
