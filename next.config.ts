import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './image-loader.ts',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
