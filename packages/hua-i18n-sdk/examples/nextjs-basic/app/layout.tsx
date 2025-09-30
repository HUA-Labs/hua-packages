import type { Metadata } from "next";
import "./globals.css";
import I18nWrapper from "@/components/I18nWrapper";

export const metadata: Metadata = {
  title: "hua-i18n-sdk Demo",
  description: "Internationalization SDK usage example in Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <I18nWrapper>
          {children}
        </I18nWrapper>
      </body>
    </html>
  );
}
