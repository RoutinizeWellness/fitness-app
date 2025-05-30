/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'www.inspireusafoundation.org',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
    ],
  },
  // ✅ WINDOWS: Fix OneDrive symlink issues
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-win32-x64-msvc',
      'node_modules/@esbuild/win32-x64',
      'node_modules/webpack',
      '.next/**/*',
    ],
  },
  // ✅ PERFORMANCE: Enhanced compilation optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // ✅ PERFORMANCE: Optimize webpack for faster builds
  webpack: (config, { dev, isServer }) => {
    // ✅ WINDOWS: Fix symlink and OneDrive path issues
    config.resolve.symlinks = false;
    config.resolve.cacheWithContext = false;

    // ✅ WINDOWS: Avoid issues with Windows paths and OneDrive
    if (process.platform === 'win32') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.next', '**/OneDrive/**/.next'],
      };
    }

    // Optimize for development speed
    if (dev) {
      // Reduce bundle analysis overhead
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;

      // Faster source maps for development
      config.devtool = 'eval-cheap-module-source-map';

      // ✅ WINDOWS: Optimized snapshot configuration for OneDrive
      config.snapshot = {
        managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!(@supabase|framer-motion))/],
        buildDependencies: {
          hash: true,
          timestamp: false, // Disable timestamp for OneDrive compatibility
        },
        module: {
          timestamp: false, // Disable timestamp for OneDrive compatibility
        },
        resolve: {
          timestamp: false, // Disable timestamp for OneDrive compatibility
        },
      };
    }

    // Exclude heavy dependencies from server bundle
    if (isServer) {
      config.externals = [...(config.externals || []), 'framer-motion'];
    }

    return config;
  },
  // ✅ PERFORMANCE: Experimental features for faster builds
  experimental: {
    // Enable SWC for faster compilation
    swcTraceProfiling: false,
    // Optimize CSS imports
    optimizeCss: true,
    // Faster refresh
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    // ✅ WINDOWS: Disable features that can cause symlink issues
    esmExternals: 'loose',
  },
}

export default nextConfig
