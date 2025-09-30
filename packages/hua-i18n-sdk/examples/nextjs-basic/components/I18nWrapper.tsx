'use client';

import { withDefaultConfig } from "hua-i18n-sdk";

// 초보자용: 한 줄로 끝!
export const I18nProvider = withDefaultConfig();

// 중급자용: 일부 커스터마이징
// export const I18nProvider = withDefaultConfig({
//   defaultLanguage: 'en',
//   namespaces: ['common', 'demo'],
//   debug: true,
// });

// 고급자용: 기존 방식
// import { I18nProvider as SDKProvider } from "hua-i18n-sdk";
// import { i18nConfig } from "@/lib/i18n-config";
// 
// export default function I18nWrapper({ children }: { children: React.ReactNode }) {
//   return (
//     <SDKProvider config={i18nConfig}>
//       {children}
//     </SDKProvider>
//   );
// }

interface I18nWrapperProps {
  children: React.ReactNode;
}

export default function I18nWrapper({ children }: I18nWrapperProps) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  );
} 