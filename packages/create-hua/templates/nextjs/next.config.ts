import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * 
 * hua 프레임워크는 기본 설정으로 동작합니다.
 * 필요시 여기에 Next.js 설정을 추가할 수 있습니다.
 * 
 * hua framework works with default settings.
 * You can add Next.js configuration here if needed.
 * 
 * @example
 * ```ts
 * const nextConfig: NextConfig = {
 *   images: {
 *     domains: ['example.com'],
 *   },
 *   redirects: async () => {
 *     return [
 *       { source: '/old', destination: '/new', permanent: true },
 *     ];
 *   },
 * };
 * ```
 */
const nextConfig: NextConfig = {
  // hua 프레임워크는 추가 설정이 필요 없지만,
  // 필요시 여기에 Next.js 설정을 추가할 수 있습니다.
  // 예: images, redirects, rewrites, headers 등
  // 
  // hua framework doesn't require additional configuration,
  // but you can add Next.js settings here if needed.
  // Examples: images, redirects, rewrites, headers, etc.
};

export default nextConfig;
