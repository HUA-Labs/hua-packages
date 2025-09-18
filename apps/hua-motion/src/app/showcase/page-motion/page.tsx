'use client'

import { usePageMotions } from '@hua-labs/motion-core'
import { Icon, Button } from '@hua-labs/ui'
import ShowcasePageLayout from '../../components/ShowcasePageLayout'

export default function PageMotionPage() {
  const pageAnimations = usePageMotions()

  return (
    <ShowcasePageLayout
              title="Page Motion"
              description="페이지 전환과 레이아웃 모션으로 부드러운 사용자 경험을 만들어보세요"
      icon="layers"
      color="green"
      primaryButton={{
        text: "테스트 랩",
        href: "/test",
        icon: "flask-conical"
      }}
      secondaryButton={{
        text: "문서 보기",
        href: "/docs",
        icon: "book"
      }}
    >
      {/* 페이지 전환 데모 */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center justify-center">
            <Icon name="arrowRightLeft" size={32} className="mr-3" />
            페이지 전환 애니메이션
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            부드러운 페이지 전환 효과를 체험해보세요
          </p>
        </div>
        
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 shadow-2xl shadow-green-500/10 border border-green-200/50 dark:border-green-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 진입 애니메이션 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Icon name="logIn" size={24} className="mr-2 text-green-600" />
                진입 애니메이션
              </h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Fade In</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    부드러운 페이드 인 효과
                  </p>
                  <div className="bg-green-500/20 h-16 rounded-lg flex items-center justify-center">
                    <span className="text-green-700 dark:text-green-300 font-medium">페이드 인 데모</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Slide Up</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    아래에서 위로 슬라이드 효과
                  </p>
                  <div className="bg-emerald-500/20 h-16 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">슬라이드 업 데모</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-teal-200/50 dark:border-teal-800/50">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Scale In</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    스케일 확대 효과
                  </p>
                  <div className="bg-teal-500/20 h-16 rounded-lg flex items-center justify-center">
                    <span className="text-teal-700 dark:text-teal-300 font-medium">스케일 인 데모</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 퇴장 애니메이션 */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Icon name="logOut" size={24} className="mr-2 text-emerald-600" />
                퇴장 애니메이션
              </h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Fade Out</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    부드러운 페이드 아웃 효과
                  </p>
                  <div className="bg-emerald-500/20 h-16 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">페이드 아웃 데모</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-teal-200/50 dark:border-teal-800/50">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Slide Down</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    위에서 아래로 슬라이드 효과
                  </p>
                  <div className="bg-teal-500/20 h-16 rounded-lg flex items-center justify-center">
                    <span className="text-teal-700 dark:text-teal-300 font-medium">슬라이드 다운 데모</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-cyan-200/50 dark:border-cyan-800/50">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Scale Out</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    스케일 축소 효과
                  </p>
                  <div className="bg-cyan-500/20 h-16 rounded-lg flex items-center justify-center">
                    <span className="text-cyan-700 dark:text-cyan-300 font-medium">스케일 아웃 데모</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 레이아웃 애니메이션 */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center justify-center">
            <Icon name="move" size={32} className="mr-3" />
            레이아웃 애니메이션
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            요소들의 위치와 크기 변화를 부드럽게 처리합니다
          </p>
        </div>
        
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 shadow-2xl shadow-emerald-500/10 border border-emerald-200/50 dark:border-emerald-800/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 리사이즈 애니메이션 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
                <Icon name="maximize-2" size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">리사이즈</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                요소의 크기 변화를 부드럽게 처리
              </p>
              <div className="bg-green-500/20 h-24 rounded-xl flex items-center justify-center">
                <span className="text-green-700 dark:text-green-300 font-medium">리사이즈 데모</span>
              </div>
            </div>
            
            {/* 리포지션 애니메이션 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
                <Icon name="move" size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">리포지션</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                요소의 위치 변화를 부드럽게 처리
              </p>
              <div className="bg-emerald-500/20 h-24 rounded-xl flex items-center justify-center">
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">리포지션 데모</span>
              </div>
            </div>
            
            {/* 리오더 애니메이션 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/25">
                <Icon name="list" size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">리오더</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                요소의 순서 변화를 부드럽게 처리
              </p>
              <div className="bg-teal-500/20 h-24 rounded-xl flex items-center justify-center">
                <span className="text-teal-700 dark:text-teal-300 font-medium">리오더 데모</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 인터랙티브 데모 */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center justify-center">
            <Icon name="mousePointer" size={32} className="mr-3" />
            인터랙티브 데모
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            실제 페이지 전환을 체험해보세요
          </p>
        </div>
        
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 shadow-2xl shadow-teal-500/10 border border-teal-200/50 dark:border-teal-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/25">
                <Icon name="play" size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">페이지 진입</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                새로운 페이지로 진입할 때의 애니메이션
              </p>
              <Button variant="gradient" gradient="green" size="lg">
                진입 애니메이션
              </Button>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
                <Icon name="pause" size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">페이지 퇴장</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                현재 페이지를 떠날 때의 애니메이션
              </p>
              <Button variant="outline" size="lg" className="border-cyan-500 text-cyan-600 hover:bg-cyan-50">
                퇴장 애니메이션
              </Button>
            </div>
          </div>
        </div>
      </section>
    </ShowcasePageLayout>
  )
} 