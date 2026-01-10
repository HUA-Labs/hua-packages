import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { HuaUxLayout, setConfig } from "@hua-labs/hua-ux/framework";
import { getSSRTranslations } from "@hua-labs/hua-ux/framework/server";
import { SkipToContent } from "@hua-labs/hua-ux/framework";
import { Header, Footer } from "@/components/layout";
import huaUxConfig from "../hua-ux.config";
import "./globals.css";

// 설정 초기화 (서버 사이드)
setConfig(huaUxConfig);

export const metadata: Metadata = {
  title: {
    default: "HUA Labs - 감정 인터페이스 플랫폼",
    template: "%s | HUA Labs",
  },
  description:
    "HUA Labs는 감정을 이해하는 인터페이스를 만듭니다. 숨다이어리와 HUA UX 프레임워크를 통해 더 나은 사용자 경험을 제공합니다.",
  keywords: [
    "HUA Labs",
    "감정 분석",
    "숨다이어리",
    "HUA UX",
    "React 프레임워크",
    "UI 라이브러리",
  ],
  authors: [{ name: "HUA Labs" }],
  creator: "HUA Labs",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_US", "ja_JP"],
    url: "https://hua-labs.com",
    siteName: "HUA Labs",
    title: "HUA Labs - 감정 인터페이스 플랫폼",
    description:
      "감정을 이해하는 인터페이스를 만듭니다. 숨다이어리와 HUA UX 프레임워크.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HUA Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HUA Labs - 감정 인터페이스 플랫폼",
    description: "감정을 이해하는 인터페이스를 만듭니다.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR 번역 데이터 로드 (hua-ux 프레임워크 유틸 사용)
  const initialTranslations = await getSSRTranslations(huaUxConfig);

  // config에 initialTranslations 추가 (Partial 타입으로 처리)
  const configWithSSR: Partial<typeof huaUxConfig> = {
    ...huaUxConfig,
    i18n: huaUxConfig.i18n
      ? {
          ...huaUxConfig.i18n,
          initialTranslations,
        }
      : undefined,
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HuaUxLayout config={configWithSSR}>
            {/* 접근성: 메인 콘텐츠로 바로 이동 */}
            <SkipToContent targetId="main-content" />
            <Header />
            <div className="pt-16">{children}</div>
            <Footer />
          </HuaUxLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
