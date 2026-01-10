"use client";

import { useState } from "react";
import { HuaUxPage } from "@hua-labs/hua-ux/framework";
import { useSlideUp } from "@hua-labs/motion-core";
import { useTranslation } from "@hua-labs/i18n-core";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@hua-labs/ui";
import { Mail, MessageSquare, Github, Twitter, Send } from "lucide-react";

/**
 * Contact 페이지
 *
 * HUA Labs 문의하기
 */
export default function ContactPage() {
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`contact:${key}`);

  const heroMotion = useSlideUp({ delay: 0, duration: 800 });
  const formMotion = useSlideUp({ delay: 200, duration: 600 });
  const infoMotion = useSlideUp({ delay: 400, duration: 600 });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 실제 구현 시 API 호출
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

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

        {/* Contact Form & Info Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div ref={formMotion.ref} style={formMotion.style}>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("form.title")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
                          <Send className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {t("form.success.title")}
                        </h3>
                        <p className="text-muted-foreground">
                          {t("form.success.description")}
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setIsSubmitted(false);
                            setFormData({
                              name: "",
                              email: "",
                              subject: "",
                              message: "",
                            });
                          }}
                        >
                          {t("form.success.button")}
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium mb-2"
                          >
                            {t("form.name")}
                          </label>
                          <input
                            type="text"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-hua-500/50"
                            placeholder={t("form.placeholders.name")}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-2"
                          >
                            {t("form.email")}
                          </label>
                          <input
                            type="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-hua-500/50"
                            placeholder={t("form.placeholders.email")}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="subject"
                            className="block text-sm font-medium mb-2"
                          >
                            {t("form.subject")}
                          </label>
                          <input
                            type="text"
                            id="subject"
                            required
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({ ...formData, subject: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-hua-500/50"
                            placeholder={t("form.placeholders.subject")}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="message"
                            className="block text-sm font-medium mb-2"
                          >
                            {t("form.message")}
                          </label>
                          <textarea
                            id="message"
                            required
                            rows={5}
                            value={formData.message}
                            onChange={(e) =>
                              setFormData({ ...formData, message: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-hua-500/50 resize-none"
                            placeholder={t("form.placeholders.message")}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? t("form.submitting") : t("form.submit")}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div ref={infoMotion.ref} style={infoMotion.style}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t("info.title")}</h3>
                    <div className="space-y-4">
                      <ContactItem
                        icon={<Mail className="w-5 h-5" />}
                        label={t("info.email.label")}
                        value={t("info.email.value")}
                        href="mailto:contact@hua-labs.com"
                      />
                      <ContactItem
                        icon={<MessageSquare className="w-5 h-5" />}
                        label={t("info.business.label")}
                        value={t("info.business.value")}
                        href="mailto:business@hua-labs.com"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t("info.social.title")}</h3>
                    <div className="flex gap-3">
                      <a
                        href="https://github.com/HUA-Labs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        aria-label="GitHub"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                      <a
                        href="https://twitter.com/hua_labs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t("faq.title")}</h3>
                    <div className="space-y-4">
                      <FaqItem
                        question={t("faq.items.free.question")}
                        answer={t("faq.items.free.answer")}
                      />
                      <FaqItem
                        question={t("faq.items.license.question")}
                        answer={t("faq.items.license.answer")}
                      />
                      <FaqItem
                        question={t("faq.items.support.question")}
                        answer={t("faq.items.support.answer")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </HuaUxPage>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-hua-500/10 text-hua-500 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </a>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-4 rounded-lg bg-secondary/50">
      <div className="font-medium mb-2">{question}</div>
      <div className="text-sm text-muted-foreground">{answer}</div>
    </div>
  );
}
