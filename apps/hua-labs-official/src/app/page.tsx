import { HeroSection } from '@/components/HeroSection'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { ScrollProgress } from '@/components/ScrollProgress'

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Header />
      
      <main className="min-h-screen">
        <HeroSection />
        
        {/* About Section */}
        <section id="about" className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">About HUA Labs</h2>
            <p className="text-lg text-center text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              혁신적인 개발 솔루션을 통해 개발자들이 더 나은 미래를 만들 수 있도록 돕습니다.
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-white dark:bg-slate-800">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <p className="text-lg text-center text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-16">
              개발자들을 위한 혁신적인 제품군을 제공합니다.
            </p>
          </div>
        </section>

        {/* SDK Section */}
        <section id="sdk" className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Developer SDKs</h2>
            <p className="text-lg text-center text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-16">
              개발자들이 쉽게 사용할 수 있는 SDK를 제공합니다.
            </p>
            
            {/* SDK Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-3">HUA i18n SDK</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  혁신적인 국제화 솔루션으로 다국어 애플리케이션을 쉽게 개발할 수 있습니다.
                </p>
                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">TypeScript</span>
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">React</span>
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">Plugin</span>
                </div>
                <a 
                  href="/sdk" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  자세히 보기
                </a>
              </div>
              
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                <div className="text-3xl mb-4">🔧</div>
                <h3 className="text-xl font-semibold mb-3">HUA Utils SDK</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  개발 생산성을 높이는 유틸리티 라이브러리 모음입니다.
                </p>
                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">TypeScript</span>
                  <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs">Node.js</span>
                </div>
                <button className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">
                  준비 중
                </button>
              </div>
              
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                <div className="text-3xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold mb-3">HUA UI SDK</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  일관된 디자인 시스템을 위한 UI 컴포넌트 라이브러리입니다.
                </p>
                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">React</span>
                  <span className="bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-2 py-1 rounded text-xs">Tailwind</span>
                </div>
                <button className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">
                  준비 중
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-white dark:bg-slate-800">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
            <p className="text-lg text-center text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              궁금한 점이 있으시면 언제든 문의해주세요.
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </>
  )
}
