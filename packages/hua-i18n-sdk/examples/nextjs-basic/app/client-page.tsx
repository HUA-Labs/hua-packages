'use client';

import { useTranslation } from 'hua-i18n-sdk';
import { useState } from 'react';

export default function ClientPage() {
  const { t, tWithParams } = useTranslation();
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {t('demo.title')} - 클라이언트 전용
          </h1>
          <p className="text-lg text-gray-600">
            이 페이지는 클라이언트 컴포넌트로만 구성되어 있습니다.
          </p>
        </header>

        <main className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {t('demo.examples.title')}
              </h2>
              <p className="text-gray-600 mb-4">
                {tWithParams('demo.demo.greeting', { name: '클라이언트 사용자' })}
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                인터랙티브 카운터
              </h3>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setCount(prev => prev - 1)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
                  {count}
                </span>
                <button
                  onClick={() => setCount(prev => prev + 1)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-center mt-4 text-gray-600">
                {tWithParams('demo.demo.userCount', { count })}
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                현재 시간
              </h3>
              <p className="text-center text-gray-600">
                {tWithParams('demo.demo.lastLogin', { 
                  date: new Date().toLocaleString() 
                })}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 