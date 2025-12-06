/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 13+ 에서는 app 디렉토리가 기본으로 활성화됨
  transpilePackages: ['@hua-labs/ui'],
  // typescript: {
  //   // !! WARN !!
  //   // TypeScript 체크를 비활성화 (개발 중에만 사용)
  //   ignoreBuildErrors: true,
  // },
  // React 19 호환성을 위한 webpack 설정
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig 