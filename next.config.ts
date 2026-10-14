import type { NextConfig } from "next";
const config: NextConfig = {
  // Real eBay searches require the existing Hostinger Node.js deployment.
  serverExternalPackages: ["mysql2"],
  outputFileTracingRoot: process.cwd(),
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default config;
