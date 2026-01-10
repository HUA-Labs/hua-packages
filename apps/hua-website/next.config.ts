import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace 패키지 transpile 설정
  transpilePackages: [
    "@hua-labs/ui",
    "@hua-labs/motion-core",
    "@hua-labs/i18n-core",
    "@hua-labs/i18n-core-zustand",
    "@hua-labs/hua-ux",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
