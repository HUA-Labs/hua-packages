'use client';

/**
 * 진짜 한 줄로 시작하는 다국어 지원
 * 초보자를 위한 최대한 간단한 API
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 기본 번역 데이터
const defaultTranslations: Record<string, Record<string, string>> = {
  ko: {
    welcome: "환영합니다",
    hello: "안녕하세요",
    click_me: "클릭하세요",
    loading: "로딩 중...",
    error: "오류가 발생했습니다",
    success: "성공했습니다",
    cancel: "취소",
    confirm: "확인",
    save: "저장",
    delete: "삭제",
    edit: "편집",
    add: "추가",
    search: "검색",
    back: "뒤로",
    next: "다음",
    home: "홈",
    about: "소개",
    contact: "연락처",
    settings: "설정",
    profile: "프로필",
    logout: "로그아웃",
    login: "로그인",
    register: "회원가입",
    // 추가 기본 번역들
    email: "이메일",
    password: "비밀번호",
    name: "이름",
    phone: "전화번호",
    address: "주소",
    submit: "제출",
    reset: "초기화",
    close: "닫기",
    open: "열기",
    yes: "예",
    no: "아니오",
    ok: "확인",
    loading_text: "잠시만 기다려주세요...",
    error_message: "문제가 발생했습니다. 다시 시도해주세요.",
    success_message: "성공적으로 완료되었습니다!",
    not_found: "찾을 수 없습니다",
    unauthorized: "권한이 없습니다",
    forbidden: "접근이 거부되었습니다",
    server_error: "서버 오류가 발생했습니다"
  },
  en: {
    welcome: "Welcome",
    hello: "Hello",
    click_me: "Click me",
    loading: "Loading...",
    error: "An error occurred",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    back: "Back",
    next: "Next",
    home: "Home",
    about: "About",
    contact: "Contact",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",
    login: "Login",
    register: "Register",
    // 추가 기본 번역들
    email: "Email",
    password: "Password",
    name: "Name",
    phone: "Phone",
    address: "Address",
    submit: "Submit",
    reset: "Reset",
    close: "Close",
    open: "Open",
    yes: "Yes",
    no: "No",
    ok: "OK",
    loading_text: "Please wait...",
    error_message: "An error occurred. Please try again.",
    success_message: "Successfully completed!",
    not_found: "Not found",
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    server_error: "Server error occurred"
  }
};

// 컨텍스트 타입
interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  translations: Record<string, Record<string, string>>;
  // 추가 편의 기능들
  isKorean: boolean;
  isEnglish: boolean;
  toggleLanguage: () => void;
  addTranslation: (lang: string, key: string, value: string) => void;
  getCurrentLanguage: () => string;
  // 하이드레이션 방지용
  isClient: boolean;
}

// 컨텍스트 생성
const I18nContext = createContext<I18nContextType | null>(null);

// 기본 언어 감지 (서버에서는 항상 한국어)
function detectLanguage(): string {
  if (typeof window === 'undefined') return 'ko';
  
  const saved = localStorage.getItem('hua-i18n-language');
  if (saved && (saved === 'ko' || saved === 'en')) {
    return saved;
  }
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ko')) {
    return 'ko';
  }
  return 'en';
}

// Provider 컴포넌트
export function SimpleI18n({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState('ko'); // 서버와 클라이언트 모두 한국어로 시작
  const [translations, setTranslations] = useState(defaultTranslations);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트에서만 언어 감지 및 설정
  useEffect(() => {
    setIsClient(true);
    const detectedLanguage = detectLanguage();
    setLanguageState(detectedLanguage);
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hua-i18n-language', lang);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  // 추가 편의 기능들
  const isKorean = language === 'ko';
  const isEnglish = language === 'en';
  
  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const addTranslation = useCallback((lang: string, key: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [key]: value }
    }));
  }, []);

  const getCurrentLanguage = () => language;

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    translations,
    isKorean,
    isEnglish,
    toggleLanguage,
    addTranslation,
    getCurrentLanguage,
    isClient
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// 훅들
export function useTranslate() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslate must be used within SimpleI18n');
  }
  return context.t;
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLanguage must be used within SimpleI18n');
  }
  return {
    language: context.language,
    setLanguage: context.setLanguage,
    isKorean: context.isKorean,
    isEnglish: context.isEnglish,
    toggleLanguage: context.toggleLanguage,
    addTranslation: context.addTranslation,
    getCurrentLanguage: context.getCurrentLanguage
  };
}

// 추가 편의 훅들
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within SimpleI18n');
  }
  return context;
}

// 🚀 완전 초보자용 훅 - 정말 필요한 것만!
export function useSimpleI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useSimpleI18n must be used within SimpleI18n');
  }
  
  return {
    // 번역 함수
    t: context.t,
    // 언어 전환 (한 번 클릭으로)
    toggleLanguage: context.toggleLanguage,
    // 현재 언어 (간단한 문자열)
    currentLanguage: context.language,
    // 언어 이름 (한국어/English)
    languageName: context.language === 'ko' ? '한국어' : 'English',
    // 언어 버튼 텍스트
    languageButtonText: context.language === 'ko' ? 'English' : '한국어',
    // 하이드레이션 방지용
    isClient: context.isClient,
    // 번역 추가 기능
    addTranslation: context.addTranslation
  };
}

// 더 간단한 별칭들
export const I18nProvider = SimpleI18n;
export const useTranslation = useTranslate;

// 🚀 초보자를 위한 유틸리티 함수들

/**
 * TypeScript 파일에서 번역을 로드하는 함수
 * 초보자를 위한 간단한 번역 파일 분리 방법
 */
export function loadTranslationsFromFile(
  translations: Record<string, Record<string, string>>,
  addTranslation: (lang: string, key: string, value: string) => void
) {
  Object.entries(translations).forEach(([lang, langTranslations]) => {
    Object.entries(langTranslations).forEach(([key, value]) => {
      addTranslation(lang, key, value);
    });
  });
}

/**
 * 번역 파일을 자동으로 로드하는 훅
 * 컴포넌트에서 번역 파일을 쉽게 사용할 수 있게 해줍니다
 */
export function useTranslationsFromFile(
  translations: Record<string, Record<string, string>>
) {
  const { addTranslation } = useSimpleI18n();
  
  useEffect(() => {
    loadTranslationsFromFile(translations, addTranslation);
  }, [translations, addTranslation]);
} 