/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@hua-labs/ui', '@hua-labs/i18n-sdk'],
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 