/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Avoid symlinks which can cause issues on Windows
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-win32-x64-msvc',
      'node_modules/@esbuild/win32-x64',
      'node_modules/webpack',
    ],
  },
  // Optimize build output
  poweredByHeader: false,
  // Avoid issues with Windows paths
  webpack: (config, { isServer }) => {
    // Fix for Windows path issues
    config.resolve.symlinks = false;

    // Optimize chunk loading
    if (!isServer) {
      // Increase chunk size threshold to reduce the number of chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            enforce: true,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
  images: {
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
  // Redirecciones para unificar rutas
  async redirects() {
    return [
      // Redirecciones de rutas antiguas a las nuevas unificadas
      {
        source: '/habit-dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/habit-onboarding',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/habit-calendar',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/habit-community',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/add-habit',
        destination: '/wellness/new-activity',
        permanent: true,
      },
      {
        source: '/routinize',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/workout/:path*',
        destination: '/training/:path*',
        permanent: true,
      },
      {
        source: '/ejercicios/:path*',
        destination: '/training/exercises/:path*',
        permanent: true,
      },
      {
        source: '/rutinas/:path*',
        destination: '/training/routines/:path*',
        permanent: true,
      },
      {
        source: '/nutricion/:path*',
        destination: '/nutrition/:path*',
        permanent: true,
      },
      {
        source: '/settings/:path*',
        destination: '/profile/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
