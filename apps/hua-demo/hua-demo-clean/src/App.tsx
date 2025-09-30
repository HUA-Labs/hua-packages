import { useState, useRef, useEffect } from 'react';
import { getTranslation, setCurrentLanguage, getCurrentLanguage, initializeLanguage, type Language } from './i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [llmKey, setLlmKey] = useState('');
  const [baseURL, setBaseURL] = useState('http://localhost:5173');
  const [language, setLanguage] = useState<'ko' | 'en'>('en');
  const [tier, setTier] = useState<'1' | '2' | '3'>('1');
  const [tone, setTone] = useState<'gentle' | 'warm' | 'cheerful' | 'quirky' | 'delicate'>('gentle');
  const [mode, setMode] = useState<'empathy' | 'analysis' | 'suggestion' | 'praise' | 'playful'>('empathy');
  const [uiLanguage, setUiLanguage] = useState<Language>('en');
  
  // Provider는 자동으로 판단 (LLM Key 유무에 따라)
  const getProvider = () => {
    if (!llmKey.trim()) return 'mock';
    // LLM Key가 있으면 OpenAI로 가정 (나중에 Gemini 추가 가능)
    return 'openai';
  };
  const [showConfig, setShowConfig] = useState(false);
  
  // 다국어 초기화
  useEffect(() => {
    initializeLanguage();
    setUiLanguage(getCurrentLanguage());
  }, []);
  
  // UI 언어 변경 함수
  const handleLanguageChange = (newLang: Language) => {
    setCurrentLanguage(newLang);
    setUiLanguage(newLang);
  };
  
  // 키보드 네비게이션 지원
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowConfig(false);
    }
  };
  
  // 자동 스크롤을 위한 ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !apiKey.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const requestBody: {
        user_id: string;
        message: string;
        lang: 'ko' | 'en';
        tier: number;
        tone?: 'gentle' | 'warm' | 'cheerful' | 'quirky' | 'delicate';
        mode?: 'empathy' | 'analysis' | 'suggestion' | 'praise' | 'playful';
        llmApiKey?: string;
      } = {
        user_id: 'demo-user-' + Date.now(), // 고유한 사용자 ID 생성
        message: inputMessage,
        lang: language,
        tier: parseFloat(tier), // 문자열을 숫자로 변환
        tone: tone,
        mode: mode
      };

      // Add optional parameters if provided
      if (llmKey.trim()) {
        requestBody.llmApiKey = llmKey.trim();
      }

      console.log('API 요청:', {
        url: `${baseURL}/api/lite`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: requestBody
      });

      const response = await fetch(`${baseURL}/api/lite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('서버 응답 원본 텍스트:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('서버 응답 파싱된 JSON:', data);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.log('응답이 JSON이 아닙니다. 원본 텍스트:', responseText);
        data = { rawResponse: responseText };
      }
      
      // 다양한 응답 구조 시도
      let message = '';
      if (data.data?.message) {
        message = data.data.message;
      } else if (data.message) {
        message = data.message;
      } else if (data.response) {
        message = data.response;
      } else if (data.content) {
        message = data.content;
      } else if (data.result) {
        message = data.result;
      } else {
        message = JSON.stringify(data); // 전체 응답을 문자열로 표시
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: message || 'No response received.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div 
      className="min-h-screen gradient-bg"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="main"
      aria-label={getTranslation('title')}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="glass-effect rounded-2xl shadow-glow p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {getTranslation('title')}
                </h1>
                <p className="text-blue-100 text-lg">
                  {getTranslation('subtitle')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Language Toggle Button */}
                <button
                  onClick={() => handleLanguageChange(uiLanguage === 'en' ? 'ko' : 'en')}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 rounded-lg transition-all duration-200 backdrop-blur-sm border border-blue-300/20 flex items-center space-x-2"
                  aria-label={getTranslation('languageToggle')}
                >
                  <span className="text-sm font-medium">
                    {uiLanguage === 'en' ? '🇰🇷' : '🇺🇸'}
                  </span>
                  <span className="text-sm">
                    {uiLanguage === 'en' ? getTranslation('switchToKorean') : getTranslation('switchToEnglish')}
                  </span>
                </button>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-expanded={showConfig}
                  aria-controls="config-panel"
                  aria-label={showConfig ? getTranslation('hideConfig') : getTranslation('showConfig')}
                >
                  {showConfig ? getTranslation('hideConfig') : getTranslation('showConfig')}
                </button>
                <button
                  onClick={clearMessages}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-300/50"
                  aria-label={getTranslation('clearChat')}
                >
                  {getTranslation('clearChat')}
                </button>
              </div>
            </div>
            
            {/* Configuration */}
            {showConfig && (
              <div id="config-panel" className="space-y-6" role="region" aria-label={getTranslation('apiKeyLabel')}>
                {/* Warning Message */}
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-bold text-orange-200 mb-2">
                        {getTranslation('warningTitle')}
                      </h3>
                      <p className="text-sm text-orange-100 leading-relaxed">
                        <strong>{getTranslation('warningText').split('.')[0]}.</strong> {getTranslation('warningText').split('.')[1]?.trim()}
                      </p>
                      <p className="text-xs text-orange-200 mt-2 opacity-80">
                        {getTranslation('warningTip')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* API Key and Server URL Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-100">
                      {getTranslation('apiKeyLabel')}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-200"
                        placeholder={getTranslation('apiKeyPlaceholder')}
                        aria-label={getTranslation('apiKeyLabel')}
                      />
                      <a
                        href="https://hua.ai.kr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 rounded-lg transition-all duration-200 backdrop-blur-sm border border-blue-300/20 flex items-center space-x-2 whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>{getTranslation('getApiKey')}</span>
                      </a>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-100">
                      {getTranslation('serverUrlLabel')}
                    </label>
                    <input
                      type="text"
                      value={baseURL}
                      onChange={(e) => setBaseURL(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-200"
                      placeholder={getTranslation('serverUrlPlaceholder')}
                      aria-label={getTranslation('serverUrlLabel')}
                    />
                  </div>
                </div>
                
                {/* LLM Key Row */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-100">
                    {getTranslation('llmKeyLabel')}
                  </label>
                  <input
                    type="password"
                    value={llmKey}
                    onChange={(e) => setLlmKey(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-200"
                    placeholder={getTranslation('llmKeyPlaceholder')}
                    aria-label={getTranslation('llmKeyLabel')}
                  />
                  <p className="text-xs text-blue-200 opacity-70">
                    {getTranslation('llmKeyHelp')}
                  </p>
                </div>
                
                {/* Provider Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-100">
                    {getTranslation('providerStatusLabel')}
                  </label>
                  <div className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getProvider() === 'mock' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                      <span className="text-sm">
                        {getProvider() === 'mock' ? getTranslation('mockProvider') : getTranslation('openaiProvider')}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 mt-1">
                      {getProvider() === 'mock' 
                        ? getTranslation('mockStatus')
                        : getTranslation('openaiStatus')
                      }
                    </p>
                  </div>
                </div>
                
                {/* Language and Tier Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-100">
                      {getTranslation('languageLabel')}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white backdrop-blur-sm transition-all duration-200"
                      aria-label={getTranslation('languageLabel')}
                    >
                      <option value="en" className="bg-gray-800">{getTranslation('english')}</option>
                      <option value="ko" className="bg-gray-800">{getTranslation('korean')}</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-100">
                      {getTranslation('tierLabel')}
                    </label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value as '1' | '2' | '3')}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white backdrop-blur-sm transition-all duration-200"
                      aria-label={getTranslation('tierLabel')}
                    >
                      <option value="1" className="bg-gray-800">{getTranslation('tier1')}</option>
                      <option value="2" className="bg-gray-800">{getTranslation('tier2')}</option>
                      <option value="3" className="bg-gray-800">{getTranslation('tier3')}</option>
                    </select>
                  </div>
                </div>
                
                {/* Tone and Mode Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-100">
                      {getTranslation('toneLabel')}
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as 'gentle' | 'warm' | 'cheerful' | 'quirky' | 'delicate')}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white backdrop-blur-sm transition-all duration-200"
                      aria-label={getTranslation('toneLabel')}
                    >
                      <option value="gentle" className="bg-gray-800">{getTranslation('gentle')}</option>
                      <option value="warm" className="bg-gray-800">{getTranslation('warm')}</option>
                      <option value="cheerful" className="bg-gray-800">{getTranslation('cheerful')}</option>
                      <option value="quirky" className="bg-gray-800">{getTranslation('quirky')}</option>
                      <option value="delicate" className="bg-gray-800">{getTranslation('delicate')}</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-100">
                      {getTranslation('modeLabel')}
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as 'empathy' | 'analysis' | 'suggestion' | 'praise' | 'playful')}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white backdrop-blur-sm transition-all duration-200"
                      aria-label={getTranslation('modeLabel')}
                    >
                      <option value="empathy" className="bg-gray-800">{getTranslation('empathy')}</option>
                      <option value="analysis" className="bg-gray-800">{getTranslation('analysis')}</option>
                      <option value="suggestion" className="bg-gray-800">{getTranslation('suggestion')}</option>
                      <option value="praise" className="bg-gray-800">{getTranslation('praise')}</option>
                      <option value="playful" className="bg-gray-800">{getTranslation('playful')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Container */}
          <div className="glass-effect rounded-2xl shadow-glow overflow-hidden" role="main" aria-label="Chat conversation">
            {/* Messages */}
            <div 
              className="h-[400px] sm:h-[500px] overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar"
              role="log"
              aria-live="polite"
              aria-label={getTranslation('messages')}
            >
              {messages.length === 0 ? (
                <div className="text-center text-blue-100 py-16">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-xl font-medium mb-2">{getTranslation('startConversation')}</p>
                  <p className="text-blue-200">{getTranslation('sendMessageHint')}</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    role="article"
                    aria-label={`${message.role === 'user' ? 'User' : 'AI'} message`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl message-bubble ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow'
                          : 'bg-white/20 text-white backdrop-blur-sm border border-white/20'
                      }`}
                      role="text"
                      aria-label={`${message.role === 'user' ? 'User' : 'AI'} message at ${message.timestamp.toLocaleTimeString()}`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2 flex items-center" aria-hidden="true">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/20 text-white px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                      <span className="text-sm">{getTranslation('aiGenerating')}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 자동 스크롤을 위한 빈 div */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/20 p-4 sm:p-6 bg-white/5" role="form" aria-label="Message input form">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getTranslation('inputPlaceholder')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-white placeholder-blue-200 resize-none backdrop-blur-sm transition-all duration-200"
                    rows={2}
                    disabled={isLoading || !apiKey.trim()}
                    aria-label={getTranslation('inputPlaceholder')}
                  />
                  {!apiKey.trim() && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-red-500/20 text-red-200 text-xs px-2 py-1 rounded-full border border-red-300/20">
                        {getTranslation('apiKeyRequired')}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim() || !apiKey.trim()}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glow hover:shadow-glow-purple flex items-center justify-center space-x-2 min-h-[44px]"
                  aria-label={getTranslation('send')}
                >
                  <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="text-sm sm:text-base">{getTranslation('send')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="glass-effect rounded-xl p-6 shadow-glow">
              <p className="text-white font-medium mb-2">{getTranslation('footerTitle')}</p>
              <div className="flex items-center justify-center space-x-4 text-blue-100 text-sm">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{messages.length} {getTranslation('messages')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{tier.toUpperCase()} {getTranslation('tier')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>{language === 'en' ? getTranslation('english') : getTranslation('korean')}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-blue-200 opacity-70">
                  {getTranslation('pcModeOptimized')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
