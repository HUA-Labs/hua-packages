export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      {/* 배경 애니메이션 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 py-12 sm:py-16 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* 브랜드 섹션 */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  {/* HUA 회사 로고 */}
                  <svg className="w-8 h-8" viewBox="0 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24.8164 0C38.0711 0.000219551 48.8164 10.7453 48.8164 24C48.8164 37.2547 38.0711 47.9998 24.8164 48C11.5616 48 0.816406 37.2548 0.816406 24C0.816406 10.7452 11.5616 0 24.8164 0ZM42.7754 25.1338C42.9249 24.7059 42.6914 23.9644 41.5166 25.1338C40.3418 26.3031 37.968 27.7919 35.2324 28.1279C31.7764 28.0319 32.5382 28.0154 23.4756 26.1777C14.413 24.3401 9.75283 26.7243 8.49414 28.0469C7.65516 29.049 8.72064 28.9622 9.41992 28.8926C9.41992 28.8926 12.5282 28.6565 16.9922 28.8965C21.6001 29.3582 25.7762 30.7681 27.252 31.3984C28.3009 31.8162 29.9996 33.2161 27.8809 34.9482C25.8669 36.7857 21.792 35.4238 21.168 34.7998C20.736 34.4638 20.2711 33.717 20.1191 34.3223C19.9685 35.1855 21.379 39.3336 26.2031 39.96C30.063 40.4609 32.5668 36.1317 33.3359 33.9043C33.3359 33.9043 33.5453 32.9438 36.9014 31.6074C40.2577 30.271 42.2159 26.7349 42.7754 25.1338ZM33.7549 8.01074C30.063 7.84381 28.9826 9.74037 28.8428 10.7148C28.8429 11.1324 29.49 11.0729 29.7695 10.9336C31.1514 10.2971 34.8037 10.3912 34.8037 14.9014C34.8037 19.4119 28.6501 19.1472 25.5732 18.4512C25.5272 18.4421 20.0622 17.3646 16.5527 17.1982C13.0559 17.2799 8.93052 19.9133 7.32227 21.375C6.62313 22.1406 6.10635 23.2541 9.62988 21.584C13.1542 19.9134 21.168 21.3051 24.7344 22.21C27.042 22.6972 32.497 23.2965 35.8535 21.793C39.2098 20.2893 39.7467 14.5916 39.4082 13.0557C39.1963 12.0952 37.2473 8.20836 33.7549 8.01074Z" fill="white"/>
                  </svg>
                </div>
                {/* 글로우 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 rounded-2xl blur-lg opacity-30" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  HUA Motion
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">React Motion SDK</span>
              </div>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-lg leading-relaxed">
              React 모션 훅과 유틸리티로 아름다운 웹 경험을 만들어보세요. <br />
              성능 최적화된 모션 라이브러리입니다.
            </p>
            <div className="flex space-x-4 mb-6">
              <a 
                href="https://github.com/hua-labs/hua-motion" 
                className="group relative p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/10 group-hover:to-purple-600/10 rounded-xl transition-all duration-300" />
                <svg className="relative w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="group relative p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/10 group-hover:to-purple-600/10 rounded-xl transition-all duration-300" />
                <svg className="relative w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 HUA Labs. All rights reserved.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
              애니메이션
            </h3>
            <ul className="space-y-3">
              {[
                { href: '/showcase', label: 'Showcase' },
                { href: '/test', label: 'Test Lab' },
                { href: '/playground', label: 'Playground' },
                { href: '/docs', label: '문서' }
              ].map((item) => (
                <li key={item.href}>
                  <a 
                    href={item.href} 
                    className="group text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 flex items-center"
                  >
                    <span className="w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-4 transition-all duration-300 mr-2" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 리소스 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
              리소스
            </h3>
                         <ul className="space-y-3">
               {[
                 { href: '/docs', label: '문서', isInternal: false },
                                   { href: '/docs#api-reference', label: 'API 참조', isInternal: false },
                 { href: '/showcase', label: '예제', isInternal: false },
                 { href: 'https://github.com/hua-labs/hua-motion', label: 'GitHub', isInternal: false }
                               ].map((item) => (
                  <li key={item.href}>
                    <a 
                      href={item.href} 
                      className="group text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 flex items-center"
                    >
                      <span className="w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-4 transition-all duration-300 mr-2" />
                      {item.label}
                    </a>
                  </li>
                ))}
             </ul>
          </div>
        </div>

        
      </div>
    </footer>
  )
} 