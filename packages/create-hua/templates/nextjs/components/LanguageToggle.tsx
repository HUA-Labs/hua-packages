'use client';

import { useTranslation, useLanguageChange } from '@hua-labs/hua/i18n';
import { Button } from '@hua-labs/hua/ui';
import { Globe } from '@phosphor-icons/react';

/**
 * LanguageToggle Component
 *
 * Allows users to switch between available languages
 */
export function LanguageToggle() {
  const { currentLanguage } = useTranslation();
  const { changeLanguage, supportedLanguages } = useLanguageChange();

  const handleToggle = () => {
    // Toggle between available languages
    const codes = supportedLanguages.map(lang => lang.code);
    const currentIndex = codes.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % codes.length;
    changeLanguage(codes[nextIndex]);
  };

  const languageLabels: Record<string, string> = {
    ko: '한국어',
    en: 'English',
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="gap-2"
      aria-label="Toggle language"
    >
      <Globe size={16} weight="duotone" />
      <span>{languageLabels[currentLanguage] || currentLanguage}</span>
    </Button>
  );
}
