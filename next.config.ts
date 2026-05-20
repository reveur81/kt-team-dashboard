import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  env: {
    BUILD_TIMESTAMP: new Date().toISOString(),
  },
};

export default nextConfig;
