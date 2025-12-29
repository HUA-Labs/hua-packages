import type { Metadata } from "next";
import "./globals.css";
import { HuaUxLayout } from "@hua-labs/hua-ux/framework";

export const metadata: Metadata = {
  title: "HUA UX App",
  description: "Created with hua-ux",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 언어는 클라이언트 사이드에서 useAppStore를 통해 관리됩니다.
  // Language is managed on the client side through useAppStore.
  // 기본값은 'ko'이며, 클라이언트에서 동적으로 변경됩니다.
  // Default is 'ko', and it can be changed dynamically on the client.

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <HuaUxLayout>{children}</HuaUxLayout>
      </body>
    </html>
  );
}
