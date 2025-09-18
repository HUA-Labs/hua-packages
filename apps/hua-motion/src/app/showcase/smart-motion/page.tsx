'use client'

import { useSmartMotion } from '@hua-labs/motion'
import { Icon, Button } from '@hua-labs/ui'
import ShowcasePageLayout from '../../components/ShowcasePageLayout'

export default function SmartMotionPage() {
  const heroRef = useSmartMotion<HTMLDivElement>({ type: 'hero' })
  const titleRef = useSmartMotion<HTMLHeadingElement>({ type: 'title' })
  const buttonRef = useSmartMotion<HTMLButtonElement>({ type: 'button' })
  const cardRef = useSmartMotion<HTMLDivElement>({ type: 'card' })
  const textRef = useSmartMotion<HTMLParagraphElement>({ type: 'text' })
  const imageRef = useSmartMotion<HTMLDivElement>({ type: 'image' })
  
  // 호버와 클릭 효과가 있는 버튼들
  const hoverButtonRef = useSmartMotion<HTMLButtonElement>({ type: 'button', hover: true, click: false })
  const clickButtonRef = useSmartMotion<HTMLButtonElement>({ type: 'button', hover: false, click: true })
  const bothButtonRef = useSmartMotion<HTMLButtonElement>({ type: 'button', hover: true, click: true })

  return (
    <ShowcasePageLayout
              title="Smart Motion"
              description="모든 모션 기능을 한 곳에서 체험해보세요. 개별 요소별 완전한 제어가 가능합니다."
      icon="sparkles"
      color="purple"
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
      {/* Hero Section */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center">
            <Icon name="layers" size={32} className="mr-3" />
            히어로 섹션
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            각 요소별로 세밀한 애니메이션 제어가 가능합니다
          </p>
        </div>
        
        <div 
          ref={heroRef.ref} 
          style={heroRef.style}
          className="bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 text-white p-12 rounded-3xl shadow-2xl shadow-purple-500/25 relative overflow-hidden"
        >
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full blur-2xl" />
          </div>
          
          <div className="relative z-10 text-center">
            <h3 
              ref={titleRef.ref} 
              style={titleRef.style}
              className="text-4xl sm:text-5xl font-bold mb-6 flex items-center justify-center"
            >
              <Icon name="rocket" size={40} className="mr-3" />
              개별 요소 제어
            </h3>
            <p 
              ref={textRef.ref} 
              style={textRef.style}
              className="text-xl mb-8 opacity-90 leading-relaxed max-w-3xl mx-auto"
            >
              각 요소별로 세밀한 애니메이션 제어가 가능합니다. 
              호버, 클릭, 스크롤 등 다양한 인터랙션을 지원합니다.
            </p>
            <button
              ref={buttonRef.ref}
              style={buttonRef.style}
              className="px-10 py-4 bg-white text-purple-600 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg flex items-center mx-auto"
            >
              <Icon name="target" size={20} className="mr-2" />
              시작하기
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center justify-center">
            <Icon name="mousePointer" size={32} className="mr-3" />
            인터랙티브 데모
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            다양한 인터랙션 효과를 체험해보세요
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-purple-500/10 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
                <Icon name="mousePointer" size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">호버 효과</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                마우스를 올려보세요
              </p>
              <button
                ref={hoverButtonRef.ref}
                style={hoverButtonRef.style}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                호버해보세요
              </button>
            </div>
          </div>
          
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-pink-500/10 border border-pink-200/50 dark:border-pink-800/50 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/25">
                <Icon name="mousePointer" size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">클릭 효과</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                클릭해보세요
              </p>
              <button
                ref={clickButtonRef.ref}
                style={clickButtonRef.style}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                클릭해보세요
              </button>
            </div>
          </div>
          
          <div className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-rose-500/10 border border-rose-200/50 dark:border-rose-800/50 hover:shadow-2xl hover:shadow-rose-500/20 transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/25">
                <Icon name="zap" size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">호버 + 클릭</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                모든 효과를 체험해보세요
              </p>
              <button
                ref={bothButtonRef.ref}
                style={bothButtonRef.style}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                모든 효과
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Card Demo Section */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent flex items-center justify-center">
            <Icon name="layers" size={32} className="mr-3" />
            카드 애니메이션
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            카드 타입 애니메이션을 체험해보세요
          </p>
        </div>
        
        <div 
          ref={cardRef.ref}
          style={cardRef.style}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-12 shadow-2xl shadow-rose-500/10 border border-rose-200/50 dark:border-rose-800/50 relative overflow-hidden"
        >
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-red-500 rounded-full blur-2xl" />
          </div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-500/25">
              <Icon name="layers" size={32} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              카드 애니메이션
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              카드 타입의 애니메이션은 hover와 click 효과를 자동으로 제공합니다. 
              마우스를 올리거나 클릭해보세요!
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="gradient" gradient="purple" size="lg">
                호버해보세요
              </Button>
              <Button variant="outline" size="lg" className="border-rose-500 text-rose-600 hover:bg-rose-50">
                클릭해보세요
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Image Demo Section */}
      <section className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent flex items-center justify-center">
            <Icon name="image" size={32} className="mr-3" />
            이미지 애니메이션
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            이미지 타입 애니메이션을 체험해보세요
          </p>
        </div>
        
        <div 
          ref={imageRef.ref}
          style={imageRef.style}
          className="bg-gradient-to-br from-red-500 via-orange-600 to-yellow-600 p-12 shadow-2xl shadow-red-500/25 relative overflow-hidden"
        >
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 text-center text-white">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Icon name="image" size={40} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-6">
              이미지 애니메이션
            </h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
              이미지 타입의 애니메이션은 스케일과 투명도 변화를 제공합니다. 
              마우스를 올려보세요!
            </p>
            <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <div className="w-32 h-32 bg-gradient-to-r from-white/30 to-white/10 rounded-xl flex items-center justify-center">
                <Icon name="image" size={48} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </ShowcasePageLayout>
  )
} 