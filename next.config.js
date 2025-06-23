/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['cdn.jsdelivr.net', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;
