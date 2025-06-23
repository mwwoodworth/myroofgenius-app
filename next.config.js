/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
    eslint: {
    // Allow production builds to succeed even if there are lint errors.
    ignoreDuringBuilds: true,
  }
module.exports = nextConfig;
