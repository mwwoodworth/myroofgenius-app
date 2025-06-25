/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['cdn.jsdelivr.net', 'images.unsplash.com'],
  },
  async redirects() {
    return [
      {
        source: '/tools',
        destination: '/estimator',
        permanent: false,
      },
      {
        source: '/marketplace',
        destination: '/',
        permanent: false,
      },
    ]
  },
};
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = process.env.SENTRY_DSN ? withSentryConfig(nextConfig, { silent: true }) : nextConfig;
