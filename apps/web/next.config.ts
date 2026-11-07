import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@jobwhistle/config', '@jobwhistle/contracts'],
};

export default nextConfig;
