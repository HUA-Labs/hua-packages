#!/usr/bin/env node

const { HUALite } = require('@hua-labs/api-lite');
const readline = require('readline');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// 로고 출력
function printLogo() {
  console.log(`
${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    ██╗  ██╗██╗   ██╗ █████╗     █████╗ ██████╗ ██╗        ║
║    ██║  ██║██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██║        ║
║    ███████║██║   ██║███████║    ███████║██████╔╝██║        ║
║    ██╔══██║██║   ██║██╔══██║    ██╔══██║██╔═══╝ ██║        ║
║    ██║  ██║╚██████╔╝██║  ██║    ██║  ██║██║     ███████╗   ║
║    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝     ╚══════╝   ║
║                                                              ║
║                    감정 인식 AI 챗봇 API 데모                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

// 메뉴 출력
function printMenu() {
  console.log(`
${colors.yellow}${colors.bright}=== HUA API Demo ===${colors.reset}
${colors.cyan}1.${colors.reset} 간단한 채팅 테스트
${colors.cyan}2.${colors.reset} 다양한 톤으로 테스트
${colors.cyan}3.${colors.reset} 다양한 모드로 테스트
${colors.cyan}4.${colors.reset} 토큰 사용량 확인
${colors.cyan}5.${colors.reset} 에러 처리 테스트
${colors.cyan}6.${colors.reset} 대화형 채팅
${colors.cyan}0.${colors.reset} 종료

${colors.green}선택하세요:${colors.reset} `);
}

// 사용자 입력 받기
function getUserInput(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// API 키 입력 받기
async function getApiKey() {
  console.log(`\n${colors.yellow}HUA API 키를 입력하세요:${colors.reset}`);
  console.log(`${colors.cyan}API 키가 없다면:${colors.reset} https://api.hua.ai.kr/api-key 에서 발급받으세요\n`);
  
  const apiKey = await getUserInput(`${colors.green}HUA API Key:${colors.reset} `);
  
  if (!apiKey.trim()) {
    console.log(`${colors.red}API 키가 필요합니다!${colors.reset}\n`);
    return null;
  }
  
  // GPT API 키 입력 (선택사항)
  console.log(`\n${colors.yellow}선택사항: 실제 GPT 응답을 위해 OpenAI API 키를 입력하세요${colors.reset}`);
  console.log(`${colors.cyan}비워두면 목업 응답을 사용합니다 (토큰 사용량 없음)${colors.reset}\n`);
  
  const gptApiKey = await getUserInput(`${colors.green}OpenAI API Key (선택사항):${colors.reset} `);
  
  // 언어 선택
  console.log(`\n${colors.yellow}응답 언어를 선택하세요:${colors.reset}`);
  console.log(`${colors.cyan}1.${colors.reset} 한국어 (ko) - Korean`);
  console.log(`${colors.cyan}2.${colors.reset} 영어 (en) - English`);
  
  const langChoice = await getUserInput(`${colors.green}언어 선택 (1-2, 기본값: 1):${colors.reset} `);
  const lang = langChoice === '2' ? 'en' : 'ko';
  
  return { 
    apiKey: apiKey.trim(), 
    gptApiKey: gptApiKey.trim() || null,
    lang: lang
  };
}

// SDK 초기화
function initSDK(apiKey) {
  return new HUALite(apiKey, {
    baseUrl: 'https://api.hua.ai.kr'
  });
}

// 간단한 채팅 테스트
async function simpleChatTest(sdk, gptApiKey = null, lang = 'ko') {
  console.log(`\n${colors.cyan}=== 간단한 채팅 테스트 ===${colors.reset}\n`);
  
  const message = await getUserInput(`${colors.green}메시지를 입력하세요:${colors.reset} `);
  
  if (!message.trim()) {
    console.log(`${colors.red}메시지를 입력해주세요!${colors.reset}\n`);
    return;
  }
  
  try {
    console.log(`\n${colors.yellow}AI 응답을 기다리는 중 (언어: ${lang})...${colors.reset}\n`);
    
    const chatRequest = {
      message: message,
      userId: 'demo-user',
      lang: lang
    };
    
    // GPT API 키가 있으면 추가
    if (gptApiKey) {
      chatRequest.llmApiKey = gptApiKey;
    }
    
    const response = await sdk.chat(chatRequest);
    
    if (response.success) {
      console.log(`${colors.green}✅ 성공!${colors.reset}`);
      console.log(`${colors.cyan}AI 응답:${colors.reset} ${response.data.message}\n`);
      
      if (response.data.token_usage) {
        console.log(`${colors.magenta}토큰 사용량:${colors.reset}`);
        console.log(`  - Prompt: ${response.data.token_usage.prompt_tokens}`);
        console.log(`  - Completion: ${response.data.token_usage.completion_tokens}`);
        console.log(`  - Total: ${response.data.token_usage.total_tokens}\n`);
      }
    } else {
      console.log(`${colors.red}❌ 오류:${colors.reset} ${response.error || response.message}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ 예외 발생:${colors.reset} ${error.message}\n`);
  }
}

// 다양한 톤으로 테스트
async function toneTest(sdk, gptApiKey = null, lang = 'ko') {
  console.log(`\n${colors.cyan}=== 다양한 톤으로 테스트 ===${colors.reset}\n`);
  
  const message = await getUserInput(`${colors.green}테스트할 메시지를 입력하세요:${colors.reset} `);
  
  if (!message.trim()) {
    console.log(`${colors.red}메시지를 입력해주세요!${colors.reset}\n`);
    return;
  }
  
  const tones = ['gentle', 'warm', 'cheerful', 'quirky', 'delicate'];
  const toneNames = {
    gentle: '부드러운',
    warm: '따뜻한',
    cheerful: '활기찬',
    quirky: '특이한',
    delicate: '섬세한'
  };
  
  for (const tone of tones) {
    try {
      console.log(`\n${colors.yellow}${toneNames[tone]} 톤으로 테스트 중...${colors.reset}`);
      
      const chatRequest = {
        message: message,
        userId: 'demo-user',
        tone: tone,
        lang: lang
      };
      
      // GPT API 키가 있으면 추가
      if (gptApiKey) {
        chatRequest.llmApiKey = gptApiKey;
      }
      
      const response = await sdk.chat(chatRequest);
      
      if (response.success) {
        console.log(`${colors.green}✅ ${toneNames[tone]} 톤:${colors.reset} ${response.data.message}`);
      } else {
        console.log(`${colors.red}❌ ${toneNames[tone]} 톤 오류:${colors.reset} ${response.error || response.message}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${toneNames[tone]} 톤 예외:${colors.reset} ${error.message}`);
    }
  }
  console.log();
}

// 다양한 모드로 테스트
async function modeTest(sdk, gptApiKey = null, lang = 'ko') {
  console.log(`\n${colors.cyan}=== 다양한 모드로 테스트 ===${colors.reset}\n`);
  
  const message = await getUserInput(`${colors.green}테스트할 메시지를 입력하세요:${colors.reset} `);
  
  if (!message.trim()) {
    console.log(`${colors.red}메시지를 입력해주세요!${colors.reset}\n`);
    return;
  }
  
  const modes = ['empathy', 'analysis', 'suggestion', 'praise', 'playful'];
  const modeNames = {
    empathy: '공감',
    analysis: '분석',
    suggestion: '제안',
    praise: '칭찬',
    playful: '장난스러운'
  };
  
  for (const mode of modes) {
    try {
      console.log(`\n${colors.yellow}${modeNames[mode]} 모드로 테스트 중...${colors.reset}`);
      
      const chatRequest = {
        message: message,
        userId: 'demo-user',
        mode: mode,
        lang: lang
      };
      
      // GPT API 키가 있으면 추가
      if (gptApiKey) {
        chatRequest.llmApiKey = gptApiKey;
      }
      
      const response = await sdk.chat(chatRequest);
      
      if (response.success) {
        console.log(`${colors.green}✅ ${modeNames[mode]} 모드:${colors.reset} ${response.data.message}`);
      } else {
        console.log(`${colors.red}❌ ${modeNames[mode]} 모드 오류:${colors.reset} ${response.error || response.message}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${modeNames[mode]} 모드 예외:${colors.reset} ${error.message}`);
    }
  }
  console.log();
}

// 토큰 사용량 확인
async function tokenUsageTest(sdk, gptApiKey = null, lang = 'ko') {
  console.log(`\n${colors.cyan}=== 토큰 사용량 확인 ===${colors.reset}\n`);
  
  const message = await getUserInput(`${colors.green}테스트할 메시지를 입력하세요:${colors.reset} `);
  
  if (!message.trim()) {
    console.log(`${colors.red}메시지를 입력해주세요!${colors.reset}\n`);
    return;
  }
  
  try {
    console.log(`\n${colors.yellow}토큰 사용량을 확인하는 중 (언어: ${lang})...${colors.reset}\n`);
    
    const chatRequest = {
      message: message,
      userId: 'demo-user',
      lang: lang
    };
    
    // GPT API 키가 있으면 추가
    if (gptApiKey) {
      chatRequest.llmApiKey = gptApiKey;
    }
    
    const response = await sdk.chat(chatRequest);
    
    if (response.success && response.data.token_usage) {
      console.log(`${colors.green}✅ 토큰 사용량:${colors.reset}`);
      console.log(`  - Prompt Tokens: ${colors.cyan}${response.data.token_usage.prompt_tokens}${colors.reset}`);
      console.log(`  - Completion Tokens: ${colors.cyan}${response.data.token_usage.completion_tokens}${colors.reset}`);
      console.log(`  - Total Tokens: ${colors.cyan}${response.data.token_usage.total_tokens}${colors.reset}`);
      console.log(`  - 예상 비용: ${colors.yellow}약 ${(response.data.token_usage.total_tokens * 0.000002).toFixed(6)} USD${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ 토큰 사용량 정보를 가져올 수 없습니다.${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ 예외 발생:${colors.reset} ${error.message}\n`);
  }
}

// 에러 처리 테스트
async function errorTest(sdk) {
  console.log(`\n${colors.cyan}=== 에러 처리 테스트 ===${colors.reset}\n`);
  
  console.log(`${colors.yellow}다양한 에러 상황을 테스트합니다...${colors.reset}\n`);
  
  // 1. 빈 메시지
  console.log(`${colors.magenta}1. 빈 메시지 테스트:${colors.reset}`);
  try {
    const response = await sdk.chat({
      message: '',
      userId: 'demo-user'
    });
    console.log(`결과: ${response.success ? '성공' : '실패'} - ${response.error || response.message}`);
  } catch (error) {
    console.log(`예외: ${error.message}`);
  }
  
  // 2. 잘못된 API 키
  console.log(`\n${colors.magenta}2. 잘못된 API 키 테스트:${colors.reset}`);
  const wrongSDK = new HUALite('wrong-api-key');
  try {
    const response = await wrongSDK.chat({
      message: '테스트',
      userId: 'demo-user'
    });
    console.log(`결과: ${response.success ? '성공' : '실패'} - ${response.error || response.message}`);
  } catch (error) {
    console.log(`예외: ${error.message}`);
  }
  
  // 3. 네트워크 오류 시뮬레이션
  console.log(`\n${colors.magenta}3. 네트워크 오류 시뮬레이션:${colors.reset}`);
  const offlineSDK = new HUALite('test-key', {
    baseUrl: 'https://api.hua.ai.kr'
  });
  try {
    const response = await offlineSDK.chat({
      message: '테스트',
      userId: 'demo-user'
    });
    console.log(`결과: ${response.success ? '성공' : '실패'} - ${response.error || response.message}`);
  } catch (error) {
    console.log(`예외: ${error.message}`);
  }
  
  console.log();
}

// 대화형 채팅
async function interactiveChat(sdk, gptApiKey = null, lang = 'ko') {
  console.log(`\n${colors.cyan}=== 대화형 채팅 ===${colors.reset}\n`);
  console.log(`${colors.yellow}대화를 시작합니다. 'quit' 또는 'exit'를 입력하면 종료됩니다.${colors.reset}\n`);
  
  let conversationCount = 0;
  
  while (true) {
    const message = await getUserInput(`${colors.green}You:${colors.reset} `);
    
    if (message.toLowerCase() === 'quit' || message.toLowerCase() === 'exit') {
      console.log(`\n${colors.yellow}대화를 종료합니다. 총 ${conversationCount}번의 대화를 나누었습니다.${colors.reset}\n`);
      break;
    }
    
    if (!message.trim()) {
      console.log(`${colors.red}메시지를 입력해주세요!${colors.reset}\n`);
      continue;
    }
    
    try {
      console.log(`\n${colors.yellow}AI가 응답을 생성하는 중 (언어: ${lang})...${colors.reset}\n`);
      
      const chatRequest = {
        message: message,
        userId: 'demo-user',
        lang: lang
      };
      
      // GPT API 키가 있으면 추가
      if (gptApiKey) {
        chatRequest.llmApiKey = gptApiKey;
      }
      
      const response = await sdk.chat(chatRequest);
      
      if (response.success) {
        console.log(`${colors.cyan}AI:${colors.reset} ${response.data.message}\n`);
        conversationCount++;
        
        if (response.data.token_usage) {
          console.log(`${colors.magenta}[토큰: ${response.data.token_usage.total_tokens}]${colors.reset}\n`);
        }
      } else {
        console.log(`${colors.red}❌ 오류:${colors.reset} ${response.error || response.message}\n`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ 예외 발생:${colors.reset} ${error.message}\n`);
    }
  }
}

// 메인 함수
async function main() {
  printLogo();
  
  const apiKeyInfo = await getApiKey();
  if (!apiKeyInfo) {
    console.log(`${colors.red}API 키가 필요합니다. 프로그램을 종료합니다.${colors.reset}\n`);
    process.exit(1);
  }
  
  const sdk = initSDK(apiKeyInfo.apiKey);
  console.log(`${colors.green}✅ SDK가 초기화되었습니다!${colors.reset}`);
  
  if (apiKeyInfo.gptApiKey) {
    console.log(`${colors.cyan}✅ OpenAI API 키 제공됨 - 실제 GPT 응답 활성화${colors.reset}`);
  } else {
    console.log(`${colors.yellow}ℹ️  OpenAI API 키 없음 - 목업 응답 사용 (토큰 사용량 없음)${colors.reset}`);
  }
  console.log(`${colors.cyan}🌐 응답 언어: ${apiKeyInfo.lang === 'en' ? '영어' : '한국어'}${colors.reset}`);
  console.log();
  
  while (true) {
    printMenu();
    const choice = await getUserInput('');
    
    switch (choice.trim()) {
      case '1':
        await simpleChatTest(sdk, apiKeyInfo.gptApiKey, apiKeyInfo.lang);
        break;
      case '2':
        await toneTest(sdk, apiKeyInfo.gptApiKey, apiKeyInfo.lang);
        break;
      case '3':
        await modeTest(sdk, apiKeyInfo.gptApiKey, apiKeyInfo.lang);
        break;
      case '4':
        await tokenUsageTest(sdk, apiKeyInfo.gptApiKey, apiKeyInfo.lang);
        break;
      case '5':
        await errorTest(sdk);
        break;
      case '6':
        await interactiveChat(sdk, apiKeyInfo.gptApiKey, apiKeyInfo.lang);
        break;
      case '0':
        console.log(`\n${colors.green}데모를 종료합니다. 감사합니다! 👋${colors.reset}\n`);
        process.exit(0);
      default:
        console.log(`\n${colors.red}잘못된 선택입니다. 다시 선택해주세요.${colors.reset}\n`);
    }
    
    await getUserInput(`${colors.yellow}계속하려면 Enter를 누르세요...${colors.reset}`);
  }
}

// 프로그램 실행
if (require.main === module) {
  main().catch((error) => {
    console.error(`${colors.red}프로그램 실행 중 오류가 발생했습니다:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = {
  simpleChatTest,
  toneTest,
  modeTest,
  tokenUsageTest,
  errorTest,
  interactiveChat
}; 