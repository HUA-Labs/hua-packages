"use client";
import React from "react";
import { HuaUxPage } from "@hua-labs/hua-ux/framework";
import { useSlideUp, useScrollReveal } from "@hua-labs/motion-core";
import { useTranslation } from "@hua-labs/i18n-core";
import { Card, CardContent } from "@hua-labs/ui";
import { Target, Users, Lightbulb, Rocket } from "lucide-react";

/**
 * About 페이지
 *
 * HUA Labs 회사 소개
 */
export default function AboutPage() {
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`about:${key}`);

  const heroMotion = useSlideUp({ delay: 0, duration: 800 });
  const missionReveal = useScrollReveal({ threshold: 0.2 });
  const valuesReveal = useScrollReveal({ threshold: 0.2 });
  const teamReveal = useScrollReveal({ threshold: 0.2 });

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
              <br />
              <span className="gradient-text">{t("hero.titleHighlight")}</span>을 만듭니다
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section
          ref={missionReveal.ref}
          style={missionReveal.style}
          className="py-24 px-6 bg-secondary/30"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">{t("mission.title")}</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {t("mission.description1")}
                </p>
                <p className="text-muted-foreground">
                  {t("mission.description2")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatCard number="2025" label={t("mission.stats.founded")} />
                <StatCard number="10+" label={t("mission.stats.products")} />
                <StatCard number="100+" label={t("mission.stats.users")} />
                <StatCard number="3" label={t("mission.stats.languages")} />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section
          ref={valuesReveal.ref}
          style={valuesReveal.style}
          className="py-24 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">{t("values.title")}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t("values.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ValueCard
                icon={<Target className="w-6 h-6" />}
                title={t("values.userCentric.title")}
                description={t("values.userCentric.description")}
              />
              <ValueCard
                icon={<Lightbulb className="w-6 h-6" />}
                title={t("values.innovation.title")}
                description={t("values.innovation.description")}
              />
              <ValueCard
                icon={<Users className="w-6 h-6" />}
                title={t("values.empathy.title")}
                description={t("values.empathy.description")}
              />
              <ValueCard
                icon={<Rocket className="w-6 h-6" />}
                title={t("values.execution.title")}
                description={t("values.execution.description")}
              />
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section
          ref={teamReveal.ref}
          style={teamReveal.style}
          className="py-24 px-6 bg-secondary/30"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{t("team.title")}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("team.description1")}
            </p>
            <p className="text-muted-foreground">
              {t("team.description2")}
            </p>
          </div>
        </section>
      </main>
    </HuaUxPage>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <Card className="text-center p-6">
      <CardContent className="p-0">
        <div className="text-3xl font-bold gradient-text mb-2">{number}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const motion = useSlideUp({ delay: 0, duration: 600 });

  return (
    <div
      ref={motion.ref}
      style={motion.style}
      className="p-6 rounded-xl bg-card border border-border text-center"
    >
      <div className="w-12 h-12 rounded-lg bg-hua-500/10 text-hua-500 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
