# my-site Architecture

**작성일**: 2026-03-13

---

## 개요

HUA Labs 공식 랜딩/마케팅 사이트. 회사 소개, 제품 소개, 블로그, 법적 문서를 제공합니다.

## 기술 스택

- Next.js (App Router)
- TypeScript
- @hua-labs/ui (landing 컴포넌트)
- @hua-labs/motion-core (랜딩 애니메이션)

## 디렉토리 구조

```
apps/my-site/
├── app/
│   ├── about/         # 회사 소개
│   ├── articles/      # 블로그/아티클
│   ├── contact/       # 연락처
│   ├── hua/           # HUA 제품 소개
│   ├── my-app/     # my-app 제품 소개
│   ├── legal/         # 법적 문서 (이용약관, 개인정보)
│   ├── api/           # API 라우트
│   ├── layout.tsx
│   ├── page.tsx       # 메인 랜딩
│   ├── not-found.tsx
│   ├── robots.ts      # SEO robots.txt
│   └── sitemap.ts     # SEO sitemap
├── package.json
└── tsconfig.json
```

## 페이지 구성

| 경로         | 목적                       |
| ------------ | -------------------------- |
| `/`          | 메인 랜딩 페이지           |
| `/about`     | 회사 소개                  |
| `/hua`       | HUA 프레임워크 제품 페이지 |
| `/my-app` | my-app 제품 페이지      |
| `/articles`  | 블로그/기술 아티클         |
| `/contact`   | 연락처                     |
| `/legal`     | 법적 문서                  |

## 배포

- Vercel, `[deploy official]` 커밋 태그

---

**최종 업데이트**: 2026-03-13
