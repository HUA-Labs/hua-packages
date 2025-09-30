'use client';

import { useTranslation } from 'hua-i18n-sdk';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TranslationDemo from '@/components/TranslationDemo';

// 클라이언트에서 번역 사용 예제
// 
// SSR 사용 예제 (개선된 버전):
// ```
// import { simpleSsrTranslate, fileSsrTranslate, ssrTranslate } from 'hua-i18n-sdk';
// 
// // 🚀 초보자용 - 가장 간단한 방법
// export default function SimpleServerComponent() {
//   const title = simpleSsrTranslate('demo.title', 'ko');
//   return <h1>{title}</h1>;
// }
// 
// // ⚙️ 중급자용 - 파일 경로 지정
// export default function FileServerComponent() {
//   const title = fileSsrTranslate('demo.title', 'ko', 'en', './translations');
//   return <h1>{title}</h1>;
// }
// 
// // 🔧 고급자용 - 기존 방식 (완전한 제어)
// export default function AdvancedServerComponent() {
//   const title = ssrTranslate({
//     translations: translations.ko.demo(),
//     key: 'demo.title',
//     language: 'ko',
//   });
//   return <h1>{title}</h1>;
// }
// ```
export default function HomePage() {
  const { t } = useTranslation();

  const title = t('demo.title');
  const description = t('demo.description');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 language-transition">
            {title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto language-transition">
            {description}
          </p>
        </header>

        {/* 언어 전환기 */}
        <div className="flex justify-center mb-8 animate-slide-in">
          <LanguageSwitcher />
        </div>

        {/* 메인 콘텐츠 */}
        <main className="max-w-4xl mx-auto animate-fade-in">
          <TranslationDemo />
        </main>

        {/* 푸터 */}
        <footer className="text-center mt-16 text-gray-500 animate-fade-in">
          <p>hua-i18n-sdk Demo - Next.js Integration Example</p>
        </footer>
      </div>
    </div>
  );
}
