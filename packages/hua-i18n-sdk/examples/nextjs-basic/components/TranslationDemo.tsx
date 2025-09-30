'use client';

import { useTranslation, useLanguageChange } from 'hua-i18n-sdk';
import { useState, useEffect } from 'react';

export default function TranslationDemo() {
  const { t, tWithParams } = useTranslation();
  const { currentLanguage } = useLanguageChange();
  const [demoName, setDemoName] = useState('리듬');
  const [userCount, setUserCount] = useState(42);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 동적 날짜 업데이트 (1분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 기능 소개 섹션 */}
      <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          {t('demo.features.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'demo.features.ssr',
            'demo.features.csr',
            'demo.features.typescript',
            'demo.features.fallback',
            'demo.features.namespaces',
            'demo.features.dynamic'
          ].map((key) => (
            <div key={key} className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:from-blue-100 hover:to-indigo-100 hover:scale-105 transition-all duration-200">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">{t(key)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 사용 예제 섹션 */}
      <section className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          {t('demo.examples.title')}
        </h2>
        
        <div className="space-y-6">
          {/* 간단한 번역 */}
          <div className="border-l-4 border-blue-500 pl-4 hover:bg-blue-50/50 rounded-r-lg p-2 transition-colors duration-200">
            <h3 className="font-semibold text-gray-700 mb-2">
              {t('demo.examples.simple')}
            </h3>
            <p className="text-gray-600">{tWithParams('demo.demo.greeting', { name: demoName })}</p>
            <input
              type="text"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              className="mt-2 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder={t('demo.ui.namePlaceholder')}
            />
          </div>

          {/* 파라미터가 있는 번역 */}
          <div className="border-l-4 border-green-500 pl-4 hover:bg-green-50/50 rounded-r-lg p-2 transition-colors duration-200">
            <h3 className="font-semibold text-gray-700 mb-2">
              {t('demo.examples.withParams')}
            </h3>
            <p className="text-gray-600">
              {tWithParams('demo.demo.welcomeMessage', { appName: 'hua-i18n-sdk' })}
            </p>
            <p className="text-gray-600 mt-2">
              {tWithParams('demo.demo.userCount', { count: userCount })}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <button
                onClick={() => setUserCount(prev => Math.max(0, prev - 1))}
                className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 hover:scale-105 transition-all duration-200 font-medium"
              >
                -
              </button>
              <span className="text-sm text-gray-600 font-medium min-w-[2rem] text-center">{userCount}</span>
              <button
                onClick={() => setUserCount(prev => prev + 1)}
                className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200 hover:scale-105 transition-all duration-200 font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* 중첩된 키 번역 */}
          <div className="border-l-4 border-purple-500 pl-4 hover:bg-purple-50/50 rounded-r-lg p-2 transition-colors duration-200">
            <h3 className="font-semibold text-gray-700 mb-2">
              {t('demo.examples.nested')}
            </h3>
            <p className="text-gray-600">{t('demo.demo.nested.level1.level2')}</p>
          </div>

          {/* Fallback 예제 - 진짜 폴백 기능 */}
          <div className="border-l-4 border-orange-500 pl-4 hover:bg-orange-50/50 rounded-r-lg p-2 transition-colors duration-200">
            <h3 className="font-semibold text-gray-700 mb-2">
              {t('demo.examples.fallback')}
            </h3>
            <p className="text-gray-600">
              {t('demo.demo.koreanOnly')}
            </p>
            <p className="text-gray-600 mt-2">
              {t('demo.demo.fallbackTest')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t('demo.ui.fallbackExplanation')}
            </p>
            <p className="text-xs text-orange-600 mt-1 font-medium">
              💡 언어를 영어로 바꿔보세요! 한국어 메시지가 폴백으로 표시됩니다.
            </p>
          </div>

          {/* 누락된 키 처리 */}
          <div className="border-l-4 border-red-500 pl-4 hover:bg-red-50/50 rounded-r-lg p-2 transition-colors duration-200">
            <h3 className="font-semibold text-gray-700 mb-2">
              {t('demo.examples.missing')}
            </h3>
            <p className="text-gray-600">
              {t('demo.demo.missing.key.example')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {process.env.NODE_ENV === 'development' 
                ? t('demo.ui.devMode')
                : t('demo.ui.prodMode')
              }
            </p>
          </div>
        </div>
      </section>

      {/* 현재 언어 정보 */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300 ease-out">
        <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          {t('demo.status.title')}
        </h2>
        <div className="text-blue-700 space-y-2">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            {t('demo.status.currentLanguage')}: <span className="font-medium">{currentLanguage === 'ko' ? '한국어' : 'English'}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            {t('demo.status.languageCode')}: <span className="font-medium">{currentLanguage}</span>
          </p>
        </div>
      </section>
    </div>
  );
} 