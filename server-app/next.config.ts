import type { NextConfig } from "next";
import { resolve } from "node:path";
const config: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: resolve(process.cwd()),
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  serverExternalPackages: ["mysql2"],
};
export default config;
