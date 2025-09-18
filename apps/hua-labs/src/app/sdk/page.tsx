import { I18nTestComponent } from '@/components/I18nTestComponent'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { ScrollProgress } from '@/components/ScrollProgress'

export default function SdkPage() {
  return (
    <>
      <ScrollProgress />
      <Header />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                🚀 HUA i18n SDK
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
                혁신적인 국제화 솔루션으로 개발자들이 더 나은 다국어 애플리케이션을 만들 수 있도록 돕습니다.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-full shadow-sm">
                  <span className="text-sm font-medium">TypeScript</span>
                </div>
                <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-full shadow-sm">
                  <span className="text-sm font-medium">React</span>
                </div>
                <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-full shadow-sm">
                  <span className="text-sm font-medium">Plugin System</span>
                </div>
                <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-full shadow-sm">
                  <span className="text-sm font-medium">Performance</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-slate-800">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">✨ 주요 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
                <div className="text-3xl mb-4">🔌</div>
                <h3 className="text-xl font-semibold mb-3">플러그인 시스템</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  확장 가능한 아키텍처로 분석, 캐싱, 최적화 플러그인을 쉽게 추가할 수 있습니다.
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-3">성능 모니터링</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  실시간 메트릭 수집으로 번역 성능을 지속적으로 모니터링하고 최적화합니다.
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-3">자동 최적화</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  규칙 기반 자동 최적화로 번역 로딩 시간과 메모리 사용량을 최적화합니다.
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
                <div className="text-3xl mb-4">🎛️</div>
                <h3 className="text-xl font-semibold mb-3">실시간 대시보드</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  React 기반 실시간 대시보드로 성능 지표와 최적화 결과를 한눈에 확인합니다.
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
                <div className="text-3xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold mb-3">타입 안전성</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  TypeScript로 완전한 타입 안전성을 제공하여 개발 시 오류를 방지합니다.
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
                <div className="text-3xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold mb-3">다국어 지원</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  한국어, 영어, 일본어 등 다양한 언어를 지원하며 쉽게 확장할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Test Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">🧪 실시간 테스트</h2>
            <I18nTestComponent />
          </div>
        </section>

        {/* Installation Section */}
        <section className="py-20 bg-white dark:bg-slate-800">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">📦 설치 및 사용법</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-4">설치</h3>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div>npm install @hua-labs/i18n-sdk</div>
                  <div className="text-slate-400 mt-2"># 또는</div>
                  <div>yarn add @hua-labs/i18n-sdk</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">기본 사용법</h3>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div>import {'{'} createI18nConfig, I18nProvider {'}'} from '@hua-labs/i18n-sdk';</div>
                  <div className="text-slate-400 mt-2">const config = createI18nConfig({'{'}</div>
                  <div className="ml-4">defaultLanguage: 'ko',</div>
                  <div className="ml-4">supportedLanguages: ['ko', 'en', 'ja']</div>
                  <div>{'});'}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Documentation Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">📚 문서</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg text-center">
                <div className="text-3xl mb-4">📖</div>
                <h3 className="text-xl font-semibold mb-3">시작하기</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  빠른 시작 가이드로 SDK를 쉽게 시작할 수 있습니다.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  시작하기
                </button>
              </div>
              
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg text-center">
                <div className="text-3xl mb-4">🔧</div>
                <h3 className="text-xl font-semibold mb-3">API 참조</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  완전한 API 문서로 모든 기능을 자세히 알아볼 수 있습니다.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  API 문서
                </button>
              </div>
              
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg text-center">
                <div className="text-3xl mb-4">💡</div>
                <h3 className="text-xl font-semibold mb-3">예제</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  실제 사용 예제와 베스트 프랙티스를 확인할 수 있습니다.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  예제 보기
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </>
  )
} 