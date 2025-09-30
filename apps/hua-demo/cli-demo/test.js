#!/usr/bin/env node

const { HUALite } = require('@hua-labs/api-lite');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

async function runTests() {
  console.log(`${colors.cyan}=== HUA API SDK Test ===${colors.reset}\n`);
  
  // 테스트용 API 키 (실제로는 유효한 키를 사용해야 함)
  const apiKey = process.env.HUA_API_KEY || 'test-api-key';
  
  console.log(`${colors.yellow}API Key:${colors.reset} ${apiKey}\n`);
  
  try {
    // SDK 초기화 테스트
    console.log(`${colors.cyan}1. SDK Initialization Test${colors.reset}`);
    const sdk = new HUALite(apiKey, {
      baseURL: 'https://api.hua.ai.kr', // HUA API endpoint
      endpoint: '/api/lite' // 실제 API 엔드포인트 경로
    });
    console.log(`${colors.green}✅ SDK initialization successful${colors.reset}\n`);
    
    // 간단한 채팅 테스트
    console.log(`${colors.cyan}2. Simple Chat Test${colors.reset}`);
    const response = await sdk.chat({
      message: 'Hello!',
      userId: 'test-user'
    });
    
    if (response.success) {
      console.log(`${colors.green}✅ Chat test successful${colors.reset}`);
      console.log(`Response: ${response.data.message}`);
      
      if (response.data.token_usage) {
        console.log(`Token usage: ${response.data.token_usage.total_tokens}`);
      }
    } else {
      console.log(`${colors.red}❌ Chat test failed:${colors.reset} ${response.error || response.message}`);
    }
    
    console.log();
    
    // 다양한 톤 테스트
    console.log(`${colors.cyan}3. Different Tones Test${colors.reset}`);
    const tones = ['gentle', 'warm', 'cheerful'];
    
    for (const tone of tones) {
      try {
        const toneResponse = await sdk.chat({
          message: 'The weather is nice today!',
          userId: 'test-user',
          tone: tone
        });
        
        if (toneResponse.success) {
          console.log(`${colors.green}✅ ${tone} tone successful${colors.reset}`);
        } else {
          console.log(`${colors.red}❌ ${tone} tone failed:${colors.reset} ${toneResponse.error || toneResponse.message}`);
        }
      } catch (error) {
        console.log(`${colors.red}❌ ${tone} tone exception:${colors.reset} ${error.message}`);
      }
    }
    
    console.log();
    
    // 다양한 모드 테스트
    console.log(`${colors.cyan}4. Different Modes Test${colors.reset}`);
    const modes = ['empathy', 'analysis', 'suggestion'];
    
    for (const mode of modes) {
      try {
        const modeResponse = await sdk.chat({
          message: 'I am stressed',
          userId: 'test-user',
          mode: mode
        });
        
        if (modeResponse.success) {
          console.log(`${colors.green}✅ ${mode} mode successful${colors.reset}`);
        } else {
          console.log(`${colors.red}❌ ${mode} mode failed:${colors.reset} ${modeResponse.error || modeResponse.message}`);
        }
      } catch (error) {
        console.log(`${colors.red}❌ ${mode} mode exception:${colors.reset} ${error.message}`);
      }
    }
    
    console.log();
    console.log(`${colors.green}=== All tests completed ===${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}Error occurred during test execution:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// 환경 변수로 API 키 설정 가능
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
${colors.cyan}HUA API SDK Test${colors.reset}

Usage:
  node test.js                    # Run basic tests
  HUA_API_KEY=your-key node test.js  # Run tests with API key

Environment Variables:
  HUA_API_KEY    HUA API key (required)
`);
  process.exit(0);
}

// 테스트 실행
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 