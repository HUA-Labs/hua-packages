#!/usr/bin/env node

/**
 * i18n SDK 통합 테스트 스크립트
 * 모든 모드별 엔트리포인트를 테스트합니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 i18n SDK 통합 테스트 시작...\n');

// 테스트할 모드들
const modes = [
  'beginner',
  'simple', 
  'advanced',
  'debug',
  'core',
  'plugins',
  'ai'
];

// 테스트 결과 저장
const results = [];

// 각 모드별 테스트
modes.forEach(mode => {
  console.log(`📋 ${mode} 모드 테스트 중...`);
  
  try {
    // 모듈 import 테스트
    const testCode = `
const { create${mode.charAt(0).toUpperCase() + mode.slice(1)}I18n } = require('./dist/${mode}.js');
console.log('✅ ${mode} 모드 import 성공');
`;

    fs.writeFileSync(`test-${mode}.js`, testCode);
    
    // 실행 테스트
    execSync(`node test-${mode}.js`, { stdio: 'pipe' });
    
    // 임시 파일 삭제
    fs.unlinkSync(`test-${mode}.js`);
    
    results.push({ mode, status: '✅ 성공' });
    console.log(`✅ ${mode} 모드 테스트 성공\n`);
    
  } catch (error) {
    results.push({ mode, status: '❌ 실패', error: error.message });
    console.log(`❌ ${mode} 모드 테스트 실패: ${error.message}\n`);
  }
});

// 결과 요약
console.log('📊 테스트 결과 요약:');
console.log('='.repeat(50));

results.forEach(result => {
  console.log(`${result.mode.padEnd(12)} ${result.status}`);
  if (result.error) {
    console.log(`              ${result.error}`);
  }
});

console.log('='.repeat(50));

const successCount = results.filter(r => r.status.includes('성공')).length;
const totalCount = results.length;

console.log(`\n🎯 전체 결과: ${successCount}/${totalCount} 성공`);

if (successCount === totalCount) {
  console.log('🎉 모든 모드별 엔트리포인트가 정상 작동합니다!');
  process.exit(0);
} else {
  console.log('⚠️  일부 모드에서 문제가 발생했습니다.');
  process.exit(1);
} 