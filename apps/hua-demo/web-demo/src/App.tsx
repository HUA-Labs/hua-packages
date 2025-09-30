import { useState } from 'react';

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
  const [baseURL, setBaseURL] = useState('http://localhost:3000');
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [tier, setTier] = useState<'basic' | 'premium' | 'enterprise'>('basic');
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'mock'>('mock');
  const [llmApiKey, setLlmApiKey] = useState('');
  const [showConfig, setShowConfig] = useState(false);

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

    // tier 문자열을 숫자로 변환
    const tierMap = {
      basic: 1.0,
      premium: 2.0,
      enterprise: 3.0
    };

    try {
      const response = await fetch(`${baseURL.replace(/\/$/, '')}/api/lite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          message: inputMessage,
          lang: language,
          tier: tierMap[tier],
          provider: provider,
          ...(llmApiKey && { llmApiKey })
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('서버 응답:', data); // 디버깅 로그 추가
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.data?.message || '응답을 받지 못했습니다.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
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
    <div className="min-h-screen gradient-bg">
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  HUA API 데모
                </h1>
                <p className="text-blue-100 text-lg">
                  감정 인식 AI 챗봇 API를 테스트해보세요
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  {showConfig ? '설정 숨기기' : '설정 보기'}
                </button>
                <button
                  onClick={clearMessages}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  대화 초기화
                </button>
              </div>
            </div>
            
            {/* Configuration */}
            {showConfig && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-100">
                    API 키
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-200"
                    placeholder="API 키를 입력하세요"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-100">
                    서버 URL
                  </label>
                  <input
                    type="text"
                    value={baseURL}
                    onChange={(e) => setBaseURL(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-200"
                    placeholder="https://hua-api.vercel.app"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-100">
                    언어
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="ko" className="bg-gray-800">한국어</option>
                    <option value="en" className="bg-gray-800">English</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-100">
                    티어
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as 'basic' | 'premium' | 'enterprise')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="basic" className="bg-gray-800">Basic</option>
                    <option value="premium" className="bg-gray-800">Premium</option>
                    <option value="enterprise" className="bg-gray-800">Enterprise</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-100">
                    Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as 'openai' | 'gemini' | 'mock')}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="mock" className="bg-gray-800">Mock (목업)</option>
                    <option value="openai" className="bg-gray-800">OpenAI</option>
                    <option value="gemini" className="bg-gray-800">Gemini</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-100">
                    LLM API Key (선택사항)
                  </label>
                  <input
                    type="password"
                    value={llmApiKey}
                    onChange={(e) => setLlmApiKey(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-200"
                    placeholder="OpenAI/Gemini API 키 (실제 AI 응답용)"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Chat Container */}
          <div className="glass-effect rounded-2xl shadow-glow overflow-hidden">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-blue-100 py-16">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-xl font-medium mb-2">대화를 시작해보세요</p>
                  <p className="text-blue-200">메시지를 보내서 AI와 대화하세요</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl message-bubble ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-glow'
                          : 'bg-white/20 text-white backdrop-blur-sm border border-white/20'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2 flex items-center">
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
                      <span className="text-sm">AI가 응답을 생성하고 있습니다...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/20 p-6 bg-white/5">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-white placeholder-blue-200 resize-none backdrop-blur-sm transition-all duration-200"
                    rows={2}
                    disabled={isLoading || !apiKey.trim()}
                  />
                  {!apiKey.trim() && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-red-500/20 text-red-200 text-xs px-2 py-1 rounded-full">
                        API 키 필요
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim() || !apiKey.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-glow hover:shadow-glow-purple flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>전송</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="glass-effect rounded-xl p-6 shadow-glow">
              <p className="text-white font-medium mb-2">HUA API - 감정 인식 AI 챗봇</p>
              <div className="flex items-center justify-center space-x-4 text-blue-100 text-sm">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>총 {messages.length}개의 메시지</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{tier.toUpperCase()} 티어</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>{language === 'ko' ? '한국어' : 'English'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
