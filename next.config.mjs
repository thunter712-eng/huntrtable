/**
 * Static export so the app can be hosted on GitHub Pages (or any static host).
 *
 * On GitHub Pages the site lives under a sub-path (/huntrtable/), so the deploy
 * workflow sets NEXT_PUBLIC_BASE_PATH=/huntrtable. Locally it's unset, so the
 * app builds/serves from the root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
