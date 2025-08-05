/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 13+ 에서는 app 디렉토리가 기본으로 활성화됨
  typescript: {
    // !! WARN !!
    // TypeScript 체크를 비활성화 (개발 중에만 사용)
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 