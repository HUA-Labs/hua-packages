/**
 * HUA UI 디자인 토큰 시스템
 * 중앙화된 디자인 토큰 정의
 */

import type { Size } from "../../types/common";

/**
 * 색상 스케일 타입
 * light/dark 테마별 색상 정의
 */
export interface ColorScale {
  light: string;
  dark: string;
}

/**
 * 디자인 토큰 인터페이스
 */
export interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    destructive: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    info: ColorScale;
    muted: ColorScale;
    background: ColorScale;
    foreground: ColorScale;
    border: ColorScale;
  };
  spacing: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string[];
    fontSize: Record<Size, string>;
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

/**
 * 기본 디자인 토큰
 * Tailwind CSS 클래스 기반
 */
export const defaultTokens: DesignTokens = {
  colors: {
    primary: {
      light: "primary",
      dark: "primary",
    },
    secondary: {
      light: "secondary",
      dark: "secondary",
    },
    accent: {
      light: "accent",
      dark: "accent",
    },
    destructive: {
      light: "destructive",
      dark: "destructive",
    },
    success: {
      light: "green-600",
      dark: "green-500",
    },
    warning: {
      light: "yellow-600",
      dark: "yellow-500",
    },
    info: {
      light: "blue-600",
      dark: "blue-400",
    },
    muted: {
      light: "muted-foreground",
      dark: "muted-foreground",
    },
    background: {
      light: "background",
      dark: "background",
    },
    foreground: {
      light: "foreground",
      dark: "foreground",
    },
    border: {
      light: "border",
      dark: "border",
    },
  },
  spacing: {
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
  },
  typography: {
    fontFamily: ["system-ui", "-apple-system", "sans-serif"],
    fontSize: {
      sm: "text-sm", // 14px
      md: "text-base", // 16px
      lg: "text-lg", // 18px
      xl: "text-xl", // 20px
    },
    fontWeight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  borderRadius: {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  },
  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  },
};

/**
 * 테마별 토큰 가져오기
 * 
 * @param theme - 테마 ('light' | 'dark')
 * @param tokens - 디자인 토큰 (기본값: defaultTokens)
 * @returns 테마별 토큰 값
 */
export function getThemeTokenValue<T extends keyof DesignTokens>(
  theme: "light" | "dark",
  tokenPath: T,
  tokens: DesignTokens = defaultTokens
): DesignTokens[T] {
  const token = tokens[tokenPath];
  
  // 색상 토큰인 경우 light/dark 값 반환
  if (tokenPath === "colors") {
    const colorToken = token as DesignTokens["colors"];
    return Object.fromEntries(
      Object.entries(colorToken).map(([key, value]) => [
        key,
        value[theme],
      ])
    ) as DesignTokens[T];
  }
  
  return token;
}

/**
 * 색상 토큰 가져오기
 * 
 * @param theme - 테마
 * @param colorKey - 색상 키
 * @param tokens - 디자인 토큰
 * @returns 색상 클래스 문자열
 */
export function getColorToken(
  theme: "light" | "dark",
  colorKey: keyof DesignTokens["colors"],
  tokens: DesignTokens = defaultTokens
): string {
  const color = tokens.colors[colorKey];
  return color[theme];
}
