#!/usr/bin/env node

/**
 * create-hua CLI Entry Point
 * 
 * This file is compiled to dist/bin/create-hua.js
 * and used as the executable when the package is installed.
 */

import { main } from '../index';

// Run the main function
main().catch((error: Error & { code?: string }) => {
  console.error('\n❌ Error:', error.message || String(error));
  
  // 에러 타입별 가이드 제공
  if (error.code === 'EACCES') {
    console.error('\n💡 Tip: 폴더 권한을 확인하세요.');
    console.error(`   chmod 755 ${process.cwd()}`);
  } else if (error.code === 'ENOENT') {
    console.error('\n💡 Tip: Node.js가 설치되어 있는지 확인하세요.');
    console.error('   node --version');
  } else if (error.message?.includes('already exists')) {
    console.error('\n💡 Tip: 다른 프로젝트 이름을 사용하거나 기존 폴더를 삭제하세요.');
  } else if (error.message?.includes('EADDRINUSE')) {
    console.error('\n💡 Tip: 포트가 이미 사용 중입니다.');
  } else {
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Node.js 버전 확인: node --version (>=18.0.0 권장)');
    console.error('   2. 폴더 권한 확인');
    console.error('   3. 디스크 공간 확인');
    console.error('   4. GitHub Issues: https://github.com/HUA-Labs/HUA-Labs-public/issues');
  }
  
  process.exit(1);
});
