import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Parent folder may contain another lockfile; trace files from this app root only.
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
