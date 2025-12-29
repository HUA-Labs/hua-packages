'use client';

import { HuaUxPage } from "@hua-labs/hua-ux/framework";
import { Button, Card, useTranslation } from "@hua-labs/hua-ux";
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const { t, currentLanguage, setLanguage } = useTranslation('common');
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  
  const handleLanguageChange = (lang: 'ko' | 'en') => {
    setLanguage(lang);
    setClickedButton(lang);
    // 모션 효과를 위해 잠시 후 리셋
    setTimeout(() => setClickedButton(null), 200);
  };
  
  return (
    <HuaUxPage title={t('title')} description={t('welcome')}>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Language Switcher */}
          <div className="flex gap-2 justify-end">
            <Button
              variant={currentLanguage === 'ko' ? 'default' : 'outline'}
              onClick={() => handleLanguageChange('ko')}
              className={`transition-transform duration-200 ease-out ${clickedButton === 'ko' ? 'scale-95' : 'scale-100'}`}
            >
              {t('korean')}
            </Button>
            <Button
              variant={currentLanguage === 'en' ? 'default' : 'outline'}
              onClick={() => handleLanguageChange('en')}
              className={`transition-transform duration-200 ease-out ${clickedButton === 'en' ? 'scale-95' : 'scale-100'}`}
            >
              {t('english')}
            </Button>
          </div>

          {/* Profile Card */}
          <Card className="p-8 text-center space-y-6">
            {/* Profile Picture/Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {t('profileName').charAt(0)}
              </div>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold">{t('profileName')}</h1>
            
            {/* Role */}
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('profileRole')}
            </p>
            
            {/* Bio */}
            <p className="text-gray-700 dark:text-gray-300">
              {t('profileBio')}
            </p>

            {/* Social Links */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                variant="default"
                onClick={() => window.open('https://github.com', '_blank', 'noopener,noreferrer')}
              >
                {t('github')}
              </Button>
              <Button 
                variant="default"
                onClick={() => window.open('https://twitter.com', '_blank', 'noopener,noreferrer')}
              >
                {t('twitter')}
              </Button>
              <Button 
                variant="default"
                onClick={() => window.open('https://linkedin.com', '_blank', 'noopener,noreferrer')}
              >
                {t('linkedin')}
              </Button>
            </div>

            {/* Skills Link */}
            <div className="pt-4">
              <Link href="/skills">
                <Button variant="outline">{t('skills')}</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </HuaUxPage>
  );
}
