#!/usr/bin/env node

const { HuaSDK } = require('@hua/sdk-lite');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

async function runTests() {
  console.log(`${colors.cyan}=== HUA API SDK 테스트 ===${colors.reset}\n`);
  
  // 테스트용 API 키 (실제로는 유효한 키를 사용해야 함)
  const apiKey = process.env.HUA_API_KEY || 'test-api-key';
  
  console.log(`${colors.yellow}API 키:${colors.reset} ${apiKey}\n`);
  
  try {
    // SDK 초기화 테스트
    console.log(`${colors.cyan}1. SDK 초기화 테스트${colors.reset}`);
    const sdk = new HuaSDK(apiKey, {
      baseURL: 'https://your-domain.com' // 실제 도메인으로 변경 필요
    });
    console.log(`${colors.green}✅ SDK 초기화 성공${colors.reset}\n`);
    
    // 간단한 채팅 테스트
    console.log(`${colors.cyan}2. 간단한 채팅 테스트${colors.reset}`);
    const response = await sdk.chat({
      message: '안녕하세요!',
      userId: 'test-user'
    });
    
    if (response.success) {
      console.log(`${colors.green}✅ 채팅 테스트 성공${colors.reset}`);
      console.log(`응답: ${response.data.message}`);
      
      if (response.data.token_usage) {
        console.log(`토큰 사용량: ${response.data.token_usage.total_tokens}`);
      }
    } else {
      console.log(`${colors.red}❌ 채팅 테스트 실패:${colors.reset} ${response.error || response.message}`);
    }
    
    console.log();
    
    // 다양한 톤 테스트
    console.log(`${colors.cyan}3. 다양한 톤 테스트${colors.reset}`);
    const tones = ['gentle', 'warm', 'cheerful'];
    
    for (const tone of tones) {
      try {
        const toneResponse = await sdk.chat({
          message: '오늘 날씨가 좋네요!',
          userId: 'test-user',
          tone: tone
        });
        
        if (toneResponse.success) {
          console.log(`${colors.green}✅ ${tone} 톤 성공${colors.reset}`);
        } else {
          console.log(`${colors.red}❌ ${tone} 톤 실패:${colors.reset} ${toneResponse.error || toneResponse.message}`);
        }
      } catch (error) {
        console.log(`${colors.red}❌ ${tone} 톤 예외:${colors.reset} ${error.message}`);
      }
    }
    
    console.log();
    
    // 다양한 모드 테스트
    console.log(`${colors.cyan}4. 다양한 모드 테스트${colors.reset}`);
    const modes = ['empathy', 'analysis', 'suggestion'];
    
    for (const mode of modes) {
      try {
        const modeResponse = await sdk.chat({
          message: '스트레스가 많아요',
          userId: 'test-user',
          mode: mode
        });
        
        if (modeResponse.success) {
          console.log(`${colors.green}✅ ${mode} 모드 성공${colors.reset}`);
        } else {
          console.log(`${colors.red}❌ ${mode} 모드 실패:${colors.reset} ${modeResponse.error || modeResponse.message}`);
        }
      } catch (error) {
        console.log(`${colors.red}❌ ${mode} 모드 예외:${colors.reset} ${error.message}`);
      }
    }
    
    console.log();
    console.log(`${colors.green}=== 모든 테스트 완료 ===${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}테스트 실행 중 오류 발생:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// 환경 변수로 API 키 설정 가능
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
${colors.cyan}HUA API SDK 테스트${colors.reset}

사용법:
  node test.js                    # 기본 테스트 실행
  HUA_API_KEY=your-key node test.js  # API 키 지정하여 테스트 실행

환경 변수:
  HUA_API_KEY    HUA API 키 (필수)
`);
  process.exit(0);
}

// 테스트 실행
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 