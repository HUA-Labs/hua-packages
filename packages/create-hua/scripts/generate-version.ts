/**
 * Generate version constants from hua package.json
 * 
 * 빌드 시점에 hua 패키지의 버전을 읽어서 상수 파일을 생성합니다.
 * 이렇게 하면 npm 배포 후에도 올바른 버전을 사용할 수 있습니다.
 */

import * as fs from 'fs';
import * as path from 'path';

const HUA_PACKAGE_JSON = path.resolve(__dirname, '../../hua/package.json');
const UI_PACKAGE_JSON = path.resolve(__dirname, '../../hua-ui/package.json');
const VERSION_OUTPUT = path.resolve(__dirname, '../src/version.ts');

function readVersion(packageJsonPath: string, fallback: string): string {
  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`⚠️  ${packageJsonPath} not found. Using default version: ${fallback}`);
    return fallback;
  }
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  if (!pkg.version) {
    throw new Error(`Version not found in ${packageJsonPath}`);
  }
  return pkg.version;
}

function generateVersionFile(): void {
  const huaVersion = readVersion(HUA_PACKAGE_JSON, '0.1.0');
  const uiVersion = readVersion(UI_PACKAGE_JSON, '0.1.0');

  const huaRelPath = path.relative(path.dirname(VERSION_OUTPUT), HUA_PACKAGE_JSON).replace(/\\/g, '/');
  const uiRelPath = path.relative(path.dirname(VERSION_OUTPUT), UI_PACKAGE_JSON).replace(/\\/g, '/');

  // TypeScript 파일 생성
  const content = `/**
 * This file is auto-generated at build time.
 * Do not edit manually.
 *
 * Generated from: ${huaRelPath} (v${huaVersion}), ${uiRelPath} (v${uiVersion})
 */

export const HUA_VERSION = '^${huaVersion}';
export const UI_VERSION = '^${uiVersion}';
`;

  fs.writeFileSync(VERSION_OUTPUT, content, 'utf-8');
  console.log(`✅ Generated version file: HUA=^${huaVersion}, UI=^${uiVersion}`);
}

// 실행
try {
  generateVersionFile();
} catch (error) {
  console.error('❌ Error generating version file:', error);
  process.exit(1);
}
