/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hua-labs/ui', '@hua-labs/i18n-sdk'],
  typescript: {
    ignoreBuildErrors: true,
  },
  // 하이드레이션 문제 해결을 위한 설정
  experimental: {
    // 서버 컴포넌트에서 클라이언트 컴포넌트로의 전환 최적화
    optimizePackageImports: ['@hua-labs/ui'],
  },
  // 정적 최적화 설정
  swcMinify: true,
  // 이미지 최적화 설정
  images: {
    domains: [],
    unoptimized: false,
  },
}

module.exports = nextConfig 