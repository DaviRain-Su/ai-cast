import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  // 解决 monorepo 多 lockfile 警告
  outputFileTracingRoot: resolve(__dirname),
};

export default nextConfig;
