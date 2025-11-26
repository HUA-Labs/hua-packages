import { withDefaultConfig } from '@hua-labs/i18n-sdk'
import { useI18n } from '@hua-labs/i18n-sdk'

export const I18nProvider = withDefaultConfig({
  defaultLanguage: 'ko',
  fallbackLanguage: 'ko',
  namespaces: ['common'],
  debug: false,
  autoLanguageSync: true
})

export { useI18n }

// 번역 데이터
export const translations = {
  ko: {
    hero: {
      title: 'HUA Labs',
      subtitle: '혁신적인 개발 솔루션으로',
      mainTitle: '미래를 만들어갑니다',
      description: '숨어(SUM-LANG), 숨API, 숨다 등 혁신적인 제품군과 SDK를 통해 개발자들이 더 나은 미래를 만들 수 있도록 돕습니다',
      startButton: '시작하기',
      demoButton: '데모 보기',
      scrollText: '스크롤'
    },
    nav: {
      about: '소개',
      services: '서비스',
      sdk: 'SDK',
      contact: '문의'
    },
    sections: {
      about: {
        title: 'About HUA Labs',
        description: '혁신적인 개발 솔루션을 통해 개발자들이 더 나은 미래를 만들 수 있도록 돕습니다.'
      },
      services: {
        title: 'Our Services',
        description: '개발자들을 위한 혁신적인 제품군을 제공합니다.'
      },
      sdk: {
        title: 'Developer SDKs',
        description: '개발자들이 쉽게 사용할 수 있는 SDK를 제공합니다.'
      },
      contact: {
        title: 'Contact Us',
        description: '궁금한 점이 있으시면 언제든 문의해주세요.'
      }
    },
    footer: {
      description: '혁신적인 개발 솔루션을 통해 개발자들이 더 나은 미래를 만들 수 있도록 돕습니다.',
      products: '제품',
      developers: '개발자',
      company: '회사',
      sumLang: '숨어 (SUM-LANG)',
      sumApi: '숨API',
      sumDa: '숨다',
      huaI18nSdk: 'hua-i18n-sdk',
      docs: '문서',
      api: 'API',
      about: '소개',
      careers: '채용',
      contact: '문의',
      privacy: '개인정보처리방침',
      terms: '이용약관',
      madeWith: 'Made with',
      by: 'by HUA Labs',
      copyright: '© {year} HUA Labs. All rights reserved.'
    }
  },
  en: {
    hero: {
      title: 'HUA Labs',
      subtitle: 'Building the future with',
      mainTitle: 'innovative development solutions',
      description: 'We help developers create a better future through innovative product suites and SDKs like SUM-LANG, SUM-API, and SUM-DA.',
      startButton: 'Get Started',
      demoButton: 'View Demo',
      scrollText: 'Scroll'
    },
    nav: {
      about: 'About',
      services: 'Services',
      sdk: 'SDK',
      contact: 'Contact'
    },
    sections: {
      about: {
        title: 'About HUA Labs',
        description: 'We help developers create a better future through innovative development solutions.'
      },
      services: {
        title: 'Our Services',
        description: 'Providing innovative product suites for developers.'
      },
      sdk: {
        title: 'Developer SDKs',
        description: 'Providing SDKs that developers can easily use.'
      },
      contact: {
        title: 'Contact Us',
        description: 'Feel free to contact us if you have any questions.'
      }
    },
    footer: {
      description: 'We help developers create a better future through innovative development solutions.',
      products: 'Products',
      developers: 'Developers',
      company: 'Company',
      sumLang: 'SUM-LANG',
      sumApi: 'SUM-API',
      sumDa: 'SUM-DA',
      huaI18nSdk: 'hua-i18n-sdk',
      docs: 'Documentation',
      api: 'API',
      about: 'About',
      careers: 'Careers',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      madeWith: 'Made with',
      by: 'by HUA Labs',
      copyright: '© {year} HUA Labs. All rights reserved.'
    }
  }
} 