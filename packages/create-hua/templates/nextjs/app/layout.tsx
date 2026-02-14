import type { Metadata } from "next";
import "./globals.css";
import { HuaProvider } from "@hua-labs/hua/framework";
import { getSSRTranslations } from "@hua-labs/hua/framework/server";
import { ThemeToggle } from "@hua-labs/hua/ui";
import config from "../hua.config";

export const metadata: Metadata = {
  title: "HUA UX App",
  description: "Created with @hua-labs/hua",
  icons: { icon: '/favicon.ico' },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTranslations = await getSSRTranslations(config);

  const configWithSSR = {
    ...config,
    i18n: config.i18n ? { ...config.i18n, initialTranslations } : undefined,
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <HuaProvider config={configWithSSR}>
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle variant="icon" />
          </div>
          {children}
        </HuaProvider>
      </body>
    </html>
  );
}
