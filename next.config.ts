import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  /* The dev-tools indicator floating in the corner collides with the
     platform's own chrome — QA screenshots and the design stay clean. */
  devIndicators: false,
};

export default nextConfig;
