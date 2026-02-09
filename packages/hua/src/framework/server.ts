/**
 * @hua-labs/hua/framework/server
 *
 * 서버 전용 유틸리티 (Server-only utilities)
 * 이 모듈의 함수들은 서버 컴포넌트나 API 라우트에서만 사용할 수 있습니다.
 */

// Shared re-export (types + pure functions)
export * from './shared';

export { getSSRTranslations } from './utils/ssr-translations';

// Config - 서버 전용 (fs 사용)
export { loadConfig } from './config/server';
