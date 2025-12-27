import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">HUA UX Showcase</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Ship UX faster: UI + motion + i18n, pre-wired.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Link
              href="/ui"
              className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 transition-colors"
            >
              <h2 className="text-2xl font-semibold mb-2">UI</h2>
              <p className="text-gray-600 dark:text-gray-400">
                UI 컴포넌트와 스타일링 시스템
              </p>
            </Link>
            <Link
              href="/motion"
              className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 transition-colors"
            >
              <h2 className="text-2xl font-semibold mb-2">Motion</h2>
              <p className="text-gray-600 dark:text-gray-400">
                모션 훅과 애니메이션
              </p>
            </Link>
            <Link
              href="/i18n"
              className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 transition-colors"
            >
              <h2 className="text-2xl font-semibold mb-2">i18n</h2>
              <p className="text-gray-600 dark:text-gray-400">
                다국어 지원 시스템
              </p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
