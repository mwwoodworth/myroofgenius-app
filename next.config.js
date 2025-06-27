/** @type {import('next').NextConfig} */
let withBundleAnalyzer = (c) => c;
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true'
  });
} catch (e) {
  console.warn('Bundle analyzer not installed');
}
const { withSentryConfig } = require('@sentry/nextjs');

const baseConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  images: { domains: ['cdn.jsdelivr.net', 'images.unsplash.com'] },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    removeDebugger: process.env.NODE_ENV === 'production'
  },
  async redirects() {
    return [
      { source: '/tools', destination: '/estimator', permanent: false },
      { source: '/marketplace', destination: '/', permanent: false }
    ];
  }
};

const config = process.env.SENTRY_DSN ? withSentryConfig(baseConfig, { silent: true }) : baseConfig;
module.exports = withBundleAnalyzer(config);
