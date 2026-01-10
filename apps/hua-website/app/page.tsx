"use client";

import { HuaUxPage } from "@hua-labs/hua-ux/framework";
import { useFadeIn, useSlideUp, useScrollReveal } from "@hua-labs/motion-core";
import { useTranslation } from "@hua-labs/i18n-core";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@hua-labs/ui";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Code, Globe } from "lucide-react";

/**
 * HUA Labs 홈페이지
 *
 * hua-ux 프레임워크를 적극 활용한 랜딩 페이지
 * - HuaUxPage: 페이지 래퍼 (모션, 에러 바운더리 등)
 * - motion hooks: 애니메이션
 * - Button, Card: 브랜딩이 적용된 컴포넌트
 * - useTranslation: 다국어 지원
 */
export default function HomePage() {
  // 번역 훅 사용
  // i18n-core에서는 네임스페이스:키 형식 사용 (예: "home:hero.badge")
  const { t: translate } = useTranslation();
  
  // 네임스페이스 래퍼 함수
  const t = (key: string) => translate(`home:${key}`);

  // 모션 훅 사용
  const heroMotion = useFadeIn({ delay: 0, duration: 1000 });
  const titleMotion = useSlideUp({ delay: 200, duration: 800 });
  const subtitleMotion = useSlideUp({ delay: 400, duration: 800 });
  const ctaMotion = useSlideUp({ delay: 600, duration: 600 });
  
  // 스크롤 기반 애니메이션
  const featuresReveal = useScrollReveal({ threshold: 0.2 });
  const productsReveal = useScrollReveal({ threshold: 0.2 });

  return (
    <HuaUxPage
      title="HUA Labs - 감정 인터페이스 플랫폼"
      description="감정을 이해하는 인터페이스를 만듭니다"
      vibe="fancy"
      motion="fadeIn"
    >
      <main id="main-content" className="flex flex-col">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* 배경 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/5" />
          
          {/* 장식 요소 */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hua-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div ref={heroMotion.ref} style={heroMotion.style}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4 text-hua-500" />
                {t("hero.badge")}
              </span>
            </div>

            <h1
              ref={titleMotion.ref}
              style={titleMotion.style}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              {t("hero.title")}
            </h1>

            <p
              ref={subtitleMotion.ref}
              style={subtitleMotion.style}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12"
            >
              {t("hero.description")}
            </p>

            <div
              ref={ctaMotion.ref}
              style={ctaMotion.style}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="group">
                <Link href="/products">
                  {t("hero.cta.primary")}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">{t("hero.cta.secondary")}</Link>
              </Button>
            </div>
          </div>

          {/* 스크롤 인디케이터 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
              <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          ref={featuresReveal.ref}
          style={featuresReveal.style}
          className="py-32 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("features.title")}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t("features.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Heart className="w-8 h-8" />}
                title={t("features.emotion.title")}
                description={t("features.emotion.description")}
                delay={0}
              />
              <FeatureCard
                icon={<Code className="w-8 h-8" />}
                title={t("features.dx.title")}
                description={t("features.dx.description")}
                delay={150}
              />
              <FeatureCard
                icon={<Globe className="w-8 h-8" />}
                title={t("features.global.title")}
                description={t("features.global.description")}
                delay={300}
              />
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section
          ref={productsReveal.ref}
          style={productsReveal.style}
          className="py-32 px-6 bg-secondary/30"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("products.title")}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t("products.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Sum Diary */}
              <Card className="group hover-lift overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-6xl">📔</span>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {t("products.sumDiary.name")}
                    <span className="text-xs font-normal px-2 py-1 bg-hua-500/10 text-hua-500 rounded-full">
                      {t("products.sumDiary.badge")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {t("products.sumDiary.description")}
                  </p>
                  <Button asChild variant="ghost" className="group/btn">
                    <Link href="/products/my-app">
                      {translate("common:buttons.learnMore")}
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* HUA UX Framework */}
              <Card className="group hover-lift overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <span className="text-6xl">🛠️</span>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {t("products.huaUx.name")}
                    <span className="text-xs font-normal px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full">
                      {t("products.huaUx.badge")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {t("products.huaUx.description")}
                  </p>
                  <Button asChild variant="ghost" className="group/btn">
                    <Link href="/products/hua-ux">
                      {translate("common:buttons.learnMore")}
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              {t("cta.description")}
            </p>
            <Button asChild size="lg" className="group">
              <Link href="/contact">
                {t("cta.button")}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </HuaUxPage>
  );
}

/**
 * Feature Card Component
 */
function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  const motion = useSlideUp({ delay, duration: 600 });

  return (
    <div
      ref={motion.ref}
      style={motion.style}
      className="group p-8 rounded-2xl bg-card border border-border hover:border-hua-500/50 transition-colors"
    >
      <div className="w-16 h-16 rounded-xl bg-hua-500/10 text-hua-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
