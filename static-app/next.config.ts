import type { NextConfig } from "next";
import { resolve } from "node:path";
const config: NextConfig = {
  output: "export",
  outputFileTracingRoot: resolve(process.cwd()),
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default config;
