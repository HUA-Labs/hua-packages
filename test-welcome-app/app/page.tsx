'use client';

import { HuaUxPage } from "@hua-labs/hua-ux/framework";
import { Button, Card } from "@hua-labs/hua-ux";
import { useTranslation } from '@hua-labs/i18n-core';

export default function HomePage() {
  const { t } = useTranslation('common');
  
  return (
    <HuaUxPage title={t('title')} description={t('welcome')}>
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full">
          <div className="p-8 text-center space-y-6">
            <h1 className="text-4xl font-bold">{t('title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('welcome')}
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="default">{t('getStarted')}</Button>
              <Button variant="outline">{t('learnMore')}</Button>
            </div>
          </div>
        </Card>
      </div>
    </HuaUxPage>
  );
}
