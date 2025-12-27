'use client';

import Link from 'next/link';
import { useTranslation } from '@hua-labs/i18n-core';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: t('nav:home') },
    { href: '/ui', label: t('nav:ui') },
    { href: '/motion', label: t('nav:motion') },
    { href: '/i18n', label: t('nav:i18n') },
  ];

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">HUA UX</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
