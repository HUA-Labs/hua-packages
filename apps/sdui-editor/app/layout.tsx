import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@hua-labs/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SDUI Editor - 비주얼 UI 빌더",
    template: "%s | SDUI Editor",
  },
  description:
    "드래그앤드롭으로 UI를 만들고 JSON 스키마로 내보내는 비주얼 에디터. HUA Labs SDUI 시스템 기반.",
  keywords: [
    "SDUI",
    "Visual Editor",
    "UI Builder",
    "Drag and Drop",
    "HUA Labs",
    "Server-Driven UI",
  ],
  authors: [{ name: "HUA Labs" }],
  creator: "HUA Labs",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="h-screen overflow-hidden">
        <ThemeProvider
          defaultTheme="system"
          enableSystem
          enableTransition
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
