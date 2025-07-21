'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { href: 'https://github.com', icon: Github, label: 'GitHub' },
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
    { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
    { href: 'mailto:contact@hualabs.com', icon: Mail, label: 'Email' },
  ]

  const footerLinks = [
    {
      title: '제품',
      links: [
        { href: '#services', label: '숨어 (SUM-LANG)' },
        { href: '#services', label: '숨API' },
        { href: '#services', label: '숨다' },
      ],
    },
    {
      title: '개발자',
      links: [
        { href: '#sdk', label: 'hua-i18n-sdk' },
        { href: '/docs', label: '문서' },
        { href: '/api', label: 'API' },
      ],
    },
    {
      title: '회사',
      links: [
        { href: '/about', label: '소개' },
        { href: '/careers', label: '채용' },
        { href: '/contact', label: '문의' },
      ],
    },
  ]

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* 브랜드 섹션 */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/favicon_sum.svg"
                alt="HUA Labs"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                HUA Labs
              </span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              혁신적인 개발 솔루션을 통해 개발자들이 더 나은 미래를 만들 수 있도록 돕습니다.
            </p>
            
            {/* 소셜 링크 */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-purple-600 flex items-center justify-center transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* 링크 섹션들 */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              © {currentYear} HUA Labs. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                이용약관
              </Link>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>by HUA Labs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 