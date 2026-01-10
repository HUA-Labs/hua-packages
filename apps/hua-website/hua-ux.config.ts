/**
 * HUA Website - hua-ux Configuration
 *
 * 마케팅 프리셋을 사용하여 랜딩 페이지에 최적화된 설정
 * 이 파일은 hua-ux 프레임워크의 QA 역할도 합니다.
 */
import { defineConfig } from "@hua-labs/hua-ux/framework/config";

export default defineConfig({
  // 마케팅 프리셋 사용 (드라마틱한 모션, 넓은 스페이싱)
  preset: "marketing",

  // 다국어 설정 (한/영/일)
  i18n: {
    defaultLanguage: "ko",
    supportedLanguages: ["ko", "en", "ja"],
    fallbackLanguage: "en",
    namespaces: ["common", "home", "about", "products", "contact", "my-app", "hua-ux", "hua-ui", "motion-core", "i18n-core"],
    translationLoader: "api", // API route 기반 로더 사용
    translationApiPath: "/api/translations", // API 경로
    debug: process.env.NODE_ENV === "development",
  },

  // 모션 설정 - 드라마틱한 스타일
  motion: {
    style: "dramatic",
    enableAnimations: true,
  },

  // 상태 관리 설정
  state: {
    persist: true,
    ssr: true,
  },

  // HUA Labs 브랜딩
  branding: {
    name: "HUA Labs",
    logo: "/images/hua-logo.svg",
    colors: {
      // 미니멀 테크 + HUA 브랜드 컬러
      primary: "#0a0a0a", // 거의 검정
      secondary: "#d946ef", // HUA 시그니처 퍼플
      accent: "#3b82f6", // 액센트 블루
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#06b6d4",
    },
    typography: {
      fontFamily: [
        "Pretendard",
        "SF Pro Display",
        "-apple-system",
        "BlinkMacSystemFont",
        "system-ui",
        "sans-serif",
      ],
      fontSize: {
        h1: "4rem",
        h2: "2.5rem",
        h3: "1.5rem",
        body: "1rem",
      },
    },
  },
});
