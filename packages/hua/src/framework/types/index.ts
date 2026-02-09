/**
 * @hua-labs/hua/framework - Type Definitions
 *
 * Core types for the framework layer
 */

import type { ReactNode } from 'react';

/**
 * Preset name
 */
export type PresetName = 'product' | 'marketing';

/**
 * Preset configuration (개발자 모드 / Developer mode)
 * 
 * 세부 설정을 포함한 Preset 객체 형태
 * Preset object with detailed settings
 */
export interface PresetConfig {
  /**
   * Preset type / Preset 타입
   */
  type: PresetName;
  
  /**
   * Motion overrides / 모션 설정 오버라이드
   * 
   * Preset의 기본 모션 설정을 세부적으로 조정
   * Fine-tune preset's default motion settings
   */
  motion?: {
    /**
     * Animation duration in milliseconds / 애니메이션 지속 시간 (밀리초)
     */
    duration?: number;
    
    /**
     * Animation easing function / 애니메이션 이징 함수
     */
    easing?: string;
  };
  
  /**
   * Spacing overrides / 간격 설정 오버라이드
   * 
   * Preset의 기본 간격 설정을 세부적으로 조정
   * Fine-tune preset's default spacing settings
   */
  spacing?: {
    /**
     * Default spacing size / 기본 간격 크기
     */
    default?: 'sm' | 'md' | 'lg' | 'xl';
  };
}

/**
 * Preset (바이브 모드 또는 개발자 모드)
 * 
 * - 문자열: 바이브 모드 (간단) / String: Vibe mode (simple)
 * - 객체: 개발자 모드 (세부 설정) / Object: Developer mode (detailed)
 */
export type Preset = PresetName | PresetConfig;

/**
 * Framework configuration
 */
export interface HuaConfig {
  /**
   * Preset to use / 사용할 프리셋
   * 
   * Preset을 선택하면 대부분의 설정이 자동으로 적용됩니다.
   * Selecting a preset automatically applies most settings.
   * 
   * **바이브 모드 (간단) / Vibe mode (simple)**:
   * ```ts
   * preset: 'product'  // 이것만으로도 대부분 설정 완료
   * ```
   * 
   * **개발자 모드 (세부 설정) / Developer mode (detailed)**:
   * ```ts
   * preset: {
   *   type: 'product',
   *   motion: { duration: 300 },
   *   spacing: { default: 'md' },
   * }
   * ```
   * 
   * - 'product': Professional, efficient (default) / 제품 페이지용 (전문적, 효율적, 기본값)
   * - 'marketing': Dramatic, eye-catching / 마케팅 페이지용 (화려함, 눈에 띄는)
   * 
   * @example
   * ```ts
   * // 바이브 코더용 (간단)
   * export default defineConfig({
   *   preset: 'product',  // 끝!
   * });
   * ```
   * 
   * @example
   * ```ts
   * // 전통 개발자용 (세부 설정)
   * export default defineConfig({
   *   preset: {
   *     type: 'product',
   *     motion: { duration: 300 },
   *   },
   * });
   * ```
   */
  preset?: Preset;

  /**
   * i18n configuration / 다국어 설정
   * 
   * Internationalization settings for multi-language support.
   * 다국어 지원을 위한 설정입니다.
   */
  i18n?: {
    /**
     * Default language code / 기본 언어 코드
     * 
     * 예: 'ko', 'en' / e.g., 'ko', 'en'
     */
    defaultLanguage: string;
    
    /**
     * Supported language codes / 지원하는 언어 코드 배열
     * 
     * 예: ['ko', 'en', 'ja'] / e.g., ['ko', 'en', 'ja']
     */
    supportedLanguages: string[];
    
    /**
     * Fallback language / 대체 언어
     * 
     * 번역이 없을 때 사용할 언어 / Language to use when translation is missing
     */
    fallbackLanguage?: string;
    
    /**
     * Translation namespaces / 번역 네임스페이스
     * 
     * 로드할 번역 네임스페이스 목록 / List of translation namespaces to load
     */
    namespaces?: string[];
    
    /**
     * Translation loading strategy / 번역 로딩 전략
     * 
     * - 'api': API Route에서 로드 / Load from API Route
     * - 'static': 정적 파일에서 로드 / Load from static files
     * - 'custom': 커스텀 로더 사용 / Use custom loader
     */
    translationLoader?: 'api' | 'static' | 'custom';
    
    /**
     * Translation API path / 번역 API 경로
     * 
     * 'api' 로더 사용 시 API 경로 / API path when using 'api' loader
     */
    translationApiPath?: string;
    
    /**
     * Custom translation loader / 커스텀 번역 로더
     * 
     * 'custom' 로더 사용 시 커스텀 로더 함수 / Custom loader function when using 'custom' loader
     * 
     * @example
     * ```ts
     * loadTranslations: async (language, namespace) => {
     *   const response = await fetch(`/translations/${language}/${namespace}.json`);
     *   return response.json();
     * }
     * ```
     */
    loadTranslations?: (language: string, namespace: string) => Promise<Record<string, string>>;
    
    /**
     * Debug mode / 디버그 모드
     * 
     * 디버그 모드를 활성화하면 Translator의 상세한 로그가 출력됩니다.
     * Enable debug mode to see detailed Translator logs.
     */
    debug?: boolean;
    
    /**
     * Auto-update HTML lang attribute / HTML lang 속성 자동 업데이트
     * 
     * 언어 변경 시 `<html lang="...">` 속성을 자동으로 업데이트합니다.
     * Automatically updates the `<html lang="...">` attribute when language changes.
     * 
     * @default false
     * 
     * @example
     * ```ts
     * export default defineConfig({
     *   preset: 'product',
     *   i18n: {
     *     autoUpdateHtmlLang: true,  // 언어 변경 시 html[lang] 자동 업데이트
     *   },
     * });
     * ```
     */
    autoUpdateHtmlLang?: boolean;
    
    /**
     * Initial translations for SSR / SSR용 초기 번역 데이터
     * 
     * 서버 사이드에서 미리 로드한 번역 데이터를 전달하여
     * 첫 로딩 시 missing key 문제를 방지합니다.
     * 
     * Pass pre-loaded translation data from server-side to prevent
     * missing key issues on first load.
     * 
     * @example
     * ```ts
     * // layout.tsx (Server Component)
     * export default async function RootLayout({ children }) {
     *   const initialTranslations = await loadSSRTranslations();
     *   
     *   return (
     *     <HuaProvider config={{ i18n: { initialTranslations } }}>
     *       {children}
     *     </HuaProvider>
     *   );
     * }
     * ```
     */
    initialTranslations?: Record<string, Record<string, Record<string, string>>>;

    /**
     * Custom language store / 커스텀 언어 스토어
     *
     * createI18nStore 대신 기존 Zustand 스토어(예: useAppStore)를 i18n과 연동할 때 사용.
     * 스토어에 getState().language, getState().setLanguage, subscribe 가 있어야 함.
     *
     * Use an existing Zustand store (e.g. useAppStore) for i18n instead of createI18nStore.
     * Store must have getState().language, getState().setLanguage, subscribe.
     */
    languageStore?: unknown;

    /**
     * Zustand persist storage key / Zustand persist 스토리지 키
     *
     * languageStore 사용 시, 해당 스토어의 persist 스토리지 키를 지정합니다.
     * 하이드레이션 완료 감지에 사용됩니다.
     *
     * When using languageStore, specify the persist storage key of that store.
     * Used for rehydration completion detection.
     *
     * @default 'hua-i18n-storage'
     *
     * @example
     * ```ts
     * // useAppStore의 persist 키가 'my-app-app-storage'인 경우
     * export default defineConfig({
     *   i18n: {
     *     languageStore: useAppStore,
     *     storageKey: 'my-app-app-storage',  // useAppStore의 persist name과 일치
     *   },
     * });
     * ```
     */
    storageKey?: string;
  };

  /**
   * Motion configuration / 모션/애니메이션 설정
   * 
   * Animation and motion settings.
   * 애니메이션 및 모션 설정입니다.
   */
  motion?: {
    /**
     * Motion style (바이브 코더용) / 모션 스타일 (바이브 코더용)
     * 
     * 명사 중심의 비즈니스 의도 표현
     * Noun-centered business intent expression
     * 
     * - 'smooth': 부드러운 전환 / Smooth transitions
     * - 'dramatic': 드라마틱한 전환 / Dramatic transitions
     * - 'minimal': 최소한의 전환 / Minimal transitions
     * 
     * @example
     * ```ts
     * motion: {
     *   style: 'smooth',  // 바이브 코더가 이해하기 쉬움
     * }
     * ```
     */
    style?: 'smooth' | 'dramatic' | 'minimal';
    
    /**
     * Default motion preset (개발자용) / 기본 모션 프리셋 (개발자용)
     * 
     * - 'product': 빠른 전환, 최소 딜레이 / Fast transitions, minimal delay
     * - 'marketing': 느린 전환, 긴 딜레이 / Slow transitions, long delay
     * 
     * @note `style`이 설정되면 자동으로 매핑됩니다.
     * @note Automatically mapped when `style` is set.
     */
    defaultPreset?: 'product' | 'marketing';
    
    /**
     * Enable animations globally / 전역 애니메이션 활성화 여부
     * 
     * false로 설정하면 모든 애니메이션 비활성화 / Set to false to disable all animations
     */
    enableAnimations?: boolean;
    
    /**
     * Animation duration in milliseconds (개발자용) / 애니메이션 지속 시간 (밀리초, 개발자용)
     */
    duration?: number;
    
    /**
     * Animation easing function (개발자용) / 애니메이션 이징 함수 (개발자용)
     */
    easing?: string;
  };

  /**
   * State management configuration
   */
  state?: {
    persist?: boolean;
    ssr?: boolean;
  };

  /**
   * File structure configuration
   */
  fileStructure?: {
    enforce?: boolean;
  };

  /**
   * Plugins / 플러그인
   * 
   * 프레임워크에 등록할 플러그인 목록
   * List of plugins to register with the framework
   * 
   * **플러그인 타입**:
   * - 기능 플러그인: 고급 기능 추가 (예: motion-pro, i18n-pro)
   * - 프리셋 플러그인: 새로운 프리셋 추가 (예: ecommerce, dashboard)
   * - 브랜딩 플러그인: 화이트 라벨링 지원
   * 
   * **Plugin types**:
   * - Feature plugins: Add advanced features (e.g., motion-pro, i18n-pro)
   * - Preset plugins: Add new presets (e.g., ecommerce, dashboard)
   * - Branding plugins: White labeling support
   * 
   * @example
   * ```ts
   * import { defineConfig } from '@hua-labs/hua/framework';
   * import { motionProPlugin } from '@hua-labs/motion-core/pro';
   * 
   * export default defineConfig({
   *   preset: 'product',
   *   plugins: [motionProPlugin],
   * });
   * ```
   */
  plugins?: import('../plugins/types').HuaPlugin[];

  /**
   * License configuration / 라이선스 설정
   * 
   * Pro/Enterprise 기능을 사용하기 위한 라이선스 설정입니다.
   * License settings for Pro/Enterprise features.
   * 
   * **로드 순서**:
   * 1. 환경 변수 (`HUA_LICENSE_KEY`)
   * 2. 설정 파일 (`license.apiKey` 또는 `license.type`)
   * 3. 기본값 (Free)
   * 
   * **Load order**:
   * 1. Environment variable (`HUA_LICENSE_KEY`)
   * 2. Config file (`license.apiKey` or `license.type`)
   * 3. Default (Free)
   * 
   * @example
   * ```ts
   * // 환경 변수 사용 (권장)
   * // HUA_LICENSE_KEY=pro_xxx pnpm dev
   * 
   * // 또는 설정 파일에서
   * export default defineConfig({
   *   license: {
   *     apiKey: 'pro_xxx',  // 실제 API 키
   *   },
   * });
   * ```
   * 
   * @example
   * ```ts
   * // 개발용 (타입만 지정)
   * export default defineConfig({
   *   license: {
   *     type: 'pro',  // 개발 환경에서만 사용
   *   },
   * });
   * ```
   */
  license?: {
    /**
     * API 키 / API key
     * 
     * Pro/Enterprise 라이선스의 API 키
     * API key for Pro/Enterprise license
     */
    apiKey?: string;
    
    /**
     * 라이선스 타입 (개발용) / License type (for development)
     * 
     * 개발 환경에서만 사용하세요. 프로덕션에서는 `apiKey`를 사용하세요.
     * Use only in development. Use `apiKey` in production.
     */
    type?: 'free' | 'pro' | 'enterprise';
  };

  /**
   * Icon configuration / 아이콘 설정
   *
   * 전역 아이콘 설정을 정의합니다. IconProvider를 통해 자동 적용됩니다.
   * Define global icon settings. Automatically applied via IconProvider.
   *
   * @example
   * ```ts
   * export default defineConfig({
   *   preset: 'product',
   *   icons: {
   *     set: 'phosphor',
   *     weight: 'regular',
   *     size: 20,
   *   },
   * });
   * ```
   */
  icons?: {
    /**
     * Icon set / 아이콘 세트
     *
     * - 'phosphor': Phosphor Icons (기본값, 6가지 weight 지원)
     * - 'lucide': Lucide Icons (심플하고 일관된 스타일)
     * - 'iconsax': Iconsax Icons (requires '@hua-labs/ui/iconsax' import)
     */
    set?: 'phosphor' | 'lucide' | 'iconsax';

    /**
     * Phosphor icon weight / Phosphor 아이콘 두께
     *
     * Phosphor 아이콘 세트 사용 시 적용됩니다.
     * Applied when using Phosphor icon set.
     *
     * - 'thin': 얇은 선
     * - 'light': 가벼운 선
     * - 'regular': 기본 (기본값)
     * - 'bold': 굵은 선
     * - 'duotone': 두 가지 톤
     * - 'fill': 채우기
     */
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'duotone' | 'fill';

    /**
     * Default icon size / 기본 아이콘 크기
     *
     * 픽셀 단위의 기본 아이콘 크기입니다.
     * Default icon size in pixels.
     *
     * @default 20
     */
    size?: number;

    /**
     * Default icon color / 기본 아이콘 색상
     *
     * CSS 색상 값 또는 'currentColor'를 사용할 수 있습니다.
     * Can use CSS color value or 'currentColor'.
     *
     * @default 'currentColor'
     */
    color?: string;

    /**
     * Stroke width (Lucide only) / 선 두께 (Lucide 전용)
     *
     * Lucide 아이콘 세트 사용 시 적용됩니다.
     * Applied when using Lucide icon set.
     *
     * @default 1.25
     */
    strokeWidth?: number;
  };

  /**
   * Toast configuration / 토스트 알림 설정
   *
   * 전역 Toast Provider 설정입니다.
   * Global Toast Provider settings.
   *
   * @example
   * ```ts
   * export default defineConfig({
   *   preset: 'product',
   *   toast: {
   *     position: 'bottom-center',
   *     maxToasts: 3,
   *   },
   * });
   * ```
   */
  toast?: {
    /**
     * Toast 표시 위치 / Toast display position
     *
     * @default 'top-right'
     */
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

    /**
     * 최대 표시 Toast 개수 / Maximum number of toasts to display
     *
     * @default 5
     */
    maxToasts?: number;
  };

  /**
   * Branding configuration (White Labeling) / 브랜딩 설정 (화이트 라벨링)
   * 
   * 브랜드 커스터마이징을 위한 설정입니다.
   * Brand customization settings.
   * 
   * 색상, 타이포그래피, 로고 등을 설정하면 모든 컴포넌트에 자동 적용됩니다.
   * Setting colors, typography, logo, etc. automatically applies to all components.
   * 
   * @example
   * ```ts
   * export default defineConfig({
   *   preset: 'product',
   *   branding: {
   *     name: 'My Company',
   *     logo: '/logo.svg',
   *     colors: {
   *       primary: '#3B82F6',
   *       secondary: '#8B5CF6',
   *     },
   *     typography: {
   *       fontFamily: ['Inter', 'sans-serif'],
   *     },
   *   },
   * });
   * ```
   */
  branding?: {
    /**
     * Company/Service name / 회사/서비스 이름
     */
    name?: string;
    
    /**
     * Logo path / 로고 경로
     */
    logo?: string;
    
    /**
     * Color palette / 색상 팔레트
     * 
     * Tailwind 색상 이름 또는 hex 코드를 사용할 수 있습니다.
     * You can use Tailwind color names or hex codes.
     */
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      success?: string;
      warning?: string;
      error?: string;
      info?: string;
    };
    
    /**
     * Typography settings / 타이포그래피 설정
     */
    typography?: {
      /**
       * Font family stack / 폰트 패밀리 스택
       */
      fontFamily?: string[];
      
      /**
       * Font sizes / 폰트 크기
       */
      fontSize?: {
        h1?: string;
        h2?: string;
        h3?: string;
        body?: string;
      };
    };
    
    /**
     * Custom CSS variables / 커스텀 CSS 변수
     * 
     * 추가적인 CSS 변수를 정의할 수 있습니다.
     * You can define additional CSS variables.
     */
    customVariables?: Record<string, string>;
  };
}

/**
 * HuaProvider props
 */
export interface HuaProviderProps {
  children: ReactNode;
  /**
   * Override config (optional, uses hua.config.ts by default)
   */
  config?: Partial<HuaConfig>;
}

/**
 * HuaPage props
 */
export interface HuaPageProps {
  children: ReactNode;
  
  /**
   * 페이지 제목 / Page title
   * 
   * SEO 메타데이터에 사용됩니다.
   * Used for SEO metadata.
   */
  title?: string;
  
  /**
   * 페이지 설명 / Page description
   * 
   * SEO 메타데이터에 사용됩니다.
   * Used for SEO metadata.
   */
  description?: string;
  
  /**
   * 페이지 감도 / Page vibe
   * 
   * AI가 페이지의 스타일을 결정하는 핵심 키워드입니다.
   * Core keyword for AI to determine page style.
   * 
   * - 'clean': 여백 중심, 미니멀한 인터랙션 / Spacing-focused, minimal interactions
   * - 'fancy': 화려한 인터랙션, 드라마틱한 모션 / Rich interactions, dramatic motion
   * - 'minimal': 최소한의 모션, 빠른 전환 / Minimal motion, fast transitions
   * 
   * @vibe AI가 페이지의 감도를 결정하는 핵심 키워드
   * 
   * @example
   * ```tsx
   * <HuaPage vibe="clean">
   *   <div>여백 중심의 깔끔한 페이지</div>
   * </HuaPage>
   * ```
   */
  vibe?: 'clean' | 'fancy' | 'minimal';
  
  /**
   * i18n 네임스페이스 키 / i18n namespace key
   * 
   * 번역 파일의 네임스페이스를 지정합니다.
   * 설정하면 해당 네임스페이스가 자동으로 로드되고,
   * `title`과 `description`을 번역 키로 사용할 수 있습니다.
   * 
   * Specifies the translation namespace.
   * If specified, the namespace is automatically loaded,
   * and `title` and `description` can be used as translation keys.
   * 
   * **자동 번역 키 형식 / Auto translation key format**:
   * - `title` → `${i18nKey}:title` 또는 `${i18nKey}.title`
   * - `description` → `${i18nKey}:description` 또는 `${i18nKey}.description`
   * 
   * @example
   * ```tsx
   * // translations/ko/home.json
   * {
   *   "title": "홈",
   *   "description": "환영합니다"
   * }
   * 
   * // app/page.tsx
   * <HuaPage i18nKey="home" title="home:title" description="home:description">
   *   <div>translations/ko/home.json, translations/en/home.json 사용</div>
   * </HuaPage>
   * ```
   */
  i18nKey?: string;
  
  /**
   * 페이지 전환 애니메이션 활성화 / Enable page transition animations
   * 
   * 기본값: true (설정에서 motion.enableAnimations가 true인 경우)
   * Default: true (when motion.enableAnimations is true in config)
   */
  enableMotion?: boolean;

  /**
   * 모션 타입 / Motion type
   * 
   * 페이지 진입 시 사용할 모션 애니메이션 타입을 지정합니다.
   * 지정하지 않으면 `vibe`에 따라 자동 선택됩니다.
   * 
   * Specifies the motion animation type to use when the page enters.
   * If not specified, automatically selected based on `vibe`.
   * 
   * - 'fadeIn': 페이드 인 (기본값) / Fade in (default)
   * - 'slideUp': 아래에서 위로 슬라이드 / Slide up from bottom
   * - 'slideLeft': 오른쪽에서 왼쪽으로 슬라이드 / Slide from right to left
   * - 'slideRight': 왼쪽에서 오른쪽으로 슬라이드 / Slide from left to right
   * - 'scaleIn': 크기 확대 / Scale in
   * - 'bounceIn': 바운스 효과 / Bounce in
   * 
   * @example
   * ```tsx
   * <HuaPage motion="slideUp" vibe="fancy">
   *   <div>아래에서 위로 슬라이드되며 나타납니다</div>
   * </HuaPage>
   * ```
   */
  motion?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn';

  /**
   * SEO 메타데이터 설정 / SEO metadata settings
   * 
   * Next.js App Router에서는 page.tsx에서 `export const metadata`를 사용하는 것이 권장됩니다.
   * 이 prop은 문서화 및 타입 안전성을 위한 것입니다.
   * 
   * In Next.js App Router, using `export const metadata` in page.tsx is recommended.
   * This prop is for documentation and type safety.
   * 
   * @example
   * ```tsx
   * // page.tsx
   * import { generatePageMetadata } from '@hua-labs/hua/framework';
   * 
   * export const metadata = generatePageMetadata({
   *   title: '홈',
   *   description: '환영합니다',
   *   seo: {
   *     keywords: ['키워드1', '키워드2'],
   *     ogImage: '/og-image.png',
   *   },
   * });
   * 
   * export default function HomePage() {
   *   return <HuaPage title="홈" seo={{ keywords: ['키워드1'] }}>...</HuaPage>;
   * }
   * ```
   */
  seo?: {
    /**
     * 검색 엔진 키워드 / Search engine keywords
     */
    keywords?: string[];
    
    /**
     * Open Graph 이미지 / Open Graph image
     */
    ogImage?: string;
    
    /**
     * Open Graph 제목 / Open Graph title
     * 
     * 지정하지 않으면 `title` prop 사용
     * If not specified, uses `title` prop
     */
    ogTitle?: string;
    
    /**
     * Open Graph 설명 / Open Graph description
     * 
     * 지정하지 않으면 `description` prop 사용
     * If not specified, uses `description` prop
     */
    ogDescription?: string;
    
    /**
     * Open Graph 타입 / Open Graph type
     */
    ogType?: 'website' | 'article' | 'product';
  };

  /**
   * ErrorBoundary 활성화 여부 / Enable ErrorBoundary
   * 
   * 기본값: true
   * Default: true
   */
  enableErrorBoundary?: boolean;

  /**
   * ErrorBoundary fallback UI / ErrorBoundary fallback UI
   * 
   * 에러 발생 시 표시할 커스텀 fallback UI
   * Custom fallback UI to display when an error occurs
   */
  errorBoundaryFallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
}
