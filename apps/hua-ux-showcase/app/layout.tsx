import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "../lib/i18n-setup";

export const metadata: Metadata = {
  title: "HUA UX Showcase",
  description: "UI + Motion + i18n showcase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
