// 다국어 지원을 위한 번역 리소스
export const translations = {
  en: {
    // Header
    title: "HUA API Demo",
    subtitle: "Test the Emotion Recognition AI Chatbot API",
    showConfig: "Show Config",
    hideConfig: "Hide Config",
    clearChat: "Clear Chat",
    
    // Warning Message
    warningTitle: "⚠️ Independent Message Processing Notice",
    warningText: "Each message is processed independently. The AI doesn't remember previous conversation context, so if you want a continuous conversation, please include the necessary context in your message.",
    warningTip: "💡 Tip: Instead of saying \"about that problem I mentioned earlier...\", please describe the specific situation again.",
    
    // Configuration
    apiKeyLabel: "HUA API Key",
    apiKeyPlaceholder: "Enter your API key",
    getApiKey: "Get API Key",
    serverUrlLabel: "Server URL",
    serverUrlPlaceholder: "https://api.hua.ai.kr",
    llmKeyLabel: "LLM Key (Optional)",
    llmKeyPlaceholder: "Enter your LLM key (OpenAI API key) for real GPT responses",
    llmKeyHelp: "Leave empty to use default mock responses",
    
    // Provider Status
    providerStatusLabel: "Provider Status",
    mockProvider: "Mock",
    openaiProvider: "OpenAI",
    mockStatus: "Using mock responses (no LLM API key provided)",
    openaiStatus: "Using real AI responses (LLM API key provided)",
    
    // Settings
    languageLabel: "Language",
    tierLabel: "Tier",
    toneLabel: "Tone",
    modeLabel: "Mode",
    
    // Options
    english: "English",
    korean: "한국어",
    tier1: "Tier 1",
    tier2: "Tier 2", 
    tier3: "Tier 3",
    gentle: "Gentle",
    warm: "Warm",
    cheerful: "Cheerful",
    quirky: "Quirky",
    delicate: "Delicate",
    empathy: "Empathy",
    analysis: "Analysis",
    suggestion: "Suggestion",
    praise: "Praise",
    playful: "Playful",
    
    // Chat
    startConversation: "Start a conversation",
    sendMessageHint: "Send a message to chat with AI",
    inputPlaceholder: "Type your message... (Each message is processed independently) (Enter to send, Shift+Enter for new line)",
    send: "Send",
    aiGenerating: "AI is generating a response...",
    apiKeyRequired: "API Key Required",
    
    // Footer
    footerTitle: "HUA API - Emotion Recognition AI Chatbot",
    messages: "messages",
    tier: "Tier",
    language: "Language",
    pcModeOptimized: "💻 Optimized for PC Mode - Best experienced in full-screen",
    
    // Language Toggle
    languageToggle: "Language",
    switchToKorean: "한국어로 전환",
    switchToEnglish: "Switch to English"
  },
  ko: {
    // Header
    title: "HUA API 데모",
    subtitle: "감정 인식 AI 챗봇 API 테스트",
    showConfig: "설정 보기",
    hideConfig: "설정 숨기기",
    clearChat: "대화 지우기",
    
    // Warning Message
    warningTitle: "⚠️ 독립적 메시지 처리 안내",
    warningText: "각 메시지는 독립적으로 처리됩니다. AI는 이전 대화 내용을 기억하지 않으므로, 연속된 대화를 원하시면 메시지에 필요한 맥락을 포함해서 보내주세요.",
    warningTip: "💡 팁: \"앞서 말한 그 문제에 대해...\" 같은 표현 대신 구체적인 상황을 다시 설명해주세요.",
    
    // Configuration
    apiKeyLabel: "SUM API 키",
    apiKeyPlaceholder: "API 키를 입력하세요",
    getApiKey: "API 키 발급받기",
    serverUrlLabel: "서버 URL",
    serverUrlPlaceholder: "https://api.hua.ai.kr",
    llmKeyLabel: "LLM 키 (선택사항)",
    llmKeyPlaceholder: "실제 GPT 응답을 위해 LLM 키(OpenAI API 키)를 입력하세요",
    llmKeyHelp: "비워두면 기본 목업 응답을 사용합니다",
    
    // Provider Status
    providerStatusLabel: "프로바이더 상태",
    mockProvider: "목업",
    openaiProvider: "OpenAI",
    mockStatus: "LLM API 키가 없어서 목업 응답을 사용합니다",
    openaiStatus: "LLM API 키가 있어서 실제 AI 응답을 사용합니다",
    
    // Settings
    languageLabel: "언어",
    tierLabel: "티어",
    toneLabel: "톤",
    modeLabel: "모드",
    
    // Options
    english: "English",
    korean: "한국어",
    tier1: "티어 1",
    tier2: "티어 2",
    tier3: "티어 3",
    gentle: "부드러운",
    warm: "따뜻한",
    cheerful: "활기찬",
    quirky: "재치있는",
    delicate: "섬세한",
    empathy: "공감",
    analysis: "분석",
    suggestion: "제안",
    praise: "칭찬",
    playful: "장난스러운",
    
    // Chat
    startConversation: "대화를 시작하세요",
    sendMessageHint: "AI와 대화하려면 메시지를 보내세요",
    inputPlaceholder: "메시지를 입력하세요... (각 메시지는 독립적으로 처리됩니다) (Enter 전송, Shift+Enter 줄바꿈)",
    send: "전송",
    aiGenerating: "AI가 응답을 생성하고 있습니다...",
    apiKeyRequired: "API 키 필요",
    
    // Footer
    footerTitle: "HUA API - 감정 인식 AI 챗봇",
    messages: "메시지",
    tier: "티어",
    language: "언어",
    pcModeOptimized: "💻 PC 모드 최적화 - 전체화면에서 최고의 경험",
    
    // Language Toggle
    languageToggle: "언어",
    switchToKorean: "한국어로 전환",
    switchToEnglish: "Switch to English"
  }
};

export type Language = 'en' | 'ko';
export type TranslationKey = keyof typeof translations.en;

// 현재 언어 상태를 관리하는 함수들
let currentLanguage: Language = 'en';

export const getCurrentLanguage = (): Language => currentLanguage;

export const setCurrentLanguage = (lang: Language): void => {
  currentLanguage = lang;
  // 브라우저 언어 감지 (최초 진입 시)
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-language', lang);
  }
};

export const getTranslation = (key: TranslationKey): string => {
  return translations[currentLanguage][key] || translations.en[key] || key;
};

// 브라우저 언어 자동 감지
export const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  
  const saved = localStorage.getItem('preferred-language') as Language;
  if (saved && (saved === 'en' || saved === 'ko')) {
    return saved;
  }
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ko')) {
    return 'ko';
  }
  return 'en';
};

// 초기 언어 설정
export const initializeLanguage = (): void => {
  currentLanguage = detectBrowserLanguage();
}; 