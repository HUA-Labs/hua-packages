import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16: Turbopack is the default bundler.
  // Empty object silences the webpack→turbopack migration warning.
  turbopack: {},

  // 외부 이미지 사용 시 호스트를 등록하세요 / Register external image hosts
  // images: {
  //   remotePatterns: [
  //     { hostname: "images.unsplash.com" },
  //     { hostname: "your-cdn.example.com" },
  //   ],
  // },
};

export default nextConfig;
