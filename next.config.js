/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  appDir: true,
  webpack(config) {
    config.resolve.alias['#components'] = path.join(__dirname, 'components');
    config.resolve.alias['#data'] = path.join(__dirname, 'data');
    config.resolve.alias['#theme'] = path.join(__dirname, 'theme');
    return config;
  },
};

module.exports = nextConfig;
