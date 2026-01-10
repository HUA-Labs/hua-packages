"use client";

import { HuaUxPage } from "@hua-labs/hua-ux/framework";
import { useSlideUp, useScrollReveal } from "@hua-labs/motion-core";
import { useTranslation } from "@hua-labs/i18n-core";
import { Button, Card, CardContent } from "@hua-labs/ui";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  LineChart,
  Shield,
  Sparkles,
  Globe,
} from "lucide-react";

/**
 * 숨다이어리 제품 페이지
 */
export default function SumDiaryPage() {
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`my-app:${key}`);

  const heroMotion = useSlideUp({ delay: 0, duration: 800 });
  const featuresReveal = useScrollReveal({ threshold: 0.2 });
  const ctaReveal = useScrollReveal({ threshold: 0.2 });

  return (
    <HuaUxPage
      title={t("hero.title")}
      description={t("hero.subtitle")}
      vibe="fancy"
      motion="slideUp"
    >
      <main id="main-content" className="flex flex-col">
        {/* Hero Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div ref={heroMotion.ref} style={heroMotion.style}>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  {t("hero.badge")}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  {t("hero.title")}
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  {t("hero.subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="group">
                    <a
                      href="https://my-app.hua-labs.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("hero.button1")}
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/contact">{t("hero.button2")}</Link>
                  </Button>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <BookOpen className="w-32 h-32 text-pink-500/30" />
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl bg-pink-500/10 flex items-center justify-center animate-bounce">
                  <span className="text-3xl">📔</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-xl bg-purple-500/10 flex items-center justify-center animate-pulse">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          ref={featuresReveal.ref}
          style={featuresReveal.style}
          className="py-24 px-6 bg-secondary/30"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{t("features.title")}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t("features.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Brain className="w-6 h-6" />}
                title={t("features.analysis.title")}
                description={t("features.analysis.description")}
              />
              <FeatureCard
                icon={<LineChart className="w-6 h-6" />}
                title={t("features.visualization.title")}
                description={t("features.visualization.description")}
              />
              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title={t("features.interpretation.title")}
                description={t("features.interpretation.description")}
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title={t("features.privacy.title")}
                description={t("features.privacy.description")}
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6" />}
                title={t("features.multilingual.title")}
                description={t("features.multilingual.description")}
              />
              <FeatureCard
                icon={<BookOpen className="w-6 h-6" />}
                title={t("features.themes.title")}
                description={t("features.themes.description")}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          ref={ctaReveal.ref}
          style={ctaReveal.style}
          className="py-24 px-6"
        >
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  {t("cta.title")}
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  {t("cta.description")}
                </p>
                <Button asChild size="lg" className="group">
                  <a
                    href="https://my-app.hua-labs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("cta.button")}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </HuaUxPage>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="hover-lift">
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
