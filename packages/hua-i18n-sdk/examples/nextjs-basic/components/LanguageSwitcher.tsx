'use client';

import { useLanguageChange } from 'hua-i18n-sdk';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguageChange();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative animate-slide-in">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-48 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out border border-gray-200 hover:border-blue-300"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg animate-pulse-slow">🌐</span>
          <span className="font-medium text-gray-700 truncate">
            {currentLang?.nativeName || currentLang?.name || currentLanguage}
          </span>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 z-10 animate-fade-in">
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full px-4 py-2 text-left hover:bg-blue-50 hover:scale-105 transition-all duration-200 ${
                language.code === currentLanguage
                  ? 'bg-blue-100 text-blue-600 font-medium'
                  : 'text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm transition-transform duration-200 hover:scale-110 flex-shrink-0">
                  {language.code === 'ko' ? '🇰🇷' : '🇺🇸'}
                </span>
                <span className="truncate">{language.nativeName}</span>
                {language.code !== 'ko' && (
                  <span className="text-xs text-gray-400 flex-shrink-0">({language.name})</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 배경 클릭 시 닫기 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 