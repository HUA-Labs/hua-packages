"use client";

import { HuaUxPage } from "@hua-labs/hua-ux/framework";
import { useSlideUp, useScrollReveal } from "@hua-labs/motion-core";
import { useTranslation } from "@hua-labs/i18n-core";
import { Button, Card, CardContent } from "@hua-labs/ui";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Zap,
  Palette,
  Globe,
  Sparkles,
  Code,
  Terminal,
} from "lucide-react";

/**
 * HUA UX Framework 제품 페이지
 */
export default function HuaUxProductPage() {
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`hua-ux:${key}`);

  const heroMotion = useSlideUp({ delay: 0, duration: 800 });
  const featuresReveal = useScrollReveal({ threshold: 0.2 });
  const codeReveal = useScrollReveal({ threshold: 0.2 });

  return (
    <HuaUxPage
      title={t("hero.title")}
      description={t("hero.description")}
      vibe="clean"
      motion="slideUp"
    >
      <main id="main-content" className="flex flex-col">
        {/* Hero Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div ref={heroMotion.ref} style={heroMotion.style}>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium mb-6">
                  <Code className="w-4 h-4" />
                  {t("hero.badge")}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  {t("hero.title")}
                </h1>
                <p className="text-xl text-muted-foreground mb-4">
                  <strong>{t("hero.subtitle1")}</strong> {t("hero.subtitle2")}
                </p>
                <p className="text-muted-foreground mb-8">
                  {t("hero.description")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="group">
                    <a
                      href="https://www.npmjs.com/package/create-hua-ux"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("hero.button1")}
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" disabled>
                    {t("hero.button2")}
                  </Button>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Layers className="w-32 h-32 text-blue-500/30" />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <span className="text-3xl">🛠️</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Section */}
        <section
          ref={codeReveal.ref}
          style={codeReveal.style}
          className="py-16 px-6 bg-secondary/30"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("quickStart.title")}</h2>
              <p className="text-muted-foreground">{t("quickStart.subtitle")}</p>
            </div>

            <div className="space-y-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary border-b border-border">
                    <Terminal className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t("quickStart.terminal")}</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm">
                    <code className="text-foreground">
                      npx create-hua-ux my-app
                    </code>
                  </pre>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary border-b border-border">
                    <Code className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {t("quickStart.configFile")}
                    </span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm">
                    <code className="text-foreground">{`import { defineConfig } from '@hua-labs/hua-ux/framework';

export default defineConfig({
  preset: 'product',  // 또는 'marketing'
  i18n: {
    supportedLanguages: ['ko', 'en', 'ja'],
  },
});`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          ref={featuresReveal.ref}
          style={featuresReveal.style}
          className="py-24 px-6"
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
                icon={<Layers className="w-6 h-6" />}
                title={t("features.integration.title")}
                description={t("features.integration.description")}
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title={t("features.presets.title")}
                description={t("features.presets.description")}
              />
              <FeatureCard
                icon={<Palette className="w-6 h-6" />}
                title={t("features.branding.title")}
                description={t("features.branding.description")}
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6" />}
                title={t("features.i18n.title")}
                description={t("features.i18n.description")}
              />
              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title={t("features.motion.title")}
                description={t("features.motion.description")}
              />
              <FeatureCard
                icon={<Code className="w-6 h-6" />}
                title={t("features.typescript.title")}
                description={t("features.typescript.description")}
              />
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-24 px-6 bg-secondary/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t("packages.title")}</h2>
            <p className="text-muted-foreground mb-12">
              {t("packages.subtitle")}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PackageBadge name="@hua-labs/ui" />
              <PackageBadge name="@hua-labs/motion-core" />
              <PackageBadge name="@hua-labs/i18n-core" />
              <PackageBadge name="@hua-labs/state" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {t("cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="group">
                <a
                  href="https://www.npmjs.com/package/create-hua-ux"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("cta.github")}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">{t("cta.contact")}</Link>
              </Button>
            </div>
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
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function PackageBadge({ name }: { name: string }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-card border border-border">
      <code className="text-sm">{name}</code>
    </div>
  );
}
