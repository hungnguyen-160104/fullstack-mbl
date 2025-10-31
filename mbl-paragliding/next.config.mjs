// mbl-paragliding/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  // Backend đã gộp trong Next → không cần rewrites / proxy
};

export default nextConfig;
