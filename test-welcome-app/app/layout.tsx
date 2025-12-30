import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { I18nProviderWrapper } from "@/components/I18nProviderWrapper";

export const metadata: Metadata = {
  title: "HUA UX App",
  description: "Created with hua-ux",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 동적 언어 설정 (middleware에서 설정한 헤더 사용)
  // Dynamic language setting (use header set by middleware)
  // middleware.ts에서 'x-language' 헤더를 설정하면 여기서 읽을 수 있습니다.
  // If middleware.ts sets 'x-language' header, it can be read here.
  // Note: Next.js 16+ requires await for headers()
  const headersList = await headers();
  const language = headersList.get('x-language') || 'ko'; // 기본값: 'ko'

  return (
    <html lang={language}>
      <body className="antialiased">
        <I18nProviderWrapper>{children}</I18nProviderWrapper>
      </body>
    </html>
  );
}
