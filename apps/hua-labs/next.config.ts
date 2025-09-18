import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // 동적 import 경고만 무시 (SDK 특정 경고)
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
    ];
    return config;
  },
};

export default nextConfig;
