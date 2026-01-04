/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fluxoclean.com.br',
      },
      {
        protocol: 'https',
        hostname: 'api.local.fluxoclean.com.br',
      },
      {
        protocol: 'https',
        hostname: 'api-smart-store.local.fluxoclean.com.br',
      },
    ],
  },
  env: {
    API_URL:
      process.env.API_URL || 'https://api-smart-store.fluxoclean.com.br/api',
  },
};

module.exports = nextConfig;
