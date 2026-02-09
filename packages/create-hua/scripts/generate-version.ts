/**
 * Generate version constants from hua package.json
 * 
 * 빌드 시점에 hua 패키지의 버전을 읽어서 상수 파일을 생성합니다.
 * 이렇게 하면 npm 배포 후에도 올바른 버전을 사용할 수 있습니다.
 */

import * as fs from 'fs';
import * as path from 'path';

const HUA_PACKAGE_JSON = path.resolve(__dirname, '../../hua/package.json');
const VERSION_OUTPUT = path.resolve(__dirname, '../src/version.ts');

function generateVersionFile(): void {
  // hua 패키지의 package.json 읽기
  if (!fs.existsSync(HUA_PACKAGE_JSON)) {
    console.warn(`⚠️  ${HUA_PACKAGE_JSON} not found. Using default version.`);
    // 기본 버전으로 파일 생성
    const defaultVersion = '0.1.0';
    const relativePath = path.relative(path.dirname(VERSION_OUTPUT), HUA_PACKAGE_JSON).replace(/\\/g, '/');
    const content = `/**
 * This file is auto-generated at build time.
 * Do not edit manually.
 * 
 * Generated from: ${relativePath}
 */

export const HUA_VERSION = '^${defaultVersion}';
`;
    fs.writeFileSync(VERSION_OUTPUT, content, 'utf-8');
    return;
  }

  const huaPackage = JSON.parse(fs.readFileSync(HUA_PACKAGE_JSON, 'utf-8'));
  const version = huaPackage.version;

  if (!version) {
    throw new Error(`Version not found in ${HUA_PACKAGE_JSON}`);
  }

  // 버전 앞에 ^ 추가 (예: 0.1.0 -> ^0.1.0)
  const versionWithCaret = `^${version}`;

  // 상대 경로 계산 (포트 가능성을 위해)
  const relativePath = path.relative(path.dirname(VERSION_OUTPUT), HUA_PACKAGE_JSON).replace(/\\/g, '/');

  // TypeScript 파일 생성
  const content = `/**
 * This file is auto-generated at build time.
 * Do not edit manually.
 * 
 * Generated from: ${relativePath}
 * Source version: ${version}
 */

export const HUA_VERSION = '${versionWithCaret}';
`;

  fs.writeFileSync(VERSION_OUTPUT, content, 'utf-8');
  console.log(`✅ Generated version file: ${VERSION_OUTPUT} (version: ${versionWithCaret})`);
}

// 실행
try {
  generateVersionFile();
} catch (error) {
  console.error('❌ Error generating version file:', error);
  process.exit(1);
}
