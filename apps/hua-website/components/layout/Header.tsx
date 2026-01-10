"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@hua-labs/hua-ux";
import { useBranding } from "@hua-labs/hua-ux/framework";
import { useLanguageChange, useTranslation } from "@hua-labs/i18n-core";
import { Menu, X, Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { clsx } from "clsx";

/**
 * Header Component
 *
 * hua-ux 브랜딩 시스템을 활용한 네비게이션 헤더
 */
export function Header() {
  const pathname = usePathname();
  const branding = useBranding();
  const { theme, setTheme } = useTheme();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguageChange();
  const { t: translate } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const t = (key: string) => translate(`common:${key}`);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/about", label: t("nav.about") },
    { href: "/products", label: t("nav.products") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl"
          >
            {branding?.logo ? (
              <img
                src={branding.logo}
                alt={branding.name || "HUA Labs"}
                className="h-8 w-auto"
              />
            ) : (
              <span className="gradient-text">{branding?.name || "HUA Labs"}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="relative hidden md:block language-menu-container">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                aria-label={t("language.toggle")}
              >
                <Globe className="h-4 w-4" />
              </Button>
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLanguageMenuOpen(false);
                      }}
                      className={clsx(
                        "w-full px-4 py-2 text-left text-sm transition-colors",
                        currentLanguage === lang.code
                          ? "bg-secondary text-foreground font-medium"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      {lang.nativeName || lang.name || lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={t("theme.toggle")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? t("menu.close") : t("menu.toggle")}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={clsx(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
