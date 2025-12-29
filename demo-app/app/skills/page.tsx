'use client';

import { HuaUxPage } from "@hua-labs/hua-ux/framework";
import { Button, Card, CardHeader, CardTitle, CardContent, useTranslation } from "@hua-labs/hua-ux";
import Link from 'next/link';
import { useState } from 'react';

export default function SkillsPage() {
  const { t, currentLanguage, setLanguage } = useTranslation('common');
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  
  const handleLanguageChange = (lang: 'ko' | 'en') => {
    setLanguage(lang);
    setClickedButton(lang);
    // 모션 효과를 위해 잠시 후 리셋
    setTimeout(() => setClickedButton(null), 200);
  };
  
  const skills = [
    {
      name: t('skillReact'),
      description: t('skillReactDesc'),
    },
    {
      name: t('skillNextjs'),
      description: t('skillNextjsDesc'),
    },
    {
      name: t('skillTypescript'),
      description: t('skillTypescriptDesc'),
    },
  ];
  
  return (
    <HuaUxPage title={t('skills')} description={t('skills')}>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-8">
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

          {/* Skills Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{t('skills')}</h1>
          </div>

          {/* Skills Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle>{skill.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {skill.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Back to Home */}
          <div className="text-center pt-4">
            <Link href="/">
              <Button variant="outline">← {t('welcome')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </HuaUxPage>
  );
}
