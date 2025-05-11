/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')(
  './src/i18n/server.ts'
);

const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // Skips ESLint checks during build
  },
  experimental: {
    typedRoutes: true,
  },
  images: {
    unoptimized: true, // Allow unoptimized images
    dangerouslyAllowSVG: true, // Allow SVG images
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bookingengine.onrender.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "bookingengine.onrender.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
