"use client";

import { HuaUxPage } from "@hua-labs/hua-ux/framework";
import { useSlideUp, useScrollReveal } from "@hua-labs/motion-core";
import { useTranslation } from "@hua-labs/i18n-core";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@hua-labs/ui";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Palette, Globe, Zap } from "lucide-react";

/**
 * Products 페이지
 *
 * HUA Labs 제품 및 서비스 목록
 */
export default function ProductsPage() {
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`products:${key}`);

  const heroMotion = useSlideUp({ delay: 0, duration: 800 });
  const servicesReveal = useScrollReveal({ threshold: 0.2 });
  const packagesReveal = useScrollReveal({ threshold: 0.2 });

  return (
    <HuaUxPage
      title={t("hero.title")}
      description={t("hero.subtitle")}
      vibe="clean"
      motion="slideUp"
    >
      <main id="main-content" className="flex flex-col">
        {/* Hero Section */}
        <section className="py-24 px-6">
          <div
            ref={heroMotion.ref}
            style={heroMotion.style}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section
          ref={servicesReveal.ref}
          style={servicesReveal.style}
          className="py-16 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <span className="inline-block px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-sm font-medium mb-4">
                {t("services.badge")}
              </span>
              <h2 className="text-3xl font-bold">{t("services.title")}</h2>
            </div>

            <Card className="overflow-hidden hover-lift">
              <div className="grid md:grid-cols-2">
                <div className="h-64 md:h-auto bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-pink-500/50" />
                </div>
                <div className="p-8">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl">{t("services.sumDiary.title")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground mb-6">
                      {t("services.sumDiary.description")}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-pink-500" />
                        {t("services.sumDiary.features.analysis")}
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-pink-500" />
                        {t("services.sumDiary.features.visualization")}
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-pink-500" />
                        {t("services.sumDiary.features.multilingual")}
                      </li>
                    </ul>
                    <Button asChild className="group">
                      <Link href="/products/my-app">
                        {t("services.sumDiary.button")}
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Packages Section */}
        <section
          ref={packagesReveal.ref}
          style={packagesReveal.style}
          className="py-16 px-6 bg-secondary/30"
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium mb-4">
                {t("packages.badge")}
              </span>
              <h2 className="text-3xl font-bold">{t("packages.title")}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* HUA UX Framework */}
              <PackageCard
                icon={<Layers className="w-8 h-8" />}
                name={t("packages.huaUx.name")}
                title={t("packages.huaUx.title")}
                description={t("packages.huaUx.description")}
                features={[t("packages.huaUx.features.0"), t("packages.huaUx.features.1"), t("packages.huaUx.features.2")]}
                href="/products/hua-ux"
                translate={translate}
              />

              {/* HUA UI */}
              <PackageCard
                icon={<Palette className="w-8 h-8" />}
                name={t("packages.ui.name")}
                title={t("packages.ui.title")}
                description={t("packages.ui.description")}
                features={[t("packages.ui.features.0"), t("packages.ui.features.1"), t("packages.ui.features.2")]}
                href="/products/hua-ui"
                translate={translate}
              />

              {/* Motion Core */}
              <PackageCard
                icon={<Zap className="w-8 h-8" />}
                name={t("packages.motion.name")}
                title={t("packages.motion.title")}
                description={t("packages.motion.description")}
                features={[t("packages.motion.features.0"), t("packages.motion.features.1"), t("packages.motion.features.2")]}
                href="/products/motion-core"
                translate={translate}
              />

              {/* i18n Core */}
              <PackageCard
                icon={<Globe className="w-8 h-8" />}
                name={t("packages.i18n.name")}
                title={t("packages.i18n.title")}
                description={t("packages.i18n.description")}
                features={[t("packages.i18n.features.0"), t("packages.i18n.features.1"), t("packages.i18n.features.2")]}
                href="/products/i18n-core"
                translate={translate}
              />
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
                  href="https://github.com/HUA-Labs"
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

function PackageCard({
  icon,
  name,
  title,
  description,
  features,
  href,
  translate,
}: {
  icon: React.ReactNode;
  name: string;
  title: string;
  description: string;
  features: string[];
  href: string;
  translate: (key: string) => string;
}) {
  return (
    <Card className="hover-lift">
      <CardHeader>
        <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
          {icon}
        </div>
        <code className="text-xs text-muted-foreground">{name}</code>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <ul className="space-y-1 text-sm text-muted-foreground mb-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-blue-500" />
              {feature}
            </li>
          ))}
        </ul>
        <Button asChild variant="ghost" className="group p-0 h-auto">
          <Link href={href}>
            {translate("common:buttons.learnMore")}
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
