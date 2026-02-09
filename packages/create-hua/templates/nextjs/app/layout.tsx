import type { Metadata } from "next";
import "./globals.css";
import { HuaUxLayout } from "@hua-labs/hua-ux/framework";
import { getSSRTranslations } from "@hua-labs/hua-ux/framework/server";
import config from "../hua-ux.config";

export const metadata: Metadata = {
  title: "HUA UX App",
  description: "Created with @hua-labs/hua-ux",
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
        <HuaUxLayout config={configWithSSR}>{children}</HuaUxLayout>
      </body>
    </html>
  );
}
