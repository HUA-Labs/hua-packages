'use client';

import { useState, useEffect } from 'react';
import { useLanguageChange } from 'hua-i18n-sdk/easy';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageToggle() {
  const { currentLanguage, changeLanguage } = useLanguageChange();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('🌐 LanguageToggle mounted, currentLanguage:', currentLanguage);
  }, [currentLanguage]);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
    console.log('🌐 LanguageToggle: toggling from', currentLanguage, 'to', newLanguage);
    changeLanguage(newLanguage);
  };

  if (!mounted) {
    return (
      <button className="w-9 h-9 p-0 rounded-md bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </button>
    );
  }

  // currentLanguage가 undefined일 경우 기본값 설정
  const displayLanguage = currentLanguage || 'ko';

  return (
    <button
      onClick={toggleLanguage}
      className="w-9 h-9 p-0 rounded-md bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none"
      title={displayLanguage === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      <AnimatePresence mode="wait">
        {displayLanguage === 'ko' ? (
          <motion.div
            key="ko"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-4 h-4 text-xs font-bold text-blue-600 dark:text-blue-400"
          >
            한
          </motion.div>
        ) : (
          <motion.div
            key="en"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-4 h-4 text-xs font-bold text-blue-600 dark:text-blue-400"
          >
            EN
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
} 