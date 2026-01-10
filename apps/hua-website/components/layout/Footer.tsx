"use client";

import Link from "next/link";
import { useBranding } from "@hua-labs/hua-ux/framework";
import { useLanguageChange, useTranslation } from "@hua-labs/i18n-core";
import { Github, Twitter } from "lucide-react";
import { clsx } from "clsx";

/**
 * Footer Component
 *
 * hua-ux 브랜딩 시스템을 활용한 푸터
 */
export function Footer() {
  const branding = useBranding();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguageChange();
  const { t: translate } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  const t = (key: string) => translate(`common:${key}`);
  
  // Copyright 텍스트를 interpolation으로 처리
  const copyrightText = t("footer.copyright")
    .replace("{{year}}", currentYear.toString())
    .replace("{{name}}", branding?.name || "HUA Labs");

  const footerLinks = {
    products: [
      { href: "/products/my-app", label: t("footer.products.sumDiary") },
      { href: "/products/hua-ux", label: t("footer.products.huaUx") },
      { href: "/products", label: t("footer.products.allProducts") },
    ],
    company: [
      { href: "/about", label: t("footer.company.aboutUs") },
      { href: "/contact", label: t("footer.company.contactUs") },
    ],
    resources: [
      { href: "https://github.com/HUA-Labs", label: t("footer.resources.github"), external: true },
      { href: "https://docs.hua-labs.com", label: t("footer.resources.docs"), external: true },
    ],
    legal: [
      { href: "/privacy", label: t("footer.legal.privacyPolicy") },
      { href: "/terms", label: t("footer.legal.termsOfService") },
    ],
  };

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-bold text-xl gradient-text">
                {branding?.name || "HUA Labs"}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer.tagline1")}
              <br />
              {t("footer.tagline2")}
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/HUA-Labs"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/hua_labs"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">{t("footer.products.title")}</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">{t("footer.company.title")}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">{t("footer.resources.title")}</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">{t("footer.legal.title")}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {copyrightText}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {supportedLanguages.map((lang, index) => (
              <span key={lang.code}>
                {index > 0 && <span className="mx-2">•</span>}
                <button
                  onClick={() => changeLanguage(lang.code)}
                  className={clsx(
                    "transition-opacity",
                    currentLanguage === lang.code
                      ? "opacity-100 font-medium text-foreground"
                      : "opacity-50 hover:opacity-100 cursor-pointer"
                  )}
                >
                  {lang.nativeName || lang.name || lang.code.toUpperCase()}
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
