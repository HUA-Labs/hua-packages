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
║                Emotion Recognition AI Chatbot API Demo       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

// 메뉴 출력
function printMenu() {
  console.log(`
${colors.yellow}${colors.bright}=== HUA API Demo ===${colors.reset}
${colors.cyan}1.${colors.reset} Simple Chat Test
${colors.cyan}2.${colors.reset} Test Different Tones
${colors.cyan}3.${colors.reset} Test Different Modes
${colors.cyan}4.${colors.reset} Check Token Usage
${colors.cyan}5.${colors.reset} Error Handling Test
${colors.cyan}6.${colors.reset} Interactive Chat
${colors.cyan}0.${colors.reset} Exit

${colors.green}Select:${colors.reset} `);
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
  console.log(`\n${colors.yellow}Enter your HUA API key:${colors.reset}`);
  console.log(`${colors.cyan}Don't have an API key?${colors.reset} Get one from https://api.hua.ai.kr/api-key\n`);
  
  const apiKey = await getUserInput(`${colors.green}HUA API Key:${colors.reset} `);
  
  if (!apiKey.trim()) {
    console.log(`${colors.red}API key is required!${colors.reset}\n`);
    return null;
  }
  
  // GPT API 키 입력 (선택사항)
  console.log(`\n${colors.yellow}Optional: Enter your OpenAI API key for real GPT responses${colors.reset}`);
  console.log(`${colors.cyan}Leave empty to use mock responses (no token usage)${colors.reset}\n`);
  
  const gptApiKey = await getUserInput(`${colors.green}OpenAI API Key (optional):${colors.reset} `);
  
  // 언어 선택
  console.log(`\n${colors.yellow}Select response language:${colors.reset}`);
  console.log(`${colors.cyan}1.${colors.reset} Korean (ko) - 한국어`);
  console.log(`${colors.cyan}2.${colors.reset} English (en) - 영어`);
  
  const langChoice = await getUserInput(`${colors.green}Select language (1-2, default: 1):${colors.reset} `);
  const lang = langChoice === '2' ? 'en' : 'ko';
  
  return { 
    apiKey: apiKey.trim(), 
    gptApiKey: gptApiKey.trim() || null,
    lang: lang
  };
}

// SDK 초기화
function initSDK(apiKey) {
  console.log(`${colors.cyan}Using API endpoint:${colors.reset} https://api.hua.ai.kr`);
  
  return new HUALite(apiKey, {
    baseUrl: 'https://api.hua.ai.kr'
  });
}

// 간단한 채팅 테스트
async function simpleChatTest(sdk, gptApiKey = null, lang = 'ko') {
  console.log(`\n${colors.cyan}=== Simple Chat Test ===${colors.reset}\n`);
  
  const message = await getUserInput(`${colors.green}Enter your message:${colors.reset} `);
  
  if (!message.trim()) {
    console.log(`${colors.red}Please enter a message!${colors.reset}\n`);
    return;
  }
  
  // 티어 선택
  console.log(`\n${colors.yellow}Select response tier:${colors.reset}`);
  console.log(`${colors.cyan}1.${colors.reset} Basic (1.0) - Simple response, 1 credit`);
  console.log(`${colors.cyan}2.${colors.reset} Advanced (2.0) - Detailed response, 2 credits`);
  console.log(`${colors.cyan}3.${colors.reset} Premium (3.0) - Very detailed response, 3 credits`);
  
  const tierChoice = await getUserInput(`${colors.green}Select tier (1-3, default: 1):${colors.reset} `);
  const tier = tierChoice === '2' ? 2.0 : tierChoice === '3' ? 3.0 : 1.0;
  
  try {
    console.log(`\n${colors.yellow}Waiting for AI response (Tier ${tier}, Language: ${lang})...${colors.reset}\n`);
    
    const chatRequest = {
      message: message,
      userId: 'demo-user',
      tier: tier,
      lang: lang
    };
    
    // GPT API 키가 있으면 추가
    if (gptApiKey) {
      chatRequest.llmApiKey = gptApiKey;
    }
    
    const response = await sdk.chat(chatRequest);
    
    if (response.success) {
      console.log(`${colors.green}✅ Success!${colors.reset}`);
      console.log(`${colors.cyan}AI Response:${colors.reset} ${response.data.message}\n`);
      
      if (response.data.usage) {
        console.log(`${colors.magenta}Token Usage:${colors.reset}`);
        console.log(`  - Input: ${response.data.usage.input_tokens}`);
        console.log(`  - Output: ${response.data.usage.output_tokens}`);
        console.log(`  - Total: ${response.data.usage.total_tokens}\n`);
      } else {
        console.log(`${colors.yellow}ℹ️  Mock response - No token usage${colors.reset}\n`);
      }
    } else {
      console.log(`${colors.red}❌ Error:${colors.reset} ${response.error || response.message}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Exception:${colors.reset} ${error.message}\n`);
  }
}

// 다양한 톤으로 테스트
async function toneTest(sdk, gptApiKey = null, lang = 'ko') {
  console.log(`\n${colors.cyan}=== Test Different Tones ===${colors.reset}\n`);
  
  const message = await getUserInput(`${colors.green}Enter message to test:${colors.reset} `);
  
  if (!message.trim()) {
    console.log(`${colors.red}Please enter a message!${colors.reset}\n`);
    return;
  }
  
  const tones = ['gentle', 'warm', 'cheerful', 'quirky', 'delicate'];
  const toneNames = {
    gentle: 'Gentle',
    warm: 'Warm',
    cheerful: 'Cheerful',
    quirky: 'Quirky',
    delicate: 'Delicate'
  };
  
  for (const tone of tones) {
    try {
      console.log(`\n${colors.yellow}Testing ${toneNames[tone]} tone...${colors.reset}`);
      
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
        console.log(`${colors.green}✅ ${toneNames[tone]} tone:${colors.reset} ${response.data.message}`);
      } else {
        console.log(`${colors.red}❌ ${toneNames[tone]} tone error:${colors.reset} ${response.error || response.message}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${toneNames[tone]} tone exception:${colors.reset} ${error.message}`);
    }
  }
  console.log();
}

// 다양한 모드로 테스트
async function modeTest(sdk, gptApiKey = null, lang = 'ko') {
  console.log(`\n${colors.cyan}=== Test Different Modes ===${colors.reset}\n`);
  
  const message = await getUserInput(`${colors.green}Enter message to test:${colors.reset} `);
  
  if (!message.trim()) {
    console.log(`${colors.red}Please enter a message!${colors.reset}\n`);
    return;
  }
  
  const modes = ['empathy', 'analysis', 'suggestion', 'praise', 'playful'];
  const modeNames = {
    empathy: 'Empathy',
    analysis: 'Analysis',
    suggestion: 'Suggestion',
    praise: 'Praise',
    playful: 'Playful'
  };
  
  for (const mode of modes) {
    try {
      console.log(`\n${colors.yellow}Testing ${modeNames[mode]} mode...${colors.reset}`);
      
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
        console.log(`${colors.green}✅ ${modeNames[mode]} mode:${colors.reset} ${response.data.message}`);
      } else {
        console.log(`${colors.red}❌ ${modeNames[mode]} mode error:${colors.reset} ${response.error || response.message}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${modeNames[mode]} mode exception:${colors.reset} ${error.message}`);
    }
  }
  console.log();
}

// 토큰 사용량 확인
async function tokenUsageTest(sdk, gptApiKey = null, lang = 'ko') {
  console.log(`\n${colors.cyan}=== Check Token Usage ===${colors.reset}\n`);
  
  const message = await getUserInput(`${colors.green}Enter message to test:${colors.reset} `);
  
  if (!message.trim()) {
    console.log(`${colors.red}Please enter a message!${colors.reset}\n`);
    return;
  }
  
  // 티어 선택
  console.log(`\n${colors.yellow}Select response tier:${colors.reset}`);
  console.log(`${colors.cyan}1.${colors.reset} Basic (1.0) - Simple response, 1 credit`);
  console.log(`${colors.cyan}2.${colors.reset} Advanced (2.0) - Detailed response, 2 credits`);
  console.log(`${colors.cyan}3.${colors.reset} Premium (3.0) - Very detailed response, 3 credits`);
  
  const tierChoice = await getUserInput(`${colors.green}Select tier (1-3, default: 1):${colors.reset} `);
  const tier = tierChoice === '2' ? 2.0 : tierChoice === '3' ? 3.0 : 1.0;
  
  try {
    console.log(`\n${colors.yellow}Checking token usage (Tier ${tier}, Language: ${lang})...${colors.reset}\n`);
    
    const chatRequest = {
      message: message,
      userId: 'demo-user',
      tier: tier,
      lang: lang
    };
    
    // GPT API 키가 있으면 추가
    if (gptApiKey) {
      chatRequest.llmApiKey = gptApiKey;
    }
    
    const response = await sdk.chat(chatRequest);
    
    if (response.success && response.data.usage) {
      console.log(`${colors.green}✅ Token Usage:${colors.reset}`);
      console.log(`  - Input Tokens: ${colors.cyan}${response.data.usage.input_tokens}${colors.reset}`);
      console.log(`  - Output Tokens: ${colors.cyan}${response.data.usage.output_tokens}${colors.reset}`);
      console.log(`  - Total Tokens: ${colors.cyan}${response.data.usage.total_tokens}${colors.reset}`);
      console.log(`  - Estimated Cost: ${colors.yellow}~${(response.data.usage.total_tokens * 0.000002).toFixed(6)} USD${colors.reset}\n`);
    } else if (response.success) {
      console.log(`${colors.yellow}ℹ️  Mock response - No token usage (no OpenAI API key provided)${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Unable to get token usage information.${colors.reset}\n`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ Exception:${colors.reset} ${error.message}\n`);
  }
}

// 에러 처리 테스트
async function errorTest(sdk) {
  console.log(`\n${colors.cyan}=== Error Handling Test ===${colors.reset}\n`);
  
  console.log(`${colors.yellow}Testing various error scenarios...${colors.reset}\n`);
  
  // 1. 빈 메시지
  console.log(`${colors.magenta}1. Empty message test:${colors.reset}`);
  try {
    const response = await sdk.chat({
      message: '',
      userId: 'demo-user'
    });
    console.log(`Result: ${response.success ? 'Success' : 'Failed'} - ${response.error || response.message}`);
  } catch (error) {
    console.log(`Exception: ${error.message}`);
  }
  
  // 2. 잘못된 API 키
  console.log(`\n${colors.magenta}2. Invalid API key test:${colors.reset}`);
  const wrongSDK = new HUALite('wrong-api-key');
  try {
    const response = await wrongSDK.chat({
      message: 'test',
      userId: 'demo-user'
    });
    console.log(`Result: ${response.success ? 'Success' : 'Failed'} - ${response.error || response.message}`);
  } catch (error) {
    console.log(`Exception: ${error.message}`);
  }
  
  // 3. 네트워크 오류 시뮬레이션
  console.log(`\n${colors.magenta}3. Network error simulation:${colors.reset}`);
  const offlineSDK = new HUALite('test-key', {
    baseUrl: 'https://api.hua.ai.kr'
  });
  try {
    const response = await offlineSDK.chat({
      message: 'test',
      userId: 'demo-user'
    });
    console.log(`Result: ${response.success ? 'Success' : 'Failed'} - ${response.error || response.message}`);
  } catch (error) {
    console.log(`Exception: ${error.message}`);
  }
  
  console.log();
}

// 대화형 채팅
async function interactiveChat(sdk, gptApiKey = null, lang = 'ko') {
  console.log(`\n${colors.cyan}=== Interactive Chat ===${colors.reset}\n`);
  console.log(`${colors.yellow}Starting conversation. Type 'quit' or 'exit' to end.${colors.reset}\n`);

  // 안내 메시지 추가
  console.log(`${colors.magenta}[안내] 이 모드는 톤(tone)과 모드(mode)가 자동으로 gentle/empathy(부드러운/공감)로 적용됩니다.${colors.reset}`);
  console.log(`${colors.magenta}If you want to test different tones or modes, use the 'Test Different Tones' or 'Test Different Modes' menu.${colors.reset}`);
  console.log(`${colors.magenta}이 기능은 실제 서비스 적용 전, 다양한 환경에서 응답 품질을 빠르게 확인하는 테스트 용도로도 활용할 수 있습니다.${colors.reset}\n`);

  // 초기 티어 설정
  console.log(`${colors.yellow}Select default response tier:${colors.reset}`);
  console.log(`${colors.cyan}1.${colors.reset} Basic (1.0) - Simple response, 1 credit`);
  console.log(`${colors.cyan}2.${colors.reset} Advanced (2.0) - Detailed response, 2 credits`);
  console.log(`${colors.cyan}3.${colors.reset} Premium (3.0) - Very detailed response, 3 credits`);
  
  const tierChoice = await getUserInput(`${colors.green}Select default tier (1-3, default: 1):${colors.reset} `);
  let currentTier = tierChoice === '2' ? 2.0 : tierChoice === '3' ? 3.0 : 1.0;
  
  console.log(`\n${colors.cyan}Default tier set to: ${currentTier}${colors.reset}\n`);
  
  let conversationCount = 0;
  
  while (true) {
    const message = await getUserInput(`${colors.green}You:${colors.reset} `);
    
    if (message.toLowerCase() === 'quit' || message.toLowerCase() === 'exit') {
      console.log(`\n${colors.yellow}Ending conversation. Total conversations: ${conversationCount}${colors.reset}\n`);
      break;
    }
    
    if (message.toLowerCase() === 'tier') {
      console.log(`\n${colors.yellow}Current tier: ${currentTier}${colors.reset}`);
      const newTierChoice = await getUserInput(`${colors.green}Change tier (1-3, or press Enter to keep current):${colors.reset} `);
      if (newTierChoice === '2' || newTierChoice === '3') {
        currentTier = newTierChoice === '2' ? 2.0 : 3.0;
        console.log(`${colors.cyan}Tier changed to: ${currentTier}${colors.reset}\n`);
      } else if (newTierChoice === '1') {
        currentTier = 1.0;
        console.log(`${colors.cyan}Tier changed to: ${currentTier}${colors.reset}\n`);
      } else {
        console.log(`${colors.yellow}Tier unchanged: ${currentTier}${colors.reset}\n`);
      }
      continue;
    }
    
    if (!message.trim()) {
      console.log(`${colors.red}Please enter a message!${colors.reset}\n`);
      continue;
    }
    
    try {
      console.log(`\n${colors.yellow}AI is generating response (Tier ${currentTier})...${colors.reset}\n`);
      
      const chatRequest = {
        message: message,
        userId: 'demo-user',
        tier: currentTier,
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
        
        if (response.data.usage) {
          console.log(`${colors.magenta}[Tokens: ${response.data.usage.total_tokens}]${colors.reset}\n`);
        } else {
          console.log(`${colors.yellow}[Mock response - No tokens]${colors.reset}\n`);
        }
      } else {
        console.log(`${colors.red}❌ Error:${colors.reset} ${response.error || response.message}\n`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Exception:${colors.reset} ${error.message}\n`);
    }
  }
}

// 메인 함수
async function main() {
  printLogo();
  
  const apiKeyInfo = await getApiKey();
  if (!apiKeyInfo) {
    console.log(`${colors.red}API key is required. Exiting program.${colors.reset}\n`);
    process.exit(1);
  }
  
  const sdk = initSDK(apiKeyInfo.apiKey);
  console.log(`${colors.green}✅ SDK initialized successfully!${colors.reset}`);
  
  if (apiKeyInfo.gptApiKey) {
    console.log(`${colors.cyan}✅ OpenAI API key provided - Real GPT responses enabled${colors.reset}`);
  } else {
    console.log(`${colors.yellow}ℹ️  No OpenAI API key - Using mock responses (no token usage)${colors.reset}`);
  }
  console.log(`${colors.cyan}🌐 Response language: ${apiKeyInfo.lang === 'en' ? 'English' : 'Korean'}${colors.reset}`);
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
        console.log(`\n${colors.green}Demo completed. Thank you! 👋${colors.reset}\n`);
        process.exit(0);
      default:
        console.log(`\n${colors.red}Invalid choice. Please select again.${colors.reset}\n`);
    }
    
    await getUserInput(`${colors.yellow}Press Enter to continue...${colors.reset}`);
  }
}

// 프로그램 실행
if (require.main === module) {
  main().catch((error) => {
    console.error(`${colors.red}An error occurred while running the program:${colors.reset}`, error);
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