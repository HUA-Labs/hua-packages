/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hua-labs/ui', '@hua-labs/i18n-sdk'],
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // 하이드레이션 문제 해결을 위한 설정
  experimental: {
    // 서버 컴포넌트에서 클라이언트 컴포넌트로의 전환 최적화
    optimizePackageImports: ['@hua-labs/ui'],
  },
  // 이미지 최적화 설정
  images: {
    domains: [],
    unoptimized: false,
  },
  // React 19 호환성을 위한 webpack 설정
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    // React57을 React로 매핑
    config.resolve.alias = {
      ...config.resolve.alias,
      'React57': 'react',
    }
    return config
  },
}

module.exports = nextConfig 