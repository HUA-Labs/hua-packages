'use client';

import { useTranslation } from '@hua-labs/i18n-core';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Stack } from '@hua-labs/hua-ux';

export function I18nShowcase() {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('i18n:title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('i18n:description')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Language Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('i18n:currentLanguage')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold mb-4">
              {language === 'ko' ? '한국어 (Korean)' : 'English'}
            </p>
            <Button onClick={toggleLanguage} variant="default">
              {t('i18n:switchLanguage')}
            </Button>
          </CardContent>
        </Card>

        {/* Translation Examples */}
        <Card>
          <CardHeader>
            <CardTitle>{t('i18n:welcome')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <p>{t('i18n:descriptionText')}</p>
              <div className="space-y-2">
                <p><strong>Navigation:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('nav:home')}</li>
                  <li>{t('nav:ui')}</li>
                  <li>{t('nav:motion')}</li>
                  <li>{t('nav:i18n')}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p><strong>UI Section:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('ui:title')}</li>
                  <li>{t('ui:description')}</li>
                  <li>{t('ui:spacing')}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p><strong>Motion Section:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('motion:title')}</li>
                  <li>{t('motion:description')}</li>
                  <li>{t('motion:scroll')}</li>
                </ul>
              </div>
            </Stack>
          </CardContent>
        </Card>

        {/* SSR Info */}
        <Card>
          <CardHeader>
            <CardTitle>SSR Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This app uses Next.js App Router with SSR support. 
              The initial language is set to match the server-side rendering, 
              preventing hydration mismatches.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
