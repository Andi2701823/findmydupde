import type { NextConfig } from "next";
const config: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  serverExternalPackages: ["mysql2"],
};
export default config;
