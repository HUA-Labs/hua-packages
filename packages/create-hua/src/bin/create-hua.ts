#!/usr/bin/env node

/**
 * create-hua CLI Entry Point
 *
 * This file is compiled to dist/bin/create-hua.js
 * and used as the executable when the package is installed.
 */

import { main } from '../index';

const isEn = process.env.LANG === 'en' || process.env.CLI_LANG === 'en' || process.argv.includes('--english-only');

main().catch((error: Error & { code?: string }) => {
  console.error('\nError:', error.message || String(error));

  if (error.code === 'EACCES') {
    console.error(
      isEn
        ? '\nTip: Check folder permissions.'
        : '\nTip: 폴더 권한을 확인하세요.'
    );
    console.error(`   chmod 755 ${process.cwd()}`);
  } else if (error.code === 'ENOENT') {
    console.error(
      isEn
        ? '\nTip: Make sure Node.js is installed.'
        : '\nTip: Node.js가 설치되어 있는지 확인하세요.'
    );
    console.error('   node --version');
  } else if (error.message?.includes('already exists')) {
    console.error(
      isEn
        ? '\nTip: Use a different project name or remove the existing folder.'
        : '\nTip: 다른 프로젝트 이름을 사용하거나 기존 폴더를 삭제하세요.'
    );
  } else {
    console.error(
      isEn
        ? '\nTroubleshooting:'
        : '\nTroubleshooting / 문제 해결:'
    );
    console.error(`   1. ${isEn ? 'Check Node.js version' : 'Node.js 버전 확인'}: node --version (>=22.0.0)`);
    console.error(`   2. ${isEn ? 'Check folder permissions' : '폴더 권한 확인'}`);
    console.error(`   3. ${isEn ? 'Check disk space' : '디스크 공간 확인'}`);
    console.error('   4. GitHub Issues: https://github.com/HUA-Labs/HUA-Labs-public/issues');
  }

  process.exit(1);
});
